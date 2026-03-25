import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Star, ThumbsUp, Lightbulb } from "lucide-react";

// Encouraging messages for struggling students
const ENCOURAGEMENT_MESSAGES = [
  { text: "Keep trying! Every mistake makes you smarter! 🧠", icon: "🧠" },
  { text: "You're doing great! Practice makes perfect! 💪", icon: "💪" },
  { text: "Don't give up! Champions never quit! 🏆", icon: "🏆" },
  { text: "It's okay to make mistakes - that's how we learn! 📚", icon: "📚" },
  { text: "You're getting closer! Keep going! 🚀", icon: "🚀" },
  { text: "Believe in yourself! You can do it! ⭐", icon: "⭐" },
  { text: "Every expert was once a beginner! 🌟", icon: "🌟" },
  { text: "Your brain is growing stronger with each try! 🧩", icon: "🧩" },
];

const SMALL_WIN_MESSAGES = [
  { threshold: 5, text: "Amazing! You answered 5 questions today!", icon: "🎯" },
  { threshold: 10, text: "Wow! 10 questions! You're on fire!", icon: "🔥" },
  { threshold: 15, text: "Incredible! 15 questions! Super learner!", icon: "🌟" },
  { threshold: 20, text: "Fantastic! 20 questions! You're unstoppable!", icon: "🚀" },
];

export default function EncouragementPopup({ 
  type = "encouragement", // "encouragement" | "small_win" | "progress"
  wrongStreak = 0,
  questionsToday = 0,
  progressData = null, // { badge, current, target, remaining }
  onClose,
  autoClose = true
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const getMessage = () => {
    if (type === "encouragement") {
      return ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)];
    }
    if (type === "small_win") {
      // Find the appropriate small win message
      const milestone = [...SMALL_WIN_MESSAGES].reverse().find(m => questionsToday >= m.threshold);
      return milestone || { text: `Great job! ${questionsToday} questions today!`, icon: "👏" };
    }
    if (type === "progress" && progressData) {
      return {
        text: `Only ${progressData.remaining} more to earn "${progressData.name}"!`,
        icon: "🎯"
      };
    }
    return { text: "Keep going!", icon: "💪" };
  };

  const message = getMessage();

  // Different styles based on type
  const getStyles = () => {
    switch (type) {
      case "encouragement":
        return {
          bg: "from-purple-500 to-indigo-600",
          border: "border-purple-300",
          title: "You've Got This!"
        };
      case "small_win":
        return {
          bg: "from-green-500 to-emerald-600",
          border: "border-green-300",
          title: "Small Win!"
        };
      case "progress":
        return {
          bg: "from-blue-500 to-cyan-600",
          border: "border-blue-300",
          title: "Almost There!"
        };
      default:
        return {
          bg: "from-amber-500 to-orange-600",
          border: "border-amber-300",
          title: "Keep Going!"
        };
    }
  };

  const styles = getStyles();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
          data-testid="encouragement-popup"
        >
          <div className={`relative bg-gradient-to-r ${styles.bg} rounded-2xl p-5 text-white shadow-2xl border-4 ${styles.border}`}>
            {/* Sparkle decorations */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute top-2 right-2 text-2xl opacity-50"
            >
              ✨
            </motion.div>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-2 left-2 text-xl opacity-50"
            >
              ⭐
            </motion.div>

            {/* Content */}
            <div className="flex items-center gap-4">
              {/* Icon */}
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-5xl"
              >
                {message.icon}
              </motion.div>

              {/* Text */}
              <div className="flex-1">
                <h4 className="text-sm font-bold uppercase tracking-wide text-white/80">
                  {styles.title}
                </h4>
                <p className="text-lg font-bold mt-1">
                  {message.text}
                </p>
                
                {/* Progress bar for progress type */}
                {type === "progress" && progressData && (
                  <div className="mt-3">
                    <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressData.percentage}%` }}
                        transition={{ duration: 1 }}
                        className="h-full bg-white rounded-full"
                      />
                    </div>
                    <p className="text-xs mt-1 text-white/80">
                      {progressData.current} / {progressData.target}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => {
                setVisible(false);
                setTimeout(onClose, 300);
              }}
              className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-600 font-bold shadow-lg hover:bg-slate-100 transition-colors"
              data-testid="close-encouragement"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Mascot component for extra encouragement
export function EncouragementMascot({ mood = "happy" }) {
  const mascots = {
    happy: { emoji: "🤗", message: "You're awesome!" },
    encouraging: { emoji: "💪", message: "Keep trying!" },
    celebrating: { emoji: "🥳", message: "Amazing!" },
    thinking: { emoji: "🤔", message: "Think about it..." },
  };

  const mascot = mascots[mood] || mascots.happy;

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      className="fixed bottom-8 right-8 z-40"
      data-testid="encouragement-mascot"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="relative"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-4xl border-4 border-white shadow-xl">
          {mascot.emoji}
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full text-sm font-bold text-slate-700 shadow-lg whitespace-nowrap"
        >
          {mascot.message}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
