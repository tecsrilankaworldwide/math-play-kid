import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CountingModule from "./pages/CountingModule";
import NumbersModule from "./pages/NumbersModule";
import AdditionModule from "./pages/AdditionModule";
import ShapesModule from "./pages/ShapesModule";
import QuizModule from "./pages/QuizModule";
import RewardsPage from "./pages/RewardsPage";

function App() {
  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#FCF9F2' }}>
      {/* Background Decorations */}
      <div className="floating-shape shape-circle-1" />
      <div className="floating-shape shape-circle-2" />
      <div className="floating-shape shape-star" />
      <div className="floating-shape shape-triangle" />
      <div className="floating-shape shape-blob" />
      
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/counting" element={<CountingModule />} />
          <Route path="/numbers" element={<NumbersModule />} />
          <Route path="/addition" element={<AdditionModule />} />
          <Route path="/shapes" element={<ShapesModule />} />
          <Route path="/quiz" element={<QuizModule />} />
          <Route path="/rewards" element={<RewardsPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
