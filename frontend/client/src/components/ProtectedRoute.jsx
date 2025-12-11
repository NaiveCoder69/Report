// ProtectedRoute.jsx
import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { user, role } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" />; // or another suitable page
  }

  return children;
}
