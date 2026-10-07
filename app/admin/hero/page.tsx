'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Check,
  X,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import { useToast } from '../components/Toast';

interface HeroGame {
  id: string;
  name: string;
  displayName: string;
  banner: string;
  color: string;
  showSuffix: boolean;
  showInDropdown: boolean;
}

interface Partner {
  name: string;
  src: string;
  loading?: string;
}

interface HeroConfig {
  navbar: {
    logo: string;
    brandName: string;
    brandAccent: string;
  };
  hero: {
    title: {
      suffixColor: string;
      gameNameColor: string;
    };
    games: HeroGame[];
    cycleInterval: number;
    partners: Partner[];
  };
}

export default function HeroAdminPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<HeroConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New partner state
  const [partnerName, setPartnerName] = useState('');
  const [partnerSrc, setPartnerSrc] = useState('');

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/config/hero');
      const data = await res.json();
      if (data.success && data.data) {
        setConfig(data.data);
      }
    } catch {
      toast('Failed to load hero configuration', 'error');
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
      const res = await fetch('/api/admin/config/hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast('Hero & branding updated successfully!', 'success');
      } else {
        toast(data.error || 'Failed to save', 'error');
      }
    } catch {
      toast('Error saving hero config', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPartner = () => {
    if (!partnerName.trim() || !partnerSrc.trim() || !config) return;
    setConfig({
      ...config,
      hero: {
        ...config.hero,
        partners: [
          ...config.hero.partners,
          { name: partnerName.trim(), src: partnerSrc.trim(), loading: 'lazy' },
        ],
      },
    });
    setPartnerName('');
    setPartnerSrc('');
    toast('Partner added. Click Save Changes to commit.');
  };

  const handleRemovePartner = (idx: number) => {
    if (!config) return;
    const updated = [...config.hero.partners];
    updated.splice(idx, 1);
    setConfig({
      ...config,
      hero: {
        ...config.hero,
        partners: updated,
      },
    });
  };

  const handleAddHeroGame = () => {
    if (!config) return;
    const newGame: HeroGame = {
      id: `hero-game-${Date.now().toString().slice(-4)}`,
      name: 'Game Name',
      displayName: 'Game Name',
      banner: '/banners/minecraft-banners.webp',
      color: '#3B82F6',
      showSuffix: true,
      showInDropdown: true,
    };
    setConfig({
      ...config,
      hero: {
        ...config.hero,
        games: [...config.hero.games, newGame],
      },
    });
  };

  const handleRemoveHeroGame = (idx: number) => {
    if (!config) return;
    const updated = [...config.hero.games];
    updated.splice(idx, 1);
    setConfig({
      ...config,
      hero: {
        ...config.hero,
        games: updated,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-gray-400 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
          <span>Loading branding & hero config...</span>
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
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Identity & Aesthetics</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Hero Section & Brand Identity
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Configure website brand name, navbar logo, cycling hero banners, and sponsor logos.
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

      {/* Brand & Logo Form */}
      <div className="p-5 rounded-2xl bg-[#0e121c] border border-white/10 space-y-4">
        <h2 className="text-sm font-bold text-white">Brand Name & Navbar Logo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-gray-400 mb-1">Brand Name Prefix</label>
            <input
              type="text"
              value={config.navbar.brandName}
              onChange={(e) =>
                setConfig({
                  ...config,
                  navbar: { ...config.navbar, brandName: e.target.value },
                })
              }
              className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Brand Accent Word</label>
            <input
              type="text"
              value={config.navbar.brandAccent}
              onChange={(e) =>
                setConfig({
                  ...config,
                  navbar: { ...config.navbar, brandAccent: e.target.value },
                })
              }
              className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Navbar Logo Path / URL</label>
            <input
              type="text"
              value={config.navbar.logo}
              onChange={(e) =>
                setConfig({
                  ...config,
                  navbar: { ...config.navbar, logo: e.target.value },
                })
              }
              className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-gray-400 mb-1">
              Banner Rotation Interval (Milliseconds, e.g. 10000 = 10s)
            </label>
            <input
              type="number"
              value={config.hero.cycleInterval}
              onChange={(e) =>
                setConfig({
                  ...config,
                  hero: { ...config.hero, cycleInterval: parseInt(e.target.value) || 10000 },
                })
              }
              className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
            />
          </div>
        </div>
      </div>

      {/* Rotating Hero Games */}
      <div className="p-5 rounded-2xl bg-[#0e121c] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Rotating Hero Games Banner Showcase</h2>
            <p className="text-xs text-gray-400">Games that rotate with giant background banners in the landing hero</p>
          </div>
          <button
            onClick={handleAddHeroGame}
            className="px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-medium flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Rotating Game</span>
          </button>
        </div>

        <div className="space-y-3">
          {config.hero.games.map((g, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#141824] border border-white/5 grid grid-cols-1 sm:grid-cols-5 gap-3 items-center text-xs"
            >
              <div>
                <label className="text-[10px] text-gray-500 block mb-0.5">Name</label>
                <input
                  type="text"
                  value={g.name}
                  onChange={(e) => {
                    const games = [...config.hero.games];
                    games[idx].name = e.target.value;
                    setConfig({ ...config, hero: { ...config.hero, games } });
                  }}
                  className="w-full bg-[#0e121c] border border-white/10 rounded p-1.5 text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 block mb-0.5">Display Title</label>
                <input
                  type="text"
                  value={g.displayName}
                  onChange={(e) => {
                    const games = [...config.hero.games];
                    games[idx].displayName = e.target.value;
                    setConfig({ ...config, hero: { ...config.hero, games } });
                  }}
                  className="w-full bg-[#0e121c] border border-white/10 rounded p-1.5 text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 block mb-0.5">Banner Image</label>
                <input
                  type="text"
                  value={g.banner}
                  onChange={(e) => {
                    const games = [...config.hero.games];
                    games[idx].banner = e.target.value;
                    setConfig({ ...config, hero: { ...config.hero, games } });
                  }}
                  className="w-full bg-[#0e121c] border border-white/10 rounded p-1.5 text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 block mb-0.5">Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={g.color || '#3B82F6'}
                    onChange={(e) => {
                      const games = [...config.hero.games];
                      games[idx].color = e.target.value;
                      setConfig({ ...config, hero: { ...config.hero, games } });
                    }}
                    className="w-7 h-7 rounded cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={g.color}
                    onChange={(e) => {
                      const games = [...config.hero.games];
                      games[idx].color = e.target.value;
                      setConfig({ ...config, hero: { ...config.hero, games } });
                    }}
                    className="w-20 bg-[#0e121c] border border-white/10 rounded p-1.5 text-white text-[11px]"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => handleRemoveHeroGame(idx)}
                  className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Partners and Sponsors */}
      <div className="p-5 rounded-2xl bg-[#0e121c] border border-white/10 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white">Partner & Sponsor Badges ({config.hero.partners.length})</h2>
          <p className="text-xs text-gray-400">Logos displayed on the landing page ticker</p>
        </div>

        {/* Add Partner */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Partner Name (e.g. Intel)"
            value={partnerName}
            onChange={(e) => setPartnerName(e.target.value)}
            className="flex-1 bg-[#141824] border border-white/10 rounded-xl p-2.5 text-xs text-white"
          />
          <input
            type="text"
            placeholder="Logo image path (e.g. /advertisement/intel.png)"
            value={partnerSrc}
            onChange={(e) => setPartnerSrc(e.target.value)}
            className="flex-1 bg-[#141824] border border-white/10 rounded-xl p-2.5 text-xs text-white"
          />
          <button
            type="button"
            onClick={handleAddPartner}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Partner</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {config.hero.partners.map((p, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#141824] border border-white/5 flex items-center justify-between text-xs"
            >
              <div className="truncate mr-2">
                <div className="font-semibold text-white truncate">{p.name}</div>
                <div className="text-[10px] text-gray-500 font-mono truncate">{p.src}</div>
              </div>
              <button
                type="button"
                onClick={() => handleRemovePartner(idx)}
                className="text-gray-400 hover:text-rose-400 p-1 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

