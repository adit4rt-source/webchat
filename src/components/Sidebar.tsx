"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Home, Settings, Shield, LogOut, Trophy, Users, BarChart3,
  Fish, Sprout, PawPrint, Flame, UserPlus, MessageSquare,
  Mic, Gift, Wrench, BookOpen, Bot, Gamepad2, Search,
  ChevronDown, Globe
} from "lucide-react";
import { styles } from "@/lib/styles";
import GuildSelector from "@/components/GuildSelector";
import { useState } from "react";

interface SidebarProps {
  user: { id: string; username: string; avatar: string; isAdmin: boolean; image?: string };
}

const navSections = [
  {
    title: null, // No title for top section
    items: [
      { href: "/dashboard", label: "Overview", icon: Home },
      { href: "/dashboard/general", label: "General", icon: Settings },
    ]
  },
  {
    title: null,
    items: [
      { href: "/dashboard/automod", label: "Automod", icon: Shield },
      { href: "/dashboard/leveling", label: "Leveling", icon: BarChart3 },
      { href: "/dashboard/stats", label: "Server Stats", icon: BarChart3 },
    ]
  },
  {
    title: null,
    items: [
      { href: "/dashboard/fishing", label: "Fishing", icon: Fish },
      { href: "/dashboard/farming", label: "Farming", icon: Sprout },
      { href: "/dashboard/pets", label: "Pets", icon: PawPrint },
      { href: "/dashboard/casino", label: "Casino", icon: Gamepad2 },
    ]
  },
  {
    title: null,
    items: [
      { href: "/dashboard/streak", label: "Streak", icon: Flame },
      { href: "/dashboard/invite", label: "Invite", icon: UserPlus },
      { href: "/dashboard/welcomer", label: "Welcomer", icon: MessageSquare },
      { href: "/dashboard/tempvoice", label: "Tempvoice", icon: Mic },
    ]
  },
  {
    title: null,
    items: [
      { href: "/dashboard/leaderboard", label: "Leaderboard", icon: Trophy },
      { href: "/dashboard/users", label: "Users", icon: Users },
      { href: "/dashboard/admin", label: "Admin Panel", icon: Shield, adminOnly: true },
      { href: "/dashboard/tools", label: "Tools", icon: Wrench, adminOnly: true },
    ]
  },
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <aside className="w-64 bg-dark-800 border-r border-dark-600 flex flex-col min-h-screen sticky top-0 overflow-hidden">
      {/* Header — Bot Brand */}
      <div className="p-4 border-b border-dark-600">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center">
            <Bot size={20} className="text-accent-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-white text-sm truncate">idcommunity</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Dashboard</p>
          </div>
        </div>
      </div>

      {/* Guild Selector */}
      <GuildSelector />

      {/* Search */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-dark-700 border border-dark-500 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-accent-primary/50 transition-colors"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {navSections.map((section, sIdx) => {
          const filteredItems = section.items.filter(item => {
            if (item.adminOnly && !user.isAdmin) return false;
            if (searchQuery && !item.label.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            return true;
          });
          if (filteredItems.length === 0) return null;

          return (
            <div key={sIdx}>
              {section.title && (
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium px-3 mb-1">
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-150 ${
                        isActive
                          ? "bg-accent-primary/15 text-white font-medium border-l-2 border-accent-primary"
                          : "text-gray-400 hover:text-white hover:bg-dark-600/50"
                      }`}
                    >
                      <Icon size={16} className={isActive ? "text-accent-primary" : ""} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
              {sIdx < navSections.length - 1 && <div className="border-b border-dark-600/50 mt-3" />}
            </div>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-dark-600 bg-dark-800">
        <div className="flex items-center gap-2.5">
          {user.image ? (
            <img src={user.image} alt="" className="w-8 h-8 rounded-full ring-2 ring-dark-500" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-accent-secondary/20 border border-accent-secondary/30 flex items-center justify-center text-xs font-medium text-accent-secondary">
              {user.username?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{user.username || "User"}</p>
            <p className="text-[10px] text-gray-500">{user.isAdmin ? "👑 Admin" : "Member"}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-1.5 text-gray-500 hover:text-red-400 rounded-md hover:bg-dark-700 transition-colors"
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
