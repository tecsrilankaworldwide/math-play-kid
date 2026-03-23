import { createContext, useContext, useState, useEffect } from "react";
import translations from "../i18n/translations";

const LanguageContext = createContext(null);

const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "si", name: "Sinhala", nativeName: "සිංහල" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
];

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Get saved language or default to English
    const saved = localStorage.getItem("mathplay_language");
    return saved || "en";
  });

  useEffect(() => {
    localStorage.setItem("mathplay_language", language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations["en"]?.[key] || key;
  };

  const changeLanguage = (code) => {
    if (LANGUAGES.find(l => l.code === code)) {
      setLanguage(code);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, t, changeLanguage, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
