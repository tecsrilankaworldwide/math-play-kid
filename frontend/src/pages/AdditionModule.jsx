import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Plus, Minus } from "lucide-react";
import axios from "axios";
import Confetti from "react-confetti";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdditionModule() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [stars, setStars] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("addition"); // addition or subtraction

  const fetchQuestion = async () => {
    setLoading(true);
    setSelected(null);
    setIsCorrect(null);
    try {
      const response = await axios.get(`${API}/question/${mode}`);
      setQuestion(response.data);
    } catch (e) {
      console.error("Failed to fetch question:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestion();
    axios.get(`${API}/progress`).then(res => setStars(res.data.addition_stars || 0));
  }, [mode]);

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
          module: "addition",
          stars_earned: 1,
          correct: true
        });
        setStars(res.data.addition_stars);
      } catch (e) {
        console.error("Failed to update progress:", e);
      }
    }

    setTimeout(() => {
      fetchQuestion();
    }, correct ? 2000 : 1500);
  };

  const renderVisualMath = () => {
    if (!question?.visual_data) return null;
    const { a, b, object } = question.visual_data;
    const isAddition = question.type === "addition";
    
    return (
      <div className="flex flex-wrap items-center justify-center gap-4 py-6">
        <div className="flex flex-wrap gap-2 justify-center max-w-[200px]">
          {Array.from({ length: a }).map((_, i) => (
            <motion.span
              key={`a-${i}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="text-4xl md:text-5xl"
            >
              {object}
            </motion.span>
          ))}
        </div>
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
          className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isAddition ? 'bg-[#06D6A0]' : 'bg-[#EF476F]'
          }`}
        >
          {isAddition ? (
            <Plus size={40} strokeWidth={4} color="white" />
          ) : (
            <Minus size={40} strokeWidth={4} color="white" />
          )}
        </motion.div>
        
        <div className="flex flex-wrap gap-2 justify-center max-w-[200px]">
          {Array.from({ length: b }).map((_, i) => (
            <motion.span
              key={`b-${i}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className={`text-4xl md:text-5xl ${!isAddition ? 'opacity-40 line-through' : ''}`}
            >
              {object}
            </motion.span>
          ))}
        </div>
      </div>
    );
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
          className="clay-btn clay-btn-secondary p-3 md:p-4"
        >
          <ArrowLeft size={32} strokeWidth={3} />
        </motion.button>
        
        <h1 className="text-2xl md:text-4xl font-black text-[#073B4C]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
          {mode === "addition" ? "Addition" : "Subtraction"}
        </h1>
        
        <div className="clay-btn clay-btn-primary px-4 py-2 text-lg md:text-xl" data-testid="stars-display">
          <Star size={24} strokeWidth={3} fill="#FFD166" />
          <span>{stars}</span>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center gap-4 mb-6">
        <motion.button
          data-testid="addition-mode-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMode("addition")}
          className={`clay-btn px-6 py-3 text-lg font-bold ${
            mode === "addition" ? "clay-btn-green" : "clay-btn-primary"
          }`}
        >
          <Plus size={24} strokeWidth={3} />
          Add
        </motion.button>
        <motion.button
          data-testid="subtraction-mode-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMode("subtraction")}
          className={`clay-btn px-6 py-3 text-lg font-bold ${
            mode === "subtraction" ? "clay-btn-pink" : "clay-btn-primary"
          }`}
        >
          <Minus size={24} strokeWidth={3} />
          Subtract
        </motion.button>
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
              ➕
            </motion.div>
          </div>
        ) : (
          <>
            <h2 className="text-3xl md:text-5xl font-black text-center text-[#073B4C] mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              {question?.question}
            </h2>
            
            {renderVisualMath()}

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
                  className={`answer-option ${
                    selected === option
                      ? isCorrect
                        ? "clay-btn-green bounce-glow"
                        : "clay-btn-pink wiggle"
                      : selected !== null && option === question.correct_answer
                        ? "clay-btn-green"
                        : "clay-btn-primary"
                  }`}
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
                {isCorrect ? "Perfect! 🎉" : "Oops! Try again! 💪"}
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
