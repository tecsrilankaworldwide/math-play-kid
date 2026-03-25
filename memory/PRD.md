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
- `children`: {parent_id, name, age, age_category, progress, subscription_active}
- `subscriptions`: {user_id, child_id, plan_type, status, payment_method, end_date}
- `lessons`: {title, description, age_category, questions, is_trial}
- `payment_transactions`: {session_id, user_id, status}

## File Structure
```
/app/
├── backend/
│   ├── server.py
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/pages/
│   │   ├── LearnPage.jsx (age-filtered modules)
│   │   ├── GameModule.jsx (question display)
│   │   └── Dashboard.jsx
│   ├── electron/
│   └── .env
├── CURRICULUM.md (Full curriculum reference)
└── memory/PRD.md
```

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
- Switch to Stripe Live mode for production
- Add word problems
- Progress tracking reports for parents
- Timed challenges
- Achievement badges
