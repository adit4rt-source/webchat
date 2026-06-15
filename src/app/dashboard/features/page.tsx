"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search, Fish, Sprout, PawPrint, Gamepad2, Trophy, Coins, Swords, Skull,
  Gift, BookOpen, TrendingUp, Globe, BarChart3, Flame, UserPlus, Zap, Bell,
  Clock, Shield, Wrench, MessageSquare, Mic, Users, Bot, Hash, Server,
  Settings, Activity,
} from "lucide-react";
import { styles } from "@/lib/styles";

type LucideIcon = typeof Fish;

interface Feature {
  name: string;
  desc: string;
  icon: LucideIcon;
  /** Dashboard page to configure this feature, if one exists */
  href?: string;
  /** Discord commands / where it's used */
  usage?: string;
}

interface Category {
  title: string;
  icon: LucideIcon;
  color: string; // text color class
  features: Feature[];
}

// Catalog of ALL bot features, enumerated from the bot's systems/ directory.
// Features with `href` can be configured here on the dashboard; the rest are
// available in Discord and listed here for visibility.
const CATEGORIES: Category[] = [
  {
    title: "Economy & Games",
    icon: Coins,
    color: "text-yellow-400",
    features: [
      { name: "Fishing", desc: "Catch fish, combos, giant fish & rare collections.", icon: Fish, href: "/dashboard/fishing", usage: "/fish" },
      { name: "Farming", desc: "Plant, harvest, mutations, seasons, weather & auto-harvest.", icon: Sprout, href: "/dashboard/farming", usage: "/farm" },
      { name: "Livestock", desc: "Raise and manage farm animals for products.", icon: PawPrint, usage: "/livestock" },
      { name: "Pets & Battle", desc: "Collect pets, abilities, fusion and awakening.", icon: PawPrint, href: "/dashboard/pets", usage: "/pet" },
      { name: "Arena (PvP)", desc: "Player-vs-player battles with rankings.", icon: Swords, usage: "/arena" },
      { name: "World Boss", desc: "Server-wide co-op boss fights with shared loot.", icon: Skull, usage: "/worldboss" },
      { name: "Dungeon Co-op", desc: "Team up to clear multi-stage dungeons.", icon: Swords, usage: "/dungeon" },
      { name: "Expedition", desc: "Send teams on timed expeditions for rewards.", icon: Globe, usage: "/expedition" },
      { name: "Casino", desc: "Blackjack, slots, roulette, RPS & horse racing.", icon: Gamepad2, href: "/dashboard/casino", usage: "/casino" },
      { name: "Lottery & Togel", desc: "Number lottery draws with promo events.", icon: Gift, usage: "/lottery" },
      { name: "Auction House", desc: "Bid on rare items posted by other players.", icon: Coins, usage: "/auction" },
      { name: "Global Market & Trade", desc: "Cross-server marketplace and player trading.", icon: TrendingUp, usage: "/market /trade" },
      { name: "Daily Reward", desc: "Claimable daily coins and bonus rewards.", icon: Gift, usage: "/daily" },
      { name: "Quests", desc: "Daily and weekly quests with milestone rewards.", icon: BookOpen, usage: "/quest" },
      { name: "Achievements", desc: "Unlockable achievements across all systems.", icon: Trophy, usage: "/achievements" },
      { name: "Titles", desc: "Earnable and equippable profile titles.", icon: Trophy, usage: "/titles" },
      { name: "Leaderboard", desc: "Top players by money, level, fish, farm & more.", icon: Trophy, href: "/dashboard/leaderboard", usage: "/leaderboard" },
    ],
  },
  {
    title: "Leveling & Engagement",
    icon: BarChart3,
    color: "text-blue-400",
    features: [
      { name: "Leveling / XP", desc: "Text & voice XP, level roles and rank cards.", icon: BarChart3, href: "/dashboard/leveling", usage: "/rank /level" },
      { name: "Daily Streak", desc: "Reward consecutive daily activity streaks.", icon: Flame, href: "/dashboard/streak", usage: "/streak" },
      { name: "Combo", desc: "Activity combo multipliers for bonus rewards.", icon: Zap, usage: "auto" },
      { name: "Giveaways", desc: "Host timed giveaways with entry requirements.", icon: Gift, usage: "/giveaway" },
      { name: "Contests", desc: "Run community contests with leaderboards.", icon: Trophy, usage: "/contest" },
      { name: "Invite Tracker", desc: "Track invites and reward top inviters.", icon: UserPlus, href: "/dashboard/invite", usage: "/invites" },
      { name: "Starboard", desc: "Highlight top-reacted messages on a board.", icon: Trophy, usage: "react ⭐" },
      { name: "Calendar / Events", desc: "Schedule and announce server events.", icon: Clock, usage: "/calendar" },
      { name: "Reminders", desc: "Personal and server reminders.", icon: Bell, usage: "/remind" },
    ],
  },
  {
    title: "Moderation & Security",
    icon: Shield,
    color: "text-red-400",
    features: [
      { name: "AutoMod", desc: "Filter spam, banned words, links & raids.", icon: Shield, href: "/dashboard/automod", usage: "auto" },
      { name: "Captcha Verification", desc: "Verify new members before granting access.", icon: Shield, usage: "on join" },
      { name: "Guild Logs", desc: "Audit log of joins, edits, deletes & moderation.", icon: BookOpen, usage: "auto" },
      { name: "Maintenance Mode", desc: "Temporarily disable commands during updates.", icon: Wrench, usage: "admin" },
      { name: "Consent Gate", desc: "Require user consent before data collection.", icon: Shield, usage: "on first use" },
    ],
  },
  {
    title: "Community & Social",
    icon: Users,
    color: "text-purple-400",
    features: [
      { name: "Welcomer", desc: "Custom welcome cards & goodbye messages.", icon: MessageSquare, href: "/dashboard/welcomer", usage: "on join" },
      { name: "Self Roles", desc: "Reaction / button roles members assign themselves.", icon: Users, usage: "panel" },
      { name: "Temp Voice", desc: "On-demand temporary voice channels.", icon: Mic, href: "/dashboard/tempvoice", usage: "join hub" },
      { name: "Social Interactions", desc: "Hug, pat and other social commands.", icon: MessageSquare, usage: "/hug etc." },
      { name: "Love / Marriage", desc: "Relationship and marriage system.", icon: Activity, usage: "/marry" },
      { name: "AFK", desc: "Set AFK status with auto-reply on mention.", icon: Clock, usage: "/afk" },
      { name: "Tickets", desc: "Support ticket system with transcripts.", icon: MessageSquare, usage: "panel" },
      { name: "TikTok Notifications", desc: "Announce new TikTok posts in a channel.", icon: Bell, usage: "auto" },
    ],
  },
  {
    title: "Utility & Tools",
    icon: Wrench,
    color: "text-green-400",
    features: [
      { name: "AI Assistant", desc: "In-chat AI helper for members & admins.", icon: Bot, usage: "/ask" },
      { name: "QR Code Generator", desc: "Generate branded QR codes on demand.", icon: Hash, usage: "/qr" },
      { name: "Profile Cards", desc: "Rich profile cards with stats & badges.", icon: Users, usage: "/profile" },
      { name: "Notifications", desc: "System notifications & broadcast messages.", icon: Bell, usage: "auto" },
      { name: "Onboarding", desc: "Guided first-time setup for new members.", icon: BookOpen, usage: "on join" },
      { name: "Guide", desc: "In-Discord help & feature guide panels.", icon: BookOpen, usage: "/guide" },
      { name: "Auto Backup", desc: "Scheduled database backups & restore.", icon: Server, usage: "scheduled" },
    ],
  },
  {
    title: "Admin & Dashboard",
    icon: Settings,
    color: "text-orange-400",
    features: [
      { name: "Admin Panel", desc: "Edit balances, levels, items, pets & more.", icon: Shield, href: "/dashboard/admin", usage: "dashboard" },
      { name: "Server Stats", desc: "Live bot & server statistics overview.", icon: BarChart3, href: "/dashboard/stats", usage: "dashboard" },
      { name: "User Lookup", desc: "Search and inspect any player by ID.", icon: Users, href: "/dashboard/users", usage: "dashboard" },
      { name: "General Settings", desc: "Core bot configuration & language.", icon: Settings, href: "/dashboard/general", usage: "dashboard" },
      { name: "Tools", desc: "Maintenance utilities & data reset.", icon: Wrench, href: "/dashboard/tools", usage: "dashboard" },
    ],
  },
];

const TOTAL_FEATURES = CATEGORIES.reduce((sum, c) => sum + c.features.length, 0);
const CONFIGURABLE = CATEGORIES.reduce(
  (sum, c) => sum + c.features.filter((f) => f.href).length,
  0
);

interface BotStats {
  version?: string;
  error?: string;
}

export default function FeaturesPage() {
  const [query, setQuery] = useState("");
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/bot/stats")
      .then((r) => r.json())
      .then((data: BotStats) => {
        if (!data.error && data.version) setVersion(data.version);
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.map((cat) => ({
      ...cat,
      features: cat.features.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.desc.toLowerCase().includes(q) ||
          cat.title.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.features.length > 0);
  }, [query]);

  const matchCount = filtered.reduce((sum, c) => sum + c.features.length, 0);

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Features</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Every system available in the bot{version ? ` · v${version}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-accent-primary/10 border border-accent-primary/20 rounded-full text-xs text-accent-primary font-medium">
            {TOTAL_FEATURES} features
          </span>
          <span className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-xs text-green-400 font-medium">
            {CONFIGURABLE} configurable here
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search features..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`${styles.inputDark} pl-9`}
        />
      </div>

      {query && (
        <p className="text-xs text-gray-500 -mt-2">
          {matchCount} feature{matchCount !== 1 ? "s" : ""} match &ldquo;{query}&rdquo;
        </p>
      )}

      {/* Categories */}
      {filtered.length === 0 ? (
        <div className={`${styles.card} text-center py-12`}>
          <p className="text-gray-400">No features match your search.</p>
        </div>
      ) : (
        filtered.map((cat) => {
          const CatIcon = cat.icon;
          return (
            <section key={cat.title}>
              <div className="flex items-center gap-2 mb-3">
                <CatIcon size={16} className={cat.color} />
                <h2 className="text-sm font-medium text-gray-300 uppercase tracking-wider">
                  {cat.title}
                </h2>
                <span className="text-xs text-gray-600">({cat.features.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {cat.features.map((f) => (
                  <FeatureCard key={f.name} feature={f} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  const configurable = Boolean(feature.href);

  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="w-9 h-9 rounded-lg bg-accent-primary/10 flex items-center justify-center shrink-0">
          <Icon size={18} className="text-accent-primary" />
        </div>
        {configurable ? (
          <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
            Configurable
          </span>
        ) : (
          <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-dark-600 text-gray-400 border border-dark-500">
            In Discord
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-sm font-semibold text-white">
          {feature.name}
        </p>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{feature.desc}</p>
      </div>
      {feature.usage && (
        <p className="mt-3 text-[10px] text-gray-600 font-mono">{feature.usage}</p>
      )}
    </>
  );

  const base =
    "group bg-dark-800 border border-dark-600 rounded-xl p-4 transition-all duration-200";

  if (configurable && feature.href) {
    return (
      <Link href={feature.href} className={`${base} hover:border-accent-primary/40 hover:bg-dark-700/50 block`}>
        {inner}
      </Link>
    );
  }
  return <div className={base}>{inner}</div>;
}
