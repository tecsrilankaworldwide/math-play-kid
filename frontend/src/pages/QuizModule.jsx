import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Trophy } from "lucide-react";
import axios from "axios";
import Confetti from "react-confetti";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Shape Display Component
const ShapeDisplay = ({ shape }) => {
  const shapeStyles = {
    Circle: (
      <svg viewBox="0 0 100 100" className="w-20 h-20">
        <circle cx="50" cy="50" r="45" fill="#EF476F" />
      </svg>
    ),
    Square: (
      <svg viewBox="0 0 100 100" className="w-20 h-20">
        <rect x="10" y="10" width="80" height="80" fill="#118AB2" />
      </svg>
    ),
    Triangle: (
      <svg viewBox="0 0 100 100" className="w-20 h-20">
        <polygon points="50,10 10,90 90,90" fill="#06D6A0" />
      </svg>
    ),
    Star: (
      <svg viewBox="0 0 100 100" className="w-20 h-20">
        <polygon 
          points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40" 
          fill="#FFD166" 
        />
      </svg>
    ),
    Heart: (
      <svg viewBox="0 0 100 100" className="w-20 h-20">
        <path 
          d="M50,88 C25,65 5,45 5,30 C5,15 20,5 35,5 C45,5 50,15 50,15 C50,15 55,5 65,5 C80,5 95,15 95,30 C95,45 75,65 50,88 Z" 
          fill="#EF476F" 
        />
      </svg>
    ),
    Diamond: (
      <svg viewBox="0 0 100 100" className="w-20 h-20">
        <polygon points="50,5 95,50 50,95 5,50" fill="#9B5DE5" />
      </svg>
    ),
  };

  return shapeStyles[shape] || null;
};

export default function QuizModule() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [score, setScore] = useState(0);
  const [questionNum, setQuestionNum] = useState(1);
  const [totalQuestions] = useState(10);
  const [loading, setLoading] = useState(true);
  const [quizComplete, setQuizComplete] = useState(false);

  const fetchQuestion = async () => {
    setLoading(true);
    setSelected(null);
    setIsCorrect(null);
    try {
      const response = await axios.get(`${API}/question/quiz`);
      setQuestion(response.data);
    } catch (e) {
      console.error("Failed to fetch question:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  const handleAnswer = async (answer) => {
    if (selected !== null) return;
    setSelected(answer);
    
    const correct = answer === question.correct_answer;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(prev => prev + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      
      try {
        await axios.post(`${API}/progress/update`, {
          module: "quiz",
          stars_earned: 1,
          correct: true
        });
      } catch (e) {
        console.error("Failed to update progress:", e);
      }
    }

    setTimeout(() => {
      if (questionNum >= totalQuestions) {
        setQuizComplete(true);
      } else {
        setQuestionNum(prev => prev + 1);
        fetchQuestion();
      }
    }, correct ? 1500 : 1000);
  };

  const restartQuiz = () => {
    setScore(0);
    setQuestionNum(1);
    setQuizComplete(false);
    fetchQuestion();
  };

  const renderVisual = () => {
    if (!question?.visual_data) return null;
    
    if (question.type === "counting") {
      const { object, count } = question.visual_data;
      return (
        <div className="flex flex-wrap justify-center gap-2 py-4">
          {Array.from({ length: count }).map((_, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="text-4xl"
            >
              {object}
            </motion.span>
          ))}
        </div>
      );
    }
    
    if (question.type === "numbers") {
      return (
        <div className="text-center py-4">
          <span className="text-7xl md:text-9xl font-black" style={{ 
            fontFamily: 'Fredoka, sans-serif',
            color: '#118AB2',
            textShadow: '3px 3px 0 #0B6B8A'
          }}>
            {question.visual_data.number}
          </span>
        </div>
      );
    }
    
    if (question.type === "addition" || question.type === "subtraction") {
      const { a, b, object } = question.visual_data;
      return (
        <div className="flex flex-wrap items-center justify-center gap-3 py-4">
          <div className="flex flex-wrap gap-1 max-w-[150px]">
            {Array.from({ length: a }).map((_, i) => (
              <span key={`a-${i}`} className="text-3xl">{object}</span>
            ))}
          </div>
          <span className="text-3xl font-bold text-[#073B4C]">
            {question.type === "addition" ? "+" : "-"}
          </span>
          <div className="flex flex-wrap gap-1 max-w-[150px]">
            {Array.from({ length: b }).map((_, i) => (
              <span key={`b-${i}`} className={`text-3xl ${question.type === "subtraction" ? "opacity-40" : ""}`}>
                {object}
              </span>
            ))}
          </div>
        </div>
      );
    }
    
    if (question.type === "shapes") {
      return (
        <div className="flex justify-center py-4">
          <ShapeDisplay shape={question.visual_data.shape} />
        </div>
      );
    }
    
    return null;
  };

  if (quizComplete) {
    return (
      <div className="min-h-screen relative z-10 px-4 py-6 md:px-8 md:py-10 flex items-center justify-center">
        <Confetti recycle={false} numberOfPieces={500} />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="clay-card max-w-md mx-auto text-center"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Trophy size={100} strokeWidth={2} className="mx-auto text-[#FFD166]" fill="#FFD166" />
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-black text-[#073B4C] mt-6" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            Quiz Complete!
          </h1>
          
          <p className="text-2xl md:text-3xl font-bold text-[#5C7D8A] mt-4">
            You scored
          </p>
          
          <div className="flex items-center justify-center gap-2 mt-2">
            <Star size={40} fill="#FFD166" className="text-[#FFD166]" />
            <span className="text-5xl md:text-6xl font-black text-[#073B4C]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              {score}/{totalQuestions}
            </span>
          </div>
          
          <p className="text-xl font-bold mt-4 text-[#06D6A0]">
            {score >= 8 ? "Amazing! You're a math genius! 🌟" : 
             score >= 5 ? "Great job! Keep practicing! 💪" : 
             "Good try! Let's practice more! 🎯"}
          </p>
          
          <div className="flex flex-col gap-4 mt-8">
            <motion.button
              data-testid="play-again-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={restartQuiz}
              className="clay-btn clay-btn-green px-8 py-4 text-xl font-black w-full"
            >
              Play Again!
            </motion.button>
            
            <motion.button
              data-testid="go-home-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/")}
              className="clay-btn clay-btn-secondary px-8 py-4 text-xl font-black w-full"
            >
              Go Home
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative z-10 px-4 py-6 md:px-8 md:py-10">
      {showConfetti && <Confetti recycle={false} numberOfPieces={100} />}
      
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
          Quiz Time!
        </h1>
        
        <div className="clay-btn clay-btn-primary px-4 py-2 text-lg md:text-xl" data-testid="score-display">
          <Star size={24} strokeWidth={3} fill="#FFD166" />
          <span>{score}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex justify-between text-lg font-bold text-[#5C7D8A] mb-2">
          <span>Question {questionNum}</span>
          <span>{questionNum}/{totalQuestions}</span>
        </div>
        <div className="h-4 bg-white rounded-full overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(questionNum / totalQuestions) * 100}%` }}
            className="h-full bg-gradient-to-r from-[#FFD166] to-[#F78C6B] rounded-full"
          />
        </div>
      </div>

      {/* Question Card */}
      <motion.div 
        key={questionNum}
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="clay-card max-w-2xl mx-auto"
      >
        {loading ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-6xl"
            >
              🎯
            </motion.div>
          </div>
        ) : (
          <>
            <div className="text-sm font-bold text-[#5C7D8A] uppercase tracking-wider mb-2">
              {question?.type}
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-center text-[#073B4C] mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              {question?.question}
            </h2>
            
            {renderVisual()}

            {/* Answer Options */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              {question?.options.map((option, index) => (
                <motion.button
                  key={option}
                  data-testid={`answer-option-${index}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={selected === null ? { scale: 1.05 } : {}}
                  whileTap={selected === null ? { scale: 0.95 } : {}}
                  onClick={() => handleAnswer(option)}
                  disabled={selected !== null}
                  className={`answer-option text-xl ${
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
                {isCorrect ? "Correct! ⭐" : "Oops! 😊"}
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
