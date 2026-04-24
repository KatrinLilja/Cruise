import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CruiseLinePage from './pages/CruiseLinePage';
import ShipPage from './pages/ShipPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cruise-lines/:id" element={<CruiseLinePage />} />
            <Route path="/ships/:id" element={<ShipPage />} />
          </Routes>
        </main>
        <footer className="bg-ocean-900 text-ocean-200 text-center py-4 text-sm">
          &copy; {new Date().getFullYear()} Cruises &mdash; Explore the world's finest cruise lines
        </footer>
      </div>
    </BrowserRouter>
  );
}
