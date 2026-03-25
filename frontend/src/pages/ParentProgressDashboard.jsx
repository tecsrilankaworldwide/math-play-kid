import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from "recharts";
import {
  ArrowLeft, Star, TrendingUp, Target, Calendar, Award, AlertTriangle,
  CheckCircle, Clock, Zap, Brain, BookOpen, Flame, Trophy
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const COLORS = {
  primary: "#6366F1",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  purple: "#8B5CF6",
  pink: "#EC4899",
  cyan: "#06B6D4",
};

export default function ParentProgressDashboard() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [childId]);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${API}/children/${childId}/analytics`);
      setAnalytics(res.data);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          📊
        </motion.div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-slate-900">Unable to load analytics</h2>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { child, improvement, module_performance, weak_topics, daily_activity, achievement_timeline, progress_timeline, summary } = analytics;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50" data-testid="parent-progress-dashboard">
      {/* Header */}
      <header className="bg-white border-b-4 border-slate-900 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/dashboard")}
            className="btn-brutal bg-indigo-600 text-white p-3 rounded-xl"
            data-testid="back-button"
          >
            <ArrowLeft size={24} />
          </motion.button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 font-kids">{child.name}'s Progress</h1>
            <p className="text-sm text-slate-500">Age {child.age}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-yellow-100 px-4 py-2 rounded-xl flex items-center gap-2">
              <Star size={20} fill="#F59E0B" className="text-yellow-500" />
              <span className="font-bold text-yellow-700">{improvement.total_stars}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            icon={<Target className="text-indigo-500" />}
            label="Accuracy"
            value={`${improvement.accuracy}%`}
            color="indigo"
            subtext={summary.overall_performance}
          />
          <SummaryCard
            icon={<Flame className="text-orange-500" />}
            label="Current Streak"
            value={`${improvement.current_streak} days`}
            color="orange"
            subtext={summary.streak_status}
          />
          <SummaryCard
            icon={<Trophy className="text-purple-500" />}
            label="Badges Earned"
            value={improvement.total_badges}
            color="purple"
            subtext={`${improvement.login_days} days active`}
          />
          <SummaryCard
            icon={<Zap className="text-cyan-500" />}
            label="Questions Today"
            value={improvement.questions_today}
            color="cyan"
            subtext={`Best: ${improvement.best_day_questions}`}
          />
        </div>

        {/* Main Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Module Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border-4 border-slate-900 shadow-lg"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart className="text-indigo-500" size={24} />
              Performance by Module
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={module_performance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="module" type="category" width={80} />
                <Tooltip 
                  formatter={(value) => [`${value} stars`, "Stars"]}
                  contentStyle={{ borderRadius: "12px", border: "2px solid #1e293b" }}
                />
                <Bar dataKey="stars" radius={[0, 8, 8, 0]}>
                  {module_performance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Progress Over Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border-4 border-slate-900 shadow-lg"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="text-green-500" size={24} />
              Progress Over Time
            </h3>
            {progress_timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={progress_timeline}>
                  <defs>
                    <linearGradient id="colorStars" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${value} stars${props.payload.badge ? ` (${props.payload.badge})` : ""}`,
                      "Progress"
                    ]}
                    contentStyle={{ borderRadius: "12px", border: "2px solid #1e293b" }}
                  />
                  <Area type="monotone" dataKey="stars" stroke="#10B981" fillOpacity={1} fill="url(#colorStars)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-slate-400">
                <p>Start practicing to see progress!</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Daily Activity & Weak Topics */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Activity Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border-4 border-slate-900 shadow-lg"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="text-blue-500" size={24} />
              Daily Activity (Last 14 Days)
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {daily_activity.map((day, i) => (
                <motion.div
                  key={day.date}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold ${
                    day.practiced 
                      ? "bg-green-500 text-white" 
                      : "bg-slate-100 text-slate-400"
                  }`}
                  title={day.date}
                >
                  {day.practiced ? "✓" : new Date(day.date).getDate()}
                </motion.div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-500">
                <div className="w-4 h-4 bg-green-500 rounded" /> Practiced
              </span>
              <span className="flex items-center gap-2 text-slate-500">
                <div className="w-4 h-4 bg-slate-100 rounded border" /> Missed
              </span>
              <span className="font-bold text-slate-700">
                {daily_activity.filter(d => d.practiced).length}/14 days
              </span>
            </div>
          </motion.div>

          {/* Weak Topics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border-4 border-slate-900 shadow-lg"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={24} />
              Areas Needing Attention
            </h3>
            {weak_topics.length > 0 ? (
              <div className="space-y-4">
                {weak_topics.slice(0, 5).map((topic, i) => (
                  <div key={topic.topic} className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-700">{topic.topic}</span>
                      <span className="text-sm text-slate-500">
                        {topic.mistakes} mistakes ({topic.reviewed} reviewed)
                      </span>
                    </div>
                    <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-400 to-red-500 rounded-full"
                        style={{ width: `${Math.min(100, topic.mistakes * 10)}%` }}
                      />
                    </div>
                    {topic.unreviewed > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {topic.unreviewed} new
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex flex-col items-center justify-center text-slate-400">
                <CheckCircle size={48} className="text-green-500 mb-2" />
                <p className="font-semibold text-green-600">No weak areas detected!</p>
                <p className="text-sm">Keep up the great work!</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Achievement Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 border-4 border-slate-900 shadow-lg mb-8"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Award className="text-purple-500" size={24} />
            Recent Achievements
          </h3>
          {achievement_timeline.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {achievement_timeline.map((ach, i) => (
                <motion.div
                  key={ach.badge}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-indigo-100 px-4 py-2 rounded-full border-2 border-purple-200"
                >
                  <span className="text-xl">
                    {ach.badge?.includes("star") ? "⭐" : 
                     ach.badge?.includes("streak") ? "🔥" : 
                     ach.badge?.includes("brave") ? "🦁" :
                     ach.badge?.includes("never") ? "💪" :
                     ach.badge?.includes("mistake") ? "🔄" :
                     ach.badge?.includes("daily") ? "📚" : "🏅"}
                  </span>
                  <span className="font-semibold text-purple-800">{ach.name}</span>
                  {ach.earned_at && (
                    <span className="text-xs text-purple-500">
                      {new Date(ach.earned_at).toLocaleDateString()}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">No achievements yet. Start practicing!</p>
          )}
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 border-4 border-slate-900 shadow-lg text-white"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Brain size={24} />
            Learning Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox label="Total Questions" value={improvement.total_attempts} />
            <StatBox label="Correct Answers" value={improvement.total_correct || Math.round(improvement.total_attempts * improvement.accuracy / 100)} />
            <StatBox label="Longest Streak" value={`${improvement.longest_streak} days`} />
            <StatBox label="Mistakes Reviewed" value={improvement.mistakes_reviewed} />
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function SummaryCard({ icon, label, value, color, subtext }) {
  const colorClasses = {
    indigo: "bg-indigo-50 border-indigo-200",
    orange: "bg-orange-50 border-orange-200",
    purple: "bg-purple-50 border-purple-200",
    cyan: "bg-cyan-50 border-cyan-200",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={`${colorClasses[color]} rounded-2xl p-4 border-2`}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm font-medium text-slate-600">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
    </motion.div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="bg-white/20 rounded-xl p-4 text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-indigo-100">{label}</p>
    </div>
  );
}
