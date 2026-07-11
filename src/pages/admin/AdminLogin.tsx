import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Package, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-hprh-pine flex items-center justify-center p-4"
      style={{ backgroundImage: 'radial-gradient(#FBF7EE08 1px, transparent 0)', backgroundSize: '20px 20px' }}>

      <div className="w-full max-w-md space-y-8">

        {/* Brand */}
        <div className="text-center">
          <div className="w-16 h-16 bg-hprh-sage rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-9 h-9 text-white" />
          </div>
          <h1 className="font-display text-3xl font-extrabold text-hprh-paper">Staff Portal</h1>
          <p className="text-xs text-hprh-paper/50 font-mono uppercase tracking-widest mt-1">HPRH Transport — Restricted Access</p>
        </div>

        {/* Form card */}
        <div className="bg-hprh-paper rounded-2xl p-8 shadow-2xl space-y-5">
          {error && (
            <div className="bg-hprh-clay/10 border border-hprh-clay/20 rounded p-4 flex items-start gap-3 text-xs">
              <AlertCircle className="w-4 h-4 text-hprh-clay flex-shrink-0 mt-0.5" />
              <p className="text-hprh-pine">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-hprh-pine/70 font-bold">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-hprh-paper-dark border-2 border-hprh-pine/15 focus:border-hprh-sage focus:ring-1 focus:ring-hprh-sage/20 rounded py-2.5 px-4 text-sm text-hprh-pine outline-none transition-all"
                placeholder="staff@happypawsrescue.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-hprh-pine/70 font-bold">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full bg-hprh-paper-dark border-2 border-hprh-pine/15 focus:border-hprh-sage focus:ring-1 focus:ring-hprh-sage/20 rounded py-2.5 px-4 pr-10 text-sm text-hprh-pine outline-none transition-all"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-hprh-pine/40 hover:text-hprh-pine">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-hprh-pine text-hprh-paper font-mono font-bold text-sm uppercase tracking-wider py-3 rounded hover:bg-hprh-sage transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : 'Sign In to Portal'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
