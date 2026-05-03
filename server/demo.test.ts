import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", () => ({
  listBorrowers: vi.fn().mockResolvedValue([
    { id: 1, name: "Demo Corp", industry: "Tech", riskRating: "Low", contactName: null, contactEmail: null, createdAt: new Date(), updatedAt: new Date() },
  ]),
  getBorrowerById: vi.fn().mockResolvedValue({
    id: 1, name: "Demo Corp", industry: "Tech", riskRating: "Low", contactName: null, contactEmail: null, createdAt: new Date(), updatedAt: new Date(),
  }),
  listLoans: vi.fn().mockResolvedValue([]),
  listCovenantsByBorrower: vi.fn().mockResolvedValue([]),
  getLatestResultsPerCovenant: vi.fn().mockResolvedValue([]),
  listAlertsByBorrower: vi.fn().mockResolvedValue([]),
  listSubmissionsByBorrower: vi.fn().mockResolvedValue([]),
  listResultsByBorrower: vi.fn().mockResolvedValue([]),
  listAlerts: vi.fn().mockResolvedValue([
    { id: 1, covenantResultId: 1, borrowerId: 1, loanId: 1, covenantType: "DSCR", severity: "Breach", message: "BREACH: Demo Corp failed DSCR.", isRead: 0, createdAt: new Date() },
  ]),
  getPortfolioSummary: vi.fn().mockResolvedValue({ totalLoans: 1, totalCovenants: 2, activeBreaches: 1, warnings: 0 }),
  // Other helpers needed by other routers
  getUserByOpenId: vi.fn().mockResolvedValue(null),
  upsertUser: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./covenantEngine", () => ({
  runCovenantEvaluation: vi.fn().mockResolvedValue({ results: [], breachCount: 0, warningCount: 0 }),
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({ choices: [{ message: { content: "Test." } }] }),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

import { appRouter } from "./routers";

// Demo procedures are publicProcedure — no auth context needed
const publicCtx: TrpcContext = {
  user: null,
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
};

describe("demo router — public access (no auth)", () => {
  it("portfolioSummary is accessible without authentication", async () => {
    const caller = appRouter.createCaller(publicCtx);
    const result = await caller.demo.portfolioSummary();
    expect(result.totalLoans).toBe(1);
    expect(result.borrowerStatuses).toBeDefined();
    expect(Array.isArray(result.borrowerStatuses)).toBe(true);
  });

  it("borrowers list is accessible without authentication", async () => {
    const caller = appRouter.createCaller(publicCtx);
    const result = await caller.demo.borrowers();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]?.name).toBe("Demo Corp");
  });

  it("borrowerDetail is accessible without authentication", async () => {
    const caller = appRouter.createCaller(publicCtx);
    const result = await caller.demo.borrowerDetail({ id: 1 });
    expect(result?.borrower.name).toBe("Demo Corp");
    expect(Array.isArray(result?.covenants)).toBe(true);
  });

  it("alerts list is accessible without authentication", async () => {
    const caller = appRouter.createCaller(publicCtx);
    const result = await caller.demo.alerts({ limit: 10 });
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]?.severity).toBe("Breach");
  });

  it("borrowerHistory is accessible without authentication", async () => {
    const caller = appRouter.createCaller(publicCtx);
    const result = await caller.demo.borrowerHistory({ id: 1 });
    expect(Array.isArray(result)).toBe(true);
  });
});
