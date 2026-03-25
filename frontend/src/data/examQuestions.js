// Exam-style practice questions based on real school exam patterns
// Sources: K5 Learning, State Practice Tests (Nebraska, Mississippi), AnalyzeMath

export const EXAM_QUESTIONS = {
  // ==================== AGE 5-6 (Kindergarten-Grade 1) ====================
  age_5_6: {
    easy: [
      { q: "Count the apples: 🍎🍎🍎", options: ["2", "3", "4", "5"], answer: "3", type: "counting" },
      { q: "What comes after 5?", options: ["4", "6", "7", "3"], answer: "6", type: "numbers" },
      { q: "2 + 1 = ?", options: ["2", "3", "4", "1"], answer: "3", type: "addition" },
      { q: "3 + 2 = ?", options: ["4", "5", "6", "7"], answer: "5", type: "addition" },
      { q: "Which is a circle?", options: ["⬜", "🔺", "⭕", "⬛"], answer: "⭕", type: "shapes" },
      { q: "4 - 1 = ?", options: ["2", "3", "4", "5"], answer: "3", type: "subtraction" },
      { q: "How many fingers on one hand?", options: ["4", "5", "6", "10"], answer: "5", type: "counting" },
      { q: "1 + 4 = ?", options: ["3", "4", "5", "6"], answer: "5", type: "addition" },
    ],
    medium: [
      { q: "5 + 3 = ?", options: ["7", "8", "9", "6"], answer: "8", type: "addition" },
      { q: "What number is between 6 and 8?", options: ["5", "7", "9", "6"], answer: "7", type: "numbers" },
      { q: "6 - 2 = ?", options: ["3", "4", "5", "2"], answer: "4", type: "subtraction" },
      { q: "Count: 🌟🌟🌟🌟🌟🌟", options: ["5", "6", "7", "8"], answer: "6", type: "counting" },
      { q: "4 + 4 = ?", options: ["6", "7", "8", "9"], answer: "8", type: "addition" },
      { q: "Which shape has 3 sides?", options: ["Circle", "Square", "Triangle", "Rectangle"], answer: "Triangle", type: "shapes" },
      { q: "8 - 3 = ?", options: ["4", "5", "6", "7"], answer: "5", type: "subtraction" },
      { q: "2 + 2 + 2 = ?", options: ["4", "5", "6", "7"], answer: "6", type: "addition" },
    ],
    hard: [
      { q: "7 + 3 = ?", options: ["9", "10", "11", "8"], answer: "10", type: "addition" },
      { q: "10 - 4 = ?", options: ["5", "6", "7", "8"], answer: "6", type: "subtraction" },
      { q: "What is 5 + 5?", options: ["8", "9", "10", "11"], answer: "10", type: "addition" },
      { q: "Count backwards: 10, 9, 8, ?", options: ["6", "7", "5", "11"], answer: "7", type: "numbers" },
      { q: "6 + 4 = ?", options: ["8", "9", "10", "11"], answer: "10", type: "addition" },
      { q: "9 - 5 = ?", options: ["3", "4", "5", "6"], answer: "4", type: "subtraction" },
      { q: "How many corners does a square have?", options: ["3", "4", "5", "0"], answer: "4", type: "shapes" },
      { q: "3 + 4 + 2 = ?", options: ["8", "9", "10", "7"], answer: "9", type: "addition" },
    ]
  },

  // ==================== AGE 7 (Grade 2) ====================
  age_7: {
    easy: [
      { q: "12 + 5 = ?", options: ["16", "17", "18", "15"], answer: "17", type: "addition" },
      { q: "15 - 7 = ?", options: ["7", "8", "9", "6"], answer: "8", type: "subtraction" },
      { q: "What is double 6?", options: ["10", "11", "12", "14"], answer: "12", type: "addition" },
      { q: "Count by 2s: 2, 4, 6, ?", options: ["7", "8", "9", "10"], answer: "8", type: "numbers" },
      { q: "8 + 9 = ?", options: ["15", "16", "17", "18"], answer: "17", type: "addition" },
      { q: "20 - 8 = ?", options: ["10", "11", "12", "13"], answer: "12", type: "subtraction" },
    ],
    medium: [
      { q: "14 + 13 = ?", options: ["25", "26", "27", "28"], answer: "27", type: "addition" },
      { q: "25 - 12 = ?", options: ["11", "12", "13", "14"], answer: "13", type: "subtraction" },
      { q: "Count by 5s: 15, 20, 25, ?", options: ["26", "28", "30", "35"], answer: "30", type: "numbers" },
      { q: "What is half of 18?", options: ["7", "8", "9", "10"], answer: "9", type: "division" },
      { q: "16 + 19 = ?", options: ["33", "34", "35", "36"], answer: "35", type: "addition" },
      { q: "30 - 15 = ?", options: ["13", "14", "15", "16"], answer: "15", type: "subtraction" },
    ],
    hard: [
      { q: "45 + 28 = ?", options: ["71", "72", "73", "74"], answer: "73", type: "addition" },
      { q: "52 - 27 = ?", options: ["23", "24", "25", "26"], answer: "25", type: "subtraction" },
      { q: "What is 17 + 18 + 5?", options: ["38", "39", "40", "41"], answer: "40", type: "addition" },
      { q: "Count by 10s: 40, 50, 60, ?", options: ["65", "70", "75", "80"], answer: "70", type: "numbers" },
      { q: "63 - 29 = ?", options: ["32", "33", "34", "35"], answer: "34", type: "subtraction" },
      { q: "38 + 47 = ?", options: ["83", "84", "85", "86"], answer: "85", type: "addition" },
    ]
  },

  // ==================== AGE 8 (Grade 3) ====================
  age_8: {
    easy: [
      { q: "5 × 3 = ?", options: ["12", "15", "18", "20"], answer: "15", type: "multiplication" },
      { q: "4 × 5 = ?", options: ["18", "20", "22", "25"], answer: "20", type: "multiplication" },
      { q: "2 × 8 = ?", options: ["14", "16", "18", "20"], answer: "16", type: "multiplication" },
      { q: "35 + 48 = ?", options: ["81", "82", "83", "84"], answer: "83", type: "addition" },
      { q: "10 × 6 = ?", options: ["50", "60", "70", "80"], answer: "60", type: "multiplication" },
      { q: "72 - 35 = ?", options: ["35", "36", "37", "38"], answer: "37", type: "subtraction" },
    ],
    medium: [
      { q: "6 × 7 = ?", options: ["40", "42", "44", "48"], answer: "42", type: "multiplication" },
      { q: "8 × 4 = ?", options: ["28", "30", "32", "34"], answer: "32", type: "multiplication" },
      { q: "156 + 287 = ?", options: ["441", "442", "443", "444"], answer: "443", type: "addition" },
      { q: "9 × 5 = ?", options: ["40", "45", "50", "55"], answer: "45", type: "multiplication" },
      { q: "423 - 158 = ?", options: ["263", "264", "265", "266"], answer: "265", type: "subtraction" },
      { q: "7 × 8 = ?", options: ["54", "56", "58", "64"], answer: "56", type: "multiplication" },
    ],
    hard: [
      { q: "9 × 9 = ?", options: ["72", "81", "90", "99"], answer: "81", type: "multiplication" },
      { q: "12 × 5 = ?", options: ["55", "60", "65", "70"], answer: "60", type: "multiplication" },
      { q: "Sam has 24 stickers. He gives 8 to each friend. How many friends?", options: ["2", "3", "4", "5"], answer: "3", type: "word_problem" },
      { q: "A rectangle has length 8cm and width 5cm. What is the perimeter?", options: ["24cm", "26cm", "28cm", "40cm"], answer: "26cm", type: "geometry" },
      { q: "8 × 7 + 6 = ?", options: ["56", "62", "64", "70"], answer: "62", type: "multiplication" },
      { q: "What is 1/4 of 20?", options: ["4", "5", "6", "10"], answer: "5", type: "fractions" },
    ]
  },

  // ==================== AGE 9 (Grade 4) ====================
  age_9: {
    easy: [
      { q: "36 ÷ 6 = ?", options: ["5", "6", "7", "8"], answer: "6", type: "division" },
      { q: "7 × 9 = ?", options: ["56", "63", "72", "81"], answer: "63", type: "multiplication" },
      { q: "48 ÷ 8 = ?", options: ["5", "6", "7", "8"], answer: "6", type: "division" },
      { q: "54 ÷ 9 = ?", options: ["5", "6", "7", "8"], answer: "6", type: "division" },
      { q: "11 × 6 = ?", options: ["60", "66", "72", "77"], answer: "66", type: "multiplication" },
      { q: "81 ÷ 9 = ?", options: ["7", "8", "9", "10"], answer: "9", type: "division" },
    ],
    medium: [
      { q: "234 + 589 = ?", options: ["821", "822", "823", "824"], answer: "823", type: "addition" },
      { q: "72 ÷ 8 = ?", options: ["8", "9", "10", "11"], answer: "9", type: "division" },
      { q: "12 × 12 = ?", options: ["124", "132", "144", "156"], answer: "144", type: "multiplication" },
      { q: "A bus has 48 seats. If 6 people sit in each row, how many rows?", options: ["6", "7", "8", "9"], answer: "8", type: "word_problem" },
      { q: "Round 3,847 to the nearest hundred", options: ["3,800", "3,850", "3,900", "4,000"], answer: "3,800", type: "numbers" },
      { q: "645 - 278 = ?", options: ["365", "366", "367", "368"], answer: "367", type: "subtraction" },
    ],
    hard: [
      { q: "15 × 14 = ?", options: ["200", "210", "220", "230"], answer: "210", type: "multiplication" },
      { q: "132 ÷ 11 = ?", options: ["11", "12", "13", "14"], answer: "12", type: "division" },
      { q: "A shop sells 156 toys on Monday and 289 on Tuesday. How many total?", options: ["435", "445", "455", "465"], answer: "445", type: "word_problem" },
      { q: "What is 3/4 of 48?", options: ["32", "34", "36", "38"], answer: "36", type: "fractions" },
      { q: "Area of rectangle: 15m × 8m = ?", options: ["100m²", "110m²", "120m²", "130m²"], answer: "120m²", type: "geometry" },
      { q: "2,456 + 3,789 = ?", options: ["6,235", "6,245", "6,255", "6,265"], answer: "6,245", type: "addition" },
    ]
  },

  // ==================== AGE 10 (Grade 5) ====================
  age_10: {
    easy: [
      { q: "1/2 + 1/2 = ?", options: ["1/2", "1", "2", "1/4"], answer: "1", type: "fractions" },
      { q: "3/4 - 1/4 = ?", options: ["1/4", "2/4", "3/4", "1"], answer: "2/4", type: "fractions" },
      { q: "What is 10% of 50?", options: ["5", "10", "15", "20"], answer: "5", type: "percentages" },
      { q: "0.5 + 0.3 = ?", options: ["0.7", "0.8", "0.9", "1.0"], answer: "0.8", type: "decimals" },
      { q: "15 × 12 = ?", options: ["160", "170", "180", "190"], answer: "180", type: "multiplication" },
      { q: "144 ÷ 12 = ?", options: ["10", "11", "12", "13"], answer: "12", type: "division" },
    ],
    medium: [
      { q: "2/5 + 2/5 = ?", options: ["2/5", "4/5", "4/10", "1"], answer: "4/5", type: "fractions" },
      { q: "What is 25% of 80?", options: ["15", "20", "25", "30"], answer: "20", type: "percentages" },
      { q: "3.5 × 2 = ?", options: ["6", "6.5", "7", "7.5"], answer: "7", type: "decimals" },
      { q: "Convert 3/4 to a percentage", options: ["70%", "75%", "80%", "85%"], answer: "75%", type: "percentages" },
      { q: "6.8 - 2.3 = ?", options: ["4.3", "4.4", "4.5", "4.6"], answer: "4.5", type: "decimals" },
      { q: "Find the area: square with side 9m", options: ["72m²", "81m²", "90m²", "99m²"], answer: "81m²", type: "geometry" },
    ],
    hard: [
      { q: "3/8 + 5/8 = ?", options: ["7/8", "8/8", "1", "8/16"], answer: "1", type: "fractions" },
      { q: "What is 15% of 200?", options: ["20", "25", "30", "35"], answer: "30", type: "percentages" },
      { q: "12.5 × 4 = ?", options: ["48", "49", "50", "51"], answer: "50", type: "decimals" },
      { q: "If 40% of a class is boys, and there are 30 students, how many boys?", options: ["10", "12", "14", "16"], answer: "12", type: "word_problem" },
      { q: "2/3 × 3/4 = ?", options: ["5/7", "6/12", "1/2", "6/7"], answer: "6/12", type: "fractions" },
      { q: "Triangle area: base 12cm, height 8cm", options: ["44cm²", "46cm²", "48cm²", "96cm²"], answer: "48cm²", type: "geometry" },
    ]
  },

  // ==================== AGE 11 (Grade 6) ====================
  age_11: {
    easy: [
      { q: "What is 50% of 120?", options: ["50", "55", "60", "65"], answer: "60", type: "percentages" },
      { q: "2/3 + 1/3 = ?", options: ["2/3", "3/3", "1", "3/6"], answer: "1", type: "fractions" },
      { q: "15 × 15 = ?", options: ["215", "220", "225", "230"], answer: "225", type: "multiplication" },
      { q: "Convert 0.6 to a fraction", options: ["1/6", "3/5", "6/10", "6/100"], answer: "6/10", type: "fractions" },
      { q: "180 ÷ 15 = ?", options: ["10", "11", "12", "13"], answer: "12", type: "division" },
      { q: "What is 20% of 75?", options: ["12", "13", "14", "15"], answer: "15", type: "percentages" },
    ],
    medium: [
      { q: "3/4 × 2/3 = ?", options: ["5/7", "6/12", "1/2", "6/7"], answer: "6/12", type: "fractions" },
      { q: "A shirt costs $40. It's 25% off. What's the sale price?", options: ["$28", "$30", "$32", "$35"], answer: "$30", type: "word_problem" },
      { q: "Simplify: 12/18", options: ["2/3", "3/4", "4/6", "6/9"], answer: "2/3", type: "fractions" },
      { q: "Find the ratio 15:25 in simplest form", options: ["3:5", "5:3", "1:2", "2:3"], answer: "3:5", type: "ratios" },
      { q: "What is 3² + 4²?", options: ["20", "25", "30", "49"], answer: "25", type: "exponents" },
      { q: "Perimeter of rectangle: 18m × 12m", options: ["56m", "58m", "60m", "62m"], answer: "60m", type: "geometry" },
    ],
    hard: [
      { q: "If 5 books cost $35, how much do 8 books cost?", options: ["$54", "$56", "x$58", "$60"], answer: "$56", type: "word_problem" },
      { q: "5/6 - 1/4 = ?", options: ["7/12", "4/10", "11/12", "1/2"], answer: "7/12", type: "fractions" },
      { q: "30% of what number is 45?", options: ["135", "140", "145", "150"], answer: "150", type: "percentages" },
      { q: "Volume of cube: side = 5cm", options: ["100cm³", "115cm³", "125cm³", "150cm³"], answer: "125cm³", type: "geometry" },
      { q: "Express 7/8 as a decimal", options: ["0.785", "0.825", "0.875", "0.925"], answer: "0.875", type: "fractions" },
      { q: "A car travels 240km in 4 hours. What's the speed?", options: ["50km/h", "55km/h", "60km/h", "65km/h"], answer: "60km/h", type: "word_problem" },
    ]
  },

  // ==================== AGE 12 (Grade 7) ====================
  age_12: {
    easy: [
      { q: "Solve: x + 7 = 15", options: ["6", "7", "8", "9"], answer: "8", type: "algebra" },
      { q: "Solve: x - 5 = 12", options: ["15", "16", "17", "18"], answer: "17", type: "algebra" },
      { q: "What is 5²?", options: ["10", "20", "25", "50"], answer: "25", type: "exponents" },
      { q: "-5 + 8 = ?", options: ["2", "3", "4", "-3"], answer: "3", type: "integers" },
      { q: "Solve: 3x = 21", options: ["5", "6", "7", "8"], answer: "7", type: "algebra" },
      { q: "What is 35% of 60?", options: ["18", "19", "20", "21"], answer: "21", type: "percentages" },
    ],
    medium: [
      { q: "Solve: 2x + 5 = 17", options: ["4", "5", "6", "7"], answer: "6", type: "algebra" },
      { q: "-8 × 3 = ?", options: ["-24", "-21", "21", "24"], answer: "-24", type: "integers" },
      { q: "Solve: x/4 = 9", options: ["32", "34", "36", "38"], answer: "36", type: "algebra" },
      { q: "Area of parallelogram: base 12m, height 7m", options: ["82m²", "84m²", "86m²", "88m²"], answer: "84m²", type: "geometry" },
      { q: "(-6) × (-5) = ?", options: ["-30", "-11", "11", "30"], answer: "30", type: "integers" },
      { q: "If y = 3x - 4, find y when x = 5", options: ["9", "10", "11", "12"], answer: "11", type: "algebra" },
    ],
    hard: [
      { q: "Solve: 3x - 7 = 2x + 5", options: ["10", "11", "12", "13"], answer: "12", type: "algebra" },
      { q: "(-15) ÷ (-3) = ?", options: ["-5", "-12", "5", "12"], answer: "5", type: "integers" },
      { q: "A triangle has angles in ratio 2:3:4. Find the largest angle.", options: ["60°", "70°", "80°", "90°"], answer: "80°", type: "geometry" },
      { q: "Solve: 4(x + 2) = 24", options: ["3", "4", "5", "6"], answer: "4", type: "algebra" },
      { q: "Find x: x/5 + 3 = 8", options: ["20", "25", "30", "35"], answer: "25", type: "algebra" },
      { q: "What is 2³ + 3²?", options: ["15", "16", "17", "18"], answer: "17", type: "exponents" },
    ]
  },

  // ==================== AGE 13 (Grade 8) ====================
  age_13: {
    easy: [
      { q: "Solve: 2x + 3 = 15", options: ["5", "6", "7", "8"], answer: "6", type: "algebra" },
      { q: "What is 4³?", options: ["12", "48", "64", "81"], answer: "64", type: "exponents" },
      { q: "√49 = ?", options: ["6", "7", "8", "9"], answer: "7", type: "square_roots" },
      { q: "Simplify: 3² × 2²", options: ["24", "30", "36", "42"], answer: "36", type: "exponents" },
      { q: "Solve: 5x - 10 = 25", options: ["5", "6", "7", "8"], answer: "7", type: "algebra" },
      { q: "√100 = ?", options: ["8", "9", "10", "11"], answer: "10", type: "square_roots" },
    ],
    medium: [
      { q: "Solve: 3(x - 4) = 15", options: ["7", "8", "9", "10"], answer: "9", type: "algebra" },
      { q: "What is 2⁵?", options: ["16", "24", "32", "64"], answer: "32", type: "exponents" },
      { q: "√144 = ?", options: ["10", "11", "12", "13"], answer: "12", type: "square_roots" },
      { q: "Solve: x² = 81", options: ["±8", "±9", "±10", "81"], answer: "±9", type: "algebra" },
      { q: "If a² + b² = c², and a=3, b=4, find c", options: ["4", "5", "6", "7"], answer: "5", type: "geometry" },
      { q: "Simplify: (2³)²", options: ["32", "48", "64", "128"], answer: "64", type: "exponents" },
    ],
    hard: [
      { q: "Solve: 2(3x + 1) = 4(x - 1) + 10", options: ["0", "1", "2", "3"], answer: "1", type: "algebra" },
      { q: "What is √(64 + 36)?", options: ["8", "9", "10", "11"], answer: "10", type: "square_roots" },
      { q: "Find the hypotenuse: legs 6 and 8", options: ["9", "10", "11", "12"], answer: "10", type: "geometry" },
      { q: "If 2^x = 64, what is x?", options: ["4", "5", "6", "7"], answer: "6", type: "exponents" },
      { q: "Solve: (x+3)(x-2) = 0", options: ["x=3,2", "x=-3,2", "x=3,-2", "x=-3,-2"], answer: "x=-3,2", type: "algebra" },
      { q: "√196 = ?", options: ["12", "13", "14", "15"], answer: "14", type: "square_roots" },
    ]
  },

  // ==================== AGE 14 (Grade 9) ====================
  age_14: {
    easy: [
      { q: "Solve: 4x - 8 = 2x + 6", options: ["5", "6", "7", "8"], answer: "7", type: "algebra" },
      { q: "What is 3⁴?", options: ["27", "64", "81", "108"], answer: "81", type: "exponents" },
      { q: "√225 = ?", options: ["13", "14", "15", "16"], answer: "15", type: "square_roots" },
      { q: "Simplify: 5x + 3x - 2x", options: ["4x", "5x", "6x", "8x"], answer: "6x", type: "algebra" },
      { q: "Solve: x/3 + x/6 = 5", options: ["8", "9", "10", "11"], answer: "10", type: "algebra" },
      { q: "Find slope: points (1,2) and (3,8)", options: ["2", "3", "4", "5"], answer: "3", type: "algebra" },
    ],
    medium: [
      { q: "Solve: 5(2x - 3) = 3(x + 4) + 1", options: ["3", "4", "5", "6"], answer: "4", type: "algebra" },
      { q: "Factor: x² + 5x + 6", options: ["(x+2)(x+3)", "(x+1)(x+6)", "(x+2)(x+4)", "(x+1)(x+5)"], answer: "(x+2)(x+3)", type: "algebra" },
      { q: "What is 5⁰ + 5¹?", options: ["5", "6", "10", "25"], answer: "6", type: "exponents" },
      { q: "Solve: 2x² = 50", options: ["±4", "±5", "±6", "±25"], answer: "±5", type: "algebra" },
      { q: "Area of circle: radius 7 (use π=22/7)", options: ["144", "150", "154", "160"], answer: "154", type: "geometry" },
      { q: "If f(x) = 2x + 3, find f(4)", options: ["8", "9", "10", "11"], answer: "11", type: "functions" },
    ],
    hard: [
      { q: "Solve: x² - 7x + 12 = 0", options: ["x=3,4", "x=-3,-4", "x=2,6", "x=-2,-6"], answer: "x=3,4", type: "algebra" },
      { q: "Simplify: (3x²)(4x³)", options: ["7x⁵", "12x⁵", "12x⁶", "7x⁶"], answer: "12x⁵", type: "algebra" },
      { q: "Distance between (2,3) and (5,7)", options: ["4", "5", "6", "7"], answer: "5", type: "geometry" },
      { q: "If log₂(x) = 5, what is x?", options: ["10", "25", "32", "64"], answer: "32", type: "algebra" },
      { q: "Solve: |2x - 5| = 7", options: ["x=1,6", "x=-1,6", "x=6,-1", "x=-6,1"], answer: "x=-1,6", type: "algebra" },
      { q: "Find the midpoint of (-2,4) and (6,8)", options: ["(2,6)", "(4,6)", "(2,4)", "(4,12)"], answer: "(2,6)", type: "geometry" },
    ]
  }
};

// Time limits per question (in seconds) based on difficulty
export const TIME_LIMITS = {
  easy: { perQuestion: 30, examTotal: 300 },      // 30 sec each, 5 min total
  medium: { perQuestion: 45, examTotal: 450 },    // 45 sec each, 7.5 min total
  hard: { perQuestion: 60, examTotal: 600 }       // 60 sec each, 10 min total
};

// Get questions for an age and difficulty
export const getExamQuestions = (ageCategory, difficulty, count = 10) => {
  const ageKey = ageCategory.replace("age_", "age_");
  const questions = EXAM_QUESTIONS[ageKey]?.[difficulty] || [];
  
  // Shuffle and return requested count
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

export default EXAM_QUESTIONS;
