'use client';

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Plus,
  Trash2,
  Edit2,
  Save,
  RefreshCw,
  MapPin,
  ExternalLink,
  Check,
  X,
  Layers,
} from 'lucide-react';
import { useToast } from '../components/Toast';

interface VpsPlan {
  id: string;
  name: string;
  badge?: string;
  image?: string;
  cpu: string;
  cpuDetail?: string;
  ram: string;
  ramDetail?: string;
  storage: string;
  storageDetail?: string;
  bandwidth?: string;
  bandwidthDetail?: string;
  price: string;
  period: string;
  orderLink: string;
}

interface PlanType {
  id: string;
  name: string;
  displayName: string;
  image: string;
}

interface LocationItem {
  id: string;
  name: string;
  flag: string;
  displayName: string;
  availableCpus: string[];
}

interface VpsConfig {
  planTypes: PlanType[];
  locations: LocationItem[];
  plans: Record<string, VpsPlan[]>;
}

export default function VpsAdminPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<VpsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCpu, setSelectedCpu] = useState<string>('ryzen-7');
  const [activeTab, setActiveTab] = useState<'plans' | 'locations'>('plans');

  // Modal states for plan
  const [editingPlan, setEditingPlan] = useState<VpsPlan | null>(null);
  const [isNewPlan, setIsNewPlan] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/config/vps');
      const data = await res.json();
      if (data.success && data.data) {
        setConfig(data.data);
        if (data.data.planTypes?.length > 0 && !selectedCpu) {
          setSelectedCpu(data.data.planTypes[0].id);
        }
      } else {
        toast('Failed to load VPS configuration', 'error');
      }
    } catch {
      toast('Error fetching VPS configuration', 'error');
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
      const res = await fetch('/api/admin/config/vps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast('VPS plans saved successfully!', 'success');
      } else {
        toast(data.error || 'Failed to save VPS plans', 'error');
      }
    } catch {
      toast('Error saving VPS plans', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingPlan({
      id: `VPS-${Date.now().toString().slice(-4)}`,
      name: `VPS Tier`,
      badge: 'Popular',
      image: '/cpu/ryzen7.png',
      cpu: '2 Cores',
      cpuDetail: 'Cores',
      ram: '4 GB',
      ramDetail: 'DDR5 RAM',
      storage: '50 GB',
      storageDetail: 'NVMe SSD',
      bandwidth: '1 TB',
      bandwidthDetail: 'Bandwidth',
      price: '$5.00',
      period: '/mo',
      orderLink: 'https://example.com/order',
    });
    setIsNewPlan(true);
    setModalOpen(true);
  };

  const handleOpenEditModal = (plan: VpsPlan) => {
    setEditingPlan({ ...plan });
    setIsNewPlan(false);
    setModalOpen(true);
  };

  const handleSaveModal = () => {
    if (!editingPlan || !config) return;

    const currentPlans = config.plans[selectedCpu] || [];
    let updatedPlans: VpsPlan[];

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
        [selectedCpu]: updatedPlans,
      },
    });

    setModalOpen(false);
    setEditingPlan(null);
    toast(isNewPlan ? 'Plan added (remember to click Save Changes)' : 'Plan updated locally');
  };

  const handleDeletePlan = (planId: string) => {
    if (!config) return;
    if (!confirm('Are you sure you want to delete this VPS tier?')) return;

    const currentPlans = config.plans[selectedCpu] || [];
    const updatedPlans = currentPlans.filter((p) => p.id !== planId);

    setConfig({
      ...config,
      plans: {
        ...config.plans,
        [selectedCpu]: updatedPlans,
      },
    });
    toast('Plan removed locally. Click Save Changes to persist.', 'info');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-gray-400 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
          <span>Loading VPS configuration...</span>
        </div>
      </div>
    );
  }

  if (!config) return null;

  const currentPlans = config.plans[selectedCpu] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" />
            <span>Hosting Management</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            VPS Hosting Plans
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Configure AMD Ryzen VPS server tiers, hardware specs, pricing, and locations.
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

      {/* View Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'plans'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Server Plans</span>
        </button>
        <button
          onClick={() => setActiveTab('locations')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'locations'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Datacenter Locations ({config.locations?.length || 0})</span>
        </button>
      </div>

      {activeTab === 'plans' && (
        <div className="space-y-6">
          {/* CPU Type Selector & Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0e121c] border border-white/10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400 font-medium mr-2">CPU Architecture:</span>
              {config.planTypes?.map((pt) => (
                <button
                  key={pt.id}
                  onClick={() => setSelectedCpu(pt.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedCpu === pt.id
                      ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {pt.displayName || pt.name}
                </button>
              ))}
            </div>

            <button
              onClick={handleOpenAddModal}
              className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-all flex items-center gap-2 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add VPS Tier</span>
            </button>
          </div>

          {/* Plans Grid */}
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
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  {/* Hardware Specs list */}
                  <div className="space-y-2 text-xs py-3 border-y border-white/5 my-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">CPU:</span>
                      <span className="text-white font-medium">{plan.cpu} ({plan.cpuDetail || 'Cores'})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">RAM:</span>
                      <span className="text-white font-medium">{plan.ram}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">NVMe SSD:</span>
                      <span className="text-white font-medium">{plan.storage}</span>
                    </div>
                    {plan.bandwidth && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Bandwidth:</span>
                        <span className="text-white font-medium">{plan.bandwidth}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Price:</span>
                      <span className="text-emerald-400 font-bold">{plan.price} {plan.period}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-400 truncate">
                    <span className="text-gray-400 mr-1">URL:</span>
                    <span className="font-mono">{plan.orderLink}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-white/5">
                  <button
                    onClick={() => handleOpenEditModal(plan)}
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

            {currentPlans.length === 0 && (
              <div className="col-span-full p-8 text-center rounded-2xl bg-[#0e121c] border border-dashed border-white/10 text-gray-400 text-xs">
                No plans configured for {selectedCpu}. Click &ldquo;Add VPS Tier&rdquo; to create one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Locations Tab */}
      {activeTab === 'locations' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {config.locations?.map((loc, idx) => (
              <div
                key={loc.id || idx}
                className="p-5 rounded-2xl bg-[#0e121c] border border-white/10 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{loc.displayName || loc.name}</span>
                  <span className="text-xs font-mono text-gray-400">{loc.id}</span>
                </div>
                <div className="text-xs text-gray-400">
                  Flag icon: <code className="text-gray-300 font-mono text-[11px]">{loc.flag}</code>
                </div>
                <div className="text-xs text-gray-400">
                  CPUs supported:{' '}
                  <span className="text-blue-400 font-medium">
                    {loc.availableCpus?.join(', ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Plan Modal */}
      {modalOpen && editingPlan && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e121c] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">
                {isNewPlan ? 'Add New VPS Tier' : `Edit Tier: ${editingPlan.id}`}
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
                <label className="block text-gray-400 mb-1">Plan Identifier (ID)</label>
                <input
                  type="text"
                  value={editingPlan.id}
                  disabled={!isNewPlan}
                  onChange={(e) => setEditingPlan({ ...editingPlan, id: e.target.value })}
                  className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Display Name</label>
                <input
                  type="text"
                  value={editingPlan.name}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">CPU Cores</label>
                <input
                  type="text"
                  value={editingPlan.cpu}
                  onChange={(e) => setEditingPlan({ ...editingPlan, cpu: e.target.value })}
                  placeholder="2 Cores"
                  className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">RAM</label>
                <input
                  type="text"
                  value={editingPlan.ram}
                  onChange={(e) => setEditingPlan({ ...editingPlan, ram: e.target.value })}
                  placeholder="8 GB"
                  className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">NVMe SSD Storage</label>
                <input
                  type="text"
                  value={editingPlan.storage}
                  onChange={(e) => setEditingPlan({ ...editingPlan, storage: e.target.value })}
                  placeholder="100 GB"
                  className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Bandwidth</label>
                <input
                  type="text"
                  value={editingPlan.bandwidth || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, bandwidth: e.target.value })}
                  placeholder="2 TB or Unlimited"
                  className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Price (e.g. $10.60)</label>
                <input
                  type="text"
                  value={editingPlan.price}
                  onChange={(e) => setEditingPlan({ ...editingPlan, price: e.target.value })}
                  className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Period (e.g. /mo)</label>
                <input
                  type="text"
                  value={editingPlan.period}
                  onChange={(e) => setEditingPlan({ ...editingPlan, period: e.target.value })}
                  className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Badge (optional)</label>
                <input
                  type="text"
                  value={editingPlan.badge || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, badge: e.target.value })}
                  placeholder="Popular / Hot"
                  className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Order URL</label>
                <input
                  type="text"
                  value={editingPlan.orderLink}
                  onChange={(e) => setEditingPlan({ ...editingPlan, orderLink: e.target.value })}
                  placeholder="/order/vps/..."
                  className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-300"
              >
                Cancel
              </button>
              <button
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

