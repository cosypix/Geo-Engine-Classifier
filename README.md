# Geo-Engine Classifier 🌍

A web-based land cover classification tool using Google Earth Engine and Sentinel-2 satellite imagery.

## 🌟 Features

- **Spectral Index Classification** - Uses NDVI, NDWI, NDBI, EVI, SAVI, BSI, NDRE, and MNDWI
- **8 Land Cover Classes**:
  - 💧 Deep Water (Dark Blue)
  - 🌊 Wetland/Shallow Water (Turquoise)
  - 🌲 Dense Forest (Dark Green)
  - 🌳 Mixed Forest (Forest Green)
  - � Grassland (Yellow Green)
  - 🏢 Buildings (Terracotta)
  - 🛣️ Roads (Dim Gray)
  - 🏜️ Bare Soil (Tan)
- **Interactive Map** - View classification results on a dark-themed Leaflet map
- **Toggle Views** - Switch between Classification and Satellite RGB views
- **Modern UI** - Glassmorphism design with smooth animations

## 📍 Study Area

University campus region (IIIT Jabalpur) defined using a custom polygon boundary.

## 🛰️ Data Source

Sentinel-2 Surface Reflectance (`COPERNICUS/S2_SR_HARMONIZED`)

## 🏗️ Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + Leaflet
- **Backend**: Node.js + Express + TypeScript
- **Satellite Data**: Google Earth Engine API

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Google Cloud account with Earth Engine API enabled

---

## 🔑 Setting Up Earth Engine Credentials

The backend requires a Google Cloud Service Account key (`privatekey.json`) to authenticate with Earth Engine.

> ⚠️ **Important**: The `privatekey.json` file contains sensitive credentials. **Never commit this file to version control.** It is already included in `.gitignore`.

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Enter a project name (e.g., `geo-engine-classifier`) and click **Create**

### Step 2: Enable Earth Engine API

1. In your project, go to **APIs & Services** → **Library**
2. Search for **"Earth Engine API"**
3. Click on it and press **Enable**

### Step 3: Register Your Project with Earth Engine

1. Go to [Earth Engine Code Editor](https://code.earthengine.google.com/)
2. Sign in and accept the terms if prompted
3. Go to **Assets** → **Register a new Cloud project**
4. Enter your Google Cloud project ID and register it

### Step 4: Create a Service Account

1. In Google Cloud Console, go to **IAM & Admin** → **Service Accounts**
2. Click **+ Create Service Account**
3. Enter details:
   - **Name**: `earth-engine-service`
   - **ID**: `earth-engine-service`
4. Click **Create and Continue**
5. Skip the optional permissions step → Click **Done**

### Step 5: Generate the Private Key

1. Click on your newly created service account
2. Go to **Keys** tab → **Add Key** → **Create new key**
3. Select **JSON** format → Click **Create**
4. A JSON file will download automatically

### Step 6: Add Key to Project

1. Rename the downloaded file to `privatekey.json`
2. Move it to the `backend/` directory:
   ```
   Geo-Engine-Classifier/
   └── backend/
       └── privatekey.json  ← Place here
   ```

---

## Docker Setup (Recommended)

Run the entire application with a single command.

### Prerequisites for Docker
- Docker & Docker Compose installed
- `backend/privatekey.json` MUST exist (see steps above)

### Run with Docker

```bash
# 1. Ensure privatekey.json is in backend/
ls backend/privatekey.json

# 2. Build and start containers
docker-compose up --build
```
- Frontend: http://localhost:5173
- Backend: http://localhost:8000

---

## 🖥️ Manual Backend Setup

```bash
cd backend
npm install
npm run dev
```
Server runs at http://localhost:8000

---

## 🌐 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
App runs at http://localhost:5173

---

## 📊 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Health check |
| `GET /api/map-layer` | RGB satellite imagery tiles |
| `GET /api/classify-forest` | Land cover classification tiles + RGB |

---

## 🧹 Classification Method

Uses threshold-based classification on spectral indices:

| Index | Formula | Usage |
|-------|---------|-------|
| **NDVI** | (B8 - B4) / (B8 + B4) | Vegetation health |
| **NDWI** | (B3 - B8) / (B3 + B8) | Water bodies |
| **MNDWI** | (B3 - B11) / (B3 + B11) | Precise water/wetland detection |
| **NDBI** | (B11 - B8) / (B11 + B8) | Built-up areas |
| **EVI** | 2.5 * (NIR-RED) / (NIR + 6*RED - 7.5*BLUE + 1) | Dense vegetation structure |
| **SAVI** | ((NIR-RED) / (NIR+RED+0.5)) * 1.5 | Sparse vegetation (soil adjusted) |
| **NDRE** | (B8 - B5) / (B8 + B5) | Chlorophyll / Forest health |
| **BSI** | ((SWIR+RED)-(NIR+BLUE)) / ((SWIR+RED)+(NIR+BLUE)) | Bare soil differentiation |
| **Brightness** | Mean(B2, B3, B4) | Roads vs Buildings separation |

---

## 📁 Project Structure

```
Geo-Engine-Classifier/
├── backend/
│   ├── src/
│   │   └── index.ts          # Express server + Earth Engine logic
│   ├── privatekey.json       # GCP service account key (create this - NOT in git)
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main React component
│   │   ├── index.css         # Tailwind + custom styles
│   │   └── components/
│   │       └── MapComponent.jsx
│   └── package.json
├── .gitignore
└── README.md
```

---

## 🐛 Troubleshooting

### "Failed to initialize Earth Engine"
- Ensure `privatekey.json` exists in `backend/`
- Verify the service account has Earth Engine access
- Check that the project is registered with Earth Engine

### "Earth Engine memory capacity exceeded"
- This happens with large date ranges or complex operations
- The app uses a single best image to minimize memory usage

### Blank map or no tiles
- Check browser console for CORS errors
- Ensure both frontend (5173) and backend (8000) are running
- Verify Earth Engine API is enabled in Google Cloud
