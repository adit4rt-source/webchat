"use client";
import { useEffect, useState } from "react";
import { Users, Hash, MessageSquare } from "lucide-react";
import { styles } from "@/lib/styles";
import { useGuild } from "@/lib/GuildContext";

interface Option { id: number; roleId: string; label: string; emoji: string | null; description: string | null; }
interface Menu { id: number; title: string; description: string; type: string; color: string; channelId: string; messageId: string; maxRoles: number; options: Option[]; }
interface SRData { total: number; menus: Menu[]; error?: string; }

export default function SelfRolesPage() {
  const { selectedGuild } = useGuild();
  const [data, setData] = useState<SRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedGuild) return;
    setLoading(true); setError("");
    fetch(`/api/bot/selfroles?guildId=${selectedGuild.id}`)
      .then((r) => r.json())
      .then((d) => { if (d.error) setError(d.error); else setData(d); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedGuild]);

  if (!selectedGuild) return <div className={styles.card}><p className="text-gray-400">Select a server from the sidebar.</p></div>;
  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-400 border-t-transparent" /></div>;
  if (error) return <div className={`${styles.card} border-red-500/20 bg-red-500/5`}><p className="text-red-400 font-medium">Failed to load self roles</p><p className="text-sm text-gray-400 mt-1">{error}</p></div>;
  if (!data) return null;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3"><Users className="text-indigo-400" /> Self Roles</h1>
        <p className="text-sm text-gray-500 mt-0.5">{data.total} reaction/button role menu{data.total !== 1 ? "s" : ""} in {selectedGuild.name}</p>
      </div>

      {data.menus.length === 0 ? (
        <div className={styles.card}><p className="text-gray-500 text-sm">No self-role menus yet. Create one in Discord with the self-role panel.</p></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.menus.map((m) => (
            <div key={m.id} className="bg-dark-800 border border-dark-600 rounded-xl p-4" style={{ borderLeftColor: m.color || "#6366f1", borderLeftWidth: 3 }}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-white truncate">{m.title || "Untitled menu"}</p>
                  {m.description && <p className="text-xs text-gray-500 mt-0.5 leading-snug">{m.description}</p>}
                </div>
                <span className="px-2 py-0.5 text-[10px] rounded-full bg-dark-600 text-gray-300 border border-dark-500 uppercase shrink-0">{m.type}</span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500">
                <span className="flex items-center gap-1"><Hash size={12} /> {m.channelId || "—"}</span>
                {m.maxRoles > 0 && <span>max {m.maxRoles}</span>}
                <span className="flex items-center gap-1"><Users size={12} /> {m.options.length} role{m.options.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="mt-3 space-y-1.5">
                {m.options.map((o) => (
                  <div key={o.id} className="flex items-center gap-2 bg-dark-700/50 rounded-lg px-2.5 py-1.5">
                    <span className="text-base leading-none">{o.emoji || "🔘"}</span>
                    <span className="text-sm text-gray-200 flex-1 truncate">{o.label || o.roleId}</span>
                    {o.description && <span className="text-[11px] text-gray-500 truncate hidden sm:block">{o.description}</span>}
                  </div>
                ))}
                {m.options.length === 0 && <p className="text-xs text-gray-500 flex items-center gap-1.5"><MessageSquare size={12} /> No roles configured.</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
