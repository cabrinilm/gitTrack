# Backend - GitTrack

## 🚀 Project Overview

GitTrack Backend is a RESTful API built to support a modern habit-tracking application focused on consistency, challenges, and long-term progress visualization.

It handles authentication, challenge management, activity tracking, and heatmap data aggregation, acting as the core logic layer between the frontend and the database.

Built with **Node.js, TypeScript, Express, and Supabase**, the backend follows a clean **service-layer architecture** for better scalability, testability, and maintainability.

## 🛠️ Tech Stack

### Core Technologies
- Node.js + TypeScript
- Express.js
- Supabase (Authentication + PostgreSQL)
- Zod (schema validation)

### Testing
- Jest
- Supertest

### Infrastructure & Utilities
- dotenv (environment variables)
- cors (cross-origin requests)

### Key Principles
- Service-layer architecture
- Thin controllers
- Centralized validation with Zod
- Row Level Security (RLS)

## 🧠 Architecture

The backend follows a **Service Layer Architecture** to ensure clear separation of concerns, scalability, and high testability.

### Core Layers

- **Controllers** — Handle HTTP requests and responses (kept thin)
- **Services** — Contain all business logic and application rules
- **Validation** — Zod schemas for request validation and sanitization
- **Database** — Supabase (PostgreSQL) with Row Level Security (RLS)

### Data Flow
**Client → Controller → Validation → Service → Supabase → Response**

## 📁 Project Structure

```bash
src/
├── controllers/     # HTTP request handlers (thin layer)
├── services/        # Core business logic and rules
├── validation/      # Zod validation schemas
├── routes/          # Express route definitions
├── middleware/      # Authentication, error handling, etc.
├── lib/             # Supabase client and configurations
├── types/           # TypeScript type definitions
├── utils/           # Helper utilities
└── server.ts        # Application entry point
```
## 🚀 Quick Start

### Prerequisites
- Node.js (LTS version)
- npm or yarn

```bash
# Clone the repository
git clone https://github.com/cabrinilm/gitTrack
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Then edit .env with your credentials:
# SUPABASE_URL=your_supabase_project_url
# SUPABASE_ANON_KEY=your_supabase_anon_key
# PORT=3000

# Run the development server
npm run dev
```
The app will be available at http://localhost:5173 


(Optional) Generate JWT for testing:node get-jwt.js

## 🧪 Testing Strategy

The backend follows the **Test Pyramid** approach:

- **Unit Tests** (`tests/unit`): Test business logic in services (Supabase is mocked)
- **Integration Tests** (`tests/integration`): Test API endpoints and middleware using Supertest
- **End-to-End Tests** (`tests/e2e`): Full user flows (auth, challenges, activities, heatmaps)

```bash
# Run all tests
npm test
```

## 🗄️ Database & RPC Functions

The backend uses **Supabase (PostgreSQL)** as the primary database, with **Row Level Security (RLS)** enabled on all tables to ensure complete data isolation between users.

### Key Features
- Authentication handled by Supabase Auth
- All user data is protected by RLS policies
- Complex queries and aggregations are performed using **PostgreSQL RPC (Remote Procedure Call) functions**

### Example: Heatmap Data
The `get_heatmap_data` RPC function efficiently aggregates daily activity counts for GitHub-style heatmaps, keeping heavy computation at the database level for better performance.

## 🔐 Authentication & Security

The backend uses **Supabase Authentication** for secure user management.

### Authentication Flow
- Users authenticate through Supabase on the frontend
- The JWT token is sent with every protected request
- Backend middleware validates the token and extracts the `userId`

### Security Features
- Supabase JWT validation on all protected routes
- **Row Level Security (RLS)** enforced at the database level
- Input validation and sanitization using Zod
- Environment variables for all sensitive configuration
- No sensitive keys exposed to the frontend

**All users are strictly isolated** — each user can only access their own challenges, activities, and data.

## 📋 Status Codes

The API uses standard HTTP status codes:

| Status Code | Meaning              | Common Use Case                          |
|-------------|----------------------|------------------------------------------|
| 200         | OK                   | Request succeeded                        |
| 201         | Created              | Resource successfully created            |
| 400         | Bad Request          | Invalid input (usually Zod validation)   |
| 401         | Unauthorized         | Missing or invalid JWT token             |
| 403         | Forbidden            | Authenticated but no permission          |
| 404         | Not Found            | Resource does not exist                  |
| 500         | Internal Server Error| Unexpected server or database error      |

> **Note:** Most `400` errors come from Zod validation. `403` and `404` are often enforced by Supabase RLS policies.


