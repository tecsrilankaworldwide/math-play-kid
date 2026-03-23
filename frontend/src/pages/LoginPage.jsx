import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success("Welcome back!");
      if (data.user.is_admin) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-slate-900 font-kids">
            MathPlay<span className="text-[#0047FF]">Kids</span>
          </Link>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">Welcome Back!</h2>
          <p className="mt-2 text-slate-600">Sign in to continue learning</p>
        </div>

        <div className="card-brutal rounded-2xl bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-brutal pl-10"
                  placeholder="parent@email.com"
                  required
                  data-testid="login-email-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-brutal pl-10"
                  placeholder="••••••••"
                  required
                  data-testid="login-password-input"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn-brutal-primary w-full py-3 rounded-xl flex items-center justify-center gap-2 text-lg font-bold"
              data-testid="login-submit-button"
            >
              {loading ? "Signing in..." : "Sign In"} <ArrowRight size={20} />
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-[#0047FF] font-semibold hover:underline" data-testid="register-link">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
