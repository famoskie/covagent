/**
 * Covenant Evaluation Engine
 *
 * Calculates financial ratios from a FinancialSubmission and evaluates
 * each active CovenantRule for the borrower. Persists CovenantResult records
 * and creates Alert records for Breach / Warning outcomes.
 */

import { Covenant, FinancialSubmission } from "../drizzle/schema";
import { notifyOwner } from "./_core/notification";
import {
  createAlert,
  createCovenantResult,
  listCovenantsByBorrower,
} from "./db";

// ─── Ratio Calculators ────────────────────────────────────────────────────────

function toNum(v: string | null | undefined): number {
  if (v === null || v === undefined) return 0;
  return parseFloat(v as string) || 0;
}

export function calculateRatio(
  type: Covenant["covenantType"],
  sub: FinancialSubmission
): number | null {
  const ebitda = toNum(sub.ebitda);
  const interestExpense = toNum(sub.interestExpense);
  const totalDebt = toNum(sub.totalDebt);
  const currentAssets = toNum(sub.currentAssets);
  const currentLiabilities = toNum(sub.currentLiabilities);
  const debtService = toNum(sub.debtServicePayments);
  const operatingCF = toNum(sub.operatingCashFlow);

  switch (type) {
    case "DSCR":
      // Debt Service Coverage Ratio = Operating Cash Flow / Debt Service Payments
      if (debtService === 0) return null;
      return operatingCF / debtService;

    case "Leverage Ratio":
      // Total Debt / EBITDA
      if (ebitda === 0) return null;
      return totalDebt / ebitda;

    case "Current Ratio":
      // Current Assets / Current Liabilities
      if (currentLiabilities === 0) return null;
      return currentAssets / currentLiabilities;

    case "Interest Coverage":
      // EBITDA / Interest Expense
      if (interestExpense === 0) return null;
      return ebitda / interestExpense;

    case "Debt to EBITDA":
      // Total Debt / EBITDA
      if (ebitda === 0) return null;
      return totalDebt / ebitda;

    case "Minimum Liquidity":
      // Current Assets as absolute liquidity measure
      return currentAssets;

    default:
      return null;
  }
}

// ─── Operator Evaluation ─────────────────────────────────────────────────────

export function evaluateOperator(
  calculatedValue: number,
  operator: string,
  threshold: number
): boolean {
  switch (operator) {
    case ">=": return calculatedValue >= threshold;
    case "<=": return calculatedValue <= threshold;
    case ">":  return calculatedValue > threshold;
    case "<":  return calculatedValue < threshold;
    case "=":  return Math.abs(calculatedValue - threshold) < 0.0001;
    default:   return false;
  }
}

// ─── Status Determination ─────────────────────────────────────────────────────

export function determineStatus(
  calculatedValue: number,
  operator: string,
  threshold: number
): "Compliant" | "Warning" | "Breach" {
  const passes = evaluateOperator(calculatedValue, operator, threshold);
  if (passes) return "Compliant";

  // Warning zone: within 10% of threshold in the failing direction
  const warningBuffer = threshold * 0.1;
  let inWarningZone = false;

  switch (operator) {
    case ">=":
    case ">":
      inWarningZone = calculatedValue >= threshold - warningBuffer;
      break;
    case "<=":
    case "<":
      inWarningZone = calculatedValue <= threshold + warningBuffer;
      break;
  }

  return inWarningZone ? "Warning" : "Breach";
}

// ─── Main Engine ──────────────────────────────────────────────────────────────

export async function runCovenantEvaluation(
  submission: FinancialSubmission,
  borrowerName: string
): Promise<{ results: Array<{ covenantId: number; covenantType: string; status: string; calculatedValue: number | null }>; breachCount: number; warningCount: number }> {
  const covenantList = await listCovenantsByBorrower(submission.borrowerId);

  const resultSummary: Array<{
    covenantId: number;
    covenantType: string;
    status: string;
    calculatedValue: number | null;
  }> = [];

  let breachCount = 0;
  let warningCount = 0;

  for (const covenant of covenantList) {
    const calculatedValue = calculateRatio(covenant.covenantType, submission);
    const threshold = parseFloat(covenant.thresholdValue as string);

    let status: "Compliant" | "Warning" | "Breach" = "Compliant";

    if (calculatedValue !== null) {
      status = determineStatus(calculatedValue, covenant.operator, threshold);
    }

    // Persist covenant result
    const resultId = await createCovenantResult({
      submissionId: submission.id,
      covenantId: covenant.id,
      borrowerId: submission.borrowerId,
      loanId: submission.loanId,
      calculatedValue: calculatedValue !== null ? String(calculatedValue.toFixed(4)) : null,
      thresholdValue: covenant.thresholdValue,
      operator: covenant.operator,
      covenantType: covenant.covenantType,
      status,
    });

    // Create alert for non-compliant results
    if (status === "Breach" || status === "Warning") {
      const calcDisplay =
        calculatedValue !== null ? calculatedValue.toFixed(4) : "N/A";
      const message =
        status === "Breach"
          ? `BREACH: ${borrowerName} failed ${covenant.covenantType} covenant. Required: ${covenant.operator} ${threshold}. Actual: ${calcDisplay}.`
          : `WARNING: ${borrowerName} is near breach on ${covenant.covenantType}. Required: ${covenant.operator} ${threshold}. Actual: ${calcDisplay}.`;

      await createAlert({
        covenantResultId: resultId,
        borrowerId: submission.borrowerId,
        loanId: submission.loanId,
        covenantType: covenant.covenantType,
        severity: status,
        message,
      });

      if (status === "Breach") {
        breachCount++;
        // Real-time owner notification for every breach
        await notifyOwner({
          title: `Covenant Breach Detected — ${borrowerName}`,
          content: message,
        });
      } else {
        warningCount++;
      }
    }

    resultSummary.push({ covenantId: covenant.id, covenantType: covenant.covenantType, status, calculatedValue });
  }

  return { results: resultSummary, breachCount, warningCount };
}
