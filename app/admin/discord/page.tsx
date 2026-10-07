'use client';

import React, { useState, useEffect } from 'react';
import {
  Bot,
  Plus,
  Trash2,
  Edit2,
  Save,
  RefreshCw,
  Check,
  X,
  Layers,
} from 'lucide-react';
import { useToast } from '../components/Toast';

interface DiscordPlan {
  id: string;
  name: string;
  badge?: string;
  cpu: string;
  cpuDetail?: string;
  ram: string;
  ramDetail?: string;
  storage: string;
  storageDetail?: string;
  bandwidth: string;
  bandwidthDetail?: string;
  uptime?: string;
  price: string;
  period: string;
  orderLink?: string;
}

interface DiscordConfig {
  planTypes: any[];
  plans: Record<string, DiscordPlan[]>;
}

export default function DiscordAdminPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<DiscordConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('budget');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<DiscordPlan | null>(null);
  const [isNewPlan, setIsNewPlan] = useState(false);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/config/discord');
      const data = await res.json();
      if (data.success && data.data) {
        setConfig(data.data);
        if (data.data.planTypes?.length > 0 && !selectedType) {
          setSelectedType(data.data.planTypes[0].id);
        }
      }
    } catch {
      toast('Failed to load Discord bot plans data', 'error');
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
      const res = await fetch('/api/admin/config/discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast('Discord bot hosting plans saved!', 'success');
      } else {
        toast(data.error || 'Failed to save', 'error');
      }
    } catch {
      toast('Error saving discord configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAddPlan = () => {
    setEditingPlan({
      id: `${selectedType}-${Date.now().toString().slice(-4)}`,
      name: 'Starter Bot',
      badge: 'Popular',
      cpu: '1 vCPU',
      cpuDetail: 'Shared CPU',
      ram: '1 GB',
      ramDetail: 'DDR4 RAM',
      storage: '10 GB',
      storageDetail: 'SSD Storage',
      bandwidth: 'Unlimited',
      bandwidthDetail: 'Bandwidth',
      uptime: '24/7 Uptime',
      price: '£3.99',
      period: '/mo',
      orderLink: 'https://example.com/order',
    });
    setIsNewPlan(true);
    setModalOpen(true);
  };

  const handleOpenEditPlan = (plan: DiscordPlan) => {
    setEditingPlan({ ...plan });
    setIsNewPlan(false);
    setModalOpen(true);
  };

  const handleSaveModal = () => {
    if (!editingPlan || !config) return;

    const currentPlans = config.plans[selectedType] || [];
    let updatedPlans: DiscordPlan[];

    if (isNewPlan) {
      updatedPlans = [...currentPlans, editingPlan];
    } else {
      updatedPlans = currentPlans.map((p) =>
        p.id === editingPlan.id ? editingPlan : p
      );
    }

    setConfig({
      ...config,
      plans: {
        ...config.plans,
        [selectedType]: updatedPlans,
      },
    });

    setModalOpen(false);
    setEditingPlan(null);
    toast(isNewPlan ? 'Plan added. Click Save Changes to commit.' : 'Plan updated locally.');
  };

  const handleDeletePlan = (planId: string) => {
    if (!config) return;
    if (!confirm('Are you sure you want to delete this Discord bot plan?')) return;

    const currentPlans = config.plans[selectedType] || [];
    setConfig({
      ...config,
      plans: {
        ...config.plans,
        [selectedType]: currentPlans.filter((p) => p.id !== planId),
      },
    });
    toast('Plan removed. Click Save Changes to persist.', 'info');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-gray-400 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
          <span>Loading Discord bot plans...</span>
        </div>
      </div>
    );
  }

  if (!config) return null;
  const currentPlans = config.plans[selectedType] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <Bot className="w-4 h-4" />
            <span>App & Bot Hosting</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Discord Bot Hosting
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage NodeJS and Python Discord bot hosting tiers, memory allocations, and 24/7 uptime packages.
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

      {/* Type Selector & Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0e121c] border border-white/10">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400 font-medium mr-2">Category:</span>
          {config.planTypes?.map((pt) => (
            <button
              key={pt.id}
              onClick={() => setSelectedType(pt.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedType === pt.id
                  ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {pt.displayName || pt.name}
            </button>
          ))}
        </div>

        <button
          onClick={handleOpenAddPlan}
          className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Bot Tier</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentPlans.map((plan) => (
          <div
            key={plan.id}
            className="p-5 rounded-2xl bg-[#0e121c] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="text-xs font-mono text-gray-400">{plan.id}</span>
                  <h3 className="text-base font-bold text-white mt-0.5">{plan.name}</h3>
                </div>
                {plan.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    {plan.badge}
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs py-3 border-y border-white/5 my-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">RAM:</span>
                  <span className="text-white font-medium">{plan.ram}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">CPU:</span>
                  <span className="text-white font-medium">{plan.cpu}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Storage:</span>
                  <span className="text-white font-medium">{plan.storage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Bandwidth:</span>
                  <span className="text-white font-medium">{plan.bandwidth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Price:</span>
                  <span className="text-emerald-400 font-bold">{plan.price} {plan.period}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
              <button
                onClick={() => handleOpenEditPlan(plan)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                title="Edit Plan"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDeletePlan(plan.id)}
                className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors"
                title="Delete Plan"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {modalOpen && editingPlan && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e121c] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">
                {isNewPlan ? 'Add Discord Bot Tier' : `Edit Tier: ${editingPlan.id}`}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Identifier (ID)</label>
                <input
                  type="text"
                  value={editingPlan.id}
                  disabled={!isNewPlan}
                  onChange={(e) => setEditingPlan({ ...editingPlan, id: e.target.value })}
                  className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={editingPlan.name}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">RAM</label>
                <input
                  type="text"
                  value={editingPlan.ram}
                  onChange={(e) => setEditingPlan({ ...editingPlan, ram: e.target.value })}
                  className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">CPU</label>
                <input
                  type="text"
                  value={editingPlan.cpu}
                  onChange={(e) => setEditingPlan({ ...editingPlan, cpu: e.target.value })}
                  className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Storage</label>
                <input
                  type="text"
                  value={editingPlan.storage}
                  onChange={(e) => setEditingPlan({ ...editingPlan, storage: e.target.value })}
                  className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Price</label>
                <input
                  type="text"
                  value={editingPlan.price}
                  onChange={(e) => setEditingPlan({ ...editingPlan, price: e.target.value })}
                  className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Period</label>
                <input
                  type="text"
                  value={editingPlan.period}
                  onChange={(e) => setEditingPlan({ ...editingPlan, period: e.target.value })}
                  className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Badge</label>
                <input
                  type="text"
                  value={editingPlan.badge || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, badge: e.target.value })}
                  className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-400 mb-1">Order Link</label>
                <input
                  type="text"
                  value={editingPlan.orderLink || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, orderLink: e.target.value })}
                  className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

