import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Star, Sparkles, Hash, Plus, Shapes, Trophy, BookOpen, Play, Clock, Zap } from "lucide-react";
import FullLessonModal from "../components/FullLessonModal";
import TimedExamModal from "../components/TimedExamModal";
import { getLessonById } from "../data/fullLessons";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BASE_MODULES = [
  // Ages 5-7: Basic concepts
  { id: "counting", name: "Counting", icon: Sparkles, color: "#FFD500", desc: "Count objects", minAge: 5, maxAge: 7 },
  { id: "numbers", name: "Numbers", icon: Hash, color: "#0047FF", desc: "Number recognition", minAge: 5, maxAge: 7 },
  { id: "shapes", name: "Shapes", icon: Shapes, color: "#FF6B9D", desc: "Learn shapes", minAge: 5, maxAge: 8 },
  
  // All ages: Core arithmetic
  { id: "addition", name: "Add & Subtract", icon: Plus, color: "#00E676", desc: "Addition & Subtraction", minAge: 5, maxAge: 99 },
  
  // Ages 8+: Multiplication & Division
  { id: "multiplication", name: "Multiply", icon: Sparkles, color: "#F78C6B", desc: "Times tables", minAge: 8, maxAge: 99 },
  { id: "division", name: "Divide", icon: Hash, color: "#00BCD4", desc: "Division practice", minAge: 9, maxAge: 99 },
  
  // Ages 10+: Fractions & Percentages
  { id: "fractions", name: "Fractions", icon: Shapes, color: "#9B5DE5", desc: "Fraction operations", minAge: 10, maxAge: 99 },
  { id: "percentages", name: "Percentages", icon: Hash, color: "#E91E63", desc: "Calculate percentages", minAge: 11, maxAge: 99 },
  
  // Ages 12+: Pre-Algebra & Geometry
  { id: "algebra", name: "Algebra", icon: Plus, color: "#3F51B5", desc: "Solve for x", minAge: 12, maxAge: 99 },
  { id: "geometry", name: "Geometry", icon: Shapes, color: "#009688", desc: "Area & perimeter", minAge: 12, maxAge: 99 },
  
  // Ages 13+: Advanced
  { id: "exponents", name: "Exponents", icon: Sparkles, color: "#FF5722", desc: "Powers & exponents", minAge: 13, maxAge: 99 },
  { id: "square_roots", name: "Square Roots", icon: Hash, color: "#795548", desc: "Calculate roots", minAge: 13, maxAge: 99 },
  
  // Quiz for all
  { id: "quiz", name: "Quiz Time!", icon: Trophy, color: "#9B5DE5", desc: "Test your skills", minAge: 5, maxAge: 99 },
];

// Filter modules based on child's age
const getModulesForAge = (age) => {
  return BASE_MODULES.filter(m => age >= m.minAge && age <= m.maxAge);
};

const LESSON_COLORS = ["#FFD500", "#00E676", "#0047FF", "#FF6B9D", "#9B5DE5", "#F78C6B"];

export default function LearnPage() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [child, setChild] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLesson, setShowLesson] = useState(null); // For full lesson modal
  const [selectedModule, setSelectedModule] = useState(null);
  const [showTimedExam, setShowTimedExam] = useState(false); // For timed exam modal

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    } else if (user) {
      fetchData();
    }
  }, [user, authLoading, navigate, childId]);

  const fetchData = async () => {
    try {
      const [childRes, lessonsRes] = await Promise.all([
        axios.get(`${API}/children/${childId}`),
        axios.get(`${API}/lessons/${childId}`)
      ]);
      
      setChild(childRes.data);
      
      // Check subscription - allow free lessons
      if (!childRes.data.subscription_active) {
        // Only get free lessons
        const freeLessons = lessonsRes.data.filter(l => l.is_free);
        setLessons(freeLessons);
      } else {
        setLessons(lessonsRes.data);
      }
    } catch (e) {
      // If lessons endpoint fails, continue without custom lessons
      try {
        const childRes = await axios.get(`${API}/children/${childId}`);
        setChild(childRes.data);
        if (!childRes.data.subscription_active) {
          navigate("/dashboard");
          return;
        }
      } catch (err) {
        navigate("/dashboard");
        return;
      }
    }
    setLoading(false);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-6xl"
        >
          🌟
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      {/* Header */}
      <header className="bg-white border-b-4 border-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/dashboard")}
            className="btn-brutal bg-[#0047FF] text-white p-3 rounded-xl"
            data-testid="back-button"
          >
            <ArrowLeft size={24} />
          </motion.button>
          
          <h1 className="text-2xl font-bold text-slate-900 font-kids">
            Hi, {child?.name}! 👋
          </h1>
          
          <div className="btn-brutal bg-[#FFD500] px-4 py-2 rounded-xl flex items-center gap-2">
            <Star size={24} fill="#0A0B10" />
            <span className="font-bold text-xl">{child?.progress?.total_stars || 0}</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl font-bold text-slate-900 font-kids">What do you want to learn?</h2>
          <p className="mt-2 text-xl text-slate-600">Pick a module and start playing!</p>
        </motion.div>

        {/* Practice Modules */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-slate-900 font-kids mb-4">Practice Games</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {getModulesForAge(child?.age || 5).map((module, i) => {
              const fullLesson = getLessonById(module.id);
              
              return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="card-brutal rounded-2xl text-left"
                style={{ backgroundColor: module.color }}
                data-testid={`module-${module.id}-card`}
              >
                <div className="p-3 bg-white/30 rounded-xl w-fit">
                  <module.icon size={48} strokeWidth={2.5} className="text-slate-900" />
                </div>
                <h3 className="mt-4 text-2xl font-bold text-slate-900 font-kids">{module.name}</h3>
                <p className="mt-1 text-slate-700">{module.desc}</p>
                
                <div className="mt-3 flex items-center gap-2 text-slate-900">
                  <Star size={18} fill="#0A0B10" />
                  <span className="font-bold">
                    {child?.progress?.[`${module.id}_stars`] || 0} stars
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  {fullLesson && module.id !== "quiz" && (
                    <button
                      onClick={() => {
                        setSelectedModule(module.id);
                        setShowLesson(fullLesson);
                      }}
                      className="flex-1 bg-white/90 hover:bg-white text-slate-900 py-2 px-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1 border-2 border-slate-900 transition-colors"
                      data-testid={`module-${module.id}-learn-button`}
                    >
                      <BookOpen size={16} /> Learn
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/learn/${childId}/${module.id}`)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2 px-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1 transition-colors"
                    data-testid={`module-${module.id}-practice-button`}
                  >
                    <Play size={16} /> Practice
                  </button>
                </div>
              </motion.div>
            )})}
          </div>
        </div>

        {/* Timed Exam Practice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-6 border-4 border-slate-900 shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Clock size={36} className="text-white" />
                </div>
                <div className="text-white">
                  <h3 className="text-2xl font-bold font-kids">⏱️ Timed Exam Practice</h3>
                  <p className="text-orange-100">Test your speed! Improve your time management for real exams.</p>
                </div>
              </div>
              <button
                onClick={() => setShowTimedExam(true)}
                className="bg-white hover:bg-slate-100 text-orange-600 px-6 py-3 rounded-xl font-bold text-lg flex items-center gap-2 shadow-lg transition-all"
                data-testid="timed-exam-button"
              >
                <Zap size={24} /> Start Timed Exam
              </button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center text-white/90 text-sm">
              <div className="bg-white/10 rounded-lg py-2">
                <span className="font-bold">Easy:</span> 30s/question
              </div>
              <div className="bg-white/10 rounded-lg py-2">
                <span className="font-bold">Medium:</span> 45s/question
              </div>
              <div className="bg-white/10 rounded-lg py-2">
                <span className="font-bold">Hard:</span> 60s/question
              </div>
            </div>
          </div>
        </motion.div>

        {/* Custom Lessons from Admin */}
        {lessons.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-slate-900 font-kids mb-4">
              Monthly Lessons
              {!child?.subscription_active && <span className="text-base font-normal text-slate-500 ml-2">(Free lessons only)</span>}
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lessons.map((lesson, i) => (
                <motion.button
                  key={lesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/learn/${childId}/lesson/${lesson.id}`)}
                  className="card-brutal rounded-xl text-left cursor-pointer p-5"
                  style={{ backgroundColor: LESSON_COLORS[i % LESSON_COLORS.length] }}
                  data-testid={`lesson-${lesson.id}-button`}
                >
                  <div className="flex items-start justify-between">
                    <BookOpen size={32} className="text-slate-900" />
                    {lesson.is_free && (
                      <span className="bg-white/50 text-slate-900 text-xs px-2 py-1 rounded-full font-bold">
                        FREE
                      </span>
                    )}
                  </div>
                  <h4 className="mt-3 text-xl font-bold text-slate-900 font-kids">{lesson.title}</h4>
                  <p className="mt-1 text-sm text-slate-700 line-clamp-2">{lesson.description}</p>
                  <div className="mt-3 flex items-center gap-2 text-slate-900 text-sm">
                    <Play size={16} />
                    <span>{lesson.content?.questions?.length || 0} questions</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Badges Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-2xl font-bold text-slate-900 font-kids mb-4">Your Badges</h3>
          <div className="flex flex-wrap gap-3">
            {(child?.progress?.badges || []).map((badge, i) => (
              <div key={badge} className="bg-[#FFD500] border-2 border-slate-900 px-4 py-2 rounded-full font-bold">
                {badge.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())} ⭐
              </div>
            ))}
            {(!child?.progress?.badges || child.progress.badges.length === 0) && (
              <p className="text-slate-500">Complete modules to earn badges!</p>
            )}
          </div>
        </motion.div>
      </main>

      {/* Full Lesson Modal */}
      {showLesson && (
        <FullLessonModal
          lesson={showLesson}
          onClose={() => setShowLesson(null)}
          onStartPractice={() => {
            setShowLesson(null);
            navigate(`/learn/${childId}/${selectedModule}`);
          }}
        />
      )}

      {/* Timed Exam Modal */}
      {showTimedExam && (
        <TimedExamModal
          ageCategory={child?.age_category || "age_5_6"}
          childName={child?.name || "Student"}
          onClose={() => setShowTimedExam(false)}
        />
      )}
    </div>
  );
}
