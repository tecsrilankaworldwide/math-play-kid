import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Hash, Plus, Shapes, Star, Trophy, Sparkles } from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ModuleCard = ({ icon: Icon, title, color, shadow, onClick, delay, testId }) => (
  <motion.button
    data-testid={testId}
    initial={{ scale: 0.5, opacity: 0, rotate: -5 }}
    animate={{ scale: 1, opacity: 1, rotate: 0 }}
    transition={{ type: "spring", bounce: 0.6, duration: 0.8, delay }}
    whileHover={{ scale: 1.05, rotate: 2 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="clay-btn p-6 md:p-8 flex flex-col items-center justify-center gap-3 min-h-[140px] md:min-h-[180px] w-full"
    style={{ 
      backgroundColor: color, 
      boxShadow: `0 8px 0 ${shadow}`,
      color: color === '#FFD166' || color === '#06D6A0' ? '#073B4C' : 'white'
    }}
  >
    <div className="p-3 rounded-full bg-white/30">
      <Icon size={48} strokeWidth={3} />
    </div>
    <span className="text-xl md:text-2xl font-black">{title}</span>
  </motion.button>
);

export default function HomePage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState({ total_stars: 0, badges: [] });

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await axios.get(`${API}/progress`);
        setProgress(response.data);
      } catch (e) {
        console.error("Failed to fetch progress:", e);
      }
    };
    fetchProgress();
  }, []);

  const modules = [
    { icon: Sparkles, title: "Count!", color: "#FFD166", shadow: "#E5B64E", path: "/counting", testId: "module-counting-button" },
    { icon: Hash, title: "Numbers", color: "#118AB2", shadow: "#0B6B8A", path: "/numbers", testId: "module-numbers-button" },
    { icon: Plus, title: "Add", color: "#06D6A0", shadow: "#04B384", path: "/addition", testId: "module-addition-button" },
    { icon: Shapes, title: "Shapes", color: "#EF476F", shadow: "#CC3354", path: "/shapes", testId: "module-shapes-button" },
    { icon: Star, title: "Quiz!", color: "#F78C6B", shadow: "#D66A4A", path: "/quiz", testId: "module-quiz-button" },
    { icon: Trophy, title: "Rewards", color: "#9B5DE5", shadow: "#7B3DC5", path: "/rewards", testId: "module-rewards-button" },
  ];

  return (
    <div className="min-h-screen relative z-10 px-4 py-6 md:px-8 md:py-10">
      {/* Header with Stars */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex justify-between items-center mb-6 md:mb-10"
      >
        <h1 className="text-3xl md:text-5xl font-black text-[#073B4C]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
          MathPlay
        </h1>
        <motion.button
          data-testid="header-stars-button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/rewards")}
          className="clay-btn clay-btn-primary px-4 py-2 md:px-6 md:py-3 text-lg md:text-xl"
        >
          <Star size={28} strokeWidth={3} fill="#FFD166" />
          <span>{progress.total_stars}</span>
        </motion.button>
      </motion.div>

      {/* Mascot Section */}
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
        className="flex flex-col items-center mb-8 md:mb-12"
      >
        <div className="mascot-bounce">
          <img 
            src="https://images.unsplash.com/photo-1667753147067-87f4b81179c1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwzfHxjdXRlJTIwZnJpZW5kbHklMjBhbmltYWwlMjBtYXNjb3QlMjAzZCUyMHJlbmRlcnxlbnwwfHx8fDE3NzQyMDQ1NjR8MA&ixlib=rb-4.1.0&q=85"
            alt="Friendly Dino Mascot"
            className="w-32 h-32 md:w-48 md:h-48 object-cover rounded-full border-8 border-white shadow-lg"
            data-testid="mascot-image"
          />
        </div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-xl md:text-2xl font-bold text-[#073B4C] text-center"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          Let's learn math together! 🎉
        </motion.p>
      </motion.div>

      {/* Module Grid */}
      <div className="max-w-3xl mx-auto">
        <div className="module-grid">
          {modules.map((module, index) => (
            <ModuleCard
              key={module.path}
              {...module}
              delay={0.3 + index * 0.1}
              onClick={() => navigate(module.path)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
