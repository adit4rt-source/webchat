"use client";
import { useEffect, useState } from "react";
import { BarChart3, Fish, Sprout, PawPrint, Gamepad2, Command, TrendingUp, Users, Coins, Trophy, Swords, Skull } from "lucide-react";
import { styles } from "@/lib/styles";
import { useGuild } from "@/lib/GuildContext";

interface StatsData {
  general: { users: number; guilds: number; uptime: number; version: string; globalMode: boolean; stats: { totalFishCaught: number; totalFarmHarvests: number; totalPets: number; totalAchievements: number; totalMoney: number; totalCommands: number } } | null;
  commands: { command: string; total: number }[];
  fishing: any;
  farming: any;
  pets: any;
  casino: any;
}

export default function StatsPage() {
  const { selectedGuild } = useGuild();
  const [data, setData] = useState<StatsData>({ general: null, commands: [], fishing: null, farming: null, pets: null, casino: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (selectedGuild) loadStats(); }, [selectedGuild]);

  function loadStats() {
    if (!selectedGuild) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/bot/stats?guildId=${selectedGuild.id}`).then(r => r.json()).catch(() => null),
      fetch(`/api/bot/stats/commands?guildId=${selectedGuild.id}`).then(r => r.json()).catch(() => ({ commands: [] })),
      fetch(`/api/bot/fishing?guildId=${selectedGuild.id}`).then(r => r.json()).catch(() => null),
      fetch(`/api/bot/farming?guildId=${selectedGuild.id}`).then(r => r.json()).catch(() => null),
      fetch(`/api/bot/pets?guildId=${selectedGuild.id}`).then(r => r.json()).catch(() => null),
      fetch(`/api/bot/casino?guildId=${selectedGuild.id}`).then(r => r.json()).catch(() => null),
    ]).then(([general, cmds, fishing, farming, pets, casino]) => {
      setData({ general, commands: cmds?.commands || [], fishing, farming, pets, casino });
    }).finally(() => setLoading(false));
  }

  if (!selectedGuild) return <div className={styles.card}><p className="text-gray-400">Select a server from the sidebar.</p></div>;
  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-primary border-t-transparent"></div></div>;

  const g = data.general;
  const f = data.fishing;
  const farm = data.farming;
  const p = data.pets;
  const c = data.casino;

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3"><BarChart3 className="text-accent-primary" /> Server Stats</h1>
        <p className="text-sm text-gray-500 mt-0.5">Complete statistics overview for all bot systems</p>
      </div>

      {/* Global Overview */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Global Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MiniStat icon={Users} label="Members" value={g?.users || 0} color="text-blue-400" />
          <MiniStat icon={Command} label="Commands" value={g?.stats?.totalCommands || 0} color="text-purple-400" />
          <MiniStat icon={Coins} label="Economy" value={g?.stats?.totalMoney || 0} color="text-yellow-400" format="money" />
          <MiniStat icon={Fish} label="Fish Caught" value={g?.stats?.totalFishCaught || 0} color="text-cyan-400" />
          <MiniStat icon={Sprout} label="Harvests" value={g?.stats?.totalFarmHarvests || 0} color="text-green-400" />
          <MiniStat icon={Trophy} label="Achievements" value={g?.stats?.totalAchievements || 0} color="text-orange-400" />
        </div>
      </div>

      {/* Fishing Stats */}
      {f && (
        <div>
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Fish size={14} className="text-cyan-400" /> Fishing</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Total Caught" value={f.totalCaught} />
            <StatCard label="Total Sold Value" value={f.totalSoldValue} format="money" />
            <StatCard label="Giant Fish Defeated" value={f.totalGiantDefeated} />
            <StatCard label="Monster Encounters" value={f.totalMonsterEncounters} />
          </div>
        </div>
      )}

      {/* Farming Stats */}
      {farm && (
        <div>
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Sprout size={14} className="text-green-400" /> Farming</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Total Harvests" value={farm.totalHarvests} />
            <StatCard label="Total Crafts" value={farm.totalCrafts} />
            <StatCard label="Mutations" value={farm.totalMutations} />
            <StatCard label="Active Plots" value={farm.activePlots} />
          </div>
        </div>
      )}

      {/* Pet Stats */}
      {p && (
        <div>
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><PawPrint size={14} className="text-purple-400" /> Pets & Battle</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <StatCard label="Total Pets" value={p.totalPets} />
            <StatCard label="Evolved" value={p.totalEvolved} />
            <StatCard label="Avg Level" value={p.avgLevel} />
            <StatCard label="Max Level" value={p.maxLevel} />
            <StatCard label="Dungeon Clears" value={p.dungeonClears} />
            <StatCard label="Boss Kills" value={p.bossKills} />
            <StatCard label="PvP Wins" value={p.pvpWins} />
          </div>
        </div>
      )}

      {/* Casino Stats */}
      {c && (
        <div>
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Gamepad2 size={14} className="text-yellow-400" /> Casino</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatCard label="Coinflip Wins" value={c.coinflipWins} />
            <StatCard label="Slot Wins" value={c.slotWins} />
            <StatCard label="Total Slot Winnings" value={c.slotTotalWinnings} format="money" />
          </div>
        </div>
      )}

      {/* Top Commands */}
      {data.commands.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Command size={14} className="text-purple-400" /> Top Commands</h2>
          <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 divide-y md:divide-y-0 md:divide-x divide-dark-600/50">
              {data.commands.slice(0, 12).map((cmd, i) => (
                <div key={cmd.command} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-4">{i + 1}.</span>
                    <span className="text-sm text-white font-mono">/{cmd.command}</span>
                  </div>
                  <span className="text-xs text-accent-primary font-bold">{cmd.total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, color, format }: { icon: any; label: string; value: number; color: string; format?: string }) {
  const display = format === "money" ? formatNumber(value) : value.toLocaleString();
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
      <div className="flex items-center gap-1.5 mb-1.5"><Icon size={14} className={color} /><span className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</span></div>
      <p className="text-lg font-bold text-white">{display}</p>
    </div>
  );
}

function StatCard({ label, value, format }: { label: string; value: number; format?: string }) {
  const display = format === "money" ? formatNumber(value) : (value || 0).toLocaleString();
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
      <p className="text-[11px] text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-white">{display}</p>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}
