"use client";
import { useEffect, useState } from "react";
import { Users, Fish, Sprout, PawPrint, Trophy, Coins, Activity, TrendingUp, Zap, BookOpen } from "lucide-react";
import { styles } from "@/lib/styles";

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
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-primary border-t-transparent"></div>
          <p className="text-sm text-gray-500">Loading bot data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.card} border-red-500/20 bg-red-500/5`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
            <Activity size={20} className="text-red-400" />
          </div>
          <div>
            <p className="text-red-400 font-medium">Bot Offline</p>
            <p className="text-sm text-gray-400 mt-0.5">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Bot statistics and server overview
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400 font-medium">Online</span>
        </div>
      </div>

      {/* Top Stats — Big 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Members"
          value={formatNumber(stats.users)}
          icon={Users}
          color="blue"
          subtitle={`across ${stats.guilds} server${stats.guilds > 1 ? 's' : ''}`}
        />
        <StatCard
          label="Commands Used"
          value={formatNumber(stats.stats.totalCommands)}
          icon={Zap}
          color="red"
          subtitle="all time"
        />
        <StatCard
          label="Economy"
          value={`${formatNumber(stats.stats.totalMoney)}`}
          icon={Coins}
          color="yellow"
          subtitle="total money in circulation"
        />
      </div>

      {/* Game Stats Grid */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Game Systems</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MiniStat icon={Fish} label="Fish Caught" value={formatNumber(stats.stats.totalFishCaught)} color="text-blue-400" />
          <MiniStat icon={Sprout} label="Harvests" value={formatNumber(stats.stats.totalFarmHarvests)} color="text-green-400" />
          <MiniStat icon={PawPrint} label="Pets" value={formatNumber(stats.stats.totalPets)} color="text-purple-400" />
          <MiniStat icon={Trophy} label="Achievements" value={formatNumber(stats.stats.totalAchievements)} color="text-yellow-400" />
        </div>
      </div>

      {/* Bot Info Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Status */}
        <div className={`${styles.card} col-span-1`}>
          <h3 className="text-sm font-medium text-gray-400 mb-4">Bot Info</h3>
          <div className="space-y-3">
            <InfoRow label="Version" value={`v${stats.version}`} />
            <InfoRow label="Mode" value={stats.globalMode ? "🌐 Global" : "🏠 Per-Guild"} />
            <InfoRow label="Uptime" value={formatUptime(stats.uptime)} />
            <InfoRow label="Servers" value={String(stats.guilds)} />
            <InfoRow label="Framework" value="discord.js v14" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`${styles.card} col-span-1 lg:col-span-2`}>
          <h3 className="text-sm font-medium text-gray-400 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <QuickAction href="/dashboard/features" icon={BookOpen} label="All Features" desc="Browse every bot system" />
            <QuickAction href="/dashboard/users" icon={Users} label="Lookup User" desc="Search player by ID" />
            <QuickAction href="/dashboard/leaderboard" icon={Trophy} label="Leaderboard" desc="View top players" />
            <QuickAction href="/dashboard/admin" icon={TrendingUp} label="Admin Panel" desc="Manage bot data" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== COMPONENTS ====================

function StatCard({ label, value, icon: Icon, color, subtitle }: { label: string; value: string; icon: any; color: string; subtitle: string }) {
  const colorMap: Record<string, string> = {
    blue: "from-blue-500/10 to-transparent border-blue-500/20 text-blue-400",
    red: "from-red-500/10 to-transparent border-red-500/20 text-red-400",
    purple: "from-purple-500/10 to-transparent border-purple-500/20 text-purple-400",
    yellow: "from-yellow-500/10 to-transparent border-yellow-500/20 text-yellow-400",
    green: "from-green-500/10 to-transparent border-green-500/20 text-green-400",
  };
  const c = colorMap[color] || colorMap.blue;
  const textColor = c.split(" ").find(s => s.startsWith("text-")) || "text-blue-400";

  return (
    <div className={`bg-gradient-to-br ${c.replace(textColor, '')} bg-dark-800 border rounded-xl p-5 transition-all hover:border-opacity-50`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
        <Icon size={18} className={`${textColor} opacity-70`} />
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-lg p-3.5 hover:border-dark-500 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={color} />
        <span className="text-[11px] text-gray-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-dark-600/50 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs text-white font-medium">{value}</span>
    </div>
  );
}

function QuickAction({ href, icon: Icon, label, desc }: { href: string; icon: any; label: string; desc: string }) {
  return (
    <a href={href} className="flex items-center gap-3 p-3 bg-dark-700/50 border border-dark-600 rounded-lg hover:border-accent-primary/30 hover:bg-dark-700 transition-all group">
      <div className="w-8 h-8 rounded-md bg-accent-primary/10 flex items-center justify-center group-hover:bg-accent-primary/20 transition-colors">
        <Icon size={16} className="text-accent-primary" />
      </div>
      <div>
        <p className="text-xs font-medium text-white">{label}</p>
        <p className="text-[10px] text-gray-500">{desc}</p>
      </div>
    </a>
  );
}
