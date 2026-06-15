"use client";
import { useEffect, useState } from "react";
import { Mic, Save, Hash, Settings, Lock, EyeOff, UserX, Ban, Type, Users } from "lucide-react";
import { styles } from "@/lib/styles";
import { useGuild } from "@/lib/GuildContext";
import ChannelSelector from "@/components/ChannelSelector";

export default function TempvoicePage() {
  const { selectedGuild } = useGuild();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [activeVoices, setActiveVoices] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { if (selectedGuild) loadSettings(); }, [selectedGuild]);

  function loadSettings() {
    if (!selectedGuild) return;
    setLoading(true);
    fetch(`/api/bot/tempvoice/settings?guildId=${selectedGuild.id}`).then(r => r.json()).then(d => {
      if (d.settings) setSettings(d.settings);
      if (d.activeVoices !== undefined) setActiveVoices(d.activeVoices);
    }).catch(() => {}).finally(() => setLoading(false));
  }

  function update(key: string, value: string) { setSettings(prev => ({ ...prev, [key]: value })); }
  function toggle(key: string) { update(key, settings[key] === '1' ? '0' : '1'); }

  async function saveAll() {
    if (!selectedGuild) return;
    setSaving(true);
    try {
      const res = await fetch("/api/bot/tempvoice/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guildId: selectedGuild.id, settings }) });
      const data = await res.json();
      setMsg(data.success ? "✅ Saved!" : "❌ " + (data.error || "Failed"));
    } catch (e: any) { setMsg("❌ " + e.message); }
    finally { setSaving(false); setTimeout(() => setMsg(""), 3000); }
  }

  if (!selectedGuild) return <div className={styles.card}><p className="text-gray-400">Select a server from the sidebar.</p></div>;
  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-400 border-t-transparent"></div></div>;

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3"><Mic className="text-cyan-400" /> Tempvoice Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configure temporary voice channel creation and permissions</p>
        </div>
        <button onClick={saveAll} disabled={saving} className={`${styles.btnPrimary} flex items-center gap-2`}>
          <Save size={16} /> {saving ? "Saving..." : msg || "Save Changes"}
        </button>
      </div>

      {/* Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><Mic size={16} className="text-cyan-400" /><span className="text-xs text-gray-500">Active Channels</span></div>
          <p className="text-xl font-bold text-white">{activeVoices}</p>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><Hash size={16} className="text-gray-400" /><span className="text-xs text-gray-500">Category ID</span></div>
          <p className="text-sm font-mono text-white truncate">{settings.jtc_category || 'Not set'}</p>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><Settings size={16} className="text-gray-400" /><span className="text-xs text-gray-500">Status</span></div>
          <p className={`text-sm font-medium ${settings.tv_enabled === '1' ? 'text-green-400' : 'text-red-400'}`}>{settings.tv_enabled === '1' ? '🟢 Active' : '🔴 Disabled'}</p>
        </div>
      </div>

      {/* Master Toggle */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center"><Mic size={20} className="text-cyan-400" /></div>
            <div><p className="font-medium text-white">Enable Tempvoice</p><p className="text-xs text-gray-500">Allow members to create temporary private voice channels</p></div>
          </div>
          <Toggle enabled={settings.tv_enabled === '1'} onClick={() => toggle('tv_enabled')} />
        </div>
      </div>

      {/* Channel Configuration */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Channel Configuration</h2>
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1.5 flex items-center gap-1"><Hash size={12} /> Category</label>
              <ChannelSelector value={settings.jtc_category || ''} onChange={v => update('jtc_category', v)} placeholder="Select category for temp channels" filter="category" />
              <p className="text-[10px] text-gray-600 mt-1">Use /admin → TempVoice → Setup to auto-create, or select category here</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5 flex items-center gap-1"><Hash size={12} /> Interface Channel</label>
              <ChannelSelector value={settings.jtc_channel || ''} onChange={v => update('jtc_channel', v)} placeholder="Select control panel channel" filter="text" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1.5 flex items-center gap-1"><Type size={12} /> Default Channel Name</label>
              <input className={styles.inputDark} placeholder="{user.name}'s Channel" value={settings.tv_default_name || ''} onChange={e => update('tv_default_name', e.target.value)} />
              <p className="text-[10px] text-gray-600 mt-1">Variables: {'{user.name}'} {'{user.id}'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5 flex items-center gap-1"><Users size={12} /> Default User Limit</label>
              <input type="number" className={styles.inputDark} placeholder="0 = unlimited" value={settings.tv_default_limit || '0'} onChange={e => update('tv_default_limit', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">User Permissions</h2>
        <p className="text-xs text-gray-500 mb-3">Control what channel owners can do with their temp voice channels</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <PermissionCard icon={Type} name="Custom Name" desc="Rename their channel" enabled={settings.tv_allow_custom_name === '1'} onToggle={() => toggle('tv_allow_custom_name')} />
          <PermissionCard icon={Lock} name="Lock/Unlock" desc="Toggle channel privacy" enabled={settings.tv_allow_lock === '1'} onToggle={() => toggle('tv_allow_lock')} />
          <PermissionCard icon={EyeOff} name="Hide/Show" desc="Make channel invisible" enabled={settings.tv_allow_hide === '1'} onToggle={() => toggle('tv_allow_hide')} />
          <PermissionCard icon={Users} name="Set Limit" desc="Change user limit" enabled={settings.tv_allow_limit === '1'} onToggle={() => toggle('tv_allow_limit')} />
          <PermissionCard icon={UserX} name="Kick Users" desc="Remove users from VC" enabled={settings.tv_allow_kick === '1'} onToggle={() => toggle('tv_allow_kick')} />
          <PermissionCard icon={Ban} name="Block Users" desc="Ban users from joining" enabled={settings.tv_allow_block === '1'} onToggle={() => toggle('tv_allow_block')} />
        </div>
      </div>

      {/* Info */}
      <div className="bg-dark-700/50 border border-dark-600 rounded-xl p-5">
        <h3 className="text-sm font-medium text-white mb-2">ℹ️ How Tempvoice Works</h3>
        <ul className="text-xs text-gray-400 space-y-1.5 list-disc list-inside">
          <li>Members click the &quot;Create Channel&quot; button in the interface channel</li>
          <li>A private voice channel is created in the designated category</li>
          <li>The creator becomes the channel owner with full control</li>
          <li>Channel auto-deletes when all members leave</li>
          <li>Owners can rename, lock, hide, kick, and block users</li>
          <li>Other members can &quot;claim&quot; ownership if the owner leaves</li>
        </ul>
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

function PermissionCard({ icon: Icon, name, desc, enabled, onToggle }: { icon: any; name: string; desc: string; enabled: boolean; onToggle: () => void }) {
  return (
    <div className={`bg-dark-800 border rounded-xl p-4 transition-all ${enabled ? "border-cyan-500/30" : "border-dark-600"}`}>
      <div className="flex items-center justify-between mb-2">
        <Icon size={18} className={enabled ? "text-cyan-400" : "text-gray-500"} />
        <Toggle enabled={enabled} onClick={onToggle} />
      </div>
      <p className="text-sm font-medium text-white">{name}</p>
      <p className="text-[11px] text-gray-500 mt-0.5">{desc}</p>
    </div>
  );
}
