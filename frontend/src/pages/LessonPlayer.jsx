import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import Confetti from "react-confetti";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Star, Trophy, ChevronRight } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function LessonPlayer() {
  const { childId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [child, setChild] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [score, setScore] = useState(0);
  const [lessonComplete, setLessonComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    } else if (user) {
      fetchData();
    }
  }, [user, authLoading, navigate, childId, lessonId]);

  const fetchData = async () => {
    try {
      const [childRes, lessonRes] = await Promise.all([
        axios.get(`${API}/children/${childId}`),
        axios.get(`${API}/lessons/${childId}`).then(res => res.data.find(l => l.id === lessonId))
      ]);
      
      setChild(childRes.data);
      
      if (!lessonRes) {
        navigate(`/learn/${childId}`);
        return;
      }
      
      // Check access
      if (!childRes.data.subscription_active && !lessonRes.is_free) {
        navigate("/dashboard");
        return;
      }
      
      setLesson(lessonRes);
    } catch (e) {
      navigate(`/learn/${childId}`);
    }
    setLoading(false);
  };

  const currentQuestion = lesson?.content?.questions?.[currentIndex];

  const handleAnswer = async (answer) => {
    if (selected !== null) return;
    setSelected(answer);
    
    const correct = answer === currentQuestion.correct_answer;
    setIsCorrect(correct);
    
    if (correct) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      setScore(prev => prev + 1);
      
      try {
        await axios.put(`${API}/children/${childId}/progress?module=${lesson.module_type}&stars=1`);
      } catch (e) {
        console.error(e);
      }
    }

    setTimeout(() => {
      if (currentIndex + 1 >= lesson.content.questions.length) {
        setLessonComplete(true);
      } else {
        setCurrentIndex(prev => prev + 1);
        setSelected(null);
        setIsCorrect(null);
      }
    }, correct ? 1500 : 1000);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="text-6xl">📚</motion.div>
      </div>
    );
  }

  if (lessonComplete) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center px-4">
        <Confetti recycle={false} numberOfPieces={500} />
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="card-brutal rounded-2xl bg-[#FFD500] text-center max-w-md w-full">
          <Trophy size={64} className="mx-auto text-slate-900" />
          <h1 className="mt-4 text-3xl font-bold text-slate-900 font-kids">Lesson Complete!</h1>
          <p className="mt-2 text-xl text-slate-700">{lesson.title}</p>
          
          <div className="mt-6 flex items-center justify-center gap-2">
            <Star size={32} fill="#0A0B10" />
            <span className="text-4xl font-bold text-slate-900">{score}/{lesson.content.questions.length}</span>
          </div>
          
          <p className="mt-4 text-lg text-slate-700">
            {score === lesson.content.questions.length ? "Perfect! You're amazing! 🌟" :
             score >= lesson.content.questions.length / 2 ? "Great job! Keep learning! 💪" :
             "Good try! Practice more! 🎯"}
          </p>
          
          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => { setLessonComplete(false); setCurrentIndex(0); setScore(0); setSelected(null); setIsCorrect(null); }}
              className="btn-brutal bg-slate-900 text-white py-3 rounded-xl"
              data-testid="retry-lesson-button"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate(`/learn/${childId}`)}
              className="btn-brutal bg-white py-3 rounded-xl"
              data-testid="back-to-learn-button"
            >
              Back to Lessons
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center">
        <div className="text-xl text-slate-600">No questions in this lesson</div>
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
          
          <h1 className="text-lg font-bold text-slate-900 font-kids truncate max-w-[200px]">
            {lesson?.title}
          </h1>
          
          <div className="btn-brutal bg-[#FFD500] px-4 py-2 rounded-xl flex items-center gap-2">
            <Star size={20} fill="#0A0B10" />
            <span className="font-bold">{score}</span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-6 pt-6">
        <div className="flex justify-between text-sm font-bold text-slate-600 mb-2">
          <span>Question {currentIndex + 1}</span>
          <span>{currentIndex + 1}/{lesson.content.questions.length}</span>
        </div>
        <div className="h-3 bg-white border-2 border-slate-900 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / lesson.content.questions.length) * 100}%` }}
            className="h-full bg-[#00E676]"
          />
        </div>
      </div>

      {/* Question Card */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="card-brutal rounded-2xl bg-white"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 font-kids text-center">
            {currentQuestion.question}
          </h2>
          
          {/* Visual Hint */}
          {currentQuestion.visual_hint && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center py-6 text-5xl md:text-6xl"
            >
              {currentQuestion.visual_hint}
            </motion.div>
          )}

          {/* Answer Options */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            {currentQuestion.options.map((option, index) => (
              <motion.button
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={selected === null ? { scale: 1.05 } : {}}
                whileTap={selected === null ? { scale: 0.95 } : {}}
                onClick={() => handleAnswer(option)}
                disabled={selected !== null}
                className={`answer-btn ${
                  selected === option
                    ? isCorrect ? "answer-btn-correct" : "answer-btn-wrong"
                    : selected !== null && option === currentQuestion.correct_answer
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
              {isCorrect ? "Correct! ⭐" : "Oops! Try the next one! 💪"}
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
