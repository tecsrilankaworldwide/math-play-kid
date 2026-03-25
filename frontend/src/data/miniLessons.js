// Mini-lessons with simple explanations for each math topic
// Based on Khan Academy and visual learning approaches

export const MINI_LESSONS = {
  // ==================== AGES 5-7 ====================
  counting: {
    title: "Let's Learn to Count!",
    emoji: "🔢",
    forAges: [5, 6, 7],
    explanation: "Counting means saying numbers in order while pointing at things, one by one.",
    example: {
      visual: "🍎 🍎 🍎",
      text: "Point and count: One... Two... Three! There are 3 apples!"
    },
    tip: "Touch each thing as you count. Don't skip any!",
    funFact: "You use counting every day - counting toys, fingers, or steps!"
  },

  numbers: {
    title: "Meet the Numbers!",
    emoji: "1️⃣",
    forAges: [5, 6, 7],
    explanation: "Numbers are symbols that show 'how many'. Each number has its own look!",
    example: {
      visual: "5 = 🖐️",
      text: "The number 5 looks like this: 5. It means five things, like 5 fingers on your hand!"
    },
    tip: "Practice writing numbers. Say them out loud as you write!",
    funFact: "The number 0 means nothing at all - zero cookies means no cookies! 😢"
  },

  shapes: {
    title: "Fun with Shapes!",
    emoji: "🔷",
    forAges: [5, 6, 7, 8],
    explanation: "Shapes are all around us! They have different sides and corners.",
    example: {
      visual: "⬜ = 4 sides | 🔺 = 3 sides | ⭕ = 0 sides",
      text: "A square has 4 equal sides. A triangle has 3 sides. A circle is round with no corners!"
    },
    tip: "Look around your room - can you find circles, squares, and triangles?",
    funFact: "Pizza is a circle! When you cut a slice, you make a triangle! 🍕"
  },

  // ==================== ADDITION & SUBTRACTION ====================
  addition: {
    title: "Adding Numbers Together",
    emoji: "➕",
    forAges: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    explanationByAge: {
      young: "Addition means putting things together to find out how many in total.",
      older: "Addition combines two or more numbers to get a sum. It's the foundation of all math!"
    },
    example: {
      visual: "🍎🍎 + 🍎🍎🍎 = 🍎🍎🍎🍎🍎",
      text: "2 apples + 3 apples = 5 apples. We put them together!"
    },
    tip: "You can use your fingers to help add small numbers!",
    funFact: "The plus sign (+) was invented over 500 years ago!"
  },

  subtraction: {
    title: "Taking Away Numbers",
    emoji: "➖",
    forAges: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    explanationByAge: {
      young: "Subtraction means taking some away to find out how many are left.",
      older: "Subtraction finds the difference between numbers. It's the opposite of addition!"
    },
    example: {
      visual: "🍪🍪🍪🍪🍪 - 🍪🍪 = 🍪🍪🍪",
      text: "5 cookies - 2 cookies = 3 cookies left. Yum!"
    },
    tip: "Think: 'How many are LEFT after taking some away?'",
    funFact: "Subtraction helps you know if you have enough money to buy something!"
  },

  // ==================== MULTIPLICATION & DIVISION ====================
  multiplication: {
    title: "Super Fast Adding!",
    emoji: "✖️",
    forAges: [8, 9, 10, 11, 12, 13, 14],
    explanation: "Multiplication is a shortcut for adding the same number many times.",
    example: {
      visual: "3 × 4 means: 🍎🍎🍎 + 🍎🍎🍎 + 🍎🍎🍎 + 🍎🍎🍎 = 12 apples",
      text: "Instead of adding 3+3+3+3, we say 3 × 4 = 12. Much faster!"
    },
    tip: "Learn your times tables! Start with 2s, 5s, and 10s - they're easiest!",
    funFact: "3 × 4 = 4 × 3. The order doesn't matter! This is called 'commutative property'."
  },

  division: {
    title: "Sharing Equally",
    emoji: "➗",
    forAges: [9, 10, 11, 12, 13, 14],
    explanation: "Division means splitting things into equal groups. It's the opposite of multiplication!",
    example: {
      visual: "12 ÷ 3 = ? → 🍬🍬🍬🍬 | 🍬🍬🍬🍬 | 🍬🍬🍬🍬 → 4 in each group!",
      text: "12 candies shared by 3 friends = 4 candies each. Fair and square!"
    },
    tip: "Think: 'How many groups?' or 'How many in each group?'",
    funFact: "Division helps you split pizza fairly among friends! 🍕"
  },

  // ==================== FRACTIONS ====================
  fractions: {
    title: "Parts of a Whole",
    emoji: "🥧",
    forAges: [10, 11, 12, 13, 14],
    explanation: "A fraction shows a PART of something. The top number is how many parts you have. The bottom number is how many equal parts the whole is split into.",
    example: {
      visual: "🍕 cut into 4 slices. You eat 1 slice = 1/4 (one quarter)",
      text: "1/4 means 1 out of 4 equal parts. If you eat 2 slices, that's 2/4 = 1/2 (half the pizza)!"
    },
    parts: {
      numerator: "Top number = pieces you HAVE",
      denominator: "Bottom number = pieces in TOTAL"
    },
    tip: "Think of fractions as pizza slices! 🍕",
    funFact: "1/2 = 2/4 = 4/8. These are called 'equivalent fractions' - same amount, different numbers!"
  },

  // ==================== PERCENTAGES ====================
  percentages: {
    title: "Out of 100",
    emoji: "💯",
    forAges: [11, 12, 13, 14],
    explanation: "Percent means 'out of 100'. It's another way to show parts of a whole!",
    example: {
      visual: "50% = 50 out of 100 = half = 1/2",
      text: "If you score 80% on a test, you got 80 out of 100 questions right!"
    },
    quickConvert: {
      "50%": "= 1/2 (half)",
      "25%": "= 1/4 (quarter)",
      "10%": "= 1/10 (divide by 10)",
      "100%": "= everything!"
    },
    tip: "To find 10% of any number, just move the decimal point one place left! 10% of 50 = 5",
    funFact: "Sales use percentages: '20% off' means you save 20 out of every 100!"
  },

  // ==================== ALGEBRA ====================
  algebra: {
    title: "Finding the Mystery Number",
    emoji: "🔍",
    forAges: [12, 13, 14],
    explanation: "Algebra uses letters (like x) to represent unknown numbers. Your job is to find what number x equals!",
    example: {
      visual: "x + 3 = 7",
      text: "What number plus 3 equals 7? Think: ___ + 3 = 7. The answer is x = 4!"
    },
    steps: [
      "1. Look at the equation",
      "2. Get x alone on one side",
      "3. Whatever you do to one side, do to the other!",
      "4. Check your answer"
    ],
    tip: "x is just a mystery box 📦. What number goes inside to make the equation true?",
    funFact: "The letter 'x' was first used for unknowns by a French mathematician in 1637!"
  },

  // ==================== EXPONENTS ====================
  exponents: {
    title: "Superpower Multiplication!",
    emoji: "⚡",
    forAges: [13, 14],
    explanation: "An exponent (the small number) tells you how many times to multiply a number by itself.",
    example: {
      visual: "2³ = 2 × 2 × 2 = 8",
      text: "The big number (2) is the BASE. The small number (3) is the EXPONENT. Multiply 2 by itself 3 times!"
    },
    moreExamples: [
      "3² = 3 × 3 = 9 (called '3 squared')",
      "5³ = 5 × 5 × 5 = 125 (called '5 cubed')",
      "10² = 10 × 10 = 100"
    ],
    tip: "² is 'squared' (makes a square!). ³ is 'cubed' (makes a cube!).",
    funFact: "Exponents grow FAST! 2¹⁰ = 1,024. That's why computer memory doubles so quickly!"
  },

  // ==================== SQUARE ROOTS ====================
  square_roots: {
    title: "Un-doing Squares",
    emoji: "√",
    forAges: [13, 14],
    explanation: "A square root asks: 'What number times ITSELF equals this?' It's the opposite of squaring!",
    example: {
      visual: "√25 = 5 because 5 × 5 = 25",
      text: "What times itself = 25? It's 5! So √25 = 5"
    },
    perfectSquares: [
      "√4 = 2 (because 2×2=4)",
      "√9 = 3 (because 3×3=9)",
      "√16 = 4 (because 4×4=16)",
      "√36 = 6 (because 6×6=36)",
      "√49 = 7 (because 7×7=49)",
      "√64 = 8 (because 8×8=64)",
      "√81 = 9 (because 9×9=81)",
      "√100 = 10 (because 10×10=100)"
    ],
    tip: "Memorize the perfect squares: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100!",
    funFact: "The √ symbol is called a 'radical'. It comes from the Latin word for 'root'!"
  },

  // ==================== GEOMETRY ====================
  geometry: {
    title: "Measuring Shapes",
    emoji: "📐",
    forAges: [12, 13, 14],
    explanation: "Geometry helps us measure shapes - how much space they cover (AREA) and the distance around them (PERIMETER).",
    concepts: {
      area: {
        title: "Area = Space Inside",
        formula: "Rectangle: Length × Width",
        example: "A room 5m × 4m = 20 square meters of floor to cover"
      },
      perimeter: {
        title: "Perimeter = Distance Around",
        formula: "Rectangle: 2 × (Length + Width)",
        example: "A 5m × 4m room needs 2×(5+4) = 18 meters of fencing"
      },
      triangle: {
        title: "Triangle Area",
        formula: "Base × Height ÷ 2",
        example: "A triangle with base 6 and height 4: (6×4)÷2 = 12"
      }
    },
    tip: "AREA = square units (m²). PERIMETER = regular units (m).",
    funFact: "Ancient Egyptians used geometry to rebuild farm boundaries after the Nile flooded every year!"
  }
};

// Get appropriate lesson for age
export const getLessonForAge = (module, age) => {
  const lesson = MINI_LESSONS[module];
  if (!lesson) return null;
  
  // Check if lesson is for this age
  if (lesson.forAges && !lesson.forAges.includes(age)) {
    return null;
  }
  
  // Get age-appropriate explanation
  let explanation = lesson.explanation;
  if (lesson.explanationByAge) {
    explanation = age <= 8 ? lesson.explanationByAge.young : lesson.explanationByAge.older;
  }
  
  return {
    ...lesson,
    explanation
  };
};

export default MINI_LESSONS;
