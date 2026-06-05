"use client";
import { useState } from "react";
import { Shield, Coins, User, Package, RotateCcw, Database } from "lucide-react";

export default function AdminPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("balance");

  async function adminAction(endpoint: string, data: any) {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/bot/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint, ...data }),
      });
      const json = await res.json();
      setResult(json);
    } catch (e: any) {
      setResult({ error: e.message });
    } finally {
      setLoading(false);
    }
  }

  const tabs = [
    { id: "balance", label: "Balance", icon: Coins },
    { id: "level", label: "Level", icon: User },
    { id: "items", label: "Items", icon: Package },
    { id: "reset", label: "Reset", icon: RotateCcw },
    { id: "query", label: "Query", icon: Database },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Shield className="text-accent-primary" /> Admin Panel
        </h1>
        <p className="text-gray-400 mt-1">Kontrol penuh terhadap bot database</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setResult(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-accent-primary text-white shadow-neon"
                  : "bg-dark-700 text-gray-400 hover:text-white hover:bg-dark-600"
              }`}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="card">
        {activeTab === "balance" && <BalanceForm onSubmit={adminAction} loading={loading} />}
        {activeTab === "level" && <LevelForm onSubmit={adminAction} loading={loading} />}
        {activeTab === "items" && <ItemsForm onSubmit={adminAction} loading={loading} />}
        {activeTab === "reset" && <ResetForm onSubmit={adminAction} loading={loading} />}
        {activeTab === "query" && <QueryForm onSubmit={adminAction} loading={loading} />}
      </div>

      {/* Result */}
      {result && (
        <div className={`card ${result.error ? "border-accent-danger/30" : "border-accent-success/30"}`}>
          <p className="text-sm font-medium mb-2">{result.error ? "❌ Error" : "✅ Success"}</p>
          <pre className="text-xs text-gray-300 bg-dark-900 p-3 rounded-lg overflow-auto max-h-60">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function BalanceForm({ onSubmit, loading }: { onSubmit: any; loading: boolean }) {
  const [userId, setUserId] = useState("");
  const [action, setAction] = useState("add");
  const [amount, setAmount] = useState("");
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-white">💰 Manage Balance</h3>
      <input className="input-dark" placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
      <select className="input-dark" value={action} onChange={(e) => setAction(e.target.value)}>
        <option value="add">Add</option>
        <option value="remove">Remove</option>
        <option value="set">Set</option>
      </select>
      <input className="input-dark" type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <button className="btn-primary" disabled={loading} onClick={() => onSubmit("balance", { userId, action, amount: parseInt(amount) })}>
        {loading ? "Processing..." : "Execute"}
      </button>
    </div>
  );
}

function LevelForm({ onSubmit, loading }: { onSubmit: any; loading: boolean }) {
  const [userId, setUserId] = useState("");
  const [level, setLevel] = useState("");
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-white">📈 Set Level</h3>
      <input className="input-dark" placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
      <input className="input-dark" type="number" placeholder="New Level" value={level} onChange={(e) => setLevel(e.target.value)} />
      <button className="btn-primary" disabled={loading} onClick={() => onSubmit("level", { userId, level: parseInt(level) })}>
        {loading ? "Processing..." : "Set Level"}
      </button>
    </div>
  );
}

function ItemsForm({ onSubmit, loading }: { onSubmit: any; loading: boolean }) {
  const [userId, setUserId] = useState("");
  const [itemId, setItemId] = useState("");
  const [action, setAction] = useState("give");
  const [qty, setQty] = useState("1");
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-white">🎒 Give/Remove Items</h3>
      <input className="input-dark" placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
      <input className="input-dark" placeholder="Item ID (e.g. rod_part, mystery_box)" value={itemId} onChange={(e) => setItemId(e.target.value)} />
      <select className="input-dark" value={action} onChange={(e) => setAction(e.target.value)}>
        <option value="give">Give</option>
        <option value="remove">Remove</option>
      </select>
      <input className="input-dark" type="number" placeholder="Quantity" value={qty} onChange={(e) => setQty(e.target.value)} />
      <button className="btn-primary" disabled={loading} onClick={() => onSubmit("items", { userId, itemId, action, quantity: parseInt(qty) })}>
        {loading ? "Processing..." : "Execute"}
      </button>
    </div>
  );
}

function ResetForm({ onSubmit, loading }: { onSubmit: any; loading: boolean }) {
  const [userId, setUserId] = useState("");
  const [resetType, setResetType] = useState("balance");
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-white">⚠️ Reset User Data</h3>
      <p className="text-sm text-red-400">Hati-hati! Aksi ini tidak bisa di-undo.</p>
      <input className="input-dark" placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
      <select className="input-dark" value={resetType} onChange={(e) => setResetType(e.target.value)}>
        <option value="balance">Reset Balance</option>
        <option value="level">Reset Level</option>
        <option value="fish">Reset Fish (inventory + collection)</option>
        <option value="pets">Reset Pets</option>
        <option value="all">⚠️ RESET ALL (hapus semua data)</option>
      </select>
      <button className="btn-danger" disabled={loading} onClick={() => onSubmit("reset-user", { userId, resetType })}>
        {loading ? "Processing..." : "Reset User"}
      </button>
    </div>
  );
}

function QueryForm({ onSubmit, loading }: { onSubmit: any; loading: boolean }) {
  const [sql, setSql] = useState("");
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-white">🔍 Raw Query (SELECT only)</h3>
      <textarea className="input-dark h-24 font-mono text-sm" placeholder="SELECT * FROM users LIMIT 10" value={sql} onChange={(e) => setSql(e.target.value)} />
      <button className="btn-primary" disabled={loading} onClick={() => onSubmit("query", { sql })}>
        {loading ? "Executing..." : "Run Query"}
      </button>
    </div>
  );
}
