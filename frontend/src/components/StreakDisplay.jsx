import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, Calendar, TrendingUp } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function StreakDisplay({ childId, compact = false }) {
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (childId) {
      fetchStreak();
    }
  }, [childId]);

  const fetchStreak = async () => {
    try {
      const res = await axios.get(`${API}/children/${childId}/streak`);
      setStreak(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (loading || !streak) {
    return compact ? null : (
      <div className="animate-pulse bg-slate-200 rounded-xl h-24" />
    );
  }

  const currentStreak = streak.current_streak || 0;
  const longestStreak = streak.longest_streak || 0;
  const lastPractice = streak.last_practice_date;
  const today = new Date().toISOString().split("T")[0];
  const practicedToday = lastPractice === today;

  // Compact version for header/cards
  if (compact) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-sm ${
          currentStreak > 0
            ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
            : "bg-slate-200 text-slate-500"
        }`}
        data-testid="streak-display-compact"
      >
        <motion.div
          animate={currentStreak > 0 ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
        >
          <Flame size={18} className={currentStreak > 0 ? "text-yellow-300" : ""} />
        </motion.div>
        <span>{currentStreak}</span>
      </motion.div>
    );
  }

  // Full version for dashboard
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-5 text-white border-4 border-slate-900 shadow-lg"
      data-testid="streak-display-full"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold font-kids flex items-center gap-2">
            <Flame className="text-yellow-300" size={24} />
            Daily Streak
          </h3>
          <p className="text-orange-100 text-sm mt-1">
            {practicedToday ? "You've practiced today!" : "Practice to keep your streak!"}
          </p>
        </div>
        
        <motion.div
          animate={currentStreak > 0 ? { 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-4xl"
        >
          🔥
        </motion.div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        {/* Current Streak */}
        <div className="bg-white/20 rounded-xl p-3">
          <div className="flex items-center gap-2 text-orange-100 text-sm">
            <Flame size={16} />
            Current
          </div>
          <div className="text-3xl font-bold font-kids mt-1">
            {currentStreak}
            <span className="text-lg text-orange-200 ml-1">days</span>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="bg-white/20 rounded-xl p-3">
          <div className="flex items-center gap-2 text-orange-100 text-sm">
            <TrendingUp size={16} />
            Best
          </div>
          <div className="text-3xl font-bold font-kids mt-1">
            {longestStreak}
            <span className="text-lg text-orange-200 ml-1">days</span>
          </div>
        </div>
      </div>

      {/* Last 7 days visual */}
      <div className="mt-4">
        <div className="flex items-center gap-1 text-orange-100 text-xs mb-2">
          <Calendar size={14} />
          Last 7 days
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 7 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dateStr = date.toISOString().split("T")[0];
            const practiced = streak.streak_history?.includes(dateStr);
            
            return (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  practiced
                    ? "bg-yellow-400 text-orange-900"
                    : "bg-white/10 text-white/50"
                }`}
                title={date.toLocaleDateString()}
              >
                {practiced ? "🔥" : date.getDate()}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Motivational message based on streak */}
      {currentStreak >= 7 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-center py-2 bg-yellow-400 text-orange-900 rounded-xl font-bold text-sm"
        >
          🌟 Amazing! You're on fire! Keep it up! 🌟
        </motion.div>
      )}
      {currentStreak >= 3 && currentStreak < 7 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-center py-2 bg-white/20 rounded-xl font-bold text-sm"
        >
          Great job! {7 - currentStreak} more days to reach a week! 💪
        </motion.div>
      )}
      {currentStreak === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-center py-2 bg-white/20 rounded-xl font-bold text-sm"
        >
          Start practicing today to begin your streak! 🚀
        </motion.div>
      )}
    </motion.div>
  );
}
