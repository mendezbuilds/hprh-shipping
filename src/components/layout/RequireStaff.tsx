import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';

interface RequireStaffProps {
  children: React.ReactNode;
}

const RequireStaff: React.FC<RequireStaffProps> = ({ children }) => {
  const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setStatus('unauthorized'); return; }

      const { data } = await supabase
        .from('staff')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      setStatus(data ? 'authorized' : 'unauthorized');
    };
    check();
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hprh-paper">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-hprh-sage animate-spin mx-auto" />
          <p className="text-xs font-mono uppercase tracking-widest text-hprh-pine/50">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthorized') {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default RequireStaff;
