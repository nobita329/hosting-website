'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from './components/AdminSidebar';
import AdminNavbar from './components/AdminNavbar';
import { ToastProvider } from './components/Toast';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<string>('admin');

  useEffect(() => {
    if (isLoginPage) {
      setIsAuthenticated(true);
      return;
    }

    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/auth');
        const data = await res.json();
        if (isMounted) {
          if (data.authenticated) {
            setIsAuthenticated(true);
            if (data.user) setCurrentUser(data.user);
          } else {
            setIsAuthenticated(false);
            router.push('/admin/login');
          }
        }
      } catch {
        if (isMounted) {
          setIsAuthenticated(false);
          router.push('/admin/login');
        }
      }
    }

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [pathname, isLoginPage, router]);

  // If on login page, wrap with ToastProvider and render directly
  if (isLoginPage) {
    return (
      <ToastProvider>
        <div className="min-h-screen bg-[#07090e] text-white">
          {children}
        </div>
      </ToastProvider>
    );
  }

  // Show loading indicator while verifying authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div className="text-sm text-gray-400 font-medium">Verifying admin credentials...</div>
        </div>
      </div>
    );
  }

  // If not authenticated (redirect in progress)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center text-white">
        <div className="flex items-center gap-3 text-gray-400 text-sm">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <span>Redirecting to admin login...</span>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#07090e] text-gray-100 flex">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
          <AdminNavbar
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            currentUser={currentUser}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}

