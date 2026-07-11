import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Package, Search } from 'lucide-react';

export const Nav: React.FC = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const links = [
    { path: '/', label: 'Home' },
    { path: '/ship', label: 'Ship Now' },
    { path: '/track', label: 'Track Shipment' },
  ];

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return isActive
      ? 'text-hprh-clay border-b-2 border-hprh-clay font-bold'
      : 'text-hprh-pine/70 hover:text-hprh-sage hover:border-b-2 hover:border-hprh-sage/30';
  };

  const getMobileLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return isActive
      ? 'bg-hprh-pine/5 text-hprh-clay font-bold pl-3 border-l-4 border-hprh-clay'
      : 'text-hprh-pine/70 hover:text-hprh-sage hover:bg-hprh-pine/5 pl-3 border-l-4 border-transparent';
  };

  return (
    <nav className="bg-hprh-paper border-b border-hprh-pine/10 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-hprh-sage rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-hprh-paper" />
            </div>
            <Link to="/" className="flex flex-col group select-none">
              <span className="font-display text-xl font-bold text-hprh-pine tracking-wide group-hover:text-hprh-clay transition-colors">
                HPRH Transport
              </span>
              <span className="text-[10px] uppercase tracking-widest text-hprh-sage font-bold leading-none -mt-0.5">
                Shipping & Logistics
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {links.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs uppercase tracking-wider py-2 transition-all font-semibold ${getLinkClass(link.path)}`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/track"
              className="flex items-center gap-1.5 bg-hprh-clay text-hprh-paper text-[10px] uppercase tracking-widest px-3.5 py-2 rounded hover:bg-hprh-clay/90 transition-all font-bold"
            >
              <Search className="w-3.5 h-3.5" />
              Track
            </Link>
            <Link
              to="/admin/login"
              className="bg-hprh-pine text-hprh-paper text-[10px] uppercase tracking-widest px-3.5 py-1.5 rounded hover:bg-hprh-sage transition-all font-semibold"
            >
              Staff
            </Link>
          </div>

          {/* Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-hprh-pine/70 hover:text-hprh-pine p-1.5 border border-hprh-pine/15 rounded hover:bg-hprh-pine/5 focus:outline-none transition-colors"
              aria-label="Toggle navigation"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-hprh-pine/10 py-3 space-y-1.5 animate-in fade-in">
            <div className="flex flex-col gap-1">
              {links.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-xs uppercase tracking-wider py-2.5 rounded font-mono font-semibold transition-all ${getMobileLinkClass(link.path)}`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-hprh-pine/10 mt-1 flex flex-col gap-2">
                <Link
                  to="/admin/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-1.5 bg-hprh-pine text-hprh-paper text-xs uppercase tracking-wider py-2.5 rounded hover:bg-hprh-sage transition-all font-mono font-bold"
                >
                  Staff Portal
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Nav;
