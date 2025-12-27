import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  if (typeof window === 'undefined') return <Navigate to="/" replace />;

  const raw = localStorage.getItem('admin');
  if (!raw) return <Navigate to="/" replace />;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.isAdmin) return <Navigate to="/" replace />;
  } catch {
    localStorage.removeItem('admin');
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;