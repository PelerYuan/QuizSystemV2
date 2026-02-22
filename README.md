# 📝 Quiz System V2

A modern, fully decoupled full-stack online examination and quiz management system. This project is a complete rewrite of the original Python template-based quiz system.

The system allows teachers to create quizzes with multiple question types and generate independent "Entrances" for different classes to manage sessions and analyze results separately.

## 🛠 Tech Stack

This project uses a full-stack JavaScript ecosystem and is managed as a Monorepo:

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **Package Manager:** npm

## 📂 Project Structure

```text
NewQuizSystem/
├── frontend/                   # Frontend code (React + Vite)
│   ├── public/                 # Absolute static assets
│   ├── src/
│   │   ├── assets/             # Local static assets and global styles
│   │   ├── components/         # Reusable UI components (e.g., buttons, question cards)
│   │   ├── pages/              # Page-level components (e.g., Login, QuizView)
│   │   ├── services/           # API request layer (encapsulates all backend calls)
│   │   ├── store/              # Global state management
│   │   ├── hooks/              # Custom hooks (e.g., countdown, auth validation)
│   │   ├── utils/              # Pure utility functions (e.g., time formatting)
│   │   ├── App.jsx             # Core router and application entry point
│   │   └── main.jsx            # React mount point
│   ├── index.html              # Web HTML template
│   ├── vite.config.js          # Vite configuration (includes local CORS proxy settings)
│   └── package.json            # Frontend dependencies
├── backend/                    # Backend code (Node.js + Express)
│   ├── controllers/            # Route controllers (handles specific business logic)
│   ├── models/                 # MongoDB data models (Schema definitions)
│   ├── utils/                  # Backend utilities (e.g., error handling, configs)
│   ├── tests/                  # Automated testing files (Jest + Supertest)
│   ├── requests/               # HTTP API test scripts (.http / .rest)
│   ├── app.js                  # Express core setup (mounts middleware and routes)
│   ├── index.js                # Application entry point (listens to port & connects DB)
│   ├── .env.example            # Environment variables template (do not commit real .env)
│   └── package.json            # Backend dependencies
├── .gitignore                  # Git ignore configuration
├── CONTRIBUTING.md             # Developer contribution guidelines (workflow & conventions)
└── README.md                   # Core project documentation
```

## 🚀 Getting Started

To ensure a smooth development experience, we run the Node environment locally during the development phase. Please ensure you have [Node.js](https://nodejs.org/) (v18+ recommended) and [MongoDB](https://www.mongodb.com/try/download/community) installed on your machine.

### 1. Clone the repository
```bash
git https://github.com/PelerYuan/NewQuizSystem
cd NewQuizSystem
```

### 2. Start the Backend Service
```bash
cd backend
npm install
# Copy the environment variables template
# cp .env.example .env
npm run dev
```
> The backend service will run on `http://localhost:3000` by default.

### 3. Start the Frontend Service (in a new terminal tab)
```bash
cd frontend
npm install
npm run dev
```
> The frontend application will run on `http://localhost:5173` by default.

---

## 📄 Documentation Index

- [How to contribute to the project](./CONTRIBUTING.md)
- [Database schema](./docs/schema.md)