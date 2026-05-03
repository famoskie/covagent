import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  listAlerts,
  listAlertsByBorrower,
  markAlertRead,
  markAllAlertsRead,
} from "../db";

export const alertsRouter = router({
  list: protectedProcedure
    .input(z.object({ limit: z.number().default(100) }).optional())
    .query(async ({ input }) => {
      return listAlerts(input?.limit ?? 100);
    }),

  listByBorrower: protectedProcedure
    .input(z.object({ borrowerId: z.number() }))
    .query(async ({ input }) => {
      return listAlertsByBorrower(input.borrowerId);
    }),

  markRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await markAlertRead(input.id);
      return { success: true };
    }),

  markAllRead: protectedProcedure.mutation(async () => {
    await markAllAlertsRead();
    return { success: true };
  }),
});
