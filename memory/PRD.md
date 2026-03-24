# MathPlayKids - Product Requirements Document

## Overview
Subscription-based web platform for teaching math to kids (ages 5-14) with tiered pricing (monthly/yearly). Multi-language support (English, Sinhala, Tamil), Stripe card payments, Bank QR manual upload for Sri Lanka, admin panel with lesson management.

## Tech Stack
- **Frontend**: React, React Router, Tailwind CSS, Framer Motion, Axios
- **Backend**: FastAPI, Motor (Async MongoDB), JWT Authentication
- **Payments**: Stripe Checkout API (Real Keys Configured)
- **Email**: Resend API
- **Database**: MongoDB
- **Desktop**: Electron (config ready)

## Third-Party Integrations
| Service | Status | Keys |
|---------|--------|------|
| Stripe | LIVE (Test Mode) | `sk_test_51T9zLFFLUI5OkdhJ...` (User's account: TEC SRILANKA WORLDWIDE) |
| Resend | Active | `re_GAAgXyGT_Jyt29U1qpwbGsMmWmuDrvoPA` |
| GitHub | Pushed | `tecsrilankaworldwide/math-play-kid` |

## Completed Features (All Done)
- [x] JWT Authentication (Admin/Parent roles)
- [x] Multi-language support (English, Sinhala, Tamil)
- [x] Parent Dashboard with child profiles
- [x] Admin Dashboard (Lessons, Users, Payments tabs)
- [x] Stripe Payment Integration (Working with user's real keys)
- [x] Bank QR Manual Payment (Sri Lanka)
- [x] Lesson Management System
- [x] Bulk CSV Question Import
- [x] Resend Email Notifications
- [x] Age tiers 5-14 with 9 pricing levels
- [x] Interactive Lesson Player with gamification
- [x] Electron Desktop App Configuration

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

## Key Credentials
- **Admin Login**: admin@mathplay.com / admin123
- **Preview URL**: https://math-play-kids-3.preview.emergentagent.com

## Database Schema
- `users`: {email, hashed_password, role, created_at}
- `children`: {parent_id, name, age_category, progress}
- `subscriptions`: {user_id, child_id, plan_type, status, payment_method, end_date}
- `lessons`: {title, description, age_category, questions, is_trial}
- `payment_transactions`: {session_id, user_id, status}

## File Structure
```
/app/
├── backend/
│   ├── server.py (Main API - 760+ lines)
│   ├── requirements.txt
│   └── .env (STRIPE_API_KEY, RESEND_API_KEY, etc.)
├── frontend/
│   ├── src/pages/ (LandingPage, Dashboard, AdminDashboard, etc.)
│   ├── src/context/ (AuthContext, LanguageContext)
│   ├── src/i18n/translations.js
│   ├── electron/ (Desktop app configs)
│   └── .env (REACT_APP_BACKEND_URL, REACT_APP_STRIPE_PUBLISHABLE_KEY)
```

## Bug Fixes Applied
- [x] Fixed Stripe "Pay with Card" button - Configured user's real Stripe API keys (March 24, 2026)

## Potential Future Enhancements
- Switch to Stripe Live mode for production payments
- Refactor server.py into separate routers
- Add more lesson content
- Implement offline mode using Electron
