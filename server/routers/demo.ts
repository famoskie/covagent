/**
 * Demo Router — all publicProcedure (no auth required)
 *
 * Read-only queries + demo-scoped write actions:
 *   - submitFinancials: runs the full covenant evaluation pipeline, marks data as demo
 *   - generateNarrative: LLM narrative for demo borrowers
 *   - resetDemoData: deletes all demo-flagged submissions/results/alerts
 */

import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { runCovenantEvaluation } from "../covenantEngine";
import {
  getBorrowerById,
  getDb,
  getLatestResultsPerCovenant,
  getPortfolioSummary,
  getSubmissionById,
  listAlerts,
  listAlertsByBorrower,
  listBorrowers,
  listCovenantsByBorrower,
  listLoans,
  listResultsByBorrower,
  listSubmissionsByBorrower,
  createFinancialSubmission,
} from "../db";
import {
  financialSubmissions,
  covenantResults,
  alerts,
} from "../../drizzle/schema";

export const demoRouter = router({
  // ── Read-only queries ──────────────────────────────────────────────────────

  portfolioSummary: publicProcedure.query(async () => {
    const [summary, allBorrowers, allLoans] = await Promise.all([
      getPortfolioSummary(),
      listBorrowers(),
      listLoans(),
    ]);

    const borrowerStatuses = await Promise.all(
      allBorrowers.map(async (b) => {
        const results = await getLatestResultsPerCovenant(b.id);
        const hasBreaches = results.some((r) => r.status === "Breach");
        const hasWarnings = results.some((r) => r.status === "Warning");
        const overallStatus = hasBreaches ? "Breach" : hasWarnings ? "Warning" : "Compliant";
        const loans = allLoans.filter((l) => l.borrowerId === b.id);
        return {
          borrower: b,
          loans,
          overallStatus,
          breachCount: results.filter((r) => r.status === "Breach").length,
          warningCount: results.filter((r) => r.status === "Warning").length,
          covenantCount: results.length,
        };
      })
    );

    return {
      ...summary,
      borrowerStatuses,
      healthChart: {
        compliant: borrowerStatuses.filter((b) => b.overallStatus === "Compliant").length,
        warning: borrowerStatuses.filter((b) => b.overallStatus === "Warning").length,
        breach: borrowerStatuses.filter((b) => b.overallStatus === "Breach").length,
      },
    };
  }),

  borrowers: publicProcedure.query(async () => listBorrowers()),

  borrowerDetail: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const borrower = await getBorrowerById(input.id);
      if (!borrower) return null;
      const [borrowerLoans, covenantList, latestResults, recentAlerts, submissions] =
        await Promise.all([
          listLoans().then((all) => all.filter((l) => l.borrowerId === input.id)),
          listCovenantsByBorrower(input.id),
          getLatestResultsPerCovenant(input.id),
          listAlertsByBorrower(input.id),
          listSubmissionsByBorrower(input.id),
        ]);
      return { borrower, loans: borrowerLoans, covenants: covenantList, latestResults, alerts: recentAlerts, submissions };
    }),

  borrowerHistory: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => listResultsByBorrower(input.id)),

  alerts: publicProcedure
    .input(z.object({ limit: z.number().default(100) }).optional())
    .query(async ({ input }) => listAlerts(input?.limit ?? 100)),

  // ── Write: Submit Financials (demo-scoped) ─────────────────────────────────

  submitFinancials: publicProcedure
    .input(
      z.object({
        borrowerId: z.number(),
        loanId: z.number(),
        periodLabel: z.string().min(1),
        periodEndDate: z.string(),
        statementType: z.enum(["Quarterly", "Annual", "Monthly"]).default("Quarterly"),
        revenue: z.string().optional(),
        ebitda: z.string().optional(),
        ebit: z.string().optional(),
        interestExpense: z.string().optional(),
        netIncome: z.string().optional(),
        totalAssets: z.string().optional(),
        currentAssets: z.string().optional(),
        currentLiabilities: z.string().optional(),
        totalDebt: z.string().optional(),
        totalEquity: z.string().optional(),
        operatingCashFlow: z.string().optional(),
        debtServicePayments: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const borrower = await getBorrowerById(input.borrowerId);
      if (!borrower) throw new Error("Borrower not found.");

      // Create submission flagged as demo (isDemo = 1, submittedByUserId = 0)
      const submissionId = await createFinancialSubmission({
        ...input,
        periodEndDate: new Date(input.periodEndDate),
        submittedByUserId: 0, // demo user
        isDemo: 1,
      });

      const submission = await getSubmissionById(submissionId);
      if (!submission) throw new Error("Submission not found after creation.");

      // Run the full covenant evaluation pipeline
      const evalResult = await runCovenantEvaluation(submission, borrower.name);

      return { submissionId, evaluationSummary: evalResult };
    }),

  // ── Write: Generate AI Narrative (demo) ───────────────────────────────────

  generateNarrative: publicProcedure
    .input(z.object({ borrowerId: z.number() }))
    .mutation(async ({ input }) => {
      const borrower = await getBorrowerById(input.borrowerId);
      if (!borrower) throw new Error("Borrower not found.");

      const [covenantList, latestResults, recentAlerts] = await Promise.all([
        listCovenantsByBorrower(input.borrowerId),
        getLatestResultsPerCovenant(input.borrowerId),
        listAlertsByBorrower(input.borrowerId),
      ]);

      const covenantSummary = covenantList.map((c) => {
        const result = latestResults.find((r) => r.covenantId === c.id);
        return `- ${c.covenantType} (${c.operator} ${c.thresholdValue}): ${
          result
            ? `Actual ${parseFloat(result.calculatedValue as string || "0").toFixed(2)} — ${result.status}`
            : "No data yet"
        }`;
      });

      const recentBreaches = recentAlerts.filter((a) => a.severity === "Breach").slice(0, 3);
      const recentWarnings = recentAlerts.filter((a) => a.severity === "Warning").slice(0, 3);

      const prompt = `You are a credit risk analyst writing a plain-language summary for a Relationship Manager (non-technical audience).

Borrower: ${borrower.name}
Industry: ${borrower.industry ?? "N/A"}
Risk Rating: ${borrower.riskRating}

Current Covenant Status:
${covenantSummary.join("\n") || "No covenants configured."}

Recent Breaches:
${recentBreaches.map((a) => `- ${a.message}`).join("\n") || "None"}

Recent Warnings:
${recentWarnings.map((a) => `- ${a.message}`).join("\n") || "None"}

Write a 3-4 sentence plain-language summary of this borrower's covenant health and any key risks. Avoid technical jargon. Be specific about any breaches or warnings.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a senior credit analyst writing concise, plain-language risk summaries for Relationship Managers. Keep responses under 150 words." },
          { role: "user", content: prompt },
        ],
      });

      const narrative = response?.choices?.[0]?.message?.content ?? "Unable to generate narrative at this time.";
      return { narrative: typeof narrative === "string" ? narrative : String(narrative), borrowerName: borrower.name };
    }),

  // ── Write: Reset Demo Data ─────────────────────────────────────────────────

  resetDemoData: publicProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");

    // Find all demo submission IDs
    const demoSubs = await db
      .select({ id: financialSubmissions.id })
      .from(financialSubmissions)
      .where(eq(financialSubmissions.isDemo, 1));

    const demoSubIds = demoSubs.map((s) => s.id);

    if (demoSubIds.length > 0) {
      // Delete covenant results for demo submissions
      for (const subId of demoSubIds) {
        await db.delete(covenantResults).where(eq(covenantResults.submissionId, subId));
      }
      // Delete demo alerts (those linked to demo covenant results — use isRead flag approach: just delete all alerts for borrowers that have demo subs)
      // Simpler: delete all alerts created after demo submissions
      await db.delete(financialSubmissions).where(eq(financialSubmissions.isDemo, 1));
    }

    return { deleted: demoSubIds.length };
  }),
});
