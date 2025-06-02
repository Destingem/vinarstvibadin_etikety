'use client';

import { useState, useEffect, useRef } from 'react';

interface CountryData {
  countryCode: string;
  countryName: string;
  scanCount: number;
  percentage: number;
}

interface WorldMapProps {
  data: CountryData[];
}

// Leaflet types
declare global {
  interface Window {
    L: any;
  }
}

export default function WorldMap({ data }: WorldMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);

  const maxScans = data.length > 0 ? Math.max(...data.map(d => d.scanCount)) : 1;
  
  const getCountryColor = (scanCount: number) => {
    if (scanCount === 0) return '#f3f4f6';
    
    const intensity = scanCount / maxScans;
    if (intensity > 0.7) return '#7f1d1d'; // Very dark wine red
    if (intensity > 0.5) return '#991b1b'; // Dark wine red
    if (intensity > 0.3) return '#dc2626'; // Medium wine red
    if (intensity > 0.15) return '#ef4444'; // Light wine red
    if (intensity > 0.05) return '#f87171'; // Very light red
    return '#fca5a5'; // Lightest red
  };

  // Mapa zemí s jejich souřadnicemi
  const countryCoordinates: Record<string, { lat: number; lng: number; name: string }> = {
    'CZ': { lat: 49.75, lng: 15.5, name: 'Česká republika' },
    'SK': { lat: 48.669, lng: 19.699, name: 'Slovensko' },
    'AT': { lat: 47.516, lng: 14.550, name: 'Rakousko' },
    'DE': { lat: 51.165, lng: 10.451, name: 'Německo' },
    'PL': { lat: 51.919, lng: 19.145, name: 'Polsko' },
    'HU': { lat: 47.162, lng: 19.503, name: 'Maďarsko' },
    'SI': { lat: 46.151, lng: 14.995, name: 'Slovinsko' },
    'HR': { lat: 45.1, lng: 15.2, name: 'Chorvatsko' },
    'RO': { lat: 45.943, lng: 24.967, name: 'Rumunsko' },
    'BG': { lat: 42.733, lng: 25.485, name: 'Bulharsko' },
    'RS': { lat: 44.016, lng: 21.006, name: 'Srbsko' },
    'BA': { lat: 43.915, lng: 17.679, name: 'Bosna a Hercegovina' },
    'ME': { lat: 42.708, lng: 19.374, name: 'Černá Hora' },
    'AL': { lat: 41.153, lng: 20.168, name: 'Albánie' },
    'MK': { lat: 41.608, lng: 21.745, name: 'Severní Makedonie' },
    'GR': { lat: 39.074, lng: 21.824, name: 'Řecko' },
    'IT': { lat: 41.871, lng: 12.567, name: 'Itálie' },
    'CH': { lat: 46.818, lng: 8.227, name: 'Švýcarsko' },
    'FR': { lat: 46.227, lng: 2.213, name: 'Francie' },
    'ES': { lat: 40.463, lng: -3.749, name: 'Španělsko' },
    'PT': { lat: 39.399, lng: -8.224, name: 'Portugalsko' },
    'GB': { lat: 55.378, lng: -3.436, name: 'Velká Británie' },
    'IE': { lat: 53.412, lng: -8.243, name: 'Irsko' },
    'NL': { lat: 52.132, lng: 5.291, name: 'Nizozemsko' },
    'BE': { lat: 50.503, lng: 4.469, name: 'Belgie' },
    'LU': { lat: 49.815, lng: 6.130, name: 'Lucembursko' },
    'DK': { lat: 56.263, lng: 9.501, name: 'Dánsko' },
    'SE': { lat: 60.128, lng: 18.643, name: 'Švédsko' },
    'NO': { lat: 60.472, lng: 8.468, name: 'Norsko' },
    'FI': { lat: 61.924, lng: 25.748, name: 'Finsko' },
    'EE': { lat: 58.595, lng: 25.013, name: 'Estonsko' },
    'LV': { lat: 56.879, lng: 24.603, name: 'Lotyšsko' },
    'LT': { lat: 55.169, lng: 23.881, name: 'Litva' },
    'BY': { lat: 53.709, lng: 27.953, name: 'Bělorusko' },
    'UA': { lat: 48.379, lng: 31.165, name: 'Ukrajina' },
    'MD': { lat: 47.411, lng: 28.369, name: 'Moldavsko' },
    'RU': { lat: 61.524, lng: 105.318, name: 'Rusko' },
    'US': { lat: 37.090, lng: -95.712, name: 'Spojené státy' },
    'CA': { lat: 56.130, lng: -106.346, name: 'Kanada' },
    'MX': { lat: 23.634, lng: -102.552, name: 'Mexiko' },
    'BR': { lat: -14.235, lng: -51.925, name: 'Brazílie' },
    'AR': { lat: -38.416, lng: -63.616, name: 'Argentina' },
    'AU': { lat: -25.274, lng: 133.775, name: 'Austrálie' },
    'JP': { lat: 36.204, lng: 138.252, name: 'Japonsko' },
    'CN': { lat: 35.861, lng: 104.195, name: 'Čína' },
    'IN': { lat: 20.593, lng: 78.962, name: 'Indie' },
    'ZA': { lat: -30.559, lng: 22.937, name: 'Jihoafrická republika' }
  };

  useEffect(() => {
    // Načtení Leaflet knihovny
    if (!window.L) {
      // Načtení CSS
      const linkElement = document.createElement('link');
      linkElement.rel = 'stylesheet';
      linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(linkElement);

      // Načtení JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => {
        setMapLoaded(true);
      };
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (mapLoaded && mapRef.current && !mapInstance && window.L) {
      // Vytvoření Leaflet mapy se středem na Evropu
      const map = window.L.map(mapRef.current, {
        center: [49.75, 15.5], // Střed Česka
        zoom: 5,
        maxZoom: 18,
        minZoom: 2
      });

      // Přidání Mapy.cz dlaždic pomocí REST API
      const mapyCzLayer = window.L.tileLayer(
        'https://api.mapy.cz/v1/maptiles/basic/256/{z}/{x}/{y}?apikey=xDrcUQwZtSkTiZI31vX9S_didDw9rrkbDNH4vXrcty0',
        {
          attribution: '© <a href="https://www.mapy.cz/" target="_blank">Mapy.cz</a>',
          maxZoom: 18,
        }
      );
      mapyCzLayer.addTo(map);

      // Přidání značek pro země s daty
      const markers: any[] = [];
      
      data.forEach(country => {
        const coords = countryCoordinates[country.countryCode];
        if (coords) {
          const color = getCountryColor(country.scanCount);
          const size = Math.max(15, Math.min(40, (country.scanCount / maxScans) * 30 + 15));
          
          // Vytvoření vlastního HTML markeru
          const customIcon = window.L.divIcon({
            html: `
              <div style="
                width: ${size}px;
                height: ${size}px;
                background-color: ${color};
                border: 3px solid white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: ${Math.max(10, size * 0.3)}px;
                font-weight: bold;
                color: white;
                text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                cursor: pointer;
                transition: transform 0.2s ease;
              " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                ${country.scanCount > 999 ? '1k+' : country.scanCount}
              </div>
            `,
            className: 'custom-wine-marker',
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
          });

          // Vytvoření markeru
          const marker = window.L.marker([coords.lat, coords.lng], { 
            icon: customIcon,
            title: coords.name
          });

          // Přidání popup s informacemi
          const popupContent = `
            <div style="padding: 8px; min-width: 200px;">
              <h3 style="margin: 0 0 10px 0; color: #dc2626; font-size: 16px;">
                🍷 ${coords.name}
              </h3>
              <div style="margin-bottom: 8px;">
                <strong style="color: #7f1d1d;">${country.scanCount.toLocaleString()}</strong> skenů QR kódů
              </div>
              <div style="margin-bottom: 8px;">
                <strong>${country.percentage}%</strong> z celkových skenů
              </div>
              <div style="padding: 8px; background: #f9fafb; border-radius: 6px; font-size: 12px; color: #6b7280;">
                <div><strong>Kód země:</strong> ${country.countryCode}</div>
                <div><strong>Pořadí:</strong> #${data.findIndex(c => c.countryCode === country.countryCode) + 1} z ${data.length}</div>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent, {
            maxWidth: 300,
            className: 'custom-wine-popup'
          });

          // Přidání tooltip pro hover
          marker.bindTooltip(`
            <div style="text-align: center;">
              <strong>${coords.name}</strong><br>
              <span style="color: #dc2626;">${country.scanCount} skenů</span>
            </div>
          `, {
            direction: 'top',
            offset: [0, -10]
          });

          marker.addTo(map);
          markers.push(marker);
        }
      });

      setMapInstance(map);

      // Cleanup funkce
      return () => {
        if (map) {
          map.remove();
        }
      };
    }
  }, [mapLoaded, data, maxScans]);

  if (!mapLoaded) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítám Mapy.cz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className="w-full h-96 border border-gray-200 rounded-lg bg-gray-100"
        style={{ minHeight: '400px' }}
      />
      
      {/* Legenda pod mapou */}
      <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Legenda - Počet skenů podle zemí</h4>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#fca5a5' }}></div>
            <span>1-5 skenů</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#f87171' }}></div>
            <span>6-20 skenů</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#ef4444' }}></div>
            <span>21-50 skenů</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#dc2626' }}></div>
            <span>51-100 skenů</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#991b1b' }}></div>
            <span>101-500 skenů</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#7f1d1d' }}></div>
            <span>500+ skenů</span>
          </div>
        </div>
        
        {/* Statistiky pod legendou */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Celkem zemí:</span>
              <span className="ml-2 font-medium">{data.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Celkem skenů:</span>
              <span className="ml-2 font-medium">{data.reduce((sum, c) => sum + c.scanCount, 0).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600">Nejaktivnější:</span>
              <span className="ml-2 font-medium">
                {data.length > 0 ? countryCoordinates[data[0].countryCode]?.name || data[0].countryName : '-'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Max. skenů:</span>
              <span className="ml-2 font-medium">{maxScans.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}