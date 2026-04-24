import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getImageSrc } from '../imageProxy';

export default function TripCard({ trip }) {
  const [imgError, setImgError] = useState(false);
  const [priceData, setPriceData] = useState(null);
  const [priceLoading, setPriceLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/trips/${trip.cruiseLineId}/${trip.id}/price`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setPriceData(data); setPriceLoading(false); })
      .catch(() => setPriceLoading(false));
  }, [trip.id, trip.cruiseLineId]);

  const priceUrl = `https://www.celebritycruises.com/cruises?search=voyageCode:${trip.voyageCode}`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md hover:border-ocean-200 transition-all duration-200">
      <div className="h-40 bg-ocean-50 overflow-hidden relative">
        {trip.image && !imgError ? (
          <img
            src={getImageSrc(trip.image)}
            alt={trip.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ocean-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
        )}
        <div className="absolute top-2 left-2 bg-ocean-700 text-white text-xs font-bold px-2 py-1 rounded-lg">
          {trip.nights} nights
        </div>
        {trip.sailingCount > 1 && (
          <div className="absolute top-2 right-2 bg-white/90 text-ocean-700 text-xs font-semibold px-2 py-1 rounded-lg shadow-sm">
            {trip.sailingCount} dates
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="text-sm font-semibold text-gray-900 leading-tight">{trip.name}</h3>
        <p className="text-xs text-ocean-600 font-medium">{trip.ship}</p>

        <div className="flex flex-col gap-1 mt-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-ocean-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{trip.departurePort}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-ocean-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            </svg>
            <span className="truncate">{trip.destination}</span>
          </div>
        </div>

        {/* Price area */}
        <a
          href={priceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center justify-between bg-ocean-50 hover:bg-ocean-100 border border-ocean-100 rounded-xl px-3 py-2 transition-colors"
        >
          <span className="text-xs text-ocean-500 font-medium">Starting from</span>
          {priceLoading ? (
            <span className="text-xs text-ocean-300 animate-pulse">Loading…</span>
          ) : priceData?.price != null ? (
            <span className="flex items-baseline gap-1">
              <span className="text-base font-bold text-ocean-700">
                ${priceData.price.toLocaleString()}<span className="text-xs font-normal">/pp</span>
              </span>
              {priceData.estimated && (
                <span className="text-[10px] text-ocean-400 font-medium" title="Estimated price — click to see live prices">est.</span>
              )}
            </span>
          ) : (
            <span className="text-xs font-semibold text-ocean-600">See prices →</span>
          )}
        </a>

        <Link
          to={`/cruise-lines/${trip.cruiseLineId}/trips/${trip.voyageCode}`}
          className="mt-auto pt-1 block text-center text-xs font-semibold text-white bg-ocean-600 hover:bg-ocean-700 rounded-xl py-2 transition-colors"
        >
          {trip.sailingCount > 1 ? `See ${trip.sailingCount} Dates →` : 'View & Book →'}
        </Link>
      </div>
    </div>
  );
}
