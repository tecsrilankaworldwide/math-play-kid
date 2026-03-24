import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Star, Check, Users, Trophy, BookOpen, CreditCard, QrCode, ArrowRight } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelector from "../components/LanguageSelector";

const PRICING = [
  { id: "age_5_6", nameKey: "ages_5_6", monthly: 1, yearly: 5, color: "#FFD500", features: ["Counting 1-10", "Number Recognition", "Basic Shapes", "Fun Games"] },
  { id: "age_7", nameKey: "age_7", monthly: 2, yearly: 7, color: "#00E676", features: ["Counting 1-15", "Addition & Subtraction", "More Shapes", "Quiz Mode"] },
  { id: "age_8", nameKey: "age_8", monthly: 3, yearly: 10, color: "#0047FF", features: ["Advanced Counting", "Word Problems", "Geometry Intro", "Progress Tracking"] },
  { id: "age_9", nameKey: "age_9", monthly: 4, yearly: 13, color: "#FF6B9D", features: ["Multiplication Basics", "Fractions Intro", "Logic Puzzles", "Achievements"] },
  { id: "age_10", nameKey: "age_10", monthly: 5, yearly: 15, color: "#9B5DE5", features: ["All Operations", "Problem Solving", "Advanced Geometry", "Full Curriculum"] },
  { id: "age_11", nameKey: "age_11", monthly: 6, yearly: 18, color: "#F78C6B", features: ["Algebra Basics", "Decimals", "Data & Graphs", "Critical Thinking"] },
  { id: "age_12", nameKey: "age_12", monthly: 7, yearly: 21, color: "#00BCD4", features: ["Pre-Algebra", "Percentages", "Statistics", "Problem Analysis"] },
  { id: "age_13", nameKey: "age_13", monthly: 8, yearly: 24, color: "#E91E63", features: ["Algebra I", "Linear Equations", "Probability", "Logical Reasoning"] },
  { id: "age_14", nameKey: "age_14", monthly: 9, yearly: 27, color: "#607D8B", features: ["Algebra II", "Quadratics", "Functions", "Exam Preparation"] },
];

const PricingCard = ({ plan, delay, t }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="pricing-card"
    style={{ backgroundColor: plan.color }}
  >
    <div className="p-6">
      <h3 className="text-2xl font-bold text-slate-900 font-kids">{t(plan.nameKey)}</h3>
      <div className="mt-4">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-slate-900">${plan.monthly}</span>
          <span className="text-slate-700">{t("per_month")}</span>
        </div>
        <div className="text-sm text-slate-700 mt-1">or ${plan.yearly}{t("per_year")} (save {Math.round((1 - plan.yearly / (plan.monthly * 12)) * 100)}%)</div>
      </div>
      <ul className="mt-6 space-y-3">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-slate-900">
            <Check size={18} strokeWidth={3} />
            <span className="font-medium">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  </motion.div>
);

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <nav className="flex justify-between items-center">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold text-slate-900 font-kids"
            >
              MathPlay<span className="text-[#0047FF]">Kids</span>
            </motion.h1>
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                onClick={() => navigate("/login")}
                className="px-6 py-2 font-semibold text-slate-900 hover:text-[#0047FF] transition-colors"
                data-testid="login-nav-button"
              >
                {t("login")}
              </motion.button>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={() => navigate("/register")}
                className="btn-brutal-primary px-6 py-2 rounded-lg"
                data-testid="register-nav-button"
              >
                {t("register")}
              </motion.button>
            </div>
          </nav>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl md:text-7xl font-bold text-slate-900 leading-tight font-kids">
              {t("hero_title").split(" ").map((word, i) => 
                word === "Fun!" || word === "வினோதயி!" || word === "வேடிக்கை!" ? 
                  <span key={i} className="text-[#FFD500]">{word} </span> : 
                  word + " "
              )}
            </h2>
            <p className="mt-6 text-xl text-slate-600 leading-relaxed">
              {t("hero_subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/register")}
                className="btn-brutal-primary px-8 py-4 rounded-xl text-lg flex items-center gap-2"
                data-testid="hero-get-started-button"
              >
                {t("start_learning")} <ArrowRight size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => document.getElementById("pricing").scrollIntoView({ behavior: "smooth" })}
                className="btn-brutal px-8 py-4 rounded-xl text-lg bg-white"
                data-testid="view-pricing-button"
              >
                {t("view_pricing")}
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative"
          >
            <img
              src="https://images.unsplash.com/photo-1759678444821-565ff103465c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHw0fHxraWRzJTIwbGVhcm5pbmclMjBtYXRoJTIwcGxheWZ1bHxlbnwwfHx8fDE3NzQyNzc2NjR8MA&ixlib=rb-4.1.0&q=85"
              alt="Child learning"
              className="rounded-2xl border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]"
            />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-4 -right-4 card-brutal-yellow rounded-xl p-4"
            >
              <Star size={32} fill="#0A0B10" />
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center text-slate-900 font-kids"
          >
            {t("why_parents_love")}
          </motion.h2>
          <div className="mt-12 grid md:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, titleKey: "feature_monthly", descKey: "feature_monthly_desc", color: "#FFD500" },
              { icon: Trophy, titleKey: "feature_progress", descKey: "feature_progress_desc", color: "#00E676" },
              { icon: Users, titleKey: "feature_age", descKey: "feature_age_desc", color: "#0047FF" },
              { icon: Star, titleKey: "feature_fun", descKey: "feature_fun_desc", color: "#FF6B9D" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-brutal rounded-xl text-center"
                style={{ backgroundColor: feature.color }}
              >
                <feature.icon size={48} className="mx-auto text-slate-900" strokeWidth={2} />
                <h3 className="mt-4 text-xl font-bold text-slate-900">{t(feature.titleKey)}</h3>
                <p className="mt-2 text-slate-700">{t(feature.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 bg-[#FDF8F5]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold text-slate-900 font-kids">{t("simple_pricing")}</h2>
            <p className="mt-4 text-xl text-slate-600">{t("pricing_subtitle")}</p>
          </motion.div>
          
          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {PRICING.map((plan, i) => (
              <PricingCard key={plan.id} plan={plan} delay={i * 0.05} t={t} />
            ))}
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-slate-900 font-kids">{t("payment_methods")}</h2>
            <p className="mt-4 text-lg text-slate-600">{t("payment_subtitle")}</p>
          </motion.div>
          
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="card-brutal rounded-xl bg-[#0047FF] text-white"
            >
              <CreditCard size={48} />
              <h3 className="mt-4 text-2xl font-bold">{t("credit_card")}</h3>
              <p className="mt-2 text-blue-100">{t("card_desc")}</p>
              <p className="mt-1 text-sm text-blue-200">Visa, Mastercard, American Express</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="card-brutal rounded-xl bg-[#00E676]"
            >
              <QrCode size={48} className="text-slate-900" />
              <h3 className="mt-4 text-2xl font-bold text-slate-900">{t("bank_qr")}</h3>
              <p className="mt-2 text-slate-700">{t("bank_qr_desc")}</p>
              <p className="mt-1 text-sm text-slate-600">For Sri Lanka customers</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#FFD500]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 font-kids">{t("ready_start")}</h2>
            <p className="mt-4 text-xl text-slate-700">{t("join_thousands")}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/register")}
              className="mt-8 btn-brutal bg-slate-900 text-white px-10 py-4 rounded-xl text-xl"
              data-testid="cta-get-started-button"
            >
              {t("get_started_free")}
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-400">© 2026 MathPlayKids. Making math fun for everyone!</p>
        </div>
      </footer>
    </div>
  );
}
