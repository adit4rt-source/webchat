"use client";
import { useEffect, useState } from "react";
import { Shield, Plus, X, Hash, Users } from "lucide-react";
import { styles } from "@/lib/styles";
import { useGuild } from "@/lib/GuildContext";

interface AutomodData {
  modules: { id: string; name: string; emoji: string; desc: string }[];
  states: Record<string, boolean>;
  settings: { mod_log_channel: string | null; audit_log_channel: string | null };
  blockedWords: string[];
  whitelist: { targetId: string; type: string }[];
  ignoredChannels: string[];
  recentLogs: { userId: string; module: string; action: string; details: string; timestamp: number }[];
}

export default function AutomodPage() {
  const { selectedGuild } = useGuild();
  const [data, setData] = useState<AutomodData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newWord, setNewWord] = useState("");
  const [newWhitelistId, setNewWhitelistId] = useState("");
  const [newChannelId, setNewChannelId] = useState("");
  const [logChannel, setLogChannel] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => { if (selectedGuild) loadData(); }, [selectedGuild]);

  function loadData() {
    if (!selectedGuild) return;
    setLoading(true);
    fetch(`/api/bot/automod?guildId=${selectedGuild.id}`).then(r => r.json()).then(d => {
      if (!d.error) { setData(d); setLogChannel(d.settings?.mod_log_channel || ""); }
    }).catch(() => {}).finally(() => setLoading(false));
  }

  async function apiAction(endpoint: string, body: any) {
    if (!selectedGuild) return;
    const res = await fetch("/api/bot/automod", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint, guildId: selectedGuild.id, ...body }) });
    const r = await res.json();
    if (r.success) loadData();
    else setMsg("❌ " + (r.error || "Failed"));
    setTimeout(() => setMsg(""), 3000);
    return r;
  }

  if (!selectedGuild) return <div className={styles.card}><p className="text-gray-400">Select a server from the sidebar first.</p></div>;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-primary border-t-transparent"></div></div>;
  if (!data) return <div className={`${styles.card} border-red-500/20`}><p className="text-red-400">Failed to load automod data</p></div>;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3"><Shield className="text-accent-primary" /> Automod Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Enable or disable specific automated moderation features.</p>
        </div>
        {msg && <span className="text-sm">{msg}</span>}
      </div>

      {/* Protection Modules */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Protection Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {data.modules.map(mod => {
            const enabled = data.states[mod.id];
            return (
              <div key={mod.id} className={`bg-dark-800 border rounded-lg p-4 transition-all ${enabled ? "border-accent-success/30" : "border-dark-600"}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">{mod.emoji}</span>
                  <button
                    onClick={() => apiAction("toggle", { moduleId: mod.id, enabled: !enabled })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? "bg-accent-success" : "bg-dark-500"}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${enabled ? "left-5.5 translate-x-0" : "left-0.5"}`} style={{ left: enabled ? '22px' : '2px' }} />
                  </button>
                </div>
                <p className="text-sm font-medium text-white">{mod.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{mod.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Logging */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Logging</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-dark-800 border border-dark-600 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-2">Moderation Log Channel</p>
            <div className="flex gap-2">
              <input className={styles.inputDark} placeholder="Channel ID" value={logChannel} onChange={e => setLogChannel(e.target.value)} />
              <button className={styles.btnPrimary} onClick={() => apiAction("settings", { key: "mod_log_channel", value: logChannel })}>Save</button>
            </div>
          </div>
        </div>
      </div>

      {/* Blocked Words */}
      <div className={styles.card}>
        <h3 className="text-sm font-medium text-gray-400 mb-3">Blocked Words</h3>
        <div className="flex gap-2 mb-3">
          <input className={`${styles.inputDark} flex-1`} placeholder="Type a word and press Enter" value={newWord} onChange={e => setNewWord(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && newWord.trim()) { apiAction("words", { action: "add", word: newWord.trim() }); setNewWord(""); }}} />
          <button className={styles.btnPrimary} onClick={() => { if (newWord.trim()) { apiAction("words", { action: "add", word: newWord.trim() }); setNewWord(""); }}}><Plus size={16} /></button>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.blockedWords.map(w => (
            <span key={w} className="flex items-center gap-1 px-2.5 py-1 bg-dark-700 border border-dark-500 rounded-full text-xs text-gray-300">
              {w} <button onClick={() => apiAction("words", { action: "remove", word: w })} className="text-red-400 hover:text-red-300"><X size={12} /></button>
            </span>
          ))}
          {data.blockedWords.length === 0 && <p className="text-xs text-gray-500">No blocked words</p>}
        </div>
      </div>

      {/* Whitelist */}
      <div className={styles.card}>
        <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2"><Users size={14} /> Whitelist (User / Role IDs)</h3>
        <p className="text-xs text-gray-500 mb-3">These users and roles are immune to all automod checks.</p>
        <div className="flex gap-2 mb-3">
          <input className={`${styles.inputDark} flex-1`} placeholder="Paste a Discord ID and press Enter" value={newWhitelistId} onChange={e => setNewWhitelistId(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && newWhitelistId.trim()) { apiAction("whitelist", { action: "add", targetId: newWhitelistId.trim() }); setNewWhitelistId(""); }}} />
          <button className={styles.btnPrimary} onClick={() => { if (newWhitelistId.trim()) { apiAction("whitelist", { action: "add", targetId: newWhitelistId.trim() }); setNewWhitelistId(""); }}}><Plus size={16} /></button>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.whitelist.map(w => (
            <span key={w.targetId} className="flex items-center gap-1 px-2.5 py-1 bg-dark-700 border border-dark-500 rounded-full text-xs text-gray-300 font-mono">
              {w.targetId} <span className="text-[10px] text-gray-500">({w.type})</span> <button onClick={() => apiAction("whitelist", { action: "remove", targetId: w.targetId })} className="text-red-400 hover:text-red-300"><X size={12} /></button>
            </span>
          ))}
          {data.whitelist.length === 0 && <p className="text-xs text-gray-500">No whitelisted users/roles</p>}
        </div>
      </div>

      {/* Ignored Channels */}
      <div className={styles.card}>
        <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2"><Hash size={14} /> Ignored Channels</h3>
        <p className="text-xs text-gray-500 mb-3">Automod is fully disabled in these channels.</p>
        <div className="flex gap-2 mb-3">
          <input className={`${styles.inputDark} flex-1`} placeholder="Channel ID" value={newChannelId} onChange={e => setNewChannelId(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && newChannelId.trim()) { apiAction("channels", { action: "add", channelId: newChannelId.trim() }); setNewChannelId(""); }}} />
          <button className={styles.btnPrimary} onClick={() => { if (newChannelId.trim()) { apiAction("channels", { action: "add", channelId: newChannelId.trim() }); setNewChannelId(""); }}}><Plus size={16} /></button>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.ignoredChannels.map(ch => (
            <span key={ch} className="flex items-center gap-1 px-2.5 py-1 bg-dark-700 border border-dark-500 rounded-full text-xs text-gray-300 font-mono">
              #{ch} <button onClick={() => apiAction("channels", { action: "remove", channelId: ch })} className="text-red-400 hover:text-red-300"><X size={12} /></button>
            </span>
          ))}
          {data.ignoredChannels.length === 0 && <p className="text-xs text-gray-500">No ignored channels</p>}
        </div>
      </div>

      {/* Recent Logs */}
      <div className={styles.card}>
        <h3 className="text-sm font-medium text-gray-400 mb-3">Recent AutoMod Actions</h3>
        <div className="space-y-2 max-h-64 overflow-auto">
          {data.recentLogs.map((log, i) => (
            <div key={i} className="flex items-center justify-between py-2 px-3 bg-dark-700/50 rounded-lg text-xs">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-mono">{log.userId.substring(0, 10)}...</span>
                <span className="text-accent-danger font-medium">{log.module.replace('anti_', '')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 truncate max-w-xs">{log.details}</span>
                <span className="text-gray-600 text-[10px]">{new Date(log.timestamp).toLocaleString('id-ID')}</span>
              </div>
            </div>
          ))}
          {data.recentLogs.length === 0 && <p className="text-xs text-gray-500 text-center py-4">No automod actions yet</p>}
        </div>
      </div>
    </div>
  );
}
