import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap, GeoJSON, ScaleControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Component to handle map view updates
function ChangeView({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

// Component to display current zoom level
function ZoomDisplay() {
    const map = useMap();
    const [zoom, setZoom] = useState(map.getZoom());

    useEffect(() => {
        const handleZoom = () => {
            setZoom(map.getZoom());
        };
        map.on('zoomend', handleZoom);
        return () => {
            map.off('zoomend', handleZoom);
        };
    }, [map]);

    return (
        <div className="leaflet-bottom leaflet-left" style={{ marginBottom: '30px', marginLeft: '10px' }}>
            <div className="leaflet-control" style={{
                background: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(10px)',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8',
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif'
            }}>
                <span style={{ color: '#10b981', fontWeight: 600 }}>Zoom:</span> {zoom.toFixed(1)}
            </div>
        </div>
    );
}

const MapComponent = ({ tileUrl, center, geojson }) => {
    const defaultCenter = [23.176, 80.025];
    const defaultZoom = 15;
    const [key, setKey] = useState(0);

    // Force re-render when tileUrl changes
    useEffect(() => {
        if (tileUrl) {
            setKey(prev => prev + 1);
        }
    }, [tileUrl]);

    return (
        <div className="h-full w-full">
            <MapContainer
                center={center || defaultCenter}
                zoom={defaultZoom}
                scrollWheelZoom={true}
                className="h-full w-full"
                style={{ background: '#0f172a' }}
            >
                <ChangeView center={center || defaultCenter} zoom={defaultZoom} />

                {/* Dynamic Scale Control - updates with zoom */}
                <ScaleControl
                    position="bottomleft"
                    imperial={false}
                    maxWidth={150}
                />

                {/* Zoom Level Display */}
                <ZoomDisplay />

                {/* Dark Base Map */}
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* Earth Engine Layer */}
                {tileUrl && (
                    <TileLayer
                        key={key}
                        url={tileUrl}
                        opacity={0.9}
                    />
                )}

                {/* Campus Boundary */}
                {geojson && (
                    <GeoJSON
                        key={`geojson-${key}`}
                        data={geojson}
                        style={() => ({
                            color: '#10b981',
                            weight: 2,
                            fillColor: 'transparent',
                            fillOpacity: 0,
                            dashArray: '5, 5'
                        })}
                    />
                )}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
