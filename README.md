# Backend - GitTrack

## 1. Project Overview

This backend is built with **Node.js** and **TypeScript**, using **Express** as the web framework and **Supabase** as the database and authentication provider.  
It serves as the core API layer for managing user data, activities, and challenges, providing secure and scalable endpoints for client applications.

**Main technologies:**
- Node.js
- TypeScript
- Express
- Supabase (PostgreSQL, Authentication, RPC)
- Zod (data validation)
- Jest & Supertest (testing)
- dotenv & cors (environment configuration and CORS handling)

**Purpose & Responsibilities:**
- Handle all HTTP requests from the client and orchestrate responses
- Validate input data and enforce business rules
- Interact with the Supabase database through a clean and modular service layer
- Provide isolated, testable business logic
- Ensure security and proper authentication without exposing sensitive keys
- Enable automated testing with unit and integration tests

---

## 2. Project Structure

The backend is organized following the **Service Layer Pattern**, keeping controllers, services, and types separate for clarity, modularity, and testability.

**Folder Descriptions:**
- **controllers:** Receives requests, validates inputs, handles errors, and sends responses. Controllers remain thin, delegating business logic to services.  
- **services:** Contain all business logic in isolated, reusable functions. Services interact with the database (Supabase) and perform complex computations like streaks or heatmap aggregations.  
- **types:** Store TypeScript types for strong typing across the project. Includes types generated from Supabase for database tables and RPC functions.  
- **server.ts:** The main entry point that initializes Express, sets up middleware, and starts the server.  
- **tests/unit:** Unit tests targeting isolated service functions. Fast and high coverage.  
- **tests/integration:** Integration tests that verify full request-to-response flows, including authentication and HTTP status codes.

---

## 3. Dependencies

The backend uses a combination of runtime and development dependencies to provide a robust, type-safe, and testable environment.

### Runtime Dependencies
These packages are required for the backend to run:
- **express** – Web framework for handling HTTP requests and routing  
- **@supabase/supabase-js** – Supabase client for database and authentication operations  
- **cors** – Middleware to handle Cross-Origin Resource Sharing  
- **dotenv** – Loads environment variables from a `.env` file  
- **zod** – Schema validation for request payloads and data validation  

### Development Dependencies
These packages are required for development, testing, and type safety:
- **typescript** – Adds TypeScript support  
- **ts-node-dev** – Runs TypeScript code with automatic restart on changes  
- **jest** – Testing framework for unit and integration tests  
- **ts-jest** – TypeScript preprocessor for Jest  
- **supertest** – HTTP assertions for integration tests  
- **@types/express, @types/cors, @types/node, @types/jest, @types/supertest** – TypeScript type definitions for the respective packages  

> **Note:** `ts-node-dev` is used instead of `nodemon` due to type reading issues with `express.d.ts`.

---

## 4. Setup & Run

Follow these steps to set up and run the backend locally:

### 1. Install Dependencies
```bash
npm install


### 2. Configure Environment Variables

Create a `.env` file in the project root with the necessary configuration, for example:

```env
SUPABASE_URL=<your_supabase_url>
SUPABASE_ANON_KEY=<your_anon_key>
PORT=3000

### 3. Run the Development Server

```bash
npm run dev
This starts the server using ts-node-dev, which automatically restarts on file changes.

4. Generate JWT Token for Testing
bash
Copy code
node get-jwt.js



## 5. Testing Strategy

This project follows the **Test Pyramid** approach to ensure code quality, reliability, and fast feedback.

### Unit Tests (`tests/unit/`)
- Focus: isolated logic in service functions and pure functions  
- Fast to execute and high coverage  
- Dependencies are mocked (e.g., Supabase client)  
- Ensure business logic is correct without hitting the database  

### Integration Tests (`tests/integration/`)
- Focus: full HTTP request flow (middleware → controller → service → response)  
- Verify authentication, HTTP status codes (200, 400, 401, 404, 500), and response messages  
- Uses Supertest; selective mocking when appropriate  
- Ensure routes and database interactions work together correctly  

### End-to-End Tests (Planned)
- Will cover critical user flows using a real database or UI-driven tools like Cypress  
- Provides confidence that the entire system works as expected  

**Benefits of this approach:**
- Fast feedback on failures  
- Clear separation between unit and integration issues  
- High confidence in correctness and maintainability  
- Security-focused: authentication and critical HTTP behaviors are tested


## 6. Status Codes Reference

The backend uses standard HTTP status codes to indicate the result of each request.  
Here is a quick reference:

| Status Code | Meaning             | Example Scenario |
|------------|-------------------|----------------|
| 200        | OK                 | Request succeeded, resource returned |
| 400        | Bad Request        | Invalid data sent by the client (e.g., empty name, wrong format) |
| 401        | Unauthorized       | No token or invalid token provided |
| 403        | Forbidden          | Authenticated but lacking permission (e.g., accessing another user's data) |
| 404        | Not Found          | Resource does not exist (e.g., profile not created yet) |
| 500        | Internal Server Error | Server or database failure |

> **Note:**  
> Most 403 and 404 scenarios are handled via input validation (Zod) or Supabase RLS policies to keep routes secure.



## 7. Database RPC Functions

The backend uses **PostgreSQL RPC (Remote Procedure Call) functions** to handle complex database operations efficiently.  
This approach keeps business logic clean, improves performance, and reduces data transfer between the backend and the database.

### Example: `get_heatmap_data`

**Purpose:**  
Returns a list of dates with activity counts for a user's heatmap (similar to GitHub contribution graphs).

**Why use an RPC function:**  
- **Performance:** Aggregation happens directly in PostgreSQL, avoiding large data processing in Node.js.  
- **Reduced data transfer:** Only one row per day is returned, instead of thousands of activity entries.  
- **Security:** Filters by `user_id` to respect Row-Level Security (RLS).  
- **Clean code:** The service layer simply calls `.rpc()`, keeping backend code simple and testable.  
- **Consistency:** Single atomic operation ensures accurate counts.

**SQL Definition:**
```sql
CREATE OR REPLACE FUNCTION get_heatmap_data(
  p_user_id uuid,
  p_start_date date,
  p_end_date date
)
RETURNS TABLE (date date, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.fulfilled_at::date AS date,
    COUNT(*) AS count
  FROM daily_activity_fulfillments f
  JOIN progress_entries pe ON f.progress_entry_id = pe.id
  WHERE pe.user_id = p_user_id
    AND f.fulfilled_at >= p_start_date
    AND f.fulfilled_at < p_end_date
  GROUP BY f.fulfilled_at::date
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;
