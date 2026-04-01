"""
Shared training pipeline for Geo-Engine-Classifier.

Centralises campus geometry, training points, satellite imagery compositing,
cloud masking, sampling/splitting, and classifier construction so that every
notebook uses the same canonical configuration.
"""

import os
from dotenv import load_dotenv
import ee

# ── Constants ────────────────────────────────────────────────────────────────

CAMPUS_GEOJSON = {
    "type": "Polygon",
    "coordinates": [
        [
            [80.01710357666015, 23.173962177472703],
            [80.03259601593017, 23.165361215115187],
            [80.03654422760009, 23.172502420044232],
            [80.026802444458, 23.181694681000845],
            [80.01542987823485, 23.176960548201308],
        ]
    ],
}

BANDS = ["B4", "B8", "NDVI"]

SEED = 42

# Earth Engine asset IDs for the training points
FOREST_POINTS_ASSET = "users/ashutoshsaxena703/forest_points_train"
NON_FOREST_POINTS_ASSET = "users/ashutoshsaxena703/non_forest_points_train"

# Canonical hyperparameters (from the best-model notebooks in nb/rf, nb/svm, nb/xgb)
CLASSIFIER_CONFIGS = {
    "rf": {"numberOfTrees": 10, "minLeafPopulation": 3, "bagFraction": 0.7},
    "svm": {"kernelType": "RBF", "gamma": 1,"cost": 1},
    "xgb": {"numberOfTrees": 100 "shrinkage": 0.1, "maxNodes": 5},
}

# Human-readable names for display purposes
CLASSIFIER_DISPLAY_NAMES = {
    "rf": "Random Forest",
    "svm": "SVM (RBF)",
    "xgb": "Gradient Boosted Trees",
}


# ── Earth Engine initialisation ──────────────────────────────────────────────

def init_ee():
    """Initialize Earth Engine using EE_PROJECT_ID from the .env file."""
    load_dotenv()
    ee_project = os.getenv("EE_PROJECT_ID")
    if not ee_project:
        raise ValueError("EE_PROJECT_ID not set in .env file")
    ee.Initialize(project=ee_project)
    print("Earth Engine initialized successfully.")


# ── Geometry ─────────────────────────────────────────────────────────────────

def get_campus_geometry():
    """Return the campus boundary as an ee.Geometry."""
    return ee.Geometry(CAMPUS_GEOJSON)


# ── Cloud masking ────────────────────────────────────────────────────────────

def mask_s2_clouds(image):
    """Apply Sentinel-2 QA60 cloud/cirrus mask and scale to reflectance."""
    qa = image.select("QA60")
    cloud = 1 << 10
    cirrus = 1 << 11
    mask = qa.bitwiseAnd(cloud).eq(0).And(qa.bitwiseAnd(cirrus).eq(0))
    return image.updateMask(mask).divide(10000)


# ── Image compositing ────────────────────────────────────────────────────────

def build_image(roi, start_date, end_date, cloud_cover=5):
    """
    Build a cloud-masked Sentinel-2 median composite clipped to *roi*,
    with an NDVI band appended.

    Parameters
    ----------
    roi : ee.Geometry
        Region of interest to clip to.
    start_date, end_date : str
        Date range in 'YYYY-MM-DD' format.
    cloud_cover : int
        Maximum CLOUDY_PIXEL_PERCENTAGE threshold.

    Returns
    -------
    ee.Image
        Median composite with NDVI band.
    """
    dataset = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterDate(start_date, end_date)
        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", cloud_cover))
        .map(mask_s2_clouds)
    )

    image = dataset.median().clip(roi)

    ndvi = image.normalizedDifference(["B8", "B4"]).rename("NDVI")
    image = image.addBands(ndvi)

    return image


# ── Training points ──────────────────────────────────────────────────────────

def load_training_points():
    """
    Load and merge forest / non-forest training point FeatureCollections.

    Returns
    -------
    tuple[ee.FeatureCollection, ee.FeatureCollection, ee.FeatureCollection]
        (forest_points, non_forest_points, merged_points)
    """
    forest_points = ee.FeatureCollection(FOREST_POINTS_ASSET)
    non_forest_points = ee.FeatureCollection(NON_FOREST_POINTS_ASSET)
    training_points = forest_points.merge(non_forest_points)
    return forest_points, non_forest_points, training_points


# ── Sampling & splitting ─────────────────────────────────────────────────────

def sample_and_split(image, training_points, bands=None, seed=None, split=0.7):
    """
    Sample *image* at *training_points* and split into train/test sets.

    Parameters
    ----------
    image : ee.Image
    training_points : ee.FeatureCollection
    bands : list[str] | None
        Defaults to BANDS.
    seed : int | None
        Defaults to SEED.
    split : float
        Fraction for the training set (default 0.7).

    Returns
    -------
    tuple[ee.FeatureCollection, ee.FeatureCollection]
        (train_set, test_set)
    """
    if bands is None:
        bands = BANDS
    if seed is None:
        seed = SEED

    training = image.select(bands).sampleRegions(
        collection=training_points,
        properties=["label"],
        scale=10,
    )
    training = training.filter(ee.Filter.notNull(bands + ["label"]))
    training = training.randomColumn("random", seed)

    train_set = training.filter(ee.Filter.lt("random", split))
    test_set = training.filter(ee.Filter.gte("random", split))

    return train_set, test_set


# ── Classifier construction ──────────────────────────────────────────────────

def create_classifier(model_type):
    """
    Return an **untrained** ee.Classifier with canonical hyperparameters.

    Parameters
    ----------
    model_type : str
        One of "rf", "svm", "xgb".
    """
    if model_type not in CLASSIFIER_CONFIGS:
        raise ValueError(
            f"Unknown model_type '{model_type}'. "
            f"Choose from {list(CLASSIFIER_CONFIGS.keys())}"
        )

    params = CLASSIFIER_CONFIGS[model_type]

    if model_type == "rf":
        return ee.Classifier.smileRandomForest(**params)
    elif model_type == "svm":
        return ee.Classifier.libsvm(**params)
    elif model_type == "xgb":
        return ee.Classifier.smileGradientTreeBoost(**params)


def get_classifier_factories():
    """
    Return a dict of {display_name: lambda} for use in sweep notebooks
    (cloud cover comparison, seasonal comparison).

    Each lambda returns an **untrained** classifier.
    """
    return {
        CLASSIFIER_DISPLAY_NAMES[key]: (lambda k=key: create_classifier(k))
        for key in CLASSIFIER_CONFIGS
    }


# ── Full training pipeline ───────────────────────────────────────────────────

def train_model(
    model_type,
    start_date="2026-01-01",
    end_date="2026-02-28",
    cloud_cover=5,
    bands=None,
    seed=None,
    split=0.7,
):
    """
    Complete training pipeline: build image → sample → split → train.

    Uses the canonical campus geometry and training points.

    Parameters
    ----------
    model_type : str
        One of "rf", "svm", "xgb".
    start_date, end_date : str
        Date range for the training image composite.
    cloud_cover : int
        CLOUDY_PIXEL_PERCENTAGE threshold.
    bands : list[str] | None
    seed : int | None
    split : float

    Returns
    -------
    tuple[ee.Classifier, ee.FeatureCollection, ee.FeatureCollection]
        (trained_classifier, train_set, test_set)
    """
    if bands is None:
        bands = BANDS
    if seed is None:
        seed = SEED

    campus = get_campus_geometry()
    image = build_image(campus, start_date, end_date, cloud_cover)

    _, _, training_points = load_training_points()
    train_set, test_set = sample_and_split(
        image, training_points, bands=bands, seed=seed, split=split
    )

    classifier = create_classifier(model_type).train(
        features=train_set,
        classProperty="label",
        inputProperties=bands,
    )

    return classifier, train_set, test_set
