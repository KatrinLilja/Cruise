import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <header className="bg-white border-b border-ocean-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-ocean-700 hover:text-ocean-900 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18l9-14 9 14H3z" opacity="0.15" />
            <path fillRule="evenodd" d="M12 2a1 1 0 01.894.553l9 14A1 1 0 0121 18H3a1 1 0 01-.894-1.447l9-14A1 1 0 0112 2zm0 3.118L5.118 16h13.764L12 5.118z" clipRule="evenodd" />
          </svg>
          <span className="text-xl font-bold tracking-tight">Cruises</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link
            to="/"
            className={`transition-colors ${pathname === '/' ? 'text-ocean-600 border-b-2 border-ocean-500 pb-0.5' : 'text-gray-500 hover:text-ocean-600'}`}
          >
            Cruise Lines
          </Link>
        </nav>
      </div>
    </header>
  );
}
