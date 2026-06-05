"use client";
import { useEffect, useState } from "react";
import { Settings, Server, Globe, Clock, Bot, Hash, Shield, Bell } from "lucide-react";
import { styles } from "@/lib/styles";
import { useGuild } from "@/lib/GuildContext";

export default function GeneralPage() {
  const { selectedGuild } = useGuild();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bot/stats").then(r => r.json()).then(d => {
      if (!d.error) setStats(d);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-primary border-t-transparent"></div></div>;

  function formatUptime(s: number) { const d = Math.floor(s/86400), h = Math.floor((s%86400)/3600), m = Math.floor((s%3600)/60); if (d > 0) return `${d}d ${h}h ${m}m`; if (h > 0) return `${h}h ${m}m`; return `${m}m`; }

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Settings className="text-accent-primary" /> General
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Server & bot configuration overview</p>
      </div>

      {/* Server Info */}
      {selectedGuild && (
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
          <div className="flex items-center gap-4">
            {selectedGuild.icon ? (
              <img src={selectedGuild.icon} alt="" className="w-16 h-16 rounded-xl ring-2 ring-dark-500" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-accent-primary/20 flex items-center justify-center text-2xl font-bold text-accent-primary">{selectedGuild.name[0]}</div>
            )}
            <div>
              <h2 className="text-xl font-bold text-white">{selectedGuild.name}</h2>
              <p className="text-sm text-gray-400 mt-0.5">{selectedGuild.memberCount} members &bull; ID: {selectedGuild.id}</p>
            </div>
            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400 font-medium">Bot Active</span>
            </div>
          </div>
        </div>
      )}

      {/* Bot Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoCard icon={Bot} label="Bot Version" value={stats?.version || "?"} color="text-accent-primary" />
        <InfoCard icon={Globe} label="Mode" value={stats?.globalMode ? "Global" : "Per-Guild"} color="text-neon-blue" />
        <InfoCard icon={Clock} label="Uptime" value={stats ? formatUptime(stats.uptime) : "—"} color="text-neon-green" />
        <InfoCard icon={Server} label="Total Servers" value={String(stats?.guilds || 0)} color="text-neon-purple" />
      </div>

      {/* Features Status */}
      <div className={styles.card}>
        <h3 className="text-sm font-medium text-gray-400 mb-4">Active Systems</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <FeatureBadge name="Leveling" active={true} />
          <FeatureBadge name="Economy" active={true} />
          <FeatureBadge name="Fishing" active={true} />
          <FeatureBadge name="Farming" active={true} />
          <FeatureBadge name="Pet System" active={true} />
          <FeatureBadge name="Casino" active={true} />
          <FeatureBadge name="Quests" active={true} />
          <FeatureBadge name="AutoMod" active={true} />
          <FeatureBadge name="Achievements" active={true} />
          <FeatureBadge name="Streak" active={true} />
          <FeatureBadge name="World Boss" active={true} />
          <FeatureBadge name="Expedition" active={true} />
        </div>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className={styles.card}>
          <h3 className="text-sm font-medium text-gray-400 mb-4">Database Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatRow label="Users" value={stats.users} />
            <StatRow label="Commands Used" value={stats.stats?.totalCommands || 0} />
            <StatRow label="Total Money" value={stats.stats?.totalMoney || 0} />
            <StatRow label="Fish Caught" value={stats.stats?.totalFishCaught || 0} />
            <StatRow label="Farm Harvests" value={stats.stats?.totalFarmHarvests || 0} />
            <StatRow label="Achievements" value={stats.stats?.totalAchievements || 0} />
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2"><Icon size={14} className={color} /><span className="text-[11px] text-gray-500 uppercase">{label}</span></div>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function FeatureBadge({ name, active }: { name: string; active: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${active ? "bg-green-500/5 border-green-500/20" : "bg-dark-700 border-dark-500"}`}>
      <div className={`w-2 h-2 rounded-full ${active ? "bg-green-400" : "bg-gray-600"}`} />
      <span className={`text-xs font-medium ${active ? "text-green-400" : "text-gray-500"}`}>{name}</span>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  const fmt = value >= 1000000 ? `${(value/1000000).toFixed(1)}M` : value >= 1000 ? `${(value/1000).toFixed(1)}K` : String(value);
  return (
    <div className="flex items-center justify-between py-2 border-b border-dark-600/50 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-bold text-white">{fmt}</span>
    </div>
  );
}
