# Testing Strategy

## Goals

Our testing strategy aims to:
- Ensure business rules are correctly enforced
- Prevent regressions when adding new features
- Keep the test suite fast and reliable
- Avoid duplicated coverage across test layers

---

## Test Layers

### 1. Unit Tests

**Location:** `tests/unit`

**What we test:**
- Service functions
- Pure business logic
- Data transformation and validation logic

**What we don’t test:**
- HTTP requests
- Authentication middleware
- Database integration

**Examples:**
- `createChallenge` inserts correct data
- `getHeatmapData` normalizes missing dates

---

### 2. Integration Tests

**Location:** `tests/integration`

**What we test:**
- HTTP routes
- Controllers
- Request validation
- Authentication and authorization logic

**What we don’t test:**
- Real database behavior
- Complex user flows across multiple routes

**Examples:**
- `POST /api/challenges` returns 400 on invalid input
- `GET /api/progress/heatmap` returns 401 without token

---

### 3. End-to-End (E2E) Tests

**Location:** `tests/e2e`

**What we test:**
- Critical user flows
- Interaction between multiple routes
- Real database behavior

**What we don’t test:**
- All possible validation errors
- Every HTTP status code

**Examples:**
- User creates and activates a challenge
- User completes an activity and sees progress updated

---

## Error Handling Policy

- Validation errors (400) are covered in integration tests
- Authorization errors (401/403) are covered in integration tests
- Business-rule violations are tested where they occur
- E2E tests focus on successful and critical failure paths

---

## General Principles

- Prefer fewer, meaningful E2E tests over many redundant ones
- Avoid testing implementation details
- Tests should reflect real user behavior
- If a behavior is already covered at a lower level, do not duplicate it

