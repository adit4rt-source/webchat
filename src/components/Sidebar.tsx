"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { BarChart3, Users, Settings, Shield, Fish, LogOut, Home, Trophy } from "lucide-react";

interface SidebarProps {
  user: { id: string; username: string; avatar: string; isAdmin: boolean; image?: string };
}

const navItems = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/admin", label: "Admin Panel", icon: Shield, adminOnly: true },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, adminOnly: true },
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-dark-800 border-r border-dark-600 flex flex-col min-h-screen sticky top-0">
      {/* Header */}
      <div className="p-6 border-b border-dark-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent-primary flex items-center justify-center text-xl">
            🤖
          </div>
          <div>
            <h1 className="font-bold text-white text-sm">idcommunity Bot</h1>
            <p className="text-xs text-gray-500">Dashboard v3.2.0</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          if (item.adminOnly && !user.isAdmin) return null;
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? "active" : ""}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-dark-600">
        <div className="flex items-center gap-3 mb-3">
          {user.image ? (
            <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-accent-secondary flex items-center justify-center text-xs">
              {user.username?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.username || "User"}</p>
            <p className="text-xs text-gray-500">{user.isAdmin ? "👑 Admin" : "👤 Member"}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-dark-700 rounded-lg transition-colors"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </aside>
  );
}
