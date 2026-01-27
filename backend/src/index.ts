import express from 'express';
import cors from 'cors';
import ee from '@google/earthengine';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const PRIVATE_KEY_FILE = './privatekey.json';

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// Initialize Earth Engine
// Authentication requires a Service Account Key if running server-side
// For this demo, we'll try to find a key file or fallback to default credentials
const initEarthEngine = async () => {
    try {
        if (fs.existsSync(PRIVATE_KEY_FILE)) {
            console.log('Found private key file. Authenticating...');
            const privateKey = JSON.parse(fs.readFileSync(PRIVATE_KEY_FILE, 'utf8'));
            await new Promise<void>((resolve, reject) => {
                ee.data.authenticateViaPrivateKey(privateKey, () => resolve(), (e: any) => reject(e));
            });
            await new Promise<void>((resolve, reject) => {
                ee.initialize(null, null, () => resolve(), (e: any) => reject(e));
            });
            console.log('Earth Engine authenticated and initialized.');
        } else {
            console.log('No private key file found. Attempting default initialization...');
            await new Promise<void>((resolve, reject) => {
                ee.initialize(null, null, () => resolve(), (e: any) => reject(e));
            });
            console.log('Earth Engine initialized via default credentials.');
        }

        // Start server only after EE is ready
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });

    } catch (error) {
        console.error('Failed to initialize Earth Engine:', error);
        process.exit(1);
    }
};

initEarthEngine();

/**
 * Function to mask clouds using the Sentinel-2 QA band
 * @param {ee.Image} image Sentinel-2 image
 * @return {ee.Image} cloud-masked image
 */
function maskS2Clouds(image: any) {
    var qa = image.select('QA60');

    // Bits 10 and 11 are clouds and cirrus, respectively.
    var cloudBitMask = 1 << 10;
    var cirrusBitMask = 1 << 11;

    // Both flags should be set to zero, indicating clear conditions.
    var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
        .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

    return image.updateMask(mask).divide(10000);
}

app.get('/', (req, res) => {
    res.send('Geo-Engine Classifier API (TypeScript) is running');
});

app.get('/api/map-layer', async (req, res) => {
    console.log('Processing /api/map-layer request...');
    try {
        const campusGeojson = {
            "type": "Polygon",
            "coordinates": [
                [
                    [80.01710357666015, 23.173962177472703],
                    [80.03259601593017, 23.165361215115187],
                    [80.03654422760009, 23.172502420044232],
                    [80.026802444458, 23.181694681000845],
                    [80.01542987823485, 23.176960548201308],
                ]
            ]
        };
        const campus = ee.Geometry(campusGeojson);

        // Filter Sentinel-2 - use a short date range and best image to reduce memory
        const dataset = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
            .filterBounds(campus)
            .filterDate('2025-11-01', '2025-11-30')
            .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
            .map(maskS2Clouds)
            .sort('CLOUDY_PIXEL_PERCENTAGE');

        // Use the best (least cloudy) image instead of mean to reduce memory
        const image = dataset.first().clip(campus);
        console.log('Built Earth Engine image, requesting map...');

        const visParams = {
            bands: ['B4', 'B3', 'B2'],
            min: 0,
            max: 0.3,
        };

        // Try getMapId - the callback receives the result
        console.log('Calling getMapId...');

        const mapIdPromise = new Promise<any>((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('getMapId timeout after 30 seconds'));
            }, 30000);

            try {
                const returnValue = image.getMapId(visParams, (result: any, error: any) => {
                    clearTimeout(timeoutId);
                    console.log('getMapId callback received');
                    console.log('  result:', JSON.stringify(result));
                    console.log('  error:', error);

                    if (error) {
                        reject(error);
                    } else if (result && (result.mapid || result.urlFormat)) {
                        resolve(result);
                    } else {
                        reject(new Error('Invalid response from getMapId: ' + JSON.stringify(result)));
                    }
                });

                // Check if getMapId returned a value directly (sync mode)
                console.log('getMapId return value:', JSON.stringify(returnValue));
                if (returnValue && (returnValue.mapid || returnValue.urlFormat)) {
                    clearTimeout(timeoutId);
                    resolve(returnValue);
                }
            } catch (e) {
                clearTimeout(timeoutId);
                reject(e);
            }
        });

        const mapId = await mapIdPromise;

        console.log('Successfully retrieved map ID:', mapId);
        res.json({
            tile_url: mapId.urlFormat || `https://earthengine.googleapis.com/v1/${mapId.mapid}/tiles/{z}/{x}/{y}`,
            center: [23.174, 80.026],
            geojson: campusGeojson
        });

    } catch (error: any) {
        console.error('Error in /api/map-layer:', error);
        res.status(500).json({
            error: 'Earth Engine Error',
            details: error.message || error.toString(),
            stack: error.stack
        });
    }
});

/**
 * Random Forest Classification endpoint
 * Classifies land cover into: Water, Forest, Built-up, Bare ground
 */
app.get('/api/classify-forest', async (req, res) => {
    console.log('Processing /api/classify-forest request...');
    try {
        const campusGeojson = {
            "type": "Polygon",
            "coordinates": [
                [
                    [80.01710357666015, 23.173962177472703],
                    [80.03259601593017, 23.165361215115187],
                    [80.03654422760009, 23.172502420044232],
                    [80.026802444458, 23.181694681000845],
                    [80.01542987823485, 23.176960548201308],
                ]
            ]
        };
        const campus = ee.Geometry(campusGeojson);

        // Filter Sentinel-2 - use a short date range and best image to reduce memory
        const dataset = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
            .filterBounds(campus)
            .filterDate('2025-11-01', '2025-11-30')
            .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
            .map(maskS2Clouds)
            .sort('CLOUDY_PIXEL_PERCENTAGE');

        // Use the best (least cloudy) image instead of mean to reduce memory
        const image = dataset.first().clip(campus);

        // ============================================
        // ADVANCED SPECTRAL INDICES FOR CLASSIFICATION
        // ============================================
        // Sentinel-2 provides 13 bands - we use multiple for better classification

        // BASIC INDICES
        // NDVI - Normalized Difference Vegetation Index (B8-B4)/(B8+B4)
        const ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');

        // NDWI - Normalized Difference Water Index (B3-B8)/(B3+B8)
        const ndwi = image.normalizedDifference(['B3', 'B8']).rename('NDWI');

        // NDBI - Normalized Difference Built-up Index (B11-B8)/(B11+B8)
        const ndbi = image.normalizedDifference(['B11', 'B8']).rename('NDBI');

        // ADVANCED VEGETATION INDICES
        // EVI - Enhanced Vegetation Index (better for dense vegetation)
        // EVI = 2.5 * (NIR - RED) / (NIR + 6*RED - 7.5*BLUE + 1)
        const nir = image.select('B8');
        const red = image.select('B4');
        const blue = image.select('B2');
        const evi = nir.subtract(red).multiply(2.5)
            .divide(nir.add(red.multiply(6)).subtract(blue.multiply(7.5)).add(1))
            .rename('EVI');

        // SAVI - Soil Adjusted Vegetation Index (better for sparse vegetation)
        // SAVI = ((NIR - RED) / (NIR + RED + L)) * (1 + L) where L = 0.5
        const L = 0.5;
        const savi = nir.subtract(red).divide(nir.add(red).add(L)).multiply(1 + L).rename('SAVI');

        // RED EDGE INDICES (unique to Sentinel-2, excellent for forest health)
        // NDRE - Normalized Difference Red Edge (B8-B5)/(B8+B5)
        const ndre = image.normalizedDifference(['B8', 'B5']).rename('NDRE');

        // WATER INDICES
        // MNDWI - Modified Normalized Difference Water Index (B3-B11)/(B3+B11)
        const mndwi = image.normalizedDifference(['B3', 'B11']).rename('MNDWI');

        // SOIL/BARE INDICES
        // BSI - Bare Soil Index ((B11+B4)-(B8+B2))/((B11+B4)+(B8+B2))
        const swir = image.select('B11');
        const bsi = swir.add(red).subtract(nir).subtract(blue)
            .divide(swir.add(red).add(nir).add(blue))
            .rename('BSI');

        // Brightness for road/building differentiation
        const brightness = image.select(['B2', 'B3', 'B4']).reduce(ee.Reducer.mean()).rename('brightness');

        // NIR brightness (helps distinguish forest types)
        const nirBrightness = nir.rename('nirBrightness');

        // ============================================
        // ADVANCED CLASSIFICATION WITH 8 CLASSES
        // ============================================
        // Class 0: Deep Water (MNDWI > 0.3)
        // Class 1: Shallow Water/Wetland (MNDWI 0.1-0.3)
        // Class 2: Dense Forest (EVI > 0.4 AND NDRE > 0.3)
        // Class 3: Mixed Forest (NDVI > 0.4 AND EVI 0.2-0.4)
        // Class 4: Grassland/Sparse Vegetation (SAVI 0.15-0.3)
        // Class 5: Buildings (NDBI > 0.1, NDVI < 0.1, bright)
        // Class 6: Roads/Pavement (NDBI > 0, NDVI < 0.1, dark)
        // Class 7: Bare Soil (BSI > 0.1)

        // Create classification masks with advanced logic
        const deepWater = mndwi.gt(0.3);
        const shallowWater = mndwi.gt(0.1).and(mndwi.lte(0.3)).and(deepWater.not());

        const denseForest = evi.gt(0.4).and(ndre.gt(0.3)).and(deepWater.not()).and(shallowWater.not());
        const mixedForest = ndvi.gt(0.4).and(evi.lte(0.4)).and(denseForest.not())
            .and(deepWater.not()).and(shallowWater.not());

        const grassland = savi.gt(0.15).and(savi.lte(0.35)).and(ndvi.lte(0.4))
            .and(deepWater.not()).and(shallowWater.not())
            .and(denseForest.not()).and(mixedForest.not());

        const builtUpMask = ndbi.gt(0).and(ndvi.lt(0.1))
            .and(deepWater.not()).and(shallowWater.not());
        const buildings = builtUpMask.and(brightness.gt(0.08));
        const roads = builtUpMask.and(brightness.lte(0.08));

        const bareSoil = bsi.gt(0.1).and(ndvi.lt(0.15))
            .and(builtUpMask.not()).and(deepWater.not()).and(shallowWater.not());

        // Combine into single classified image
        let classified = ee.Image(7);  // Default to bare soil
        classified = classified.where(bareSoil, 7);  // Bare soil
        classified = classified.where(roads, 6);  // Roads
        classified = classified.where(buildings, 5);  // Buildings
        classified = classified.where(grassland, 4);  // Grassland
        classified = classified.where(mixedForest, 3);  // Mixed Forest
        classified = classified.where(denseForest, 2);  // Dense Forest
        classified = classified.where(shallowWater, 1);  // Shallow Water/Wetland
        classified = classified.where(deepWater, 0);  // Deep Water

        // Apply focal mode filter to smooth classifications
        classified = classified.focal_mode({
            radius: 12,
            kernelType: 'circle',
            units: 'meters'
        });

        // Clip to campus boundary
        classified = classified.clip(campus);

        console.log('Image classified using spectral indices, requesting map...');

        // Visualization parameters for classified image
        // 0: Deep Water, 1: Wetland, 2: Dense Forest, 3: Mixed Forest
        // 4: Grassland, 5: Buildings, 6: Roads, 7: Bare Soil
        const classVisParams = {
            min: 0,
            max: 7,
            palette: [
                '00008b', // 0: Deep Water (DarkBlue)
                '00ced1', // 1: Wetland/Shallow Water (DarkTurquoise)
                '006400', // 2: Dense Forest (DarkGreen)
                '228b22', // 3: Mixed Forest (ForestGreen)
                '9acd32', // 4: Grassland (YellowGreen)
                'cd853f', // 5: Buildings (Peru)
                '404040', // 6: Roads (DimGray)
                'd2b48c'  // 7: Bare Soil (Tan)
            ]
        };

        // Get classified map ID
        const classifiedMapPromise = new Promise<any>((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('getMapId timeout after 60 seconds'));
            }, 60000);

            try {
                const returnValue = classified.getMapId(classVisParams, (result: any, error: any) => {
                    clearTimeout(timeoutId);
                    if (error) {
                        reject(error);
                    } else if (result && (result.mapid || result.urlFormat)) {
                        resolve(result);
                    } else {
                        reject(new Error('Invalid response from getMapId: ' + JSON.stringify(result)));
                    }
                });

                if (returnValue && (returnValue.mapid || returnValue.urlFormat)) {
                    clearTimeout(timeoutId);
                    resolve(returnValue);
                }
            } catch (e) {
                clearTimeout(timeoutId);
                reject(e);
            }
        });

        // Also get RGB map for comparison
        const rgbVisParams = {
            bands: ['B4', 'B3', 'B2'],
            min: 0,
            max: 0.3,
        };

        const rgbMapPromise = new Promise<any>((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('getMapId timeout after 60 seconds'));
            }, 60000);

            try {
                const returnValue = image.getMapId(rgbVisParams, (result: any, error: any) => {
                    clearTimeout(timeoutId);
                    if (error) {
                        reject(error);
                    } else if (result && (result.mapid || result.urlFormat)) {
                        resolve(result);
                    } else {
                        reject(new Error('Invalid response from getMapId: ' + JSON.stringify(result)));
                    }
                });

                if (returnValue && (returnValue.mapid || returnValue.urlFormat)) {
                    clearTimeout(timeoutId);
                    resolve(returnValue);
                }
            } catch (e) {
                clearTimeout(timeoutId);
                reject(e);
            }
        });

        const [classifiedMap, rgbMap] = await Promise.all([classifiedMapPromise, rgbMapPromise]);

        console.log('Successfully retrieved classified map ID');
        res.json({
            classified_tile_url: classifiedMap.urlFormat || `https://earthengine.googleapis.com/v1/${classifiedMap.mapid}/tiles/{z}/{x}/{y}`,
            rgb_tile_url: rgbMap.urlFormat || `https://earthengine.googleapis.com/v1/${rgbMap.mapid}/tiles/{z}/{x}/{y}`,
            center: [23.174, 80.026],
            geojson: campusGeojson,
            legend: [
                { class: 0, name: 'Deep Water', color: '#00008b' },
                { class: 1, name: 'Wetland/Shallow Water', color: '#00ced1' },
                { class: 2, name: 'Dense Forest', color: '#006400' },
                { class: 3, name: 'Mixed Forest', color: '#228b22' },
                { class: 4, name: 'Grassland', color: '#9acd32' },
                { class: 5, name: 'Buildings', color: '#cd853f' },
                { class: 6, name: 'Roads', color: '#404040' },
                { class: 7, name: 'Bare Soil', color: '#d2b48c' }
            ]
        });

    } catch (error: any) {
        console.error('Error in /api/classify-forest:', error);
        res.status(500).json({
            error: 'Classification Error',
            details: error.message || error.toString(),
            stack: error.stack
        });
    }
});
