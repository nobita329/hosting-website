'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Save,
  RefreshCw,
  ExternalLink,
  Compass,
  Check,
  X,
} from 'lucide-react';
import { useToast } from '../components/Toast';

interface NavConfig {
  banner: {
    show: boolean;
    text: string;
    couponCode: string;
    useThemeColor: boolean;
    backgroundColor: string;
    fallbackColor: string;
  };
  clientSpace: {
    name: string;
    href: string;
    icon: string;
  };
  socialLinks: {
    name: string;
    href: string;
    icon: string;
  }[];
  mainNavigation: any[];
}

export default function NavigationAdminPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<NavConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/config/navigation');
      const data = await res.json();
      if (data.success && data.data) {
        setConfig(data.data);
      }
    } catch {
      toast('Failed to load navigation configuration', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSaveAll = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/config/navigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast('Navigation & promo settings saved successfully!', 'success');
      } else {
        toast(data.error || 'Failed to save', 'error');
      }
    } catch {
      toast('Error saving navigation settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-gray-400 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
          <span>Loading navigation config...</span>
        </div>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
            <Megaphone className="w-4 h-4" />
            <span>Site Alerts & Links</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Promo Banner & Navigation Links
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Toggle the top promo banner, update coupon codes, Client Space portal URL, and Discord links.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchConfig}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-300 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload</span>
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Top Promo Banner Settings */}
      <div className="p-5 rounded-2xl bg-[#0e121c] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Top Announcement & Promo Banner</h2>
            <p className="text-xs text-gray-400">Notice bar placed at the very top of every public page</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.banner.show}
              onChange={(e) =>
                setConfig({
                  ...config,
                  banner: { ...config.banner, show: e.target.checked },
                })
              }
              className="rounded border-white/10 bg-[#141824] text-blue-600 w-4 h-4"
            />
            <span className="text-xs font-semibold text-white">
              {config.banner.show ? 'Banner Active' : 'Banner Disabled'}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div className="sm:col-span-2">
            <label className="block text-gray-400 mb-1">Banner Announcement Text</label>
            <input
              type="text"
              value={config.banner.text}
              onChange={(e) =>
                setConfig({
                  ...config,
                  banner: { ...config.banner, text: e.target.value },
                })
              }
              className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Promo Coupon Code</label>
            <input
              type="text"
              value={config.banner.couponCode}
              onChange={(e) =>
                setConfig({
                  ...config,
                  banner: { ...config.banner, couponCode: e.target.value },
                })
              }
              placeholder="e.g. WELCOME"
              className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Banner Background Color Class</label>
            <input
              type="text"
              value={config.banner.backgroundColor}
              onChange={(e) =>
                setConfig({
                  ...config,
                  banner: { ...config.banner, backgroundColor: e.target.value },
                })
              }
              placeholder="e.g. bg-blue-500"
              className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white font-mono"
            />
          </div>
        </div>

        {/* Live Banner Preview */}
        {config.banner.show && (
          <div className="mt-4 p-3 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-between text-xs text-blue-200">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Preview: <strong>{config.banner.text}</strong></span>
            </div>
            {config.banner.couponCode && (
              <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-[11px]">
                {config.banner.couponCode}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Client Space & External Links */}
      <div className="p-5 rounded-2xl bg-[#0e121c] border border-white/10 space-y-4">
        <h2 className="text-sm font-bold text-white">Client Portal & Social Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-gray-400 mb-1">Client Space Button Title</label>
            <input
              type="text"
              value={config.clientSpace.name}
              onChange={(e) =>
                setConfig({
                  ...config,
                  clientSpace: { ...config.clientSpace, name: e.target.value },
                })
              }
              className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Client Space Portal URL</label>
            <input
              type="text"
              value={config.clientSpace.href}
              onChange={(e) =>
                setConfig({
                  ...config,
                  clientSpace: { ...config.clientSpace, href: e.target.value },
                })
              }
              className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-gray-400 mb-1">Community Discord Invite Link</label>
            <input
              type="text"
              value={config.socialLinks[0]?.href || ''}
              onChange={(e) => {
                const links = [...config.socialLinks];
                if (links[0]) links[0].href = e.target.value;
                setConfig({ ...config, socialLinks: links });
              }}
              placeholder="https://discord.gg/..."
              className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

