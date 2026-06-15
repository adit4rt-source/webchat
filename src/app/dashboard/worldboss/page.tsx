"use client";
import { useEffect, useState } from "react";
import { Skull, Swords, Users, Activity } from "lucide-react";
import { styles } from "@/lib/styles";

interface Boss { bossId: string; name: string; maxHp: number; currentHp: number; status: string; hpPercent: number; }
interface DamageRow { userId: string; username: string; totalDamage: number; attacks: number; _user?: { displayName: string; username: string; avatar: string | null }; }
interface BossDef { id: string; name: string; emoji: string; hp: number; atk: number; def: number; description: string; }
interface WBData {
  weekId: string;
  spawned: boolean;
  boss: Boss | null;
  participants: number;
  damageLeaderboard: DamageRow[];
  bosses: BossDef[];
  error?: string;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n ?? 0);
}

export default function WorldBossPage() {
  const [data, setData] = useState<WBData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/bot/worldboss")
      .then((r) => r.json())
      .then((d) => { if (d.error) setError(d.error); else setData(d); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-red-400 border-t-transparent" /></div>;
  if (error) return <div className={`${styles.card} border-red-500/20 bg-red-500/5`}><p className="text-red-400 font-medium">Failed to load world boss</p><p className="text-sm text-gray-400 mt-1">{error}</p></div>;
  if (!data) return null;

  const b = data.boss;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3"><Skull className="text-red-400" /> World Boss</h1>
        <p className="text-sm text-gray-500 mt-0.5">Weekly co-op boss · week {data.weekId}</p>
      </div>

      {/* Current boss */}
      {b ? (
        <div className={styles.card}>
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <h2 className="text-lg font-bold text-white">{b.name}</h2>
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${b.status === "active" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-dark-600 text-gray-400 border border-dark-500"}`}>
              {b.status === "active" ? "⚔️ Active" : "💀 Defeated"}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>HP</span>
            <span>{fmt(b.currentHp)} / {fmt(b.maxHp)} ({b.hpPercent}%)</span>
          </div>
          <div className="h-4 bg-dark-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all" style={{ width: `${Math.min(100, Math.max(0, b.hpPercent))}%` }} />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Stat label="Participants" value={String(data.participants)} icon={Users} color="text-blue-400" />
            <Stat label="Total Attacks" value={fmt(data.damageLeaderboard.reduce((s, r) => s + (r.attacks || 0), 0))} icon={Swords} color="text-orange-400" />
          </div>
        </div>
      ) : (
        <div className={styles.card}><p className="text-gray-400">No boss spawned for this week yet.</p></div>
      )}

      {/* Damage leaderboard */}
      {b && (
        <div className={styles.card}>
          <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2"><Activity size={15} /> Damage Leaderboard</h3>
          <div className="space-y-1.5">
            {data.damageLeaderboard.length === 0 && <p className="text-xs text-gray-500">No attacks recorded yet.</p>}
            {data.damageLeaderboard.map((r, i) => (
              <div key={r.userId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-700/50">
                <span className="w-6 text-center text-sm font-bold text-gray-500">{i + 1}</span>
                {r._user?.avatar ? <img src={r._user.avatar} alt="" className="w-7 h-7 rounded-full" /> : <div className="w-7 h-7 rounded-full bg-dark-600" />}
                <span className="flex-1 truncate text-sm text-gray-200">{r._user?.displayName || r.username || r.userId}</span>
                <span className="text-xs text-gray-500">{r.attacks} hits</span>
                <span className="text-sm font-medium text-red-400 w-20 text-right">{fmt(r.totalDamage)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Boss catalog */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Boss Roster</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.bosses.map((boss) => (
            <div key={boss.id} className={`bg-dark-800 border rounded-xl p-4 ${b?.bossId === boss.id ? "border-red-500/40" : "border-dark-600"}`}>
              <p className="text-sm font-semibold text-white">{boss.name}</p>
              <p className="text-xs text-gray-500 mt-1 leading-snug">{boss.description}</p>
              <div className="flex gap-3 mt-2 text-[11px] text-gray-400">
                <span>❤️ {fmt(boss.hp)}</span>
                <span>⚔️ {boss.atk}</span>
                <span>🛡️ {boss.def}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <div className="bg-dark-700/50 border border-dark-600 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1.5"><Icon size={14} className={color} /><span className="text-[11px] text-gray-500 uppercase tracking-wider">{label}</span></div>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  );
}
