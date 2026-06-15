"use client";
import { useEffect, useState } from "react";
import { BarChart3, Coins, Users, TrendingUp, Activity, Clock, Command, Trophy } from "lucide-react";
import { styles } from "@/lib/styles";

interface UserRow { userId: string; balance?: number; level?: number; count?: number; _user?: { displayName: string; username: string; avatar: string | null }; }
interface DailyIncome { date: string; amount: number; }
interface HourBucket { hour: number; count: number; }
interface CmdRow { command: string; count: number; }
interface Analytics {
  generatedAt: number;
  rangeDays: number;
  economy: {
    totalMoney: number; totalUsers: number; avgBalance: number; top10Share: number;
    totalEarned: number; totalSpent: number; sinkRatio: number; dailyIncome: DailyIncome[];
  };
  topPlayers: { byBalance: UserRow[]; byLevel: UserRow[]; byActivity: UserRow[] };
  activity: { totalEvents: number; peakHour: number; byHour: HourBucket[] };
  commands: { total: number; top: CmdRow[] };
  error?: string;
}

function fmt(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return (n ?? 0).toLocaleString("id-ID");
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/bot/analytics")
      .then((r) => r.json())
      .then((d) => { if (d.error) setError(d.error); else setData(d); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-primary border-t-transparent" /></div>;
  if (error) return <div className={`${styles.card} border-red-500/20 bg-red-500/5`}><p className="text-red-400 font-medium">Failed to load analytics</p><p className="text-sm text-gray-400 mt-1">{error}</p></div>;
  if (!data) return null;

  const { economy: e, activity: a } = data;
  const maxIncome = Math.max(1, ...e.dailyIncome.map((d) => d.amount));
  const maxHour = Math.max(1, ...a.byHour.map((h) => h.count));

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3"><BarChart3 className="text-accent-primary" /> Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Weekly overview · last {data.rangeDays} days</p>
      </div>

      {/* Economy health */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total Economy" value={`🪙 ${fmt(e.totalMoney)}`} icon={Coins} color="text-yellow-400" />
        <Stat label="Players" value={fmt(e.totalUsers)} icon={Users} color="text-blue-400" sub={`avg 🪙 ${fmt(e.avgBalance)}`} />
        <Stat label="Top-10 Wealth Share" value={`${e.top10Share}%`} icon={TrendingUp} color="text-purple-400" sub="concentration" />
        <Stat label="Sink Ratio" value={`${e.sinkRatio}%`} icon={Activity} color="text-green-400" sub="spent / earned" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily money created */}
        <div className={styles.card}>
          <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2"><Coins size={15} /> Money Created (daily)</h3>
          <div className="flex items-end gap-2 h-40">
            {e.dailyIncome.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">{fmt(d.amount)}</span>
                <div className="w-full bg-yellow-400/70 rounded-t hover:bg-yellow-400 transition-colors" style={{ height: `${Math.max(2, (d.amount / maxIncome) * 130)}px` }} />
                <span className="text-[9px] text-gray-500">{d.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity by hour */}
        <div className={styles.card}>
          <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2"><Clock size={15} /> Activity by Hour (WIB) · peak {String(a.peakHour).padStart(2, "0")}:00</h3>
          <div className="flex items-end gap-[2px] h-40">
            {a.byHour.map((h) => (
              <div key={h.hour} className="flex-1 flex flex-col items-center justify-end group" title={`${String(h.hour).padStart(2, "0")}:00 — ${h.count}`}>
                <div className={`w-full rounded-t transition-colors ${h.hour === a.peakHour ? "bg-accent-primary" : "bg-accent-primary/40 group-hover:bg-accent-primary/70"}`} style={{ height: `${Math.max(2, (h.count / maxHour) * 130)}px` }} />
                {h.hour % 6 === 0 && <span className="text-[8px] text-gray-500 mt-0.5">{h.hour}</span>}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-500 mt-2">{fmt(a.totalEvents)} transaction events in range</p>
        </div>
      </div>

      {/* Top players */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TopList title="Richest" icon={Coins} rows={data.topPlayers.byBalance} valueOf={(r) => `🪙 ${fmt(r.balance || 0)}`} />
        <TopList title="Highest Level" icon={Trophy} rows={data.topPlayers.byLevel} valueOf={(r) => `Lv ${r.level || 0}`} />
        <TopList title="Most Active (7d)" icon={Activity} rows={data.topPlayers.byActivity} valueOf={(r) => `${fmt(r.count || 0)}×`} />
      </div>

      {/* Commands */}
      <div className={styles.card}>
        <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2"><Command size={15} /> Top Commands · {fmt(data.commands.total)} total</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {data.commands.top.length === 0 && <p className="text-xs text-gray-500">No command data yet.</p>}
          {data.commands.top.map((c) => (
            <div key={c.command} className="bg-dark-700/50 rounded-lg px-3 py-2">
              <p className="text-sm text-white truncate">/{c.command}</p>
              <p className="text-[11px] text-gray-500">{fmt(c.count)} uses</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, color, sub }: { label: string; value: string; icon: any; color: string; sub?: string }) {
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-lg p-3.5">
      <div className="flex items-center gap-2 mb-2"><Icon size={14} className={color} /><span className="text-[11px] text-gray-500 uppercase tracking-wider">{label}</span></div>
      <p className="text-lg font-bold text-white">{value}</p>
      {sub && <p className="text-[10px] text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function TopList({ title, icon: Icon, rows, valueOf }: { title: string; icon: any; rows: UserRow[]; valueOf: (r: UserRow) => string }) {
  return (
    <div className={styles.card}>
      <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2"><Icon size={15} /> {title}</h3>
      <div className="space-y-2">
        {(!rows || rows.length === 0) && <p className="text-xs text-gray-500">No data yet.</p>}
        {rows?.map((r, i) => (
          <div key={r.userId} className="flex items-center gap-2 text-sm">
            <span className="w-5 text-gray-500 text-xs">#{i + 1}</span>
            {r._user?.avatar ? <img src={r._user.avatar} alt="" className="w-6 h-6 rounded-full" /> : <div className="w-6 h-6 rounded-full bg-dark-600" />}
            <span className="flex-1 truncate text-gray-200">{r._user?.displayName || r.userId}</span>
            <span className="text-white font-medium">{valueOf(r)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
