'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import { useToast } from '../components/Toast';

interface LegalSection {
  title: string;
  content: string;
}

interface LegalDoc {
  title: string;
  lastUpdated: string;
  companyName: string;
  websiteUrl: string;
  contactEmail: string;
  sections: LegalSection[];
}

interface LegalConfig {
  termsOfService: LegalDoc;
  privacyPolicy: LegalDoc;
}

export default function LegalAdminPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<LegalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'termsOfService' | 'privacyPolicy'>('termsOfService');

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/config/legal');
      const data = await res.json();
      if (data.success && data.data) {
        setConfig(data.data);
      }
    } catch {
      toast('Failed to load legal config', 'error');
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
      const res = await fetch('/api/admin/config/legal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast('Terms & Privacy policies updated successfully!', 'success');
      } else {
        toast(data.error || 'Failed to save legal policies', 'error');
      }
    } catch {
      toast('Error saving legal configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddClause = () => {
    if (!config) return;
    const currentDoc = config[activeTab];
    const newClause: LegalSection = {
      title: `${currentDoc.sections.length + 1}. New Policy Clause`,
      content: 'Clause description and stipulations here...',
    };

    setConfig({
      ...config,
      [activeTab]: {
        ...currentDoc,
        sections: [...currentDoc.sections, newClause],
      },
    });
  };

  const handleRemoveClause = (idx: number) => {
    if (!config) return;
    const currentDoc = config[activeTab];
    const updated = [...currentDoc.sections];
    updated.splice(idx, 1);
    setConfig({
      ...config,
      [activeTab]: {
        ...currentDoc,
        sections: updated,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-gray-400 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
          <span>Loading legal policies...</span>
        </div>
      </div>
    );
  }

  if (!config) return null;
  const currentDoc = config[activeTab];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Compliance & Legal</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Terms of Service & Privacy Policy
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Configure company legal disclaimers, acceptable use policy, and privacy regulations.
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('termsOfService')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'termsOfService'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Terms of Service ({config.termsOfService.sections.length} clauses)
        </button>
        <button
          onClick={() => setActiveTab('privacyPolicy')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'privacyPolicy'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Privacy Policy ({config.privacyPolicy.sections.length} clauses)
        </button>
      </div>

      {/* General Meta */}
      <div className="p-5 rounded-2xl bg-[#0e121c] border border-white/10 space-y-4">
        <h2 className="text-sm font-bold text-white">Document Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-gray-400 mb-1">Company Entity Name</label>
            <input
              type="text"
              value={currentDoc.companyName}
              onChange={(e) =>
                setConfig({
                  ...config,
                  [activeTab]: { ...currentDoc, companyName: e.target.value },
                })
              }
              className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Legal Contact Email</label>
            <input
              type="email"
              value={currentDoc.contactEmail}
              onChange={(e) =>
                setConfig({
                  ...config,
                  [activeTab]: { ...currentDoc, contactEmail: e.target.value },
                })
              }
              className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Last Updated Date</label>
            <input
              type="text"
              value={currentDoc.lastUpdated}
              onChange={(e) =>
                setConfig({
                  ...config,
                  [activeTab]: { ...currentDoc, lastUpdated: e.target.value },
                })
              }
              className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
            />
          </div>
        </div>
      </div>

      {/* Clauses List */}
      <div className="p-5 rounded-2xl bg-[#0e121c] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Sections & Stipulations ({currentDoc.sections.length})</h2>
          <button
            onClick={handleAddClause}
            className="px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-medium flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Clause</span>
          </button>
        </div>

        <div className="space-y-4">
          {currentDoc.sections.map((clause, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#141824] border border-white/5 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  value={clause.title}
                  onChange={(e) => {
                    const sections = [...currentDoc.sections];
                    sections[idx].title = e.target.value;
                    setConfig({
                      ...config,
                      [activeTab]: { ...currentDoc, sections },
                    });
                  }}
                  className="flex-1 bg-[#0e121c] border border-white/10 rounded-lg p-2 text-white font-semibold"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveClause(idx)}
                  className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <textarea
                rows={3}
                value={clause.content}
                onChange={(e) => {
                  const sections = [...currentDoc.sections];
                  sections[idx].content = e.target.value;
                  setConfig({
                    ...config,
                    [activeTab]: { ...currentDoc, sections },
                  });
                }}
                className="w-full bg-[#0e121c] border border-white/10 rounded-lg p-2.5 text-gray-300 leading-relaxed"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

