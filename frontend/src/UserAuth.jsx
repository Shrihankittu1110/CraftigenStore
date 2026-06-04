import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { isAdminUser } from './auth';

const UserAuth = ({ children, requireAdmin = false }) => {
  const location = useLocation();
  const currentUser = JSON.parse(sessionStorage.getItem('user') || 'null');
  const allowed = currentUser && (!requireAdmin || isAdminUser(currentUser));

  useEffect(() => {
    if (!currentUser) {
      Swal.fire({
        icon: 'info',
        title: 'Login required',
        text: 'Please login to continue.',
      });
    } else if (requireAdmin && !isAdminUser(currentUser)) {
      Swal.fire({
        icon: 'warning',
        title: 'Admin only',
        text: 'Only an admin can add or manage products.',
      });
    }
  }, [currentUser, requireAdmin]);

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowed) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default UserAuth;
