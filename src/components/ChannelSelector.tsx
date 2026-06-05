"use client";
import { useEffect, useState, useRef } from "react";
import { Hash, Volume2, FolderOpen, ChevronDown, X, Search, Megaphone, MessageSquare } from "lucide-react";
import { useGuild } from "@/lib/GuildContext";

interface Channel {
  id: string;
  name: string;
  type: number; // 0=text, 2=voice, 4=category, 5=announcement, 13=stage, 15=forum
  parentId: string | null;
  position: number;
}

interface ChannelSelectorProps {
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  filter?: "text" | "voice" | "category" | "all";
  multiple?: boolean;
  values?: string[];
  onChangeMultiple?: (ids: string[]) => void;
}

const CHANNEL_ICONS: Record<number, typeof Hash> = {
  0: Hash,
  2: Volume2,
  4: FolderOpen,
  5: Megaphone,
  13: Volume2,
  15: MessageSquare,
};

const TYPE_FILTER: Record<string, number[]> = {
  text: [0, 5, 15],
  voice: [2, 13],
  category: [4],
  all: [0, 2, 4, 5, 13, 15],
};

export default function ChannelSelector({ value, onChange, placeholder = "Select channel", filter = "text", multiple = false, values = [], onChangeMultiple }: ChannelSelectorProps) {
  const { selectedGuild } = useGuild();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedGuild) fetchChannels();
  }, [selectedGuild]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function fetchChannels() {
    if (!selectedGuild) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bot/guild/channels?guildId=${selectedGuild.id}`);
      const data = await res.json();
      if (data.channels) setChannels(data.channels);
    } catch (e) {}
    setLoading(false);
  }

  const allowedTypes = TYPE_FILTER[filter] || TYPE_FILTER.all;
  const filtered = channels
    .filter(ch => allowedTypes.includes(ch.type))
    .filter(ch => ch.name.toLowerCase().includes(search.toLowerCase()));

  const selectedChannel = channels.find(ch => ch.id === value);
  const selectedMultiple = multiple ? channels.filter(ch => values.includes(ch.id)) : [];

  function handleSelect(ch: Channel) {
    if (multiple && onChangeMultiple) {
      if (values.includes(ch.id)) {
        onChangeMultiple(values.filter(v => v !== ch.id));
      } else {
        onChangeMultiple([...values, ch.id]);
      }
    } else {
      onChange(ch.id);
      setOpen(false);
    }
    setSearch("");
  }

  function removeMultiple(id: string) {
    if (onChangeMultiple) onChangeMultiple(values.filter(v => v !== id));
  }

  function getIcon(type: number) {
    const Icon = CHANNEL_ICONS[type] || Hash;
    return <Icon size={14} className="text-gray-500 shrink-0" />;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-left flex items-center gap-2 hover:border-accent-primary/50 transition-colors focus:outline-none focus:border-accent-primary"
      >
        {multiple ? (
          <div className="flex-1 flex flex-wrap gap-1 min-h-[20px]">
            {selectedMultiple.length === 0 && <span className="text-gray-500 text-sm">{placeholder}</span>}
            {selectedMultiple.map(ch => (
              <span key={ch.id} className="flex items-center gap-1 px-2 py-0.5 bg-dark-600 rounded text-xs text-gray-300">
                {getIcon(ch.type)} {ch.name}
                <button onClick={(e) => { e.stopPropagation(); removeMultiple(ch.id); }} className="text-gray-500 hover:text-red-400"><X size={10} /></button>
              </span>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center gap-2">
            {selectedChannel ? (
              <>
                {getIcon(selectedChannel.type)}
                <span className="text-sm text-white">{selectedChannel.name}</span>
              </>
            ) : (
              <span className="text-sm text-gray-500">{placeholder}</span>
            )}
          </div>
        )}
        <ChevronDown size={14} className={`text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Clear button for single select */}
      {!multiple && value && (
        <button
          onClick={(e) => { e.stopPropagation(); onChange(""); }}
          className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-400 transition-colors"
        >
          <X size={12} />
        </button>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-dark-800 border border-dark-500 rounded-lg shadow-xl overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-dark-600">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-dark-700 border border-dark-500 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-accent-primary/50"
              />
            </div>
          </div>

          {/* Options */}
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="px-3 py-4 text-center text-xs text-gray-500">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-gray-500">No channels found</div>
            ) : (
              <>
                {!multiple && (
                  <button
                    onClick={() => { onChange(""); setOpen(false); }}
                    className="w-full px-3 py-2 text-left text-xs text-gray-500 hover:bg-dark-700 transition-colors"
                  >
                    — None —
                  </button>
                )}
                {filtered.map(ch => {
                  const isSelected = multiple ? values.includes(ch.id) : ch.id === value;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => handleSelect(ch)}
                      className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-dark-700 transition-colors ${isSelected ? "bg-accent-primary/10" : ""}`}
                    >
                      {getIcon(ch.type)}
                      <span className="text-sm text-white truncate">{ch.name}</span>
                      {isSelected && <span className="ml-auto text-accent-primary text-xs">✓</span>}
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
