"use client";
import { useEffect, useState } from "react";
import { PawPrint, Swords, Trophy, Crown, Zap, Shield } from "lucide-react";
import { styles } from "@/lib/styles";

interface PetStats {
  totalPets: number;
  totalEvolved: number;
  avgLevel: number;
  maxLevel: number;
  dungeonClears: number;
  bossKills: number;
  pvpWins: number;
  topPets: { userId: string; name: string; petId: string; level: number; class: string; element: string; active: number }[];
  popularPets: { petId: string; count: number }[];
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString("id-ID");
}

export default function PetsPage() {
  const [stats, setStats] = useState<PetStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bot/pets").then(r => r.json()).then(data => {
      if (!data.error) setStats(data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-400 border-t-transparent"></div>
      </div>
    );
  }

  if (!stats) {
    return <div className={`${styles.card} border-red-500/20`}><p className="text-red-400">Failed to load pet data</p></div>;
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <PawPrint className="text-purple-400" /> Pet & Battle System
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {stats.totalPets} total pets &bull; Avg Level {stats.avgLevel} &bull; Max Level {stats.maxLevel}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox icon={PawPrint} label="Total Pets" value={formatNumber(stats.totalPets)} color="text-purple-400" />
        <StatBox icon={Zap} label="Evolved" value={formatNumber(stats.totalEvolved)} color="text-yellow-400" />
        <StatBox icon={Swords} label="Dungeon Clears" value={formatNumber(stats.dungeonClears)} color="text-blue-400" />
        <StatBox icon={Crown} label="Boss Kills" value={formatNumber(stats.bossKills)} color="text-red-400" />
      </div>

      {/* Battle Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-dark-800 border border-dark-600 rounded-lg p-4 text-center">
          <Swords size={20} className="text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{formatNumber(stats.dungeonClears)}</p>
          <p className="text-xs text-gray-500">Dungeon Clears</p>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-lg p-4 text-center">
          <Crown size={20} className="text-red-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{formatNumber(stats.bossKills)}</p>
          <p className="text-xs text-gray-500">Boss Kills</p>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-lg p-4 text-center">
          <Shield size={20} className="text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{formatNumber(stats.pvpWins)}</p>
          <p className="text-xs text-gray-500">PvP Wins</p>
        </div>
      </div>

      {/* Top Pets Leaderboard */}
      <div className={styles.card}>
        <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
          <Trophy size={16} className="text-yellow-400" /> Strongest Pets
        </h3>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-600 text-gray-500 text-left text-xs">
                <th className="pb-2 pl-2">#</th>
                <th className="pb-2">Pet Name</th>
                <th className="pb-2">Owner</th>
                <th className="pb-2">Class</th>
                <th className="pb-2">Element</th>
                <th className="pb-2 text-right pr-2">Level</th>
              </tr>
            </thead>
            <tbody>
              {stats.topPets.map((pet, i) => (
                <tr key={i} className="border-b border-dark-700/50 hover:bg-dark-700/30">
                  <td className="py-2.5 pl-2 text-sm">{["🥇","🥈","🥉"][i] || `${i+1}`}</td>
                  <td className="py-2.5 font-medium text-white">{pet.name}</td>
                  <td className="py-2.5 font-mono text-xs text-gray-400">{pet.userId.substring(0, 10)}...</td>
                  <td className="py-2.5 text-xs text-accent-primary capitalize">{pet.class}</td>
                  <td className="py-2.5 text-xs text-accent-secondary capitalize">{pet.element}</td>
                  <td className="py-2.5 text-right pr-2 font-bold text-white">Lv.{pet.level}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {stats.topPets.length === 0 && <p className="text-xs text-gray-500 text-center py-4">No pets yet</p>}
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
