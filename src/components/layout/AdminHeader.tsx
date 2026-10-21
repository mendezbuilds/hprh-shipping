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
      ? 'bg-slate-900 text-white font-semibold shadow-xs'
      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100 font-medium';
  };

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-20 z-40 shadow-xs select-none font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Bar */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-baseline tracking-tight">
              <span className="font-display font-extrabold text-sm sm:text-base text-slate-900">
                Rescue<span className="text-indigo-600">4paws</span> Transport Portal
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-indigo-700 font-bold bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
              RESTRICTED
            </span>
          </div>
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-600 hover:text-slate-900 p-1.5 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 focus:outline-none transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex flex-wrap items-center justify-between pb-3 gap-3 border-t border-slate-100 pt-3">
          <nav className="flex flex-wrap items-center gap-1.5">
            <Link
              to="/admin/dashboard"
              className={`inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full transition-all ${getLinkClass('/admin/dashboard')}`}
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
                  className={`inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full transition-all ${getLinkClass(item.path)}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 px-3.5 py-1.5 rounded-full transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log Out
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-100 py-3 space-y-1.5">
            <Link
              to="/admin/dashboard"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-2.5 text-xs px-4 py-2.5 rounded-xl transition-all ${getLinkClass('/admin/dashboard')}`}
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
                  className={`flex items-center gap-2.5 text-xs px-4 py-2.5 rounded-xl transition-all ${getLinkClass(item.path)}`}
                >
                  <Icon className="w-4 h-4" /> {item.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 py-2.5 rounded-xl transition-all"
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
