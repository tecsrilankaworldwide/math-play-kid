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
│   ├── server.py (with gamification endpoints)
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── StreakDisplay.jsx (streak visualization)
│   │   │   ├── MistakeReviewModal.jsx (mistake review UI)
│   │   │   ├── AchievementBadgesModal.jsx (achievements UI)
│   │   │   ├── FullLessonModal.jsx
│   │   │   └── TimedExamModal.jsx
│   │   ├── pages/
│   │   │   ├── LearnPage.jsx (gamification cards)
│   │   │   ├── GameModule.jsx (mistake recording)
│   │   │   └── Dashboard.jsx
│   │   └── data/
│   ├── electron/
│   └── .env
├── CURRICULUM.md
└── memory/PRD.md
```

## API Endpoints (Gamification)
- `GET /api/children/{id}/streak` - Get streak data
- `GET /api/children/{id}/mistakes` - Get recorded mistakes
- `POST /api/children/{id}/mistakes` - Record a wrong answer
- `PUT /api/children/{id}/mistakes/{id}/review` - Mark mistake reviewed
- `DELETE /api/children/{id}/mistakes/{id}` - Delete mistake
- `GET /api/children/{id}/achievements` - Get earned/locked badges

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
- [ ] Hint System & Adaptive Difficulty
- [ ] Switch to Stripe Live mode for production
- [ ] Add word problems
- [ ] Backend refactoring (split server.py into route modules)
- [ ] Desktop App (Electron build)
