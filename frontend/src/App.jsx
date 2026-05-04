import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Bell, X } from 'lucide-react';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Register from './pages/Register';
import RetailerDashboard from './pages/Retailer/Dashboard';
import FarmerDashboard from './pages/Farmer/Dashboard';
import Marketplace from './pages/Marketplace';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import AdminDashboard from './pages/Admin/Dashboard';
import TransactionVerification from './pages/Admin/TransactionVerification';
import UserVerification from './pages/Admin/UserVerification';
import ManageHarvests from './pages/Farmer/ManageHarvests';
import RetailerOrders from './pages/Retailer/Orders';
import OrderDetail from './pages/Retailer/OrderDetail';
import OrderTracking from './pages/Retailer/OrderTracking';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import { useToast } from './components/Toast';
import './index.css';

import FarmerOrders from './pages/Farmer/Orders';
import AdminOrders from './pages/Admin/Orders';

// Since Laravel is now serving the frontend directly, they share the exact same domain.
// Axios will naturally use the current domain, so no baseURL config is needed!
axios.defaults.baseURL = '';

function App() {
  const [user, setUser] = React.useState(() => {
    try {
      const saved = localStorage.getItem('agrichain_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      // Validate session — must have a real numeric id and a role
      if (!parsed?.id || !parsed?.role) {
        localStorage.removeItem('agrichain_user');
        return null;
      }
      return parsed;
    } catch {
      localStorage.removeItem('agrichain_user');
      return null;
    }
  });
  const [lastNotifId, setLastNotifId] = React.useState(0);

  const { showToast } = useToast();

  React.useEffect(() => {
    if (!user) return;

    const pollNotifications = async () => {
      try {
        const res = await axios.get(`/api/notifications?user_id=${user.id}`);
        const latest = res.data[0];
        if (latest && latest.id > lastNotifId) {
          setLastNotifId(latest.id);
          if (lastNotifId !== 0) {
            showToast(latest.message, 'success');
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    const interval = setInterval(pollNotifications, 10000);
    pollNotifications(); // Initial check
    return () => clearInterval(interval);
  }, [user, lastNotifId]);

  const handleLogin = (role = 'retailer', data = null) => {
    if (!data) return;
    const userData = {
      ...data,
      role: role || data.role,
      name: data.name || (role === 'admin' ? 'Admin' : 'User'),
    };
    console.log('Logging in user:', userData);
    setUser(userData);
    localStorage.setItem('agrichain_user', JSON.stringify(userData));
  };

  return (
    <Router>
      {!user ? (
        <div className="app-container">
          <div className="page-transition">
            <Routes>
              <Route path="/login" element={<Login onLogin={(role, data) => handleLogin(role, data)} />} />
              <Route path="/register" element={<Register onRegister={(role, data) => handleLogin(role, data)} />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </div>
        </div>
      ) : (
        <div className="app-shell">
          <main className="app-container">
            <div className="page-transition">
              <Routes>
                <Route path="/" element={
                  user.role === 'admin' ? <AdminDashboard user={user} /> : 
                  user.role === 'farmer' ? <FarmerDashboard user={user} /> : 
                  <RetailerDashboard user={user} />
                } />
                <Route path="/marketplace" element={<Marketplace user={user} />} />
                <Route path="/checkout" element={<Checkout user={user} />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/orders" element={
                  user.role === 'admin' ? <AdminOrders user={user} /> : 
                  user.role === 'farmer' ? <FarmerOrders user={user} /> : 
                  <RetailerOrders user={user} />
                } />
                <Route path="/orders/:id" element={<OrderDetail user={user} />} />
                <Route path="/orders/:id/track" element={<OrderTracking user={user} />} />
                <Route path="/notifications" element={<Notifications user={user} />} />
                <Route path="/farmer/manage" element={<ManageHarvests user={user} />} />
                <Route path="/admin/verify" element={<TransactionVerification user={user} />} />
                <Route path="/admin/users" element={<UserVerification user={user} />} />
                <Route path="/profile" element={<Profile user={user} onLogout={() => {
                  setUser(null);
                  localStorage.removeItem('agrichain_user');
                }} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </main>
          <Navigation role={user.role} />
        </div>
      )}
    </Router>
  );
}

export default App;
