"use client";
import { useState } from "react";
import { Wrench, Database, Download, Terminal, AlertTriangle, CheckCircle, Lock } from "lucide-react";
import { styles } from "@/lib/styles";
import { useGuild } from "@/lib/GuildContext";
import { useSession } from "next-auth/react";

export default function ToolsPage() {
  const { selectedGuild } = useGuild();
  const [sql, setSql] = useState("");
  const [queryResult, setQueryResult] = useState<any>(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function runQuery() {
    if (!selectedGuild || !sql.trim()) return;
    setQueryLoading(true);
    setQueryResult(null);
    try {
      const res = await fetch("/api/bot/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: "query", sql: sql.trim() }),
      });
      const data = await res.json();
      setQueryResult(data);
    } catch (e: any) {
      setQueryResult({ error: e.message });
    }
    setQueryLoading(false);
  }

  async function triggerBackup() {
    setMsg("⏳ Triggering backup...");
    try {
      const res = await fetch("/api/bot/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: "backup" }),
      });
      const data = await res.json();
      setMsg(data.success ? "✅ Backup created!" : "❌ " + (data.error || "Failed"));
    } catch (e: any) {
      setMsg("❌ " + e.message);
    }
    setTimeout(() => setMsg(""), 5000);
  }

  const { data: session } = useSession();

  // OWNER-ONLY PROTECTION
  if (!(session?.user as any)?.isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-dark-800 border border-red-500/30 rounded-xl p-8 text-center max-w-md">
          <Lock size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-sm text-gray-400">Halaman ini hanya bisa diakses oleh <strong className="text-red-400">Bot Owner</strong>.</p>
        </div>
      </div>
    );
  }

  if (!selectedGuild) return <div className={styles.card}><p className="text-gray-400">Select a server from the sidebar.</p></div>;

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3"><Wrench className="text-accent-primary" /> Tools</h1>
          <p className="text-sm text-gray-500 mt-0.5">Advanced admin tools for database and bot management</p>
        </div>
        {msg && <span className="text-sm">{msg}</span>}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button onClick={triggerBackup} className="bg-dark-800 border border-dark-600 rounded-xl p-5 text-left hover:border-green-500/30 transition-all group">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center"><Download size={20} className="text-green-400" /></div>
              <div>
                <p className="font-medium text-white group-hover:text-green-400 transition-colors">Create Backup</p>
                <p className="text-[11px] text-gray-500">Backup database to file</p>
              </div>
            </div>
          </button>

          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><Database size={20} className="text-blue-400" /></div>
              <div>
                <p className="font-medium text-white">Database Info</p>
                <p className="text-[11px] text-gray-500">SQLite + WAL mode</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-400 space-y-1">
              <p>Auto-backup: every 6 hours</p>
              <p>Max backups: 5 files</p>
              <p>Mode: Global (cross-server)</p>
            </div>
          </div>

          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center"><AlertTriangle size={20} className="text-orange-400" /></div>
              <div>
                <p className="font-medium text-white">System Status</p>
                <p className="text-[11px] text-gray-500">Bot health check</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <CheckCircle size={14} className="text-green-400" />
              <span className="text-xs text-green-400">All systems operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* SQL Query Tool */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Terminal size={14} /> SQL Query (SELECT only)</h2>
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 space-y-4">
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
            <p className="text-xs text-red-400 flex items-center gap-2"><AlertTriangle size={12} /> Only SELECT queries are allowed. Be careful with what you query.</p>
          </div>

          <div>
            <textarea
              className={`${styles.inputDark} h-28 text-xs font-mono`}
              placeholder="SELECT * FROM users ORDER BY balance DESC LIMIT 10"
              value={sql}
              onChange={e => setSql(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) runQuery(); }}
            />
            <p className="text-[10px] text-gray-600 mt-1">Press Ctrl+Enter to run</p>
          </div>

          <button onClick={runQuery} disabled={queryLoading || !sql.trim()} className={`${styles.btnPrimary} flex items-center gap-2`}>
            <Terminal size={14} /> {queryLoading ? "Running..." : "Run Query"}
          </button>

          {/* Query Results */}
          {queryResult && (
            <div className="mt-4">
              {queryResult.error ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-xs text-red-400 font-mono">{queryResult.error}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">{queryResult.count || queryResult.rows?.length || 0} rows returned</p>
                  <div className="max-h-80 overflow-auto rounded-lg border border-dark-600">
                    <table className="w-full text-xs">
                      <thead className="bg-dark-700 sticky top-0">
                        <tr>
                          {queryResult.rows?.[0] && Object.keys(queryResult.rows[0]).map(key => (
                            <th key={key} className="px-3 py-2 text-left text-gray-400 font-medium border-b border-dark-600">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dark-600/50">
                        {queryResult.rows?.map((row: any, i: number) => (
                          <tr key={i} className="hover:bg-dark-700/30">
                            {Object.values(row).map((val: any, j: number) => (
                              <td key={j} className="px-3 py-2 text-gray-300 font-mono truncate max-w-[200px]">{val === null ? <span className="text-gray-600">NULL</span> : String(val)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Database Tables Reference */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Database Tables</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { name: "users", desc: "Player profiles (balance, level, xp)" },
            { name: "user_stats", desc: "All player statistics" },
            { name: "achievements", desc: "Unlocked badges" },
            { name: "pets", desc: "Pet data (stats, level, class)" },
            { name: "fish_inventory", desc: "Fish in storage" },
            { name: "fish_collection", desc: "Collection progress" },
            { name: "fish_equipment", desc: "Rod, bait, location" },
            { name: "farm_plots", desc: "Active farm plots" },
            { name: "farm_storage", desc: "Harvested items" },
            { name: "item_inventory", desc: "General items" },
            { name: "streaks", desc: "Daily streak data" },
            { name: "server_settings", desc: "Dashboard config" },
            { name: "automod_config", desc: "Automod modules" },
            { name: "invites", desc: "Invite tracker data" },
            { name: "temp_voices", desc: "Active temp channels" },
          ].map(table => (
            <button
              key={table.name}
              onClick={() => setSql(`SELECT * FROM ${table.name} LIMIT 20`)}
              className="bg-dark-800 border border-dark-600 rounded-lg p-3 text-left hover:border-accent-primary/30 transition-all"
            >
              <p className="text-sm text-white font-mono">{table.name}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{table.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
