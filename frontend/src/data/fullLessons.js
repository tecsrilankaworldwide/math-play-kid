// Full Lessons with multiple pages, visuals, and step-by-step explanations
// Based on Open Educational Resources: Illustrative Mathematics, Khan Academy, K5 Learning

export const FULL_LESSONS = {
  // ==================== COUNTING (Ages 5-7) ====================
  counting: {
    title: "Learning to Count",
    emoji: "🔢",
    forAges: [5, 6, 7],
    totalPages: 3,
    pages: [
      {
        title: "What is Counting?",
        content: [
          {
            type: "text",
            value: "Counting is saying numbers in order: 1, 2, 3, 4, 5..."
          },
          {
            type: "text",
            value: "When we count THINGS, we point to each one and say a number."
          },
          {
            type: "visual",
            layout: "row",
            items: ["🍎", "🍎", "🍎"],
            caption: "Point and say: ONE... TWO... THREE!"
          },
          {
            type: "tip",
            value: "Touch each thing as you count. Don't skip any!"
          }
        ]
      },
      {
        title: "Let's Practice Together",
        content: [
          {
            type: "text",
            value: "Count these stars with me:"
          },
          {
            type: "visual",
            layout: "row",
            items: ["⭐", "⭐", "⭐", "⭐", "⭐"],
            caption: "1... 2... 3... 4... 5! There are FIVE stars!"
          },
          {
            type: "text",
            value: "Now try these cookies:"
          },
          {
            type: "visual",
            layout: "row",
            items: ["🍪", "🍪", "🍪", "🍪"],
            caption: "How many cookies? (Answer: 4)"
          },
          {
            type: "remember",
            value: "Always start counting from 1, not 0!"
          }
        ]
      },
      {
        title: "Counting Tips",
        content: [
          {
            type: "steps",
            title: "How to Count Correctly:",
            items: [
              "Line up the objects if you can",
              "Point to each one",
              "Say one number for each object",
              "The LAST number you say is the total!"
            ]
          },
          {
            type: "visual",
            layout: "grid",
            items: ["🐻", "🐻", "🐻", "🐻", "🐻", "🐻"],
            caption: "6 teddy bears in 2 rows of 3"
          },
          {
            type: "funfact",
            value: "You can count anything - toys, steps, fingers, even clouds in the sky!"
          }
        ]
      }
    ]
  },

  // ==================== ADDITION (All ages) ====================
  addition: {
    title: "Adding Numbers",
    emoji: "➕",
    forAges: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    totalPages: 4,
    pages: [
      {
        title: "What is Addition?",
        content: [
          {
            type: "text",
            value: "Addition means putting things TOGETHER to find the TOTAL."
          },
          {
            type: "text", 
            value: "The + sign means 'add' or 'plus'. The = sign means 'equals' or 'is'."
          },
          {
            type: "equation",
            left: "2 + 3",
            right: "5",
            explanation: "Two plus three equals five"
          },
          {
            type: "visual",
            layout: "addition",
            group1: ["🍎", "🍎"],
            group2: ["🍎", "🍎", "🍎"],
            result: ["🍎", "🍎", "🍎", "🍎", "🍎"],
            caption: "2 apples + 3 apples = 5 apples total!"
          }
        ]
      },
      {
        title: "Using Your Fingers",
        content: [
          {
            type: "text",
            value: "Your fingers are the best calculator! Here's how to use them:"
          },
          {
            type: "steps",
            title: "Finger Addition:",
            items: [
              "Hold up fingers for the first number",
              "Hold up more fingers for the second number", 
              "Count ALL your fingers",
              "That's your answer!"
            ]
          },
          {
            type: "example",
            problem: "4 + 3 = ?",
            solution: "Hold up 4 fingers... now 3 more... count all: 1,2,3,4,5,6,7 = 7!"
          },
          {
            type: "visual",
            layout: "row",
            items: ["✋", "🤟"],
            caption: "5 fingers + 3 fingers = 8 fingers"
          }
        ]
      },
      {
        title: "Number Line Method",
        content: [
          {
            type: "text",
            value: "A number line helps us see addition as 'jumping forward'."
          },
          {
            type: "numberline",
            start: 0,
            end: 10,
            jumps: [
              { from: 3, amount: 4, color: "green" }
            ],
            caption: "3 + 4: Start at 3, jump 4 spaces forward, land on 7!"
          },
          {
            type: "text",
            value: "Try this: 5 + 3"
          },
          {
            type: "numberline",
            start: 0,
            end: 10,
            jumps: [
              { from: 5, amount: 3, color: "blue" }
            ],
            caption: "Start at 5, jump 3... you land on 8!"
          }
        ]
      },
      {
        title: "Addition Facts to Remember",
        content: [
          {
            type: "text",
            value: "Some additions are good to memorize - they help you go faster!"
          },
          {
            type: "table",
            title: "Doubles (same number + same number)",
            rows: [
              ["1 + 1 = 2", "2 + 2 = 4", "3 + 3 = 6"],
              ["4 + 4 = 8", "5 + 5 = 10", "6 + 6 = 12"]
            ]
          },
          {
            type: "table",
            title: "Make 10 (numbers that add to 10)",
            rows: [
              ["1 + 9 = 10", "2 + 8 = 10", "3 + 7 = 10"],
              ["4 + 6 = 10", "5 + 5 = 10", ""]
            ]
          },
          {
            type: "tip",
            value: "Order doesn't matter! 3 + 5 = 5 + 3 = 8"
          }
        ]
      }
    ]
  },

  // ==================== SUBTRACTION ====================
  subtraction: {
    title: "Taking Away Numbers",
    emoji: "➖",
    forAges: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    totalPages: 3,
    pages: [
      {
        title: "What is Subtraction?",
        content: [
          {
            type: "text",
            value: "Subtraction means TAKING AWAY to find what's LEFT."
          },
          {
            type: "text",
            value: "The - sign means 'minus' or 'take away'."
          },
          {
            type: "equation",
            left: "5 - 2",
            right: "3",
            explanation: "Five minus two equals three"
          },
          {
            type: "visual",
            layout: "subtraction",
            start: ["🍪", "🍪", "🍪", "🍪", "🍪"],
            remove: 2,
            caption: "5 cookies, eat 2... 3 cookies left!"
          }
        ]
      },
      {
        title: "Counting Back Method",
        content: [
          {
            type: "text",
            value: "To subtract, count BACKWARDS from the bigger number."
          },
          {
            type: "example",
            problem: "8 - 3 = ?",
            solution: "Start at 8... count back 3: 7, 6, 5. Answer: 5!"
          },
          {
            type: "numberline",
            start: 0,
            end: 10,
            jumps: [
              { from: 8, amount: -3, color: "red" }
            ],
            caption: "8 - 3: Start at 8, jump BACK 3 spaces, land on 5!"
          },
          {
            type: "tip",
            value: "Subtraction is the OPPOSITE of addition. If 3 + 5 = 8, then 8 - 5 = 3!"
          }
        ]
      },
      {
        title: "Practice Problems",
        content: [
          {
            type: "text",
            value: "Think about these real-life problems:"
          },
          {
            type: "wordproblem",
            story: "You have 7 balloons. 2 fly away. How many left?",
            visual: ["🎈", "🎈", "🎈", "🎈", "🎈", "🎈", "🎈"],
            equation: "7 - 2 = 5",
            answer: "5 balloons"
          },
          {
            type: "wordproblem",
            story: "Mom baked 10 cookies. You ate 4. How many for dad?",
            visual: ["🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪"],
            equation: "10 - 4 = 6",
            answer: "6 cookies"
          }
        ]
      }
    ]
  },

  // ==================== MULTIPLICATION ====================
  multiplication: {
    title: "Multiplication - Super Fast Adding!",
    emoji: "✖️",
    forAges: [8, 9, 10, 11, 12, 13, 14],
    totalPages: 4,
    pages: [
      {
        title: "What is Multiplication?",
        content: [
          {
            type: "text",
            value: "Multiplication is a SHORTCUT for adding the same number many times."
          },
          {
            type: "comparison",
            slow: "3 + 3 + 3 + 3 = 12",
            fast: "3 × 4 = 12",
            caption: "Same answer, but × is much faster!"
          },
          {
            type: "text",
            value: "3 × 4 means '3 groups of 4' OR '4 groups of 3'"
          },
          {
            type: "visual",
            layout: "groups",
            groups: [
              ["⭐", "⭐", "⭐"],
              ["⭐", "⭐", "⭐"],
              ["⭐", "⭐", "⭐"],
              ["⭐", "⭐", "⭐"]
            ],
            caption: "4 groups of 3 stars = 12 stars total"
          }
        ]
      },
      {
        title: "Arrays - Seeing Multiplication",
        content: [
          {
            type: "text",
            value: "An ARRAY shows multiplication as rows and columns."
          },
          {
            type: "array",
            rows: 3,
            cols: 5,
            emoji: "🔵",
            caption: "3 rows × 5 columns = 15 dots"
          },
          {
            type: "text",
            value: "Turn it sideways and it's still the same!"
          },
          {
            type: "array",
            rows: 5,
            cols: 3,
            emoji: "🔵",
            caption: "5 rows × 3 columns = 15 dots (same total!)"
          },
          {
            type: "remember",
            value: "3 × 5 = 5 × 3 = 15. Order doesn't matter!"
          }
        ]
      },
      {
        title: "Times Tables Tricks",
        content: [
          {
            type: "text",
            value: "Here are some easy patterns to remember:"
          },
          {
            type: "trick",
            title: "× 2 = Double it!",
            examples: ["2 × 6 = 12 (6 + 6)", "2 × 8 = 16 (8 + 8)"]
          },
          {
            type: "trick",
            title: "× 5 = Count by 5s",
            examples: ["5, 10, 15, 20, 25, 30...", "5 × 7 = 35 (count 5 seven times)"]
          },
          {
            type: "trick",
            title: "× 10 = Add a zero!",
            examples: ["10 × 4 = 40", "10 × 7 = 70", "10 × 12 = 120"]
          },
          {
            type: "trick",
            title: "× 9 = Finger trick!",
            examples: ["Hold up 10 fingers", "Put down finger #4 for 9×4", "Answer: 36 (3 fingers, then 6 fingers)"]
          }
        ]
      },
      {
        title: "Times Table Chart",
        content: [
          {
            type: "text",
            value: "Use this chart to practice. Find where the row and column meet!"
          },
          {
            type: "timestable",
            size: 10
          },
          {
            type: "tip",
            value: "Start by learning 2s, 5s, and 10s - they're the easiest!"
          }
        ]
      }
    ]
  },

  // ==================== DIVISION ====================
  division: {
    title: "Division - Fair Sharing",
    emoji: "➗",
    forAges: [9, 10, 11, 12, 13, 14],
    totalPages: 3,
    pages: [
      {
        title: "What is Division?",
        content: [
          {
            type: "text",
            value: "Division means SHARING equally or making EQUAL GROUPS."
          },
          {
            type: "text",
            value: "The ÷ sign means 'divided by'."
          },
          {
            type: "equation",
            left: "12 ÷ 3",
            right: "4",
            explanation: "12 shared by 3 people = 4 each"
          },
          {
            type: "visual",
            layout: "division",
            total: ["🍬","🍬","🍬","🍬","🍬","🍬","🍬","🍬","🍬","🍬","🍬","🍬"],
            groups: 3,
            caption: "12 candies ÷ 3 friends = 4 candies each"
          }
        ]
      },
      {
        title: "Division is Opposite of Multiplication",
        content: [
          {
            type: "text",
            value: "If you know multiplication, you know division!"
          },
          {
            type: "factfamily",
            numbers: [3, 4, 12],
            facts: [
              "3 × 4 = 12",
              "4 × 3 = 12",
              "12 ÷ 3 = 4",
              "12 ÷ 4 = 3"
            ],
            caption: "These 4 facts use the same 3 numbers!"
          },
          {
            type: "example",
            problem: "24 ÷ 6 = ?",
            solution: "Think: What times 6 equals 24? 4 × 6 = 24, so 24 ÷ 6 = 4!"
          }
        ]
      },
      {
        title: "Division Word Problems",
        content: [
          {
            type: "text",
            value: "Look for these clue words: share, split, divide, each, per"
          },
          {
            type: "wordproblem",
            story: "20 stickers shared equally among 5 kids. How many does each kid get?",
            equation: "20 ÷ 5 = 4",
            answer: "4 stickers each"
          },
          {
            type: "wordproblem",
            story: "You have 18 cookies. You put 3 cookies in each bag. How many bags?",
            equation: "18 ÷ 3 = 6",
            answer: "6 bags"
          },
          {
            type: "tip",
            value: "Division answers a question: 'How many in each group?' OR 'How many groups?'"
          }
        ]
      }
    ]
  },

  // ==================== FRACTIONS ====================
  fractions: {
    title: "Fractions - Parts of a Whole",
    emoji: "🥧",
    forAges: [10, 11, 12, 13, 14],
    totalPages: 4,
    pages: [
      {
        title: "What is a Fraction?",
        content: [
          {
            type: "text",
            value: "A fraction shows PART of something whole."
          },
          {
            type: "fraction-visual",
            numerator: 1,
            denominator: 4,
            visual: "pizza",
            caption: "1/4 = one slice out of four total slices"
          },
          {
            type: "text",
            value: "A fraction has two numbers:"
          },
          {
            type: "fraction-parts",
            top: { name: "Numerator", meaning: "How many parts you HAVE" },
            bottom: { name: "Denominator", meaning: "How many EQUAL parts in total" }
          }
        ]
      },
      {
        title: "Fractions You See Every Day",
        content: [
          {
            type: "text",
            value: "You already use fractions without knowing it!"
          },
          {
            type: "examples-grid",
            items: [
              { fraction: "1/2", meaning: "Half", example: "Half a sandwich 🥪" },
              { fraction: "1/4", meaning: "Quarter", example: "Quarter coin, quarter hour ⏰" },
              { fraction: "3/4", meaning: "Three quarters", example: "Almost full glass 🥛" },
              { fraction: "1/3", meaning: "One third", example: "Share pizza with 2 friends 🍕" }
            ]
          },
          {
            type: "tip",
            value: "The BIGGER the bottom number, the SMALLER each piece!"
          }
        ]
      },
      {
        title: "Equivalent Fractions",
        content: [
          {
            type: "text",
            value: "Different fractions can show the SAME amount!"
          },
          {
            type: "equivalent-visual",
            fractions: ["1/2", "2/4", "4/8"],
            caption: "These all show HALF - same amount, different numbers!"
          },
          {
            type: "text",
            value: "To make equivalent fractions: multiply top AND bottom by the same number."
          },
          {
            type: "example",
            problem: "1/2 = ?/4",
            solution: "Multiply top and bottom by 2: (1×2)/(2×2) = 2/4 ✓"
          }
        ]
      },
      {
        title: "Adding Fractions",
        content: [
          {
            type: "text",
            value: "To add fractions, the BOTTOM numbers must be the SAME."
          },
          {
            type: "equation",
            left: "1/4 + 2/4",
            right: "3/4",
            explanation: "Same bottom (4), so just add the tops: 1 + 2 = 3"
          },
          {
            type: "visual",
            layout: "fraction-add",
            f1: { num: 1, den: 4 },
            f2: { num: 2, den: 4 },
            result: { num: 3, den: 4 }
          },
          {
            type: "remember",
            value: "Only add the TOP numbers. The bottom stays the same!"
          }
        ]
      }
    ]
  },

  // ==================== PERCENTAGES ====================
  percentages: {
    title: "Percentages - Out of 100",
    emoji: "💯",
    forAges: [11, 12, 13, 14],
    totalPages: 3,
    pages: [
      {
        title: "What is a Percentage?",
        content: [
          {
            type: "text",
            value: "Percent means 'out of 100'. The % symbol means 'percent'."
          },
          {
            type: "text",
            value: "50% = 50 out of 100 = half"
          },
          {
            type: "percent-visual",
            percent: 50,
            caption: "50% = half the grid is filled"
          },
          {
            type: "examples-grid",
            items: [
              { percent: "100%", meaning: "All of it", visual: "Full battery 🔋" },
              { percent: "50%", meaning: "Half", visual: "Half full 🥛" },
              { percent: "25%", meaning: "Quarter", visual: "1 out of 4 ◔" },
              { percent: "0%", meaning: "None", visual: "Empty ⭕" }
            ]
          }
        ]
      },
      {
        title: "Percentages and Fractions",
        content: [
          {
            type: "text",
            value: "Percentages and fractions are friends! You can convert between them."
          },
          {
            type: "conversion-table",
            items: [
              { percent: "50%", fraction: "1/2", decimal: "0.5" },
              { percent: "25%", fraction: "1/4", decimal: "0.25" },
              { percent: "75%", fraction: "3/4", decimal: "0.75" },
              { percent: "10%", fraction: "1/10", decimal: "0.1" },
              { percent: "20%", fraction: "1/5", decimal: "0.2" }
            ]
          },
          {
            type: "tip",
            value: "To change fraction to %: divide, then × 100. Example: 1/4 = 0.25 = 25%"
          }
        ]
      },
      {
        title: "Finding Percentages",
        content: [
          {
            type: "text",
            value: "To find a percentage of a number:"
          },
          {
            type: "steps",
            title: "Method 1: Divide then Multiply",
            items: [
              "Find 1% by dividing by 100",
              "Multiply by the percentage you want"
            ]
          },
          {
            type: "example",
            problem: "What is 20% of 50?",
            solution: "1% of 50 = 0.5, so 20% = 0.5 × 20 = 10"
          },
          {
            type: "shortcut",
            title: "Quick Tricks:",
            items: [
              "10% = divide by 10 (easy!)",
              "50% = divide by 2 (half!)",
              "25% = divide by 4 (quarter!)"
            ]
          }
        ]
      }
    ]
  },

  // ==================== ALGEBRA ====================
  algebra: {
    title: "Algebra - Finding Mystery Numbers",
    emoji: "🔍",
    forAges: [12, 13, 14],
    totalPages: 4,
    pages: [
      {
        title: "What is Algebra?",
        content: [
          {
            type: "text",
            value: "Algebra uses LETTERS to represent unknown numbers. Usually we use 'x'."
          },
          {
            type: "text",
            value: "Think of x as a mystery box 📦 - your job is to find what number is inside!"
          },
          {
            type: "equation",
            left: "x + 5",
            right: "12",
            explanation: "What number plus 5 equals 12? x = 7!"
          },
          {
            type: "visual",
            layout: "balance",
            left: ["📦", "+", "5"],
            right: ["12"],
            caption: "An equation is like a BALANCE - both sides must be equal!"
          }
        ]
      },
      {
        title: "Solving Simple Equations",
        content: [
          {
            type: "text",
            value: "To solve for x, get x ALONE on one side."
          },
          {
            type: "text",
            value: "Golden Rule: What you do to one side, you MUST do to the other!"
          },
          {
            type: "steps",
            title: "Solve x + 5 = 12",
            items: [
              "We want x alone",
              "Subtract 5 from BOTH sides",
              "x + 5 - 5 = 12 - 5",
              "x = 7 ✓"
            ]
          },
          {
            type: "check",
            equation: "x + 5 = 12",
            solution: "x = 7",
            verify: "7 + 5 = 12 ✓ It works!"
          }
        ]
      },
      {
        title: "Opposite Operations",
        content: [
          {
            type: "text",
            value: "To undo an operation, use the OPPOSITE operation:"
          },
          {
            type: "opposites-table",
            pairs: [
              { operation: "Addition (+)", opposite: "Subtraction (-)" },
              { operation: "Subtraction (-)", opposite: "Addition (+)" },
              { operation: "Multiplication (×)", opposite: "Division (÷)" },
              { operation: "Division (÷)", opposite: "Multiplication (×)" }
            ]
          },
          {
            type: "example",
            problem: "3x = 15",
            solution: "x is multiplied by 3, so DIVIDE both sides by 3: x = 15 ÷ 3 = 5"
          }
        ]
      },
      {
        title: "Two-Step Equations",
        content: [
          {
            type: "text",
            value: "Some equations need TWO steps to solve."
          },
          {
            type: "steps",
            title: "Solve 2x + 3 = 11",
            items: [
              "Step 1: Remove the +3 (subtract 3 from both sides)",
              "2x + 3 - 3 = 11 - 3",
              "2x = 8",
              "Step 2: Remove the ×2 (divide both sides by 2)",
              "x = 8 ÷ 2 = 4"
            ]
          },
          {
            type: "remember",
            value: "Always do + and - first, then × and ÷ (reverse of PEMDAS!)"
          }
        ]
      }
    ]
  },

  // ==================== EXPONENTS ====================
  exponents: {
    title: "Exponents - Power Numbers!",
    emoji: "⚡",
    forAges: [13, 14],
    totalPages: 3,
    pages: [
      {
        title: "What are Exponents?",
        content: [
          {
            type: "text",
            value: "An exponent tells you how many times to multiply a number by ITSELF."
          },
          {
            type: "exponent-visual",
            base: 2,
            exponent: 3,
            expanded: "2 × 2 × 2",
            result: 8
          },
          {
            type: "text",
            value: "The big number is the BASE. The small number is the EXPONENT (or power)."
          },
          {
            type: "examples-grid",
            items: [
              { exp: "3²", read: "3 squared", calc: "3 × 3 = 9" },
              { exp: "4³", read: "4 cubed", calc: "4 × 4 × 4 = 64" },
              { exp: "2⁵", read: "2 to the 5th", calc: "2×2×2×2×2 = 32" }
            ]
          }
        ]
      },
      {
        title: "Special Exponents",
        content: [
          {
            type: "text",
            value: "Some exponents have special names and rules:"
          },
          {
            type: "special-rules",
            items: [
              { rule: "Any number to the power of 1 = itself", example: "5¹ = 5" },
              { rule: "Any number to the power of 0 = 1", example: "5⁰ = 1 (weird but true!)" },
              { rule: "² is called 'squared' (makes a square!)", example: "4² = 16 (4×4 grid)" },
              { rule: "³ is called 'cubed' (makes a cube!)", example: "3³ = 27 (3×3×3 box)" }
            ]
          },
          {
            type: "visual",
            layout: "square",
            size: 4,
            caption: "4² = 4 × 4 = 16 squares in a 4×4 grid"
          }
        ]
      },
      {
        title: "Powers of 2 and 10",
        content: [
          {
            type: "text",
            value: "These are super useful to memorize!"
          },
          {
            type: "powers-table",
            title: "Powers of 2 (doubles each time!)",
            items: ["2¹=2", "2²=4", "2³=8", "2⁴=16", "2⁵=32", "2⁶=64", "2⁷=128", "2⁸=256"]
          },
          {
            type: "powers-table",
            title: "Powers of 10 (just add zeros!)",
            items: ["10¹=10", "10²=100", "10³=1,000", "10⁴=10,000", "10⁵=100,000"]
          },
          {
            type: "funfact",
            value: "Computer memory uses powers of 2: 256, 512, 1024 (that's why we have 256GB phones!)"
          }
        ]
      }
    ]
  },

  // ==================== SQUARE ROOTS ====================
  square_roots: {
    title: "Square Roots - Un-doing Squares",
    emoji: "√",
    forAges: [13, 14],
    totalPages: 3,
    pages: [
      {
        title: "What is a Square Root?",
        content: [
          {
            type: "text",
            value: "A square root asks: 'What number times ITSELF equals this?'"
          },
          {
            type: "text",
            value: "The √ symbol means 'square root of'."
          },
          {
            type: "equation",
            left: "√25",
            right: "5",
            explanation: "Because 5 × 5 = 25"
          },
          {
            type: "visual",
            layout: "square",
            size: 5,
            caption: "A 5×5 square has 25 little squares. So √25 = 5"
          }
        ]
      },
      {
        title: "Perfect Squares",
        content: [
          {
            type: "text",
            value: "These numbers have 'nice' square roots (whole numbers). Memorize them!"
          },
          {
            type: "perfect-squares-table",
            items: [
              { number: 1, root: 1, because: "1 × 1 = 1" },
              { number: 4, root: 2, because: "2 × 2 = 4" },
              { number: 9, root: 3, because: "3 × 3 = 9" },
              { number: 16, root: 4, because: "4 × 4 = 16" },
              { number: 25, root: 5, because: "5 × 5 = 25" },
              { number: 36, root: 6, because: "6 × 6 = 36" },
              { number: 49, root: 7, because: "7 × 7 = 49" },
              { number: 64, root: 8, because: "8 × 8 = 64" },
              { number: 81, root: 9, because: "9 × 9 = 81" },
              { number: 100, root: 10, because: "10 × 10 = 100" },
              { number: 121, root: 11, because: "11 × 11 = 121" },
              { number: 144, root: 12, because: "12 × 12 = 144" }
            ]
          }
        ]
      },
      {
        title: "Square Roots and Squares are Opposites",
        content: [
          {
            type: "text",
            value: "Squaring and square roots UNDO each other!"
          },
          {
            type: "opposites",
            forward: "5² = 25 (squaring)",
            backward: "√25 = 5 (square root)",
            caption: "They go in opposite directions!"
          },
          {
            type: "tip",
            value: "If you forget √49, think: 'What times itself = 49?' Try numbers: 6×6=36 (too small), 7×7=49 ✓"
          },
          {
            type: "funfact",
            value: "√2 = 1.414... It goes on forever! These are called 'irrational numbers'."
          }
        ]
      }
    ]
  },

  // ==================== GEOMETRY ====================
  geometry: {
    title: "Geometry - Measuring Shapes",
    emoji: "📐",
    forAges: [12, 13, 14],
    totalPages: 4,
    pages: [
      {
        title: "Perimeter - Distance Around",
        content: [
          {
            type: "text",
            value: "PERIMETER is the distance all the way around a shape."
          },
          {
            type: "text",
            value: "Think: If an ant walks around the edge, how far does it walk?"
          },
          {
            type: "shape-formula",
            shape: "Rectangle",
            formula: "Perimeter = 2 × (Length + Width)",
            example: "A 5m × 3m rectangle: P = 2 × (5 + 3) = 2 × 8 = 16m"
          },
          {
            type: "visual",
            layout: "rectangle-perimeter",
            length: 5,
            width: 3,
            caption: "Add all sides: 5 + 3 + 5 + 3 = 16m"
          }
        ]
      },
      {
        title: "Area - Space Inside",
        content: [
          {
            type: "text",
            value: "AREA is the space INSIDE a shape. How much paint to fill it?"
          },
          {
            type: "shape-formula",
            shape: "Rectangle",
            formula: "Area = Length × Width",
            example: "A 5m × 3m rectangle: A = 5 × 3 = 15 square meters (m²)"
          },
          {
            type: "visual",
            layout: "rectangle-area",
            length: 5,
            width: 3,
            caption: "Count the squares: 5 × 3 = 15 squares"
          },
          {
            type: "remember",
            value: "Area is always in SQUARE units (m², cm², ft²)"
          }
        ]
      },
      {
        title: "Triangle Area",
        content: [
          {
            type: "text",
            value: "A triangle is HALF of a rectangle!"
          },
          {
            type: "shape-formula",
            shape: "Triangle",
            formula: "Area = (Base × Height) ÷ 2",
            example: "Base = 6, Height = 4: A = (6 × 4) ÷ 2 = 24 ÷ 2 = 12"
          },
          {
            type: "visual",
            layout: "triangle-in-rectangle",
            base: 6,
            height: 4,
            caption: "The triangle is exactly HALF the rectangle!"
          },
          {
            type: "tip",
            value: "HEIGHT is always measured straight up (perpendicular), not along the slanted side!"
          }
        ]
      },
      {
        title: "Circle Measurements",
        content: [
          {
            type: "text",
            value: "Circles use a special number: π (pi) = 3.14..."
          },
          {
            type: "circle-parts",
            items: [
              { name: "Radius (r)", desc: "Distance from center to edge" },
              { name: "Diameter (d)", desc: "Distance across (d = 2 × r)" },
              { name: "Circumference", desc: "Distance around = π × d = 2πr" },
              { name: "Area", desc: "Space inside = π × r²" }
            ]
          },
          {
            type: "example",
            problem: "Circle with radius 5:",
            solution: "Circumference = 2 × 3.14 × 5 = 31.4, Area = 3.14 × 5² = 78.5"
          }
        ]
      }
    ]
  },

  // ==================== SHAPES (Ages 5-8) ====================
  shapes: {
    title: "Learning Shapes",
    emoji: "🔷",
    forAges: [5, 6, 7, 8],
    totalPages: 3,
    pages: [
      {
        title: "Basic Shapes",
        content: [
          {
            type: "text",
            value: "Shapes are everywhere! Let's learn to recognize them."
          },
          {
            type: "shapes-grid",
            items: [
              { shape: "Circle", emoji: "⭕", sides: 0, description: "Round with no corners" },
              { shape: "Square", emoji: "⬜", sides: 4, description: "4 equal sides, 4 corners" },
              { shape: "Rectangle", emoji: "▭", sides: 4, description: "4 sides, opposite sides equal" },
              { shape: "Triangle", emoji: "🔺", sides: 3, description: "3 sides, 3 corners" }
            ]
          }
        ]
      },
      {
        title: "More Shapes",
        content: [
          {
            type: "shapes-grid",
            items: [
              { shape: "Star", emoji: "⭐", sides: 10, description: "Points sticking out" },
              { shape: "Heart", emoji: "❤️", sides: 0, description: "Curved, no straight sides" },
              { shape: "Diamond", emoji: "🔷", sides: 4, description: "Square turned sideways" },
              { shape: "Oval", emoji: "🥚", sides: 0, description: "Stretched circle" }
            ]
          },
          {
            type: "tip",
            value: "Look around your room - can you find these shapes?"
          }
        ]
      },
      {
        title: "Shapes in Real Life",
        content: [
          {
            type: "text",
            value: "Shapes are all around us!"
          },
          {
            type: "reallife-shapes",
            items: [
              { shape: "Circle", examples: "Clock, pizza, wheel, coin 🍕⏰" },
              { shape: "Square", examples: "Window, napkin, tile 🪟" },
              { shape: "Rectangle", examples: "Door, book, phone, TV 📱📚" },
              { shape: "Triangle", examples: "Pizza slice, roof, yield sign 🔺" }
            ]
          },
          {
            type: "funfact",
            value: "Triangles are the strongest shape - that's why bridges use them!"
          }
        ]
      }
    ]
  },

  numbers: {
    title: "Learning Numbers",
    emoji: "🔢",
    forAges: [5, 6, 7],
    totalPages: 2,
    pages: [
      {
        title: "Numbers 1-10",
        content: [
          {
            type: "text",
            value: "Numbers are symbols that show 'how many'."
          },
          {
            type: "number-chart",
            numbers: [
              { num: 1, word: "one", visual: "☝️" },
              { num: 2, word: "two", visual: "✌️" },
              { num: 3, word: "three", visual: "🤟" },
              { num: 4, word: "four", visual: "✋-👆" },
              { num: 5, word: "five", visual: "✋" },
              { num: 6, word: "six", visual: "✋☝️" },
              { num: 7, word: "seven", visual: "✋✌️" },
              { num: 8, word: "eight", visual: "✋🤟" },
              { num: 9, word: "nine", visual: "✋✋-👆" },
              { num: 10, word: "ten", visual: "✋✋" }
            ]
          }
        ]
      },
      {
        title: "Number Order",
        content: [
          {
            type: "text",
            value: "Numbers go in order. Each number is ONE more than the one before."
          },
          {
            type: "numberline",
            start: 0,
            end: 10,
            caption: "0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10..."
          },
          {
            type: "tip",
            value: "Practice counting forward AND backward!"
          },
          {
            type: "funfact",
            value: "Zero (0) means nothing - zero apples means no apples at all!"
          }
        ]
      }
    ]
  }
};

export const getLessonById = (moduleId) => {
  return FULL_LESSONS[moduleId] || null;
};

export default FULL_LESSONS;
