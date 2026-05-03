# CovAgent TODO

## Phase 1: Schema & Migrations
- [x] Add borrowers table to drizzle/schema.ts
- [x] Add loans table to drizzle/schema.ts
- [x] Add covenants table to drizzle/schema.ts
- [x] Add financial_submissions table to drizzle/schema.ts
- [x] Add covenant_results table to drizzle/schema.ts
- [x] Add alerts table to drizzle/schema.ts
- [x] Extend users table with analyst/rm/admin role enum
- [x] Generate migration SQL and apply via webdev_execute_sql

## Phase 2: Backend (DB helpers + tRPC routers)
- [x] DB helpers: borrowers CRUD
- [x] DB helpers: loans CRUD
- [x] DB helpers: covenants CRUD
- [x] DB helpers: financial_submissions CRUD
- [x] DB helpers: covenant_results + evaluation engine
- [x] DB helpers: alerts CRUD
- [x] tRPC router: borrowers (list, get, create, update)
- [x] tRPC router: loans (list, get, create)
- [x] tRPC router: covenants (list, create, update, delete) — admin only
- [x] tRPC router: financials (submit form, triggers evaluation engine)
- [x] tRPC router: covenant_results (list by borrower, list by loan)
- [x] tRPC router: alerts (list breaches/warnings)
- [x] Covenant Evaluation Engine: DSCR, Leverage Ratio, Current Ratio, Interest Coverage
- [x] AI Covenant Narrative: LLM-generated plain-language summary per borrower
- [x] Owner notification on breach detection

## Phase 3: Frontend
- [x] Update index.css with dark navy/slate fintech theme and Inter font
- [x] Update DashboardLayout.tsx with CovAgent nav items and role-aware menu
- [x] Update App.tsx with all routes
- [x] Portfolio Dashboard page (metric cards, borrower table, health chart)
- [x] Borrower Detail page (covenants tab, compliance history, trend charts)
- [x] Financial Input Form page (income statement, balance sheet, cash flow)
- [x] Alerts Feed page (breach/warning list with severity)
- [x] Covenant Configuration page (admin-only: create/edit/delete rules)
- [x] Role-based UI guards (analyst, rm, admin)

## Phase 4: Seed Data & Tests
- [x] Seed 3 borrowers, 3 loans, 6 covenants, 3 financial submissions, covenant results, alerts
- [x] Vitest: covenant evaluation engine unit tests
- [x] Vitest: tRPC router tests for key procedures

## Phase 5: Polish
- [x] Responsive layout check
- [x] Empty/loading/error states on all pages
- [x] Final checkpoint
