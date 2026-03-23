import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import Confetti from "react-confetti";
import { CheckCircle, Loader } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("checking");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      pollPaymentStatus(sessionId);
    } else {
      navigate("/dashboard");
    }
  }, [searchParams, navigate]);

  const pollPaymentStatus = async (sessionId) => {
    if (attempts >= 10) {
      setStatus("timeout");
      return;
    }

    try {
      const res = await axios.get(`${API}/payments/status/${sessionId}`);
      if (res.data.payment_status === "paid") {
        setStatus("success");
      } else if (res.data.status === "expired") {
        setStatus("failed");
      } else {
        setAttempts(prev => prev + 1);
        setTimeout(() => pollPaymentStatus(sessionId), 2000);
      }
    } catch (e) {
      setAttempts(prev => prev + 1);
      setTimeout(() => pollPaymentStatus(sessionId), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center px-4">
      {status === "success" && <Confetti recycle={false} numberOfPieces={300} />}
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="card-brutal rounded-2xl bg-white max-w-md w-full text-center"
      >
        {status === "checking" && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <Loader size={64} className="mx-auto text-[#0047FF]" />
            </motion.div>
            <h1 className="mt-6 text-2xl font-bold text-slate-900">Verifying Payment...</h1>
            <p className="mt-2 text-slate-600">Please wait while we confirm your payment</p>
          </>
        )}

        {status === "success" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              <CheckCircle size={80} className="mx-auto text-[#00E676]" />
            </motion.div>
            <h1 className="mt-6 text-3xl font-bold text-slate-900 font-kids">Payment Successful!</h1>
            <p className="mt-2 text-slate-600">Your subscription is now active. Let's start learning!</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-8 btn-brutal-primary w-full py-3 rounded-xl text-lg"
              data-testid="go-to-dashboard-button"
            >
              Go to Dashboard
            </button>
          </>
        )}

        {(status === "failed" || status === "timeout") && (
          <>
            <div className="text-6xl">😔</div>
            <h1 className="mt-6 text-2xl font-bold text-slate-900">Payment {status === "timeout" ? "Verification Timeout" : "Failed"}</h1>
            <p className="mt-2 text-slate-600">
              {status === "timeout" 
                ? "We couldn't verify your payment. Please check your dashboard or contact support."
                : "Something went wrong with your payment. Please try again."}
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-8 btn-brutal w-full py-3 rounded-xl bg-white"
              data-testid="back-to-dashboard-button"
            >
              Back to Dashboard
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
