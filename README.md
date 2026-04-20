# ScholarX - Research Publication Management System

Full-stack MERN application for research paper submission, review workflows, editorial decisions, and publication management.

## Tech Stack
- Frontend: React (Vite), TailwindCSS, React Router, Axios
- Backend: Node.js, Express.js, JWT, Multer
- Database: MongoDB (Mongoose)

## Project Structure
```text
ScholarX/
  backend/
    src/
      config/db.js
      middleware/
      models/
      routes/
      server.js
    .env.example
  frontend/
    src/
      components/
      context/
      pages/
      services/
      App.jsx
      main.jsx
    .env.example
```

## Setup

### 1) Backend
```bash
cd backend
cp .env.example .env
# set MONGO_URI and JWT_SECRET
npm install
npm run dev
```

### 2) Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Roles and Workflow
- `researcher`: register/login, upload paper (PDF/DOC/DOCX), view status, revise submission
- `reviewer`: view assigned papers, submit comments and decision (approve/reject/revise)
- `editor`: view all papers, assign reviewers, update status, publish accepted papers

Flow: register -> login -> upload -> assign reviewer -> review -> revision/decision -> publication on acceptance.

## Implemented APIs

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Papers
- `POST /api/papers/upload`
- `GET /api/papers`
- `GET /api/papers/:id`
- `PUT /api/papers/:id`

### Reviews
- `POST /api/reviews`
- `GET /api/reviews/:paperId`

### Editor
- `POST /api/editor/assign-reviewer`
- `PUT /api/editor/update-status`
- `GET /api/editor/reviewers`
- `GET /api/editor/publications`
