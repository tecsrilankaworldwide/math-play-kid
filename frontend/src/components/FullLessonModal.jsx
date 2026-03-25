import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, BookOpen, Lightbulb, Star, CheckCircle } from "lucide-react";

// Render different content types
const ContentRenderer = ({ item }) => {
  switch (item.type) {
    case "text":
      return <p className="text-lg text-slate-700 leading-relaxed">{item.value}</p>;
    
    case "visual":
      if (item.layout === "row") {
        return (
          <div className="bg-white rounded-xl p-6 border-2 border-slate-200">
            <div className="flex justify-center gap-4 text-4xl flex-wrap">
              {item.items.map((emoji, i) => (
                <motion.span 
                  key={i} 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  transition={{ delay: i * 0.1 }}
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
            {item.caption && <p className="text-center mt-3 text-slate-600 font-medium">{item.caption}</p>}
          </div>
        );
      }
      if (item.layout === "grid") {
        return (
          <div className="bg-white rounded-xl p-6 border-2 border-slate-200">
            <div className="flex justify-center gap-3 flex-wrap max-w-xs mx-auto">
              {item.items.map((emoji, i) => (
                <span key={i} className="text-3xl">{emoji}</span>
              ))}
            </div>
            {item.caption && <p className="text-center mt-3 text-slate-600 font-medium">{item.caption}</p>}
          </div>
        );
      }
      if (item.layout === "addition") {
        return (
          <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="flex gap-1">{item.group1.map((e, i) => <span key={i} className="text-3xl">{e}</span>)}</div>
              <span className="text-3xl font-bold text-green-600">+</span>
              <div className="flex gap-1">{item.group2.map((e, i) => <span key={i} className="text-3xl">{e}</span>)}</div>
              <span className="text-3xl font-bold">=</span>
              <div className="flex gap-1">{item.result.map((e, i) => <span key={i} className="text-3xl">{e}</span>)}</div>
            </div>
            {item.caption && <p className="text-center mt-3 text-green-700 font-medium">{item.caption}</p>}
          </div>
        );
      }
      if (item.layout === "subtraction") {
        return (
          <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
            <div className="flex gap-2 justify-center flex-wrap">
              {item.start.map((e, i) => (
                <span key={i} className={`text-3xl ${i >= item.start.length - item.remove ? 'opacity-30 line-through' : ''}`}>{e}</span>
              ))}
            </div>
            {item.caption && <p className="text-center mt-3 text-red-700 font-medium">{item.caption}</p>}
          </div>
        );
      }
      if (item.layout === "groups") {
        return (
          <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
            <div className="flex flex-col gap-2 items-center">
              {item.groups.map((group, i) => (
                <div key={i} className="flex gap-1 bg-white px-3 py-1 rounded-lg">
                  {group.map((e, j) => <span key={j} className="text-2xl">{e}</span>)}
                </div>
              ))}
            </div>
            {item.caption && <p className="text-center mt-3 text-purple-700 font-medium">{item.caption}</p>}
          </div>
        );
      }
      if (item.layout === "square") {
        const size = item.size;
        return (
          <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
            <div className="flex flex-col gap-1 items-center">
              {Array.from({ length: size }).map((_, row) => (
                <div key={row} className="flex gap-1">
                  {Array.from({ length: size }).map((_, col) => (
                    <div key={col} className="w-6 h-6 bg-blue-400 rounded border border-blue-500"></div>
                  ))}
                </div>
              ))}
            </div>
            {item.caption && <p className="text-center mt-3 text-blue-700 font-medium">{item.caption}</p>}
          </div>
        );
      }
      return null;

    case "equation":
      return (
        <div className="bg-indigo-50 rounded-xl p-6 border-2 border-indigo-200">
          <div className="text-center">
            <span className="text-4xl font-mono font-bold text-indigo-700">{item.left}</span>
            <span className="text-4xl font-mono font-bold mx-3">=</span>
            <span className="text-4xl font-mono font-bold text-indigo-700">{item.right}</span>
          </div>
          {item.explanation && <p className="text-center mt-3 text-indigo-600">{item.explanation}</p>}
        </div>
      );

    case "tip":
      return (
        <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-300 flex items-start gap-3">
          <Lightbulb className="text-yellow-500 flex-shrink-0 mt-0.5" size={24} />
          <div>
            <span className="font-bold text-yellow-800">Tip: </span>
            <span className="text-slate-700">{item.value}</span>
          </div>
        </div>
      );

    case "remember":
      return (
        <div className="bg-pink-50 rounded-xl p-4 border-2 border-pink-300 flex items-start gap-3">
          <Star className="text-pink-500 flex-shrink-0 mt-0.5" size={24} fill="currentColor" />
          <div>
            <span className="font-bold text-pink-800">Remember: </span>
            <span className="text-slate-700">{item.value}</span>
          </div>
        </div>
      );

    case "funfact":
      return (
        <div className="bg-slate-100 rounded-xl p-4 border-2 border-slate-300">
          <span className="font-bold text-slate-700">🎉 Fun Fact: </span>
          <span className="text-slate-600">{item.value}</span>
        </div>
      );

    case "steps":
      return (
        <div className="bg-cyan-50 rounded-xl p-5 border-2 border-cyan-200">
          <h4 className="font-bold text-cyan-800 mb-3">{item.title}</h4>
          <div className="space-y-2">
            {item.items.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-cyan-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-slate-700 pt-0.5">{step}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case "example":
      return (
        <div className="bg-green-50 rounded-xl p-5 border-2 border-green-200">
          <h4 className="font-bold text-green-800 mb-2">Example: {item.problem}</h4>
          <p className="text-slate-700 bg-white p-3 rounded-lg">{item.solution}</p>
        </div>
      );

    case "table":
      return (
        <div className="bg-white rounded-xl p-4 border-2 border-slate-200">
          {item.title && <h4 className="font-bold text-slate-800 mb-3">{item.title}</h4>}
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {item.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} className="p-2 text-center font-mono bg-slate-50 border border-slate-200">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    case "comparison":
      return (
        <div className="bg-orange-50 rounded-xl p-5 border-2 border-orange-200">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-lg border border-red-200">
              <p className="text-sm text-red-600 font-bold mb-1">❌ Slow way:</p>
              <p className="font-mono text-lg">{item.slow}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-green-200">
              <p className="text-sm text-green-600 font-bold mb-1">✅ Fast way:</p>
              <p className="font-mono text-lg">{item.fast}</p>
            </div>
          </div>
          {item.caption && <p className="text-center mt-3 text-orange-700 font-medium">{item.caption}</p>}
        </div>
      );

    case "trick":
      return (
        <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
          <h4 className="font-bold text-purple-800 mb-2">{item.title}</h4>
          <ul className="space-y-1">
            {item.examples.map((ex, i) => (
              <li key={i} className="text-slate-700 font-mono text-sm bg-white px-3 py-1 rounded">{ex}</li>
            ))}
          </ul>
        </div>
      );

    case "timestable":
      return (
        <div className="bg-white rounded-xl p-4 border-2 border-slate-200 overflow-x-auto">
          <table className="w-full text-center text-sm">
            <thead>
              <tr>
                <th className="p-1 bg-slate-800 text-white">×</th>
                {Array.from({ length: item.size }, (_, i) => (
                  <th key={i} className="p-1 bg-slate-700 text-white">{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: item.size }, (_, row) => (
                <tr key={row}>
                  <td className="p-1 bg-slate-700 text-white font-bold">{row + 1}</td>
                  {Array.from({ length: item.size }, (_, col) => (
                    <td key={col} className="p-1 bg-slate-50 border border-slate-200">
                      {(row + 1) * (col + 1)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "array":
      return (
        <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
          <div className="flex flex-col gap-1 items-center">
            {Array.from({ length: item.rows }).map((_, row) => (
              <div key={row} className="flex gap-1">
                {Array.from({ length: item.cols }).map((_, col) => (
                  <span key={col} className="text-2xl">{item.emoji}</span>
                ))}
              </div>
            ))}
          </div>
          {item.caption && <p className="text-center mt-3 text-blue-700 font-medium">{item.caption}</p>}
        </div>
      );

    case "numberline":
      return (
        <div className="bg-white rounded-xl p-6 border-2 border-slate-200">
          <div className="flex items-center justify-between mb-2">
            {Array.from({ length: item.end - item.start + 1 }, (_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={`w-2 h-2 rounded-full ${i + item.start === item.jumps?.[0]?.from ? 'bg-green-500' : i + item.start === item.jumps?.[0]?.from + item.jumps?.[0]?.amount ? 'bg-blue-500' : 'bg-slate-400'}`}></div>
                <span className="text-xs mt-1">{i + item.start}</span>
              </div>
            ))}
          </div>
          <div className="h-1 bg-slate-300 rounded relative">
            {item.jumps?.map((jump, i) => (
              <div
                key={i}
                className={`absolute top-0 h-full ${jump.amount > 0 ? 'bg-green-400' : 'bg-red-400'} rounded`}
                style={{
                  left: `${((jump.from - item.start) / (item.end - item.start)) * 100}%`,
                  width: `${(Math.abs(jump.amount) / (item.end - item.start)) * 100}%`,
                }}
              ></div>
            ))}
          </div>
          {item.caption && <p className="text-center mt-3 text-slate-600 font-medium">{item.caption}</p>}
        </div>
      );

    case "wordproblem":
      return (
        <div className="bg-amber-50 rounded-xl p-5 border-2 border-amber-200">
          <p className="text-lg text-slate-800 mb-3">📖 {item.story}</p>
          {item.visual && (
            <div className="flex gap-1 flex-wrap mb-3">
              {item.visual.map((e, i) => <span key={i} className="text-2xl">{e}</span>)}
            </div>
          )}
          <div className="bg-white p-3 rounded-lg">
            <p className="font-mono text-lg">{item.equation}</p>
            <p className="text-green-600 font-bold mt-1">Answer: {item.answer}</p>
          </div>
        </div>
      );

    case "exponent-visual":
      return (
        <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200">
          <div className="text-center">
            <span className="text-5xl font-bold">{item.base}<sup className="text-2xl">{item.exponent}</sup></span>
            <span className="text-3xl mx-4">=</span>
            <span className="text-3xl font-mono">{item.expanded}</span>
            <span className="text-3xl mx-4">=</span>
            <span className="text-5xl font-bold text-orange-600">{item.result}</span>
          </div>
        </div>
      );

    case "examples-grid":
      return (
        <div className="grid md:grid-cols-2 gap-3">
          {item.items.map((ex, i) => (
            <div key={i} className="bg-white rounded-lg p-4 border-2 border-slate-200">
              {ex.exp && <p className="text-2xl font-mono font-bold text-indigo-600">{ex.exp}</p>}
              {ex.fraction && <p className="text-2xl font-mono font-bold text-indigo-600">{ex.fraction}</p>}
              {ex.percent && <p className="text-2xl font-mono font-bold text-pink-600">{ex.percent}</p>}
              {ex.read && <p className="text-sm text-slate-500">{ex.read}</p>}
              {ex.meaning && <p className="text-sm text-slate-500">{ex.meaning}</p>}
              {ex.calc && <p className="text-slate-700 font-mono text-sm">{ex.calc}</p>}
              {ex.example && <p className="text-slate-600">{ex.example}</p>}
              {ex.visual && <p className="text-lg">{ex.visual}</p>}
            </div>
          ))}
        </div>
      );

    case "powers-table":
      return (
        <div className="bg-white rounded-xl p-4 border-2 border-slate-200">
          <h4 className="font-bold text-slate-800 mb-2">{item.title}</h4>
          <div className="flex flex-wrap gap-2">
            {item.items.map((p, i) => (
              <span key={i} className="bg-slate-100 px-3 py-1 rounded font-mono text-sm">{p}</span>
            ))}
          </div>
        </div>
      );

    case "shapes-grid":
      return (
        <div className="grid md:grid-cols-2 gap-4">
          {item.items.map((shape, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border-2 border-slate-200 flex items-center gap-4">
              <span className="text-5xl">{shape.emoji}</span>
              <div>
                <h4 className="font-bold text-lg">{shape.shape}</h4>
                <p className="text-sm text-slate-600">{shape.description}</p>
                {shape.sides !== undefined && <p className="text-xs text-slate-500">{shape.sides} sides</p>}
              </div>
            </div>
          ))}
        </div>
      );

    case "reallife-shapes":
      return (
        <div className="space-y-3">
          {item.items.map((s, i) => (
            <div key={i} className="bg-white rounded-lg p-3 border-2 border-slate-200">
              <span className="font-bold text-indigo-600">{s.shape}: </span>
              <span className="text-slate-700">{s.examples}</span>
            </div>
          ))}
        </div>
      );

    case "perfect-squares-table":
      return (
        <div className="bg-white rounded-xl p-4 border-2 border-slate-200 overflow-x-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {item.items.map((sq, i) => (
              <div key={i} className="bg-slate-50 p-2 rounded border text-center">
                <p className="font-bold text-lg">√{sq.number} = {sq.root}</p>
                <p className="text-xs text-slate-500">{sq.because}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case "special-rules":
      return (
        <div className="space-y-2">
          {item.items.map((r, i) => (
            <div key={i} className="bg-white rounded-lg p-3 border-2 border-slate-200">
              <p className="text-slate-700">{r.rule}</p>
              <p className="font-mono text-indigo-600 mt-1">{r.example}</p>
            </div>
          ))}
        </div>
      );

    case "opposites":
      return (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-5 border-2 border-slate-200">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="bg-white p-3 rounded-lg text-center">
              <p className="text-green-600 font-bold text-sm">Forward →</p>
              <p className="font-mono text-lg">{item.forward}</p>
            </div>
            <span className="text-2xl">⟷</span>
            <div className="bg-white p-3 rounded-lg text-center">
              <p className="text-blue-600 font-bold text-sm">← Backward</p>
              <p className="font-mono text-lg">{item.backward}</p>
            </div>
          </div>
          {item.caption && <p className="text-center mt-3 text-slate-600">{item.caption}</p>}
        </div>
      );

    case "fraction-parts":
      return (
        <div className="bg-purple-50 rounded-xl p-5 border-2 border-purple-200">
          <div className="flex flex-col items-center gap-2">
            <div className="bg-purple-200 px-6 py-2 rounded-lg text-center">
              <p className="font-bold text-purple-800">{item.top.name}</p>
              <p className="text-sm text-purple-600">{item.top.meaning}</p>
            </div>
            <div className="w-32 h-1 bg-purple-400 rounded"></div>
            <div className="bg-purple-200 px-6 py-2 rounded-lg text-center">
              <p className="font-bold text-purple-800">{item.bottom.name}</p>
              <p className="text-sm text-purple-600">{item.bottom.meaning}</p>
            </div>
          </div>
        </div>
      );

    case "conversion-table":
      return (
        <div className="bg-white rounded-xl p-4 border-2 border-slate-200 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-2 text-left">Percent</th>
                <th className="p-2 text-left">Fraction</th>
                <th className="p-2 text-left">Decimal</th>
              </tr>
            </thead>
            <tbody>
              {item.items.map((row, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2 font-mono">{row.percent}</td>
                  <td className="p-2 font-mono">{row.fraction}</td>
                  <td className="p-2 font-mono">{row.decimal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "shortcut":
      return (
        <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
          <h4 className="font-bold text-green-800 mb-2">{item.title}</h4>
          <ul className="space-y-1">
            {item.items.map((s, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-slate-700">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      );

    case "opposites-table":
      return (
        <div className="bg-white rounded-xl p-4 border-2 border-slate-200">
          <div className="space-y-2">
            {item.pairs.map((pair, i) => (
              <div key={i} className="flex items-center gap-4 bg-slate-50 p-2 rounded">
                <span className="flex-1 text-right font-medium">{pair.operation}</span>
                <span className="text-2xl">⟷</span>
                <span className="flex-1 font-medium">{pair.opposite}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case "shape-formula":
      return (
        <div className="bg-teal-50 rounded-xl p-5 border-2 border-teal-200">
          <h4 className="font-bold text-teal-800 text-lg">{item.shape}</h4>
          <p className="font-mono text-xl mt-2 bg-white p-2 rounded">{item.formula}</p>
          <p className="text-slate-600 mt-2">{item.example}</p>
        </div>
      );

    default:
      return <p className="text-slate-500">Unknown content type: {item.type}</p>;
  }
};

export default function FullLessonModal({ lesson, onClose, onStartPractice }) {
  const [currentPage, setCurrentPage] = useState(0);
  
  if (!lesson) return null;

  const totalPages = lesson.pages.length;
  const page = lesson.pages[currentPage];

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl border-4 border-slate-900 flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-5 flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{lesson.emoji}</span>
              <div>
                <h2 className="text-xl font-bold">{lesson.title}</h2>
                <p className="text-indigo-100 text-sm">Page {currentPage + 1} of {totalPages}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white p-1">
              <X size={24} />
            </button>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="text-indigo-500" size={28} />
                {page.title}
              </h3>
              {page.content.map((item, i) => (
                <div key={i}>
                  <ContentRenderer item={item} />
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="p-5 bg-slate-50 border-t-2 border-slate-200 flex justify-between items-center flex-shrink-0">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold ${
              currentPage === 0 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <ChevronLeft size={20} /> Back
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`w-3 h-3 rounded-full ${i === currentPage ? 'bg-indigo-500' : 'bg-slate-300'}`}
              />
            ))}
          </div>

          {currentPage < totalPages - 1 ? (
            <button
              onClick={nextPage}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold bg-indigo-500 text-white hover:bg-indigo-600"
            >
              Next <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={onStartPractice}
              className="flex items-center gap-2 px-6 py-2 rounded-xl font-bold bg-green-500 text-white hover:bg-green-600"
            >
              Start Practice! <ChevronRight size={20} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
