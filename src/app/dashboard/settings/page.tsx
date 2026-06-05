"use client";
import { useEffect, useState } from "react";
import { Settings, Save } from "lucide-react";

import { styles } from "@/lib/styles";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/bot/admin")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function saveSetting() {
    if (!newKey) return;
    setSaving(true);
    try {
      const res = await fetch("/api/bot/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: "settings", guildId: "global", key: newKey, value: newValue }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg("✅ Saved!");
        setSettings([...settings.filter(s => s.key !== newKey), { guildId: "global", key: newKey, value: newValue }]);
        setNewKey("");
        setNewValue("");
      } else {
        setMsg("❌ " + (data.error || "Failed"));
      }
    } catch (e: any) {
      setMsg("❌ " + e.message);
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 3000);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Settings className="text-accent-primary" /> Server Settings
        </h1>
        <p className="text-gray-400 mt-1">View dan edit bot settings</p>
      </div>

      {/* Add/Edit Setting */}
      <div className={styles.card}>
        <h3 className="font-semibold text-white mb-4">Add/Edit Setting</h3>
        <div className="flex gap-3 flex-wrap">
          <input className={`${styles.inputDark} flex-1 min-w-[200px]`} placeholder="Key" value={newKey} onChange={(e) => setNewKey(e.target.value)} />
          <input className={`${styles.inputDark} flex-1 min-w-[200px]`} placeholder="Value" value={newValue} onChange={(e) => setNewValue(e.target.value)} />
          <button className={`${styles.btnPrimary} flex items-center gap-2`} onClick={saveSetting} disabled={saving}>
            <Save size={16} /> {saving ? "..." : "Save"}
          </button>
        </div>
        {msg && <p className="text-sm mt-2">{msg}</p>}
      </div>

      {/* Current Settings */}
      <div className={styles.card}>
        <h3 className="font-semibold text-white mb-4">Current Settings ({settings.length})</h3>
        {loading ? (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-primary mx-auto"></div>
        ) : settings.length === 0 ? (
          <p className="text-gray-500">No settings found</p>
        ) : (
          <div className="overflow-auto max-h-96">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-600 text-gray-500 text-left">
                  <th className="pb-2">Guild</th>
                  <th className="pb-2">Key</th>
                  <th className="pb-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {settings.slice(0, 50).map((s: any, i: number) => (
                  <tr key={i} className="border-b border-dark-700/50">
                    <td className="py-2 font-mono text-xs text-gray-500">{s.guildId?.substring(0, 8) || "-"}</td>
                    <td className="py-2 text-accent-primary font-mono text-xs">{s.key}</td>
                    <td className="py-2 text-gray-300 text-xs truncate max-w-xs">{s.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
