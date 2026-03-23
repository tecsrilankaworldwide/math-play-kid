import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ChevronDown } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function LanguageSelector({ variant = "default" }) {
  const { language, changeLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentLang = languages.find(l => l.code === language);

  const baseClasses = variant === "minimal" 
    ? "flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors text-sm"
    : "flex items-center gap-2 px-3 py-2 border-2 border-slate-900 rounded-lg bg-white hover:bg-gray-50 transition-colors";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={baseClasses}
        data-testid="language-selector"
      >
        <Globe size={variant === "minimal" ? 16 : 20} />
        <span className="font-medium">{currentLang?.nativeName}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-40 bg-white border-2 border-slate-900 rounded-lg shadow-lg z-50 overflow-hidden"
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    changeLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors flex items-center justify-between ${
                    language === lang.code ? "bg-[#FFD500]/20" : ""
                  }`}
                  data-testid={`lang-${lang.code}`}
                >
                  <span className="font-medium">{lang.nativeName}</span>
                  {language === lang.code && (
                    <span className="text-[#00E676]">✓</span>
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
