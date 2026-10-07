'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Gamepad2,
  Cpu,
  Server,
  Globe,
  Bot,
  DollarSign,
  Sparkles,
  Megaphone,
  Sliders,
  FileText,
  FileJson,
  ExternalLink,
  ShieldCheck,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  {
    category: 'Overview',
    items: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    category: 'Hosting Services',
    items: [
      { name: 'Game Servers', href: '/admin/games', icon: Gamepad2 },
      { name: 'VPS Hosting', href: '/admin/vps', icon: Cpu },
      { name: 'Dedicated Servers', href: '/admin/dedicated', icon: Server },
      { name: 'Web Hosting', href: '/admin/webhosting', icon: Globe },
      { name: 'Discord Bot Hosting', href: '/admin/discord', icon: Bot },
    ],
  },
  {
    category: 'Website & Content',
    items: [
      { name: 'Homepage Pricing', href: '/admin/pricing', icon: DollarSign },
      { name: 'Hero & Branding', href: '/admin/hero', icon: Sparkles },
      { name: 'Promo & Navigation', href: '/admin/navigation', icon: Megaphone },
      { name: 'UI & Currencies', href: '/admin/ui', icon: Sliders },
      { name: 'Legal & Policies', href: '/admin/legal', icon: FileText },
      { name: 'Raw JSON Editor', href: '/admin/raw', icon: FileJson },
    ],
  },
];

export default function AdminSidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0c0e14] border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-white/10 bg-[#090b10]">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                NOVA <span className="text-blue-400 font-semibold text-xs px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">ADMIN</span>
              </div>
              <div className="text-[11px] text-gray-400">Management Portal</div>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
          {navItems.map((group, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                {group.category}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-200'
                      }`}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer info & live site link */}
        <div className="p-4 border-t border-white/10 bg-[#090b10] space-y-2">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-gray-300 bg-white/5 hover:bg-blue-600/20 hover:text-blue-300 border border-white/5 hover:border-blue-500/30 transition-all"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              View Public Website
            </span>
            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Live</span>
          </Link>
        </div>
      </aside>
    </>
  );
}

