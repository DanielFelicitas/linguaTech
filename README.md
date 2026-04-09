# LinguaTech (MERN + Tailwind)

LinguaTech is an English learning website for students to improve speaking, writing, and communication skills.

## Project Structure

- `client`: React + Vite + Tailwind CSS frontend
- `server`: Node.js + Express + MongoDB backend API

## Frontend Features

- Website title: LinguaTech
- Navigation tabs: Home, Dashboard, Activities, About Us, Contact
- Authentication pages: Login and Sign Up
- Tailwind-based responsive UI

## Backend Features

- Auth routes:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
- MongoDB user model
- JWT token generation on login

## Run Locally

### 1) Start backend

```bash
cd server
cp .env.example .env
```

Update `.env` with your own values, then run:

```bash
npm install
npm run dev
```

### 2) Start frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and backend on `http://localhost:5000`.
