'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface User {
  username: string;
  name: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        Cookies.remove('token');
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
    setLoading(false);
  }, [router]);

  const isAdmin = () => {
    return user?.role?.toLowerCase() === 'admin';
  };

  const isStaff = () => {
    return user?.role?.toLowerCase() === 'staff';
  };

  const hasRole = (role: string) => {
    return user?.role?.toLowerCase() === role.toLowerCase();
  };

  const checkAdminAccess = () => {
    if (!user) return false;
    return isAdmin();
  };

  return {
    user,
    loading,
    isAdmin,
    isStaff,
    hasRole,
    checkAdminAccess,
  };
} 