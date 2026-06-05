"use client";
import { useEffect, useState } from "react";
import { Users, Server, Fish, Sprout, PawPrint, Trophy, Clock, Coins } from "lucide-react";

interface BotStats {
  users: number;
  guilds: number;
  uptime: number;
  version: string;
  globalMode: boolean;
  stats: {
    totalFishCaught: number;
    totalFarmHarvests: number;
    totalPets: number;
    totalAchievements: number;
    totalMoney: number;
    totalCommands: number;
  };
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString("id-ID");
}

export default function DashboardPage() {
  const [stats, setStats] = useState<BotStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/bot/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setStats(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-accent-danger/30 bg-red-500/5">
        <p className="text-accent-danger font-medium">Error connecting to bot API</p>
        <p className="text-sm text-gray-400 mt-1">{error}</p>
        <p className="text-xs text-gray-500 mt-3">Pastikan bot sedang online dan API server aktif di port 25922.</p>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { label: "Total Users", value: formatNumber(stats.users), icon: Users, color: "text-neon-blue" },
    { label: "Servers", value: formatNumber(stats.guilds), icon: Server, color: "text-neon-purple" },
    { label: "Uptime", value: formatUptime(stats.uptime), icon: Clock, color: "text-neon-green" },
    { label: "Commands Used", value: formatNumber(stats.stats.totalCommands), icon: Trophy, color: "text-neon-pink" },
    { label: "Fish Caught", value: formatNumber(stats.stats.totalFishCaught), icon: Fish, color: "text-blue-400" },
    { label: "Farm Harvests", value: formatNumber(stats.stats.totalFarmHarvests), icon: Sprout, color: "text-green-400" },
    { label: "Total Pets", value: formatNumber(stats.stats.totalPets), icon: PawPrint, color: "text-purple-400" },
    { label: "Total Money", value: formatNumber(stats.stats.totalMoney), icon: Coins, color: "text-yellow-400" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">
          Bot v{stats.version} &bull; {stats.globalMode ? "🌐 Global Mode" : "🏠 Per-Guild Mode"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="stat-card">
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{card.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
                </div>
                <Icon size={32} className={`${card.color} opacity-60`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Achievements */}
        <div className="card">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Trophy size={18} className="text-yellow-400" /> Achievements Unlocked
          </h3>
          <p className="text-3xl font-bold text-accent-primary">{formatNumber(stats.stats.totalAchievements)}</p>
          <p className="text-sm text-gray-500 mt-1">Total badges earned by all players</p>
        </div>

        {/* Bot Status */}
        <div className="card">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            Bot Status
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>
              <span className="text-green-400 font-medium">Online</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Version</span>
              <span className="text-white">v{stats.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Mode</span>
              <span className="text-accent-primary">{stats.globalMode ? "Global" : "Per-Guild"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Uptime</span>
              <span className="text-white">{formatUptime(stats.uptime)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
