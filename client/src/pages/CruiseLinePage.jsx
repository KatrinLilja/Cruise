import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import ShipCard from '../components/ShipCard';
import { getImageSrc } from '../imageProxy';

export default function CruiseLinePage() {
  const { id } = useParams();
  const [cruiseLine, setCruiseLine] = useState(null);
  const [ships, setShips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [bannerError, setBannerError] = useState(false);
  const [activeRegions, setActiveRegions] = useState([]);

  const allRegions = useMemo(() => {
    const set = new Set();
    ships.forEach(s => s.regions?.forEach(r => set.add(r)));
    return [...set].sort();
  }, [ships]);

  const filteredShips = useMemo(() => {
    if (activeRegions.length === 0) return ships;
    return ships.filter(s => s.regions?.some(r => activeRegions.includes(r)));
  }, [ships, activeRegions]);

  function toggleRegion(region) {
    setActiveRegions(prev =>
      prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
    );
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/cruise-lines/${id}`).then(r => { if (!r.ok) throw new Error('Cruise line not found'); return r.json(); }),
      fetch(`/api/ships?cruiseLineId=${id}`).then(r => r.json())
    ])
      .then(([cl, sh]) => { setCruiseLine(cl); setShips(sh); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-ocean-200 border-t-ocean-600 rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6">{error}</div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-ocean-600 hover:text-ocean-800 mb-6 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        All Cruise Lines
      </Link>

      {/* Hero banner */}
      {cruiseLine.image && !bannerError && (
        <div className="w-full h-56 rounded-2xl overflow-hidden mb-6 bg-ocean-50">
          <img
            src={getImageSrc(cruiseLine.image)}
            alt={cruiseLine.name}
            className="w-full h-full object-cover"
            onError={() => setBannerError(true)}
          />
        </div>
      )}

      {/* Hero card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-10 flex flex-col sm:flex-row gap-6 items-start">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{cruiseLine.name}</h1>
          <p className="text-gray-500 mt-3 leading-relaxed">{cruiseLine.description}</p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            <Stat label="Founded" value={cruiseLine.founded} />
            <Stat label="Headquarters" value={cruiseLine.headquarters} />
            <Stat label="Fleet size" value={`${cruiseLine.fleet_size} ships`} />
            {cruiseLine.price_level && (
              <Stat label="Price" value={<PriceIcons level={cruiseLine.price_level} />} />
            )}
          </div>
          {cruiseLine.destinations?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {cruiseLine.destinations.map(d => (
                <span key={d} className="bg-ocean-50 text-ocean-700 text-xs font-medium px-3 py-1 rounded-full">
                  {d}
                </span>
              ))}
            </div>
          )}
          {cruiseLine.website && (
            <a href={cruiseLine.website} target="_blank" rel="noopener noreferrer"
               className="inline-block mt-4 text-sm text-ocean-600 hover:text-ocean-800 underline underline-offset-2">
              Visit official website &rarr;
            </a>
          )}
        </div>
      </div>

      {/* Ships */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Fleet&nbsp;
          <span className="text-gray-400 font-normal text-base">
            ({filteredShips.length}{activeRegions.length > 0 ? ` of ${ships.length}` : ''} ships)
          </span>
        </h2>
      </div>

      {allRegions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {allRegions.map(region => (
            <button
              key={region}
              onClick={() => toggleRegion(region)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                activeRegions.includes(region)
                  ? 'bg-ocean-600 border-ocean-600 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-ocean-300 hover:text-ocean-700'
              }`}
            >
              {region}
            </button>
          ))}
          {activeRegions.length > 0 && (
            <button
              onClick={() => setActiveRegions([])}
              className="text-xs font-medium px-3 py-1.5 rounded-full border border-dashed border-gray-300 text-gray-400 hover:text-red-500 hover:border-red-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {filteredShips.length === 0 ? (
        <p className="text-gray-400">No ships match the selected regions.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShips.map(ship => <ShipCard key={ship.id} ship={ship} />)}
        </div>
      )}
    </div>
  );
}

function PriceIcons({ level }) {
  const icons = [];
  for (let i = 0; i < 5; i++) {
    icons.push(
      <span key={i} style={{ opacity: i < level ? 1 : 0.2 }}>💰</span>
    );
  }
  return <span className="inline-flex items-center gap-0.5">{icons}</span>;
}

function Stat({ label, value }) {
  return (
    <div className="bg-ocean-50 rounded-lg px-4 py-2">
      <p className="text-ocean-500 text-xs uppercase tracking-wide font-medium">{label}</p>
      <p className="text-gray-900 font-semibold">{value}</p>
    </div>
  );
}
