import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PageShell from './components/layout/PageShell';
import RequireStaff from './components/layout/RequireStaff';
import AdminLayout from './components/layout/AdminLayout';

// Public Pages
import Home from './pages/public/Home';
import ShipmentForm from './pages/public/ShipmentForm';
import TrackingPage from './pages/public/TrackingPage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminShipmentDetail from './pages/admin/AdminShipmentDetail';
import AdminPricingSettings from './pages/admin/AdminPricingSettings';

function App() {
  return (
    <Router>
      <PageShell>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/ship" element={<ShipmentForm />} />
          <Route path="/track" element={<TrackingPage />} />
          <Route path="/track/:trackingNumber" element={<TrackingPage />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <RequireStaff>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </RequireStaff>
            }
          />
          <Route
            path="/admin/shipments/:id"
            element={
              <RequireStaff>
                <AdminLayout>
                  <AdminShipmentDetail />
                </AdminLayout>
              </RequireStaff>
            }
          />
          <Route
            path="/admin/pricing"
            element={
              <RequireStaff>
                <AdminLayout>
                  <AdminPricingSettings />
                </AdminLayout>
              </RequireStaff>
            }
          />
        </Routes>
      </PageShell>
    </Router>
  );
}

export default App;
