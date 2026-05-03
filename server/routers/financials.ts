import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { runCovenantEvaluation } from "../covenantEngine";
import {
  createFinancialSubmission,
  getBorrowerById,
  getSubmissionById,
  listResultsBySubmission,
  listSubmissionsByBorrower,
} from "../db";

export const financialsRouter = router({
  listByBorrower: protectedProcedure
    .input(z.object({ borrowerId: z.number() }))
    .query(async ({ input }) => {
      return listSubmissionsByBorrower(input.borrowerId);
    }),

  getWithResults: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const submission = await getSubmissionById(input.id);
      if (!submission) throw new TRPCError({ code: "NOT_FOUND" });
      const results = await listResultsBySubmission(input.id);
      return { submission, results };
    }),

  submit: protectedProcedure
    .input(
      z.object({
        borrowerId: z.number(),
        loanId: z.number(),
        periodLabel: z.string().min(1),
        periodEndDate: z.string(), // ISO date string
        statementType: z.enum(["Quarterly", "Annual", "Monthly"]).default("Quarterly"),
        // Income Statement
        revenue: z.string().optional(),
        ebitda: z.string().optional(),
        ebit: z.string().optional(),
        interestExpense: z.string().optional(),
        netIncome: z.string().optional(),
        // Balance Sheet
        totalAssets: z.string().optional(),
        currentAssets: z.string().optional(),
        currentLiabilities: z.string().optional(),
        totalDebt: z.string().optional(),
        totalEquity: z.string().optional(),
        // Cash Flow
        operatingCashFlow: z.string().optional(),
        debtServicePayments: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Only analysts and admins can submit financial data
      if (ctx.user.role !== "analyst" && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only Credit Analysts can submit financial statements.",
        });
      }

      const borrower = await getBorrowerById(input.borrowerId);
      if (!borrower) throw new TRPCError({ code: "NOT_FOUND", message: "Borrower not found." });

      // Create the financial submission
      const submissionId = await createFinancialSubmission({
        ...input,
        periodEndDate: new Date(input.periodEndDate),
        submittedByUserId: ctx.user.id,
      });

      // Fetch the full submission record for the engine
      const submission = await getSubmissionById(submissionId);
      if (!submission) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Automatically run covenant evaluation (no manual trigger needed)
      const evalResult = await runCovenantEvaluation(submission, borrower.name);

      return {
        submissionId,
        evaluationSummary: evalResult,
      };
    }),
});
