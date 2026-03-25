import { motion } from "framer-motion";
import { Target, Star, Trophy, Flame, Heart, BookOpen } from "lucide-react";

const BADGE_ICONS = {
  five_stars: { icon: "🌟", color: "from-yellow-400 to-amber-500" },
  ten_stars: { icon: "✨", color: "from-amber-400 to-yellow-500" },
  twenty_stars: { icon: "💫", color: "from-orange-400 to-red-500" },
  brave_learner: { icon: "🦁", color: "from-orange-500 to-yellow-500" },
  mistake_master: { icon: "🔄", color: "from-purple-500 to-indigo-500" },
  daily_learner: { icon: "📚", color: "from-blue-500 to-cyan-500" },
  streak_3: { icon: "🔥", color: "from-red-500 to-orange-500" },
  streak_7: { icon: "🔥", color: "from-red-600 to-orange-600" },
  never_give_up: { icon: "💪", color: "from-green-500 to-emerald-500" },
};

export default function ProgressIndicator({ progressList = [] }) {
  if (!progressList || progressList.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 border-4 border-slate-900 shadow-lg"
      data-testid="progress-indicator"
    >
      <div className="flex items-center gap-2 mb-4">
        <Target className="text-blue-500" size={24} />
        <h3 className="text-lg font-bold text-slate-900 font-kids">Almost There!</h3>
      </div>

      <div className="space-y-4">
        {progressList.slice(0, 3).map((progress, index) => {
          const badgeInfo = BADGE_ICONS[progress.badge] || { icon: "🎯", color: "from-slate-400 to-slate-500" };
          
          return (
            <motion.div
              key={progress.badge}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Badge name and icon */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{badgeInfo.icon}</span>
                  <span className="font-semibold text-slate-700">{progress.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-500">
                  {progress.remaining} to go!
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-4 bg-slate-200 rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full bg-gradient-to-r ${badgeInfo.color} rounded-full relative`}
                >
                  {/* Shine effect */}
                  <motion.div
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  />
                </motion.div>

                {/* Progress text inside bar */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-700">
                    {progress.current} / {progress.target}
                  </span>
                </div>
              </div>

              {/* Encouraging message based on percentage */}
              {progress.percentage >= 80 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-green-600 font-semibold mt-1 flex items-center gap-1"
                >
                  <Flame size={12} className="text-orange-500" />
                  So close! You can do it!
                </motion.p>
              )}
              {progress.percentage >= 50 && progress.percentage < 80 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-blue-600 font-semibold mt-1 flex items-center gap-1"
                >
                  <Star size={12} className="text-yellow-500" />
                  Halfway there! Keep going!
                </motion.p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Total progress summary */}
      {progressList.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 pt-4 border-t-2 border-slate-200 text-center"
        >
          <p className="text-sm text-slate-600">
            <span className="font-bold text-blue-600">{progressList.length}</span> badges within reach!
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

// Mini version for inline display
export function MiniProgressBadge({ badge, current, target, icon }) {
  const percentage = Math.round((current / target) * 100);
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full"
      data-testid={`mini-progress-${badge}`}
    >
      <span className="text-lg">{icon}</span>
      <div className="w-16 h-2 bg-slate-300 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-bold text-slate-600">{target - current} left</span>
    </motion.div>
  );
}
