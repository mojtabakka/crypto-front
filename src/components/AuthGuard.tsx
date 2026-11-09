import { useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface AuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

export function AuthGuard({ children, redirectTo = '/login' }: AuthGuardProps) {
  const { user, token, isLoading, checkSession, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (token && user) {
      // Already authenticated
    } else if (token) {
      checkSession().catch(() => logout());
    }
  }, [token, user, checkSession, logout]);

  // While checking session, show loading
  if (isLoading || !mounted) {
    return null;
  }

  if (!user || !token) {
    toast.error('Please log in to access this page');
    window.location.href = redirectTo;
    return null;
  }

  return <>{children}</>;
}

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: ('admin' | 'user')[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user } = useAuth();

  if (!user) {
    window.location.href = '/login';
    return null;
  }

  if (!allowedRoles.includes(user.role)) {
    toast.error('Admin access required');
    window.location.href = '/';
    return null;
  }

  return <>{children}</>;
}
