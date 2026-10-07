'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Gamepad2,
  Plus,
  Trash2,
  Edit2,
  Save,
  RefreshCw,
  Star,
  Search,
  ExternalLink,
  Check,
  X,
  Layers,
} from 'lucide-react';
import { useToast } from '../components/Toast';

interface GameSubPlan {
  id: string;
  name: string;
  type: string;
  ram: string;
  cpu: string;
  storage: string;
  price: number;
  orderLink: string;
}

interface GameItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  banner: string;
  featured: boolean;
  startingAt: string;
  primaryColor: string;
  plans: {
    budget?: GameSubPlan[];
    premium?: GameSubPlan[];
    [key: string]: GameSubPlan[] | undefined;
  };
}

interface GamesConfig {
  planTypes: any[];
  locations: any[];
  games: GameItem[];
}

export default function GamesAdminPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<GamesConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<GameItem | null>(null);
  const [isNewGame, setIsNewGame] = useState(false);
  const [selectedPlanTab, setSelectedPlanTab] = useState<'budget' | 'premium'>('budget');

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/config/games');
      const data = await res.json();
      if (data.success && data.data) {
        setConfig(data.data);
      } else {
        toast('Failed to load games data', 'error');
      }
    } catch {
      toast('Error fetching games data', 'error');
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
      const res = await fetch('/api/admin/config/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast('Games configuration saved successfully!', 'success');
      } else {
        toast(data.error || 'Failed to save games', 'error');
      }
    } catch {
      toast('Error saving games', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAddGame = () => {
    const newId = `game-${Date.now().toString().slice(-4)}`;
    setEditingGame({
      id: newId,
      name: 'New Game Server',
      description: 'High-performance game hosting server with ultra-low ping and DDoS protection.',
      icon: '/icons/minecraft-icon.webp',
      banner: '/banners/minecraft-banners.webp',
      featured: false,
      startingAt: '$5.00/mo',
      primaryColor: '#3B82F6',
      plans: {
        budget: [
          {
            id: `${newId}-plan-1`,
            name: 'Basic Tier',
            type: 'budget',
            ram: '4 GB',
            cpu: 'Unmetered',
            storage: '50 GB NVMe',
            price: 5.0,
            orderLink: 'https://example.com/order',
          },
        ],
        premium: [],
      },
    });
    setIsNewGame(true);
    setModalOpen(true);
  };

  const handleOpenEditGame = (game: GameItem) => {
    setEditingGame(JSON.parse(JSON.stringify(game)));
    setIsNewGame(false);
    setModalOpen(true);
  };

  const handleSaveModal = () => {
    if (!editingGame || !config) return;

    let updatedGames: GameItem[];
    if (isNewGame) {
      updatedGames = [...config.games, editingGame];
    } else {
      updatedGames = config.games.map((g) =>
        g.id === editingGame.id ? editingGame : g
      );
    }

    setConfig({ ...config, games: updatedGames });
    setModalOpen(false);
    setEditingGame(null);
    toast(isNewGame ? 'Game created. Click Save Changes to apply.' : 'Game updated locally.');
  };

  const handleDeleteGame = (gameId: string) => {
    if (!config) return;
    if (!confirm('Are you sure you want to delete this game?')) return;

    setConfig({
      ...config,
      games: config.games.filter((g) => g.id !== gameId),
    });
    toast('Game removed. Click Save Changes to commit.', 'info');
  };

  const handleAddSubPlan = () => {
    if (!editingGame) return;
    const currentList = editingGame.plans[selectedPlanTab] || [];
    const newPlan: GameSubPlan = {
      id: `${editingGame.id}-${selectedPlanTab}-${Date.now().toString().slice(-3)}`,
      name: `${editingGame.name} Plan`,
      type: selectedPlanTab,
      ram: '8 GB',
      cpu: 'Unmetered',
      storage: '100 GB SSD',
      price: 10.0,
      orderLink: 'https://example.com/order',
    };

    setEditingGame({
      ...editingGame,
      plans: {
        ...editingGame.plans,
        [selectedPlanTab]: [...currentList, newPlan],
      },
    });
  };

  const handleDeleteSubPlan = (index: number) => {
    if (!editingGame) return;
    const currentList = [...(editingGame.plans[selectedPlanTab] || [])];
    currentList.splice(index, 1);
    setEditingGame({
      ...editingGame,
      plans: {
        ...editingGame.plans,
        [selectedPlanTab]: currentList,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-gray-400 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
          <span>Loading games database...</span>
        </div>
      </div>
    );
  }

  if (!config) return null;

  const filteredGames = config.games.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <Gamepad2 className="w-4 h-4" />
            <span>Games Portfolio</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Game Server Catalog
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage supported game servers, starting prices, banners, and RAM/CPU package tiers.
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

      {/* Search and Add Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0e121c] border border-white/10">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search game by title or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#141824] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={handleOpenAddGame}
          className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Game</span>
        </button>
      </div>

      {/* Games List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGames.map((game) => {
          const budgetCount = game.plans?.budget?.length || 0;
          const premiumCount = game.plans?.premium?.length || 0;

          return (
            <div
              key={game.id}
              className="rounded-2xl bg-[#0e121c] border border-white/10 overflow-hidden hover:border-white/20 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Banner Header */}
                <div className="h-28 bg-[#141824] relative overflow-hidden flex items-center justify-center">
                  {game.banner ? (
                    <img
                      src={game.banner}
                      alt={game.name}
                      className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <Gamepad2 className="w-8 h-8 text-gray-400" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e121c] via-[#0e121c]/40 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {game.featured && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-amber-300" />
                        Featured
                      </span>
                    )}
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: game.primaryColor || '#3B82F6' }}
                      title={`Accent Color: ${game.primaryColor}`}
                    />
                  </div>

                  <div className="absolute bottom-3 left-4 flex items-center gap-2.5">
                    {game.icon && (
                      <div className="w-8 h-8 rounded-lg bg-black/60 p-1 border border-white/20 overflow-hidden shrink-0">
                        <img src={game.icon} alt="" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-white drop-shadow-md">{game.name}</h3>
                      <span className="text-[10px] text-gray-400 font-mono drop-shadow">{game.id}</span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-3">
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {game.description}
                  </p>

                  <div className="flex items-center justify-between text-xs py-2 border-y border-white/5">
                    <span className="text-gray-400">Starting Price:</span>
                    <span className="text-emerald-400 font-bold">{game.startingAt}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-gray-400">
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">
                      Budget: {budgetCount} tiers
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">
                      Premium: {premiumCount} tiers
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 pt-0 flex items-center justify-between">
                <button
                  onClick={() => handleOpenEditGame(game)}
                  className="flex-1 mr-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Configure Game</span>
                </button>
                <button
                  onClick={() => handleDeleteGame(game.id)}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors"
                  title="Delete Game"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredGames.length === 0 && (
          <div className="col-span-full p-8 text-center rounded-2xl bg-[#0e121c] border border-dashed border-white/10 text-gray-400 text-xs">
            No games found matching &ldquo;{search}&rdquo;.
          </div>
        )}
      </div>

      {/* Add / Edit Game Modal */}
      {modalOpen && editingGame && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e121c] border border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">
                {isNewGame ? 'Add New Game Server' : `Configure: ${editingGame.name}`}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* General Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Game ID (Slug)</label>
                <input
                  type="text"
                  value={editingGame.id}
                  disabled={!isNewGame}
                  onChange={(e) => setEditingGame({ ...editingGame, id: e.target.value })}
                  className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Game Name</label>
                <input
                  type="text"
                  value={editingGame.name}
                  onChange={(e) => setEditingGame({ ...editingGame, name: e.target.value })}
                  className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingGame.description}
                  onChange={(e) => setEditingGame({ ...editingGame, description: e.target.value })}
                  className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Starting Price Tag</label>
                <input
                  type="text"
                  value={editingGame.startingAt}
                  onChange={(e) => setEditingGame({ ...editingGame, startingAt: e.target.value })}
                  placeholder="$4.00/mo"
                  className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Accent Color (Hex)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={editingGame.primaryColor || '#3B82F6'}
                    onChange={(e) => setEditingGame({ ...editingGame, primaryColor: e.target.value })}
                    className="w-9 h-9 rounded-lg bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editingGame.primaryColor || '#3B82F6'}
                    onChange={(e) => setEditingGame({ ...editingGame, primaryColor: e.target.value })}
                    className="flex-1 bg-[#141824] border border-white/10 rounded-xl p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Icon Path / URL</label>
                <input
                  type="text"
                  value={editingGame.icon}
                  onChange={(e) => setEditingGame({ ...editingGame, icon: e.target.value })}
                  className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Banner Path / URL</label>
                <input
                  type="text"
                  value={editingGame.banner}
                  onChange={(e) => setEditingGame({ ...editingGame, banner: e.target.value })}
                  className="w-full bg-[#141824] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featuredGame"
                  checked={editingGame.featured}
                  onChange={(e) => setEditingGame({ ...editingGame, featured: e.target.checked })}
                  className="rounded border-white/10 bg-[#141824] text-blue-600 w-4 h-4"
                />
                <label htmlFor="featuredGame" className="text-gray-300 text-xs cursor-pointer font-medium">
                  Feature this game prominently on landing page
                </label>
              </div>
            </div>

            {/* Plan Tiers Management */}
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPlanTab('budget')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      selectedPlanTab === 'budget'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    Budget Plans ({(editingGame.plans?.budget || []).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPlanTab('premium')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      selectedPlanTab === 'premium'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    Premium Plans ({(editingGame.plans?.premium || []).length})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddSubPlan}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 text-xs font-medium flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Tier</span>
                </button>
              </div>

              {/* Sub-plans table / list */}
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {(editingGame.plans[selectedPlanTab] || []).map((subPlan, idx) => (
                  <div
                    key={subPlan.id || idx}
                    className="p-3 rounded-xl bg-[#141824] border border-white/5 grid grid-cols-1 sm:grid-cols-5 gap-2 items-center text-xs"
                  >
                    <div className="sm:col-span-1">
                      <label className="text-[10px] text-gray-500 block">Tier Name</label>
                      <input
                        type="text"
                        value={subPlan.name}
                        onChange={(e) => {
                          const updated = [...(editingGame.plans[selectedPlanTab] || [])];
                          updated[idx].name = e.target.value;
                          setEditingGame({
                            ...editingGame,
                            plans: { ...editingGame.plans, [selectedPlanTab]: updated },
                          });
                        }}
                        className="w-full bg-[#0e121c] border border-white/10 rounded p-1 text-white text-xs"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="text-[10px] text-gray-500 block">RAM</label>
                      <input
                        type="text"
                        value={subPlan.ram}
                        onChange={(e) => {
                          const updated = [...(editingGame.plans[selectedPlanTab] || [])];
                          updated[idx].ram = e.target.value;
                          setEditingGame({
                            ...editingGame,
                            plans: { ...editingGame.plans, [selectedPlanTab]: updated },
                          });
                        }}
                        className="w-full bg-[#0e121c] border border-white/10 rounded p-1 text-white text-xs"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="text-[10px] text-gray-500 block">Storage</label>
                      <input
                        type="text"
                        value={subPlan.storage}
                        onChange={(e) => {
                          const updated = [...(editingGame.plans[selectedPlanTab] || [])];
                          updated[idx].storage = e.target.value;
                          setEditingGame({
                            ...editingGame,
                            plans: { ...editingGame.plans, [selectedPlanTab]: updated },
                          });
                        }}
                        className="w-full bg-[#0e121c] border border-white/10 rounded p-1 text-white text-xs"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="text-[10px] text-gray-500 block">Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={subPlan.price}
                        onChange={(e) => {
                          const updated = [...(editingGame.plans[selectedPlanTab] || [])];
                          updated[idx].price = parseFloat(e.target.value) || 0;
                          setEditingGame({
                            ...editingGame,
                            plans: { ...editingGame.plans, [selectedPlanTab]: updated },
                          });
                        }}
                        className="w-full bg-[#0e121c] border border-white/10 rounded p-1 text-white text-xs"
                      />
                    </div>
                    <div className="sm:col-span-1 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => handleDeleteSubPlan(idx)}
                        className="p-1.5 rounded text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Remove Tier"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {(editingGame.plans[selectedPlanTab] || []).length === 0 && (
                  <div className="text-center p-4 text-gray-500 text-xs">
                    No {selectedPlanTab} tiers yet. Click &ldquo;Add Tier&rdquo; to add one.
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
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
                <span>Apply Game</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

