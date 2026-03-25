import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Crown, Medal, Star, Flame, Award, Users, ChevronDown, Sparkles } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Rank decorations
const RANK_STYLES = {
  1: { bg: "from-yellow-400 to-amber-500", icon: "👑", label: "Champion", textColor: "text-yellow-900" },
  2: { bg: "from-slate-300 to-slate-400", icon: "🥈", label: "Runner-up", textColor: "text-slate-800" },
  3: { bg: "from-orange-400 to-amber-600", icon: "🥉", label: "Third Place", textColor: "text-orange-900" },
};

const AGE_CATEGORIES = [
  { id: "age_5_6", label: "Ages 5-6", emoji: "🌱" },
  { id: "age_7", label: "Age 7", emoji: "🌿" },
  { id: "age_8", label: "Age 8", emoji: "🌳" },
  { id: "age_9", label: "Age 9", emoji: "🌲" },
  { id: "age_10", label: "Age 10", emoji: "🌴" },
  { id: "age_11", label: "Age 11", emoji: "🏔️" },
  { id: "age_12", label: "Age 12", emoji: "🚀" },
  { id: "age_13", label: "Age 13", emoji: "⭐" },
  { id: "age_14", label: "Age 14", emoji: "🎓" },
];

export default function LeaderboardModal({ childAgeCategory, childName, onClose }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRanks, setUserRanks] = useState([]);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(childAgeCategory || "age_5_6");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  useEffect(() => {
    fetchLeaderboard(selectedCategory);
  }, [selectedCategory]);

  const fetchLeaderboard = async (category) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/leaderboard/${category}`);
      setLeaderboard(res.data.leaderboard || []);
      setUserRanks(res.data.user_ranks || []);
      setTotalParticipants(res.data.total_participants || 0);
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
    }
    setLoading(false);
  };

  const currentCategoryInfo = AGE_CATEGORIES.find(c => c.id === selectedCategory) || AGE_CATEGORIES[0];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden border-4 border-slate-900 shadow-2xl my-8"
        data-testid="leaderboard-modal"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 relative overflow-hidden">
          {/* Decorative stars */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  y: [0, -10, 0],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{ duration: 2 + i * 0.3, repeat: Infinity }}
                className="absolute text-white/20 text-2xl"
                style={{ left: `${10 + i * 12}%`, top: `${20 + (i % 3) * 20}%` }}
              >
                ⭐
              </motion.div>
            ))}
          </div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <Trophy size={32} className="text-yellow-300" />
              <div>
                <h2 className="text-2xl font-bold font-kids">Leaderboard</h2>
                <p className="text-sm text-indigo-200">See how you compare!</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              data-testid="close-leaderboard-modal"
            >
              <X size={24} className="text-white" />
            </button>
          </div>

          {/* Category Selector */}
          <div className="relative mt-4">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="w-full flex items-center justify-between bg-white/20 hover:bg-white/30 rounded-xl px-4 py-3 text-white transition-colors"
              data-testid="category-selector"
            >
              <span className="flex items-center gap-2">
                <span className="text-xl">{currentCategoryInfo.emoji}</span>
                <span className="font-semibold">{currentCategoryInfo.label}</span>
              </span>
              <ChevronDown size={20} className={`transition-transform ${showCategoryDropdown ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {showCategoryDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border-2 border-slate-200 overflow-hidden z-10"
                >
                  {AGE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setShowCategoryDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-100 transition-colors ${
                        selectedCategory === cat.id ? "bg-indigo-50 text-indigo-700" : "text-slate-700"
                      }`}
                    >
                      <span className="text-xl">{cat.emoji}</span>
                      <span className="font-medium">{cat.label}</span>
                      {selectedCategory === cat.id && <Sparkles size={16} className="ml-auto text-indigo-500" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* User's Rank Highlight */}
          {userRanks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 border-2 border-indigo-200"
            >
              <h3 className="text-sm font-bold text-indigo-600 mb-2 flex items-center gap-2">
                <Award size={18} />
                Your Ranking
              </h3>
              {userRanks.map((rank) => (
                <div key={rank.child_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      #{rank.rank}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{rank.name}</p>
                      <p className="text-sm text-slate-500">{rank.total_stars} stars • Score: {rank.score}</p>
                    </div>
                  </div>
                  {rank.rank <= 3 && (
                    <span className="text-3xl">{RANK_STYLES[rank.rank]?.icon || "🏅"}</span>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {/* Participants count */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Users size={18} />
              <span className="text-sm font-medium">{totalParticipants} students competing</span>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="text-4xl"
              >
                🏆
              </motion.div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-slate-900">No competitors yet!</h3>
              <p className="text-slate-500 mt-2">Be the first to climb the leaderboard!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => {
                const isTopThree = entry.rank <= 3;
                const rankStyle = RANK_STYLES[entry.rank];
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                      entry.is_current_user 
                        ? "bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-indigo-300 shadow-md" 
                        : isTopThree 
                          ? `bg-gradient-to-r ${rankStyle.bg} border-2 border-white/50`
                          : "bg-slate-50 hover:bg-slate-100"
                    }`}
                    data-testid={`leaderboard-entry-${entry.rank}`}
                  >
                    {/* Rank */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      isTopThree 
                        ? `bg-white/30 ${rankStyle.textColor}` 
                        : "bg-white text-slate-700 border-2 border-slate-200"
                    }`}>
                      {isTopThree ? (
                        <span className="text-2xl">{rankStyle.icon}</span>
                      ) : (
                        `#${entry.rank}`
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`font-bold ${isTopThree ? rankStyle.textColor : "text-slate-900"} ${
                          entry.is_current_user ? "text-indigo-700" : ""
                        }`}>
                          {entry.name}
                          {entry.is_current_user && <span className="ml-2 text-xs bg-indigo-500 text-white px-2 py-0.5 rounded-full">YOU</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-xs mt-1">
                        <span className={`flex items-center gap-1 ${isTopThree ? rankStyle.textColor + " opacity-80" : "text-slate-500"}`}>
                          <Star size={12} fill="currentColor" /> {entry.total_stars}
                        </span>
                        <span className={`flex items-center gap-1 ${isTopThree ? rankStyle.textColor + " opacity-80" : "text-slate-500"}`}>
                          <Flame size={12} /> {entry.current_streak}d
                        </span>
                        <span className={`flex items-center gap-1 ${isTopThree ? rankStyle.textColor + " opacity-80" : "text-slate-500"}`}>
                          <Medal size={12} /> {entry.total_badges}
                        </span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className={`text-right ${isTopThree ? rankStyle.textColor : "text-slate-700"}`}>
                      <p className="text-lg font-bold">{entry.score}</p>
                      <p className={`text-xs ${isTopThree ? "opacity-80" : "text-slate-400"}`}>points</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Scoring explanation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200"
          >
            <h4 className="text-sm font-bold text-slate-700 mb-2">How scoring works:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Star size={12} className="text-yellow-500" /> Stars × 3 points
              </div>
              <div className="flex items-center gap-1">
                <Flame size={12} className="text-orange-500" /> Streak days × 2 points
              </div>
              <div className="flex items-center gap-1">
                <Medal size={12} className="text-purple-500" /> Badges × 5 points
              </div>
              <div className="flex items-center gap-1">
                <Trophy size={12} className="text-blue-500" /> Attempts × 0.1 points
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
