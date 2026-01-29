# SVM Multiclass Classification 🎯

Support Vector Machine (SVM) classifier for 8-class land cover classification.

## Model Details

- **Classifier**: `ee.Classifier.libsvm()`
- **Kernel**: RBF (Radial Basis Function)
- **Classes**: 8 land cover types

## Features

Uses spectral bands and indices:
- B4, B8, B3, B11 (Sentinel-2 bands)
- NDVI, NDWI, NDBI (Normalized indices)

## Usage

```python
# Run the notebook
jupyter notebook multiclass_classification.ipynb
```

## Expected Output

- Confusion matrix with 8x8 dimensions
- Overall accuracy and Kappa coefficient
- Color-coded classification map

## Color Palette

```
Deep Water → Blue
Wetland → Light Blue
Dense Forest → Dark Green
Mixed Forest → Forest Green
Grassland → Light Green
Buildings → Red
Roads → Gray
Bare Soil → Tan
```
