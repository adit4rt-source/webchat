"use client";
import { useState } from "react";
import { Plus, Trash2, Coins, UserCheck, Gift } from "lucide-react";
import { styles } from "@/lib/styles";
import RoleSelector from "@/components/RoleSelector";

export interface Reward {
  id: string;
  days: number;
  money: number;
  roleId: string;
  type: "money" | "role" | "both";
}

interface RewardEditorProps {
  rewards: Reward[];
  onChange: (rewards: Reward[]) => void;
  label?: string;
  placeholder?: string;
  milestoneLabel?: string;
}

export default function RewardEditor({ rewards, onChange, label = "days", placeholder = "7", milestoneLabel = "Days" }: RewardEditorProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newDays, setNewDays] = useState("");
  const [newMoney, setNewMoney] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newType, setNewType] = useState<"money" | "role" | "both">("money");

  function addReward() {
    if (!newDays) return;
    const reward: Reward = { id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, days: parseInt(newDays) || 0, money: parseInt(newMoney) || 0, roleId: newRole.trim(), type: newType };
    onChange([...rewards, reward].sort((a, b) => a.days - b.days));
    setNewDays(""); setNewMoney(""); setNewRole(""); setShowAdd(false);
  }

  function removeReward(id: string) { onChange(rewards.filter(r => r.id !== id)); }

  return (
    <div className="space-y-3">
      {rewards.length === 0 ? (
        <div className="bg-dark-700/50 border border-dark-600 rounded-xl p-8 text-center">
          <Gift size={32} className="text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No rewards yet. Add one using the button below.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rewards.map((reward) => (
            <div key={reward.id} className="bg-dark-700/50 border border-dark-600 rounded-lg p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 flex-wrap">
                <span className="px-3 py-1.5 bg-accent-primary/20 text-accent-primary text-sm font-bold rounded-lg">{reward.days} {label}</span>
                <div className="flex items-center gap-3 flex-wrap">
                  {(reward.type === "money" || reward.type === "both") && reward.money > 0 && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-md text-xs text-yellow-400"><Coins size={12} /> {reward.money.toLocaleString("id-ID")} money</span>
                  )}
                  {(reward.type === "role" || reward.type === "both") && reward.roleId && (
                    <RoleBadge roleId={reward.roleId} />
                  )}
                </div>
              </div>
              <button onClick={() => removeReward(reward.id)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      )}

      {showAdd ? (
        <div className="bg-dark-800 border border-accent-primary/30 rounded-xl p-5 space-y-4">
          <h4 className="text-sm font-medium text-white">Add New Reward</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div><label className="text-[11px] text-gray-500 block mb-1">{milestoneLabel}</label><input type="number" className={styles.inputDark} placeholder={placeholder} value={newDays} onChange={e => setNewDays(e.target.value)} /></div>
            <div><label className="text-[11px] text-gray-500 block mb-1">Reward Type</label><select className={styles.inputDark} value={newType} onChange={e => setNewType(e.target.value as any)}><option value="money">Money Only</option><option value="role">Role Only</option><option value="both">Both</option></select></div>
            {(newType === "money" || newType === "both") && (<div><label className="text-[11px] text-gray-500 block mb-1">Money Amount</label><input type="number" className={styles.inputDark} placeholder="1000" value={newMoney} onChange={e => setNewMoney(e.target.value)} /></div>)}
            {(newType === "role" || newType === "both") && (
              <div>
                <label className="text-[11px] text-gray-500 block mb-1">Role</label>
                <RoleSelector value={newRole} onChange={v => setNewRole(v)} placeholder="Select a role" />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={addReward} className={`${styles.btnPrimary} text-xs`}><Plus size={14} className="inline mr-1" /> Add Reward</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-xs text-gray-400 hover:text-white bg-dark-700 rounded-lg transition-colors">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} className="w-full py-3 border-2 border-dashed border-dark-500 rounded-xl text-sm text-gray-500 hover:text-accent-primary hover:border-accent-primary/30 transition-all flex items-center justify-center gap-2"><Plus size={16} /> Add Reward</button>
      )}
    </div>
  );
}

function RoleBadge({ roleId }: { roleId: string }) {
  return (
    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-md text-xs text-blue-400">
      <UserCheck size={12} /> Role: {roleId}
    </span>
  );
}
