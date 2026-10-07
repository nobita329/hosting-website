'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Gamepad2,
  Cpu,
  Server,
  Globe,
  Bot,
  DollarSign,
  Megaphone,
  Sliders,
  FileJson,
  ArrowRight,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Layers,
  ShieldCheck,
} from 'lucide-react';

interface AdminStats {
  totalGames: number;
  featuredGames: number;
  totalVpsPlans: number;
  totalDedicatedPlans: number;
  totalWebhostingPlans: number;
  totalDiscordPlans: number;
  totalPricingTiers: number;
  totalCurrencies: number;
  bannerActive: boolean;
  bannerText: string;
  couponCode: string;
  brandName: string;
  brandAccent: string;
  snowfallEnabled: boolean;
  loadingScreenEnabled: boolean;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Game Servers',
      value: stats?.totalGames ?? '...',
      subtext: `${stats?.featuredGames ?? 0} featured on site`,
      icon: Gamepad2,
      color: 'from-emerald-500/20 to-emerald-500/5',
      borderColor: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
      href: '/admin/games',
    },
    {
      title: 'VPS Hosting Plans',
      value: stats?.totalVpsPlans ?? '...',
      subtext: 'AMD Ryzen 7 & 9 tiers',
      icon: Cpu,
      color: 'from-blue-500/20 to-blue-500/5',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
      href: '/admin/vps',
    },
    {
      title: 'Dedicated Servers',
      value: stats?.totalDedicatedPlans ?? '...',
      subtext: 'Bare-metal & VDS nodes',
      icon: Server,
      color: 'from-purple-500/20 to-purple-500/5',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400',
      href: '/admin/dedicated',
    },
    {
      title: 'Web Hosting Tiers',
      value: stats?.totalWebhostingPlans ?? '...',
      subtext: 'Shared & Business plans',
      icon: Globe,
      color: 'from-cyan-500/20 to-cyan-500/5',
      borderColor: 'border-cyan-500/30',
      iconColor: 'text-cyan-400',
      href: '/admin/webhosting',
    },
    {
      title: 'Discord Bot Plans',
      value: stats?.totalDiscordPlans ?? '...',
      subtext: 'NodeJS & Python app bots',
      icon: Bot,
      color: 'from-indigo-500/20 to-indigo-500/5',
      borderColor: 'border-indigo-500/30',
      iconColor: 'text-indigo-400',
      href: '/admin/discord',
    },
    {
      title: 'Currencies Supported',
      value: stats?.totalCurrencies ?? '...',
      subtext: 'Multi-currency auto conversion',
      icon: DollarSign,
      color: 'from-amber-500/20 to-amber-500/5',
      borderColor: 'border-amber-500/30',
      iconColor: 'text-amber-400',
      href: '/admin/ui',
    },
  ];

  const quickLinks = [
    {
      title: 'Game Servers Manager',
      desc: 'Add new games, adjust pricing, RAM & CPU options',
      icon: Gamepad2,
      href: '/admin/games',
      badge: 'Popular',
    },
    {
      title: 'VPS Plans Manager',
      desc: 'Edit cores, RAM, SSD storage, pricing & order URLs',
      icon: Cpu,
      href: '/admin/vps',
      badge: 'Active',
    },
    {
      title: 'Promo Announcement',
      desc: 'Update top promo banner text, coupon code & status',
      icon: Megaphone,
      href: '/admin/navigation',
      badge: stats?.bannerActive ? 'Banner Active' : 'Banner Off',
    },
    {
      title: 'Homepage Pricing Cards',
      desc: 'Edit the 3 featured cards shown on the landing page',
      icon: DollarSign,
      href: '/admin/pricing',
    },
    {
      title: 'Branding & Hero Section',
      desc: 'Manage site brand name, navbar logo & sponsor badges',
      icon: Sparkles,
      href: '/admin/hero',
    },
    {
      title: 'Raw Config & Backup',
      desc: 'Direct JSON editor with syntax check and instant backup',
      icon: FileJson,
      href: '/admin/raw',
      badge: 'Advanced',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/30 via-[#101424] to-[#0d101d] border border-blue-500/20 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Management Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, Administrator
            </h1>
            <p className="text-sm text-gray-300 mt-2 max-w-2xl leading-relaxed">
              Manage your hosting platform in real-time. Configure game servers, VPS tiers,
              currencies, promotions, and visual settings from this unified console.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-gray-300 hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Stats</span>
            </button>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Promo announcement ticker preview */}
        {stats?.bannerActive && (
          <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-gray-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-gray-400">Live Promo:</span>
              <span className="font-semibold text-white">{stats.bannerText}</span>
              {stats.couponCode && (
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[11px] border border-blue-500/30">
                  CODE: {stats.couponCode}
                </span>
              )}
            </div>
            <Link
              href="/admin/navigation"
              className="text-blue-400 hover:text-blue-300 text-xs font-medium shrink-0 flex items-center gap-1"
            >
              Edit banner <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white tracking-wide">Hosting Portfolio Overview</h2>
          <span className="text-xs text-gray-400">Auto-synced from configuration files</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Link
                key={idx}
                href={card.href}
                className={`relative overflow-hidden rounded-2xl bg-[#0e121c] border ${card.borderColor} p-5 hover:border-blue-400/50 transition-all duration-300 group hover:-translate-y-0.5 shadow-lg`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-40 group-hover:opacity-70 transition-opacity`}
                />
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <span className="text-xs font-medium text-gray-400 group-hover:text-gray-300 transition-colors">
                      {card.title}
                    </span>
                    <div className="text-3xl font-extrabold text-white mt-1">
                      {card.value}
                    </div>
                    <div className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
                      <span>{card.subtext}</span>
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${card.iconColor} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Action Portals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white tracking-wide">Quick Management Actions</h2>
          <span className="text-xs text-gray-400">Click any card to modify its settings</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link
                key={idx}
                href={action.href}
                className="flex flex-col justify-between p-5 rounded-2xl bg-[#0e121c] border border-white/10 hover:border-blue-500/40 hover:bg-[#111726] transition-all duration-200 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    {action.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 border border-white/10 text-gray-300">
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                    {action.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-blue-400 font-medium group-hover:text-blue-300">
                  <span>Manage section</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* System Status info */}
      <div className="rounded-2xl bg-[#0e121c] border border-white/10 p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-bold text-white">System & Storage Status</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
            <div className="text-gray-400">Configuration Format</div>
            <div className="text-white font-semibold mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Direct JSON File Storage
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
            <div className="text-gray-400">Security Layer</div>
            <div className="text-white font-semibold mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              HMAC-SHA256 Cookie Token
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
            <div className="text-gray-400">Live Website Target</div>
            <div className="text-white font-semibold mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              All 12 Configuration Sections
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

