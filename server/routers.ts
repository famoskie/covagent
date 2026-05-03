import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { alertsRouter } from "./routers/alertsRouter";
import { borrowersRouter } from "./routers/borrowers";
import { covenantsRouter } from "./routers/covenants";
import { financialsRouter } from "./routers/financials";
import { loansRouter } from "./routers/loans";
import { portfolioRouter } from "./routers/portfolio";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  portfolio: portfolioRouter,
  borrowers: borrowersRouter,
  loans: loansRouter,
  covenants: covenantsRouter,
  financials: financialsRouter,
  alerts: alertsRouter,
});

export type AppRouter = typeof appRouter;
