import { motion } from "framer-motion";
import { X, Lightbulb, BookOpen, Star, ArrowRight } from "lucide-react";

export default function MiniLessonModal({ lesson, onClose, onStartPractice }) {
  if (!lesson) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl max-w-2xl w-full my-8 overflow-hidden shadow-2xl border-4 border-slate-900"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <span className="text-5xl">{lesson.emoji}</span>
              <div>
                <h2 className="text-2xl font-bold font-kids">{lesson.title}</h2>
                <p className="text-indigo-100 text-sm mt-1">Quick Lesson</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Main Explanation */}
          <div className="bg-blue-50 rounded-2xl p-5 border-2 border-blue-200">
            <div className="flex items-start gap-3">
              <BookOpen className="text-blue-500 mt-1 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-bold text-slate-800 mb-2">What is it?</h3>
                <p className="text-slate-700 text-lg leading-relaxed">
                  {lesson.explanation}
                </p>
              </div>
            </div>
          </div>

          {/* Example */}
          {lesson.example && (
            <div className="bg-green-50 rounded-2xl p-5 border-2 border-green-200">
              <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                <Star className="text-green-500" size={20} />
                Example
              </h3>
              {lesson.example.visual && (
                <div className="bg-white rounded-xl p-4 mb-3 text-center text-2xl font-mono border-2 border-green-100">
                  {lesson.example.visual}
                </div>
              )}
              <p className="text-slate-700">{lesson.example.text}</p>
            </div>
          )}

          {/* More Examples (for exponents, square roots) */}
          {lesson.moreExamples && (
            <div className="bg-purple-50 rounded-2xl p-5 border-2 border-purple-200">
              <h3 className="font-bold text-purple-800 mb-3">More Examples:</h3>
              <div className="grid gap-2">
                {lesson.moreExamples.map((ex, i) => (
                  <div key={i} className="bg-white rounded-lg px-4 py-2 font-mono text-slate-700 border border-purple-100">
                    {ex}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Perfect Squares (for square roots) */}
          {lesson.perfectSquares && (
            <div className="bg-orange-50 rounded-2xl p-5 border-2 border-orange-200">
              <h3 className="font-bold text-orange-800 mb-3">Memorize These:</h3>
              <div className="grid grid-cols-2 gap-2">
                {lesson.perfectSquares.map((sq, i) => (
                  <div key={i} className="bg-white rounded-lg px-3 py-2 font-mono text-sm text-slate-700 border border-orange-100">
                    {sq}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Convert (for percentages) */}
          {lesson.quickConvert && (
            <div className="bg-pink-50 rounded-2xl p-5 border-2 border-pink-200">
              <h3 className="font-bold text-pink-800 mb-3">Quick Conversions:</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(lesson.quickConvert).map(([percent, value], i) => (
                  <div key={i} className="bg-white rounded-lg px-3 py-2 text-slate-700 border border-pink-100">
                    <span className="font-bold text-pink-600">{percent}</span> {value}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Steps (for algebra) */}
          {lesson.steps && (
            <div className="bg-cyan-50 rounded-2xl p-5 border-2 border-cyan-200">
              <h3 className="font-bold text-cyan-800 mb-3">Steps to Solve:</h3>
              <div className="space-y-2">
                {lesson.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white rounded-lg px-4 py-2 border border-cyan-100">
                    <span className="w-7 h-7 rounded-full bg-cyan-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-slate-700">{step.replace(/^\d+\.\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Geometry Concepts */}
          {lesson.concepts && (
            <div className="space-y-3">
              {Object.entries(lesson.concepts).map(([key, concept]) => (
                <div key={key} className="bg-teal-50 rounded-2xl p-4 border-2 border-teal-200">
                  <h4 className="font-bold text-teal-800">{concept.title}</h4>
                  <p className="text-teal-600 font-mono mt-1">{concept.formula}</p>
                  <p className="text-slate-600 text-sm mt-2">{concept.example}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tip */}
          {lesson.tip && (
            <div className="bg-yellow-50 rounded-2xl p-4 border-2 border-yellow-300 flex items-start gap-3">
              <Lightbulb className="text-yellow-500 flex-shrink-0 mt-0.5" size={24} />
              <div>
                <h3 className="font-bold text-yellow-800">Pro Tip!</h3>
                <p className="text-slate-700">{lesson.tip}</p>
              </div>
            </div>
          )}

          {/* Fun Fact */}
          {lesson.funFact && (
            <div className="bg-slate-100 rounded-2xl p-4 border-2 border-slate-200">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                🎉 Fun Fact!
              </h3>
              <p className="text-slate-600 mt-1">{lesson.funFact}</p>
            </div>
          )}
        </div>

        {/* Footer - Start Practice Button */}
        <div className="p-6 bg-slate-50 border-t-2 border-slate-200">
          <button
            onClick={onStartPractice}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
          >
            Start Practice! <ArrowRight size={24} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
