'use client';

import React, { useState, useEffect } from 'react';
import {
  FileJson,
  Save,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertCircle,
  Code2,
  Sparkles,
} from 'lucide-react';
import { useToast } from '../components/Toast';

const AVAILABLE_FILES = [
  { id: 'dedicated', label: 'dedicated.json (Dedicated & VDS Servers)' },
  { id: 'discord', label: 'discord.json (Discord Bot Hosting)' },
  { id: 'games', label: 'games.json (Game Servers & Tiers)' },
  { id: 'hero', label: 'hero.json (Hero Carousel & Branding)' },
  { id: 'language', label: 'language.json (Translations & Locales)' },
  { id: 'legal', label: 'legal.json (Terms & Privacy Policies)' },
  { id: 'navigation', label: 'navigation.json (Navbar, Banner & Socials)' },
  { id: 'pricing', label: 'pricing.json (Homepage Pricing Cards)' },
  { id: 'showcase', label: 'showcase.json (Control Panel Showcase)' },
  { id: 'ui', label: 'ui.json (Colors, Snowfall & Currencies)' },
  { id: 'vps', label: 'vps.json (VPS Cloud Server Plans)' },
  { id: 'webhosting', label: 'webhosting.json (Web Hosting Plans)' },
];

export default function RawJsonAdminPage() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState('vps');
  const [jsonText, setJsonText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fetchFile = async (fileId: string) => {
    setLoading(true);
    setValidationError(null);
    try {
      const res = await fetch(`/api/admin/config/${fileId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setJsonText(JSON.stringify(data.data, null, 2));
      } else {
        toast('Failed to load file', 'error');
      }
    } catch {
      toast('Error fetching file', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFile(selectedFile);
  }, [selectedFile]);

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setValidationError(null);
      toast('JSON beautified successfully', 'info');
    } catch (err: any) {
      setValidationError(err.message);
      toast('Invalid JSON syntax: cannot format', 'error');
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([jsonText], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedFile}-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast(`Downloaded ${selectedFile}.json backup`, 'success');
    } catch {
      toast('Failed to create backup download', 'error');
    }
  };

  const handleSave = async () => {
    let parsed: any;
    try {
      parsed = JSON.parse(jsonText);
      setValidationError(null);
    } catch (err: any) {
      setValidationError(err.message);
      toast(`JSON Syntax Error: ${err.message}`, 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/config/${selectedFile}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast(`${selectedFile}.json saved successfully!`, 'success');
      } else {
        toast(data.error || 'Failed to save file', 'error');
      }
    } catch {
      toast('Error saving configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <Code2 className="w-4 h-4" />
            <span>Developer Tools</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Raw JSON Configuration & Backup
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Inspect, edit, validate, and download backups for any website configuration file.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownload}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-300 transition-colors flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Download Backup</span>
          </button>
          <button
            onClick={handleFormat}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-300 transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Beautify</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save File'}</span>
          </button>
        </div>
      </div>

      {/* File Selector */}
      <div className="p-4 rounded-2xl bg-[#0e121c] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <FileJson className="w-5 h-5 text-blue-400" />
          <span className="text-xs font-semibold text-gray-300">Selected Config File:</span>
          <select
            value={selectedFile}
            onChange={(e) => setSelectedFile(e.target.value)}
            className="bg-[#141824] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            {AVAILABLE_FILES.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Path: <code className="text-gray-300 font-mono text-[11px]">app/config/sections/{selectedFile}.json</code></span>
        </div>
      </div>

      {/* Error alert if syntax is invalid */}
      {validationError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span className="font-mono">JSON Syntax Error: {validationError}</span>
        </div>
      )}

      {/* Editor Textarea */}
      <div className="rounded-2xl bg-[#0c0e14] border border-white/10 overflow-hidden shadow-2xl">
        <div className="px-4 py-2.5 bg-[#090b10] border-b border-white/10 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-2 text-gray-400">{selectedFile}.json</span>
          </div>

          <div>
            <span>{jsonText.split('\n').length} lines</span>
          </div>
        </div>

        {loading ? (
          <div className="h-[500px] flex items-center justify-center text-gray-400 text-xs gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
            <span>Loading file content...</span>
          </div>
        ) : (
          <textarea
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              setValidationError(null);
            }}
            spellCheck={false}
            rows={28}
            className="w-full bg-[#0a0c12] text-gray-200 p-5 font-mono text-xs leading-relaxed focus:outline-none resize-y selection:bg-blue-600/40"
          />
        )}
      </div>
    </div>
  );
}

