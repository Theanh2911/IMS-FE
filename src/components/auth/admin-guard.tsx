'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdminGuard({ children, fallback }: AdminGuardProps) {
  const { user, loading, isAdmin, isStaff } = useAuth();
  const [showUnauthorizedDialog, setShowUnauthorizedDialog] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (!loading && user && !hasChecked) {
      setHasChecked(true);
      console.log('AdminGuard: Checking user access', { 
        username: user.username, 
        role: user.role, 
        isAdmin: isAdmin(), 
        isStaff: isStaff() 
      });
      // Only show dialog for staff users trying to access admin-only content
      if (isStaff() && !isAdmin()) {
        console.log('AdminGuard: Staff user detected, showing unauthorized dialog');
        setShowUnauthorizedDialog(true);
      }
    }
  }, [user, loading, isAdmin, isStaff, hasChecked]);

  const handleUnauthorizedClose = () => {
    setShowUnauthorizedDialog(false);
    // Redirect to dashboard instead of personal
    window.location.href = '/dashboard';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return fallback || <div>Access denied</div>;
  }

  // Show unauthorized dialog for staff users trying to access admin-only content
  if (isStaff() && !isAdmin()) {
    return (
      <>
        {fallback || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Restricted</h1>
              <p className="text-gray-600">User management is restricted to administrators only.</p>
            </div>
          </div>
        )}
        <AlertDialog open={showUnauthorizedDialog} onOpenChange={setShowUnauthorizedDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Access Denied</AlertDialogTitle>
              <AlertDialogDescription>
                You are not authorized to access user management. Only administrators can manage users.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={handleUnauthorizedClose}>
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Allow access for admin users
  if (isAdmin()) {
    return <>{children}</>;
  }

  // Fallback for other cases
  return fallback || <div>Access denied</div>;
} 