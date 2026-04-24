import { useEffect, useState, useMemo } from 'react';
import CruiseLineCard from '../components/CruiseLineCard';

const SORT_OPTIONS = [
  { value: 'alphabetical', label: 'Alphabetical (A–Z)' },
  { value: 'price-asc',    label: 'Cheap to Expensive' },
  { value: 'price-desc',   label: 'Expensive to Cheap' },
  { value: 'ships-desc',   label: 'Most Ships' },
];

function sortCruiseLines(lines, sortBy) {
  const sorted = [...lines];
  switch (sortBy) {
    case 'alphabetical':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'price-asc':
      return sorted.sort((a, b) => (a.price_level ?? 0) - (b.price_level ?? 0));
    case 'price-desc':
      return sorted.sort((a, b) => (b.price_level ?? 0) - (a.price_level ?? 0));
    case 'ships-desc':
      return sorted.sort((a, b) => (b.fleet_size ?? 0) - (a.fleet_size ?? 0));
    default:
      return sorted;
  }
}

export default function Home() {
  const [cruiseLines, setCruiseLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('alphabetical');

  useEffect(() => {
    fetch('/api/cruise-lines')
      .then(r => {
        if (!r.ok) throw new Error('Failed to load cruise lines');
        return r.json();
      })
      .then(data => { setCruiseLines(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const sortedCruiseLines = useMemo(
    () => sortCruiseLines(cruiseLines, sortBy),
    [cruiseLines, sortBy]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cruise Lines</h1>
          <p className="text-gray-500 mt-2">Browse the world's leading cruise lines and explore their fleets.</p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-sm text-gray-500 whitespace-nowrap">Sort by</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-ocean-400 cursor-pointer"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-ocean-200 border-t-ocean-600 rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
          <p className="font-medium">Could not load cruise lines</p>
          <p className="text-sm mt-1">{error}</p>
          <p className="text-sm mt-3 text-red-500">Make sure the server is running: <code>cd server && npm run dev</code></p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCruiseLines.map(cl => (
            <CruiseLineCard key={cl.id} cruiseLine={cl} />
          ))}
        </div>
      )}
    </div>
  );
}
