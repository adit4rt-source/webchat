"use client";
import { useEffect, useState } from "react";
import { Gamepad2, Coins, Trophy, Dice1 } from "lucide-react";
import { styles } from "@/lib/styles";
import UserCell from "@/components/UserCell";

interface CasinoStats {
  coinflipWins: number;
  slotWins: number;
  slotTotalWinnings: number;
  topGamblers: { userId: string; total: number }[];
  topCoinflip: { userId: string; wins: number }[];
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString("id-ID");
}

export default function CasinoPage() {
  const [stats, setStats] = useState<CasinoStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bot/casino").then(r => r.json()).then(data => {
      if (!data.error) setStats(data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-400 border-t-transparent"></div>
      </div>
    );
  }

  if (!stats) {
    return <div className={`${styles.card} border-red-500/20`}><p className="text-red-400">Failed to load casino data</p></div>;
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Gamepad2 className="text-yellow-400" /> Casino System
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Coinflip, Slot Machine, Blackjack stats
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatBox icon={Dice1} label="Coinflip Wins" value={formatNumber(stats.coinflipWins)} color="text-blue-400" />
        <StatBox icon={Gamepad2} label="Slot Wins" value={formatNumber(stats.slotWins)} color="text-purple-400" />
        <StatBox icon={Coins} label="Slot Winnings" value={`${formatNumber(stats.slotTotalWinnings)}`} color="text-yellow-400" />
      </div>

      {/* Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Slot Winners */}
        <div className={styles.card}>
          <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
            <Coins size={16} className="text-yellow-400" /> Top Slot Winners (Total Winnings)
          </h3>
          <div className="space-y-2">
            {stats.topGamblers.map((row: any, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 px-3 bg-dark-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-500 w-6">{["🥇","🥈","🥉"][i] || `${i+1}.`}</span>
                  <UserCell user={row._user} userId={row.userId} />
                </div>
                <span className="text-sm font-bold text-yellow-400">{formatNumber(row.total)}</span>
              </div>
            ))}
            {stats.topGamblers.length === 0 && <p className="text-xs text-gray-500 text-center py-4">No data yet</p>}
          </div>
        </div>

        {/* Top Coinflip */}
        <div className={styles.card}>
          <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
            <Trophy size={16} className="text-blue-400" /> Top Coinflip Players (Wins)
          </h3>
          <div className="space-y-2">
            {stats.topCoinflip.map((row: any, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 px-3 bg-dark-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-500 w-6">{["🥇","🥈","🥉"][i] || `${i+1}.`}</span>
                  <UserCell user={row._user} userId={row.userId} />
                </div>
                <span className="text-sm font-bold text-blue-400">{formatNumber(row.wins)} wins</span>
              </div>
            ))}
            {stats.topCoinflip.length === 0 && <p className="text-xs text-gray-500 text-center py-4">No data yet</p>}
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
