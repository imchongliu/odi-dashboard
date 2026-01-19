import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getAllInvestments,
  getInvestmentById,
  getInvestmentStats,
  getDistinctCountries,
  getDistinctIndustries,
  createManyInvestments,
} from "./db";

// Input validation schemas
const investmentFiltersSchema = z.object({
  type: z.enum(['M&A', 'Greenfield']).nullable().optional(),
  country: z.string().nullable().optional(),
  industry: z.string().nullable().optional(),
  status: z.enum(['Completed', 'Pending', 'Terminated']).nullable().optional(),
  search: z.string().nullable().optional(),
});

const insertInvestmentSchema = z.object({
  announcementDate: z.string(),
  investorName: z.string(),
  investorStockCode: z.string().nullable().optional(),
  targetCountry: z.string().nullable().optional(),
  targetCompanyName: z.string().nullable().optional(),
  targetIndustry: z.string().nullable().optional(),
  investmentType: z.enum(['M&A', 'Greenfield']),
  dealSizeUsd: z.string().nullable().optional(),
  status: z.enum(['Completed', 'Pending', 'Terminated']).optional(),
  dealSpecifics: z.any().nullable().optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Investment routes
  investments: router({
    // Get all investments with optional filters
    list: publicProcedure
      .input(investmentFiltersSchema.optional())
      .query(async ({ input }) => {
        const investments = await getAllInvestments(input || undefined);
        return investments;
      }),

    // Get single investment by ID
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const investment = await getInvestmentById(input.id);
        return investment;
      }),

    // Get aggregated statistics
    stats: publicProcedure.query(async () => {
      const stats = await getInvestmentStats();
      return stats;
    }),

    // Get distinct countries for filter dropdown
    countries: publicProcedure.query(async () => {
      const countries = await getDistinctCountries();
      return countries;
    }),

    // Get distinct industries for filter dropdown
    industries: publicProcedure.query(async () => {
      const industries = await getDistinctIndustries();
      return industries;
    }),

    // Bulk create investments (for seeding)
    bulkCreate: publicProcedure
      .input(z.array(insertInvestmentSchema))
      .mutation(async ({ input }) => {
        const data = input.map(item => ({
          ...item,
          announcementDate: new Date(item.announcementDate),
        }));
        const success = await createManyInvestments(data);
        return { success };
      }),
  }),
});

export type AppRouter = typeof appRouter;
