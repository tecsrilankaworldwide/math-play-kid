import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star } from "lucide-react";
import axios from "axios";
import Confetti from "react-confetti";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// SVG Shape Components
const ShapeDisplay = ({ shape }) => {
  const shapeStyles = {
    Circle: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="45" fill="#EF476F" />
      </svg>
    ),
    Square: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="10" y="10" width="80" height="80" fill="#118AB2" />
      </svg>
    ),
    Triangle: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <polygon points="50,10 10,90 90,90" fill="#06D6A0" />
      </svg>
    ),
    Star: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <polygon 
          points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40" 
          fill="#FFD166" 
        />
      </svg>
    ),
    Heart: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path 
          d="M50,88 C25,65 5,45 5,30 C5,15 20,5 35,5 C45,5 50,15 50,15 C50,15 55,5 65,5 C80,5 95,15 95,30 C95,45 75,65 50,88 Z" 
          fill="#EF476F" 
        />
      </svg>
    ),
    Diamond: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <polygon points="50,5 95,50 50,95 5,50" fill="#9B5DE5" />
      </svg>
    ),
  };

  return shapeStyles[shape] || <div className="text-8xl">{shape}</div>;
};

export default function ShapesModule() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [stars, setStars] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchQuestion = async () => {
    setLoading(true);
    setSelected(null);
    setIsCorrect(null);
    try {
      const response = await axios.get(`${API}/question/shapes`);
      setQuestion(response.data);
    } catch (e) {
      console.error("Failed to fetch question:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestion();
    axios.get(`${API}/progress`).then(res => setStars(res.data.shapes_stars || 0));
  }, []);

  const handleAnswer = async (answer) => {
    if (selected !== null) return;
    setSelected(answer);
    
    const correct = answer === question.correct_answer;
    setIsCorrect(correct);
    
    if (correct) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      
      try {
        const res = await axios.post(`${API}/progress/update`, {
          module: "shapes",
          stars_earned: 1,
          correct: true
        });
        setStars(res.data.shapes_stars);
      } catch (e) {
        console.error("Failed to update progress:", e);
      }
    }

    setTimeout(() => {
      fetchQuestion();
    }, correct ? 2000 : 1500);
  };

  return (
    <div className="min-h-screen relative z-10 px-4 py-6 md:px-8 md:py-10">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <motion.button
          data-testid="back-button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/")}
          className="clay-btn clay-btn-pink p-3 md:p-4"
        >
          <ArrowLeft size={32} strokeWidth={3} />
        </motion.button>
        
        <h1 className="text-2xl md:text-4xl font-black text-[#073B4C]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
          Shapes
        </h1>
        
        <div className="clay-btn clay-btn-primary px-4 py-2 text-lg md:text-xl" data-testid="stars-display">
          <Star size={24} strokeWidth={3} fill="#FFD166" />
          <span>{stars}</span>
        </div>
      </div>

      {/* Question Card */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="clay-card max-w-2xl mx-auto"
      >
        {loading ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-6xl"
            >
              🔷
            </motion.div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl md:text-3xl font-bold text-center text-[#073B4C] mb-6" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              {question?.question}
            </h2>
            
            {/* Shape Display */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="flex justify-center py-6"
            >
              <div className="shape-item">
                <ShapeDisplay shape={question?.visual_data?.shape} />
              </div>
            </motion.div>

            {/* Answer Options */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              {question?.options.map((option, index) => (
                <motion.button
                  key={option}
                  data-testid={`answer-option-${index}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={selected === null ? { scale: 1.05 } : {}}
                  whileTap={selected === null ? { scale: 0.95 } : {}}
                  onClick={() => handleAnswer(option)}
                  disabled={selected !== null}
                  className={`answer-option text-xl md:text-2xl ${
                    selected === option
                      ? isCorrect
                        ? "clay-btn-green bounce-glow"
                        : "clay-btn-pink wiggle"
                      : selected !== null && option === question.correct_answer
                        ? "clay-btn-green"
                        : "clay-btn-secondary"
                  }`}
                  style={selected === null ? { color: 'white' } : {}}
                >
                  {option}
                </motion.button>
              ))}
            </div>

            {/* Feedback */}
            {isCorrect !== null && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`mt-6 text-center text-2xl md:text-3xl font-black ${
                  isCorrect ? "text-[#06D6A0]" : "text-[#EF476F]"
                }`}
              >
                {isCorrect ? "You're a shape expert! 🌈" : "Not quite! Try again! 💫"}
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
