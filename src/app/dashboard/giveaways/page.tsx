"use client";
import { useEffect, useState } from "react";
import { Gift, Users, Clock, Trophy } from "lucide-react";
import { styles } from "@/lib/styles";
import { useGuild } from "@/lib/GuildContext";

interface Giveaway {
  id: number;
  prize: string;
  channelId: string;
  messageId: string;
  hostId: string;
  winners: number;
  requiredRoleId: string | null;
  endsAt: number;
  ended: boolean;
  createdAt: number;
  winnerIds: string[];
  entries: number;
}
interface GData { total: number; active: number; ended: number; giveaways: Giveaway[]; error?: string; }

function timeLeft(endsAt: number): string {
  const diff = endsAt - Date.now();
  if (diff <= 0) return "ended";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function GiveawaysPage() {
  const { selectedGuild } = useGuild();
  const [data, setData] = useState<GData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"active" | "ended">("active");

  useEffect(() => {
    if (!selectedGuild) return;
    setLoading(true); setError("");
    fetch(`/api/bot/giveaways?guildId=${selectedGuild.id}`)
      .then((r) => r.json())
      .then((d) => { if (d.error) setError(d.error); else setData(d); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedGuild]);

  if (!selectedGuild) return <div className={styles.card}><p className="text-gray-400">Select a server from the sidebar.</p></div>;
  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-pink-400 border-t-transparent" /></div>;
  if (error) return <div className={`${styles.card} border-red-500/20 bg-red-500/5`}><p className="text-red-400 font-medium">Failed to load giveaways</p><p className="text-sm text-gray-400 mt-1">{error}</p></div>;
  if (!data) return null;

  const list = data.giveaways.filter((g) => (tab === "active" ? !g.ended : g.ended));

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3"><Gift className="text-pink-400" /> Giveaways</h1>
        <p className="text-sm text-gray-500 mt-0.5">Active and past giveaways for {selectedGuild.name}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Total" value={String(data.total)} icon={Gift} color="text-pink-400" />
        <Stat label="Active" value={String(data.active)} icon={Clock} color="text-green-400" />
        <Stat label="Ended" value={String(data.ended)} icon={Trophy} color="text-gray-400" />
      </div>

      <div className="flex gap-2 border-b border-dark-600">
        {(["active", "ended"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${tab === t ? "border-pink-400 text-white" : "border-transparent text-gray-400 hover:text-white"}`}>{t}</button>
        ))}
      </div>

      <div className="space-y-2">
        {list.length === 0 && <div className={styles.card}><p className="text-gray-500 text-sm">No {tab} giveaways.</p></div>}
        {list.map((g) => (
          <div key={g.id} className="bg-dark-800 border border-dark-600 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <p className="text-base font-semibold text-white flex items-center gap-2"><Gift size={16} className="text-pink-400" /> {g.prize}</p>
                <p className="text-xs text-gray-500 mt-1">Host: {g.hostId} · {g.winners} winner{g.winners > 1 ? "s" : ""}{g.requiredRoleId ? " · role-gated" : ""}</p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1 text-blue-400"><Users size={14} /> {g.entries}</span>
                {g.ended ? (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-dark-600 text-gray-400 border border-dark-500">Ended</span>
                ) : (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1"><Clock size={12} /> {timeLeft(g.endsAt)}</span>
                )}
              </div>
            </div>
            {g.ended && g.winnerIds.length > 0 && (
              <p className="text-xs text-yellow-400/90 mt-2 flex items-center gap-1.5"><Trophy size={13} /> Winners: {g.winnerIds.join(", ")}</p>
            )}
          </div>
        ))}
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
