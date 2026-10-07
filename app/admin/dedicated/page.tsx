'use client';

import React, { useState, useEffect } from 'react';
import {
  Server,
  Plus,
  Trash2,
  Edit2,
  Save,
  RefreshCw,
  Check,
  X,
  Layers,
  MapPin,
} from 'lucide-react';
import { useToast } from '../components/Toast';

interface DedicatedPlan {
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
  price: string;
  period: string;
  features?: string[];
  orderLink?: string;
}

interface DedicatedConfig {
  planTypes: any[];
  locations: any[];
  plans: Record<string, DedicatedPlan[]>;
}

export default function DedicatedAdminPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<DedicatedConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCpu, setSelectedCpu] = useState<string>('ryzen-7');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<DedicatedPlan | null>(null);
  const [isNewPlan, setIsNewPlan] = useState(false);
  const [featureInput, setFeatureInput] = useState('');

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/config/dedicated');
      const data = await res.json();
      if (data.success && data.data) {
        setConfig(data.data);
        if (data.data.planTypes?.length > 0 && !selectedCpu) {
          setSelectedCpu(data.data.planTypes[0].id);
        }
      }
    } catch {
      toast('Failed to load dedicated servers data', 'error');
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
      const res = await fetch('/api/admin/config/dedicated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast('Dedicated servers configuration saved!', 'success');
      } else {
        toast(data.error || 'Failed to save', 'error');
      }
    } catch {
      toast('Error saving dedicated servers', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAddPlan = () => {
    setEditingPlan({
      id: `DEDI-${Date.now().toString().slice(-4)}`,
      name: 'Dedicated Bare-Metal',
      badge: 'Popular',
      cpu: '8 Cores / 16 Threads',
      cpuDetail: 'AMD Ryzen 7 5700X',
      ram: '32 GB',
      ramDetail: 'DDR4 ECC',
      storage: '1 TB NVMe',
      storageDetail: 'Gen4 Enterprise SSD',
      bandwidth: 'Unlimited',
      bandwidthDetail: '1 Gbps Port',
      price: '£65.00',
      period: '/mo',
      features: ['Full Root Access', 'DDoS Protection', 'Instant Setup', '24/7 Support'],
      orderLink: 'https://example.com/order',
    });
    setIsNewPlan(true);
    setModalOpen(true);
  };

  const handleOpenEditPlan = (plan: DedicatedPlan) => {
    setEditingPlan(JSON.parse(JSON.stringify(plan)));
    setIsNewPlan(false);
    setModalOpen(true);
  };

  const handleSaveModal = () => {
    if (!editingPlan || !config) return;

    const currentPlans = config.plans[selectedCpu] || [];
    let updatedPlans: DedicatedPlan[];

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
    toast(isNewPlan ? 'Plan added. Click Save Changes to commit.' : 'Plan updated locally.');
  };

  const handleDeletePlan = (planId: string) => {
    if (!config) return;
    if (!confirm('Are you sure you want to delete this dedicated tier?')) return;

    const currentPlans = config.plans[selectedCpu] || [];
    setConfig({
      ...config,
      plans: {
        ...config.plans,
        [selectedCpu]: currentPlans.filter((p) => p.id !== planId),
      },
    });
    toast('Plan deleted. Click Save Changes to apply.', 'info');
  };

  const handleAddFeature = () => {
    if (!featureInput.trim() || !editingPlan) return;
    const currentFeatures = editingPlan.features || [];
    setEditingPlan({
      ...editingPlan,
      features: [...currentFeatures, featureInput.trim()],
    });
    setFeatureInput('');
  };

  const handleRemoveFeature = (idx: number) => {
    if (!editingPlan) return;
    const currentFeatures = [...(editingPlan.features || [])];
    currentFeatures.splice(idx, 1);
    setEditingPlan({ ...editingPlan, features: currentFeatures });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-gray-400 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
          <span>Loading dedicated servers config...</span>
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
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
            <Server className="w-4 h-4" />
            <span>Infrastructure Management</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Dedicated & VDS Servers
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage bare-metal dedicated servers, CPU allocations, NVMe storage, and network ports.
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

      {/* CPU Architecture Tabs & Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0e121c] border border-white/10">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400 font-medium mr-2">CPU Type:</span>
          {config.planTypes?.map((pt) => (
            <button
              key={pt.id}
              onClick={() => setSelectedCpu(pt.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCpu === pt.id
                  ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(147,51,234,0.4)]'
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
          <span>Add Dedicated Plan</span>
        </button>
      </div>

      {/* Plans List */}
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
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    {plan.badge}
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs py-3 border-y border-white/5 my-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">CPU:</span>
                  <span className="text-white font-medium">{plan.cpu}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">RAM:</span>
                  <span className="text-white font-medium">{plan.ram}</span>
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

              {plan.features && plan.features.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {plan.features.map((f, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-gray-300"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              )}
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

        {currentPlans.length === 0 && (
          <div className="col-span-full p-8 text-center rounded-2xl bg-[#0e121c] border border-dashed border-white/10 text-gray-400 text-xs">
            No dedicated servers configured for {selectedCpu}.
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {modalOpen && editingPlan && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e121c] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">
                {isNewPlan ? 'Add Dedicated Server' : `Edit Server: ${editingPlan.id}`}
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
                <label className="block text-gray-400 mb-1">Server ID</label>
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
                <label className="block text-gray-400 mb-1">CPU</label>
                <input
                  type="text"
                  value={editingPlan.cpu}
                  onChange={(e) => setEditingPlan({ ...editingPlan, cpu: e.target.value })}
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
                <label className="block text-gray-400 mb-1">Storage</label>
                <input
                  type="text"
                  value={editingPlan.storage}
                  onChange={(e) => setEditingPlan({ ...editingPlan, storage: e.target.value })}
                  className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Bandwidth</label>
                <input
                  type="text"
                  value={editingPlan.bandwidth}
                  onChange={(e) => setEditingPlan({ ...editingPlan, bandwidth: e.target.value })}
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

              <div className="sm:col-span-2">
                <label className="block text-gray-400 mb-1">Order Link</label>
                <input
                  type="text"
                  value={editingPlan.orderLink || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, orderLink: e.target.value })}
                  className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-400 mb-1">Feature Bullet Points</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    placeholder="e.g. 1Gbps Uplink"
                    className="flex-1 bg-[#141824] border border-white/10 rounded-xl p-2 text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-medium"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(editingPlan.features || []).map((f, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white flex items-center gap-1.5"
                    >
                      <span>{f}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(i)}
                        className="text-gray-400 hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
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

