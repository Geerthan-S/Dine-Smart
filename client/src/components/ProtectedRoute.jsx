import { Navigate } from 'react-router-dom';
import { isAuthenticated, isAdmin, isOwnerOrAdmin } from '../services/auth';

// Wrap any route that requires login (and optionally admin/owner role)
export default function ProtectedRoute({ children, adminOnly = false, ownerOrAdmin = false }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  if (ownerOrAdmin && !isOwnerOrAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
