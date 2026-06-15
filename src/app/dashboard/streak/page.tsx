"use client";
import { useEffect, useState } from "react";
import { Flame, Search, Users, Trophy, ShieldCheck } from "lucide-react";
import { styles } from "@/lib/styles";
import UserCell from "@/components/UserCell";

interface StreakData {
  totalMembers: number;
  topCurrentStreak: number;
  claimedToday: number;
  leaderboard: {
    userId: string;
    count: number;
    highest: number;
    freezes: number;
    claimedToday: boolean;
    last_date: string;
    _user?: { userId: string; username: string; displayName: string; avatar: string | null };
  }[];
}

export default function StreakPage() {
  const [data, setData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"current" | "highest">("current");

  useEffect(() => { loadData(); }, [sortBy]);

  function loadData(search = "") {
    setLoading(true);
    fetch(`/api/bot/streak?sort=${sortBy}&search=${search}`).then(r => r.json()).then(d => {
      if (!d.error) setData(d);
    }).catch(() => {}).finally(() => setLoading(false));
  }

  if (loading && !data) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-400 border-t-transparent"></div></div>;
  }

  if (!data) return <div className={`${styles.card} border-red-500/20`}><p className="text-red-400">Failed to load streak data</p></div>;

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Flame className="text-orange-400" /> Daily Streak
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">View and track daily login streaks for all members</p>
        </div>
        <a href="/dashboard/streak/settings" className="px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-xs text-gray-300 hover:text-white hover:border-accent-primary/30 transition-all flex items-center gap-2">
          <ShieldCheck size={14} /> Settings
        </a>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-accent-primary">{data.totalMembers}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Active Streaks</p>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-orange-400">🔥 {data.topCurrentStreak}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Top Current Streak</p>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-neon-green">{data.claimedToday}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Claimed Today</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-medium text-white flex items-center gap-2">
            <Trophy size={16} className="text-yellow-400" /> Leaderboard
          </h2>
          <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-bold rounded-md">{data.totalMembers}</span>
          <div className="flex bg-dark-700 rounded-lg p-0.5">
            <button onClick={() => setSortBy("current")} className={`px-3 py-1 text-xs rounded-md transition-colors ${sortBy === "current" ? "bg-accent-primary text-white" : "text-gray-400 hover:text-white"}`}>Current</button>
            <button onClick={() => setSortBy("highest")} className={`px-3 py-1 text-xs rounded-md transition-colors ${sortBy === "highest" ? "bg-accent-primary text-white" : "text-gray-400 hover:text-white"}`}>Highest</button>
          </div>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="pl-8 pr-3 py-1.5 text-xs bg-dark-700 border border-dark-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-primary/50 w-48"
            placeholder="Search by user ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && loadData(searchQuery)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-dark-600 text-xs text-gray-500 font-medium uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-4">User</div>
          <div className="col-span-2 text-center">Current</div>
          <div className="col-span-2 text-center">Highest</div>
          <div className="col-span-1 text-center">Freezes</div>
          <div className="col-span-1 text-center">Today</div>
          <div className="col-span-1 text-right">Last Claim</div>
        </div>

        <div className="divide-y divide-dark-700/50">
          {data.leaderboard.map((row, i) => {
            const medal = ["🥇", "🥈", "🥉"][i];
            const daysAgo = row.last_date ? getDaysAgo(row.last_date) : "—";

            return (
              <div key={row.userId} className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-dark-700/30 transition-colors">
                <div className="col-span-1">
                  {medal ? <span className="text-lg">{medal}</span> : <span className="text-sm text-gray-500">{i + 1}</span>}
                </div>
                <div className="col-span-4">
                  <UserCell user={row._user} userId={row.userId} />
                </div>
                <div className="col-span-2 text-center">
                  <span className="text-sm font-bold text-white">{row.count}</span>
                </div>
                <div className="col-span-2 text-center">
                  <span className="text-sm font-semibold text-gray-300">{row.highest}</span>
                </div>
                <div className="col-span-1 text-center">
                  <span className="text-sm text-gray-400">{row.freezes}</span>
                </div>
                <div className="col-span-1 text-center">
                  {row.claimedToday ? (
                    <span className="inline-flex px-1.5 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-bold rounded">Yes</span>
                  ) : (
                    <span className="inline-flex px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded">No</span>
                  )}
                </div>
                <div className="col-span-1 text-right">
                  <span className="text-[11px] text-gray-500">{daysAgo}</span>
                </div>
              </div>
            );
          })}
          {data.leaderboard.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-500">No streak data found</div>
          )}
        </div>
      </div>
    </div>
  );
}

function getDaysAgo(dateStr: string): string {
  const today = new Date();
  const date = new Date(dateStr + "T00:00:00+07:00");
  const diff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "today";
  if (diff === 1) return "yesterday";
  if (diff < 7) return `${diff}d ago`;
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
  return `${Math.floor(diff / 30)}mo ago`;
}
