"use client";
import { useEffect, useState } from "react";
import { Settings, Save, MessageSquare, Mic, Heart, Megaphone, Shield, Palette, Hash, Users as UsersIcon } from "lucide-react";
import { styles } from "@/lib/styles";
import { useGuild } from "@/lib/GuildContext";
import RewardEditor, { Reward } from "@/components/RewardEditor";

export default function LevelingSettingsPage() {
  const { selectedGuild } = useGuild();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { if (selectedGuild) loadSettings(); }, [selectedGuild]);

  function loadSettings() {
    if (!selectedGuild) return;
    setLoading(true);
    fetch(`/api/bot/leveling/settings?guildId=${selectedGuild.id}`).then(r => r.json()).then(d => {
      if (d.settings) setSettings(d.settings);
    }).catch(() => {}).finally(() => setLoading(false));
  }

  function update(key: string, value: string) { setSettings(prev => ({ ...prev, [key]: value })); }
  function toggle(key: string) { update(key, settings[key] === '1' ? '0' : '1'); }

  async function saveAll() {
    if (!selectedGuild) return;
    setSaving(true);
    try {
      const res = await fetch("/api/bot/leveling/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guildId: selectedGuild.id, settings }) });
      const data = await res.json();
      setMsg(data.success ? "✅ Saved!" : "❌ " + (data.error || "Failed"));
    } catch (e: any) { setMsg("❌ " + e.message); }
    finally { setSaving(false); setTimeout(() => setMsg(""), 3000); }
  }

  if (!selectedGuild) return <div className={styles.card}><p className="text-gray-400">Select a server from the sidebar.</p></div>;
  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-primary border-t-transparent"></div></div>;

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3"><Settings className="text-accent-primary" /> Leveling Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configure how XP and levels work in your server</p>
        </div>
        <button onClick={saveAll} disabled={saving} className={`${styles.btnPrimary} flex items-center gap-2`}>
          <Save size={16} /> {saving ? "Saving..." : msg || "Save Changes"}
        </button>
      </div>

      {/* Master Toggle */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center"><Settings size={20} className="text-accent-primary" /></div>
            <div><p className="font-medium text-white">Leveling System</p><p className="text-xs text-gray-500">Enable or disable the entire leveling system</p></div>
          </div>
          <Toggle enabled={settings.leveling_enabled === '1'} onClick={() => toggle('leveling_enabled')} />
        </div>
      </div>

      {/* XP Source Modules */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">XP Sources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <ModuleCard icon={MessageSquare} name="Message XP" desc="Award XP for sending messages" enabled={settings.msg_xp_enabled === '1'} onToggle={() => toggle('msg_xp_enabled')} />
          <ModuleCard icon={Mic} name="Voice XP" desc="Award XP for time in voice channels" enabled={settings.voice_xp_enabled === '1'} onToggle={() => toggle('voice_xp_enabled')} />
          <ModuleCard icon={Heart} name="Reaction XP" desc="Award XP for reactions" enabled={settings.reaction_xp_enabled === '1'} onToggle={() => toggle('reaction_xp_enabled')} />
          <ModuleCard icon={Megaphone} name="Level Up Announce" desc="Send messages when users level up" enabled={settings.levelup_announce_enabled === '1'} onToggle={() => toggle('levelup_announce_enabled')} />
        </div>
      </div>

      {/* XP Formula */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">XP Formula</h2>
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="text-xs text-gray-500 block mb-1.5">XP Multiplier</label><input type="number" step="0.1" className={styles.inputDark} value={settings.xp_multiplier || '1'} onChange={e => update('xp_multiplier', e.target.value)} /></div>
            <div><label className="text-xs text-gray-500 block mb-1.5">Max Level</label><input type="number" className={styles.inputDark} value={settings.max_level || '200'} onChange={e => update('max_level', e.target.value)} /></div>
            <div><label className="text-xs text-gray-500 block mb-1.5">Formula</label><div className="px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-xs text-gray-400 font-mono">XP to Next = (level + 1)² × 100 × multiplier</div></div>
          </div>
        </div>
      </div>

      {/* Module Configuration */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Module Configuration</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Message XP Config */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><MessageSquare size={16} className="text-blue-400" /><span className="text-sm font-medium text-white">Message XP</span></div><Toggle enabled={settings.msg_xp_enabled === '1'} onClick={() => toggle('msg_xp_enabled')} small /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[11px] text-gray-500 block mb-1">Min XP</label><input type="number" className={styles.inputDark} value={settings.msg_xp_min || '5'} onChange={e => update('msg_xp_min', e.target.value)} /></div>
              <div><label className="text-[11px] text-gray-500 block mb-1">Max XP</label><input type="number" className={styles.inputDark} value={settings.msg_xp_max || '15'} onChange={e => update('msg_xp_max', e.target.value)} /></div>
            </div>
            <div><label className="text-[11px] text-gray-500 block mb-1">Cooldown (seconds)</label><input type="number" className={styles.inputDark} value={settings.msg_xp_cooldown || '60'} onChange={e => update('msg_xp_cooldown', e.target.value)} /></div>
          </div>

          {/* Voice XP Config */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Mic size={16} className="text-green-400" /><span className="text-sm font-medium text-white">Voice XP</span></div><Toggle enabled={settings.voice_xp_enabled === '1'} onClick={() => toggle('voice_xp_enabled')} small /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[11px] text-gray-500 block mb-1">Min XP (per minute)</label><input type="number" className={styles.inputDark} value={settings.voice_xp_min || '3'} onChange={e => update('voice_xp_min', e.target.value)} /></div>
              <div><label className="text-[11px] text-gray-500 block mb-1">Max XP (per minute)</label><input type="number" className={styles.inputDark} value={settings.voice_xp_max || '8'} onChange={e => update('voice_xp_max', e.target.value)} /></div>
            </div>
            <div><label className="text-[11px] text-gray-500 block mb-1">Cooldown (seconds)</label><input type="number" className={styles.inputDark} value={settings.voice_xp_cooldown || '60'} onChange={e => update('voice_xp_cooldown', e.target.value)} /></div>
          </div>

          {/* Reaction XP Config */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Heart size={16} className="text-pink-400" /><span className="text-sm font-medium text-white">Reaction XP</span></div><Toggle enabled={settings.reaction_xp_enabled === '1'} onClick={() => toggle('reaction_xp_enabled')} small /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[11px] text-gray-500 block mb-1">Min XP</label><input type="number" className={styles.inputDark} value={settings.reaction_xp_min || '1'} onChange={e => update('reaction_xp_min', e.target.value)} /></div>
              <div><label className="text-[11px] text-gray-500 block mb-1">Max XP</label><input type="number" className={styles.inputDark} value={settings.reaction_xp_max || '5'} onChange={e => update('reaction_xp_max', e.target.value)} /></div>
            </div>
            <div><label className="text-[11px] text-gray-500 block mb-1">Cooldown (seconds)</label><input type="number" className={styles.inputDark} value={settings.reaction_xp_cooldown || '30'} onChange={e => update('reaction_xp_cooldown', e.target.value)} /></div>
          </div>

          {/* Level Up Announcement */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Megaphone size={16} className="text-yellow-400" /><span className="text-sm font-medium text-white">Level Up Announcement</span></div><Toggle enabled={settings.levelup_announce_enabled === '1'} onClick={() => toggle('levelup_announce_enabled')} small /></div>
            <div><label className="text-[11px] text-gray-500 block mb-1">Announcement Channel (ID)</label><input className={styles.inputDark} placeholder="Channel ID (empty = same channel)" value={settings.levelup_channel || ''} onChange={e => update('levelup_channel', e.target.value)} /></div>
            <div><label className="text-[11px] text-gray-500 block mb-1">Level Up Message</label><textarea className={`${styles.inputDark} h-20 text-xs font-mono`} value={settings.levelup_message || ''} onChange={e => update('levelup_message', e.target.value)} /></div>
            <p className="text-[10px] text-gray-600">Variables: {'{user.mention}'} {'{user.name}'} {'{user.level}'} {'{user.xp}'}</p>
          </div>
        </div>
      </div>

      {/* XP Restrictions */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">XP Restrictions</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3"><Hash size={16} className="text-gray-400" /><span className="text-sm font-medium text-white">No XP Channels</span></div>
            <p className="text-xs text-gray-500 mb-2">Channel IDs where XP is not earned (comma-separated)</p>
            <textarea className={`${styles.inputDark} h-16 text-xs font-mono`} placeholder="123456789,987654321" value={settings.no_xp_channels === '[]' ? '' : settings.no_xp_channels || ''} onChange={e => update('no_xp_channels', e.target.value)} />
          </div>
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3"><UsersIcon size={16} className="text-gray-400" /><span className="text-sm font-medium text-white">No XP Roles</span></div>
            <p className="text-xs text-gray-500 mb-2">Role IDs that cannot earn XP (comma-separated)</p>
            <textarea className={`${styles.inputDark} h-16 text-xs font-mono`} placeholder="123456789,987654321" value={settings.no_xp_roles === '[]' ? '' : settings.no_xp_roles || ''} onChange={e => update('no_xp_roles', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Level Rewards */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Level Rewards</h2>
        <p className="text-xs text-gray-500 mb-3">Assign roles and money when a member reaches a specific level.</p>
        <RewardEditor
          rewards={parseLevelRewards(settings.role_rewards || '[]')}
          onChange={(rewards) => update('role_rewards', JSON.stringify(rewards))}
          label="level"
          placeholder="5"
          milestoneLabel="Level"
        />
      </div>
    </div>
  );
}

function parseLevelRewards(raw: string): Reward[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id) return parsed;
    return [];
  } catch (e) {
    if (raw && raw.includes(':')) {
      return raw.split(',').filter(Boolean).map((pair, i) => {
        const [level, roleId] = pair.split(':');
        return { id: `legacy_${i}`, days: parseInt(level) || 0, money: 0, roleId: roleId?.trim() || '', type: 'role' as const };
      });
    }
    return [];
  }
}

function Toggle({ enabled, onClick, small }: { enabled: boolean; onClick: () => void; small?: boolean }) {
  const w = small ? "w-9 h-5" : "w-11 h-6";
  const dot = small ? "w-3.5 h-3.5" : "w-5 h-5";
  const pos = small ? (enabled ? '18px' : '2px') : (enabled ? '22px' : '2px');
  return (
    <button onClick={onClick} className={`relative ${w} rounded-full transition-colors ${enabled ? "bg-accent-success" : "bg-dark-500"}`}>
      <div className={`absolute top-0.5 ${dot} rounded-full bg-white transition-all`} style={{ left: pos }} />
    </button>
  );
}

function ModuleCard({ icon: Icon, name, desc, enabled, onToggle }: { icon: any; name: string; desc: string; enabled: boolean; onToggle: () => void }) {
  return (
    <div className={`bg-dark-800 border rounded-xl p-4 transition-all ${enabled ? "border-accent-success/30" : "border-dark-600"}`}>
      <div className="flex items-center justify-between mb-3">
        <Icon size={18} className={enabled ? "text-accent-success" : "text-gray-500"} />
        <Toggle enabled={enabled} onClick={onToggle} small />
      </div>
      <p className="text-sm font-medium text-white">{name}</p>
      <p className="text-[11px] text-gray-500 mt-0.5">{desc}</p>
    </div>
  );
}
