# Tasq

A modern, full-stack task management application featuring a sleek **Dynamic Island** UI design, built with **Next.js 15**, **Tailwind CSS**, **Express.js**, **Prisma ORM**, and **PostgreSQL**.

---

## Project Structure

```text
Tasq/
├── frontend/          # Next.js 15 frontend application (App Router, Tailwind CSS, Framer Motion)
└── backend/           # Express.js REST API with Prisma and PostgreSQL
```

---

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS, CSS Glassmorphism
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Server**: Express.js (Node.js)
- **Database & ORM**: PostgreSQL with Prisma ORM (`@prisma/adapter-pg`)
- **Authentication**: JWT (JSON Web Tokens), bcrypt password hashing
- **Validation**: Zod

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL running locally or remotely

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Create a `.env` file in the `backend/` directory (you can copy `.env.example`):
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dynamic_todo?schema=public"
   PORT=3000
   JWT_SECRET="your-super-secret-jwt-key"
   ```
4. Run database migrations & start the development server:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   npm run dev
   ```
   The backend API will run on `http://localhost:3000`.

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend app will run on `http://localhost:3001` (configured via `package.json`).

---

## Features

- **Authentication**: Secure sign-up and sign-in with JWT token authentication.
- **Dynamic Island Todo Interface**: Interactive todo list inspired by modern dynamic island UI patterns.
- **User Profile**: Displays user initials dynamically computed from their full name.
- **Theme Support**: Seamless dark and light mode toggle.
- **API Proxying**: Next.js rewrites route `/api/v1/*` requests directly to the backend server.

---

## Screenshots

| Sign In | Sign Up | Dashboard & Todo List |
| :---: | :---: | :---: |
| ![Sign In](./screenshots/signin.png) | ![Sign Up](./screenshots/signup.png) | ![Dashboard](./screenshots/dashboard.png) |
