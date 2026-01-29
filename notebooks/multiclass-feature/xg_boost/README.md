# XGBoost Multiclass Classification 🚀

Gradient Boosted Trees classifier for 8-class land cover classification.

## Model Details

- **Classifier**: `ee.Classifier.smileGradientTreeBoost()`
- **Trees**: 100 boosted trees
- **Classes**: 8 land cover types

## Features

Uses spectral bands and indices:
- B4, B8, B3, B11 (Sentinel-2 bands)
- NDVI, NDWI, NDBI (Normalized indices)

## Usage

```python
jupyter notebook multiclass_classification.ipynb
```

## Expected Output

- 8x8 confusion matrix
- Overall accuracy and Kappa coefficient
- Color-coded classification map
