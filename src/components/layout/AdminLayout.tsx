import React from 'react';
import AdminHeader from './AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => (
  <>
    <AdminHeader />
    <div className="min-h-screen bg-slate-50 py-8">
      {children}
    </div>
  </>
);

export default AdminLayout;
