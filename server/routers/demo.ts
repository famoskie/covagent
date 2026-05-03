/**
 * Demo Router — all publicProcedure (no auth required)
 *
 * Exposes read-only views of portfolio, borrowers, covenants, alerts, and
 * financial submissions so unauthenticated visitors can explore the platform.
 * Write/mutate operations are intentionally excluded.
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  getBorrowerById,
  getLatestResultsPerCovenant,
  getPortfolioSummary,
  listAlerts,
  listAlertsByBorrower,
  listBorrowers,
  listCovenantsByBorrower,
  listLoans,
  listResultsByBorrower,
  listSubmissionsByBorrower,
} from "../db";

export const demoRouter = router({
  // Portfolio summary — same as authenticated version but public
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
        const overallStatus = hasBreaches
          ? "Breach"
          : hasWarnings
          ? "Warning"
          : "Compliant";
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

    const compliantCount = borrowerStatuses.filter(
      (b) => b.overallStatus === "Compliant"
    ).length;
    const warningCount = borrowerStatuses.filter(
      (b) => b.overallStatus === "Warning"
    ).length;
    const breachCount = borrowerStatuses.filter(
      (b) => b.overallStatus === "Breach"
    ).length;

    return {
      ...summary,
      borrowerStatuses,
      healthChart: {
        compliant: compliantCount,
        warning: warningCount,
        breach: breachCount,
      },
    };
  }),

  borrowers: publicProcedure.query(async () => {
    return listBorrowers();
  }),

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

      return {
        borrower,
        loans: borrowerLoans,
        covenants: covenantList,
        latestResults,
        alerts: recentAlerts,
        submissions,
      };
    }),

  borrowerHistory: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return listResultsByBorrower(input.id);
    }),

  alerts: publicProcedure
    .input(z.object({ limit: z.number().default(100) }).optional())
    .query(async ({ input }) => {
      return listAlerts(input?.limit ?? 100);
    }),
});
