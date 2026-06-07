"use client";
import { useEffect, useState } from "react";
import { MessageSquare, Save, Hash, UserCheck, Palette, Image, Mail, Clock, Send } from "lucide-react";
import { styles } from "@/lib/styles";
import { useGuild } from "@/lib/GuildContext";
import ChannelSelector from "@/components/ChannelSelector";
import RoleSelector from "@/components/RoleSelector";

export default function WelcomerPage() {
  const { selectedGuild } = useGuild();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [testing, setTesting] = useState(false);

  useEffect(() => { if (selectedGuild) loadSettings(); }, [selectedGuild]);

  function loadSettings() {
    if (!selectedGuild) return;
    setLoading(true);
    fetch(`/api/bot/welcomer/settings?guildId=${selectedGuild.id}`).then(r => r.json()).then(d => {
      if (d.settings) setSettings(d.settings);
    }).catch(() => {}).finally(() => setLoading(false));
  }

  function update(key: string, value: string) { setSettings(prev => ({ ...prev, [key]: value })); }
  function toggle(key: string) { update(key, settings[key] === '1' ? '0' : '1'); }

  async function saveAll() {
    if (!selectedGuild) return;
    setSaving(true);
    try {
      const res = await fetch("/api/bot/welcomer/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guildId: selectedGuild.id, settings }) });
      const data = await res.json();
      setMsg(data.success ? "✅ Saved!" : "❌ " + (data.error || "Failed"));
    } catch (e: any) { setMsg("❌ " + e.message); }
    finally { setSaving(false); setTimeout(() => setMsg(""), 3000); }
  }

  async function testWelcome() {
    if (!selectedGuild) return;
    setTesting(true);
    try {
      const res = await fetch("/api/bot/welcomer/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guildId: selectedGuild.id }) });
      const data = await res.json();
      setMsg(data.success ? "✅ Test message sent!" : "❌ " + (data.error || "Failed"));
    } catch (e: any) { setMsg("❌ " + e.message); }
    finally { setTesting(false); setTimeout(() => setMsg(""), 3000); }
  }

  if (!selectedGuild) return <div className={styles.card}><p className="text-gray-400">Select a server from the sidebar.</p></div>;
  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-400 border-t-transparent"></div></div>;

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3"><MessageSquare className="text-purple-400" /> Welcomer</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configure welcome and goodbye messages for your server</p>
        </div>
        <div className="flex items-center gap-2">
          {msg && <span className="text-sm">{msg}</span>}
          <button onClick={testWelcome} disabled={testing} className="px-3 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 text-sm rounded-lg transition-colors flex items-center gap-1.5">
            <Send size={14} /> {testing ? "Sending..." : "Test"}
          </button>
          <button onClick={saveAll} disabled={saving} className={`${styles.btnPrimary} flex items-center gap-2`}>
            <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Welcome Section */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Welcome Message</h2>
        <div className="space-y-3">
          {/* Enable Welcome */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center"><MessageSquare size={20} className="text-purple-400" /></div>
                <div><p className="font-medium text-white">Enable Welcome Message</p><p className="text-xs text-gray-500">Send a message when a new member joins</p></div>
              </div>
              <Toggle enabled={settings.welcome_enabled === '1'} onClick={() => toggle('welcome_enabled')} />
            </div>
          </div>

          {/* Welcome Config */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1.5 flex items-center gap-1"><Hash size={12} /> Welcome Channel</label>
                <ChannelSelector value={settings.welcome_channel || ''} onChange={v => update('welcome_channel', v)} placeholder="Select welcome channel" filter="text" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5 flex items-center gap-1"><Palette size={12} /> Embed Color</label>
                <div className="flex gap-2">
                  <input type="color" className="w-10 h-10 rounded-lg border border-dark-500 cursor-pointer bg-transparent" value={settings.welcome_embed_color || '#5865F2'} onChange={e => update('welcome_embed_color', e.target.value)} />
                  <input className={styles.inputDark} value={settings.welcome_embed_color || '#5865F2'} onChange={e => update('welcome_embed_color', e.target.value)} placeholder="#5865F2" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Embed Title</label>
              <input className={styles.inputDark} value={settings.welcome_embed_title || ''} onChange={e => update('welcome_embed_title', e.target.value)} placeholder="👋 Welcome!" />
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Welcome Message</label>
              <textarea className={`${styles.inputDark} h-24 text-xs font-mono`} value={settings.welcome_message || ''} onChange={e => update('welcome_message', e.target.value)} />
              <p className="text-[10px] text-gray-600 mt-1">Variables: {'{user.mention}'} {'{user.name}'} {'{user.tag}'} {'{user.avatar}'} {'{user.createdAt}'} {'{server.name}'} {'{server.memberCount}'} {'{server.icon}'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1.5 flex items-center gap-1"><Image size={12} /> Thumbnail URL</label>
                <input className={styles.inputDark} placeholder="{user.avatar} or image URL" value={settings.welcome_embed_thumbnail || ''} onChange={e => update('welcome_embed_thumbnail', e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5 flex items-center gap-1"><Image size={12} /> Banner Image URL</label>
                <input className={styles.inputDark} placeholder="https://..." value={settings.welcome_embed_image || ''} onChange={e => update('welcome_embed_image', e.target.value)} />
              </div>
            </div>

            <div className="border-t border-dark-600 pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Image size={14} className="text-purple-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Welcome Card (auto-generated image)</p>
                    <p className="text-[10px] text-gray-500">Background + avatar + text, rendered per member</p>
                  </div>
                </div>
                <Toggle enabled={settings.welcome_banner_enabled === '1'} onClick={() => toggle('welcome_banner_enabled')} />
              </div>
              {settings.welcome_banner_enabled === '1' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1.5">Background Image URL</label>
                    <input className={styles.inputDark} placeholder="https://your-image-link.png" value={settings.welcome_banner_bg || ''} onChange={e => update('welcome_banner_bg', e.target.value)} />
                    <p className="text-[10px] text-gray-600 mt-1">Paste a direct image link. Empty = dark gradient.</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1.5">Headline Text</label>
                    <input className={styles.inputDark} placeholder="WELCOME" value={settings.welcome_banner_text || ''} onChange={e => update('welcome_banner_text', e.target.value)} />
                    <p className="text-[10px] text-gray-600 mt-1">Big text on the card. Color = embed color.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DM Welcome */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Direct Message</h2>
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><Mail size={20} className="text-blue-400" /></div>
              <div><p className="font-medium text-white">Welcome DM</p><p className="text-xs text-gray-500">Send a private message to new members</p></div>
            </div>
            <Toggle enabled={settings.welcome_dm_enabled === '1'} onClick={() => toggle('welcome_dm_enabled')} />
          </div>
          {settings.welcome_dm_enabled === '1' && (
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">DM Message</label>
              <textarea className={`${styles.inputDark} h-20 text-xs font-mono`} value={settings.welcome_dm_message || ''} onChange={e => update('welcome_dm_message', e.target.value)} />
            </div>
          )}
        </div>
      </div>

      {/* Auto Role */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Auto Role</h2>
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1.5 flex items-center gap-1"><UserCheck size={12} /> Auto-Roles</label>
              <RoleSelector
                value=""
                onChange={() => {}}
                multiple
                values={(settings.welcome_autorole || '').split(',').filter(Boolean)}
                onChangeMultiple={(ids) => update('welcome_autorole', ids.join(','))}
                placeholder="Select roles to assign on join"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5 flex items-center gap-1"><Clock size={12} /> Delay (seconds)</label>
              <input type="number" className={styles.inputDark} value={settings.welcome_autorole_delay || '0'} onChange={e => update('welcome_autorole_delay', e.target.value)} />
              <p className="text-[10px] text-gray-600 mt-1">Wait before assigning roles (0 = instant)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Goodbye Section */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Goodbye Message</h2>
        <div className="space-y-3">
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center"><MessageSquare size={20} className="text-red-400" /></div>
                <div><p className="font-medium text-white">Enable Goodbye Message</p><p className="text-xs text-gray-500">Send a message when a member leaves</p></div>
              </div>
              <Toggle enabled={settings.goodbye_enabled === '1'} onClick={() => toggle('goodbye_enabled')} />
            </div>
          </div>

          {settings.goodbye_enabled === '1' && (
            <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5 flex items-center gap-1"><Hash size={12} /> Goodbye Channel</label>
                  <ChannelSelector value={settings.goodbye_channel || ''} onChange={v => update('goodbye_channel', v)} placeholder="Select goodbye channel" filter="text" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5 flex items-center gap-1"><Palette size={12} /> Embed Color</label>
                  <div className="flex gap-2">
                    <input type="color" className="w-10 h-10 rounded-lg border border-dark-500 cursor-pointer bg-transparent" value={settings.goodbye_embed_color || '#FF6B6B'} onChange={e => update('goodbye_embed_color', e.target.value)} />
                    <input className={styles.inputDark} value={settings.goodbye_embed_color || '#FF6B6B'} onChange={e => update('goodbye_embed_color', e.target.value)} />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Goodbye Message</label>
                <textarea className={`${styles.inputDark} h-20 text-xs font-mono`} value={settings.goodbye_message || ''} onChange={e => update('goodbye_message', e.target.value)} />
                <p className="text-[10px] text-gray-600 mt-1">Variables: {'{user.mention}'} {'{user.name}'} {'{server.name}'} {'{server.memberCount}'}</p>
              </div>

              <div className="border-t border-dark-600 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Image size={14} className="text-red-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Goodbye Card (auto-generated image)</p>
                      <p className="text-[10px] text-gray-500">Background + avatar + text, rendered per member</p>
                    </div>
                  </div>
                  <Toggle enabled={settings.goodbye_banner_enabled === '1'} onClick={() => toggle('goodbye_banner_enabled')} />
                </div>
                {settings.goodbye_banner_enabled === '1' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1.5">Background Image URL</label>
                      <input className={styles.inputDark} placeholder="https://your-image-link.png" value={settings.goodbye_banner_bg || ''} onChange={e => update('goodbye_banner_bg', e.target.value)} />
                      <p className="text-[10px] text-gray-600 mt-1">Paste a direct image link. Empty = dark gradient.</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1.5">Headline Text</label>
                      <input className={styles.inputDark} placeholder="GOODBYE" value={settings.goodbye_banner_text || ''} onChange={e => update('goodbye_banner_text', e.target.value)} />
                      <p className="text-[10px] text-gray-600 mt-1">Big text on the card. Color = embed color.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
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
