import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Lock, Sparkles } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BADGE_COLORS = {
  stars: "from-yellow-400 to-amber-500",
  streaks: "from-orange-500 to-red-500",
  special: "from-purple-500 to-indigo-600",
};

export default function AchievementBadgesModal({ childId, childName, onClose }) {
  const [achievements, setAchievements] = useState({ earned: [], locked: [] });
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState(null);

  useEffect(() => {
    fetchAchievements();
  }, [childId]);

  const fetchAchievements = async () => {
    try {
      const res = await axios.get(`${API}/children/${childId}/achievements`);
      setAchievements(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="text-4xl animate-spin">🏆</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden border-4 border-slate-900 shadow-2xl my-8"
        data-testid="achievements-modal"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-yellow-400 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <Trophy size={32} />
            <div>
              <h2 className="text-2xl font-bold font-kids">{childName}'s Achievements</h2>
              <p className="text-sm text-amber-100">
                {achievements.total_earned} of {achievements.total_available} badges earned
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            data-testid="close-achievements-modal"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm font-semibold text-slate-600 mb-2">
              <span>Badge Progress</span>
              <span>{Math.round((achievements.total_earned / achievements.total_available) * 100)}%</span>
            </div>
            <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(achievements.total_earned / achievements.total_available) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-500"
              />
            </div>
          </div>

          {/* Earned Badges */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900 font-kids mb-4 flex items-center gap-2">
              <Sparkles className="text-amber-500" size={24} />
              Earned Badges ({achievements.earned.length})
            </h3>
            
            {achievements.earned.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl">
                <p className="text-slate-500">No badges earned yet. Keep practicing!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {achievements.earned.map((badge, i) => (
                  <motion.button
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    onClick={() => setSelectedBadge(badge)}
                    className={`relative p-4 rounded-2xl bg-gradient-to-br ${BADGE_COLORS[badge.category]} text-white shadow-lg cursor-pointer border-2 border-white/30`}
                    data-testid={`earned-badge-${badge.id}`}
                  >
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <h4 className="font-bold text-sm">{badge.name}</h4>
                    <div className="absolute top-2 right-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles size={16} className="text-white/70" />
                      </motion.div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Locked Badges */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 font-kids mb-4 flex items-center gap-2">
              <Lock className="text-slate-400" size={24} />
              Locked Badges ({achievements.locked.length})
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {achievements.locked.map((badge, i) => (
                <motion.button
                  key={badge.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedBadge(badge)}
                  className="relative p-4 rounded-2xl bg-slate-100 text-slate-400 cursor-pointer border-2 border-slate-200"
                  data-testid={`locked-badge-${badge.id}`}
                >
                  <div className="text-4xl mb-2 grayscale opacity-50">{badge.icon}</div>
                  <h4 className="font-bold text-sm">{badge.name}</h4>
                  <div className="absolute top-2 right-2">
                    <Lock size={16} />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Badge Detail Modal */}
        <AnimatePresence>
          {selectedBadge && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center p-6"
              onClick={() => setSelectedBadge(null)}
            >
              <motion.div
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
                className={`bg-white rounded-3xl p-8 max-w-sm w-full text-center border-4 ${selectedBadge.earned ? "border-amber-400" : "border-slate-300"}`}
                onClick={(e) => e.stopPropagation()}
                data-testid="badge-detail-modal"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className={`text-7xl mb-4 ${!selectedBadge.earned && "grayscale opacity-50"}`}
                >
                  {selectedBadge.icon}
                </motion.div>
                
                <h3 className="text-2xl font-bold text-slate-900 font-kids">{selectedBadge.name}</h3>
                <p className="mt-2 text-slate-600">{selectedBadge.description}</p>
                
                {selectedBadge.earned ? (
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    <Sparkles size={16} />
                    Earned!
                  </div>
                ) : (
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-full text-sm font-semibold">
                    <Lock size={16} />
                    Keep practicing to unlock!
                  </div>
                )}
                
                {selectedBadge.earned_at && (
                  <p className="mt-3 text-xs text-slate-400">
                    Earned on {new Date(selectedBadge.earned_at).toLocaleDateString()}
                  </p>
                )}
                
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="mt-6 w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                  data-testid="close-badge-detail"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
