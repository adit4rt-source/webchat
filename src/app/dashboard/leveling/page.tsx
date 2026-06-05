"use client";
import { useEffect, useState } from "react";
import { BarChart3, Search, Users, Star, Zap } from "lucide-react";
import { styles } from "@/lib/styles";
import UserCell from "@/components/UserCell";

interface LevelingData {
  totalMembers: number;
  topLevel: number;
  topXp: number;
  leaderboard: {
    userId: string;
    level: number;
    xp: number;
    xpToNext: number;
    _user?: { userId: string; username: string; displayName: string; avatar: string | null };
  }[];
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString("id-ID");
}

export default function LevelingPage() {
  const [data, setData] = useState<LevelingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"level" | "xp">("level");

  useEffect(() => { loadData(); }, []);

  function loadData(search = "") {
    setLoading(true);
    fetch(`/api/bot/leveling?limit=50&search=${search}`).then(r => r.json()).then(d => {
      if (!d.error) setData(d);
    }).catch(() => {}).finally(() => setLoading(false));
  }

  function handleSearch() {
    loadData(searchQuery);
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!data) {
    return <div className={`${styles.card} border-red-500/20`}><p className="text-red-400">Failed to load leveling data</p></div>;
  }

  const sorted = [...data.leaderboard].sort((a, b) => {
    if (sortBy === "xp") return b.xp - a.xp;
    return b.level - a.level || b.xp - a.xp;
  });

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <BarChart3 className="text-accent-primary" /> Leveling
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          View and manage XP & levels for all members
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-accent-primary">{formatNumber(data.totalMembers)}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Total Members</p>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-purple-400">Lv. {data.topLevel}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Highest Level</p>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-neon-green">{formatNumber(data.topXp)}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Top XP</p>
        </div>
      </div>

      {/* Leaderboard Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-medium text-white flex items-center gap-2">
            <Star size={16} className="text-yellow-400" /> Leaderboard
          </h2>
          <span className="px-2 py-0.5 bg-accent-primary/20 text-accent-primary text-xs font-bold rounded-md">{data.totalMembers}</span>
          {/* Sort Toggle */}
          <div className="flex bg-dark-700 rounded-lg p-0.5">
            <button onClick={() => setSortBy("level")} className={`px-3 py-1 text-xs rounded-md transition-colors ${sortBy === "level" ? "bg-accent-primary text-white" : "text-gray-400 hover:text-white"}`}>Level</button>
            <button onClick={() => setSortBy("xp")} className={`px-3 py-1 text-xs rounded-md transition-colors ${sortBy === "xp" ? "bg-accent-primary text-white" : "text-gray-400 hover:text-white"}`}>XP</button>
          </div>
        </div>
        {/* Search */}
        <div className="flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              className="pl-8 pr-3 py-1.5 text-xs bg-dark-700 border border-dark-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-primary/50 w-48"
              placeholder="Search by user ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-dark-600 text-xs text-gray-500 font-medium uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-5">User</div>
          <div className="col-span-2 text-center">Level</div>
          <div className="col-span-2 text-right">XP</div>
          <div className="col-span-2 text-right">XP to Next</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-dark-700/50">
          {sorted.map((row, i) => {
            const progress = row.xpToNext > 0 ? Math.min(100, (row.xp / row.xpToNext) * 100) : 100;
            const medal = ["🥇", "🥈", "🥉"][i];

            return (
              <div key={row.userId} className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-dark-700/30 transition-colors">
                {/* Rank */}
                <div className="col-span-1">
                  {medal ? (
                    <span className="text-lg">{medal}</span>
                  ) : (
                    <span className="text-sm text-gray-500 font-medium">{i + 1}</span>
                  )}
                </div>

                {/* User */}
                <div className="col-span-5 flex items-center gap-3">
                  <UserCell user={row._user} userId={row.userId} />
                  {/* XP Progress Bar */}
                  <div className="hidden md:block flex-1 max-w-[120px]">
                    <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Level */}
                <div className="col-span-2 text-center">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-bold ${
                    row.level >= 50 ? "bg-yellow-500/20 text-yellow-400" :
                    row.level >= 30 ? "bg-purple-500/20 text-purple-400" :
                    row.level >= 15 ? "bg-blue-500/20 text-blue-400" :
                    "bg-dark-600 text-gray-300"
                  }`}>
                    Lv. {row.level}
                  </span>
                </div>

                {/* XP */}
                <div className="col-span-2 text-right">
                  <span className="text-sm font-semibold text-accent-primary">{formatNumber(row.xp)}</span>
                </div>

                {/* XP to Next */}
                <div className="col-span-2 text-right">
                  <span className="text-sm text-gray-400">{formatNumber(row.xpToNext)}</span>
                </div>
              </div>
            );
          })}

          {sorted.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              No members found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
