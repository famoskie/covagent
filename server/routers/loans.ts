import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { createLoan, getLoanById, getLoansByBorrowerId, listLoans } from "../db";

export const loansRouter = router({
  list: protectedProcedure.query(async () => {
    return listLoans();
  }),

  listByBorrower: protectedProcedure
    .input(z.object({ borrowerId: z.number() }))
    .query(async ({ input }) => {
      return getLoansByBorrowerId(input.borrowerId);
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const loan = await getLoanById(input.id);
      if (!loan) throw new TRPCError({ code: "NOT_FOUND" });
      return loan;
    }),

  create: protectedProcedure
    .input(
      z.object({
        borrowerId: z.number(),
        facilityName: z.string().min(1),
        facilityAmount: z.string(), // decimal as string
        currency: z.string().default("USD"),
        effectiveDate: z.string(), // ISO date string
        maturityDate: z.string(),
        status: z.enum(["Active", "Closed", "Defaulted"]).default("Active"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "analyst" && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only analysts and admins can create loans." });
      }
      const id = await createLoan({
        ...input,
        effectiveDate: new Date(input.effectiveDate),
        maturityDate: new Date(input.maturityDate),
      });
      return { id };
    }),
});
