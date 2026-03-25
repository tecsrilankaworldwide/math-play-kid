import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import Confetti from "react-confetti";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Star, Plus, Minus, X, Divide } from "lucide-react";
import BadgeCelebrationModal from "../components/BadgeCelebrationModal";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// SVG Shape Components
const ShapeDisplay = ({ shape }) => {
  const shapes = {
    Circle: <svg viewBox="0 0 100 100" className="w-32 h-32"><circle cx="50" cy="50" r="45" fill="#FF6B9D" /></svg>,
    Square: <svg viewBox="0 0 100 100" className="w-32 h-32"><rect x="10" y="10" width="80" height="80" fill="#0047FF" /></svg>,
    Triangle: <svg viewBox="0 0 100 100" className="w-32 h-32"><polygon points="50,10 10,90 90,90" fill="#00E676" /></svg>,
    Star: <svg viewBox="0 0 100 100" className="w-32 h-32"><polygon points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40" fill="#FFD500" /></svg>,
    Heart: <svg viewBox="0 0 100 100" className="w-32 h-32"><path d="M50,88 C25,65 5,45 5,30 C5,15 20,5 35,5 C45,5 50,15 50,15 C50,15 55,5 65,5 C80,5 95,15 95,30 C95,45 75,65 50,88 Z" fill="#FF6B9D" /></svg>,
    Diamond: <svg viewBox="0 0 100 100" className="w-32 h-32"><polygon points="50,5 95,50 50,95 5,50" fill="#9B5DE5" /></svg>,
  };
  return shapes[shape] || null;
};

export default function GameModule() {
  const { childId, module } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [child, setChild] = useState(null);
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [stars, setStars] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("addition"); // For addition module
  const [quizScore, setQuizScore] = useState(0);
  const [quizNum, setQuizNum] = useState(1);
  const [quizComplete, setQuizComplete] = useState(false);
  const [newBadge, setNewBadge] = useState(null); // For badge celebration
  const [existingBadges, setExistingBadges] = useState([]); // Track existing badges

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    } else if (user) {
      fetchChild();
    }
  }, [user, authLoading, navigate, childId]);

  const fetchChild = async () => {
    try {
      const res = await axios.get(`${API}/children/${childId}`);
      setChild(res.data);
      setStars(res.data.progress?.[`${module === "quiz" ? "quiz" : module}_stars`] || 0);
      setExistingBadges(res.data.progress?.badges || []); // Store existing badges
      if (!res.data.subscription_active) {
        navigate("/dashboard");
        return;
      }
      // Pass the age_category directly since setChild is async
      fetchQuestion(res.data.age_category);
    } catch (e) {
      navigate("/dashboard");
    }
    setLoading(false);
  };

  const fetchQuestion = async (ageCategory = null) => {
    setSelected(null);
    setIsCorrect(null);
    try {
      const moduleType = module === "addition" ? mode : module;
      const age = ageCategory || child?.age_category || "age_5_6";
      const res = await axios.get(`${API}/question/${moduleType}?age_category=${age}`);
      setQuestion(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAnswer = async (answer) => {
    if (selected !== null) return;
    setSelected(answer);
    
    const correct = answer === question.correct_answer;
    setIsCorrect(correct);
    
    if (correct) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
      
      if (module === "quiz") {
        setQuizScore(prev => prev + 1);
      }
      
      try {
        const response = await axios.put(`${API}/children/${childId}/progress?module=${module === "quiz" ? "quiz" : module}&stars=1`);
        setStars(prev => prev + 1);
        
        // Check for new badges
        const newBadges = response.data.progress?.badges || [];
        const earnedNewBadge = newBadges.find(badge => !existingBadges.includes(badge));
        
        if (earnedNewBadge) {
          // Delay showing celebration until after correct answer feedback
          setTimeout(() => {
            setNewBadge(earnedNewBadge);
            setExistingBadges(newBadges);
          }, 1500);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      // Record mistake for review later
      try {
        await axios.post(`${API}/children/${childId}/mistakes`, {
          question_id: question.id,
          question_text: question.question,
          question_type: question.type,
          user_answer: answer,
          correct_answer: question.correct_answer,
          options: question.options,
          is_correct: false
        });
      } catch (e) {
        console.error("Failed to record mistake:", e);
      }
    }

    setTimeout(() => {
      if (module === "quiz") {
        if (quizNum >= 10) {
          setQuizComplete(true);
        } else {
          setQuizNum(prev => prev + 1);
          fetchQuestion(child?.age_category);
        }
      } else {
        fetchQuestion(child?.age_category);
      }
    }, correct ? 1800 : 1200);
  };

  const renderVisual = () => {
    if (!question?.visual_data) return null;
    
    if (question.type === "counting") {
      const { object, count } = question.visual_data;
      // For large numbers, just show the number not emojis
      if (count > 20) {
        return (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center py-8">
            <div className="flex items-center justify-center gap-4">
              <span className="text-6xl">{object}</span>
              <span className="text-4xl font-bold text-slate-600">× ?</span>
            </div>
          </motion.div>
        );
      }
      return (
        <div className="flex flex-wrap justify-center gap-3 py-6 max-w-md mx-auto">
          {Array.from({ length: count }).map((_, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.08, type: "spring" }}
              className="text-5xl"
            >
              {object}
            </motion.span>
          ))}
        </div>
      );
    }
    
    if (question.type === "numbers") {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center py-8"
        >
          <span className="text-9xl font-bold font-kids" style={{ color: "#0047FF", textShadow: "4px 4px 0 #003ACC" }}>
            {question.visual_data.number}
          </span>
        </motion.div>
      );
    }
    
    if (question.type === "addition" || question.type === "subtraction") {
      const { a, b, object } = question.visual_data;
      // For large numbers, show numeric visual instead of emojis
      if (a > 15 || b > 15) {
        return (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center py-8">
            <div className="flex items-center justify-center gap-4 text-5xl font-bold font-kids">
              <span className="text-[#0047FF]">{a}</span>
              <span className={question.type === "addition" ? "text-[#00E676]" : "text-[#FF5252]"}>
                {question.type === "addition" ? "+" : "−"}
              </span>
              <span className="text-[#9B5DE5]">{b}</span>
            </div>
          </motion.div>
        );
      }
      return (
        <div className="flex items-center justify-center gap-4 py-6 flex-wrap">
          <div className="flex flex-wrap gap-2 max-w-[180px] justify-center">
            {Array.from({ length: a }).map((_, i) => (
              <motion.span key={`a-${i}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }} className="text-4xl">{object}</motion.span>
            ))}
          </div>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${question.type === "addition" ? "bg-[#00E676]" : "bg-[#FF5252]"}`}>
            {question.type === "addition" ? <Plus size={32} color="white" strokeWidth={3} /> : <Minus size={32} color="white" strokeWidth={3} />}
          </div>
          <div className="flex flex-wrap gap-2 max-w-[180px] justify-center">
            {Array.from({ length: b }).map((_, i) => (
              <motion.span key={`b-${i}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.05 }} className={`text-4xl ${question.type === "subtraction" ? "opacity-40" : ""}`}>{object}</motion.span>
            ))}
          </div>
        </div>
      );
    }
    
    if (question.type === "multiplication") {
      const { a, b } = question.visual_data;
      return (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center py-8">
          <div className="flex items-center justify-center gap-4 text-5xl font-bold font-kids">
            <span className="text-[#0047FF]">{a}</span>
            <span className="text-[#FFD500]">×</span>
            <span className="text-[#9B5DE5]">{b}</span>
          </div>
        </motion.div>
      );
    }
    
    if (question.type === "division") {
      const { a, b } = question.visual_data;
      return (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center py-8">
          <div className="flex items-center justify-center gap-4 text-5xl font-bold font-kids">
            <span className="text-[#0047FF]">{a}</span>
            <span className="text-[#FF6B9D]">÷</span>
            <span className="text-[#9B5DE5]">{b}</span>
          </div>
        </motion.div>
      );
    }
    
    if (question.type === "shapes") {
      return (
        <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} className="flex justify-center py-6">
          <ShapeDisplay shape={question.visual_data.shape} />
        </motion.div>
      );
    }
    
    // Fractions, Percentages, Algebra, Geometry, Exponents, Square Roots
    // These advanced topics just display the question prominently
    if (["fractions", "percentages", "algebra", "geometry", "exponents", "square_roots"].includes(question.type)) {
      return (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center py-6">
          <div className="inline-block bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-2xl shadow-lg">
            <span className="text-2xl font-bold uppercase tracking-wider">{question.type.replace("_", " ")}</span>
          </div>
        </motion.div>
      );
    }
    
    return null;
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="text-6xl">🌟</motion.div>
      </div>
    );
  }

  if (quizComplete) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center px-4">
        <Confetti recycle={false} numberOfPieces={500} />
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="card-brutal rounded-2xl bg-[#FFD500] text-center max-w-md w-full">
          <h1 className="text-4xl font-bold text-slate-900 font-kids">Quiz Complete!</h1>
          <div className="mt-6 flex items-center justify-center gap-2">
            <Star size={40} fill="#0A0B10" />
            <span className="text-5xl font-bold text-slate-900">{quizScore}/10</span>
          </div>
          <p className="mt-4 text-xl text-slate-700">
            {quizScore >= 8 ? "Amazing! You're a math genius! 🌟" : quizScore >= 5 ? "Great job! Keep practicing! 💪" : "Good try! Let's practice more! 🎯"}
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <button onClick={() => { setQuizComplete(false); setQuizNum(1); setQuizScore(0); fetchQuestion(child?.age_category); }} className="btn-brutal bg-slate-900 text-white py-3 rounded-xl" data-testid="play-again-button">Play Again</button>
            <button onClick={() => navigate(`/learn/${childId}`)} className="btn-brutal bg-white py-3 rounded-xl" data-testid="back-to-modules-button">Back to Modules</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      {showConfetti && <Confetti recycle={false} numberOfPieces={150} />}
      
      {/* Header */}
      <header className="bg-white border-b-4 border-slate-900">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/learn/${childId}`)}
            className="btn-brutal bg-[#0047FF] text-white p-3 rounded-xl"
            data-testid="back-button"
          >
            <ArrowLeft size={24} />
          </motion.button>
          
          <h1 className="text-xl font-bold text-slate-900 font-kids capitalize">
            {module === "quiz" ? "Quiz Time!" : module.replace("_", " ")}
          </h1>
          
          <div className="btn-brutal bg-[#FFD500] px-4 py-2 rounded-xl flex items-center gap-2" data-testid="stars-display">
            <Star size={20} fill="#0A0B10" />
            <span className="font-bold">{stars}</span>
          </div>
        </div>
      </header>

      {/* Mode Toggle for Addition */}
      {module === "addition" && (
        <div className="max-w-4xl mx-auto px-6 pt-6 flex justify-center gap-3">
          <button
            onClick={() => { setMode("addition"); fetchQuestion(child?.age_category); }}
            className={`btn-brutal px-6 py-2 rounded-xl ${mode === "addition" ? "bg-[#00E676]" : "bg-white"}`}
            data-testid="addition-mode-button"
          >
            <Plus size={20} /> Add
          </button>
          <button
            onClick={() => { setMode("subtraction"); fetchQuestion(child?.age_category); }}
            className={`btn-brutal px-6 py-2 rounded-xl ${mode === "subtraction" ? "bg-[#FF5252] text-white" : "bg-white"}`}
            data-testid="subtraction-mode-button"
          >
            <Minus size={20} /> Subtract
          </button>
        </div>
      )}

      {/* Quiz Progress */}
      {module === "quiz" && (
        <div className="max-w-4xl mx-auto px-6 pt-6">
          <div className="flex justify-between text-sm font-bold text-slate-600 mb-2">
            <span>Question {quizNum}</span>
            <span>{quizNum}/10</span>
          </div>
          <div className="h-3 bg-white border-2 border-slate-900 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(quizNum / 10) * 100}%` }}
              className="h-full bg-[#FFD500]"
            />
          </div>
        </div>
      )}

      {/* Question Card */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          key={question?.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="card-brutal rounded-2xl bg-white"
        >
          {module === "quiz" && question?.type && (
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{question.type}</div>
          )}
          
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 font-kids text-center">
            {question?.question}
          </h2>
          
          {renderVisual()}

          {/* Answer Options */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            {question?.options.map((option, index) => (
              <motion.button
                key={option}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={selected === null ? { scale: 1.05 } : {}}
                whileTap={selected === null ? { scale: 0.95 } : {}}
                onClick={() => handleAnswer(option)}
                disabled={selected !== null}
                className={`answer-btn ${
                  selected === option
                    ? isCorrect ? "answer-btn-correct" : "answer-btn-wrong"
                    : selected !== null && option === question.correct_answer
                      ? "bg-[#00E676]"
                      : "bg-[#FFD500]"
                }`}
                data-testid={`answer-option-${index}`}
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
              className={`mt-6 text-center text-2xl font-bold ${isCorrect ? "text-[#00E676]" : "text-[#FF5252]"}`}
            >
              {isCorrect ? "Amazing! ⭐" : "Try again! 💪"}
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Badge Celebration Modal */}
      {newBadge && (
        <BadgeCelebrationModal
          badge={newBadge}
          onClose={() => setNewBadge(null)}
        />
      )}
    </div>
  );
}
