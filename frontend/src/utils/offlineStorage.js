// Offline storage utility for desktop app
// Uses localStorage to persist progress when running as Electron app

const STORAGE_KEY = 'mathplay_progress';

const defaultProgress = {
  id: 'local-user',
  total_stars: 0,
  counting_stars: 0,
  numbers_stars: 0,
  addition_stars: 0,
  shapes_stars: 0,
  quiz_stars: 0,
  badges: [],
  games_played: 0,
  correct_answers: 0,
  updated_at: new Date().toISOString()
};

// Badge definitions
const BADGES = {
  first_star: { requirement: 1 },
  five_stars: { requirement: 5 },
  ten_stars: { requirement: 10 },
  twenty_stars: { requirement: 20 },
  counting_master: { requirement: 'counting_5' },
  number_expert: { requirement: 'numbers_5' },
  addition_ace: { requirement: 'addition_5' },
  shape_detective: { requirement: 'shapes_5' }
};

export const getProgress = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load progress:', e);
  }
  return { ...defaultProgress };
};

export const updateProgress = (module, starsEarned = 1, correct = true) => {
  const progress = getProgress();
  
  // Update module-specific stars
  const moduleField = `${module}_stars`;
  if (moduleField in progress) {
    progress[moduleField] = (progress[moduleField] || 0) + starsEarned;
  }
  
  // Update totals
  progress.total_stars = (progress.total_stars || 0) + starsEarned;
  progress.games_played = (progress.games_played || 0) + 1;
  if (correct) {
    progress.correct_answers = (progress.correct_answers || 0) + 1;
  }
  
  // Check for new badges
  const badges = progress.badges || [];
  const total = progress.total_stars;
  
  if (total >= 1 && !badges.includes('first_star')) badges.push('first_star');
  if (total >= 5 && !badges.includes('five_stars')) badges.push('five_stars');
  if (total >= 10 && !badges.includes('ten_stars')) badges.push('ten_stars');
  if (total >= 20 && !badges.includes('twenty_stars')) badges.push('twenty_stars');
  
  // Module-specific badges
  if ((progress.counting_stars || 0) >= 5 && !badges.includes('counting_master')) {
    badges.push('counting_master');
  }
  if ((progress.numbers_stars || 0) >= 5 && !badges.includes('number_expert')) {
    badges.push('number_expert');
  }
  if ((progress.addition_stars || 0) >= 5 && !badges.includes('addition_ace')) {
    badges.push('addition_ace');
  }
  if ((progress.shapes_stars || 0) >= 5 && !badges.includes('shape_detective')) {
    badges.push('shape_detective');
  }
  
  progress.badges = badges;
  progress.updated_at = new Date().toISOString();
  
  // Save to localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress:', e);
  }
  
  return progress;
};

export const resetProgress = () => {
  const newProgress = { ...defaultProgress, updated_at: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
  return newProgress;
};

// Question generators (same as backend, for offline use)
const objects = ["🍎", "🌟", "🎈", "🐻", "🌸", "🦋", "🍪", "🚗"];

const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const generateOptions = (correct, min, max, count = 4) => {
  const options = [String(correct)];
  while (options.length < count) {
    const wrong = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!options.includes(String(wrong))) {
      options.push(String(wrong));
    }
  }
  return shuffleArray(options);
};

export const generateQuestion = (module) => {
  const id = Math.random().toString(36).substr(2, 9);
  
  if (module === 'counting') {
    const count = Math.floor(Math.random() * 10) + 1;
    const obj = objects[Math.floor(Math.random() * objects.length)];
    return {
      id,
      type: 'counting',
      question: `How many ${obj} do you see?`,
      options: generateOptions(count, 1, 12),
      correct_answer: String(count),
      visual_data: { object: obj, count }
    };
  }
  
  if (module === 'numbers') {
    const number = Math.floor(Math.random() * 20) + 1;
    return {
      id,
      type: 'numbers',
      question: 'What number is this?',
      options: generateOptions(number, 1, 20),
      correct_answer: String(number),
      visual_data: { number }
    };
  }
  
  if (module === 'addition') {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    const answer = a + b;
    const obj = objects[Math.floor(Math.random() * objects.length)];
    return {
      id,
      type: 'addition',
      question: `${a} + ${b} = ?`,
      options: generateOptions(answer, 2, 18),
      correct_answer: String(answer),
      visual_data: { a, b, object: obj }
    };
  }
  
  if (module === 'subtraction') {
    const a = Math.floor(Math.random() * 11) + 5;
    const b = Math.floor(Math.random() * (a - 1)) + 1;
    const answer = a - b;
    const obj = objects[Math.floor(Math.random() * objects.length)];
    return {
      id,
      type: 'subtraction',
      question: `${a} - ${b} = ?`,
      options: generateOptions(answer, 0, 14),
      correct_answer: String(answer),
      visual_data: { a, b, object: obj }
    };
  }
  
  if (module === 'shapes') {
    const shapes = [
      { name: 'Circle', emoji: '🔴' },
      { name: 'Square', emoji: '🟦' },
      { name: 'Triangle', emoji: '🔺' },
      { name: 'Star', emoji: '⭐' },
      { name: 'Heart', emoji: '❤️' },
      { name: 'Diamond', emoji: '🔷' }
    ];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const otherShapes = shapes.filter(s => s.name !== shape.name).map(s => s.name);
    const options = shuffleArray([shape.name, ...shuffleArray(otherShapes).slice(0, 3)]);
    return {
      id,
      type: 'shapes',
      question: 'What shape is this?',
      options,
      correct_answer: shape.name,
      visual_data: { shape: shape.name, emoji: shape.emoji }
    };
  }
  
  if (module === 'quiz') {
    const modules = ['counting', 'numbers', 'addition', 'subtraction', 'shapes'];
    const randomModule = modules[Math.floor(Math.random() * modules.length)];
    return generateQuestion(randomModule);
  }
  
  return null;
};

// Check if running in Electron
export const isElectron = () => {
  return window.electronAPI?.isElectron || false;
};
