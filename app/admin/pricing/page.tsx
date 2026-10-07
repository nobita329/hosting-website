'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  Save,
  RefreshCw,
  Check,
  X,
  Star,
  Layers,
} from 'lucide-react';
import { useToast } from '../components/Toast';

interface PricingPlanCard {
  titleKey: string;
  image: string;
  descriptionKey: string;
  basePrice: number;
  featuresKeys: string[];
  buttonTextKey: string;
  buttonStyle: string;
  popular: boolean;
  link: string;
}

interface PricingConfig {
  section: {
    title: {
      prefix: string;
      highlight: string;
      suffix: string;
    };
    description: string;
    plans: PricingPlanCard[];
  };
}

export default function PricingAdminPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingCard, setEditingCard] = useState<PricingPlanCard | null>(null);
  const [editingIdx, setEditingIdx] = useState<number>(-1);
  const [modalOpen, setModalOpen] = useState(false);
  const [newFeature, setNewFeature] = useState('');

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/config/pricing');
      const data = await res.json();
      if (data.success && data.data) {
        setConfig(data.data);
      }
    } catch {
      toast('Failed to load pricing cards', 'error');
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
      const res = await fetch('/api/admin/config/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast('Homepage pricing cards updated successfully!', 'success');
      } else {
        toast(data.error || 'Failed to save', 'error');
      }
    } catch {
      toast('Error saving pricing cards', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEdit = (plan: PricingPlanCard, index: number) => {
    setEditingCard(JSON.parse(JSON.stringify(plan)));
    setEditingIdx(index);
    setModalOpen(true);
  };

  const handleSaveModal = () => {
    if (!editingCard || !config || editingIdx < 0) return;

    const updatedPlans = [...config.section.plans];
    updatedPlans[editingIdx] = editingCard;

    setConfig({
      ...config,
      section: {
        ...config.section,
        plans: updatedPlans,
      },
    });

    setModalOpen(false);
    setEditingCard(null);
    toast('Pricing card updated locally. Click Save Changes to commit.');
  };

  const handleAddFeature = () => {
    if (!newFeature.trim() || !editingCard) return;
    setEditingCard({
      ...editingCard,
      featuresKeys: [...editingCard.featuresKeys, newFeature.trim()],
    });
    setNewFeature('');
  };

  const handleRemoveFeature = (fIdx: number) => {
    if (!editingCard) return;
    const feats = [...editingCard.featuresKeys];
    feats.splice(fIdx, 1);
    setEditingCard({ ...editingCard, featuresKeys: feats });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-gray-400 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
          <span>Loading pricing config...</span>
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
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <DollarSign className="w-4 h-4" />
            <span>Homepage Configuration</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Homepage Pricing Cards
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Configure the 3 main showcase cards displayed on the homepage pricing section.
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

      {/* Section Headings Form */}
      <div className="p-5 rounded-2xl bg-[#0e121c] border border-white/10 space-y-4">
        <h2 className="text-sm font-bold text-white">Section Titles & Heading</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-gray-400 mb-1">Title Prefix</label>
            <input
              type="text"
              value={config.section.title.prefix}
              onChange={(e) =>
                setConfig({
                  ...config,
                  section: {
                    ...config.section,
                    title: { ...config.section.title, prefix: e.target.value },
                  },
                })
              }
              className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Highlighted Word</label>
            <input
              type="text"
              value={config.section.title.highlight}
              onChange={(e) =>
                setConfig({
                  ...config,
                  section: {
                    ...config.section,
                    title: { ...config.section.title, highlight: e.target.value },
                  },
                })
              }
              className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Title Suffix</label>
            <input
              type="text"
              value={config.section.title.suffix || ''}
              onChange={(e) =>
                setConfig({
                  ...config,
                  section: {
                    ...config.section,
                    title: { ...config.section.title, suffix: e.target.value },
                  },
                })
              }
              className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-gray-400 mb-1">Section Subtitle / Description</label>
            <input
              type="text"
              value={config.section.description}
              onChange={(e) =>
                setConfig({
                  ...config,
                  section: {
                    ...config.section,
                    description: e.target.value,
                  },
                })
              }
              className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
            />
          </div>
        </div>
      </div>

      {/* Cards list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {config.section.plans.map((plan, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-2xl bg-[#0e121c] border transition-all flex flex-col justify-between ${
              plan.popular ? 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'border-white/10'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-gray-400">Card #{idx + 1}</span>
                {plan.popular && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-blue-400" />
                    Popular
                  </span>
                )}
              </div>

              <div className="text-base font-bold text-white mb-1 font-mono truncate">
                {plan.titleKey}
              </div>

              <div className="text-2xl font-extrabold text-emerald-400 my-2">
                ${plan.basePrice.toFixed(2)}
                <span className="text-xs text-gray-400 font-normal"> /mo base</span>
              </div>

              <div className="text-xs text-gray-400 font-mono truncate mb-3">
                Image: {plan.image}
              </div>

              <div className="space-y-1.5 py-3 border-y border-white/5 text-xs text-gray-300">
                <div className="text-[11px] font-semibold text-gray-400">Feature Keys ({plan.featuresKeys.length}):</div>
                {plan.featuresKeys.slice(0, 4).map((f, fIdx) => (
                  <div key={fIdx} className="truncate text-gray-400 font-mono text-[11px]">
                    • {f}
                  </div>
                ))}
                {plan.featuresKeys.length > 4 && (
                  <div className="text-[10px] text-gray-500 italic">
                    +{plan.featuresKeys.length - 4} more features
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-white/5 mt-4">
              <span className="text-xs text-gray-400">Target: <code className="text-white">{plan.link}</code></span>
              <button
                onClick={() => handleOpenEdit(plan, idx)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-white flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {modalOpen && editingCard && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e121c] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">
                Edit Pricing Card #{editingIdx + 1}
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
                <label className="block text-gray-400 mb-1">Title Key</label>
                <input
                  type="text"
                  value={editingCard.titleKey}
                  onChange={(e) => setEditingCard({ ...editingCard, titleKey: e.target.value })}
                  className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Base Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingCard.basePrice}
                  onChange={(e) =>
                    setEditingCard({ ...editingCard, basePrice: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Thumbnail Image Path</label>
                <input
                  type="text"
                  value={editingCard.image}
                  onChange={(e) => setEditingCard({ ...editingCard, image: e.target.value })}
                  className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Redirect Link</label>
                <input
                  type="text"
                  value={editingCard.link}
                  onChange={(e) => setEditingCard({ ...editingCard, link: e.target.value })}
                  className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-400 mb-1">Description Key</label>
                <input
                  type="text"
                  value={editingCard.descriptionKey}
                  onChange={(e) => setEditingCard({ ...editingCard, descriptionKey: e.target.value })}
                  className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="popularCheck"
                  checked={editingCard.popular}
                  onChange={(e) => setEditingCard({ ...editingCard, popular: e.target.checked })}
                  className="rounded border-white/10 bg-[#141824] text-blue-600 w-4 h-4"
                />
                <label htmlFor="popularCheck" className="text-gray-300 text-xs cursor-pointer font-medium">
                  Mark as &ldquo;Popular&rdquo; featured card (highlighted border)
                </label>
              </div>

              {/* Features list */}
              <div className="sm:col-span-2">
                <label className="block text-gray-400 mb-1">Feature Bullet Keys</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="pricingPlans.gameServers.features.modSupport"
                    className="flex-1 bg-[#141824] border border-white/10 rounded-xl p-2 text-white font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-medium"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {editingCard.featuresKeys.map((f, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg bg-[#141824] border border-white/5 text-white flex items-center justify-between text-[11px] font-mono"
                    >
                      <span className="truncate">{f}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(i)}
                        className="text-gray-400 hover:text-rose-400 shrink-0 ml-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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

