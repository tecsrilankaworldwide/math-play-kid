import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, Check, ChevronLeft, ChevronRight, Trash2, RefreshCw, AlertCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const QUESTION_TYPE_COLORS = {
  counting: "#FFD500",
  numbers: "#0047FF",
  addition: "#00E676",
  subtraction: "#FF5252",
  multiplication: "#F78C6B",
  division: "#00BCD4",
  fractions: "#9B5DE5",
  percentages: "#E91E63",
  algebra: "#3F51B5",
  geometry: "#009688",
  exponents: "#FF5722",
  square_roots: "#795548",
  shapes: "#FF6B9D",
};

export default function MistakeReviewModal({ childId, onClose }) {
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  useEffect(() => {
    fetchMistakes();
  }, [childId]);

  const fetchMistakes = async () => {
    try {
      const res = await axios.get(`${API}/children/${childId}/mistakes`);
      setMistakes(res.data.mistakes || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load mistakes");
    }
    setLoading(false);
  };

  const handleAnswer = async (answer) => {
    setSelectedAnswer(answer);
    const currentMistake = mistakes[currentIndex];
    const isCorrect = answer === currentMistake.correct_answer;
    
    if (isCorrect) {
      toast.success("Correct! Great job!");
      // Mark as reviewed
      try {
        await axios.put(`${API}/children/${childId}/mistakes/${currentMistake.id}/review`);
      } catch (err) {
        console.error(err);
      }
    } else {
      setShowAnswer(true);
    }
    
    // Move to next after delay
    setTimeout(() => {
      if (currentIndex < mistakes.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowAnswer(false);
      }
    }, isCorrect ? 1500 : 2500);
  };

  const handleDelete = async (mistakeId) => {
    try {
      await axios.delete(`${API}/children/${childId}/mistakes/${mistakeId}`);
      setMistakes(prev => prev.filter(m => m.id !== mistakeId));
      toast.success("Removed from review list");
      if (currentIndex >= mistakes.length - 1 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const currentMistake = mistakes[currentIndex];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="text-4xl animate-spin">🔄</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden border-4 border-slate-900 shadow-2xl"
        data-testid="mistake-review-modal"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <BookOpen size={28} />
            <div>
              <h2 className="text-xl font-bold font-kids">Mistake Review</h2>
              <p className="text-sm text-orange-100">Learn from your errors!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            data-testid="close-review-modal"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mistakes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-slate-900 font-kids">All Clear!</h3>
              <p className="text-slate-600 mt-2">No mistakes to review. Keep up the great work!</p>
              <button
                onClick={onClose}
                className="mt-6 bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-colors"
              >
                Back to Learning
              </button>
            </motion.div>
          ) : (
            <>
              {/* Progress */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-slate-600">
                  Question {currentIndex + 1} of {mistakes.length}
                </span>
                <div className="flex gap-1">
                  {mistakes.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${i === currentIndex ? "bg-orange-500" : i < currentIndex ? "bg-green-500" : "bg-slate-200"}`}
                    />
                  ))}
                </div>
              </div>

              {/* Question Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMistake?.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="bg-slate-50 rounded-2xl p-6 border-2 border-slate-200"
                >
                  {/* Question Type Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold uppercase text-white"
                      style={{ backgroundColor: QUESTION_TYPE_COLORS[currentMistake?.question_type] || "#666" }}
                    >
                      {currentMistake?.question_type?.replace("_", " ")}
                    </span>
                    <button
                      onClick={() => handleDelete(currentMistake?.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      title="Remove from review"
                      data-testid="delete-mistake-button"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Question */}
                  <h3 className="text-2xl font-bold text-slate-900 font-kids text-center mb-6">
                    {currentMistake?.question_text}
                  </h3>

                  {/* Your Previous Answer */}
                  <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl">
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle size={18} />
                      <span className="text-sm font-semibold">Your previous answer:</span>
                      <span className="font-bold">{currentMistake?.user_answer}</span>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-2 gap-3">
                    {currentMistake?.options?.map((option, i) => {
                      const isCorrect = option === currentMistake.correct_answer;
                      const isSelected = selectedAnswer === option;
                      
                      let bgClass = "bg-white hover:bg-slate-100";
                      if (showAnswer && isCorrect) {
                        bgClass = "bg-green-500 text-white";
                      } else if (isSelected) {
                        bgClass = isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white";
                      }
                      
                      return (
                        <motion.button
                          key={option}
                          whileHover={!selectedAnswer ? { scale: 1.02 } : {}}
                          whileTap={!selectedAnswer ? { scale: 0.98 } : {}}
                          onClick={() => !selectedAnswer && handleAnswer(option)}
                          disabled={selectedAnswer !== null}
                          className={`p-4 rounded-xl font-bold text-lg border-2 border-slate-200 transition-all ${bgClass}`}
                          data-testid={`review-option-${i}`}
                        >
                          {option}
                          {showAnswer && isCorrect && (
                            <Check size={20} className="inline ml-2" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Explanation when showing answer */}
                  {showAnswer && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl"
                    >
                      <div className="flex items-center gap-2 text-green-700 font-semibold">
                        <Check size={20} />
                        <span>The correct answer is: {currentMistake.correct_answer}</span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => {
                    setCurrentIndex(prev => Math.max(0, prev - 1));
                    setSelectedAnswer(null);
                    setShowAnswer(false);
                  }}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  data-testid="prev-mistake-button"
                >
                  <ChevronLeft size={20} /> Previous
                </button>
                
                <button
                  onClick={() => {
                    fetchMistakes();
                    setCurrentIndex(0);
                    setSelectedAnswer(null);
                    setShowAnswer(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-700 transition-colors"
                  data-testid="refresh-mistakes-button"
                >
                  <RefreshCw size={18} /> Refresh
                </button>

                <button
                  onClick={() => {
                    setCurrentIndex(prev => Math.min(mistakes.length - 1, prev + 1));
                    setSelectedAnswer(null);
                    setShowAnswer(false);
                  }}
                  disabled={currentIndex === mistakes.length - 1}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  data-testid="next-mistake-button"
                >
                  Next <ChevronRight size={20} />
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
