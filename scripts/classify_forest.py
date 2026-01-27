import ee 
import geemap

# Explicitly specify the project parameter in ee.Initialize()
ee.Initialize(project='earth-engine-484907')

def mask_s2_clouds(image):
    qa = image.select('QA60')
    cloud_bit_mask = 1 << 10
    cirrus_bit_mask = 1 << 11

    mask = (qa.bitwiseAnd(cloud_bit_mask).eq(0)
                .And(qa.bitwiseAnd(cirrus_bit_mask).eq(0)))
    
    return image.updateMask(mask).divide(10000)

dataset = (ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
           .filterDate('2026-01-01', '2026-01-15')
           .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
           .map(mask_s2_clouds))

campus_geojson = {
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
}

campus = ee.Geometry(campus_geojson)

image = dataset.mean().clip(campus)

Map = geemap.Map(centerObject = campus, zoom = 16)

Map.addLayer(
    image,
    {
        'bands' : ['B4', 'B3', 'B2'], 
        'min' : 0,
        'max' : 0.3,
    },
    'Campus RGB'
)

Map.addLayer(campus, {}, 'Campus Boundary')

Map
