"use client";
import { useGuild } from "@/lib/GuildContext";
import { ChevronDown, Server } from "lucide-react";
import { useState } from "react";

export default function GuildSelector() {
  const { guilds, selectedGuild, setSelectedGuild, loading } = useGuild();
  const [open, setOpen] = useState(false);

  if (loading) {
    return (
      <div className="px-3 py-2">
        <div className="h-10 bg-dark-700 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (guilds.length === 0) {
    return (
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-dark-700 rounded-lg text-xs text-gray-500">
          <Server size={14} /> No servers found
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-2 relative">
      {/* Selected Guild Button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg hover:border-accent-primary/30 transition-colors"
      >
        {selectedGuild?.icon ? (
          <img src={selectedGuild.icon} alt="" className="w-6 h-6 rounded-full" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-accent-primary/20 flex items-center justify-center">
            <Server size={12} className="text-accent-primary" />
          </div>
        )}
        <div className="flex-1 text-left min-w-0">
          <p className="text-xs font-medium text-white truncate">{selectedGuild?.name || "Select server"}</p>
          <p className="text-[10px] text-gray-500">{selectedGuild?.memberCount || 0} members</p>
        </div>
        <ChevronDown size={14} className={`text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-3 right-3 top-full mt-1 z-50 bg-dark-800 border border-dark-500 rounded-lg shadow-xl overflow-hidden max-h-60 overflow-y-auto">
          {guilds.map(guild => (
            <button
              key={guild.id}
              onClick={() => { setSelectedGuild(guild); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-dark-600 transition-colors text-left ${selectedGuild?.id === guild.id ? "bg-accent-primary/10 border-l-2 border-accent-primary" : ""}`}
            >
              {guild.icon ? (
                <img src={guild.icon} alt="" className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-dark-500 flex items-center justify-center text-[10px] text-gray-400">
                  {guild.name[0]}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">{guild.name}</p>
                <p className="text-[10px] text-gray-500">{guild.memberCount} members</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
