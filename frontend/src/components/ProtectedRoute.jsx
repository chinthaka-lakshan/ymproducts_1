// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ProtectedRoute = ({ allowedRoles }) => {
  const { auth, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Show loading state
  }

  if (!auth) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;