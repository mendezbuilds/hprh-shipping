import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { LogOut, LayoutDashboard, Package, Settings, Menu, X, Truck } from 'lucide-react';

export const AdminHeader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'All Shipments', icon: Package },
    { path: '/admin/pricing', label: 'Pricing Tiers', icon: Settings },
  ];

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path || (path !== '/admin/dashboard' && location.pathname.startsWith(path));
    return isActive
      ? 'bg-hprh-pine text-hprh-paper font-bold'
      : 'text-hprh-pine/70 hover:text-hprh-sage hover:bg-hprh-pine/5';
  };

  return (
    <header className="bg-hprh-paper-dark border-b border-hprh-pine/15 sticky top-20 z-40 shadow-sm select-none font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Bar */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-hprh-sage" />
            <span className="font-display font-black text-sm sm:text-base tracking-wider text-hprh-pine">
              Transport Admin Portal
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-hprh-clay font-bold bg-hprh-clay/10 border border-hprh-clay/20 px-2 py-0.5 rounded">
              RESTRICTED
            </span>
          </div>
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-hprh-pine/70 hover:text-hprh-pine p-1.5 border border-hprh-pine/15 rounded hover:bg-hprh-pine/5 focus:outline-none transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex flex-wrap items-center justify-between pb-3 gap-3 border-t border-hprh-pine/10 pt-3">
          <nav className="flex flex-wrap items-center gap-1.5">
            <Link
              to="/admin/dashboard"
              className={`inline-flex items-center gap-1.5 text-[10px] lg:text-xs font-mono font-semibold uppercase tracking-wider px-3 py-2 rounded transition-all ${getLinkClass('/admin/dashboard')}`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </Link>
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center gap-1.5 text-[10px] lg:text-xs font-mono font-semibold uppercase tracking-wider px-3 py-2 rounded transition-all ${getLinkClass(item.path)}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-[10px] lg:text-xs font-mono font-bold uppercase tracking-wider text-hprh-clay hover:bg-hprh-clay/10 border border-hprh-clay/25 px-3.5 py-2 rounded transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log Out
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-hprh-pine/15 py-3 space-y-1.5">
            <Link
              to="/admin/dashboard"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-2.5 text-xs font-mono font-semibold uppercase tracking-wider px-4 py-2.5 rounded transition-all ${getLinkClass('/admin/dashboard')}`}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-2.5 text-xs font-mono font-semibold uppercase tracking-wider px-4 py-2.5 rounded transition-all ${getLinkClass(item.path)}`}
                >
                  <Icon className="w-4 h-4" /> {item.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-hprh-pine/10">
              <button
                onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                className="w-full flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-hprh-clay hover:bg-hprh-clay/10 border border-hprh-clay/25 py-2.5 rounded transition-all"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
