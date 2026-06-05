"use client";
import { createContext, useContext, useEffect, useState } from "react";

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  memberCount: number;
}

interface GuildContextType {
  guilds: Guild[];
  selectedGuild: Guild | null;
  setSelectedGuild: (guild: Guild) => void;
  loading: boolean;
}

const GuildContext = createContext<GuildContextType>({ guilds: [], selectedGuild: null, setSelectedGuild: () => {}, loading: true });

export function GuildProvider({ children }: { children: React.ReactNode }) {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [selectedGuild, setSelectedGuild] = useState<Guild | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bot/guilds").then(r => r.json()).then(data => {
      if (data.guilds && data.guilds.length > 0) {
        setGuilds(data.guilds);
        // Restore from localStorage or pick first
        const saved = localStorage.getItem("selectedGuildId");
        const found = data.guilds.find((g: Guild) => g.id === saved);
        setSelectedGuild(found || data.guilds[0]);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  function selectGuild(guild: Guild) {
    setSelectedGuild(guild);
    localStorage.setItem("selectedGuildId", guild.id);
  }

  return (
    <GuildContext.Provider value={{ guilds, selectedGuild, setSelectedGuild: selectGuild, loading }}>
      {children}
    </GuildContext.Provider>
  );
}

export function useGuild() { return useContext(GuildContext); }
