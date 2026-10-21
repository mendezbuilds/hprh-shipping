import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { PawPrint, Loader2, Eye, EyeOff, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });
      if (authErr) throw authErr;

      // Verify staff membership
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication failed.');

      const { data: staffRow } = await supabase
        .from('staff')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!staffRow) {
        await supabase.auth.signOut();
        throw new Error('Access denied. You are not registered as staff.');
      }

      navigate('/admin/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">

        {/* Back link */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Transport Home
          </Link>
        </div>

        {/* Brand */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 mx-auto mb-4">
            <PawPrint className="w-7 h-7 text-white" />
          </div>
          <div className="flex items-baseline justify-center tracking-tight">
            <span className="font-display text-3xl font-extrabold text-white leading-tight">
              Rescue
            </span>
            <span className="font-display text-3xl font-black bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent leading-tight ml-1">
              4paws
            </span>
          </div>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mt-1">
            Transport Staff Portal
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-200/80 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">Staff Authentication</h2>
              <p className="text-xs text-slate-500">Sign in to manage shipments & tracking</p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200/60">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Restricted</span>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-4 flex items-start gap-3 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400"
                placeholder="staff@rescue4paws.org"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-sm py-3 rounded-full transition-all duration-200 shadow-md shadow-indigo-500/25 hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                'Sign In to Portal'
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-400">
            Authorized personnel only. All access is logged and verified.
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
