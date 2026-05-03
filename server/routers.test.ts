import { describe, expect, it, vi, beforeEach } from "vitest";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

// Mock the DB module so tests don't need a real database
vi.mock("./db", () => ({
  listBorrowers: vi.fn().mockResolvedValue([
    { id: 1, name: "Test Corp", industry: "Tech", riskRating: "Low", contactName: null, contactEmail: null, createdAt: new Date(), updatedAt: new Date() },
  ]),
  getBorrowerById: vi.fn().mockResolvedValue({
    id: 1, name: "Test Corp", industry: "Tech", riskRating: "Low", contactName: null, contactEmail: null, createdAt: new Date(), updatedAt: new Date(),
  }),
  createBorrower: vi.fn().mockResolvedValue(42),
  updateBorrower: vi.fn().mockResolvedValue(undefined),
  listLoans: vi.fn().mockResolvedValue([]),
  getLoansByBorrowerId: vi.fn().mockResolvedValue([]),
  getLoanById: vi.fn().mockResolvedValue(null),
  createLoan: vi.fn().mockResolvedValue(10),
  listCovenantsByLoan: vi.fn().mockResolvedValue([]),
  listCovenantsByBorrower: vi.fn().mockResolvedValue([]),
  listAllCovenants: vi.fn().mockResolvedValue([]),
  createCovenant: vi.fn().mockResolvedValue(5),
  updateCovenant: vi.fn().mockResolvedValue(undefined),
  deleteCovenant: vi.fn().mockResolvedValue(undefined),
  listSubmissionsByBorrower: vi.fn().mockResolvedValue([]),
  getSubmissionById: vi.fn().mockResolvedValue(null),
  createFinancialSubmission: vi.fn().mockResolvedValue(7),
  listResultsByBorrower: vi.fn().mockResolvedValue([]),
  listResultsBySubmission: vi.fn().mockResolvedValue([]),
  getLatestResultsPerCovenant: vi.fn().mockResolvedValue([]),
  listAlerts: vi.fn().mockResolvedValue([]),
  listAlertsByBorrower: vi.fn().mockResolvedValue([]),
  createAlert: vi.fn().mockResolvedValue(1),
  markAlertRead: vi.fn().mockResolvedValue(undefined),
  markAllAlertsRead: vi.fn().mockResolvedValue(undefined),
  getPortfolioSummary: vi.fn().mockResolvedValue({ totalLoans: 3, totalCovenants: 6, activeBreaches: 1, warnings: 2 }),
  listUsers: vi.fn().mockResolvedValue([]),
  updateUserRole: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(null),
  upsertUser: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./covenantEngine", () => ({
  runCovenantEvaluation: vi.fn().mockResolvedValue({ results: [], breachCount: 0, warningCount: 0 }),
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({ choices: [{ message: { content: "Test narrative." } }] }),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

import { appRouter } from "./routers";

function makeCtx(role: "admin" | "analyst" | "rm" | "user" = "rm"): TrpcContext {
  const user: User = {
    id: 1,
    openId: "test-user",
    name: "Test User",
    email: "test@example.com",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("borrowers router", () => {
  it("list returns borrowers for any authenticated user", async () => {
    const caller = appRouter.createCaller(makeCtx("rm"));
    const result = await caller.borrowers.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]?.name).toBe("Test Corp");
  });

  it("create throws FORBIDDEN for rm role", async () => {
    const caller = appRouter.createCaller(makeCtx("rm"));
    await expect(
      caller.borrowers.create({ name: "New Corp", riskRating: "Low" })
    ).rejects.toThrow();
  });

  it("create succeeds for analyst role", async () => {
    const caller = appRouter.createCaller(makeCtx("analyst"));
    const result = await caller.borrowers.create({ name: "New Corp", riskRating: "Low" });
    expect(result.id).toBe(42);
  });
});

describe("covenants router — admin guard", () => {
  it("create throws FORBIDDEN for analyst role", async () => {
    const caller = appRouter.createCaller(makeCtx("analyst"));
    await expect(
      caller.covenants.create({
        loanId: 1,
        borrowerId: 1,
        covenantType: "DSCR",
        operator: ">=",
        thresholdValue: "1.25",
      })
    ).rejects.toThrow();
  });

  it("create succeeds for admin role", async () => {
    const caller = appRouter.createCaller(makeCtx("admin"));
    const result = await caller.covenants.create({
      loanId: 1,
      borrowerId: 1,
      covenantType: "DSCR",
      operator: ">=",
      thresholdValue: "1.25",
    });
    expect(result.id).toBe(5);
  });

  it("delete throws FORBIDDEN for rm role", async () => {
    const caller = appRouter.createCaller(makeCtx("rm"));
    await expect(caller.covenants.delete({ id: 1 })).rejects.toThrow();
  });
});

describe("alerts router", () => {
  it("list returns alerts for any authenticated user", async () => {
    const caller = appRouter.createCaller(makeCtx("rm"));
    const result = await caller.alerts.list({ limit: 10 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("markAllRead succeeds for any authenticated user", async () => {
    const caller = appRouter.createCaller(makeCtx("rm"));
    const result = await caller.alerts.markAllRead();
    expect(result.success).toBe(true);
  });
});

describe("financials router — role guard", () => {
  it("submit throws FORBIDDEN for rm role", async () => {
    const caller = appRouter.createCaller(makeCtx("rm"));
    await expect(
      caller.financials.submit({
        borrowerId: 1,
        loanId: 1,
        periodLabel: "Q4 2024",
        periodEndDate: "2024-12-31",
        statementType: "Quarterly",
      })
    ).rejects.toThrow();
  });
});

describe("portfolio router — admin guard", () => {
  it("listUsers throws FORBIDDEN for analyst role", async () => {
    const caller = appRouter.createCaller(makeCtx("analyst"));
    await expect(caller.portfolio.listUsers()).rejects.toThrow();
  });

  it("listUsers succeeds for admin role", async () => {
    const caller = appRouter.createCaller(makeCtx("admin"));
    const result = await caller.portfolio.listUsers();
    expect(Array.isArray(result)).toBe(true);
  });
});
