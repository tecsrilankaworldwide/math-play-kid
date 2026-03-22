import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Award, Sparkles, Hash, Plus, Shapes, Trophy } from "lucide-react";
import axios from "axios";
import Confetti from "react-confetti";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BADGE_INFO = {
  first_star: { name: "First Star!", icon: Star, color: "#FFD166", description: "Earned your first star!" },
  five_stars: { name: "Super Star!", icon: Sparkles, color: "#F78C6B", description: "Collected 5 stars!" },
  ten_stars: { name: "Math Wizard!", icon: Award, color: "#9B5DE5", description: "Collected 10 stars!" },
  twenty_stars: { name: "Genius!", icon: Trophy, color: "#06D6A0", description: "Collected 20 stars!" },
  counting_master: { name: "Counting Master", icon: Sparkles, color: "#FFD166", description: "5 stars in Counting!" },
  number_expert: { name: "Number Expert", icon: Hash, color: "#118AB2", description: "5 stars in Numbers!" },
  addition_ace: { name: "Addition Ace", icon: Plus, color: "#06D6A0", description: "5 stars in Addition!" },
  shape_detective: { name: "Shape Detective", icon: Shapes, color: "#EF476F", description: "5 stars in Shapes!" },
};

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay, type: "spring", bounce: 0.5 }}
    className="clay-card p-4 md:p-6 text-center"
  >
    <div 
      className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3"
      style={{ backgroundColor: color }}
    >
      <Icon size={32} strokeWidth={3} color="white" />
    </div>
    <div className="text-3xl md:text-4xl font-black text-[#073B4C]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
      {value}
    </div>
    <div className="text-sm md:text-base font-bold text-[#5C7D8A] uppercase tracking-wider mt-1">
      {label}
    </div>
  </motion.div>
);

const BadgeCard = ({ badge, earned, delay }) => {
  const info = BADGE_INFO[badge];
  if (!info) return null;
  
  const Icon = info.icon;
  
  return (
    <motion.div
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay, type: "spring", bounce: 0.6 }}
      className={`clay-card p-4 text-center ${!earned ? 'opacity-40 grayscale' : ''}`}
    >
      <motion.div 
        className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-3 border-4 border-white"
        style={{ backgroundColor: earned ? info.color : '#ccc' }}
        whileHover={earned ? { scale: 1.1, rotate: 5 } : {}}
      >
        <Icon size={40} strokeWidth={3} color="white" />
      </motion.div>
      <div className="text-lg font-black text-[#073B4C]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
        {info.name}
      </div>
      <div className="text-xs font-bold text-[#5C7D8A] mt-1">
        {earned ? info.description : "Keep playing!"}
      </div>
    </motion.div>
  );
};

export default function RewardsPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await axios.get(`${API}/progress`);
        setProgress(response.data);
        if (response.data.badges?.length > 0) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
      } catch (e) {
        console.error("Failed to fetch progress:", e);
      }
      setLoading(false);
    };
    fetchProgress();
  }, []);

  const allBadges = Object.keys(BADGE_INFO);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-8xl"
        >
          ⭐
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative z-10 px-4 py-6 md:px-8 md:py-10">
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <motion.button
          data-testid="back-button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/")}
          className="clay-btn clay-btn-secondary p-3 md:p-4"
        >
          <ArrowLeft size={32} strokeWidth={3} />
        </motion.button>
        
        <h1 className="text-2xl md:text-4xl font-black text-[#073B4C]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
          My Rewards
        </h1>
        
        <div className="w-16" /> {/* Spacer */}
      </div>

      {/* Total Stars Display */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="clay-card max-w-md mx-auto text-center mb-8 bg-gradient-to-br from-[#FFD166] to-[#F78C6B]"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Star size={80} strokeWidth={2} className="mx-auto" fill="white" color="white" />
        </motion.div>
        <div className="text-6xl md:text-7xl font-black text-white mt-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>
          {progress?.total_stars || 0}
        </div>
        <div className="text-xl font-bold text-white/90 uppercase tracking-wider mt-2">
          Total Stars
        </div>
      </motion.div>

      {/* Module Stats */}
      <div className="max-w-4xl mx-auto mb-8">
        <h2 className="text-xl md:text-2xl font-black text-[#073B4C] mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>
          Your Progress
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Sparkles}
            label="Counting"
            value={progress?.counting_stars || 0}
            color="#FFD166"
            delay={0.1}
          />
          <StatCard
            icon={Hash}
            label="Numbers"
            value={progress?.numbers_stars || 0}
            color="#118AB2"
            delay={0.2}
          />
          <StatCard
            icon={Plus}
            label="Addition"
            value={progress?.addition_stars || 0}
            color="#06D6A0"
            delay={0.3}
          />
          <StatCard
            icon={Shapes}
            label="Shapes"
            value={progress?.shapes_stars || 0}
            color="#EF476F"
            delay={0.4}
          />
        </div>
      </div>

      {/* Badges */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl md:text-2xl font-black text-[#073B4C] mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>
          Badges ({progress?.badges?.length || 0}/{allBadges.length})
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {allBadges.map((badge, index) => (
            <BadgeCard
              key={badge}
              badge={badge}
              earned={progress?.badges?.includes(badge)}
              delay={0.5 + index * 0.1}
            />
          ))}
        </div>
      </div>

      {/* Stats Footer */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="max-w-4xl mx-auto mt-8 text-center"
      >
        <div className="clay-card inline-flex items-center gap-6 px-8 py-4">
          <div>
            <div className="text-2xl font-black text-[#073B4C]">{progress?.games_played || 0}</div>
            <div className="text-sm font-bold text-[#5C7D8A]">Games Played</div>
          </div>
          <div className="w-px h-12 bg-[#E5E5E5]" />
          <div>
            <div className="text-2xl font-black text-[#06D6A0]">{progress?.correct_answers || 0}</div>
            <div className="text-sm font-bold text-[#5C7D8A]">Correct!</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
