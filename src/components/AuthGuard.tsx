'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation'; // Import usePathname
import type { ReactNode} from 'react';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname

  useEffect(() => {
    // Only redirect if not loading, no user, and not already on a public auth page or submission page
    if (
      !loading &&
      !user &&
      pathname !== '/login' &&
      pathname !== '/register' &&
      !pathname.startsWith('/submission/') // Allow access to /submission/* routes
    ) {
      router.push('/login');
    }
  }, [user, loading, router, pathname]); // Add pathname to dependencies

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Skeleton className="h-12 w-12 rounded-full mb-4" />
        <Skeleton className="h-4 w-[250px] mb-2" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    );
  }

  // If user exists, or if on a public auth/submission page, render children
  if (user || pathname === '/login' || pathname === '/register' || pathname.startsWith('/submission/')) {
     return <>{children}</>;
  }
  
  // If no user, not loading, and on a protected path (not caught by above),
  // the useEffect will handle the redirect. Return null to prevent rendering children.
  return null;
}
