"use client";
import { useEffect, useState } from "react";
import { Sprout, Wheat, Sparkles, Leaf, Trophy } from "lucide-react";
import { styles } from "@/lib/styles";

interface FarmingStats {
  totalHarvests: number;
  totalCrafts: number;
  totalMutations: number;
  activePlots: number;
  totalCropTypes: number;
  topFarmers: { userId: string; total: number }[];
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString("id-ID");
}

export default function FarmingPage() {
  const [stats, setStats] = useState<FarmingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bot/farming").then(r => r.json()).then(data => {
      if (!data.error) setStats(data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-400 border-t-transparent"></div>
      </div>
    );
  }

  if (!stats) {
    return <div className={`${styles.card} border-red-500/20`}><p className="text-red-400">Failed to load farming data</p></div>;
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Sprout className="text-green-400" /> Farming System
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {stats.totalCropTypes} crop types &bull; {stats.activePlots} active plots growing
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox icon={Wheat} label="Total Harvests" value={formatNumber(stats.totalHarvests)} color="text-green-400" />
        <StatBox icon={Sparkles} label="Mutations" value={formatNumber(stats.totalMutations)} color="text-pink-400" />
        <StatBox icon={Leaf} label="Active Plots" value={formatNumber(stats.activePlots)} color="text-emerald-400" />
        <StatBox icon={Sprout} label="Crafts Made" value={formatNumber(stats.totalCrafts)} color="text-yellow-400" />
      </div>

      {/* Top Farmers Leaderboard */}
      <div className={styles.card}>
        <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
          <Trophy size={16} className="text-yellow-400" /> Top Farmers
        </h3>
        <div className="space-y-2">
          {stats.topFarmers.map((row, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 px-3 bg-dark-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-500 w-6">{["🥇","🥈","🥉"][i] || `${i+1}.`}</span>
                <span className="text-xs font-mono text-gray-300">{row.userId}</span>
              </div>
              <span className="text-sm font-bold text-white">{formatNumber(row.total)} harvests</span>
            </div>
          ))}
          {stats.topFarmers.length === 0 && <p className="text-xs text-gray-500 text-center py-4">No data yet</p>}
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
