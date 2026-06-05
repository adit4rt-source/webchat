"use client";
import { useEffect, useState } from "react";
import { Shield, Coins, User, Package, RotateCcw, Database, PawPrint, Fish, Sprout, Flame, BarChart3, Trophy, Swords, Zap, Lock } from "lucide-react";
import { styles } from "@/lib/styles";
import MemberSelector from "@/components/MemberSelector";
import { useGuild } from "@/lib/GuildContext";
import { useSession } from "next-auth/react";

interface Catalog {
  items: { id: string; name: string; emoji: string; category: string; price: number }[];
  pets: { id: string; name: string; emoji: string; tier: string }[];
  crops: { id: string; name: string; emoji: string; tier: string }[];
  fertilizers: { id: string; name: string; emoji: string }[];
  decorations: { id: string; name: string; emoji: string }[];
  rods: { id: string; name: string; tier: number }[];
  baits: { id: string; name: string; price: number }[];
  locations: { id: string; name: string }[];
  achievements: { id: string; name: string; emoji: string; category: string }[];
}

export default function AdminPage() {
  const { selectedGuild } = useGuild();
  const { data: session } = useSession();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("balance");
  const [catalog, setCatalog] = useState<Catalog | null>(null);

  useEffect(() => { loadCatalog(); }, []);

  // OWNER-ONLY PROTECTION: Block non-owners from accessing this page
  if (!(session?.user as any)?.isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-dark-800 border border-red-500/30 rounded-xl p-8 text-center max-w-md">
          <Lock size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-sm text-gray-400">Halaman ini hanya bisa diakses oleh <strong className="text-red-400">Bot Owner</strong>. Admin server tidak memiliki akses ke panel ini karena bot bersifat global.</p>
        </div>
      </div>
    );
  }

  async function loadCatalog() {
    try {
      const res = await fetch("/api/bot/admin/catalog");
      const data = await res.json();
      if (!data.error) setCatalog(data);
    } catch (e) {}
  }

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
    { id: "level", label: "Level", icon: BarChart3 },
    { id: "items", label: "Items", icon: Package },
    { id: "pets", label: "Pets", icon: PawPrint },
    { id: "fishing", label: "Fishing", icon: Fish },
    { id: "farming", label: "Farming", icon: Sprout },
    { id: "streak", label: "Streak", icon: Flame },
    { id: "stats", label: "Stats", icon: Zap },
    { id: "achievements", label: "Achievements", icon: Trophy },
    { id: "reset", label: "Reset", icon: RotateCcw },
    { id: "query", label: "Query", icon: Database },
  ];

  if (!selectedGuild) return <div className={styles.card}><p className="text-gray-400">Select a server from the sidebar.</p></div>;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Shield className="text-accent-primary" /> Admin Panel
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Kontrol penuh terhadap bot database</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setResult(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-accent-primary text-white"
                  : "bg-dark-700 text-gray-400 hover:text-white hover:bg-dark-600"
              }`}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
        {activeTab === "balance" && <BalanceForm onSubmit={adminAction} loading={loading} />}
        {activeTab === "level" && <LevelForm onSubmit={adminAction} loading={loading} />}
        {activeTab === "items" && <ItemsForm onSubmit={adminAction} loading={loading} catalog={catalog} />}
        {activeTab === "pets" && <PetsForm onSubmit={adminAction} loading={loading} catalog={catalog} />}
        {activeTab === "fishing" && <FishingForm onSubmit={adminAction} loading={loading} catalog={catalog} />}
        {activeTab === "farming" && <FarmingForm onSubmit={adminAction} loading={loading} catalog={catalog} />}
        {activeTab === "streak" && <StreakForm onSubmit={adminAction} loading={loading} />}
        {activeTab === "stats" && <StatsForm onSubmit={adminAction} loading={loading} />}
        {activeTab === "achievements" && <AchievementsForm onSubmit={adminAction} loading={loading} catalog={catalog} />}
        {activeTab === "reset" && <ResetForm onSubmit={adminAction} loading={loading} />}
        {activeTab === "query" && <QueryForm onSubmit={adminAction} loading={loading} />}
      </div>

      {/* Result */}
      {result && (
        <div className={`bg-dark-800 border rounded-xl p-4 ${result.error ? "border-red-500/30" : "border-green-500/30"}`}>
          <p className="text-sm font-medium mb-2">{result.error ? "❌ Error" : "✅ Success"}</p>
          <pre className="text-xs text-gray-300 bg-dark-900 p-3 rounded-lg overflow-auto max-h-48 font-mono">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// ===== BALANCE =====
function BalanceForm({ onSubmit, loading }: { onSubmit: any; loading: boolean }) {
  const [userId, setUserId] = useState("");
  const [action, setAction] = useState("add");
  const [amount, setAmount] = useState("");
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-white flex items-center gap-2"><Coins size={18} className="text-yellow-400" /> Manage Balance</h3>
      <MemberSelector value={userId} onChange={setUserId} placeholder="Select a member" />
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-[11px] text-gray-500 block mb-1">Action</label><select className={styles.inputDark} value={action} onChange={(e) => setAction(e.target.value)}><option value="add">Add</option><option value="remove">Remove</option><option value="set">Set</option></select></div>
        <div><label className="text-[11px] text-gray-500 block mb-1">Amount</label><input className={styles.inputDark} type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
      </div>
      <button className={styles.btnPrimary} disabled={loading || !userId} onClick={() => onSubmit("balance", { userId, action, amount: parseInt(amount) })}>{loading ? "Processing..." : "Execute"}</button>
    </div>
  );
}

// ===== LEVEL =====
function LevelForm({ onSubmit, loading }: { onSubmit: any; loading: boolean }) {
  const [userId, setUserId] = useState("");
  const [level, setLevel] = useState("");
  const [xp, setXp] = useState("");
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-white flex items-center gap-2"><BarChart3 size={18} className="text-blue-400" /> Set Level & XP</h3>
      <MemberSelector value={userId} onChange={setUserId} placeholder="Select a member" />
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-[11px] text-gray-500 block mb-1">Level</label><input className={styles.inputDark} type="number" placeholder="New Level" value={level} onChange={(e) => setLevel(e.target.value)} /></div>
        <div><label className="text-[11px] text-gray-500 block mb-1">XP (optional)</label><input className={styles.inputDark} type="number" placeholder="XP value" value={xp} onChange={(e) => setXp(e.target.value)} /></div>
      </div>
      <div className="flex gap-2">
        <button className={styles.btnPrimary} disabled={loading || !userId || !level} onClick={() => onSubmit("level", { userId, level: parseInt(level) })}>{loading ? "..." : "Set Level"}</button>
        {xp && <button className={styles.btnPrimary} disabled={loading || !userId} onClick={() => onSubmit("xp", { userId, xp: parseInt(xp) })}>{loading ? "..." : "Set XP"}</button>}
      </div>
    </div>
  );
}

// ===== ITEMS =====
function ItemsForm({ onSubmit, loading, catalog }: { onSubmit: any; loading: boolean; catalog: Catalog | null }) {
  const [userId, setUserId] = useState("");
  const [itemId, setItemId] = useState("");
  const [action, setAction] = useState("give");
  const [qty, setQty] = useState("1");
  const [filter, setFilter] = useState("");
  const items = catalog?.items || [];
  const filtered = items.filter(i => !filter || i.name.toLowerCase().includes(filter.toLowerCase()) || i.category.toLowerCase().includes(filter.toLowerCase()));
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-white flex items-center gap-2"><Package size={18} className="text-green-400" /> Give/Remove Items</h3>
      <MemberSelector value={userId} onChange={setUserId} placeholder="Select a member" />
      <div>
        <label className="text-[11px] text-gray-500 block mb-1">Search Item</label>
        <input className={styles.inputDark} placeholder="Filter by name or category..." value={filter} onChange={e => setFilter(e.target.value)} />
      </div>
      <div className="max-h-40 overflow-auto border border-dark-600 rounded-lg divide-y divide-dark-600/50">
        {filtered.map(item => (
          <button key={item.id} onClick={() => setItemId(item.id)} className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-dark-700 transition-colors ${itemId === item.id ? "bg-accent-primary/10 border-l-2 border-accent-primary" : ""}`}>
            <span className="text-sm text-white">{item.emoji} {item.name}</span>
            <span className="text-[10px] text-gray-500">{item.category} | {item.price > 0 ? `${item.price.toLocaleString()}` : 'Special'}</span>
          </button>
        ))}
        {filtered.length === 0 && <p className="text-xs text-gray-500 p-3 text-center">No items found</p>}
      </div>
      {itemId && <p className="text-xs text-accent-primary">Selected: <strong>{items.find(i => i.id === itemId)?.name}</strong></p>}
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-[11px] text-gray-500 block mb-1">Action</label><select className={styles.inputDark} value={action} onChange={(e) => setAction(e.target.value)}><option value="give">Give</option><option value="remove">Remove</option></select></div>
        <div><label className="text-[11px] text-gray-500 block mb-1">Quantity</label><input className={styles.inputDark} type="number" value={qty} onChange={(e) => setQty(e.target.value)} /></div>
      </div>
      <button className={styles.btnPrimary} disabled={loading || !userId || !itemId} onClick={() => onSubmit("items", { userId, itemId, action, quantity: parseInt(qty) })}>{loading ? "Processing..." : "Execute"}</button>
    </div>
  );
}

// ===== PETS =====
function PetsForm({ onSubmit, loading, catalog }: { onSubmit: any; loading: boolean; catalog: Catalog | null }) {
  const [userId, setUserId] = useState("");
  const [subTab, setSubTab] = useState<"give" | "level" | "stats">("give");
  const [petId, setPetId] = useState("");
  const [petName, setPetName] = useState("");
  const [petLevel, setPetLevel] = useState("1");
  const [hp, setHp] = useState(""); const [atk, setAtk] = useState(""); const [def, setDef] = useState(""); const [spd, setSpd] = useState(""); const [crit, setCrit] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const pets = catalog?.pets || [];
  const filtered = pets.filter(p => !tierFilter || p.tier === tierFilter);
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-white flex items-center gap-2"><PawPrint size={18} className="text-pink-400" /> Pet Management</h3>
      <MemberSelector value={userId} onChange={setUserId} placeholder="Select a member" />
      <div className="flex gap-2">
        {(["give", "level", "stats"] as const).map(t => (
          <button key={t} onClick={() => setSubTab(t)} className={`px-3 py-1.5 rounded text-xs font-medium ${subTab === t ? "bg-pink-500/20 text-pink-400 border border-pink-500/30" : "bg-dark-700 text-gray-400"}`}>{t === "give" ? "🎁 Give Pet" : t === "level" ? "📈 Set Level" : "⚔️ Set Stats"}</button>
        ))}
      </div>

      {subTab === "give" && (<>
        <div className="flex gap-2">
          <select className={styles.inputDark} value={tierFilter} onChange={e => setTierFilter(e.target.value)}>
            <option value="">All Tiers</option>
            {["Common","Uncommon","Rare","Epic","Legendary","Mythic"].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="max-h-36 overflow-auto border border-dark-600 rounded-lg divide-y divide-dark-600/50">
          {filtered.map(pet => (
            <button key={pet.id} onClick={() => setPetId(pet.id)} className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-dark-700 ${petId === pet.id ? "bg-pink-500/10 border-l-2 border-pink-400" : ""}`}>
              <span className="text-sm text-white">{pet.emoji} {pet.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${pet.tier === 'Legendary' ? 'bg-yellow-500/20 text-yellow-400' : pet.tier === 'Mythic' ? 'bg-purple-500/20 text-purple-400' : pet.tier === 'Epic' ? 'bg-violet-500/20 text-violet-400' : pet.tier === 'Rare' ? 'bg-blue-500/20 text-blue-400' : 'bg-dark-600 text-gray-400'}`}>{pet.tier}</span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-[11px] text-gray-500 block mb-1">Name (optional)</label><input className={styles.inputDark} placeholder="Custom name" value={petName} onChange={e => setPetName(e.target.value)} /></div>
          <div><label className="text-[11px] text-gray-500 block mb-1">Level</label><input className={styles.inputDark} type="number" value={petLevel} onChange={e => setPetLevel(e.target.value)} /></div>
        </div>
        <button className={styles.btnPrimary} disabled={loading || !userId || !petId} onClick={() => onSubmit("pets/give", { userId, petId, name: petName || undefined, level: parseInt(petLevel) })}>{loading ? "..." : "Give Pet"}</button>
      </>)}

      {subTab === "level" && (<>
        <div><label className="text-[11px] text-gray-500 block mb-1">New Pet Level</label><input className={styles.inputDark} type="number" placeholder="Level" value={petLevel} onChange={e => setPetLevel(e.target.value)} /></div>
        <button className={styles.btnPrimary} disabled={loading || !userId} onClick={() => onSubmit("pets/setlevel", { userId, level: parseInt(petLevel) })}>{loading ? "..." : "Set Active Pet Level"}</button>
      </>)}

      {subTab === "stats" && (<>
        <p className="text-xs text-gray-500">Set stats for active pet (leave blank to skip)</p>
        <div className="grid grid-cols-5 gap-2">
          <div><label className="text-[10px] text-gray-500 block mb-1">HP</label><input className={styles.inputDark} type="number" placeholder="HP" value={hp} onChange={e => setHp(e.target.value)} /></div>
          <div><label className="text-[10px] text-gray-500 block mb-1">ATK</label><input className={styles.inputDark} type="number" placeholder="ATK" value={atk} onChange={e => setAtk(e.target.value)} /></div>
          <div><label className="text-[10px] text-gray-500 block mb-1">DEF</label><input className={styles.inputDark} type="number" placeholder="DEF" value={def} onChange={e => setDef(e.target.value)} /></div>
          <div><label className="text-[10px] text-gray-500 block mb-1">SPD</label><input className={styles.inputDark} type="number" placeholder="SPD" value={spd} onChange={e => setSpd(e.target.value)} /></div>
          <div><label className="text-[10px] text-gray-500 block mb-1">CRIT</label><input className={styles.inputDark} type="number" placeholder="CRIT" value={crit} onChange={e => setCrit(e.target.value)} /></div>
        </div>
        <button className={styles.btnPrimary} disabled={loading || !userId} onClick={() => onSubmit("pets/setstats", { userId, hp: hp || undefined, atk: atk || undefined, def: def || undefined, spd: spd || undefined, crit: crit || undefined })}>{loading ? "..." : "Set Stats"}</button>
      </>)}
    </div>
  );
}

// ===== FISHING =====
function FishingForm({ onSubmit, loading, catalog }: { onSubmit: any; loading: boolean; catalog: Catalog | null }) {
  const [userId, setUserId] = useState("");
  const [rod, setRod] = useState("");
  const [bait, setBait] = useState("");
  const [baitCount, setBaitCount] = useState("50");
  const [location, setLocation] = useState("");
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-white flex items-center gap-2"><Fish size={18} className="text-cyan-400" /> Fishing Equipment</h3>
      <MemberSelector value={userId} onChange={setUserId} placeholder="Select a member" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] text-gray-500 block mb-1">Rod</label>
          <select className={styles.inputDark} value={rod} onChange={e => setRod(e.target.value)}>
            <option value="">-- Don&apos;t change --</option>
            {(catalog?.rods || []).map(r => <option key={r.id} value={r.id}>{r.name} (T{r.tier})</option>)}
          </select>
        </div>
        <div>
          <label className="text-[11px] text-gray-500 block mb-1">Location</label>
          <select className={styles.inputDark} value={location} onChange={e => setLocation(e.target.value)}>
            <option value="">-- Don&apos;t change --</option>
            {(catalog?.locations || []).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[11px] text-gray-500 block mb-1">Bait</label>
          <select className={styles.inputDark} value={bait} onChange={e => setBait(e.target.value)}>
            <option value="">-- Don&apos;t change --</option>
            {(catalog?.baits || []).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[11px] text-gray-500 block mb-1">Bait Count</label>
          <input className={styles.inputDark} type="number" value={baitCount} onChange={e => setBaitCount(e.target.value)} />
        </div>
      </div>
      <button className={styles.btnPrimary} disabled={loading || !userId} onClick={() => onSubmit("fish/equipment", { userId, rod: rod || undefined, bait: bait || undefined, bait_count: bait ? parseInt(baitCount) : undefined, location: location || undefined })}>{loading ? "..." : "Update Equipment"}</button>
    </div>
  );
}

// ===== FARMING =====
function FarmingForm({ onSubmit, loading, catalog }: { onSubmit: any; loading: boolean; catalog: Catalog | null }) {
  const [userId, setUserId] = useState("");
  const [subTab, setSubTab] = useState<"level" | "seeds" | "fertilizer">("level");
  const [farmLevel, setFarmLevel] = useState("1");
  const [seedId, setSeedId] = useState("");
  const [fertId, setFertId] = useState("");
  const [action, setAction] = useState("give");
  const [qty, setQty] = useState("10");
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-white flex items-center gap-2"><Sprout size={18} className="text-green-400" /> Farm Management</h3>
      <MemberSelector value={userId} onChange={setUserId} placeholder="Select a member" />
      <div className="flex gap-2">
        {(["level", "seeds", "fertilizer"] as const).map(t => (
          <button key={t} onClick={() => setSubTab(t)} className={`px-3 py-1.5 rounded text-xs font-medium ${subTab === t ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-dark-700 text-gray-400"}`}>{t === "level" ? "🏡 Farm Level" : t === "seeds" ? "🌱 Seeds" : "✨ Fertilizer"}</button>
        ))}
      </div>

      {subTab === "level" && (<>
        <div><label className="text-[11px] text-gray-500 block mb-1">Farm Level (1-6)</label>
          <select className={styles.inputDark} value={farmLevel} onChange={e => setFarmLevel(e.target.value)}>
            <option value="1">1 — 🌱 Pemula (3 slots)</option>
            <option value="2">2 — 🌿 Petani (5 slots)</option>
            <option value="3">3 — 🌳 Farmer Pro (8 slots)</option>
            <option value="4">4 — 🏡 Tuan Tanah (12 slots)</option>
            <option value="5">5 — 🏰 Juragan (16 slots)</option>
            <option value="6">6 — 👑 Raja Pertanian (20 slots)</option>
          </select>
        </div>
        <button className={styles.btnPrimary} disabled={loading || !userId} onClick={() => onSubmit("farm/level", { userId, farmLevel: parseInt(farmLevel) })}>{loading ? "..." : "Set Farm Level"}</button>
      </>)}

      {subTab === "seeds" && (<>
        <div>
          <label className="text-[11px] text-gray-500 block mb-1">Seed</label>
          <select className={styles.inputDark} value={seedId} onChange={e => setSeedId(e.target.value)}>
            <option value="">Select seed...</option>
            {(catalog?.crops || []).map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name} ({c.tier})</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-[11px] text-gray-500 block mb-1">Action</label><select className={styles.inputDark} value={action} onChange={e => setAction(e.target.value)}><option value="give">Give</option><option value="remove">Remove</option></select></div>
          <div><label className="text-[11px] text-gray-500 block mb-1">Quantity</label><input className={styles.inputDark} type="number" value={qty} onChange={e => setQty(e.target.value)} /></div>
        </div>
        <button className={styles.btnPrimary} disabled={loading || !userId || !seedId} onClick={() => onSubmit("farm/seeds", { userId, seedId, action, quantity: parseInt(qty) })}>{loading ? "..." : "Execute"}</button>
      </>)}

      {subTab === "fertilizer" && (<>
        <div>
          <label className="text-[11px] text-gray-500 block mb-1">Fertilizer</label>
          <select className={styles.inputDark} value={fertId} onChange={e => setFertId(e.target.value)}>
            <option value="">Select fertilizer...</option>
            {(catalog?.fertilizers || []).filter(f => f.id !== 'none').map(f => <option key={f.id} value={f.id}>{f.emoji} {f.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-[11px] text-gray-500 block mb-1">Action</label><select className={styles.inputDark} value={action} onChange={e => setAction(e.target.value)}><option value="give">Give</option><option value="remove">Remove</option></select></div>
          <div><label className="text-[11px] text-gray-500 block mb-1">Quantity</label><input className={styles.inputDark} type="number" value={qty} onChange={e => setQty(e.target.value)} /></div>
        </div>
        <button className={styles.btnPrimary} disabled={loading || !userId || !fertId} onClick={() => onSubmit("farm/fertilizer", { userId, fertId, action, quantity: parseInt(qty) })}>{loading ? "..." : "Execute"}</button>
      </>)}
    </div>
  );
}

// ===== STREAK =====
function StreakForm({ onSubmit, loading }: { onSubmit: any; loading: boolean }) {
  const [userId, setUserId] = useState("");
  const [action, setAction] = useState("set");
  const [value, setValue] = useState("");
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-white flex items-center gap-2"><Flame size={18} className="text-orange-400" /> Streak Management</h3>
      <MemberSelector value={userId} onChange={setUserId} placeholder="Select a member" />
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-[11px] text-gray-500 block mb-1">Action</label><select className={styles.inputDark} value={action} onChange={e => setAction(e.target.value)}><option value="set">Set Streak</option><option value="reset">Reset to 0</option></select></div>
        {action === "set" && <div><label className="text-[11px] text-gray-500 block mb-1">Streak Days</label><input className={styles.inputDark} type="number" placeholder="e.g. 30" value={value} onChange={e => setValue(e.target.value)} /></div>}
      </div>
      <button className={action === "reset" ? styles.btnDanger : styles.btnPrimary} disabled={loading || !userId} onClick={() => onSubmit("streak", { userId, action, value: parseInt(value) || 0 })}>{loading ? "..." : action === "set" ? "Set Streak" : "Reset Streak"}</button>
    </div>
  );
}

// ===== STATS =====
function StatsForm({ onSubmit, loading }: { onSubmit: any; loading: boolean }) {
  const [userId, setUserId] = useState("");
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const commonStats = ["total_fish_caught","total_harvests","total_quests_done","total_voice_mins","total_earned","total_spent","coinflip_wins","slot_wins","slot_total_winnings","pvp_wins","dungeon_clears","boss_kills","sea_monster_encounters","giant_fish_defeated"];
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-white flex items-center gap-2"><Zap size={18} className="text-yellow-400" /> User Stats</h3>
      <MemberSelector value={userId} onChange={setUserId} placeholder="Select a member" />
      <div>
        <label className="text-[11px] text-gray-500 block mb-1">Stat Key</label>
        <select className={styles.inputDark} value={key} onChange={e => setKey(e.target.value)}>
          <option value="">Select or type below...</option>
          {commonStats.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input className={`${styles.inputDark} mt-2`} placeholder="Or type custom stat key" value={key} onChange={e => setKey(e.target.value)} />
      </div>
      <div><label className="text-[11px] text-gray-500 block mb-1">Value</label><input className={styles.inputDark} type="number" placeholder="New value" value={value} onChange={e => setValue(e.target.value)} /></div>
      <button className={styles.btnPrimary} disabled={loading || !userId || !key} onClick={() => onSubmit("stat", { userId, key, value: parseInt(value) })}>{loading ? "..." : "Set Stat"}</button>
    </div>
  );
}

// ===== ACHIEVEMENTS =====
function AchievementsForm({ onSubmit, loading, catalog }: { onSubmit: any; loading: boolean; catalog: Catalog | null }) {
  const [userId, setUserId] = useState("");
  const [achievementId, setAchievementId] = useState("");
  const [action, setAction] = useState("give");
  const [catFilter, setCatFilter] = useState("");
  const achievements = catalog?.achievements || [];
  const categories = [...new Set(achievements.map(a => a.category))];
  const filtered = achievements.filter(a => !catFilter || a.category === catFilter);
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-white flex items-center gap-2"><Trophy size={18} className="text-yellow-400" /> Achievements</h3>
      <MemberSelector value={userId} onChange={setUserId} placeholder="Select a member" />
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-[11px] text-gray-500 block mb-1">Category Filter</label>
          <select className={styles.inputDark} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="">All</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div><label className="text-[11px] text-gray-500 block mb-1">Action</label><select className={styles.inputDark} value={action} onChange={e => setAction(e.target.value)}><option value="give">Give</option><option value="remove">Remove</option></select></div>
      </div>
      <div className="max-h-36 overflow-auto border border-dark-600 rounded-lg divide-y divide-dark-600/50">
        {filtered.map(a => (
          <button key={a.id} onClick={() => setAchievementId(a.id)} className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-dark-700 ${achievementId === a.id ? "bg-yellow-500/10 border-l-2 border-yellow-400" : ""}`}>
            <span className="text-sm text-white">{a.emoji} {a.name}</span>
            <span className="text-[10px] text-gray-500">{a.category}</span>
          </button>
        ))}
        {filtered.length === 0 && <p className="text-xs text-gray-500 p-3 text-center">No achievements found</p>}
      </div>
      <button className={styles.btnPrimary} disabled={loading || !userId || !achievementId} onClick={() => onSubmit("achievement", { userId, achievementId, action })}>{loading ? "..." : `${action === "give" ? "Give" : "Remove"} Achievement`}</button>
    </div>
  );
}

// ===== RESET =====
function ResetForm({ onSubmit, loading }: { onSubmit: any; loading: boolean }) {
  const [userId, setUserId] = useState("");
  const [resetType, setResetType] = useState("balance");
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-white flex items-center gap-2"><RotateCcw size={18} className="text-red-400" /> Reset User Data</h3>
      <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">⚠️ Hati-hati! Aksi ini tidak bisa di-undo.</p>
      <MemberSelector value={userId} onChange={setUserId} placeholder="Select a member" />
      <select className={styles.inputDark} value={resetType} onChange={(e) => setResetType(e.target.value)}>
        <option value="balance">Reset Balance only</option>
        <option value="level">Reset Level & XP</option>
        <option value="fish">Reset Fish (inventory + collection + equipment)</option>
        <option value="pets">Reset All Pets</option>
        <option value="farm">Reset Farm (plots + storage + seeds)</option>
        <option value="all">⚠️ FULL RESET (hapus semua data user)</option>
      </select>
      <button className={styles.btnDanger} disabled={loading || !userId} onClick={() => onSubmit("reset-user", { userId, resetType })}>{loading ? "Processing..." : "Reset User"}</button>
    </div>
  );
}

// ===== QUERY =====
function QueryForm({ onSubmit, loading }: { onSubmit: any; loading: boolean }) {
  const [sql, setSql] = useState("");
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-white flex items-center gap-2"><Database size={18} className="text-purple-400" /> Raw SQL Query (SELECT only)</h3>
      <textarea className={`${styles.inputDark} h-28 font-mono text-xs`} placeholder="SELECT * FROM users ORDER BY balance DESC LIMIT 10" value={sql} onChange={(e) => setSql(e.target.value)} />
      <button className={styles.btnPrimary} disabled={loading || !sql.trim()} onClick={() => onSubmit("query", { sql })}>{loading ? "Executing..." : "Run Query"}</button>
    </div>
  );
}
