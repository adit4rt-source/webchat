"use client";
import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

import { styles } from "@/lib/styles";
import UserCell from "@/components/UserCell";

const TYPES = [
  { id: "money", label: "💰 Money" },
  { id: "level", label: "📈 Level" },
  { id: "fish", label: "🎣 Fishing" },
  { id: "farm", label: "🌾 Farming" },
  { id: "achievement", label: "🏆 Achievement" },
  { id: "pet", label: "🐾 Pet" },
  { id: "mining", label: "⛏️ Mining" },
];

export default function LeaderboardPage() {
  const [type, setType] = useState("money");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/bot/leaderboard/${type}`)
      .then((r) => r.json())
      .then((d) => setData(d.leaderboard || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [type]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Trophy className="text-yellow-400" /> Leaderboard
        </h1>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => setType(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              type === t.id
                ? "bg-accent-primary text-white shadow-neon"
                : "bg-dark-700 text-gray-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className={`${styles.card} overflow-hidden`}>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-primary"></div>
          </div>
        ) : data.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No data available</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-600 text-gray-500 text-left">
                <th className="pb-3 pl-2">#</th>
                <th className="pb-3">User</th>
                <th className="pb-3 text-right pr-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row: any, i: number) => {
                const medal = ["🥇", "🥈", "🥉"][i] || `${i + 1}`;
                let value: string;
                if (type === "mining") {
                  if (row.totalDigs != null) {
                    value = `${Number(row.totalDigs).toLocaleString("id-ID")} digs`;
                  } else if (row.prestige != null && row.level != null) {
                    value = `P${row.prestige} Lv.${row.level}`;
                  } else {
                    value = "0";
                  }
                } else {
                  const numValue = row.balance || row.total || row.level || row.maxLevel || 0;
                  value = numValue.toLocaleString("id-ID");
                }
                const userInfo = row._user ? {
                  userId: row._user.userId || row.userId,
                  username: row._user.username,
                  displayName: row._user.displayName,
                  avatar: row._user.avatar,
                } : undefined;
                return (
                  <tr key={i} className="border-b border-dark-700/50 hover:bg-dark-700/30 transition-colors">
                    <td className="py-3 pl-2 text-lg">{medal}</td>
                    <td className="py-3">
                      <UserCell user={userInfo} userId={row.userId} />
                    </td>
                    <td className="py-3 text-right pr-2 font-bold text-white">{value}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
