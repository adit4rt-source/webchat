"use client";
import { useEffect, useMemo, useState } from "react";
import { PawPrint, Zap, TrendingUp, BarChart3 } from "lucide-react";
import { styles } from "@/lib/styles";

interface PetLite { id: string; name: string; emoji: string; tier: string; }
interface Evolution { from: PetLite; to: PetLite; level: number; name: string; }
interface SkillMilestone { level: number; skill: { type: string; value: number; name: string }; }
interface AwakeningTier {
  level: number; stars: string; name: string; title: string; color: string; statBoost: number;
  requirements: { petLevel: number; money: number; items: { id: string; qty: number }[] };
  reward: { desc: string };
}
interface FusionEntry { cost: number; successRate: number; resultTier: string; }
interface EvoData {
  tiers: string[];
  totalPets: number;
  pets: PetLite[];
  evolutions: Evolution[];
  skillMilestones: SkillMilestone[];
  awakeningTiers: AwakeningTier[];
  fusion: { fusableTiers: string[]; config: Record<string, FusionEntry> };
  error?: string;
}

const TIER_COLOR: Record<string, string> = {
  Common: "#9CA3AF", Uncommon: "#34D399", Rare: "#60A5FA", Epic: "#A78BFA",
  Legendary: "#FBBF24", Mythic: "#F472B6", Secret: "#F87171", God: "#FB923C",
};
function tierColor(t: string) { return TIER_COLOR[t] || "#9CA3AF"; }
function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n ?? 0);
}

type Tab = "evolution" | "fusion" | "awakening" | "skills";

export default function PetEvolutionPage() {
  const [data, setData] = useState<EvoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("evolution");

  useEffect(() => {
    fetch("/api/bot/pets/evolutions")
      .then((r) => r.json())
      .then((d) => { if (d.error) setError(d.error); else setData(d); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Build evolution chains: link from -> to, starting from roots (a `from` that is never a `to`).
  const chains = useMemo(() => {
    if (!data) return [] as { steps: PetLite[]; levels: number[] }[];
    const toIds = new Set(data.evolutions.map((e) => e.to.id));
    const byFrom = new Map<string, Evolution>();
    data.evolutions.forEach((e) => { if (!byFrom.has(e.from.id)) byFrom.set(e.from.id, e); });
    const roots = data.evolutions.filter((e) => !toIds.has(e.from.id));
    return roots.map((root) => {
      const steps: PetLite[] = [root.from];
      const levels: number[] = [];
      let cur: Evolution | undefined = root;
      const seen = new Set<string>();
      while (cur && !seen.has(cur.from.id)) {
        seen.add(cur.from.id);
        steps.push(cur.to);
        levels.push(cur.level);
        cur = byFrom.get(cur.to.id);
        if (steps.length > 12) break;
      }
      return { steps, levels };
    });
  }, [data]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-400 border-t-transparent" /></div>;
  if (error) return <div className={`${styles.card} border-red-500/20 bg-red-500/5`}><p className="text-red-400 font-medium">Failed to load pet data</p><p className="text-sm text-gray-400 mt-1">{error}</p></div>;
  if (!data) return null;

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "evolution", label: "Evolution Trees", icon: TrendingUp },
    { id: "fusion", label: "Fusion Ladder", icon: Zap },
    { id: "awakening", label: "Awakening", icon: PawPrint },
    { id: "skills", label: "Skill Milestones", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3"><PawPrint className="text-purple-400" /> Pet Evolution</h1>
        <p className="text-sm text-gray-500 mt-0.5">{data.totalPets} pets · {data.evolutions.length} evolution paths</p>
      </div>

      <div className="flex gap-2 border-b border-dark-600 overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${tab === t.id ? "border-purple-400 text-white" : "border-transparent text-gray-400 hover:text-white"}`}>
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Evolution chains */}
      {tab === "evolution" && (
        <div className="space-y-3">
          {chains.length === 0 && <div className={styles.card}><p className="text-gray-500 text-sm">No evolution paths defined.</p></div>}
          {chains.map((chain, ci) => (
            <div key={ci} className="bg-dark-800 border border-dark-600 rounded-xl p-4 overflow-x-auto">
              <div className="flex items-center gap-2 min-w-min">
                {chain.steps.map((p, i) => (
                  <div key={`${p.id}-${i}`} className="flex items-center gap-2 shrink-0">
                    <PetNode pet={p} />
                    {i < chain.steps.length - 1 && (
                      <div className="flex flex-col items-center px-1 shrink-0">
                        <span className="text-[10px] text-gray-500">Lv {chain.levels[i]}</span>
                        <span className="text-gray-600 text-lg leading-none">→</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fusion ladder */}
      {tab === "fusion" && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Fuse two pets of the same tier for a chance to get one of the next tier.</p>
          {data.fusion.fusableTiers.map((t) => {
            const c = data.fusion.config[t];
            if (!c) return null;
            return (
              <div key={t} className="flex items-center gap-3 bg-dark-800 border border-dark-600 rounded-xl p-3 flex-wrap">
                <TierBadge tier={t} />
                <span className="text-gray-600 text-lg">→</span>
                <TierBadge tier={c.resultTier} />
                <span className="ml-auto flex items-center gap-3 text-xs text-gray-400">
                  <span>🪙 {fmt(c.cost)}</span>
                  <span className={c.successRate >= 50 ? "text-green-400" : c.successRate >= 25 ? "text-yellow-400" : "text-red-400"}>{c.successRate}% success</span>
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Awakening */}
      {tab === "awakening" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.awakeningTiers.map((a) => (
            <div key={a.level} className="bg-dark-800 border border-dark-600 rounded-xl p-4" style={{ borderLeftColor: a.color, borderLeftWidth: 3 }}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">{a.name} <span style={{ color: a.color }}>{a.stars}</span></p>
                <span className="text-xs font-medium" style={{ color: a.color }}>+{Math.round((a.statBoost || 0) * 100)}% stats</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{a.reward?.desc}</p>
              <div className="flex flex-wrap gap-2 mt-2 text-[11px] text-gray-400">
                <span>Lv {a.requirements?.petLevel}</span>
                <span>🪙 {fmt(a.requirements?.money || 0)}</span>
                {a.requirements?.items?.map((it) => <span key={it.id}>{it.id} ×{it.qty}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skill milestones */}
      {tab === "skills" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {data.skillMilestones.map((m) => (
            <div key={m.level} className="bg-dark-800 border border-dark-600 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-purple-400">Lv {m.level}</p>
              <p className="text-sm text-white mt-1">{m.skill?.name}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{m.skill?.type}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PetNode({ pet }: { pet: PetLite }) {
  return (
    <div className="flex flex-col items-center gap-1 bg-dark-700/50 rounded-lg px-3 py-2 border border-dark-600 min-w-[76px]" style={{ borderTopColor: tierColor(pet.tier), borderTopWidth: 2 }}>
      <span className="text-2xl leading-none">{pet.emoji}</span>
      <span className="text-[11px] text-gray-200 text-center leading-tight">{pet.name}</span>
      <span className="text-[9px] uppercase tracking-wide" style={{ color: tierColor(pet.tier) }}>{pet.tier}</span>
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  return (
    <span className="px-2.5 py-1 rounded-lg text-xs font-medium border" style={{ color: tierColor(tier), borderColor: tierColor(tier) + "55", backgroundColor: tierColor(tier) + "14" }}>
      {tier}
    </span>
  );
}
