import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Star, Sparkles, Hash, Plus, Shapes, Trophy, BookOpen, Play } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const MODULES = [
  { id: "counting", name: "Counting", icon: Sparkles, color: "#FFD500", desc: "Learn to count objects" },
  { id: "numbers", name: "Numbers", icon: Hash, color: "#0047FF", desc: "Recognize numbers" },
  { id: "addition", name: "Add & Subtract", icon: Plus, color: "#00E676", desc: "Basic math operations" },
  { id: "shapes", name: "Shapes", icon: Shapes, color: "#FF6B9D", desc: "Learn shapes" },
  { id: "quiz", name: "Quiz Time!", icon: Trophy, color: "#9B5DE5", desc: "Test your skills" },
];

const LESSON_COLORS = ["#FFD500", "#00E676", "#0047FF", "#FF6B9D", "#9B5DE5", "#F78C6B"];

export default function LearnPage() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [child, setChild] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

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
            {MODULES.map((module, i) => (
              <motion.button
                key={module.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/learn/${childId}/${module.id}`)}
                className="card-brutal rounded-2xl text-left cursor-pointer"
                style={{ backgroundColor: module.color }}
                data-testid={`module-${module.id}-button`}
              >
                <div className="p-3 bg-white/30 rounded-xl w-fit">
                  <module.icon size={48} strokeWidth={2.5} className="text-slate-900" />
                </div>
                <h3 className="mt-4 text-2xl font-bold text-slate-900 font-kids">{module.name}</h3>
                <p className="mt-1 text-slate-700">{module.desc}</p>
                
                <div className="mt-4 flex items-center gap-2 text-slate-900">
                  <Star size={18} fill="#0A0B10" />
                  <span className="font-bold">
                    {child?.progress?.[`${module.id}_stars`] || 0} stars
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

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
    </div>
  );
}
