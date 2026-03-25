import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Trophy, AlertTriangle, ChevronRight, RotateCcw, Zap, Target, Award } from "lucide-react";
import { getExamQuestions, TIME_LIMITS } from "../data/examQuestions";

export default function TimedExamModal({ ageCategory, onClose, childName }) {
  const [stage, setStage] = useState("select"); // select, ready, exam, results
  const [difficulty, setDifficulty] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(0);
  const [examStartTime, setExamStartTime] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [timeTaken, setTimeTaken] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswer, setLastAnswer] = useState(null);

  // Start the exam
  const startExam = (diff) => {
    setDifficulty(diff);
    const examQs = getExamQuestions(ageCategory, diff, 10);
    setQuestions(examQs);
    setAnswers([]);
    setTimeTaken([]);
    setCurrentQ(0);
    setTimeLeft(TIME_LIMITS[diff].examTotal);
    setQuestionTimeLeft(TIME_LIMITS[diff].perQuestion);
    setStage("ready");
  };

  // Begin after countdown
  const beginExam = () => {
    setStage("exam");
    setExamStartTime(Date.now());
    setQuestionStartTime(Date.now());
  };

  // Timer effect
  useEffect(() => {
    if (stage !== "exam") return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up - end exam
          clearInterval(timer);
          setStage("results");
          return 0;
        }
        return prev - 1;
      });
      
      setQuestionTimeLeft(prev => {
        if (prev <= 1) {
          // Question timeout - auto skip
          handleAnswer(null, true);
          return TIME_LIMITS[difficulty].perQuestion;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [stage, difficulty]);

  // Handle answer selection
  const handleAnswer = useCallback((answer, timeout = false) => {
    if (showFeedback) return;
    
    const qTime = Date.now() - questionStartTime;
    const correct = answer === questions[currentQ]?.answer;
    
    setLastAnswer({ answer, correct, timeout });
    setShowFeedback(true);
    setTimeTaken(prev => [...prev, qTime]);
    setAnswers(prev => [...prev, { answer, correct, timeout, time: qTime }]);
    
    // Brief feedback then move on
    setTimeout(() => {
      setShowFeedback(false);
      if (currentQ < questions.length - 1) {
        setCurrentQ(prev => prev + 1);
        setQuestionTimeLeft(TIME_LIMITS[difficulty].perQuestion);
        setQuestionStartTime(Date.now());
      } else {
        setStage("results");
      }
    }, 800);
  }, [currentQ, questions, questionStartTime, showFeedback, difficulty]);

  // Calculate results
  const getResults = () => {
    const correct = answers.filter(a => a.correct).length;
    const total = questions.length;
    const percentage = Math.round((correct / total) * 100);
    const avgTime = timeTaken.length > 0 
      ? Math.round(timeTaken.reduce((a, b) => a + b, 0) / timeTaken.length / 1000) 
      : 0;
    const totalTime = Math.round((Date.now() - examStartTime) / 1000);
    const timeouts = answers.filter(a => a.timeout).length;
    
    let grade = "F";
    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B";
    else if (percentage >= 60) grade = "C";
    else if (percentage >= 50) grade = "D";
    
    let speedRating = "Needs Practice";
    if (difficulty === "easy" && avgTime <= 15) speedRating = "Lightning Fast! ⚡";
    else if (difficulty === "easy" && avgTime <= 20) speedRating = "Very Fast! 🚀";
    else if (difficulty === "easy" && avgTime <= 25) speedRating = "Good Speed 👍";
    else if (difficulty === "medium" && avgTime <= 25) speedRating = "Lightning Fast! ⚡";
    else if (difficulty === "medium" && avgTime <= 35) speedRating = "Very Fast! 🚀";
    else if (difficulty === "hard" && avgTime <= 35) speedRating = "Lightning Fast! ⚡";
    else if (difficulty === "hard" && avgTime <= 45) speedRating = "Very Fast! 🚀";
    else if (avgTime <= 40) speedRating = "Good Speed 👍";
    
    return { correct, total, percentage, avgTime, totalTime, timeouts, grade, speedRating };
  };

  // Format time MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Difficulty selection screen
  if (stage === "select") {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border-4 border-slate-900"
        >
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">⏱️ Timed Exam Practice</h2>
                <p className="text-orange-100 mt-1">Test your speed and accuracy!</p>
              </div>
              <button onClick={onClose} className="text-white/80 hover:text-white">
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-slate-600 text-center">
              Choose your challenge level, {childName}:
            </p>

            <div className="space-y-3">
              <button
                onClick={() => startExam("easy")}
                className="w-full p-4 rounded-2xl border-3 border-green-300 bg-green-50 hover:bg-green-100 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                    <Target size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-green-800">Easy Mode</h3>
                    <p className="text-sm text-green-600">30 seconds per question • 5 min total</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => startExam("medium")}
                className="w-full p-4 rounded-2xl border-3 border-yellow-300 bg-yellow-50 hover:bg-yellow-100 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center">
                    <Zap size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-yellow-800">Medium Mode</h3>
                    <p className="text-sm text-yellow-600">45 seconds per question • 7.5 min total</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => startExam("hard")}
                className="w-full p-4 rounded-2xl border-3 border-red-300 bg-red-50 hover:bg-red-100 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                    <Award size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-red-800">Hard Mode</h3>
                    <p className="text-sm text-red-600">60 seconds per question • 10 min total</p>
                  </div>
                </div>
              </button>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>💡 Tip:</strong> Practice makes perfect! Start with Easy mode to build speed, then challenge yourself with harder levels.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Ready countdown screen
  if (stage === "ready") {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl border-4 border-slate-900"
        >
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Ready, {childName}?</h2>
          <p className="text-slate-600 mb-6">
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Mode • {questions.length} Questions
          </p>
          
          <div className="bg-slate-100 rounded-xl p-4 mb-6">
            <p className="text-sm text-slate-600">
              <Clock className="inline mr-2" size={16} />
              {TIME_LIMITS[difficulty].perQuestion} seconds per question
            </p>
            <p className="text-sm text-slate-600 mt-1">
              ⏱️ {formatTime(TIME_LIMITS[difficulty].examTotal)} total time
            </p>
          </div>

          <button
            onClick={beginExam}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
          >
            Start Exam! 🚀
          </button>
        </motion.div>
      </div>
    );
  }

  // Main exam screen
  if (stage === "exam" && questions[currentQ]) {
    const q = questions[currentQ];
    const timeWarning = questionTimeLeft <= 10;
    const timeCritical = questionTimeLeft <= 5;
    const elapsedTime = Math.round((Date.now() - questionStartTime) / 1000);
    
    return (
      <div className="fixed inset-0 bg-slate-900 flex flex-col z-50">
        {/* Top bar */}
        <div className="bg-slate-800 px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-white font-bold">Q{currentQ + 1}/{questions.length}</span>
            <div className="flex gap-1">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < currentQ
                      ? answers[i]?.correct ? 'bg-green-500' : 'bg-red-500'
                      : i === currentQ ? 'bg-yellow-400' : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Elapsed stopwatch for current question */}
            <div className="flex items-center gap-2 bg-blue-600 px-3 py-1 rounded-lg">
              <Zap size={16} className="text-white" />
              <span className="text-white font-mono font-bold">{elapsedTime}s</span>
            </div>
            {/* Countdown timer */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${timeCritical ? 'bg-red-500 animate-pulse' : timeWarning ? 'bg-yellow-500' : 'bg-slate-700'}`}>
              <Clock size={16} className="text-white" />
              <span className="text-white font-mono font-bold">{questionTimeLeft}s left</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-700 px-3 py-1 rounded-lg">
              <span className="text-slate-300 text-sm">Total:</span>
              <span className="text-white font-mono">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* Question timer bar */}
        <div className="h-1 bg-slate-700">
          <motion.div
            className={`h-full ${timeCritical ? 'bg-red-500' : timeWarning ? 'bg-yellow-400' : 'bg-green-400'}`}
            initial={{ width: '100%' }}
            animate={{ width: `${(questionTimeLeft / TIME_LIMITS[difficulty].perQuestion) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Question area */}
        <div className="flex-1 flex items-center justify-center p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-2xl w-full"
            >
              <div className="bg-white rounded-3xl p-8 shadow-2xl border-4 border-slate-300">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-8">
                  {q.q}
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  {q.options.map((option, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(option)}
                      disabled={showFeedback}
                      className={`p-4 text-lg font-bold rounded-xl border-3 transition-all ${
                        showFeedback
                          ? option === q.answer
                            ? 'bg-green-500 border-green-600 text-white'
                            : option === lastAnswer?.answer && !lastAnswer?.correct
                              ? 'bg-red-500 border-red-600 text-white'
                              : 'bg-slate-100 border-slate-200 text-slate-400'
                          : 'bg-slate-100 border-slate-300 text-slate-900 hover:bg-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>

                {showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-6 text-center ${lastAnswer?.correct ? 'text-green-600' : 'text-red-600'}`}
                  >
                    <div className="text-xl font-bold">
                      {lastAnswer?.timeout ? "⏰ Time's up!" : lastAnswer?.correct ? "✓ Correct!" : "✗ Wrong!"}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      Time taken: {Math.round((Date.now() - questionStartTime) / 1000)}s
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Results screen
  if (stage === "results") {
    const results = getResults();
    
    // Sort questions by time taken to identify slowest ones
    const questionAnalysis = answers.map((a, i) => ({
      questionNum: i + 1,
      question: questions[i]?.q || "",
      timeTaken: a.time,
      correct: a.correct,
      timeout: a.timeout
    })).sort((a, b) => b.timeTaken - a.timeTaken);
    
    const slowestQuestions = questionAnalysis.slice(0, 3);
    const fastestQuestions = [...questionAnalysis].sort((a, b) => a.timeTaken - b.timeTaken).slice(0, 3);
    
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border-4 border-slate-900 my-8"
        >
          <div className={`p-6 text-white ${results.percentage >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : results.percentage >= 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-red-500 to-pink-500'}`}>
            <div className="text-center">
              <div className="text-6xl mb-2">
                {results.percentage >= 80 ? '🏆' : results.percentage >= 60 ? '⭐' : results.percentage >= 40 ? '💪' : '📚'}
              </div>
              <h2 className="text-2xl font-bold">Exam Complete!</h2>
              <p className="opacity-90">Great effort, {childName}!</p>
            </div>
          </div>

          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Score */}
            <div className="text-center">
              <div className="text-6xl font-bold text-slate-900">{results.percentage}%</div>
              <div className="text-2xl font-bold text-indigo-600">Grade: {results.grade}</div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-xl p-4 text-center border-2 border-green-200">
                <div className="text-2xl font-bold text-green-700">{results.correct}/{results.total}</div>
                <div className="text-sm text-green-600">Correct</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center border-2 border-blue-200">
                <div className="text-2xl font-bold text-blue-700">{results.avgTime}s</div>
                <div className="text-sm text-blue-600">Avg per Q</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center border-2 border-purple-200">
                <div className="text-2xl font-bold text-purple-700">{formatTime(results.totalTime)}</div>
                <div className="text-sm text-purple-600">Total Time</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 text-center border-2 border-orange-200">
                <div className="text-2xl font-bold text-orange-700">{results.timeouts}</div>
                <div className="text-sm text-orange-600">Timeouts</div>
              </div>
            </div>

            {/* Speed Rating */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 text-center border-2 border-indigo-200">
              <div className="text-lg font-bold text-indigo-800">{results.speedRating}</div>
              <div className="text-sm text-indigo-600">Speed Rating</div>
            </div>

            {/* ===== DETAILED TIME ANALYSIS ===== */}
            <div className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Clock size={20} className="text-slate-600" />
                ⏱️ Time Analysis (Per Question)
              </h4>
              
              {/* Time breakdown for each question */}
              <div className="space-y-2 mb-4">
                {answers.map((a, i) => {
                  const timeInSec = Math.round(a.time / 1000);
                  const maxTime = TIME_LIMITS[difficulty].perQuestion;
                  const percentUsed = Math.min((timeInSec / maxTime) * 100, 100);
                  const isSlow = timeInSec > maxTime * 0.7;
                  const isFast = timeInSec < maxTime * 0.3;
                  
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-8 text-xs font-bold text-slate-500">Q{i + 1}</span>
                      <div className="flex-1 h-6 bg-slate-200 rounded-full overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentUsed}%` }}
                          transition={{ delay: i * 0.1, duration: 0.5 }}
                          className={`h-full rounded-full ${
                            a.timeout ? 'bg-red-400' :
                            a.correct ? (isFast ? 'bg-green-400' : isSlow ? 'bg-yellow-400' : 'bg-blue-400') :
                            'bg-red-400'
                          }`}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
                          {timeInSec}s {a.correct ? '✓' : '✗'} {a.timeout ? '⏰' : ''}
                        </span>
                      </div>
                      <span className={`w-12 text-xs font-bold ${isFast ? 'text-green-600' : isSlow ? 'text-orange-600' : 'text-slate-600'}`}>
                        {isFast ? '🚀' : isSlow ? '🐢' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 text-xs border-t pt-3">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-400 rounded"></span> Fast</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-400 rounded"></span> Good</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-400 rounded"></span> Slow</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-400 rounded"></span> Wrong/Timeout</span>
              </div>
            </div>

            {/* Slowest Questions Analysis */}
            {slowestQuestions.length > 0 && (
              <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
                <h4 className="font-bold text-orange-800 mb-2">🐢 Slowest Questions (Need Practice)</h4>
                <div className="space-y-2">
                  {slowestQuestions.map((q, i) => (
                    <div key={i} className="bg-white rounded-lg p-2 text-sm flex justify-between items-center">
                      <span className="text-slate-700 truncate flex-1">Q{q.questionNum}: {q.question.substring(0, 40)}...</span>
                      <span className={`font-bold ml-2 ${q.correct ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.round(q.timeTaken / 1000)}s {q.correct ? '✓' : '✗'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fastest Questions */}
            {fastestQuestions.filter(q => q.correct).length > 0 && (
              <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                <h4 className="font-bold text-green-800 mb-2">🚀 Fastest Correct Answers (Great Job!)</h4>
                <div className="space-y-2">
                  {fastestQuestions.filter(q => q.correct).slice(0, 3).map((q, i) => (
                    <div key={i} className="bg-white rounded-lg p-2 text-sm flex justify-between items-center">
                      <span className="text-slate-700 truncate flex-1">Q{q.questionNum}: {q.question.substring(0, 40)}...</span>
                      <span className="font-bold text-green-600 ml-2">{Math.round(q.timeTaken / 1000)}s ⚡</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Stats for Parents */}
            <div className="bg-indigo-50 rounded-xl p-4 border-2 border-indigo-200">
              <h4 className="font-bold text-indigo-800 mb-2">📊 Summary for Parents</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-white rounded-lg p-2">
                  <span className="text-slate-500">Total Time:</span>
                  <span className="font-bold text-slate-800 ml-2">{formatTime(results.totalTime)}</span>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <span className="text-slate-500">Avg/Question:</span>
                  <span className="font-bold text-slate-800 ml-2">{results.avgTime}s</span>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <span className="text-slate-500">Target Time:</span>
                  <span className="font-bold text-slate-800 ml-2">{TIME_LIMITS[difficulty].perQuestion}s/Q</span>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <span className="text-slate-500">Time Status:</span>
                  <span className={`font-bold ml-2 ${results.avgTime <= TIME_LIMITS[difficulty].perQuestion * 0.5 ? 'text-green-600' : results.avgTime <= TIME_LIMITS[difficulty].perQuestion ? 'text-blue-600' : 'text-orange-600'}`}>
                    {results.avgTime <= TIME_LIMITS[difficulty].perQuestion * 0.5 ? 'Excellent!' : results.avgTime <= TIME_LIMITS[difficulty].perQuestion ? 'On Track' : 'Needs Work'}
                  </span>
                </div>
              </div>
              
              {/* Recommendation */}
              <div className="mt-3 p-2 bg-white rounded-lg">
                <span className="text-sm text-slate-600">
                  {results.avgTime > TIME_LIMITS[difficulty].perQuestion ? 
                    `💡 Recommendation: Practice more to get average below ${TIME_LIMITS[difficulty].perQuestion}s per question.` :
                    results.percentage < 70 ?
                    "💡 Recommendation: Speed is good! Focus on accuracy now." :
                    results.avgTime > TIME_LIMITS[difficulty].perQuestion * 0.5 ?
                    "💡 Recommendation: Good balance! Try Medium mode for more challenge." :
                    "💡 Recommendation: Excellent! Ready for harder difficulty level! 🌟"
                  }
                </span>
              </div>
            </div>

            {/* Tips based on performance */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-2">💡 Tips to Improve:</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                {results.timeouts > 2 && (
                  <li>• Practice more to increase your speed</li>
                )}
                {results.percentage < 70 && (
                  <li>• Review the lessons before trying again</li>
                )}
                {results.avgTime > TIME_LIMITS[difficulty].perQuestion * 0.8 && (
                  <li>• Try to recognize patterns faster - don't calculate everything</li>
                )}
                {slowestQuestions[0]?.timeTaken > TIME_LIMITS[difficulty].perQuestion * 1000 && (
                  <li>• Focus on topics that took longest: {slowestQuestions[0]?.question.split(':')[0] || 'Review'}</li>
                )}
                {results.percentage >= 80 && results.avgTime < TIME_LIMITS[difficulty].perQuestion * 0.5 && (
                  <li>• Excellent! Try a harder difficulty!</li>
                )}
                {results.percentage >= 90 && (
                  <li>• Amazing work! You're a math star! ⭐</li>
                )}
              </ul>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setStage("select")}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} /> Try Again
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                Done <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
