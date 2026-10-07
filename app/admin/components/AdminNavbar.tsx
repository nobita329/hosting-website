'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, LogOut, User, ExternalLink, ShieldCheck } from 'lucide-react';
import { useToast } from './Toast';

interface AdminNavbarProps {
  onToggleSidebar: () => void;
  currentUser?: string;
}

export default function AdminNavbar({ onToggleSidebar, currentUser = 'admin' }: AdminNavbarProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      toast('Logged out successfully', 'info');
      router.push('/admin/login');
      router.refresh();
    } catch {
      toast('Failed to log out', 'error');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0c0e14]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
          <span className="flex items-center gap-1.5 font-medium text-gray-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Nova Admin System
          </span>
          <span>•</span>
          <span className="text-gray-400">v1.0.0</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
          <span>Public Website</span>
        </a>

        {/* User profile info & logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-blue-950/40 border border-blue-500/20 text-xs text-blue-200">
            <div className="w-5 h-5 rounded-full bg-blue-600/30 flex items-center justify-center text-blue-400">
              <User className="w-3 h-3" />
            </div>
            <span className="font-medium hidden sm:inline">{currentUser}</span>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors disabled:opacity-50"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

