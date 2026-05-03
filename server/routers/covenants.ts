import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createCovenant,
  deleteCovenant,
  listAllCovenants,
  listCovenantsByBorrower,
  listCovenantsByLoan,
  updateCovenant,
} from "../db";

const adminGuard = (role: string) => {
  if (role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can manage covenant configurations." });
  }
};

export const covenantsRouter = router({
  listByLoan: protectedProcedure
    .input(z.object({ loanId: z.number() }))
    .query(async ({ input }) => {
      return listCovenantsByLoan(input.loanId);
    }),

  listByBorrower: protectedProcedure
    .input(z.object({ borrowerId: z.number() }))
    .query(async ({ input }) => {
      return listCovenantsByBorrower(input.borrowerId);
    }),

  listAll: protectedProcedure.query(async () => {
    return listAllCovenants();
  }),

  create: protectedProcedure
    .input(
      z.object({
        loanId: z.number(),
        borrowerId: z.number(),
        covenantType: z.enum([
          "DSCR",
          "Leverage Ratio",
          "Current Ratio",
          "Interest Coverage",
          "Debt to EBITDA",
          "Minimum Liquidity",
        ]),
        operator: z.enum([">=", "<=", ">", "<", "="]),
        thresholdValue: z.string(),
        reportingFrequency: z
          .enum(["Monthly", "Quarterly", "Semi-Annual", "Annual"])
          .default("Quarterly"),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      adminGuard(ctx.user.role);
      const id = await createCovenant(input);
      return { id };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        covenantType: z
          .enum([
            "DSCR",
            "Leverage Ratio",
            "Current Ratio",
            "Interest Coverage",
            "Debt to EBITDA",
            "Minimum Liquidity",
          ])
          .optional(),
        operator: z.enum([">=", "<=", ">", "<", "="]).optional(),
        thresholdValue: z.string().optional(),
        reportingFrequency: z
          .enum(["Monthly", "Quarterly", "Semi-Annual", "Annual"])
          .optional(),
        description: z.string().optional(),
        isActive: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      adminGuard(ctx.user.role);
      const { id, ...data } = input;
      await updateCovenant(id, data);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      adminGuard(ctx.user.role);
      await deleteCovenant(input.id);
      return { success: true };
    }),
});
