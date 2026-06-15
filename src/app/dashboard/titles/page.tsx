"use client";
import { useEffect, useState } from "react";
import { Trophy, Search, TrendingUp, BarChart3 } from "lucide-react";
import { styles } from "@/lib/styles";

interface TitleTier { id: string; name: string; emoji: string; minScore: number; color: string; }
interface ScorePart { label: string; points: number; }
interface UserTitle {
  userId: string;
  score: number;
  title: TitleTier;
  progress?: { current: TitleTier; next: TitleTier | null; progress: number };
  breakdown: ScorePart[];
  error?: string;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n ?? 0);
}

export default function TitlesPage() {
  const [tiers, setTiers] = useState<TitleTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [userId, setUserId] = useState("");
  const [user, setUser] = useState<UserTitle | null>(null);
  const [lookupErr, setLookupErr] = useState("");
  const [looking, setLooking] = useState(false);

  useEffect(() => {
    fetch("/api/bot/titles")
      .then((r) => r.json())
      .then((d) => { if (d.error) setError(d.error); else setTiers(d.titles || []); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function lookup() {
    if (!userId.trim()) return;
    setLooking(true); setLookupErr(""); setUser(null);
    try {
      const d = await fetch(`/api/bot/titles?userId=${encodeURIComponent(userId.trim())}`).then((r) => r.json());
      if (d.error) setLookupErr(d.error); else setUser(d);
    } catch (e: any) { setLookupErr(e.message); }
    finally { setLooking(false); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-400 border-t-transparent" /></div>;
  if (error) return <div className={`${styles.card} border-red-500/20 bg-red-500/5`}><p className="text-red-400 font-medium">Failed to load titles</p><p className="text-sm text-gray-400 mt-1">{error}</p></div>;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3"><Trophy className="text-yellow-400" /> Titles</h1>
        <p className="text-sm text-gray-500 mt-0.5">Rank tiers based on overall player score</p>
      </div>

      {/* User lookup */}
      <div className={styles.card}>
        <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2"><Search size={15} /> Player title lookup</h3>
        <div className="flex gap-2">
          <input value={userId} onChange={(e) => setUserId(e.target.value)} onKeyDown={(e) => e.key === "Enter" && lookup()} placeholder="Discord User ID" className={styles.inputDark} />
          <button onClick={lookup} disabled={looking} className={styles.btnPrimary}>{looking ? "..." : "Lookup"}</button>
        </div>
        {lookupErr && <p className="text-sm text-red-400 mt-2">{lookupErr}</p>}
        {user && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl" style={{ color: user.title.color }}>{user.title.emoji}</span>
              <div>
                <p className="text-lg font-bold text-white">{user.title.name}</p>
                <p className="text-xs text-gray-500">Score: <span className="text-yellow-400 font-medium">{fmt(user.score)}</span></p>
              </div>
            </div>
            {user.progress?.next && (
              <div>
                <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                  <span>{user.progress.current.name}</span>
                  <span>{user.progress.next.name} ({fmt(user.progress.next.minScore)})</span>
                </div>
                <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400/70" style={{ width: `${Math.min(100, Math.max(0, user.progress.progress || 0))}%` }} />
                </div>
              </div>
            )}
            {user.breakdown?.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-1.5 flex items-center gap-1.5"><BarChart3 size={13} /> Score breakdown</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {user.breakdown.map((b) => (
                    <div key={b.label} className="flex justify-between bg-dark-700/50 rounded px-2 py-1 text-xs">
                      <span className="text-gray-400 truncate">{b.label}</span>
                      <span className="text-white font-medium">{fmt(b.points)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tier ladder */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><TrendingUp size={15} /> Title Tiers ({tiers.length})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tiers.map((t) => (
            <div key={t.id} className="flex items-center gap-3 p-4 bg-dark-800 border border-dark-600 rounded-xl" style={{ borderLeftColor: t.color, borderLeftWidth: 3 }}>
              <span className="text-2xl">{t.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <p className="text-xs text-gray-500">≥ {fmt(t.minScore)} score</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
