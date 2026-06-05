"use client";
import { useState } from "react";
import { Search, User } from "lucide-react";

export default function UsersPage() {
  const [searchId, setSearchId] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function searchUser() {
    if (!searchId.trim()) return;
    setLoading(true);
    setError("");
    setUserData(null);
    try {
      const res = await fetch(`/api/bot/users/${searchId.trim()}`);
      const data = await res.json();
      if (data.error) setError(data.error);
      else setUserData(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <User className="text-accent-primary" /> User Lookup
        </h1>
        <p className="text-gray-400 mt-1">Cari player berdasarkan Discord User ID</p>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <input
          className="input-dark flex-1"
          placeholder="Discord User ID (e.g. 1051116479912882316)"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchUser()}
        />
        <button className="btn-primary flex items-center gap-2" onClick={searchUser} disabled={loading}>
          <Search size={16} /> {loading ? "..." : "Search"}
        </button>
      </div>

      {error && <div className="card border-accent-danger/30"><p className="text-red-400">{error}</p></div>}

      {/* User Data */}
      {userData && (
        <div className="space-y-4">
          {/* Profile Card */}
          <div className="card">
            <h3 className="font-semibold text-white text-lg mb-4">👤 Player Profile</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-dark-700 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Level</p>
                <p className="text-xl font-bold text-accent-primary">{userData.user.level}</p>
              </div>
              <div className="bg-dark-700 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Balance</p>
                <p className="text-xl font-bold text-yellow-400">🪙 {userData.user.balance?.toLocaleString("id-ID")}</p>
              </div>
              <div className="bg-dark-700 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">XP</p>
                <p className="text-xl font-bold text-blue-400">{userData.user.xp?.toLocaleString("id-ID")}</p>
              </div>
              <div className="bg-dark-700 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Badges</p>
                <p className="text-xl font-bold text-purple-400">{userData.achievements}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="card">
            <h3 className="font-semibold text-white mb-3">📊 Stats</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">🎣 Fish Caught</span>
                <span className="text-white">{userData.stats.fishCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">🌾 Harvests</span>
                <span className="text-white">{userData.stats.farmCount}</span>
              </div>
            </div>
          </div>

          {/* Pets */}
          {userData.pets.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-white mb-3">🐾 Pets ({userData.pets.length})</h3>
              <div className="space-y-2">
                {userData.pets.map((pet: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-dark-700 rounded-lg p-3">
                    <div>
                      <span className="text-white font-medium">{pet.name}</span>
                      <span className="text-xs text-gray-500 ml-2">{pet.class} / {pet.element}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-accent-primary">Lv.{pet.level}</span>
                      {pet.active ? <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Active</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
