'use client';

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Check,
  X,
  DollarSign,
  Palette,
  Snowflake,
  Loader2,
} from 'lucide-react';
import { useToast } from '../components/Toast';

interface CurrencyItem {
  code: string;
  symbol: string;
  name: string;
}

interface UIConfig {
  loading: {
    enableLoadingScreen: boolean;
    loadingDuration: number;
  };
  currency: {
    apiKey: string;
    baseCurrency: string;
    defaultCurrency: string;
    supportedCurrencies: CurrencyItem[];
  };
  themeSwitcher: {
    show: boolean;
    position: string;
    defaultColor: string;
    availableColors: {
      name: string;
      value: string;
      label: string;
    }[];
  };
  christmasTheme: {
    enabled: boolean;
  };
}

export default function UIAdminPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<UIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New currency modal/form
  const [newCode, setNewCode] = useState('');
  const [newSymbol, setNewSymbol] = useState('');
  const [newName, setNewName] = useState('');

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/config/ui');
      const data = await res.json();
      if (data.success && data.data) {
        setConfig(data.data);
      }
    } catch {
      toast('Failed to load UI configuration', 'error');
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
      const res = await fetch('/api/admin/config/ui', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast('UI, theme & currencies updated successfully!', 'success');
      } else {
        toast(data.error || 'Failed to save UI configuration', 'error');
      }
    } catch {
      toast('Error saving UI settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCurrency = () => {
    if (!newCode.trim() || !newSymbol.trim() || !config) return;
    const item: CurrencyItem = {
      code: newCode.trim().toUpperCase(),
      symbol: newSymbol.trim(),
      name: newName.trim() || newCode.trim().toUpperCase(),
    };

    setConfig({
      ...config,
      currency: {
        ...config.currency,
        supportedCurrencies: [...config.currency.supportedCurrencies, item],
      },
    });

    setNewCode('');
    setNewSymbol('');
    setNewName('');
    toast('Currency added. Click Save Changes to commit.');
  };

  const handleRemoveCurrency = (idx: number) => {
    if (!config) return;
    const list = [...config.currency.supportedCurrencies];
    list.splice(idx, 1);
    setConfig({
      ...config,
      currency: {
        ...config.currency,
        supportedCurrencies: list,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-gray-400 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
          <span>Loading UI settings...</span>
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
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4" />
            <span>Theme & Localization</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            UI, Effects & Currencies
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Toggle seasonal effects (Christmas snow), loading screen animations, and multi-currency exchange rates.
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

      {/* Visual Effects & Loading Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Christmas Snowfall */}
        <div className="p-5 rounded-2xl bg-[#0e121c] border border-white/10 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <Snowflake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Christmas Snowfall Effect</h3>
                <p className="text-xs text-gray-400">Falling snow particles on public site</p>
              </div>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.christmasTheme.enabled}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    christmasTheme: { enabled: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600 relative"></div>
            </label>
          </div>

          <div className="text-xs text-gray-400 bg-white/5 p-3 rounded-xl">
            Status: <span className="text-white font-semibold">{config.christmasTheme.enabled ? 'Enabled' : 'Disabled'}</span>
          </div>
        </div>

        {/* Loading Screen */}
        <div className="p-5 rounded-2xl bg-[#0e121c] border border-white/10 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <Loader2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Initial Loading Animation</h3>
                <p className="text-xs text-gray-400">Full-screen Nova spinner on first visit</p>
              </div>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.loading.enableLoadingScreen}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    loading: { ...config.loading, enableLoadingScreen: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 relative"></div>
            </label>
          </div>

          <div className="text-xs">
            <label className="block text-gray-400 mb-1">Duration (Milliseconds)</label>
            <input
              type="number"
              value={config.loading.loadingDuration}
              onChange={(e) =>
                setConfig({
                  ...config,
                  loading: { ...config.loading, loadingDuration: parseInt(e.target.value) || 1000 },
                })
              }
              className="w-full bg-[#141824] border border-white/10 rounded-xl p-2 text-white"
            />
          </div>
        </div>
      </div>

      {/* Multi-Currency Manager */}
      <div className="p-5 rounded-2xl bg-[#0e121c] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Supported Currencies ({config.currency.supportedCurrencies.length})</h2>
            <p className="text-xs text-gray-400">Visitor currency selector and auto live exchange</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-gray-400 mb-1">Base Currency Code</label>
            <input
              type="text"
              value={config.currency.baseCurrency}
              onChange={(e) =>
                setConfig({
                  ...config,
                  currency: { ...config.currency, baseCurrency: e.target.value.toUpperCase() },
                })
              }
              className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Default Display Currency</label>
            <input
              type="text"
              value={config.currency.defaultCurrency}
              onChange={(e) =>
                setConfig({
                  ...config,
                  currency: { ...config.currency, defaultCurrency: e.target.value.toUpperCase() },
                })
              }
              className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Exchange Rate API Key</label>
            <input
              type="text"
              value={config.currency.apiKey}
              onChange={(e) =>
                setConfig({
                  ...config,
                  currency: { ...config.currency, apiKey: e.target.value },
                })
              }
              className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white font-mono"
            />
          </div>
        </div>

        {/* Add new currency row */}
        <div className="pt-2 border-t border-white/5">
          <div className="text-xs font-semibold text-gray-300 mb-2">Add New Supported Currency</div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Code (e.g. INR, JPY)"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className="sm:w-28 bg-[#141824] border border-white/10 rounded-xl p-2 text-xs text-white uppercase font-mono"
            />
            <input
              type="text"
              placeholder="Symbol (e.g. ₹, ¥)"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              className="sm:w-24 bg-[#141824] border border-white/10 rounded-xl p-2 text-xs text-white"
            />
            <input
              type="text"
              placeholder="Currency Name (e.g. Indian Rupee)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 bg-[#141824] border border-white/10 rounded-xl p-2 text-xs text-white"
            />
            <button
              type="button"
              onClick={handleAddCurrency}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Currency</span>
            </button>
          </div>
        </div>

        {/* Currency badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-2">
          {config.currency.supportedCurrencies.map((c, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#141824] border border-white/5 flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-bold text-white flex items-center gap-1">
                  <span>{c.code}</span>
                  <span className="text-blue-400">({c.symbol})</span>
                </div>
                <div className="text-[10px] text-gray-400 truncate">{c.name}</div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveCurrency(idx)}
                className="text-gray-400 hover:text-rose-400 p-1"
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

