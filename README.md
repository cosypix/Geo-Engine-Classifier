# 🌲 Campus Forest Classification using Satellite Imagery

A machine learning-based land cover classification project that identifies **Forest** and **Non-Forest** regions on a university campus using Sentinel-2 satellite imagery and Google Earth Engine.

![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python)
![Earth Engine](https://img.shields.io/badge/Google%20Earth%20Engine-API-green?logo=google)

---

## 📍 Study Area

University campus region defined using a custom polygon boundary (centered at approximately 80.02°E, 23.17°N).

---

## 🛰️ Data Source

- **Satellite:** Sentinel-2 Surface Reflectance (`COPERNICUS/S2_SR_HARMONIZED`)
- **Date Range:** November 2025 - January 2026
- **Cloud Filter:** < 30% cloudy pixel percentage

---

## 🧹 Preprocessing

- Cloud masking using QA60 band
- Median composite generation
- NDVI calculation: `(B8 - B4) / (B8 + B4)`

---

## 🤖 Classification Models

Three classifiers trained on manually digitized points:
- **Random Forest** - `ee.Classifier.smileRandomForest(150)`
- **SVM** - `ee.Classifier.libsvm()`
- **XGBoost** - `ee.Classifier.smileGradientTreeBoost(10)`

**Labels:**
- Forest = 1
- Non-Forest = 0

---

## 📊 Model Comparison

All models trained with **70/30 train-test split**.

| Model | Algorithm | Accuracy | Kappa | Confusion Matrix |
|-------|-----------|----------|-------|------------------|
| **Random Forest** | `smileRandomForest(150)` | **100%** | 1.0 | [[15, 0], [0, 22]] |
| **SVM** | `libsvm` | **100%** | 1.0 | [[21, 0], [0, 15]] |
| **XGBoost** | `smileGradientTreeBoost(10)` | **96.875%** | 0.9375 | [[16, 1], [0, 15]] |

> **Confusion Matrix Format:** `[[TN, FP], [FN, TP]]`

---

## � Project Structure

```
├── notebooks/
│   ├── random_forest/
│   │   └── forest_classification.ipynb
│   ├── svm/
│   │   └── forest_classification.ipynb
│   └── xg_boost/
│       └── forest_classification.ipynb
├── scripts/
│   └── classify_forest.py
├── .env
├── .gitignore
├── requirements.txt
└── README.md
```

---

## ⚙️ Installation

### Prerequisites
- Python 3.10+
- Google Earth Engine account

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Create virtual environment & install dependencies**
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Authenticate Earth Engine**
   ```bash
   earthengine authenticate
   ```

4. **Configure environment**
   
   Create a `.env` file:
   ```env
   EE_PROJECT_ID=your-earth-engine-project-id
   ```

---

## 🚀 Usage

### Run Notebooks
```bash
jupyter notebook
```
Open any notebook in `notebooks/` directory and run all cells.

### Run Script
```bash
python scripts/classify_forest.py
```

---

## 🗺️ Output

Binary classification map:
- 🌲 **Dark Green** = Forest
- ⬜ **Light Gray** = Non-Forest

---

<p align="center">
  Made with ❤️ using Google Earth Engine
</p>
