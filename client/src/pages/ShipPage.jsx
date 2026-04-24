import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getImageSrc } from '../imageProxy';

export default function ShipPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ship, setShip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/ships/${id}`)
      .then(r => { if (!r.ok) throw new Error('Ship not found'); return r.json(); })
      .then(data => { setShip(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-ocean-200 border-t-ocean-600 rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6">{error}</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center gap-2 mb-6 text-sm">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-ocean-600 hover:text-ocean-800 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <span className="text-gray-300">/</span>
        <Link to="/" className="text-ocean-600 hover:text-ocean-800 transition-colors">Cruise Lines</Link>
        <span className="text-gray-300">/</span>
        <Link to={`/cruise-lines/${ship.cruiseLineId}`} className="text-ocean-600 hover:text-ocean-800 transition-colors capitalize">
          {ship.cruiseLineId.replace(/-/g, ' ')}
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-500">{ship.name}</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {ship.image && !imgError && (
          <div className="h-64 sm:h-80 overflow-hidden">
            <img src={getImageSrc(ship.image)} alt={ship.name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
          </div>
        )}
        <div className="p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{ship.name}</h1>
            <span className="bg-ocean-100 text-ocean-700 text-sm font-semibold px-4 py-1.5 rounded-full">{ship.ship_class}</span>
          </div>
          <p className="text-gray-500 mt-3 leading-relaxed text-base">{ship.description}</p>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Stat label="Year Built" value={ship.year_built} />
            <Stat label="Gross Tonnage" value={ship.gross_tonnage?.toLocaleString() + ' GT'} />
            <Stat label="Passenger Capacity" value={ship.passenger_capacity?.toLocaleString()} />
            <Stat label="Crew" value={ship.crew?.toLocaleString()} />
            <Stat label="Length" value={ship.length_m + ' m'} />
            <Stat label="Decks" value={ship.decks} />
            {ship.homeport && <Stat label="Home Port" value={ship.homeport} />}
          </div>

          {ship.regions?.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Regions</h2>
              <div className="flex flex-wrap gap-2">
                {ship.regions.map(r => (
                  <span key={r} className="text-sm font-medium bg-ocean-50 text-ocean-700 border border-ocean-100 px-4 py-1.5 rounded-full">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}

          {ship.amenities && (
            <div className="mt-10">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Onboard Experience</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <AmenityGroup icon="🍽️" label="Dining" items={ship.amenities.dining} color="amber" />
                <AmenityGroup icon="🎭" label="Entertainment" items={ship.amenities.entertainment} color="purple" />
                <AmenityGroup icon="🏊" label="Recreation" items={ship.amenities.recreation} color="ocean" />
                <AmenityGroup icon="✅" label="What's Included" items={ship.amenities.included} color="green" />
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100">
            <Link
              to={`/cruise-lines/${ship.cruiseLineId}`}
              className="inline-flex items-center gap-2 bg-ocean-600 hover:bg-ocean-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              View all ships by {ship.cruiseLineId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <p className="text-ocean-500 text-xs uppercase tracking-wide font-medium mb-1">{label}</p>
      <p className="text-gray-900 font-semibold">{value}</p>
    </div>
  );
}

const colorMap = {
  amber: 'bg-amber-50 border-amber-100 text-amber-700',
  purple: 'bg-purple-50 border-purple-100 text-purple-700',
  ocean: 'bg-ocean-50 border-ocean-100 text-ocean-700',
  green: 'bg-green-50 border-green-100 text-green-700',
};

function AmenityGroup({ icon, label, items, color }) {
  const pillClass = colorMap[color] || colorMap.ocean;
  return (
    <div className="bg-gray-50 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span>{icon}</span>{label}
      </h3>
      <div className="flex flex-wrap gap-2">
        {items?.map((item, i) => (
          <span key={i} className={`text-xs font-medium px-3 py-1 rounded-full border ${pillClass}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
