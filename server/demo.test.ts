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
  createFinancialSubmission: vi.fn().mockResolvedValue(99),
  getSubmissionById: vi.fn().mockResolvedValue({
    id: 99, borrowerId: 1, loanId: 1, submittedByUserId: 0, periodLabel: "Q1 2025",
    periodEndDate: new Date("2025-03-31"), statementType: "Quarterly",
    revenue: "10000000", ebitda: "2000000", ebit: "1800000", interestExpense: "500000",
    netIncome: "900000", totalAssets: "20000000", currentAssets: "5000000",
    currentLiabilities: "3000000", totalDebt: "8000000", totalEquity: "10000000",
    operatingCashFlow: "2500000", debtServicePayments: "2000000", notes: null,
    isDemo: 1, createdAt: new Date(),
  }),
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue([]),
    delete: vi.fn().mockReturnThis(),
  }),
  getUserByOpenId: vi.fn().mockResolvedValue(null),
  upsertUser: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./covenantEngine", () => ({
  runCovenantEvaluation: vi.fn().mockResolvedValue({ results: [{ covenantId: 1, status: "Compliant", calculatedValue: 1.25 }], breachCount: 0, warningCount: 0 }),
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({ choices: [{ message: { content: "Demo Corp is in good covenant health." } }] }),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

import { appRouter } from "./routers";

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
    expect(Array.isArray(result.borrowerStatuses)).toBe(true);
  });

  it("borrowers list is accessible without authentication", async () => {
    const caller = appRouter.createCaller(publicCtx);
    const result = await caller.demo.borrowers();
    expect(result[0]?.name).toBe("Demo Corp");
  });

  it("borrowerDetail is accessible without authentication", async () => {
    const caller = appRouter.createCaller(publicCtx);
    const result = await caller.demo.borrowerDetail({ id: 1 });
    expect(result?.borrower.name).toBe("Demo Corp");
  });

  it("alerts list is accessible without authentication", async () => {
    const caller = appRouter.createCaller(publicCtx);
    const result = await caller.demo.alerts({ limit: 10 });
    expect(result[0]?.severity).toBe("Breach");
  });

  it("borrowerHistory is accessible without authentication", async () => {
    const caller = appRouter.createCaller(publicCtx);
    const result = await caller.demo.borrowerHistory({ id: 1 });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("demo router — interactive write actions (no auth)", () => {
  it("submitFinancials runs covenant evaluation and returns result", async () => {
    const caller = appRouter.createCaller(publicCtx);
    const result = await caller.demo.submitFinancials({
      borrowerId: 1,
      loanId: 1,
      periodLabel: "Q1 2025",
      periodEndDate: "2025-03-31",
      statementType: "Quarterly",
      ebitda: "2000000",
      totalDebt: "8000000",
      operatingCashFlow: "2500000",
      debtServicePayments: "2000000",
    });
    expect(result.submissionId).toBe(99);
    expect(result.evaluationSummary.results).toHaveLength(1);
    expect(result.evaluationSummary.breachCount).toBe(0);
  });

  it("generateNarrative returns AI text without authentication", async () => {
    const caller = appRouter.createCaller(publicCtx);
    const result = await caller.demo.generateNarrative({ borrowerId: 1 });
    expect(typeof result.narrative).toBe("string");
    expect(result.narrative.length).toBeGreaterThan(0);
    expect(result.borrowerName).toBe("Demo Corp");
  });
});
