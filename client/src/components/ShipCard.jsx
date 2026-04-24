import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getImageSrc } from '../imageProxy';

function ShipPlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center text-ocean-300">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    </div>
  );
}

export default function ShipCard({ ship }) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      to={`/ships/${ship.id}`}
      className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-ocean-200 transition-all duration-200 flex flex-col"
    >
      <div className="h-44 bg-ocean-50 overflow-hidden">
        {ship.image && !imgError ? (
          <img
            src={getImageSrc(ship.image)}
            alt={ship.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <ShipPlaceholder />
        )}
      </div>
      <div className="p-4 flex flex-col gap-1">
        <h3 className="text-base font-semibold text-gray-900 group-hover:text-ocean-700 transition-colors">
          {ship.name}
        </h3>
        <p className="text-xs text-ocean-600 font-medium">{ship.ship_class}</p>
        <p className="text-sm text-gray-500 line-clamp-2 mt-1">{ship.description}</p>
        {ship.regions?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {ship.regions.slice(0, 3).map(r => (
              <span key={r} className="text-xs bg-ocean-50 text-ocean-700 border border-ocean-100 px-2 py-0.5 rounded-full">
                {r}
              </span>
            ))}
            {ship.regions.length > 3 && (
              <span className="text-xs text-gray-400">+{ship.regions.length - 3}</span>
            )}
          </div>
        )}
        <div className="flex gap-4 text-xs text-gray-400 mt-2 pt-2 border-t border-gray-50">
          <span>Built {ship.year_built}</span>
          <span>{ship.passenger_capacity?.toLocaleString()} guests</span>
          {ship.homeport && <span className="truncate">{ship.homeport}</span>}
        </div>
      </div>
    </Link>
  );
}
