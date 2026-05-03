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

## Demo Mode (Public Access)
- [x] Public landing page at / with product overview, feature highlights, and "Try Demo" + "Sign In" CTAs
- [x] Demo context: publicProcedure variants of all read queries (portfolio, borrowers, alerts, etc.)
- [x] Demo mode state: React context that tracks whether user is in demo mode (no auth required)
- [x] Demo banner: persistent top bar in demo mode explaining it is read-only and prompting sign-in
- [x] Route guard: write/mutate actions (submit financials, add covenant, etc.) show upgrade prompt in demo mode
- [x] Demo data: ensure seed data is always present and visible to unauthenticated users
- [x] DashboardLayout: allow unauthenticated access when in demo mode (skip login redirect)
- [x] App.tsx: / shows landing page for unauthenticated, dashboard for authenticated or demo mode
- [x] Vitest: demo mode context and public procedure tests
- [x] Checkpoint: save after demo mode is complete

## Technology & Architecture Page
- [x] TechStack.tsx: public page at /tech-stack accessible without login
- [x] Interactive architecture diagram showing all layers (Browser → React → tRPC → Express → Drizzle → MySQL)
- [x] Layer-by-layer breakdown cards: Frontend, API, Backend Logic, Database, AI, Auth
- [x] PM Skills Map section: which skill each technology demonstrates
- [x] AI Explainability section: how the LLM is prompted, what it receives, what it returns
- [x] Covenant Engine explainer: how ratios are calculated and evaluated step by step
- [x] Add "How It's Built" link to Landing page nav and footer
- [x] Add "Architecture" nav item to DemoLayout sidebar
- [x] Checkpoint after TechStack page is complete

## Animated Architecture Diagram
- [x] AnimatedArchDiagram.tsx: standalone component with hover-triggered data flow animations
- [x] SVG connector lines between layers with animated stroke-dashoffset flow trace on hover
- [x] Each layer node: hover lifts with shadow, highlights active color, shows tooltip
- [x] Hovering a layer highlights all downstream/upstream connectors in the data flow
- [x] Animated "data packet" dot travelling along the connector path on hover
- [x] Side branches (AI, Auth) animate in when their parent layer is hovered
- [x] Auto-play mode: cycles through layers automatically when nothing is hovered
- [x] Replace static diagram in TechStack.tsx with AnimatedArchDiagram component
- [x] Checkpoint after animation enhancement is complete

## AI Explainer Page Rewrite
- [x] Rename page title to "How the AI Works" / "The Agentic AI Explained"
- [x] Remove generic web stack layer breakdown (frontend, API, backend, database sections)
- [x] Keep animated architecture diagram but simplify to show only the AI/agentic flow
- [x] Section 1: What is an Agentic AI? — plain-language definition with CovAgent context
- [x] Section 2: The Covenant Evaluation Engine — rule-based decision logic, formula breakdown, status determination
- [x] Section 3: The LLM Narrative Pipeline — 6-step flow, prompt anatomy, guardrails, output
- [x] Section 4: AI Explainability Principles — what the AI can/cannot do, data scope, human oversight
- [x] Section 5: Why This Matters for PMs — PM ownership of AI behaviour, prompt design, output validation
- [x] Checkpoint after AI explainer rewrite

## Guided Full Demo Mode
- [x] Add isDemo flag (int, default 0) to financial_submissions table via ALTER TABLE
- [x] Add demo.submitFinancials publicProcedure — runs full covenant evaluation, marks submission as demo
- [x] Add demo.generateNarrative publicProcedure — LLM narrative for demo borrowers
- [x] Add demo.resetDemoData publicProcedure — deletes all is_demo=1 submissions, results, alerts
- [x] DemoSubmitFinancials.tsx page — guided 3-step walkthrough with pre-filled values, real-time result display
- [x] DemoBorrowerDetail.tsx — unlock AI narrative generation in demo mode
- [x] DemoLayout — add "Try It Live" nav item pointing to demo submit page
- [x] DemoBanner — update text to reflect interactive capability
- [x] Vitest: demo submit procedure tests
- [x] Checkpoint after Guided Full Demo is complete

## Follow-up Polish
- [x] DemoSubmitFinancials: responsive grid for financial figures on mobile (2-col → 1-col)
- [x] DemoSubmitFinancials: result cards stack cleanly on narrow screens
- [x] Portfolio.tsx: admin-only "Reset Demo Data" button with confirmation and toast feedback
- [x] Landing.tsx: add "Run the AI Pipeline →" secondary CTA button linking to /demo/try
- [x] Checkpoint after all follow-ups complete

## QA Fixes (End-to-End Audit)
- [x] Fix #1: Per-covenant results show "Covenant #5" — display covenant type name instead
- [x] Fix #2: Landing page subtext "Read-only access" is wrong — update to reflect interactive demo
- [x] Fix #3: "Sign In to Your Account" button on landing — demote to subtle text link
- [x] Fix #4: Demo Portfolio dashboard missing page heading — add "Portfolio Overview" title
- [x] Fix #5: "CCO Dashboard" badge is jargon — replace with "Live Demo" badge
- [x] Fix #6: DemoBanner slim down — reduce height, make it less intrusive
- [x] Fix #7: "Try It Live" should be first/highlighted nav item in DemoLayout
- [x] Fix #8: Add "Try It Live" nudge card on DemoBorrowerDetail page
- [x] Fix #9: DashboardLayout "How the AI Works" uses Code2 icon — change to Brain icon
- [x] Fix #10: DemoLayout "How the AI Works" uses Code2 icon — change to Brain icon
- [x] Fix #11: "Back to Portfolio" on Try It Live — rename to "Back to Dashboard"
- [x] Fix #12: Pre-select "Covenant Breach" scenario by default on Try It Live
- [x] Checkpoint after QA fixes
