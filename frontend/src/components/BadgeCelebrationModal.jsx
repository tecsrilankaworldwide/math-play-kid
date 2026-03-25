import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { Trophy, Sparkles, Star, Flame, Zap, Award } from "lucide-react";

// Badge metadata with icons and colors
const BADGE_DATA = {
  first_star: { name: "First Star", icon: "⭐", color: "from-yellow-400 to-amber-500", message: "You earned your first star!" },
  five_stars: { name: "5 Stars", icon: "🌟", color: "from-yellow-400 to-orange-500", message: "5 stars! You're shining bright!" },
  ten_stars: { name: "10 Stars", icon: "✨", color: "from-amber-400 to-yellow-500", message: "10 stars! Amazing progress!" },
  twenty_stars: { name: "20 Stars", icon: "💫", color: "from-orange-400 to-red-500", message: "20 stars! You're a superstar!" },
  fifty_stars: { name: "50 Stars", icon: "🎖️", color: "from-purple-500 to-pink-500", message: "50 stars! Incredible achievement!" },
  century: { name: "Century Club", icon: "🏆", color: "from-yellow-500 to-amber-600", message: "100 STARS! You're a LEGEND!" },
  streak_3: { name: "3-Day Streak", icon: "🔥", color: "from-orange-500 to-red-500", message: "3 days in a row! Keep it up!" },
  streak_7: { name: "Week Warrior", icon: "🔥", color: "from-red-500 to-orange-600", message: "A whole week! You're unstoppable!" },
  streak_14: { name: "2-Week Champion", icon: "🔥", color: "from-red-600 to-pink-600", message: "2 weeks! Champion status!" },
  streak_30: { name: "Monthly Master", icon: "👑", color: "from-purple-600 to-indigo-600", message: "30 DAYS! You're a MASTER!" },
  speed_demon: { name: "Speed Demon", icon: "⚡", color: "from-blue-500 to-cyan-500", message: "Lightning fast! Amazing speed!" },
  perfect_quiz: { name: "Perfect Quiz", icon: "💯", color: "from-green-500 to-emerald-500", message: "PERFECT SCORE! Genius!" },
  math_explorer: { name: "Math Explorer", icon: "🧭", color: "from-teal-500 to-blue-500", message: "You've explored all modules!" },
};

// Sound effect URLs (royalty-free celebration sounds)
const CELEBRATION_SOUNDS = {
  fanfare: "https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3",
  chime: "https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3",
  success: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3",
};

export default function BadgeCelebrationModal({ badge, onClose }) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [animationPhase, setAnimationPhase] = useState(0);
  const audioRef = useRef(null);
  
  const badgeInfo = BADGE_DATA[badge] || {
    name: badge?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    icon: "🏅",
    color: "from-amber-400 to-yellow-500",
    message: "You earned a new badge!"
  };

  useEffect(() => {
    // Play celebration sound
    try {
      audioRef.current = new Audio(CELEBRATION_SOUNDS.fanfare);
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(() => {
        // Audio autoplay blocked - that's okay
      });
    } catch (e) {
      // Audio not supported
    }

    // Animation sequence
    const timer1 = setTimeout(() => setAnimationPhase(1), 300);
    const timer2 = setTimeout(() => setAnimationPhase(2), 800);
    const timer3 = setTimeout(() => setAnimationPhase(3), 1500);
    const confettiTimer = setTimeout(() => setShowConfetti(false), 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(confettiTimer);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70"
        onClick={onClose}
        data-testid="badge-celebration-modal"
      >
        {/* Confetti */}
        {showConfetti && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={true}
            numberOfPieces={300}
            gravity={0.15}
            colors={['#FFD700', '#FFA500', '#FF6347', '#FF69B4', '#00CED1', '#9370DB']}
          />
        )}

        {/* Celebration Card */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
          className="relative bg-white rounded-3xl p-8 max-w-md w-full mx-4 text-center shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background Glow */}
          <div className={`absolute inset-0 bg-gradient-to-br ${badgeInfo.color} opacity-20`} />
          
          {/* Sparkle Effects */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  x: Math.random() * 400 - 200,
                  y: Math.random() * 400 - 200,
                }}
                transition={{ 
                  duration: 2,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                className="absolute top-1/2 left-1/2 text-2xl"
              >
                ✨
              </motion.div>
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-4"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-full text-sm font-bold shadow-lg">
                <Trophy size={18} />
                NEW BADGE UNLOCKED!
              </span>
            </motion.div>

            {/* Badge Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: animationPhase >= 1 ? 1 : 0 }}
              transition={{ type: "spring", bounce: 0.6 }}
              className="relative"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1, 1.1, 1]
                }}
                transition={{ duration: 0.5, delay: 1, repeat: 2 }}
                className="text-9xl mb-4"
              >
                {badgeInfo.icon}
              </motion.div>
              
              {/* Glow ring */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity }}
                className={`absolute inset-0 rounded-full bg-gradient-to-r ${badgeInfo.color} blur-xl -z-10`}
              />
            </motion.div>

            {/* Badge Name */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: animationPhase >= 2 ? 0 : 20, opacity: animationPhase >= 2 ? 1 : 0 }}
              className={`text-3xl font-bold font-kids bg-gradient-to-r ${badgeInfo.color} bg-clip-text text-transparent mb-2`}
            >
              {badgeInfo.name}
            </motion.h2>

            {/* Message */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: animationPhase >= 3 ? 0 : 20, opacity: animationPhase >= 3 ? 1 : 0 }}
              className="text-xl text-slate-700 mb-6"
            >
              {badgeInfo.message}
            </motion.p>

            {/* Stars Animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: animationPhase >= 3 ? 1 : 0 }}
              className="flex justify-center gap-2 mb-6"
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ rotate: 0, scale: 0 }}
                  animate={{ rotate: 360, scale: 1 }}
                  transition={{ delay: 1.5 + i * 0.1, type: "spring" }}
                >
                  <Star size={24} fill="#FFD700" className="text-yellow-400" />
                </motion.div>
              ))}
            </motion.div>

            {/* Close Button */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: animationPhase >= 3 ? 0 : 20, opacity: animationPhase >= 3 ? 1 : 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className={`w-full py-4 rounded-2xl font-bold text-white text-lg bg-gradient-to-r ${badgeInfo.color} shadow-lg hover:shadow-xl transition-shadow`}
              data-testid="celebration-continue-button"
            >
              Awesome! Keep Going! 🚀
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
