# MathPlayKids - Product Requirements Document

## Overview
Subscription-based web platform for teaching math to kids (ages 5-14) with tiered pricing. Multi-language support (English, Sinhala, Tamil), Stripe card payments, Bank QR manual upload for Sri Lanka.

## Tech Stack
- **Frontend**: React, React Router, Tailwind CSS, Framer Motion, Axios
- **Backend**: FastAPI, Motor (Async MongoDB), JWT Authentication
- **Payments**: Stripe Checkout API (User's real test keys configured)
- **Email**: Resend API
- **Database**: MongoDB
- **Desktop**: Electron (config ready)

## Third-Party Integrations
| Service | Status | Details |
|---------|--------|---------|
| Stripe | LIVE (Test Mode) | User's account: TEC SRILANKA WORLDWIDE |
| Webhook | Configured | `whsec_6NKlXvE54iGu7clPOUPcNuqm7SdTTmQZ` |
| Resend | Active | Email notifications working |
| GitHub | Pushed | `tecsrilankaworldwide/math-play-kid` |

## Completed Features
- [x] JWT Authentication (Admin/Parent roles)
- [x] Multi-language support (English, Sinhala, Tamil)
- [x] Parent Dashboard with child profiles
- [x] Admin Dashboard (Lessons, Users, Payments)
- [x] Stripe Payment Integration (User's real keys)
- [x] Stripe Webhook for auto-activation
- [x] Bank QR Manual Payment (Sri Lanka)
- [x] Age-appropriate Math Curriculum (5-14)
- [x] Lesson Management System
- [x] Bulk CSV Question Import
- [x] Resend Email Notifications
- [x] Electron Desktop App Config
- [x] Full Lessons (paginated textbook-style tutorials)
- [x] Timed Exam Practice with per-question stopwatch
- [x] **Daily Streak System** (March 25, 2026)
  - Track consecutive practice days per child
  - Streak display in header (compact fire emoji)
  - Full streak card with 7-day calendar visualization
  - Longest streak tracking
- [x] **Mistake Review System** (March 25, 2026)
  - Automatic recording of wrong answers from practice/exams
  - Modal to review mistakes with original question and options
  - Mark as reviewed, delete, refresh functionality
  - Unreviewed count badge on LearnPage
- [x] **Achievement Badges** (March 25, 2026)
  - 13 badges total (stars, streaks, special categories)
  - Star badges: First Star, 5 Stars, 10 Stars, 20 Stars, 50 Stars, Century Club
  - Streak badges: 3-Day Streak, Week Warrior, 2-Week Champion, Monthly Master
  - Special badges: Speed Demon, Perfect Quiz, Math Explorer
  - Progress bar showing badge completion percentage
  - Celebration animations for earned badges
- [x] **Badge Celebration Animations** (March 25, 2026)
  - Confetti burst when new badge earned
  - Animated modal with badge icon and name
  - Sparkle effects and star animations
  - Sound effects (fanfare audio)
  - "Awesome! Keep Going!" encouragement button
- [x] **Complete Encouragement System** (March 25, 2026)
  - **Progress Indicators**: "Almost There!" progress bars showing proximity to next badges
  - **Effort-Based Badges (11 new)**:
    - Brave Learner (20/50/100 attempts)
    - Never Give Up (continued after 3+ wrong streak)
    - Mistake Master (reviewed 5/15 mistakes)
    - Daily Learner (practiced 3/7/30 days)
  - **Encouraging Popups**: Motivational messages after 3 wrong answers + progress notifications
  - **Small Wins System**: "Questions today" counter, celebrations at milestones (5, 10, 15, 20)
  - **Hints & Second Chances**: Contextual hint button for each question
  - **Learning Journey Stats**: Dashboard showing Questions Tried, Correct Answers, Days Practiced, Mistakes Reviewed
  - **Effort Tracking**: total_attempts, current_wrong_streak, continued_after_wrong_streak, questions_today
- [x] **Leaderboard System** (March 25, 2026)
  - Age-based leaderboards (9 categories from Ages 5-6 to Age 14)
  - Score formula: stars×3 + streak×2 + badges×5 + attempts×0.1
  - "Your Ranking" section showing user's children with ranks
  - Top 3 with crown/medal styling (👑🥈🥉)
  - "YOU" badge for current user's entries
  - Privacy protection (other users show as "X***")
  - Category selector dropdown to switch age groups
  - Participant count display
  - Global leaderboard endpoint for top 20 across all ages

## Math Curriculum by Age (FIXED - March 25, 2026)

### Age 5-6 (K-Grade 1)
- Counting (1-10)
- Number Recognition (1-20)
- Basic Shapes
- Addition within 10
- Quiz

### Age 7 (Grade 2)
- Counting (1-20)
- Shapes
- Addition within 20
- Subtraction within 20
- Quiz

### Age 8 (Grade 3)
- Shapes
- Addition within 100
- Subtraction within 100
- Multiplication (2, 5, 10 tables)
- Quiz

### Age 9 (Grade 4)
- Addition (multi-digit)
- Subtraction (multi-digit)
- Multiplication (1-10 tables)
- Division basics
- Quiz

### Age 10 (Grade 5)
- All basic operations
- Fractions (same denominator)
- Multiplication (1-12 tables)
- Division
- Quiz

### Age 11 (Grade 6)
- Multiplication (larger)
- Division (complex)
- Fractions (different denominators)
- Percentages
- Quiz

### Age 12 (Grade 7)
- Percentages
- Basic Algebra (x + 5 = 12)
- Geometry (area, perimeter)
- Quiz

### Age 13-14 (Grade 8-9)
- Algebra (2x + 3 = 15)
- Exponents (3^4)
- Square Roots (√81)
- Geometry
- Quiz

## Key Credentials
- **Admin Login**: admin@mathplay.com / admin123
- **Test Parent**: testparent@test.com / test123
- **Preview URL**: https://math-play-kids-3.preview.emergentagent.com

## Database Schema
- `users`: {email, hashed_password, role, created_at}
- `children`: {parent_id, name, age, age_category, progress, subscription_active, streak, mistakes, achievements}
  - `streak`: {current_streak, longest_streak, last_practice_date, streak_history[]}
  - `mistakes`: [{id, question_id, question_text, question_type, user_answer, correct_answer, options, recorded_at, reviewed, review_count}]
  - `achievements`: [{badge, name, earned_at}]
- `subscriptions`: {user_id, child_id, plan_type, status, payment_method, end_date}
- `lessons`: {title, description, age_category, questions, is_trial}
- `payment_transactions`: {session_id, user_id, status}

## File Structure
```
/app/
├── backend/
│   ├── server.py (with gamification + encouragement endpoints)
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── StreakDisplay.jsx (streak visualization)
│   │   │   ├── MistakeReviewModal.jsx (mistake review UI)
│   │   │   ├── AchievementBadgesModal.jsx (achievements UI)
│   │   │   ├── BadgeCelebrationModal.jsx (celebration animations)
│   │   │   ├── EncouragementPopup.jsx (motivational messages)
│   │   │   ├── ProgressIndicator.jsx (progress to next badges)
│   │   │   ├── FullLessonModal.jsx
│   │   │   └── TimedExamModal.jsx
│   │   ├── pages/
│   │   │   ├── LearnPage.jsx (gamification + encouragement cards)
│   │   │   ├── GameModule.jsx (hint system, effort tracking)
│   │   │   └── Dashboard.jsx
│   │   └── data/
│   ├── electron/
│   └── .env
├── CURRICULUM.md
└── memory/PRD.md
```

## API Endpoints (Gamification + Encouragement)
- `GET /api/children/{id}/streak` - Get streak data
- `GET /api/children/{id}/mistakes` - Get recorded mistakes
- `POST /api/children/{id}/mistakes` - Record a wrong answer
- `PUT /api/children/{id}/mistakes/{id}/review` - Mark mistake reviewed (updates effort_stats.mistakes_reviewed)
- `DELETE /api/children/{id}/mistakes/{id}` - Delete mistake
- `GET /api/children/{id}/achievements` - Get earned/locked badges + progress_to_next + effort_stats
- `PUT /api/children/{id}/progress?is_correct=true/false` - Update progress with effort tracking
- `GET /api/leaderboard/{age_category}` - Get leaderboard for specific age (top 50)
- `GET /api/leaderboard/global/top` - Get global top 20 across all ages

## Bug Fixes Applied
- [x] Stripe "Pay with Card" - Configured user's real keys (March 24)
- [x] Age-inappropriate questions - Complete curriculum rebuild (March 25)
- [x] "What number is this?" for age 14 - Removed silly modules for older kids

## Pricing Structure
| Age | Monthly | Yearly |
|-----|---------|--------|
| 5-6 | $1 | $5 |
| 7 | $2 | $7 |
| 8 | $3 | $10 |
| 9 | $4 | $13 |
| 10 | $5 | $15 |
| 11 | $6 | $18 |
| 12 | $7 | $21 |
| 13 | $8 | $24 |
| 14 | $9 | $27 |

## Future Enhancements
- [ ] Parent Progress Dashboard (visual charts showing improvement, weak topics, time spent)
- [ ] Weekly Report Emails (auto-send progress to parents using Resend)
- [ ] Fun Mini-Games (Speed Race, Math Puzzle, Math Bingo)
- [ ] Adaptive Difficulty (adjust questions based on performance)
- [ ] Switch to Stripe Live mode for production
- [ ] Add word problems
- [ ] Backend refactoring (split server.py into route modules)
- [ ] Desktop App (Electron build)
