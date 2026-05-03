import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  Alert,
  Borrower,
  Covenant,
  CovenantResult,
  FinancialSubmission,
  InsertAlert,
  InsertBorrower,
  InsertCovenant,
  InsertCovenantResult,
  InsertFinancialSubmission,
  InsertLoan,
  InsertUser,
  Loan,
  User,
  alerts,
  borrowers,
  covenantResults,
  covenants,
  financialSubmissions,
  loans,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserById(id: number): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function updateUserRole(
  userId: number,
  role: "user" | "admin" | "analyst" | "rm"
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function listUsers(): Promise<User[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

// ─── Borrowers ────────────────────────────────────────────────────────────────

export async function listBorrowers(): Promise<Borrower[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(borrowers).orderBy(borrowers.name);
}

export async function getBorrowerById(id: number): Promise<Borrower | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(borrowers).where(eq(borrowers.id, id)).limit(1);
  return result[0];
}

export async function createBorrower(data: InsertBorrower): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(borrowers).values(data);
  return (result[0] as { insertId: number }).insertId;
}

export async function updateBorrower(
  id: number,
  data: Partial<InsertBorrower>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(borrowers).set(data).where(eq(borrowers.id, id));
}

// ─── Loans ────────────────────────────────────────────────────────────────────

export async function listLoans(): Promise<Loan[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(loans).orderBy(desc(loans.createdAt));
}

export async function getLoansByBorrowerId(borrowerId: number): Promise<Loan[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(loans).where(eq(loans.borrowerId, borrowerId));
}

export async function getLoanById(id: number): Promise<Loan | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(loans).where(eq(loans.id, id)).limit(1);
  return result[0];
}

export async function createLoan(data: InsertLoan): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(loans).values(data);
  return (result[0] as { insertId: number }).insertId;
}

// ─── Covenants ────────────────────────────────────────────────────────────────

export async function listCovenantsByLoan(loanId: number): Promise<Covenant[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(covenants).where(and(eq(covenants.loanId, loanId), eq(covenants.isActive, 1)));
}

export async function listCovenantsByBorrower(borrowerId: number): Promise<Covenant[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(covenants)
    .where(and(eq(covenants.borrowerId, borrowerId), eq(covenants.isActive, 1)));
}

export async function listAllCovenants(): Promise<Covenant[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(covenants).orderBy(desc(covenants.createdAt));
}

export async function createCovenant(data: InsertCovenant): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(covenants).values(data);
  return (result[0] as { insertId: number }).insertId;
}

export async function updateCovenant(
  id: number,
  data: Partial<InsertCovenant>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(covenants).set(data).where(eq(covenants.id, id));
}

export async function deleteCovenant(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  // Soft delete
  await db.update(covenants).set({ isActive: 0 }).where(eq(covenants.id, id));
}

// ─── Financial Submissions ────────────────────────────────────────────────────

export async function listSubmissionsByBorrower(
  borrowerId: number
): Promise<FinancialSubmission[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(financialSubmissions)
    .where(eq(financialSubmissions.borrowerId, borrowerId))
    .orderBy(desc(financialSubmissions.periodEndDate));
}

export async function getSubmissionById(
  id: number
): Promise<FinancialSubmission | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(financialSubmissions)
    .where(eq(financialSubmissions.id, id))
    .limit(1);
  return result[0];
}

export async function createFinancialSubmission(
  data: InsertFinancialSubmission
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(financialSubmissions).values(data);
  return (result[0] as { insertId: number }).insertId;
}

// ─── Covenant Results ─────────────────────────────────────────────────────────

export async function createCovenantResult(
  data: InsertCovenantResult
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(covenantResults).values(data);
  return (result[0] as { insertId: number }).insertId;
}

export async function listResultsByBorrower(
  borrowerId: number
): Promise<CovenantResult[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(covenantResults)
    .where(eq(covenantResults.borrowerId, borrowerId))
    .orderBy(desc(covenantResults.evaluatedAt));
}

export async function listResultsBySubmission(
  submissionId: number
): Promise<CovenantResult[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(covenantResults)
    .where(eq(covenantResults.submissionId, submissionId))
    .orderBy(desc(covenantResults.evaluatedAt));
}

export async function getLatestResultsPerCovenant(
  borrowerId: number
): Promise<CovenantResult[]> {
  const db = await getDb();
  if (!db) return [];
  // Get the most recent result per covenantId for this borrower
  const all = await db
    .select()
    .from(covenantResults)
    .where(eq(covenantResults.borrowerId, borrowerId))
    .orderBy(desc(covenantResults.evaluatedAt));

  const seen = new Set<number>();
  return all.filter((r) => {
    if (seen.has(r.covenantId)) return false;
    seen.add(r.covenantId);
    return true;
  });
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export async function createAlert(data: InsertAlert): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(alerts).values(data);
  return (result[0] as { insertId: number }).insertId;
}

export async function listAlerts(limit = 100): Promise<Alert[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(alerts).orderBy(desc(alerts.createdAt)).limit(limit);
}

export async function listAlertsByBorrower(borrowerId: number): Promise<Alert[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(alerts)
    .where(eq(alerts.borrowerId, borrowerId))
    .orderBy(desc(alerts.createdAt));
}

export async function markAlertRead(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(alerts).set({ isRead: 1 }).where(eq(alerts.id, id));
}

export async function markAllAlertsRead(): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(alerts).set({ isRead: 1 });
}

// ─── Portfolio Summary ────────────────────────────────────────────────────────

export async function getPortfolioSummary() {
  const db = await getDb();
  if (!db) return { totalLoans: 0, totalCovenants: 0, activeBreaches: 0, warnings: 0 };

  const [loanCount] = await db.select({ count: sql<number>`count(*)` }).from(loans).where(eq(loans.status, "Active"));
  const [covenantCount] = await db.select({ count: sql<number>`count(*)` }).from(covenants).where(eq(covenants.isActive, 1));
  const [breachCount] = await db.select({ count: sql<number>`count(*)` }).from(alerts).where(eq(alerts.severity, "Breach"));
  const [warningCount] = await db.select({ count: sql<number>`count(*)` }).from(alerts).where(eq(alerts.severity, "Warning"));

  return {
    totalLoans: Number(loanCount?.count ?? 0),
    totalCovenants: Number(covenantCount?.count ?? 0),
    activeBreaches: Number(breachCount?.count ?? 0),
    warnings: Number(warningCount?.count ?? 0),
  };
}
