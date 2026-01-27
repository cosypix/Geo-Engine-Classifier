import { useState } from 'react';
import axios from 'axios';
import MapComponent from './components/MapComponent';

function App() {
  const [loading, setLoading] = useState(false);
  const [mapData, setMapData] = useState(null);
  const [error, setError] = useState(null);
  const [showClassified, setShowClassified] = useState(true);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:8000/api/classify-forest');
      setMapData(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch map data. Ensure the backend server is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const currentTileUrl = mapData
    ? (showClassified ? mapData.classified_tile_url : mapData.rgb_tile_url)
    : null;

  return (
    <div className="min-h-screen flex flex-col grid-pattern">
      {/* Header */}
      <header className="header-glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl blur-lg opacity-50"></div>
                <div className="relative bg-gradient-to-br from-emerald-500 to-cyan-600 p-3 rounded-xl shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Geo-Engine <span className="gradient-text">Classifier</span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">Random Forest Land Cover Analysis</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              {/* View Toggle */}
              {mapData && (
                <div className="toggle-container flex">
                  <button
                    onClick={() => setShowClassified(true)}
                    className={`toggle-button ${showClassified ? 'active' : ''}`}
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Classification
                    </span>
                  </button>
                  <button
                    onClick={() => setShowClassified(false)}
                    className={`toggle-button ${!showClassified ? 'active' : ''}`}
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Satellite RGB
                    </span>
                  </button>
                </div>
              )}

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="glass-button px-6 py-2.5 rounded-xl font-medium text-white flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Analyze Land Cover
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6">
        <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)]">
          {/* Error Alert */}
          {error && (
            <div className="mb-4 glass-card rounded-xl p-4 border-l-4 border-red-500 animate-slide-up">
              <div className="flex items-center gap-3">
                <div className="bg-red-500/20 p-2 rounded-lg">
                  <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-red-400 font-medium text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Map Container */}
          <div className="map-container h-full relative bg-slate-900/50">
            {/* Welcome Overlay */}
            {!mapData && !loading && !error && (
              <div className="absolute inset-0 z-[400] bg-slate-900/80 backdrop-blur-md flex items-center justify-center">
                <div className="text-center max-w-lg px-8 animate-slide-up">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 p-6 rounded-full border border-white/10">
                      <svg className="w-12 h-12 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3">
                    Ready to <span className="gradient-text">Analyze</span>
                  </h2>
                  <p className="text-slate-400 leading-relaxed mb-6">
                    Perform Random Forest classification on Sentinel-2 satellite imagery to identify forest coverage, water bodies, urban areas, and bare ground.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 text-xs">
                    <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      🌲 Forest Detection
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      💧 Water Bodies
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
                      🏢 Built-up Areas
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 z-[400] bg-slate-900/90 backdrop-blur-md flex items-center justify-center">
                <div className="text-center animate-slide-up">
                  <div className="relative inline-block mb-6">
                    <div className="loading-ring">
                      <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Running Classification</h3>
                  <p className="text-slate-400 text-sm mb-4">Training Random Forest model on satellite data...</p>
                  <div className="flex justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Legend */}
            {mapData && mapData.legend && showClassified && (
              <div className="absolute top-4 right-4 z-[500] legend-card rounded-xl p-4 animate-slide-up">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h4 className="text-sm font-semibold text-white">Land Cover Classes</h4>
                </div>
                <div className="space-y-1">
                  {mapData.legend.map((item, index) => (
                    <div
                      key={item.class}
                      className="legend-item"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div
                        className="legend-color"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-slate-300">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info Badge */}
            {mapData && (
              <div className="absolute bottom-4 left-4 z-[500] glass-card rounded-lg px-3 py-2 animate-slide-up">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Sentinel-2 • 10m Resolution • Random Forest (50 trees)</span>
                </div>
              </div>
            )}

            <MapComponent
              tileUrl={currentTileUrl}
              center={mapData?.center}
              geojson={mapData?.geojson}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center">
        <p className="text-xs text-slate-500">
          Powered by Google Earth Engine • Sentinel-2 Imagery
        </p>
      </footer>
    </div>
  );
}

export default App;
