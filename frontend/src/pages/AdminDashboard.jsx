import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Users, DollarSign, BookOpen, Check, X, LogOut, BarChart3, Clock } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [children, setChildren] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !user.is_admin)) {
      navigate("/login");
    } else if (user?.is_admin) {
      fetchData();
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, childrenRes, paymentsRes] = await Promise.all([
        axios.get(`${API}/admin/stats`),
        axios.get(`${API}/admin/users`),
        axios.get(`${API}/admin/children`),
        axios.get(`${API}/admin/payments`),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setChildren(childrenRes.data);
      setPayments(paymentsRes.data);
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
          {["overview", "users", "payments"].map((tab) => (
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-admin"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.total_users || 0}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card-admin"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <BookOpen size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Subscriptions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.active_subscriptions || 0}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-admin"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <DollarSign size={24} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${stats?.total_revenue?.toFixed(2) || "0.00"}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card-admin"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Clock size={24} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending Payments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.pending_payments || 0}</p>
                </div>
              </div>
            </motion.div>
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
                  <th>Children</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(u => !u.is_admin).map((u) => (
                  <tr key={u.id}>
                    <td className="font-medium">{u.name}</td>
                    <td>{u.email}</td>
                    <td>{children.filter(c => c.parent_id === u.id).length}</td>
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
    </div>
  );
}
