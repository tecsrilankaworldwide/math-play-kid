import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Plus, User, Star, Play, CreditCard, QrCode, LogOut, Crown, X } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const BANK_QR_URL = "https://customer-assets.emergentagent.com/job_math-play-kids-3/artifacts/n7yjkf86_qrcode.jpg";

const PRICING = {
  age_5_6: { monthly: 1, yearly: 5, name: "Ages 5-6" },
  age_7: { monthly: 2, yearly: 7, name: "Age 7" },
  age_8: { monthly: 3, yearly: 10, name: "Age 8" },
  age_9: { monthly: 4, yearly: 13, name: "Age 9" },
  age_10: { monthly: 5, yearly: 15, name: "Age 10" },
};

const AGE_COLORS = {
  age_5_6: "#FFD500",
  age_7: "#00E676",
  age_8: "#0047FF",
  age_9: "#FF6B9D",
  age_10: "#9B5DE5",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const [children, setChildren] = useState([]);
  const [showAddChild, setShowAddChild] = useState(false);
  const [showPayment, setShowPayment] = useState(null);
  const [newChild, setNewChild] = useState({ name: "", age: 5 });
  const [paymentType, setPaymentType] = useState("yearly");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    } else if (user) {
      fetchChildren();
    }
  }, [user, authLoading, navigate]);

  const fetchChildren = async () => {
    try {
      const res = await axios.get(`${API}/children`);
      setChildren(res.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleAddChild = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/children`, newChild);
      toast.success("Child profile added!");
      setShowAddChild(false);
      setNewChild({ name: "", age: 5 });
      fetchChildren();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to add child");
    }
  };

  const handleStripePayment = async (child) => {
    try {
      const res = await axios.post(`${API}/payments/create-checkout`, {
        child_id: child.id,
        plan_type: paymentType,
        age_category: child.age_category
      });
      window.location.href = res.data.url;
    } catch (err) {
      toast.error(err.response?.data?.detail || "Payment failed");
    }
  };

  const handleManualPayment = async (child) => {
    if (!referenceNumber.trim()) {
      toast.error("Please enter the payment reference number");
      return;
    }
    try {
      await axios.post(`${API}/payments/manual`, {
        child_id: child.id,
        plan_type: paymentType,
        age_category: child.age_category,
        reference_number: referenceNumber
      });
      toast.success("Payment submitted! We'll verify and activate within 24 hours.");
      setShowPayment(null);
      setReferenceNumber("");
      fetchChildren(); // Refresh children list
    } catch (err) {
      toast.error(err.response?.data?.detail || "Submission failed");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center">
        <div className="text-2xl font-bold text-slate-900">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      {/* Header */}
      <header className="bg-white border-b-2 border-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900 font-kids">
            MathPlay<span className="text-[#0047FF]">Kids</span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-slate-600">Hi, {user?.name}</span>
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
              data-testid="logout-button"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 font-kids">Your Children</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddChild(true)}
            className="btn-brutal-primary px-6 py-3 rounded-xl flex items-center gap-2"
            data-testid="add-child-button"
          >
            <Plus size={20} /> Add Child
          </motion.button>
        </div>

        {children.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card-brutal rounded-2xl bg-[#FFD500] text-center py-12"
          >
            <User size={64} className="mx-auto text-slate-900" />
            <h3 className="mt-4 text-2xl font-bold text-slate-900">No children yet</h3>
            <p className="mt-2 text-slate-700">Add your first child to start learning!</p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child, i) => (
              <motion.div
                key={child.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card-brutal rounded-2xl"
                style={{ backgroundColor: AGE_COLORS[child.age_category] || "#FFD500" }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 font-kids">{child.name}</h3>
                    <p className="text-slate-700">Age {child.age}</p>
                  </div>
                  {child.subscription_active && (
                    <div className="bg-slate-900 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                      <Crown size={14} /> Premium
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star size={20} fill="#0A0B10" />
                    <span className="font-bold text-slate-900">{child.progress?.total_stars || 0}</span>
                  </div>
                  <span className="text-slate-700">Stars earned</span>
                </div>

                <div className="mt-6 flex gap-3">
                  {child.subscription_active ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/learn/${child.id}`)}
                      className="btn-brutal bg-slate-900 text-white flex-1 py-3 rounded-xl flex items-center justify-center gap-2"
                      data-testid={`learn-button-${child.id}`}
                    >
                      <Play size={20} /> Learn
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowPayment(child)}
                      className="btn-brutal bg-slate-900 text-white flex-1 py-3 rounded-xl flex items-center justify-center gap-2"
                      data-testid={`subscribe-button-${child.id}`}
                    >
                      <CreditCard size={20} /> Subscribe
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Add Child Modal */}
      {showAddChild && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card-brutal rounded-2xl bg-white max-w-md w-full"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900">Add Child</h3>
              <button onClick={() => setShowAddChild(false)} className="text-slate-500 hover:text-slate-900">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddChild} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Child's Name</label>
                <input
                  type="text"
                  value={newChild.name}
                  onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                  className="input-brutal"
                  placeholder="Enter name"
                  required
                  data-testid="child-name-input"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Age</label>
                <select
                  value={newChild.age}
                  onChange={(e) => setNewChild({ ...newChild, age: parseInt(e.target.value) })}
                  className="input-brutal"
                  data-testid="child-age-select"
                >
                  {[5, 6, 7, 8, 9, 10].map(age => (
                    <option key={age} value={age}>Age {age}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-brutal-primary w-full py-3 rounded-xl" data-testid="save-child-button">
                Add Child
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card-brutal rounded-2xl bg-white max-w-lg w-full my-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900">Subscribe for {showPayment.name}</h3>
              <button onClick={() => setShowPayment(null)} className="text-slate-500 hover:text-slate-900">
                <X size={24} />
              </button>
            </div>

            {/* Plan Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">Select Plan</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentType("monthly")}
                  className={`p-4 rounded-xl border-2 transition-all ${paymentType === "monthly" ? "border-slate-900 bg-[#FFD500]" : "border-gray-200"}`}
                  data-testid="monthly-plan-button"
                >
                  <div className="font-bold text-lg">${PRICING[showPayment.age_category]?.monthly}/mo</div>
                  <div className="text-sm text-slate-600">Monthly</div>
                </button>
                <button
                  onClick={() => setPaymentType("yearly")}
                  className={`p-4 rounded-xl border-2 transition-all ${paymentType === "yearly" ? "border-slate-900 bg-[#00E676]" : "border-gray-200"}`}
                  data-testid="yearly-plan-button"
                >
                  <div className="font-bold text-lg">${PRICING[showPayment.age_category]?.yearly}/yr</div>
                  <div className="text-sm text-slate-600">Yearly (Save!)</div>
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`p-4 rounded-xl border-2 flex items-center gap-3 ${paymentMethod === "card" ? "border-slate-900 bg-blue-50" : "border-gray-200"}`}
                  data-testid="card-payment-button"
                >
                  <CreditCard size={24} />
                  <div className="text-left">
                    <div className="font-bold">Card</div>
                    <div className="text-xs text-slate-500">Visa, Mastercard</div>
                  </div>
                </button>
                <button
                  onClick={() => setPaymentMethod("qr")}
                  className={`p-4 rounded-xl border-2 flex items-center gap-3 ${paymentMethod === "qr" ? "border-slate-900 bg-green-50" : "border-gray-200"}`}
                  data-testid="qr-payment-button"
                >
                  <QrCode size={24} />
                  <div className="text-left">
                    <div className="font-bold">Bank QR</div>
                    <div className="text-xs text-slate-500">Sri Lanka</div>
                  </div>
                </button>
              </div>
            </div>

            {paymentMethod === "qr" && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-slate-600 mb-4">
                  1. Scan QR code with your bank app<br />
                  2. Pay ${paymentType === "yearly" ? PRICING[showPayment.age_category]?.yearly : PRICING[showPayment.age_category]?.monthly} USD<br />
                  3. Enter the reference number below
                </p>
                <div className="flex justify-center mb-4">
                  <img src={BANK_QR_URL} alt="Bank QR Code" className="w-48 h-48 border-2 border-slate-900 rounded-lg" />
                </div>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="input-brutal"
                  placeholder="Enter payment reference number"
                  data-testid="reference-number-input"
                />
              </div>
            )}

            <button
              onClick={() => paymentMethod === "card" ? handleStripePayment(showPayment) : handleManualPayment(showPayment)}
              className="btn-brutal-primary w-full py-3 rounded-xl text-lg font-bold"
              data-testid="confirm-payment-button"
            >
              {paymentMethod === "card" ? "Pay with Card" : "Submit Payment"}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
