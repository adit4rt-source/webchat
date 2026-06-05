"use client";
import { useEffect, useState, useRef } from "react";
import { ChevronDown, X, Search, Shield } from "lucide-react";
import { useGuild } from "@/lib/GuildContext";

interface Role {
  id: string;
  name: string;
  color: string;
  position: number;
  managed: boolean;
  icon: string | null;
}

interface RoleSelectorProps {
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  multiple?: boolean;
  values?: string[];
  onChangeMultiple?: (ids: string[]) => void;
  excludeManaged?: boolean;
}

export default function RoleSelector({ value, onChange, placeholder = "Select role", multiple = false, values = [], onChangeMultiple, excludeManaged = true }: RoleSelectorProps) {
  const { selectedGuild } = useGuild();
  const [roles, setRoles] = useState<Role[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedGuild) fetchRoles();
  }, [selectedGuild]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function fetchRoles() {
    if (!selectedGuild) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bot/guild/roles?guildId=${selectedGuild.id}`);
      const data = await res.json();
      if (data.roles) setRoles(data.roles);
    } catch (e) {}
    setLoading(false);
  }

  const filtered = roles
    .filter(r => !excludeManaged || !r.managed)
    .filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  const selectedRole = roles.find(r => r.id === value);
  const selectedMultiple = multiple ? roles.filter(r => values.includes(r.id)) : [];

  function handleSelect(r: Role) {
    if (multiple && onChangeMultiple) {
      if (values.includes(r.id)) {
        onChangeMultiple(values.filter(v => v !== r.id));
      } else {
        onChangeMultiple([...values, r.id]);
      }
    } else {
      onChange(r.id);
      setOpen(false);
    }
    setSearch("");
  }

  function removeMultiple(id: string) {
    if (onChangeMultiple) onChangeMultiple(values.filter(v => v !== id));
  }

  function RoleDot({ color }: { color: string }) {
    return <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color === "#000000" ? "#99aab5" : color }} />;
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
            {selectedMultiple.map(r => (
              <span key={r.id} className="flex items-center gap-1 px-2 py-0.5 bg-dark-600 rounded text-xs text-gray-300">
                <RoleDot color={r.color} /> {r.name}
                <button onClick={(e) => { e.stopPropagation(); removeMultiple(r.id); }} className="text-gray-500 hover:text-red-400"><X size={10} /></button>
              </span>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center gap-2">
            {selectedRole ? (
              <>
                <RoleDot color={selectedRole.color} />
                <span className="text-sm text-white">{selectedRole.name}</span>
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
              <div className="px-3 py-4 text-center text-xs text-gray-500">No roles found</div>
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
                {filtered.map(r => {
                  const isSelected = multiple ? values.includes(r.id) : r.id === value;
                  return (
                    <button
                      key={r.id}
                      onClick={() => handleSelect(r)}
                      className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-dark-700 transition-colors ${isSelected ? "bg-accent-primary/10" : ""}`}
                    >
                      <RoleDot color={r.color} />
                      <span className="text-sm text-white truncate">{r.name}</span>
                      {r.managed && <Shield size={10} className="text-gray-600 ml-auto shrink-0" title="Bot role" />}
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
