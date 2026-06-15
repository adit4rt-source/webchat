"use client";
import { useEffect, useState, useRef } from "react";
import { ChevronDown, X, Search, User } from "lucide-react";
import { useGuild } from "@/lib/GuildContext";

interface Member {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
}

interface MemberSelectorProps {
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
}

export default function MemberSelector({ value, onChange, placeholder = "Select member" }: MemberSelectorProps) {
  const { selectedGuild } = useGuild();
  const [members, setMembers] = useState<Member[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (selectedGuild) fetchMembers();
  }, [selectedGuild]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function fetchMembers(q?: string) {
    if (!selectedGuild) return;
    setLoading(true);
    try {
      const query = q ? `&search=${encodeURIComponent(q)}` : "";
      const res = await fetch(`/api/bot/guild/members?guildId=${selectedGuild.id}${query}`);
      const data = await res.json();
      if (data.members) setMembers(data.members);
    } catch (e) {}
    setLoading(false);
  }

  function handleSearch(q: string) {
    setSearch(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchMembers(q);
    }, 300);
  }

  const selectedMember = members.find(m => m.id === value);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-left flex items-center gap-2 hover:border-accent-primary/50 transition-colors focus:outline-none focus:border-accent-primary"
      >
        <div className="flex-1 flex items-center gap-2">
          {selectedMember ? (
            <>
              {selectedMember.avatar ? (
                <img src={selectedMember.avatar} alt="" className="w-5 h-5 rounded-full" />
              ) : (
                <User size={14} className="text-gray-500" />
              )}
              <span className="text-sm text-white">{selectedMember.displayName}</span>
              <span className="text-[10px] text-gray-500">@{selectedMember.username}</span>
            </>
          ) : (
            <span className="text-sm text-gray-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown size={14} className={`text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Clear */}
      {value && (
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
                placeholder="Search members..."
                value={search}
                onChange={e => handleSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-dark-700 border border-dark-500 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-accent-primary/50"
              />
            </div>
          </div>

          {/* Options */}
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="px-3 py-4 text-center text-xs text-gray-500">Loading...</div>
            ) : members.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-gray-500">{search ? "No results" : "Type to search members"}</div>
            ) : (
              <>
                <button
                  onClick={() => { onChange(""); setOpen(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-gray-500 hover:bg-dark-700 transition-colors"
                >
                  — None —
                </button>
                {members.map(m => {
                  const isSelected = m.id === value;
                  return (
                    <button
                      key={m.id}
                      onClick={() => { onChange(m.id); setOpen(false); setSearch(""); }}
                      className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-dark-700 transition-colors ${isSelected ? "bg-accent-primary/10" : ""}`}
                    >
                      {m.avatar ? (
                        <img src={m.avatar} alt="" className="w-5 h-5 rounded-full" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-dark-600 flex items-center justify-center text-[9px] text-gray-400">{m.username[0]?.toUpperCase()}</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-white truncate block">{m.displayName}</span>
                      </div>
                      <span className="text-[10px] text-gray-500 shrink-0">@{m.username}</span>
                      {isSelected && <span className="text-accent-primary text-xs">✓</span>}
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
