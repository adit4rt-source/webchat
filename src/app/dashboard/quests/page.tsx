"use client";
import { useEffect, useState } from "react";
import { BookOpen, Search, Zap, Users } from "lucide-react";
import { styles } from "@/lib/styles";
import { useGuild } from "@/lib/GuildContext";

interface DiffTier { stars: string; label: string; rewardRange: [number, number]; }
interface Catalog {
  difficulties: Record<string, DiffTier>;
  questTypes: string[];
  totalQuestTypes: number;
  usersWithDailyQuests: number;
  error?: string;
}
interface QuestEntry { type: string; target: number; progress: number; claimed: boolean; difficulty?: string; reward?: number; }
interface UserQuests {
  daily: { date: string; quests: QuestEntry[] } | null;
  weekly: { week: string; quests: QuestEntry[] } | null;
  error?: string;
}

export default function QuestsPage() {
  const { selectedGuild } = useGuild();
  const [cat, setCat] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [userId, setUserId] = useState("");
  const [uq, setUq] = useState<UserQuests | null>(null);
  const [looking, setLooking] = useState(false);
  const [lookErr, setLookErr] = useState("");

  useEffect(() => {
    fetch("/api/bot/quests")
      .then((r) => r.json())
      .then((d) => { if (d.error) setError(d.error); else setCat(d); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function lookup() {
    if (!userId.trim() || !selectedGuild) return;
    setLooking(true); setLookErr(""); setUq(null);
    try {
      const d = await fetch(`/api/bot/quests?guildId=${selectedGuild.id}&userId=${encodeURIComponent(userId.trim())}`).then((r) => r.json());
      if (d.error) setLookErr(d.error); else setUq(d);
    } catch (e: any) { setLookErr(e.message); }
    finally { setLooking(false); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-400 border-t-transparent" /></div>;
  if (error) return <div className={`${styles.card} border-red-500/20 bg-red-500/5`}><p className="text-red-400 font-medium">Failed to load quests</p><p className="text-sm text-gray-400 mt-1">{error}</p></div>;
  if (!cat) return null;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3"><BookOpen className="text-cyan-400" /> Quests</h1>
        <p className="text-sm text-gray-500 mt-0.5">Daily &amp; weekly quest system</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Stat label="Quest Types" value={String(cat.totalQuestTypes)} icon={Zap} color="text-cyan-400" />
        <Stat label="Difficulty Tiers" value={String(Object.keys(cat.difficulties || {}).length)} icon={BookOpen} color="text-purple-400" />
        <Stat label="Active Daily Players" value={String(cat.usersWithDailyQuests)} icon={Users} color="text-green-400" />
      </div>

      {/* Difficulty tiers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Object.entries(cat.difficulties || {}).map(([key, t]) => (
          <div key={key} className="bg-dark-800 border border-dark-600 rounded-xl p-4">
            <p className="text-sm font-semibold text-white capitalize">{t.label} <span className="ml-1">{t.stars}</span></p>
            <p className="text-xs text-gray-500 mt-1">Reward 🪙 {t.rewardRange?.[0]}–{t.rewardRange?.[1]}</p>
          </div>
        ))}
      </div>

      {/* User lookup */}
      <div className={styles.card}>
        <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2"><Search size={15} /> Player quest lookup</h3>
        {!selectedGuild ? (
          <p className="text-sm text-gray-500">Select a server from the sidebar to look up a player.</p>
        ) : (
          <>
            <div className="flex gap-2">
              <input value={userId} onChange={(e) => setUserId(e.target.value)} onKeyDown={(e) => e.key === "Enter" && lookup()} placeholder="Discord User ID" className={styles.inputDark} />
              <button onClick={lookup} disabled={looking} className={styles.btnPrimary}>{looking ? "..." : "Lookup"}</button>
            </div>
            {lookErr && <p className="text-sm text-red-400 mt-2">{lookErr}</p>}
            {uq && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <QuestList title={`Daily${uq.daily?.date ? ` · ${uq.daily.date}` : ""}`} quests={uq.daily?.quests} />
                <QuestList title={`Weekly${uq.weekly?.week ? ` · ${uq.weekly.week}` : ""}`} quests={uq.weekly?.quests} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function QuestList({ title, quests }: { title: string; quests?: QuestEntry[] }) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">{title}</p>
      <div className="space-y-2">
        {(!quests || quests.length === 0) && <p className="text-xs text-gray-500">No quests.</p>}
        {quests?.map((q, i) => {
          const pct = q.target ? Math.min(100, Math.round((q.progress / q.target) * 100)) : 0;
          return (
            <div key={i} className="bg-dark-700/50 rounded-lg p-2.5">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-200 capitalize">{q.type}{q.difficulty ? ` · ${q.difficulty}` : ""}</span>
                <span className={q.claimed ? "text-green-400" : "text-gray-400"}>{q.claimed ? "✓ claimed" : `${q.progress}/${q.target}`}</span>
              </div>
              <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400/70" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
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
