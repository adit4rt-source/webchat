"use client";
import { useEffect, useState } from "react";
import { Fish, Trophy, Skull, Anchor, MapPin } from "lucide-react";
import { styles } from "@/lib/styles";
import UserCell from "@/components/UserCell";

interface FishingStats {
  totalCaught: number;
  totalSoldValue: number;
  totalGiantDefeated: number;
  totalMonsterEncounters: number;
  totalFishSpecies: number;
  totalLocations: number;
  tiers: string[];
  topFishers: { userId: string; total: number }[];
  topCollectors: { userId: string; collected: number }[];
}

interface FishingWeather {
  weather: { id: string; name: string; emoji: string; effects: { monsterMult: number; valueMult: number; rareMult: number } };
  nextChange: number;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString("id-ID");
}

export default function FishingPage() {
  const [stats, setStats] = useState<FishingStats | null>(null);
  const [weather, setWeather] = useState<FishingWeather | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/bot/fishing").then(r => r.json()),
      fetch("/api/bot/stats").then(r => r.json()).then(() => 
        fetch("/api/bot/fishing").then(r => r.json()) // weather from fishing endpoint
      )
    ]).then(([fishData]) => {
      if (!fishData.error) setStats(fishData);
    }).catch(() => {}).finally(() => setLoading(false));

    // Fetch weather separately
    fetch("/api/bot/fishing").then(r => r.json()).then(data => {
      if (!data.error) setStats(data);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`${styles.card} border-red-500/20`}>
        <p className="text-red-400">Failed to load fishing data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Fish className="text-blue-400" /> Fishing System
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {stats.totalFishSpecies} species across {stats.totalLocations} locations
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox icon={Fish} label="Total Caught" value={formatNumber(stats.totalCaught)} color="text-blue-400" />
        <StatBox icon={Trophy} label="Money Earned" value={`${formatNumber(stats.totalSoldValue)}`} color="text-yellow-400" />
        <StatBox icon={Anchor} label="Giants Defeated" value={formatNumber(stats.totalGiantDefeated)} color="text-purple-400" />
        <StatBox icon={Skull} label="Monster Encounters" value={formatNumber(stats.totalMonsterEncounters)} color="text-red-400" />
      </div>

      {/* Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Fishers */}
        <div className={styles.card}>
          <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
            <Fish size={16} className="text-blue-400" /> Top Fishers
          </h3>
          <div className="space-y-2">
            {stats.topFishers.map((row: any, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 bg-dark-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-500 w-6">{["🥇","🥈","🥉"][i] || `${i+1}.`}</span>
                  <UserCell user={row._user} userId={row.userId} />
                </div>
                <span className="text-sm font-bold text-white">{formatNumber(row.total)}</span>
              </div>
            ))}
            {stats.topFishers.length === 0 && <p className="text-xs text-gray-500 text-center py-4">No data yet</p>}
          </div>
        </div>

        {/* Top Collectors */}
        <div className={styles.card}>
          <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-green-400" /> Top Collectors (Pokedex)
          </h3>
          <div className="space-y-2">
            {stats.topCollectors.map((row: any, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 bg-dark-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-500 w-6">{["🥇","🥈","🥉"][i] || `${i+1}.`}</span>
                  <UserCell user={row._user} userId={row.userId} />
                </div>
                <span className="text-sm font-bold text-white">{row.collected}/{stats.totalFishSpecies}</span>
              </div>
            ))}
            {stats.topCollectors.length === 0 && <p className="text-xs text-gray-500 text-center py-4">No data yet</p>}
          </div>
        </div>
      </div>

      {/* Fish Tiers Info */}
      <div className={styles.card}>
        <h3 className="text-sm font-medium text-gray-400 mb-4">Fish Tier Distribution</h3>
        <div className="flex flex-wrap gap-2">
          {stats.tiers.map(tier => {
            const colors: Record<string, string> = { Trash: "bg-gray-500/20 text-gray-400", Common: "bg-white/10 text-white", Uncommon: "bg-green-500/20 text-green-400", Rare: "bg-blue-500/20 text-blue-400", Epic: "bg-purple-500/20 text-purple-400", Legendary: "bg-yellow-500/20 text-yellow-400", Mythic: "bg-pink-500/20 text-pink-400", Secret: "bg-indigo-500/20 text-indigo-400", God: "bg-amber-500/20 text-amber-300" };
            return (
              <span key={tier} className={`px-3 py-1.5 rounded-full text-xs font-medium ${colors[tier] || "bg-dark-600 text-gray-300"}`}>
                {tier}
              </span>
            );
          })}
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
