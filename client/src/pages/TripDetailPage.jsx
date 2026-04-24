import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getImageSrc } from '../imageProxy';

function formatDate(isoDate) {
  if (!isoDate) return null;
  const d = new Date(isoDate + 'T12:00:00Z');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TripDetailPage() {
  const { id: cruiseLineId, voyageCode } = useParams();
  const [allTrips, setAllTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  // Map of voyageCode → { price, departureDate, estimated, fetching }
  const [sailingDetails, setSailingDetails] = useState({});

  useEffect(() => {
    setLoading(true);
    fetch(`/api/trips/${cruiseLineId}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => { setAllTrips(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [cruiseLineId, voyageCode]);

  // Find the representative trip and all sibling sailings
  const { representative, sailings } = useMemo(() => {
    const rep = allTrips.find(t => t.voyageCode === voyageCode);
    if (!rep) return { representative: null, sailings: [] };
    const siblings = allTrips
      .filter(t =>
        t.nights === rep.nights &&
        t.destination === rep.destination &&
        t.ship === rep.ship &&
        t.departurePort === rep.departurePort
      )
      .sort((a, b) => {
        // Sort by cached departureDate if available, otherwise by voyageCode
        if (a.departureDate && b.departureDate) return a.departureDate.localeCompare(b.departureDate);
        return a.voyageCode.localeCompare(b.voyageCode);
      });
    return { representative: rep, sailings: siblings };
  }, [allTrips, voyageCode]);

  // Fetch price+date for each sailing individually, staggered to avoid rate limiting
  useEffect(() => {
    if (!sailings.length) return;
    sailings.forEach((sailing, index) => {
      setSailingDetails(prev => {
        if (prev[sailing.voyageCode]) return prev; // already fetched/fetching
        return { ...prev, [sailing.voyageCode]: { fetching: true } };
      });
      setTimeout(() => {
        fetch(`/api/trips/${cruiseLineId}/${sailing.voyageCode}/price`)
          .then(r => r.ok ? r.json() : null)
          .then(data => {
            if (data) setSailingDetails(prev => ({ ...prev, [sailing.voyageCode]: { ...data, fetching: false } }));
          })
          .catch(() => {});
      }, index * 400); // 400ms between each request to avoid rate limiting
    });
  }, [sailings, cruiseLineId]);

  // Sort and deduplicate sailings by departure date once details are loaded
  const sortedSailings = useMemo(() => {
    const sorted = [...sailings].sort((a, b) => {
      const da = sailingDetails[a.voyageCode]?.departureDate;
      const db = sailingDetails[b.voyageCode]?.departureDate;
      if (da && db) return da.localeCompare(db);
      if (da) return -1;
      if (db) return 1;
      return a.voyageCode.localeCompare(b.voyageCode);
    });
    // Deduplicate: keep only the first sailing per unique departure date
    const seenDates = new Set();
    return sorted.filter(sailing => {
      const date = sailingDetails[sailing.voyageCode]?.departureDate;
      if (!date) return true; // keep rows still loading or with no date
      if (seenDates.has(date)) return false;
      seenDates.add(date);
      return true;
    });
  }, [sailings, sailingDetails]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-ocean-200 border-t-ocean-600 rounded-full animate-spin" />
    </div>
  );

  if (!representative) return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <p className="text-gray-400">Trip not found.</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link
        to={`/cruise-lines/${cruiseLineId}`}
        className="inline-flex items-center gap-1 text-sm text-ocean-600 hover:text-ocean-800 mb-6 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to {cruiseLineId.charAt(0).toUpperCase() + cruiseLineId.slice(1)} Cruises
      </Link>

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden mb-8 h-64 bg-ocean-100">
        {representative.image && (
          <img
            src={getImageSrc(representative.image)}
            alt={representative.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <h1 className="text-2xl font-bold drop-shadow">{representative.name}</h1>
          <p className="text-white/80 mt-1">{representative.ship}</p>
        </div>
        <div className="absolute top-4 left-4 bg-ocean-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
          {representative.nights} nights
        </div>
      </div>

      {/* Info row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <InfoCard icon="🚢" label="Ship" value={representative.ship} />
        <InfoCard icon="📍" label="Departs from" value={representative.departurePort} />
        <InfoCard icon="🌍" label="Destination" value={representative.destination} />
      </div>

      {/* Sailings */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        {sortedSailings.length} Available {sortedSailings.length === 1 ? 'Sailing' : 'Sailings'}
      </h2>

      <div className="flex flex-col gap-3">
        {sortedSailings.map((sailing) => {
          const details = sailingDetails[sailing.voyageCode];
          const dateLabel = details?.departureDate ? formatDate(details.departureDate) : null;
          return (
            <div
              key={sailing.voyageCode}
              className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm hover:border-ocean-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-ocean-50 flex items-center justify-center shrink-0">
                  <span className="text-lg">📅</span>
                </div>
                <div>
                  {dateLabel ? (
                    <p className="font-semibold text-gray-900">{dateLabel}</p>
                  ) : (
                    <p className="font-semibold text-gray-400 italic text-sm">
                      {details?.fetching ? 'Loading date…' : 'Date unavailable'}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">{representative.nights} nights · {representative.destination}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {details?.price != null ? (
                  <div className="text-right">
                    <p className="text-xs text-gray-400 leading-none">from</p>
                    <p className="text-base font-bold text-ocean-700 leading-tight">
                      ${details.price.toLocaleString()}
                      <span className="text-xs font-normal text-gray-400">/pp</span>
                    </p>
                    {details.estimated && (
                      <p className="text-[10px] text-gray-400">est.</p>
                    )}
                  </div>
                ) : details?.fetching ? (
                  <div className="w-16 h-8 bg-gray-100 rounded animate-pulse" />
                ) : null}
                <a
                  href={sailing.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-white bg-ocean-600 hover:bg-ocean-700 rounded-xl px-4 py-2 transition-colors shrink-0"
                >
                  Book →
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="bg-ocean-50 rounded-xl p-4 text-center">
      <div className="text-xl mb-1">{icon}</div>
      <p className="text-xs text-ocean-500 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-sm font-semibold text-gray-900 mt-0.5 leading-tight">{value}</p>
    </div>
  );
}
