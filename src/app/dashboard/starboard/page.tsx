"use client";
import { useEffect, useState } from "react";
import { Trophy, Hash, Settings, Activity } from "lucide-react";
import { styles } from "@/lib/styles";
import { useGuild } from "@/lib/GuildContext";

interface TopMsg { messageId: string; channelId: string; authorId: string; stars: number; content: string; createdAt: number; _user?: { displayName: string; username: string; avatar: string | null }; }
interface SBData {
  enabled: boolean;
  settings: { channel: string | null; threshold: number; emoji: string; selfStar: boolean };
  totalMessages: number;
  totalStars: number;
  topMessages: TopMsg[];
  error?: string;
}

export default function StarboardPage() {
  const { selectedGuild } = useGuild();
  const [data, setData] = useState<SBData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedGuild) return;
    setLoading(true); setError("");
    fetch(`/api/bot/starboard?guildId=${selectedGuild.id}`)
      .then((r) => r.json())
      .then((d) => { if (d.error) setError(d.error); else setData(d); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedGuild]);

  if (!selectedGuild) return <div className={styles.card}><p className="text-gray-400">Select a server from the sidebar.</p></div>;
  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-400 border-t-transparent" /></div>;
  if (error) return <div className={`${styles.card} border-red-500/20 bg-red-500/5`}><p className="text-red-400 font-medium">Failed to load starboard</p><p className="text-sm text-gray-400 mt-1">{error}</p></div>;
  if (!data) return null;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">{data.settings.emoji || "⭐"} Starboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Highlighted messages for {selectedGuild.name}</p>
        </div>
        <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${data.enabled ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-dark-600 text-gray-400 border border-dark-500"}`}>
          {data.enabled ? "Enabled" : "Not configured"}
        </span>
      </div>

      {/* Settings + stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={styles.card}>
          <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2"><Settings size={15} /> Settings</h3>
          <div className="space-y-2 text-sm">
            <Row label="Channel" value={data.settings.channel ? <span className="flex items-center gap-1"><Hash size={12} /> {data.settings.channel}</span> : "—"} />
            <Row label="Threshold" value={`${data.settings.threshold} ${data.settings.emoji}`} />
            <Row label="Emoji" value={data.settings.emoji} />
            <Row label="Self-star" value={data.settings.selfStar ? "Allowed" : "Blocked"} />
          </div>
        </div>
        <div className="lg:col-span-2 grid grid-cols-2 gap-3">
          <Stat label="Starred Messages" value={String(data.totalMessages)} icon={Trophy} color="text-yellow-400" />
          <Stat label="Total Stars" value={String(data.totalStars)} icon={Activity} color="text-amber-400" />
        </div>
      </div>

      {/* Top messages */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Top Starred Messages</h2>
        <div className="space-y-2">
          {data.topMessages.length === 0 && <div className={styles.card}><p className="text-gray-500 text-sm">No starred messages yet.</p></div>}
          {data.topMessages.map((m, i) => (
            <div key={m.messageId} className="bg-dark-800 border border-dark-600 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-1.5">
                <span className="w-6 text-center text-sm font-bold text-gray-500">{i + 1}</span>
                {m._user?.avatar ? <img src={m._user.avatar} alt="" className="w-6 h-6 rounded-full" /> : <div className="w-6 h-6 rounded-full bg-dark-600" />}
                <span className="text-sm text-gray-200 flex-1 truncate">{m._user?.displayName || m.authorId}</span>
                <span className="text-sm font-medium text-yellow-400">{data.settings.emoji} {m.stars}</span>
              </div>
              {m.content && <p className="text-xs text-gray-400 pl-9 line-clamp-2">{m.content}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="flex items-center justify-between py-1.5 border-b border-dark-600/50 last:border-0"><span className="text-xs text-gray-500">{label}</span><span className="text-xs text-white font-medium">{value}</span></div>;
}
function Stat({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-lg p-3.5">
      <div className="flex items-center gap-2 mb-2"><Icon size={14} className={color} /><span className="text-[11px] text-gray-500 uppercase tracking-wider">{label}</span></div>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  );
}
