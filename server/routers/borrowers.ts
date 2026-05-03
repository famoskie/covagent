import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createBorrower,
  getBorrowerById,
  getLatestResultsPerCovenant,
  listAlertsByBorrower,
  listBorrowers,
  listCovenantsByBorrower,
  listLoans,
  listResultsByBorrower,
  listSubmissionsByBorrower,
  updateBorrower,
} from "../db";

export const borrowersRouter = router({
  list: protectedProcedure.query(async () => {
    return listBorrowers();
  }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const borrower = await getBorrowerById(input.id);
      if (!borrower) throw new TRPCError({ code: "NOT_FOUND" });
      return borrower;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        industry: z.string().optional(),
        riskRating: z.enum(["Low", "Medium", "High", "Watch"]).default("Medium"),
        contactName: z.string().optional(),
        contactEmail: z.string().email().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Only analysts and admins can create borrowers
      if (ctx.user.role !== "analyst" && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only analysts and admins can create borrowers." });
      }
      const id = await createBorrower(input);
      return { id };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        industry: z.string().optional(),
        riskRating: z.enum(["Low", "Medium", "High", "Watch"]).optional(),
        contactName: z.string().optional(),
        contactEmail: z.string().email().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "analyst" && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const { id, ...data } = input;
      await updateBorrower(id, data);
      return { success: true };
    }),

  // Full borrower detail: loans, covenants, latest results, alerts
  detail: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const borrower = await getBorrowerById(input.id);
      if (!borrower) throw new TRPCError({ code: "NOT_FOUND" });

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

  history: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return listResultsByBorrower(input.id);
    }),
});
