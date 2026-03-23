# MathPlay Kids - Subscription Math Learning Platform

## Original Problem Statement
Build the best maths teaching app for age 5 kid - PIVOTED to subscription-based web platform for ages 5-10 with:
- 5 age categories with tiered pricing
- Stripe payments + Bank QR for Sri Lanka
- Admin panel for content management
- Monthly subscription model
- Multi-language support (English, Sinhala, Tamil)

## User Personas
- **Parents**: Register, manage child profiles, subscribe, track progress
- **Children (5-10)**: Use interactive math modules
- **Admin**: Manage users, lessons, approve manual payments, view analytics

## Core Requirements
- 5 Age Categories: 5-6, 7, 8, 9, 10 years old
- Pricing: Monthly ($1-5), Yearly ($5-15) based on age
- Payment Methods: Stripe (international), Bank QR (Sri Lanka)
- Learning Modules: Counting, Numbers, Addition/Subtraction, Shapes, Quiz
- Progress tracking with stars and badges
- Admin dashboard for user/payment management
- Lesson management with CSV bulk import
- Multi-language: English, Sinhala, Tamil

## What's Been Implemented (Jan 2026)

### Backend (FastAPI + MongoDB)
- JWT Authentication for parents
- Child profiles with age categories
- Stripe checkout integration
- Manual QR payment tracking with admin approval
- **Email notifications via Resend on payment approval**
- Question generators with age-adjusted difficulty
- Admin routes for stats, users, payments, lessons
- **CSV bulk import for lesson questions**
- Badge system for milestones

### Frontend (React + Tailwind + Framer Motion)
- **Multi-language support (EN/SI/TA) with LanguageContext**
- **Language selector in header**
- Landing Page with translated content
- Auth Pages: Login, Register
- Dashboard: Child profiles, subscription management
- Learning Area: Module selection, game modules
- Admin Dashboard: Stats, users, payments, **lesson management with CSV import**

### Payment System
- Stripe checkout for card payments
- Bank QR code display for manual payments
- Admin approval workflow with email notifications

### Translations
- English (en) - Full support
- Sinhala (si/සිංහල) - Full support  
- Tamil (ta/தமிழ்) - Full support

## Admin Credentials
- Email: admin@mathplay.com
- Password: admin123

## Pricing Structure
| Age | Monthly | Yearly |
|-----|---------|--------|
| 5-6 | $1 | $5 |
| 7 | $2 | $7 |
| 8 | $3 | $10 |
| 9 | $4 | $13 |
| 10 | $5 | $15 |

## CSV Import Format
```csv
question,option1,option2,option3,option4,correct_answer,visual_hint
How many apples?,1,2,3,4,3,🍎🍎🍎
```

## Environment Variables (Backend)
- RESEND_API_KEY - For email notifications
- SENDER_EMAIL - Email sender address

## Prioritized Backlog
- P0: ✅ Complete
- P1: Parent analytics dashboard
- P2: Daily streaks and challenges
- P2: More question types

## Next Tasks
1. Add parent analytics dashboard with learning insights
2. Implement daily streaks to encourage practice
3. Add more interactive question types (matching, drag-drop)
