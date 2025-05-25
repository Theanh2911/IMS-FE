'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

export function useLogout() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('token')}`,
        },
      });

      Cookies.remove('token', { path: '/' });
      localStorage.clear();
      sessionStorage.clear();

      if (response.ok) {
        toast.success('Logged out successfully');
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error during logout:', error);

      Cookies.remove('token', { path: '/' });
      localStorage.clear();
      sessionStorage.clear();
      toast.error('Error during logout, but you have been logged out locally');

      window.location.href = '/login';
    }
  };

  return { handleLogout };
} 