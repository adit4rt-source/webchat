"use client";
import { useEffect, useState } from "react";
import { Pickaxe, Layers, Mountain, Trophy, Users, Gem, Flame, Skull, Award } from "lucide-react";
import { styles } from "@/lib/styles";
import UserCell from "@/components/UserCell";

interface Layer {
  id: string;
  name: string;
  min: number;
  max: number;
  hazard: number;
}

interface PickaxeType {
  id: string;
  name: string;
  tier: string;
  maxDepth: number;
}

interface Ore {
  id: string;
  name: string;
  rarity: string;
  value: number;
}

interface MinerEntry {
  userId: string;
  level: number;
  prestige: number;
  totalDigs: number;
  depth: number;
  _user?: any;
}

interface MiningStats {
  totalMiners: number;
  maxDepthReached: number;
  totalDigs: number;
  totalOreSold: number;
  totalBarsSmelted: number;
  totalItemsSmithed: number;
  totalHazards: number;
  totalMonstersDefeated: number;
  totalGemsFused: number;
  totalCoreClears: number;
  totalPrestige: number;
  totalLayers: number;
  totalPickaxes: number;
  totalOreTypes: number;
  layers: Layer[];
  pickaxes: PickaxeType[];
  ores: Ore[];
  topMiners: MinerEntry[];
  topPrestige: MinerEntry[];
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString("id-ID");
}

function getTierColor(tier: string): string {
  switch (tier.toLowerCase()) {
    case "legendary": return "text-yellow-400";
    case "epic": return "text-purple-400";
    case "rare": return "text-blue-400";
    case "uncommon": return "text-green-400";
    default: return "text-gray-400";
  }
}

function getRarityColor(rarity: string): string {
  switch (rarity.toLowerCase()) {
    case "legendary": return "text-yellow-400 bg-yellow-400/10";
    case "epic": return "text-purple-400 bg-purple-400/10";
    case "rare": return "text-blue-400 bg-blue-400/10";
    case "uncommon": return "text-green-400 bg-green-400/10";
    default: return "text-gray-400 bg-gray-400/10";
  }
}

export default function MiningPage() {
  const [stats, setStats] = useState<MiningStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bot/mining").then(r => r.json()).then(data => {
      if (!data.error) setStats(data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-400 border-t-transparent"></div>
      </div>
    );
  }

  if (!stats) {
    return <div className={`${styles.card} border-red-500/20`}><p className="text-red-400">Failed to load mining data</p></div>;
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Pickaxe className="text-orange-400" /> Mining System
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Dig deep, smelt ores, fuse gems, and prestige
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox icon={Users} label="Total Miners" value={formatNumber(stats.totalMiners)} color="text-orange-400" />
        <StatBox icon={Pickaxe} label="Total Digs" value={formatNumber(stats.totalDigs)} color="text-amber-400" />
        <StatBox icon={Mountain} label="Max Depth" value={formatNumber(stats.maxDepthReached)} color="text-red-400" />
        <StatBox icon={Gem} label="Ore Sold" value={formatNumber(stats.totalOreSold)} color="text-emerald-400" />
        <StatBox icon={Flame} label="Bars Smelted" value={formatNumber(stats.totalBarsSmelted)} color="text-orange-500" />
        <StatBox icon={Gem} label="Gems Fused" value={formatNumber(stats.totalGemsFused)} color="text-purple-400" />
        <StatBox icon={Skull} label="Core Clears" value={formatNumber(stats.totalCoreClears)} color="text-red-500" />
        <StatBox icon={Award} label="Total Prestige" value={formatNumber(stats.totalPrestige)} color="text-yellow-400" />
      </div>

      {/* Mine Layers */}
      {stats.layers && stats.layers.length > 0 && (
        <div className={styles.card}>
          <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
            <Layers size={16} className="text-orange-400" /> Mine Layers ({stats.layers.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.layers.map((layer) => (
              <div key={layer.id} className="bg-dark-700/50 rounded-lg p-3 border border-dark-600/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">{layer.name}</span>
                  {layer.hazard > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-medium">
                      Hazard {layer.hazard}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Depth {layer.min} - {layer.max}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pickaxe Types */}
      {stats.pickaxes && stats.pickaxes.length > 0 && (
        <div className={styles.card}>
          <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
            <Pickaxe size={16} className="text-amber-400" /> Pickaxe Types ({stats.pickaxes.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.pickaxes.map((pick) => (
              <div key={pick.id} className="bg-dark-700/50 rounded-lg p-3 border border-dark-600/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">{pick.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${getTierColor(pick.tier)} bg-dark-600/50`}>
                    {pick.tier}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Max Depth: {pick.maxDepth}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Miners */}
        <div className={styles.card}>
          <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
            <Trophy size={16} className="text-orange-400" /> Top Miners (by Depth)
          </h3>
          <div className="space-y-2">
            {stats.topMiners.map((row, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 px-3 bg-dark-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-500 w-6">{["🥇","🥈","🥉"][i] || `${i+1}.`}</span>
                  <UserCell user={row._user} userId={row.userId} />
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-orange-400">Depth {row.depth}</span>
                  <p className="text-[10px] text-gray-500">Lv.{row.level} | {formatNumber(row.totalDigs)} digs</p>
                </div>
              </div>
            ))}
            {stats.topMiners.length === 0 && <p className="text-xs text-gray-500 text-center py-4">No data yet</p>}
          </div>
        </div>

        {/* Top Prestige */}
        <div className={styles.card}>
          <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
            <Award size={16} className="text-yellow-400" /> Top Prestige
          </h3>
          <div className="space-y-2">
            {stats.topPrestige.map((row, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 px-3 bg-dark-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-500 w-6">{["🥇","🥈","🥉"][i] || `${i+1}.`}</span>
                  <UserCell user={row._user} userId={row.userId} />
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-yellow-400">Prestige {row.prestige}</span>
                  <p className="text-[10px] text-gray-500">Lv.{row.level}</p>
                </div>
              </div>
            ))}
            {stats.topPrestige.length === 0 && <p className="text-xs text-gray-500 text-center py-4">No data yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-lg p-4 hover:border-dark-500 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={color} />
        <span className="text-[11px] text-gray-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  );
}
