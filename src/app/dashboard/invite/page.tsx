"use client";
import { useEffect, useState } from "react";
import { UserPlus, Save, Trophy, Users, AlertTriangle, LogOut, Settings, Hash, MessageSquare, RotateCcw } from "lucide-react";
import { styles } from "@/lib/styles";
import { useGuild } from "@/lib/GuildContext";
import ChannelSelector from "@/components/ChannelSelector";

interface InviteEntry {
  userId: string;
  total: number;
  fake: number;
  left: number;
  totalAll: number;
  _user?: { username: string; displayName: string; avatar: string | null };
}

export default function InvitePage() {
  const { selectedGuild } = useGuild();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [leaderboard, setLeaderboard] = useState<InviteEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState<"leaderboard" | "settings">("leaderboard");

  useEffect(() => { if (selectedGuild) loadData(); }, [selectedGuild]);

  function loadData() {
    if (!selectedGuild) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/bot/invite/settings?guildId=${selectedGuild.id}`).then(r => r.json()),
      fetch(`/api/bot/invite/leaderboard?guildId=${selectedGuild.id}`).then(r => r.json()),
    ]).then(([settingsData, lbData]) => {
      if (settingsData.settings) setSettings(settingsData.settings);
      if (lbData.leaderboard) setLeaderboard(lbData.leaderboard);
    }).catch(() => {}).finally(() => setLoading(false));
  }

  function update(key: string, value: string) { setSettings(prev => ({ ...prev, [key]: value })); }
  function toggle(key: string) { update(key, settings[key] === '1' ? '0' : '1'); }

  async function saveAll() {
    if (!selectedGuild) return;
    setSaving(true);
    try {
      const res = await fetch("/api/bot/invite/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guildId: selectedGuild.id, settings }) });
      const data = await res.json();
      setMsg(data.success ? "✅ Saved!" : "❌ " + (data.error || "Failed"));
    } catch (e: any) { setMsg("❌ " + e.message); }
    finally { setSaving(false); setTimeout(() => setMsg(""), 3000); }
  }

  async function resetAll() {
    if (!selectedGuild) return;
    if (!confirm("Reset ALL invite data for this server? This cannot be undone.")) return;
    try {
      const res = await fetch("/api/bot/invite/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guildId: selectedGuild.id }) });
      const data = await res.json();
      if (data.success) { setMsg("✅ All invites reset!"); loadData(); }
      else setMsg("❌ " + (data.error || "Failed"));
    } catch (e: any) { setMsg("❌ " + e.message); }
    setTimeout(() => setMsg(""), 3000);
  }

  if (!selectedGuild) return <div className={styles.card}><p className="text-gray-400">Select a server from the sidebar.</p></div>;
  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-green-400 border-t-transparent"></div></div>;

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3"><UserPlus className="text-green-400" /> Invite Tracker</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track who invited whom and manage invite rewards</p>
        </div>
        <div className="flex items-center gap-2">
          {msg && <span className="text-sm">{msg}</span>}
          {tab === "settings" && (
            <button onClick={saveAll} disabled={saving} className={`${styles.btnPrimary} flex items-center gap-2`}>
              <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-dark-600 pb-0">
        <button onClick={() => setTab("leaderboard")} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === "leaderboard" ? "border-green-400 text-white" : "border-transparent text-gray-400 hover:text-white"}`}>
          <Trophy size={14} className="inline mr-1.5" /> Leaderboard
        </button>
        <button onClick={() => setTab("settings")} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === "settings" ? "border-green-400 text-white" : "border-transparent text-gray-400 hover:text-white"}`}>
          <Settings size={14} className="inline mr-1.5" /> Settings
        </button>
      </div>

      {tab === "leaderboard" && (
        <div className="space-y-4">
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <StatCard icon={Users} label="Total Inviters" value={leaderboard.length} color="text-green-400" />
            <StatCard icon={UserPlus} label="Total Invites" value={leaderboard.reduce((s, e) => s + e.total, 0)} color="text-blue-400" />
            <StatCard icon={AlertTriangle} label="Fake Invites" value={leaderboard.reduce((s, e) => s + e.fake, 0)} color="text-yellow-400" />
            <StatCard icon={LogOut} label="Left After Join" value={leaderboard.reduce((s, e) => s + e.left, 0)} color="text-red-400" />
          </div>

          {/* Leaderboard Table */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-dark-600 flex items-center justify-between">
              <h3 className="text-sm font-medium text-white">Invite Leaderboard</h3>
              <button onClick={resetAll} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"><RotateCcw size={12} /> Reset All</button>
            </div>
            <div className="divide-y divide-dark-600/50">
              {leaderboard.length === 0 ? (
                <div className="px-5 py-8 text-center text-gray-500 text-sm">No invite data yet</div>
              ) : (
                leaderboard.map((entry, i) => (
                  <div key={entry.userId} className="px-5 py-3 flex items-center justify-between hover:bg-dark-700/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? "bg-yellow-500/20 text-yellow-400" : "bg-dark-600 text-gray-400"}`}>{i + 1}</span>
                      {entry._user?.avatar ? (
                        <img src={entry._user.avatar} alt="" className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-dark-600 flex items-center justify-center text-xs text-gray-400">{(entry._user?.username || "?")[0]?.toUpperCase()}</div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">{entry._user?.displayName || entry.userId}</p>
                        <p className="text-[11px] text-gray-500">{entry._user?.username || entry.userId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-green-400 font-bold">{entry.total} <span className="text-gray-500 font-normal">invites</span></span>
                      {entry.fake > 0 && <span className="text-yellow-400">{entry.fake} fake</span>}
                      {entry.left > 0 && <span className="text-red-400">{entry.left} left</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "settings" && (
        <div className="space-y-4">
          {/* Enable Toggle */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center"><UserPlus size={20} className="text-green-400" /></div>
                <div><p className="font-medium text-white">Enable Invite Tracker</p><p className="text-xs text-gray-500">Track and announce invite activities</p></div>
              </div>
              <Toggle enabled={settings.invite_enabled === '1'} onClick={() => toggle('invite_enabled')} />
            </div>
          </div>

          {/* Configuration */}
          <div>
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Configuration</h2>
            <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5 flex items-center gap-1"><Hash size={12} /> Invite Log Channel</label>
                  <ChannelSelector value={settings.invite_channel || ''} onChange={v => update('invite_channel', v)} placeholder="Select a channel for invite logs" filter="text" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5 flex items-center gap-1"><Hash size={12} /> Reward Announcement Channel</label>
                  <ChannelSelector value={settings.invite_reward_channel || ''} onChange={v => update('invite_reward_channel', v)} placeholder="Defaults to Invite Log Channel" filter="text" />
                  <p className="text-[10px] text-gray-600 mt-1">Where invite-reward (milestone) messages are posted. Leave empty to use the Invite Log Channel.</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">Fake Account Threshold (days)</label>
                  <input type="number" className={styles.inputDark} value={settings.invite_fake_threshold || '7'} onChange={e => update('invite_fake_threshold', e.target.value)} />
                  <p className="text-[10px] text-gray-600 mt-1">Accounts younger than this are marked as fake invites</p>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1.5 flex items-center gap-1"><MessageSquare size={12} /> Invite Message</label>
                <textarea className={`${styles.inputDark} h-20 text-xs font-mono`} value={settings.invite_message || ''} onChange={e => update('invite_message', e.target.value)} />
                <p className="text-[10px] text-gray-600 mt-1">Variables: {'{user.mention}'} {'{user.name}'} {'{inviter.mention}'} {'{inviter.name}'} {'{inviter.total}'} {'{inviter.fake}'} {'{inviter.left}'}</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg">
                <div>
                  <p className="text-sm text-white">Deduct on Leave</p>
                  <p className="text-[11px] text-gray-500">Remove invite count when invited user leaves</p>
                </div>
                <Toggle enabled={settings.invite_leave_deduct === '1'} onClick={() => toggle('invite_leave_deduct')} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Toggle({ enabled, onClick }: { enabled: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? "bg-accent-success" : "bg-dark-500"}`}>
      <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: enabled ? '22px' : '2px' }} />
    </button>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2"><Icon size={16} className={color} /><span className="text-xs text-gray-500">{label}</span></div>
      <p className="text-xl font-bold text-white">{value.toLocaleString()}</p>
    </div>
  );
}
