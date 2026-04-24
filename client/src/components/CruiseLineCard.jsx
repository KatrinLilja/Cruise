import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getImageSrc } from '../imageProxy';

function PriceIcons({ level }) {
  const icons = [];
  for (let i = 0; i < 5; i++) {
    icons.push(
      <span key={i} style={{ opacity: i < level ? 1 : 0.2 }}>💰</span>
    );
  }
  return <span className="inline-flex items-center gap-0.5">{icons}</span>;
}

export default function CruiseLineCard({ cruiseLine }) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      to={`/cruise-lines/${cruiseLine.id}`}
      className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-ocean-200 transition-all duration-200 flex flex-col"
    >
      <div className="h-44 bg-ocean-50 overflow-hidden relative">
        {cruiseLine.image && !imgError ? (
          <img
            src={getImageSrc(cruiseLine.image)}
            alt={cruiseLine.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4">
            <img
              src={cruiseLine.logo}
              alt={`${cruiseLine.name} logo`}
              className="max-h-20 max-w-full object-contain"
              onError={e => { e.target.style.display = 'none'; }}
            />
          </div>
        )}
        {cruiseLine.image && !imgError && cruiseLine.logo && (
          <div className="absolute bottom-2 left-2 bg-white/80 backdrop-blur-sm rounded-lg px-2 py-1">
            <img
              src={cruiseLine.logo}
              alt={`${cruiseLine.name} logo`}
              className="h-6 max-w-[80px] object-contain"
              onError={e => { e.target.parentElement.style.display = 'none'; }}
            />
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col gap-2 flex-1">
        <h2 className="text-lg font-semibold text-gray-900 group-hover:text-ocean-700 transition-colors">
          {cruiseLine.name}
        </h2>
        <p className="text-sm text-gray-500 line-clamp-3 flex-1">{cruiseLine.description}</p>
        <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-50">
          <span>Founded {cruiseLine.founded}</span>
          {cruiseLine.price_level ? <PriceIcons level={cruiseLine.price_level} /> : null}
          <span>{cruiseLine.fleet_size} ships</span>
        </div>
      </div>
    </Link>
  );
}

