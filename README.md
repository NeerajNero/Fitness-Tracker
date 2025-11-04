# FitTrack: A Full-Stack Personal Fitness Tracker

FitTrack is a modern, full-stack web application built to help users log their workouts, track their daily nutrition, and visualize their progress over time. It features a secure, cookie-based authentication system with both email/password and Google OAuth options.

!(https://i.imgur.com/YOUR_IMAGE_URL.png) 
*(Suggestion: Replace this with a screenshot of your main dashboard!)*

---

## ✨ Key Features

* **Secure Authentication:** Full-featured auth system using NestJS and Passport.js.
    * Email/Password (local) strategy with `bcrypt` hashing.
    * Google OAuth 2.0 strategy for one-click sign-in/signup.
    * Uses secure `httpOnly` cookies (JWT) for session management.
* **Workout Log (CRUD):**
    * Create, Read, Update, and Delete workout sessions.
    * Log exercises with sets, reps, and weight.
    * View a complete history of all past workouts.
* **Nutrition Tracker:**
    * Log daily meals for breakfast, lunch, dinner, and snacks.
    * Track total daily calories and protein against user-defined goals.
    * A personal food database to add, save, and search for custom food items.
* **Data-Driven Dashboard:**
    * **Nutrition Chart:** A 7-day bar chart summary of total calories and protein.
    * **Workout Chart:** A line chart to track progress (max weight) for any specific exercise over time.
* **Fully Responsive:** A clean, mobile-first design using Tailwind CSS and Shadcn UI, including a responsive navbar and slide-out (sheet) mobile menu.

---

## 🛠️ Tech Stack & Architecture

This project is built with a modern, type-safe stack, structured with separate frontend and backend applications.

!(https://i.imgur.com/YOUR_DIAGRAM_URL.png)
*(Suggestion: Add a simple diagram showing: Vercel -> Render API -> Render DB)*

### 🖥️ Frontend (Deployed on Vercel)

* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS & Shadcn UI
* **State Management:** Tanstack Query (for server state) & React Context (for auth state)
* **Charting:** Recharts

### ⚙️ Backend (Deployed on Render)

* **Framework:** NestJS
* **Language:** TypeScript
* **Authentication:** Passport.js (JWT, Google OAuth 2.0, Local strategies)
* **Database ORM:** Prisma
* **Validation:** `class-validator`

### 💾 Database (Deployed on Render)

* **Database:** PostgreSQL
* **Development:** Managed with Docker (`docker-compose.yml`)

---

## 🚀 Running Locally

This project is split into two main folders, `/api` and `/web`.

### 1. Backend (`/api`)

1.  Navigate to the `/api` directory.
2.  Set up a PostgreSQL database (e.g., using the provided `docker-compose.yml` in the root).
3.  Create a `.env` file based on your database credentials and Google OAuth keys.
4.  Run `npx prisma migrate dev` to sync the database.
5.  Run `npm run start:dev` to start the backend server.

### 2. Frontend (`/web`)

1.  Navigate to the `/web` directory.
2.  Run `npm install`.
3.  Run `npm run dev` to start the frontend server.
4.  The app will be available at `http://localhost:3001`.
