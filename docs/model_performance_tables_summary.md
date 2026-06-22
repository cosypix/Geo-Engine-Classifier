# Project Geo-Engine-Classifier Performance Tables

## 1. Binary Classification (Campus External Validation)
| Model         |   Accuracy (%) |   Kappa Coefficient |
|:--------------|---------------:|--------------------:|
| XGBoost       |          87.77 |                0.75 |
| SVM           |          84.79 |                0.7  |
| Random Forest |          81.87 |                0.64 |

## 2. Binary Classification (Jabalpur District Validation)
| Model         |   Accuracy (%) |   Kappa Coefficient |
|:--------------|---------------:|--------------------:|
| SVM           |          98.31 |                0.97 |
| XGBoost       |          98.06 |                0.96 |
| Random Forest |          97.75 |                0.96 |

## 3. Multi-Class Classification (Overall Metrics)
| Model         |   Accuracy (%) |   Kappa Coefficient |
|:--------------|---------------:|--------------------:|
| XGBoost       |          93.06 |              0.8917 |
| SVM (RBF)     |          90.74 |              0.8725 |
| Random Forest |          89.81 |              0.8592 |
| CART          |          88.89 |              0.8471 |
| KNN           |          88.89 |              0.8466 |

## 4. Multi-Class Geographical Classification (Class-wise Accuracy)
| Model         |   Forest (%) |   Water (%) |   Buildings (%) |   Soil (%) |
|:--------------|-------------:|------------:|----------------:|-----------:|
| Random Forest |        91.67 |      100    |           95.24 |      81.58 |
| SVM (RBF)     |        91.55 |       96.43 |           93.33 |      86.11 |
| XGBoost       |        95.71 |      100    |           95.56 |      86.11 |
| KNN           |        87.36 |       93.33 |           96    |      90.24 |
| CART          |       100    |       94.2  |           84.06 |      83.64 |

