"use client";
import { useEffect, useState } from "react";
import { Flame, Save, Clock, Award, MessageSquare, UserCheck, Globe } from "lucide-react";
import { styles } from "@/lib/styles";
import { useGuild } from "@/lib/GuildContext";
import RewardEditor, { Reward } from "@/components/RewardEditor";
import ChannelSelector from "@/components/ChannelSelector";

const TIMEZONES = [
  { value: "Asia/Jakarta", label: "UTC+7 — Asia/Jakarta (WIB)" },
  { value: "Asia/Makassar", label: "UTC+8 — Asia/Makassar (WITA)" },
  { value: "Asia/Jayapura", label: "UTC+9 — Asia/Jayapura (WIT)" },
  { value: "Asia/Singapore", label: "UTC+8 — Asia/Singapore" },
  { value: "America/New_York", label: "UTC-5 — New York (EST)" },
  { value: "Europe/London", label: "UTC+0 — London (GMT)" },
];

export default function StreakSettingsPage() {
  const { selectedGuild } = useGuild();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { if (selectedGuild) loadSettings(); }, [selectedGuild]);

  function loadSettings() {
    if (!selectedGuild) return;
    setLoading(true);
    fetch(`/api/bot/streak/settings?guildId=${selectedGuild.id}`).then(r => r.json()).then(d => {
      if (d.settings) setSettings(d.settings);
    }).catch(() => {}).finally(() => setLoading(false));
  }

  function update(key: string, value: string) { setSettings(prev => ({ ...prev, [key]: value })); }
  function toggle(key: string) { update(key, settings[key] === '1' ? '0' : '1'); }

  async function saveAll() {
    if (!selectedGuild) return;
    setSaving(true);
    try {
      const res = await fetch("/api/bot/streak/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guildId: selectedGuild.id, settings }) });
      const data = await res.json();
      setMsg(data.success ? "✅ Saved!" : "❌ " + (data.error || "Failed"));
    } catch (e: any) { setMsg("❌ " + e.message); }
    finally { setSaving(false); setTimeout(() => setMsg(""), 3000); }
  }

  if (!selectedGuild) return <div className={styles.card}><p className="text-gray-400">Select a server from the sidebar.</p></div>;
  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-400 border-t-transparent"></div></div>;

  // Parse rewards from settings into Reward[] format
  function parseRewards(s: Record<string, string>): Reward[] {
    try {
      const raw = s.streak_rewards;
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    // Fallback: try to build from old fixed milestones
    const rewards: Reward[] = [];
    for (const d of ['7','14','30','60','100']) {
      const money = parseInt(s[`streak_reward_${d}`] || '0');
      const roleId = s[`streak_role_${d}`] || '';
      if (money > 0 || roleId) {
        const type = (money > 0 && roleId) ? 'both' : (roleId ? 'role' : 'money');
        rewards.push({ id: `legacy_${d}`, days: parseInt(d), money, roleId, type });
      }
    }
    return rewards;
  }

  function saveRewardsToSettings(rewards: Reward[]) {
    update('streak_rewards', JSON.stringify(rewards));
    // Also update individual keys for backward compatibility
    for (const d of ['7','14','30','60','100']) {
      const found = rewards.find(r => r.days === parseInt(d));
      update(`streak_reward_${d}`, found ? String(found.money) : '0');
      update(`streak_role_${d}`, found ? found.roleId : '');
    }
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3"><Flame className="text-orange-400" /> Streak Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configure the daily streak system for your server</p>
        </div>
        <button onClick={saveAll} disabled={saving} className={`${styles.btnPrimary} flex items-center gap-2`}>
          <Save size={16} /> {saving ? "Saving..." : msg || "Save Changes"}
        </button>
      </div>

      {/* Feature Settings */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Feature Settings</h2>
        <div className="space-y-3">
          {/* Enable Streak */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center"><Flame size={20} className="text-orange-400" /></div>
                <div><p className="font-medium text-white">Enable Streak System</p><p className="text-xs text-gray-500">Allow members to track daily activity streaks</p></div>
              </div>
              <Toggle enabled={settings.streak_enabled === '1'} onClick={() => toggle('streak_enabled')} />
            </div>
          </div>

          {/* Auto Change Nickname */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><UserCheck size={20} className="text-blue-400" /></div>
                <div><p className="font-medium text-white">Auto Change Nickname</p><p className="text-xs text-gray-500">Show streak count in nickname (e.g. pekoid 🔥 52)</p></div>
              </div>
              <Toggle enabled={settings.streak_auto_nickname === '1'} onClick={() => toggle('streak_auto_nickname')} />
            </div>
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Configuration</h2>
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Streak Emoji */}
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Streak Emoji</label>
              <input className={styles.inputDark} value={settings.streak_emoji || '🔥'} onChange={e => update('streak_emoji', e.target.value)} placeholder="🔥" />
            </div>
            {/* Min Streak (days to show) */}
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Min Streak (days to show)</label>
              <input type="number" className={styles.inputDark} value={settings.streak_min_days || '3'} onChange={e => update('streak_min_days', e.target.value)} />
            </div>
            {/* Monthly Restore Quota */}
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Monthly Restore Quota</label>
              <input type="number" className={styles.inputDark} value={settings.streak_monthly_restore || '5'} onChange={e => update('streak_monthly_restore', e.target.value)} />
            </div>
          </div>

          {/* Timezone */}
          <div className="mt-4">
            <label className="text-xs text-gray-500 block mb-1.5 flex items-center gap-1"><Globe size={12} /> Streak Timezone</label>
            <select className={styles.inputDark} value={settings.streak_timezone || 'Asia/Jakarta'} onChange={e => update('streak_timezone', e.target.value)}>
              {TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
            </select>
            <p className="text-[10px] text-gray-600 mt-1">Timezone used to determine when a new streak day begins. Leave as WIB for Indonesian servers.</p>
          </div>
        </div>
      </div>

      {/* Streak Role Rewards */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Streak Role Rewards</h2>
        <p className="text-xs text-gray-500 mb-3">Assign roles and money when a member reaches a streak milestone.</p>
        <RewardEditor
          rewards={parseRewards(settings)}
          onChange={(rewards) => saveRewardsToSettings(rewards)}
          label="days"
          placeholder="7"
          milestoneLabel="Streak Days"
        />
      </div>

      {/* Announcement */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Milestone Announcement</h2>
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1.5 flex items-center gap-1"><MessageSquare size={12} /> Announcement Channel</label>
              <ChannelSelector value={settings.streak_announce_channel || ''} onChange={v => update('streak_announce_channel', v)} placeholder="Select channel (empty = disabled)" filter="text" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Milestone Message</label>
              <textarea className={`${styles.inputDark} h-20 text-xs font-mono`} value={settings.streak_announce_message || ''} onChange={e => update('streak_announce_message', e.target.value)} />
              <p className="text-[10px] text-gray-600 mt-1">Variables: {'{user.mention}'} {'{user.name}'} {'{streak}'}</p>
            </div>
          </div>
        </div>
      </div>
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
