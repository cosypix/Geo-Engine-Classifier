# Campus Forest vs Non-Forest Classification 🌲

This project performs binary land cover classification (Forest vs Non-Forest) using Sentinel-2 satellite imagery and Google Earth Engine.

## 📍 Study Area
University campus region defined using a custom polygon boundary.

## 🛰 Data Source
Sentinel-2 Surface Reflectance (COPERNICUS/S2_SR_HARMONIZED)

## 🧹 Preprocessing
- Cloud masking using QA60 band
- NDVI calculation

## 🤖 Classification
Random Forest classifier trained on manually digitized points:
- Forest = 1
- Non-Forest = 0

## 📊 Accuracy Assessment
Confusion matrix, overall accuracy, and Kappa coefficient computed using a 70/30 train-test split.

## 🗺 Output
Smoothed binary classification map showing forested regions.

## ⚙ Requirements
Install dependencies:

```bash
pip install -r requirements.txt
```

Authenticate Earth Engine before running:

```bash
earthengine authenticate
```

## 🚀 Run
Open the notebook in Jupyter and run all cells.

```bash
notebooks/forest_classification.ipynb
```
