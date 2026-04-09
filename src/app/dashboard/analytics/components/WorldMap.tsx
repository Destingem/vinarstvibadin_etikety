'use client';

interface CountryData {
  countryCode: string;
  countryName: string;
  scanCount: number;
  percentage: number;
}

interface WorldMapProps {
  data: CountryData[];
}

const MAP_WIDTH = 960;
const MAP_HEIGHT = 500;

const CONTINENT_SHAPES = [
  'M72 126 C120 88 204 82 253 120 C281 142 282 181 255 200 C228 219 183 214 154 232 C118 255 91 239 80 210 C64 171 43 151 72 126 Z',
  'M240 273 C270 252 327 252 360 271 C391 289 390 326 364 343 C336 362 291 366 262 350 C231 333 217 295 240 273 Z',
  'M425 118 C482 70 600 72 673 116 C723 145 725 210 680 244 C638 277 567 287 519 269 C474 252 451 218 423 189 C404 170 400 137 425 118 Z',
  'M447 279 C483 251 544 250 584 274 C620 296 631 342 611 381 C592 417 547 438 507 428 C470 418 441 388 431 353 C421 325 424 296 447 279 Z',
  'M705 321 C733 298 780 300 812 322 C839 340 843 375 819 393 C793 413 748 414 721 395 C694 376 682 342 705 321 Z',
];

const COUNTRY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  AL: { lat: 41.153, lng: 20.168 },
  AR: { lat: -38.416, lng: -63.616 },
  AT: { lat: 47.516, lng: 14.55 },
  AU: { lat: -25.274, lng: 133.775 },
  BA: { lat: 43.915, lng: 17.679 },
  BE: { lat: 50.503, lng: 4.469 },
  BG: { lat: 42.733, lng: 25.485 },
  BR: { lat: -14.235, lng: -51.925 },
  BY: { lat: 53.709, lng: 27.953 },
  CA: { lat: 56.13, lng: -106.346 },
  CH: { lat: 46.818, lng: 8.227 },
  CN: { lat: 35.861, lng: 104.195 },
  CZ: { lat: 49.75, lng: 15.5 },
  DE: { lat: 51.165, lng: 10.451 },
  DK: { lat: 56.263, lng: 9.501 },
  EE: { lat: 58.595, lng: 25.013 },
  ES: { lat: 40.463, lng: -3.749 },
  FI: { lat: 61.924, lng: 25.748 },
  FR: { lat: 46.227, lng: 2.213 },
  GB: { lat: 55.378, lng: -3.436 },
  GR: { lat: 39.074, lng: 21.824 },
  HR: { lat: 45.1, lng: 15.2 },
  HU: { lat: 47.162, lng: 19.503 },
  IE: { lat: 53.412, lng: -8.243 },
  IN: { lat: 20.593, lng: 78.962 },
  IT: { lat: 41.871, lng: 12.567 },
  JP: { lat: 36.204, lng: 138.252 },
  LT: { lat: 55.169, lng: 23.881 },
  LU: { lat: 49.815, lng: 6.13 },
  LV: { lat: 56.879, lng: 24.603 },
  MD: { lat: 47.411, lng: 28.369 },
  ME: { lat: 42.708, lng: 19.374 },
  MK: { lat: 41.608, lng: 21.745 },
  MX: { lat: 23.634, lng: -102.552 },
  NL: { lat: 52.132, lng: 5.291 },
  NO: { lat: 60.472, lng: 8.468 },
  PL: { lat: 51.919, lng: 19.145 },
  PT: { lat: 39.399, lng: -8.224 },
  RO: { lat: 45.943, lng: 24.967 },
  RS: { lat: 44.016, lng: 21.006 },
  RU: { lat: 61.524, lng: 105.318 },
  SE: { lat: 60.128, lng: 18.643 },
  SI: { lat: 46.151, lng: 14.995 },
  SK: { lat: 48.669, lng: 19.699 },
  UA: { lat: 48.379, lng: 31.165 },
  US: { lat: 37.09, lng: -95.712 },
  ZA: { lat: -30.559, lng: 22.937 },
};

export default function WorldMap({ data }: WorldMapProps) {
  const maxScans = data.length > 0 ? Math.max(...data.map((item) => item.scanCount)) : 1;
  const totalScans = data.reduce((sum, item) => sum + item.scanCount, 0);
  const labeledCodes = new Set(data.slice(0, 6).map((item) => item.countryCode));

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[28px] border border-[#eadfd3] bg-[#fcf8f2]">
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          className="h-[360px] w-full bg-[radial-gradient(circle_at_top_left,_rgba(140,80,68,0.10),_transparent_35%),linear-gradient(180deg,_#fffdf9_0%,_#f5ece1_100%)]"
          role="img"
          aria-label="Mapa regionů podle počtu skenů"
        >
          <defs>
            <linearGradient id="map-bubble" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#cb8f69" />
              <stop offset="100%" stopColor="#7e3633" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width={MAP_WIDTH} height={MAP_HEIGHT} fill="#fcf8f2" />

          {[1, 2, 3].map((row) => (
            <line
              key={`row-${row}`}
              x1="0"
              x2={MAP_WIDTH}
              y1={(MAP_HEIGHT / 4) * row}
              y2={(MAP_HEIGHT / 4) * row}
              stroke="#eadfd3"
              strokeDasharray="6 8"
            />
          ))}

          {[1, 2, 3, 4, 5].map((col) => (
            <line
              key={`col-${col}`}
              x1={(MAP_WIDTH / 6) * col}
              x2={(MAP_WIDTH / 6) * col}
              y1="0"
              y2={MAP_HEIGHT}
              stroke="#f0e6db"
              strokeDasharray="6 8"
            />
          ))}

          {CONTINENT_SHAPES.map((shape, index) => (
            <path
              key={`continent-${index}`}
              d={shape}
              fill="#eadfd3"
              opacity={0.9}
              transform="scale(1.6 1.4)"
            />
          ))}

          {data.map((country) => {
            const projection = projectCountry(country.countryCode);
            if (!projection) {
              return null;
            }

            const radius = 8 + (country.scanCount / maxScans) * 22;

            return (
              <g key={`${country.countryCode}-${country.countryName}`}>
                <circle
                  cx={projection.x}
                  cy={projection.y}
                  r={radius}
                  fill="url(#map-bubble)"
                  fillOpacity="0.86"
                  stroke="#fff8f2"
                  strokeWidth="3"
                >
                  <title>
                    {country.countryName}: {country.scanCount.toLocaleString('cs-CZ')} skenů ({country.percentage}%)
                  </title>
                </circle>
                <circle
                  cx={projection.x}
                  cy={projection.y}
                  r={radius + 7}
                  fill="none"
                  stroke="#8f4740"
                  strokeOpacity="0.12"
                  strokeWidth="2"
                />

                {labeledCodes.has(country.countryCode) ? (
                  <>
                    <text
                      x={projection.x}
                      y={projection.y - radius - 10}
                      textAnchor="middle"
                      className="fill-[#59302b] text-[12px] font-semibold"
                    >
                      {country.countryCode}
                    </text>
                    <text
                      x={projection.x}
                      y={projection.y + 4}
                      textAnchor="middle"
                      className="fill-white text-[11px] font-semibold"
                    >
                      {country.scanCount > 999 ? `${Math.round(country.scanCount / 1000)}k` : country.scanCount}
                    </text>
                  </>
                ) : null}
              </g>
            );
          })}

          {data.length === 0 ? (
            <text
              x={MAP_WIDTH / 2}
              y={MAP_HEIGHT / 2}
              textAnchor="middle"
              className="fill-stone-500 text-[16px]"
            >
              Regionální data zatím nejsou k dispozici.
            </text>
          ) : null}
        </svg>
      </div>

      <div className="rounded-[24px] border border-[#eadfd3] bg-[#fffdf9] p-4">
        <div className="flex flex-wrap items-center gap-4 text-sm text-stone-600">
          <div className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#c98d67]" />
            Menší objem skenů
          </div>
          <div className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#7e3633]" />
            Vyšší objem skenů
          </div>
          <div>
            <strong className="text-stone-900">{data.length}</strong> zemí
          </div>
          <div>
            <strong className="text-stone-900">{totalScans.toLocaleString('cs-CZ')}</strong> skenů
          </div>
        </div>
      </div>
    </div>
  );
}

function projectCountry(countryCode: string) {
  const coords = COUNTRY_COORDINATES[countryCode];
  if (!coords) {
    return null;
  }

  const x = ((coords.lng + 180) / 360) * MAP_WIDTH;
  const y = ((90 - coords.lat) / 180) * MAP_HEIGHT;
  return { x, y };
}
