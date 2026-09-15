# EduSphere — Smart Tuition & Online Learning Platform

> **"Learn Better. Grow Smarter. Achieve More."**

EduSphere is a complete, enterprise-grade tuition institute management and online learning platform. It provides an admissions engine, multi-step application workflow, anti ID-guessing application tracking, student & teacher portals, conflict-free class scheduling, Google Meet/Zoom live online classroom links, study materials repository, assignment submission & grading, and institute administration console with configurable branding.

---

## 🏛️ System Architecture

- **Frontend**: Semantic **HTML5**, **CSS3** (CSS variables, Flexbox, CSS Grid, mobile-first responsive), **Vanilla JavaScript (ES6+ Modules)**. **Zero frontend frameworks used**.
- **Backend**: **Node.js** + **Express.js**, RESTful API, Helmet, CORS, Rate Limiting, bcrypt password hashing, JWT sessions.
- **Database**: **PostgreSQL 17** with **Prisma ORM** (19 relational models with foreign keys, indexes, and cascades).
- **Dual-Mode API**: Central client (`api.js`) automatically works offline with reactive `localStorage` fallback and seamlessly switches to the Express REST API when connected.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- PostgreSQL 17 (or Docker)

### 1. Database Setup (Local PostgreSQL)
Ensure your PostgreSQL server is running on port `5432`:
```sql
CREATE DATABASE edusphere_db;
```

### 2. Backend Installation & Migration
Open PowerShell or your preferred terminal in `edusphere/backend`:
```powershell
cd edusphere/backend
npm install
npx prisma db push
node prisma/seed.js
npm start
```

The server will start at:
- **Web Platform & Frontend**: [http://localhost:5000](http://localhost:5000)
- **REST API Base**: [http://localhost:5000/api](http://localhost:5000/api)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

*(Alternatively, you can open any of the HTML pages inside `edusphere/frontend/` directly in any web browser or with Live Server — all features work immediately in prototype mode!)*

---

## 👥 Demo User Accounts (Pre-Seeded)

| Role | Email | Password | Dashboard URL |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@edusphere.edu` | `Admin@123` | `admin-dashboard.html` |
| **Teacher** | `sharma@edusphere.edu` | `Teacher@123` | `teacher-dashboard.html` |
| **Student** | `rahul@edusphere.edu` | `Student@123` | `student-dashboard.html` |

*Tip: On the `login.html` page, click any of the "Quick Demo Access" chips (Student, Teacher, Admin) to autofill demo credentials with 1 click.*

---

## 📁 Project Structure

```
edusphere/
├── frontend/
│   ├── index.html                  # Homepage (Hero, Why Us, Featured Courses, FAQ, Testimonials)
│   ├── about.html                  # About Institute, Mission, 4-Pillar Pedagogy
│   ├── courses.html                # Course Catalog with multi-filters (Class, Subject, Mode, Sort)
│   ├── course-details.html         # Dynamic Course View (?id=...), Syllabus, Batches, Fees
│   ├── admission.html              # 4-Step Online Admission Application Wizard
│   ├── application-status.html     # Secure Status Tracking (ID + DOB/Phone Verification)
│   ├── faculty.html                # Faculty Directory with Experience & Assigned Batches
│   ├── contact.html                # Contact Coordinates, Map, Anti-Spam Inquiry Form, WhatsApp
│   ├── login.html                  # Unified Portal Login with Quick-Fill Demo Chips
│   ├── register.html               # Student / Applicant Account Registration
│   ├── forgot-password.html        # Password Recovery Flow
│   ├── reset-password.html         # Password Reset Confirmation
│   ├── admin-dashboard.html        # Admin Management Suite (KPIs, Pipeline, Courses, Branding)
│   ├── student-dashboard.html      # Student Hub (Live Classes, Materials, Assignments, Notices)
│   ├── teacher-dashboard.html      # Teacher Portal (Online Class Launcher, Materials, Grading)
│   ├── css/
│   │   ├── style.css               # Core CSS Design System, CSS Variables, Typography
│   │   ├── responsive.css          # Mobile Breakpoints & Navigation Drawer
│   │   ├── dashboard.css           # Sidebar Layout, Metrics, Tables, Badges, Modals
│   │   └── forms.css               # Controls, Floating Labels, Stepper, Radio Cards
│   └── js/
│       ├── api.js                  # Central Dual-Mode API Service (REST + Local Mock Fallback)
│       ├── auth.js                 # Session Management, Role Guards, Demo Accounts
│       ├── main.js                 # Global Nav, Mobile Menu, Toasts, Configurable Branding
│       ├── courses.js              # Course Filtering, Search, Dynamic Detail Loader
│       ├── admission.js            # Multi-Step Admission Stepper & Form Validation
│       ├── admin.js                # Admin Approval Pipeline, Course Creator, Settings
│       ├── student.js              # Timetable, Join Class, Homework Submission
│       ├── teacher.js              # Online Class Scheduler, Materials Uploader, Grading
│       ├── schedule.js             # Conflict Check & Overlap Prevention Utility
│       ├── materials.js            # Study Materials Formats & Size Validation
│       └── assignments.js          # Deadlines & Submission Verifier
├── backend/
│   ├── src/
│   │   ├── server.js               # Express Server with Helmet, CORS, Rate Limiting & Static Hosting
│   │   ├── config/db.js            # Prisma Client Configuration
│   │   ├── middleware/auth.js      # JWT Verification & Role Authorization Guard
│   │   ├── controllers/            # Auth, Applications, Courses, Schedules, Materials, Assignments
│   │   └── routes/api.routes.js    # REST API Route Definitions
│   ├── prisma/
│   │   ├── schema.prisma           # 19 Relational PostgreSQL Models
│   │   └── seed.js                 # Rich Seed Data Script
│   ├── package.json
│   └── .env
├── docker-compose.yml              # Multi-container Docker configuration
├── .env.example
└── README.md
```

---

## 🔒 Security Features

1. **Anti ID-Guessing Tracking**: Application status requires both Application Number (e.g. `EDU-2026-8491`) and registered Phone/PIN to view student records.
2. **Password Security**: Bcrypt with 10 salt rounds; no plain-text passwords stored.
3. **Role-Based Access Control (RBAC)**: Backend endpoints and frontend routes protected against unauthorized role privilege escalation.
4. **Security Headers & Rate Limiting**: Helmet security headers and IP rate limiting (300 requests / 15 mins).
5. **Anti-Spam Verification**: Human challenge math quiz on public contact form.

---

## ⚙️ Configurable Branding

The institute branding can be modified via the **Admin Dashboard $\rightarrow$ Institute Branding** tab:
- Institute Name (e.g., EduSphere)
- Tagline (e.g., "Learn Better. Grow Smarter. Achieve More.")
- Primary Theme Color (color picker updates `--primary` dynamically)
- Contact Phone & WhatsApp Number
- Admissions Email Address
- Campus Physical Address & Counseling Hours
