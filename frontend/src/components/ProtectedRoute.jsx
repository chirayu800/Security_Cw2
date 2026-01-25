import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = ['user'], redirectTo = '/login' }) => {
  // Get user from localStorage
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let user = null;

  try {
    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
  }

  // Check if user is authenticated
  if (!token || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check if user has required role
  const userRole = user.role || 'user';
  
  if (!allowedRoles.includes(userRole)) {
    // Redirect based on role
    if (userRole === 'admin') {
      // Admin should access admin panel, not frontend
      window.location.href = '/admin';
      return null;
    }
    // For other unauthorized roles, redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
