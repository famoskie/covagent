import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getBorrowerById,
  getLatestResultsPerCovenant,
  getPortfolioSummary,
  listAlertsByBorrower,
  listBorrowers,
  listCovenantsByBorrower,
  listLoans,
  listUsers,
  updateUserRole,
} from "../db";

export const portfolioRouter = router({
  summary: protectedProcedure.query(async () => {
    const [summary, allBorrowers, allLoans, allAlerts] = await Promise.all([
      getPortfolioSummary(),
      listBorrowers(),
      listLoans(),
      import("../db").then((m) => m.listAlerts(500)),
    ]);

    // Compute per-borrower status
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

    // Portfolio health chart data
    const compliantCount = borrowerStatuses.filter((b) => b.overallStatus === "Compliant").length;
    const warningCount = borrowerStatuses.filter((b) => b.overallStatus === "Warning").length;
    const breachCount = borrowerStatuses.filter((b) => b.overallStatus === "Breach").length;

    return {
      ...summary,
      borrowerStatuses,
      healthChart: { compliant: compliantCount, warning: warningCount, breach: breachCount },
    };
  }),

  // AI-generated plain-language narrative for a borrower (for Relationship Managers)
  generateNarrative: protectedProcedure
    .input(z.object({ borrowerId: z.number() }))
    .mutation(async ({ input }) => {
      const borrower = await getBorrowerById(input.borrowerId);
      if (!borrower) throw new TRPCError({ code: "NOT_FOUND" });

      const [covenantList, latestResults, recentAlerts] = await Promise.all([
        listCovenantsByBorrower(input.borrowerId),
        getLatestResultsPerCovenant(input.borrowerId),
        listAlertsByBorrower(input.borrowerId),
      ]);

      // Build a structured context for the LLM
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

Write a 3-4 sentence plain-language summary of this borrower's covenant health and any key risks. Avoid technical jargon. Focus on what a Relationship Manager needs to know to have a productive conversation with the client. Be specific about any breaches or warnings.`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are a senior credit analyst writing concise, plain-language risk summaries for Relationship Managers. Keep responses under 150 words.",
          },
          { role: "user", content: prompt },
        ],
      });

      const narrative =
        response?.choices?.[0]?.message?.content ?? "Unable to generate narrative at this time.";

      return { narrative, borrowerName: borrower.name };
    }),

  // Admin: list and manage users/roles
  listUsers: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
    return listUsers();
  }),

  updateUserRole: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        role: z.enum(["user", "admin", "analyst", "rm"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      await updateUserRole(input.userId, input.role);
      return { success: true };
    }),
});
