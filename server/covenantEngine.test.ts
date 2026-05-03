import { describe, expect, it } from "vitest";
import { calculateRatio, determineStatus, evaluateOperator } from "./covenantEngine";
import type { FinancialSubmission } from "../drizzle/schema";

// Helper to build a minimal FinancialSubmission for testing
function makeSubmission(overrides: Partial<FinancialSubmission> = {}): FinancialSubmission {
  return {
    id: 1,
    borrowerId: 1,
    loanId: 1,
    submittedByUserId: 1,
    periodLabel: "Q4 2024",
    periodEndDate: new Date("2024-12-31"),
    statementType: "Quarterly",
    revenue: "10000000",
    ebitda: "2000000",
    ebit: "1800000",
    interestExpense: "500000",
    netIncome: "900000",
    totalAssets: "20000000",
    currentAssets: "5000000",
    currentLiabilities: "3000000",
    totalDebt: "8000000",
    totalEquity: "10000000",
    operatingCashFlow: "2500000",
    debtServicePayments: "2000000",
    notes: null,
    createdAt: new Date(),
    ...overrides,
  };
}

describe("calculateRatio", () => {
  it("calculates DSCR correctly", () => {
    const sub = makeSubmission({ operatingCashFlow: "2500000", debtServicePayments: "2000000" });
    expect(calculateRatio("DSCR", sub)).toBeCloseTo(1.25, 3);
  });

  it("returns null for DSCR when debtServicePayments is 0", () => {
    const sub = makeSubmission({ debtServicePayments: "0" });
    expect(calculateRatio("DSCR", sub)).toBeNull();
  });

  it("calculates Leverage Ratio correctly", () => {
    const sub = makeSubmission({ totalDebt: "8000000", ebitda: "2000000" });
    expect(calculateRatio("Leverage Ratio", sub)).toBeCloseTo(4.0, 3);
  });

  it("calculates Current Ratio correctly", () => {
    const sub = makeSubmission({ currentAssets: "5000000", currentLiabilities: "3000000" });
    expect(calculateRatio("Current Ratio", sub)).toBeCloseTo(1.6667, 3);
  });

  it("calculates Interest Coverage correctly", () => {
    const sub = makeSubmission({ ebitda: "2000000", interestExpense: "500000" });
    expect(calculateRatio("Interest Coverage", sub)).toBeCloseTo(4.0, 3);
  });

  it("calculates Debt to EBITDA correctly", () => {
    const sub = makeSubmission({ totalDebt: "8000000", ebitda: "2000000" });
    expect(calculateRatio("Debt to EBITDA", sub)).toBeCloseTo(4.0, 3);
  });

  it("calculates Minimum Liquidity as currentAssets", () => {
    const sub = makeSubmission({ currentAssets: "5000000" });
    expect(calculateRatio("Minimum Liquidity", sub)).toBe(5000000);
  });
});

describe("evaluateOperator", () => {
  it("correctly evaluates >= operator", () => {
    expect(evaluateOperator(1.25, ">=", 1.25)).toBe(true);
    expect(evaluateOperator(1.30, ">=", 1.25)).toBe(true);
    expect(evaluateOperator(1.20, ">=", 1.25)).toBe(false);
  });

  it("correctly evaluates <= operator", () => {
    expect(evaluateOperator(4.0, "<=", 4.0)).toBe(true);
    expect(evaluateOperator(3.5, "<=", 4.0)).toBe(true);
    expect(evaluateOperator(4.5, "<=", 4.0)).toBe(false);
  });

  it("correctly evaluates > operator", () => {
    expect(evaluateOperator(1.26, ">", 1.25)).toBe(true);
    expect(evaluateOperator(1.25, ">", 1.25)).toBe(false);
  });

  it("correctly evaluates < operator", () => {
    expect(evaluateOperator(3.9, "<", 4.0)).toBe(true);
    expect(evaluateOperator(4.0, "<", 4.0)).toBe(false);
  });

  it("correctly evaluates = operator", () => {
    expect(evaluateOperator(1.25, "=", 1.25)).toBe(true);
    expect(evaluateOperator(1.26, "=", 1.25)).toBe(false);
  });
});

describe("determineStatus", () => {
  it("returns Compliant when condition passes", () => {
    expect(determineStatus(1.30, ">=", 1.25)).toBe("Compliant");
  });

  it("returns Warning when just below threshold (within 10%)", () => {
    // 1.20 is within 10% of 1.25 (threshold - 10% = 1.125)
    expect(determineStatus(1.20, ">=", 1.25)).toBe("Warning");
  });

  it("returns Breach when well below threshold", () => {
    // 0.90 is far below 1.25
    expect(determineStatus(0.90, ">=", 1.25)).toBe("Breach");
  });

  it("returns Warning for <= when just above threshold", () => {
    // 4.35 is within 10% above 4.0 threshold
    expect(determineStatus(4.35, "<=", 4.0)).toBe("Warning");
  });

  it("returns Breach for <= when well above threshold", () => {
    expect(determineStatus(6.0, "<=", 4.0)).toBe("Breach");
  });
});
