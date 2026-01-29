# Multiclass Land Cover Classification 🌍

This folder contains machine learning models for **8-class land cover classification** using Sentinel-2 satellite imagery and Google Earth Engine.

## Classes

| Label | Class Name | Color |
|-------|------------|-------|
| 0 | Deep Water | #0000FF |
| 1 | Wetland/Shallow Water | #00BFFF |
| 2 | Dense Forest | #006400 |
| 3 | Mixed Forest | #228B22 |
| 4 | Grassland | #90EE90 |
| 5 | Buildings | #FF0000 |
| 6 | Roads | #808080 |
| 7 | Bare Soil | #D2B48C |

## Models

| Model | Folder | Description |
|-------|--------|-------------|
| SVM | [svm/](./svm/) | Support Vector Machine classifier |
| Random Forest | [random_forest/](./random_forest/) | Ensemble tree-based classifier |
| XGBoost | [xg_boost/](./xg_boost/) | Gradient boosted trees classifier |

## Features Used

| Feature | Description |
|---------|-------------|
| B4 (Red) | Sentinel-2 Band 4 |
| B8 (NIR) | Sentinel-2 Band 8 |
| B3 (Green) | Sentinel-2 Band 3 |
| B11 (SWIR) | Sentinel-2 Band 11 |
| NDVI | Normalized Difference Vegetation Index |
| NDWI | Normalized Difference Water Index |
| NDBI | Normalized Difference Built-up Index |

## Prerequisites

1. Google Earth Engine account with project ID
2. `.env` file with `EE_PROJECT_ID` variable
3. Training point assets uploaded to GEE for each class

## Training Data Assets

Upload training point shapefiles to your GEE account with these names:
- `users/<username>/deep_water_points`
- `users/<username>/wetland_points`
- `users/<username>/dense_forest_points`
- `users/<username>/mixed_forest_points`
- `users/<username>/grassland_points`
- `users/<username>/buildings_points`
- `users/<username>/roads_points`
- `users/<username>/bare_soil_points`

Each asset should have a `label` property matching the class label (0-7).

## Usage

1. Set up your `.env` file with `EE_PROJECT_ID`
2. Upload training point assets to GEE
3. Open any model's notebook and run all cells
