import {
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  // analyst = can submit financials; rm = read-only; admin = full config access
  role: mysqlEnum("role", ["user", "admin", "analyst", "rm"]).default("rm").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Borrowers ────────────────────────────────────────────────────────────────
export const borrowers = mysqlTable("borrowers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  industry: varchar("industry", { length: 128 }),
  riskRating: mysqlEnum("riskRating", ["Low", "Medium", "High", "Watch"]).default("Medium").notNull(),
  contactName: varchar("contactName", { length: 255 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Borrower = typeof borrowers.$inferSelect;
export type InsertBorrower = typeof borrowers.$inferInsert;

// ─── Loans ────────────────────────────────────────────────────────────────────
export const loans = mysqlTable("loans", {
  id: int("id").autoincrement().primaryKey(),
  borrowerId: int("borrowerId").notNull(),
  facilityName: varchar("facilityName", { length: 255 }).notNull(),
  facilityAmount: decimal("facilityAmount", { precision: 18, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 8 }).default("USD").notNull(),
  effectiveDate: timestamp("effectiveDate").notNull(),
  maturityDate: timestamp("maturityDate").notNull(),
  status: mysqlEnum("status", ["Active", "Closed", "Defaulted"]).default("Active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Loan = typeof loans.$inferSelect;
export type InsertLoan = typeof loans.$inferInsert;

// ─── Covenants ────────────────────────────────────────────────────────────────
export const covenants = mysqlTable("covenants", {
  id: int("id").autoincrement().primaryKey(),
  loanId: int("loanId").notNull(),
  borrowerId: int("borrowerId").notNull(),
  covenantType: mysqlEnum("covenantType", [
    "DSCR",
    "Leverage Ratio",
    "Current Ratio",
    "Interest Coverage",
    "Debt to EBITDA",
    "Minimum Liquidity",
  ]).notNull(),
  operator: mysqlEnum("operator", [">=", "<=", ">", "<", "="]).notNull(),
  thresholdValue: decimal("thresholdValue", { precision: 18, scale: 4 }).notNull(),
  reportingFrequency: mysqlEnum("reportingFrequency", ["Monthly", "Quarterly", "Semi-Annual", "Annual"]).default("Quarterly").notNull(),
  description: text("description"),
  isActive: int("isActive").default(1).notNull(), // 1=active, 0=inactive
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Covenant = typeof covenants.$inferSelect;
export type InsertCovenant = typeof covenants.$inferInsert;

// ─── Financial Submissions ────────────────────────────────────────────────────
export const financialSubmissions = mysqlTable("financial_submissions", {
  id: int("id").autoincrement().primaryKey(),
  borrowerId: int("borrowerId").notNull(),
  loanId: int("loanId").notNull(),
  submittedByUserId: int("submittedByUserId").notNull(),
  periodLabel: varchar("periodLabel", { length: 64 }).notNull(), // e.g. "Q3 2025"
  periodEndDate: timestamp("periodEndDate").notNull(),
  statementType: mysqlEnum("statementType", ["Quarterly", "Annual", "Monthly"]).default("Quarterly").notNull(),
  // Income Statement
  revenue: decimal("revenue", { precision: 18, scale: 2 }),
  ebitda: decimal("ebitda", { precision: 18, scale: 2 }),
  ebit: decimal("ebit", { precision: 18, scale: 2 }),
  interestExpense: decimal("interestExpense", { precision: 18, scale: 2 }),
  netIncome: decimal("netIncome", { precision: 18, scale: 2 }),
  // Balance Sheet
  totalAssets: decimal("totalAssets", { precision: 18, scale: 2 }),
  currentAssets: decimal("currentAssets", { precision: 18, scale: 2 }),
  currentLiabilities: decimal("currentLiabilities", { precision: 18, scale: 2 }),
  totalDebt: decimal("totalDebt", { precision: 18, scale: 2 }),
  totalEquity: decimal("totalEquity", { precision: 18, scale: 2 }),
  // Cash Flow
  operatingCashFlow: decimal("operatingCashFlow", { precision: 18, scale: 2 }),
  debtServicePayments: decimal("debtServicePayments", { precision: 18, scale: 2 }),
  notes: text("notes"),
  isDemo: int("isDemo").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FinancialSubmission = typeof financialSubmissions.$inferSelect;
export type InsertFinancialSubmission = typeof financialSubmissions.$inferInsert;

// ─── Covenant Results ─────────────────────────────────────────────────────────
export const covenantResults = mysqlTable("covenant_results", {
  id: int("id").autoincrement().primaryKey(),
  submissionId: int("submissionId").notNull(),
  covenantId: int("covenantId").notNull(),
  borrowerId: int("borrowerId").notNull(),
  loanId: int("loanId").notNull(),
  calculatedValue: decimal("calculatedValue", { precision: 18, scale: 4 }),
  thresholdValue: decimal("thresholdValue", { precision: 18, scale: 4 }).notNull(),
  operator: varchar("operator", { length: 4 }).notNull(),
  covenantType: varchar("covenantType", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["Compliant", "Warning", "Breach"]).notNull(),
  evaluatedAt: timestamp("evaluatedAt").defaultNow().notNull(),
});

export type CovenantResult = typeof covenantResults.$inferSelect;
export type InsertCovenantResult = typeof covenantResults.$inferInsert;

// ─── Alerts ───────────────────────────────────────────────────────────────────
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  covenantResultId: int("covenantResultId").notNull(),
  borrowerId: int("borrowerId").notNull(),
  loanId: int("loanId").notNull(),
  covenantType: varchar("covenantType", { length: 64 }).notNull(),
  severity: mysqlEnum("severity", ["Warning", "Breach"]).notNull(),
  message: text("message").notNull(),
  isRead: int("isRead").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;
