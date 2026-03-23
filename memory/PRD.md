# MathPlay Kids - Subscription Math Learning Platform

## Original Problem Statement
Build the best maths teaching app for age 5 kid - PIVOTED to subscription-based web platform for ages 5-10 with:
- 5 age categories with tiered pricing
- Stripe payments + Bank QR for Sri Lanka
- Admin panel for content management
- Monthly subscription model

## User Personas
- **Parents**: Register, manage child profiles, subscribe, track progress
- **Children (5-10)**: Use interactive math modules
- **Admin**: Manage users, approve manual payments, view analytics

## Core Requirements
- 5 Age Categories: 5-6, 7, 8, 9, 10 years old
- Pricing: Monthly ($1-5), Yearly ($5-15) based on age
- Payment Methods: Stripe (international), Bank QR (Sri Lanka)
- Learning Modules: Counting, Numbers, Addition/Subtraction, Shapes, Quiz
- Progress tracking with stars and badges
- Admin dashboard for user/payment management

## What's Been Implemented (Jan 2026)

### Backend (FastAPI + MongoDB)
- JWT Authentication for parents
- Child profiles with age categories
- Stripe checkout integration
- Manual QR payment tracking with admin approval
- Question generators with age-adjusted difficulty
- Admin routes for stats, users, payments
- Badge system for milestones

### Frontend (React + Tailwind + Framer Motion)
- **Landing Page**: Hero, features, 5 pricing tiers, payment methods
- **Auth Pages**: Login, Register with Neo-Brutalist design
- **Dashboard**: Child profiles, subscription management, payment modal
- **Learning Area**: Module selection, game modules with visual feedback
- **Admin Dashboard**: Stats, user list, payment management with approval

### Payment System
- Stripe checkout for card payments
- Bank QR code display for manual payments
- Admin approval workflow for QR payments

### Design System
- Neo-Brutalist "Clay UI" for kids sections (Fredoka font)
- Professional grid-based design for admin (Outfit font)
- DM Sans for body text

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

## Prioritized Backlog
- P0: ✅ Complete
- P1: Lesson management UI for admin (add/edit lessons)
- P1: Multi-language support (Sinhala, Tamil)
- P2: Parent analytics dashboard
- P2: Daily streaks and challenges

## Next Tasks
1. Build lesson CRUD in admin panel
2. Add Sinhala/Tamil language toggle
3. Implement email notifications for payment verification
4. Add more question types and difficulty levels
