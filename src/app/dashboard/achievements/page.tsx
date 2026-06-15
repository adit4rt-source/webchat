"use client";
import { useEffect, useState } from "react";
import { Trophy, Search, Coins, Users, BookOpen } from "lucide-react";
import { styles } from "@/lib/styles";

interface AchDef { id: string; name: string; emoji: string; desc: string; category: string; reward: number; }
interface MostUnlocked { id: string; count: number; name: string; emoji: string; category: string; }
interface TopUser { userId: string; total: number; _user?: { username: string; displayName: string; avatar: string | null }; }
interface Milestone { count: number; desc: string; reward: { money: number; title?: string }; }

interface AchData {
  totalDefined: number;
  totalUnlocked: number;
  usersWithAchievements: number;
  milestones: Milestone[];
  definitions: AchDef[];
  mostUnlocked: MostUnlocked[];
  topUsers: TopUser[];
  error?: string;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n ?? 0);
}

export default function AchievementsPage() {
  const [data, setData] = useState<AchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");

  useEffect(() => {
    fetch("/api/bot/achievements")
      .then((r) => r.json())
      .then((d) => { if (d.error) setError(d.error); else setData(d); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-400 border-t-transparent" /></div>;
  if (error) return <div className={`${styles.card} border-red-500/20 bg-red-500/5`}><p className="text-red-400 font-medium">Failed to load achievements</p><p className="text-sm text-gray-400 mt-1">{error}</p></div>;
  if (!data) return null;

  const categories = ["All", ...Array.from(new Set(data.definitions.map((d) => d.category)))];
  const filtered = data.definitions.filter((d) => {
    if (cat !== "All" && d.category !== cat) return false;
    const q = query.trim().toLowerCase();
    if (q && !d.name.toLowerCase().includes(q) && !d.desc.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3"><Trophy className="text-yellow-400" /> Achievements</h1>
        <p className="text-sm text-gray-500 mt-0.5">Badge catalog and unlock statistics</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Defined" value={String(data.totalDefined)} icon={BookOpen} color="text-yellow-400" />
        <Stat label="Total Unlocked" value={fmt(data.totalUnlocked)} icon={Trophy} color="text-green-400" />
        <Stat label="Players w/ Badges" value={fmt(data.usersWithAchievements)} icon={Users} color="text-blue-400" />
        <Stat label="Milestones" value={String(data.milestones?.length || 0)} icon={Coins} color="text-purple-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Catalog */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search badges..." className={`${styles.inputDark} pl-9`} />
            </div>
            <select value={cat} onChange={(e) => setCat(e.target.value)} className="px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-sm text-white">
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filtered.map((a) => (
              <div key={a.id} className="flex items-start gap-3 p-3 bg-dark-800 border border-dark-600 rounded-lg">
                <span className="text-2xl leading-none">{a.emoji}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{a.name}</p>
                  <p className="text-xs text-gray-500 leading-snug">{a.desc}</p>
                  <p className="text-[10px] text-yellow-400/80 mt-1">🪙 {fmt(a.reward)} · {a.category}</p>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p className="text-gray-500 text-sm p-3">No badges match.</p>}
          </div>
        </div>

        {/* Side: top users + most unlocked */}
        <div className="space-y-4">
          <div className={styles.card}>
            <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2"><Users size={15} /> Top Collectors</h3>
            <div className="space-y-2">
              {data.topUsers.length === 0 && <p className="text-xs text-gray-500">No data yet.</p>}
              {data.topUsers.map((u, i) => (
                <div key={u.userId} className="flex items-center gap-2 text-sm">
                  <span className="w-5 text-gray-500 text-xs">#{i + 1}</span>
                  {u._user?.avatar ? <img src={u._user.avatar} alt="" className="w-6 h-6 rounded-full" /> : <div className="w-6 h-6 rounded-full bg-dark-600" />}
                  <span className="flex-1 truncate text-gray-200">{u._user?.displayName || u.userId}</span>
                  <span className="text-yellow-400 font-medium">{u.total}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.card}>
            <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2"><Trophy size={15} /> Most Unlocked</h3>
            <div className="space-y-2">
              {data.mostUnlocked.length === 0 && <p className="text-xs text-gray-500">No data yet.</p>}
              {data.mostUnlocked.map((m) => (
                <div key={m.id} className="flex items-center gap-2 text-sm">
                  <span>{m.emoji}</span>
                  <span className="flex-1 truncate text-gray-200">{m.name}</span>
                  <span className="text-gray-400">{m.count}×</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-lg p-3.5">
      <div className="flex items-center gap-2 mb-2"><Icon size={14} className={color} /><span className="text-[11px] text-gray-500 uppercase tracking-wider">{label}</span></div>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  );
}
