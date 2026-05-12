import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Restaurants from './pages/Restaurants';
import RestaurantDetail from './pages/RestaurantDetail';
import AiChat from './pages/AiChat';
import Booking from './pages/Booking';
import BookingConfirmation from './pages/BookingConfirmation';
import MyBookings from './pages/MyBookings';
import Favorites from './pages/Favorites';
import MenuExplorer from './pages/MenuExplorer';
import EveningPlanner from './pages/EveningPlanner';
import AdminPanel from './pages/AdminPanel';
import RestaurantOwnerDashboard from './pages/RestaurantOwnerDashboard';
import CheckinPage from './pages/CheckinPage';

export default function App() {
  useEffect(() => {
    const root = document.documentElement;
    const savedTheme = localStorage.getItem('theme');
    const prefersLight = window.matchMedia?.('(prefers-color-scheme: light)').matches;
    const theme = savedTheme || (prefersLight ? 'light' : 'dark');
    root.classList.toggle('theme-light', theme === 'light');
    root.classList.toggle('theme-dark', theme !== 'light');
    root.classList.add('theme-gold');
    root.style.colorScheme = theme === 'light' ? 'light' : 'dark';
  }, []);

  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <div className="app-background" aria-hidden="true">
        <span className="ambient-orb ambient-orb-one" />
        <span className="ambient-orb ambient-orb-two" />
        <span className="ambient-orb ambient-orb-three" />
      </div>
      <Navbar />
      <main className="page-enter relative z-10">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* Public QR check-in — no auth required */}
          <Route path="/checkin/:token" element={<CheckinPage />} />

          {/* Protected user routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/restaurants" element={<ProtectedRoute><Restaurants /></ProtectedRoute>} />
          <Route path="/restaurants/:id" element={<ProtectedRoute><RestaurantDetail /></ProtectedRoute>} />
          <Route path="/ai-chat" element={<ProtectedRoute><AiChat /></ProtectedRoute>} />
          <Route path="/booking/:restaurantId" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
          <Route path="/booking-confirmation/:bookingId" element={<ProtectedRoute><BookingConfirmation /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
          <Route path="/menu-explorer" element={<ProtectedRoute><MenuExplorer /></ProtectedRoute>} />
          <Route path="/evening-planner" element={<ProtectedRoute><EveningPlanner /></ProtectedRoute>} />

          {/* Owner dashboard — accessible by owners and admins */}
          <Route path="/owner/dashboard/:restaurantId" element={<ProtectedRoute><RestaurantOwnerDashboard /></ProtectedRoute>} />

          {/* Admin-only route */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
