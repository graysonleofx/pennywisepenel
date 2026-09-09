import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase.js';

const ProtectedRoute = ({ children }) => {
  const [authReady, setAuthReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);

  useEffect(() => onAuthStateChanged(auth, (user) => {
    setFirebaseUser(user);
    setAuthReady(true);
  }), []);

  if (typeof window === 'undefined' || !authReady) {
    return <div className="min-h-screen bg-background" />;
  }

  const raw = localStorage.getItem('admin');
  if (!raw || !firebaseUser) return <Navigate to="/" replace />;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.isAdmin || parsed.uid !== firebaseUser.uid) return <Navigate to="/" replace />;
  } catch {
    localStorage.removeItem('admin');
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;