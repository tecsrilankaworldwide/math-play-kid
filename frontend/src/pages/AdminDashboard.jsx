import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { 
  Users, DollarSign, BookOpen, Check, X, LogOut, Clock, 
  Plus, Edit, Trash2, Save, Upload, Download, FileSpreadsheet
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AGE_CATEGORIES = [
  { id: "age_5_6", name: "Ages 5-6" },
  { id: "age_7", name: "Age 7" },
  { id: "age_8", name: "Age 8" },
  { id: "age_9", name: "Age 9" },
  { id: "age_10", name: "Age 10" },
  { id: "age_11", name: "Age 11" },
  { id: "age_12", name: "Age 12" },
  { id: "age_13", name: "Age 13" },
  { id: "age_14", name: "Age 14" },
];

const MODULE_TYPES = [
  { id: "counting", name: "Counting" },
  { id: "numbers", name: "Numbers" },
  { id: "addition", name: "Addition" },
  { id: "subtraction", name: "Subtraction" },
  { id: "shapes", name: "Shapes" },
  { id: "multiplication", name: "Multiplication" },
  { id: "division", name: "Division" },
  { id: "fractions", name: "Fractions" },
  { id: "algebra", name: "Algebra" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  
  // Lesson form state
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    age_category: "age_5_6",
    module_type: "counting",
    is_free: false,
    content: {
      questions: []
    }
  });
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correct_answer: "",
    visual_hint: ""
  });
  
  // CSV Import
  const fileInputRef = useRef(null);
  const [csvImporting, setCsvImporting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !user.is_admin)) {
      navigate("/login");
    } else if (user?.is_admin) {
      fetchData();
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, paymentsRes, lessonsRes] = await Promise.all([
        axios.get(`${API}/admin/stats`),
        axios.get(`${API}/admin/users`),
        axios.get(`${API}/admin/payments`),
        axios.get(`${API}/admin/lessons`),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setPayments(paymentsRes.data);
      setLessons(lessonsRes.data);
    } catch (e) {
      toast.error("Failed to load data");
    }
    setLoading(false);
  };

  const approvePayment = async (transactionId) => {
    try {
      await axios.put(`${API}/admin/payments/${transactionId}/approve`);
      toast.success("Payment approved!");
      fetchData();
    } catch (e) {
      toast.error("Failed to approve payment");
    }
  };

  // Lesson Management Functions
  const resetLessonForm = () => {
    setLessonForm({
      title: "",
      description: "",
      age_category: "age_5_6",
      module_type: "counting",
      is_free: false,
      content: { questions: [] }
    });
    setCurrentQuestion({
      question: "",
      options: ["", "", "", ""],
      correct_answer: "",
      visual_hint: ""
    });
    setEditingLesson(null);
  };

  const openNewLessonForm = () => {
    resetLessonForm();
    setShowLessonForm(true);
  };

  const openEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      description: lesson.description,
      age_category: lesson.age_category,
      module_type: lesson.module_type,
      is_free: lesson.is_free,
      content: lesson.content || { questions: [] }
    });
    setShowLessonForm(true);
  };

  const addQuestionToLesson = () => {
    if (!currentQuestion.question || !currentQuestion.correct_answer) {
      toast.error("Please fill in the question and correct answer");
      return;
    }
    if (currentQuestion.options.some(opt => !opt.trim())) {
      toast.error("Please fill in all 4 options");
      return;
    }
    
    setLessonForm(prev => ({
      ...prev,
      content: {
        ...prev.content,
        questions: [...(prev.content.questions || []), { ...currentQuestion, id: Date.now() }]
      }
    }));
    
    setCurrentQuestion({
      question: "",
      options: ["", "", "", ""],
      correct_answer: "",
      visual_hint: ""
    });
    toast.success("Question added!");
  };

  const removeQuestion = (index) => {
    setLessonForm(prev => ({
      ...prev,
      content: {
        ...prev.content,
        questions: prev.content.questions.filter((_, i) => i !== index)
      }
    }));
  };

  const saveLesson = async () => {
    if (!lessonForm.title || !lessonForm.description) {
      toast.error("Please fill in title and description");
      return;
    }
    
    try {
      if (editingLesson) {
        await axios.put(`${API}/admin/lessons/${editingLesson.id}`, lessonForm);
        toast.success("Lesson updated!");
      } else {
        await axios.post(`${API}/admin/lessons`, lessonForm);
        toast.success("Lesson created!");
      }
      setShowLessonForm(false);
      resetLessonForm();
      fetchData();
    } catch (e) {
      toast.error("Failed to save lesson");
    }
  };

  const deleteLesson = async (lessonId) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await axios.delete(`${API}/admin/lessons/${lessonId}`);
      toast.success("Lesson deleted!");
      fetchData();
    } catch (e) {
      toast.error("Failed to delete lesson");
    }
  };

  // CSV Import/Export Functions
  const handleCsvImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setCsvImporting(true);
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await axios.post(`${API}/admin/lessons/import-questions`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      if (res.data.questions?.length > 0) {
        setLessonForm(prev => ({
          ...prev,
          content: {
            ...prev.content,
            questions: [...(prev.content.questions || []), ...res.data.questions]
          }
        }));
        toast.success(`Imported ${res.data.count} questions!`);
        
        if (res.data.errors?.length > 0) {
          toast.warning(`${res.data.errors.length} rows had errors`);
          console.log("Import errors:", res.data.errors);
        }
      } else {
        toast.error("No valid questions found in CSV");
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to import CSV");
    }
    
    setCsvImporting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadCsvTemplate = () => {
    const template = "question,option1,option2,option3,option4,correct_answer,visual_hint\n" +
      "How many apples?,1,2,3,4,3,🍎🍎🍎\n" +
      "What is 2 + 2?,3,4,5,6,4,\n" +
      "What shape is this?,Circle,Square,Triangle,Star,Circle,🔴";
    
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "questions_template.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Template downloaded!");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 font-admin">
            MathPlayKids <span className="text-gray-400 font-normal">Admin</span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user?.email}</span>
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="text-gray-500 hover:text-gray-900"
              data-testid="admin-logout-button"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {["overview", "lessons", "users", "payments"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-gray-900 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              data-testid={`tab-${tab}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid md:grid-cols-4 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-admin">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg"><Users size={24} className="text-blue-600" /></div>
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.total_users || 0}</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-admin">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg"><BookOpen size={24} className="text-green-600" /></div>
                <div>
                  <p className="text-sm text-gray-500">Active Subscriptions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.active_subscriptions || 0}</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-admin">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-lg"><DollarSign size={24} className="text-yellow-600" /></div>
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${stats?.total_revenue?.toFixed(2) || "0.00"}</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-admin">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg"><BookOpen size={24} className="text-purple-600" /></div>
                <div>
                  <p className="text-sm text-gray-500">Total Lessons</p>
                  <p className="text-2xl font-bold text-gray-900">{lessons.length}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Lessons Tab */}
        {activeTab === "lessons" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Lesson Management</h2>
              <button
                onClick={openNewLessonForm}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                data-testid="add-lesson-button"
              >
                <Plus size={20} /> Add New Lesson
              </button>
            </div>

            {lessons.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No lessons yet</h3>
                <p className="text-gray-500 mb-4">Create your first lesson to get started</p>
                <button
                  onClick={openNewLessonForm}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Create Lesson
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lessons.map((lesson) => (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-lg border border-gray-200 p-5"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{lesson.description}</p>
                      </div>
                      {lesson.is_free && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                          Free
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {AGE_CATEGORIES.find(c => c.id === lesson.age_category)?.name}
                      </span>
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full capitalize">
                        {lesson.module_type}
                      </span>
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {lesson.content?.questions?.length || 0} questions
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditLesson(lesson)}
                        className="flex-1 flex items-center justify-center gap-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                        data-testid={`edit-lesson-${lesson.id}`}
                      >
                        <Edit size={16} /> Edit
                      </button>
                      <button
                        onClick={() => deleteLesson(lesson.id)}
                        className="flex items-center justify-center gap-1 bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm"
                        data-testid={`delete-lesson-${lesson.id}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="table-admin">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(u => !u.is_admin).map((u) => (
                  <tr key={u.id}>
                    <td className="font-medium">{u.name}</td>
                    <td>{u.email}</td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.filter(u => !u.is_admin).length === 0 && (
              <div className="p-8 text-center text-gray-500">No users yet</div>
            )}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="table-admin">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Plan</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="font-medium">${p.amount}</td>
                    <td className="capitalize">{p.plan_type}</td>
                    <td className="capitalize">{p.payment_method === "bank_qr" ? "Bank QR" : "Card"}</td>
                    <td>
                      <span className={`badge ${
                        p.payment_status === "paid" ? "badge-success" :
                        p.payment_status === "pending_verification" ? "badge-warning" :
                        "badge-info"
                      }`}>
                        {p.payment_status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td>
                      {p.payment_status === "pending_verification" && (
                        <button
                          onClick={() => approvePayment(p.id)}
                          className="text-green-600 hover:text-green-800 font-medium"
                          data-testid={`approve-payment-${p.id}`}
                        >
                          <Check size={20} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payments.length === 0 && (
              <div className="p-8 text-center text-gray-500">No payments yet</div>
            )}
          </div>
        )}
      </div>

      {/* Lesson Form Modal */}
      {showLessonForm && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-3xl w-full my-8"
          >
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingLesson ? "Edit Lesson" : "Create New Lesson"}
              </h2>
              <button onClick={() => { setShowLessonForm(false); resetLessonForm(); }} className="text-gray-500 hover:text-gray-900">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Title *</label>
                  <input
                    type="text"
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Counting to 10"
                    data-testid="lesson-title-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age Category</label>
                  <select
                    value={lessonForm.age_category}
                    onChange={(e) => setLessonForm({ ...lessonForm, age_category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    data-testid="lesson-age-select"
                  >
                    {AGE_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="What will kids learn in this lesson?"
                  data-testid="lesson-description-input"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Module Type</label>
                  <select
                    value={lessonForm.module_type}
                    onChange={(e) => setLessonForm({ ...lessonForm, module_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    data-testid="lesson-module-select"
                  >
                    {MODULE_TYPES.map(mod => (
                      <option key={mod.id} value={mod.id}>{mod.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="is_free"
                    checked={lessonForm.is_free}
                    onChange={(e) => setLessonForm({ ...lessonForm, is_free: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300"
                    data-testid="lesson-free-checkbox"
                  />
                  <label htmlFor="is_free" className="text-sm font-medium text-gray-700">
                    Make this lesson free (trial)
                  </label>
                </div>
              </div>

              {/* Questions Section */}
              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Lesson Questions</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={downloadCsvTemplate}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      data-testid="download-template-button"
                    >
                      <Download size={16} /> Template
                    </button>
                    <label className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 cursor-pointer">
                      <Upload size={16} /> {csvImporting ? "Importing..." : "Import CSV"}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleCsvImport}
                        className="hidden"
                        disabled={csvImporting}
                        data-testid="csv-import-input"
                      />
                    </label>
                  </div>
                </div>
                
                {/* Existing Questions */}
                {lessonForm.content.questions?.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <p className="text-sm text-gray-500 mb-2">{lessonForm.content.questions.length} questions added</p>
                    {lessonForm.content.questions.map((q, index) => (
                      <div key={q.id || index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex-1 min-w-0 mr-4">
                          <p className="font-medium text-gray-900 truncate">{q.question}</p>
                          <p className="text-sm text-gray-500">Answer: {q.correct_answer} {q.visual_hint && `| Hint: ${q.visual_hint}`}</p>
                        </div>
                        <button
                          onClick={() => removeQuestion(index)}
                          className="text-red-500 hover:text-red-700 flex-shrink-0"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Question */}
                <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                  <h4 className="font-medium text-blue-900">Add Question</h4>
                  
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Question Text</label>
                    <input
                      type="text"
                      value={currentQuestion.question}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="e.g., How many apples are there?"
                      data-testid="question-text-input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {currentQuestion.options.map((opt, i) => (
                      <div key={i}>
                        <label className="block text-sm text-gray-700 mb-1">Option {i + 1}</label>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...currentQuestion.options];
                            newOpts[i] = e.target.value;
                            setCurrentQuestion({ ...currentQuestion, options: newOpts });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder={`Option ${i + 1}`}
                          data-testid={`question-option-${i}-input`}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Correct Answer</label>
                      <select
                        value={currentQuestion.correct_answer}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, correct_answer: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        data-testid="question-answer-select"
                      >
                        <option value="">Select correct answer</option>
                        {currentQuestion.options.filter(o => o).map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Visual Hint (emoji/text)</label>
                      <input
                        type="text"
                        value={currentQuestion.visual_hint}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, visual_hint: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="e.g., 🍎🍎🍎"
                        data-testid="question-hint-input"
                      />
                    </div>
                  </div>

                  <button
                    onClick={addQuestionToLesson}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                    data-testid="add-question-button"
                  >
                    <Plus size={18} /> Add Question
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => { setShowLessonForm(false); resetLessonForm(); }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveLesson}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                data-testid="save-lesson-button"
              >
                <Save size={18} /> {editingLesson ? "Update Lesson" : "Save Lesson"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
