import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
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
  type: z.enum(['M&A', 'Greenfield', 'Other']).nullable().optional(),
  country: z.string().nullable().optional(),
  industry: z.string().nullable().optional(),
  stage: z.enum(['筹划', '进展', '完成']).nullable().optional(),
  search: z.string().nullable().optional(),
});

const insertInvestmentSchema = z.object({
  sourceFile: z.string().nullable().optional(),
  extractionModel: z.string().nullable().optional(),
  extractionTokens: z.number().nullable().optional(),
  confidenceScore: z.string().nullable().optional(),
  validatedAt: z.string().nullable().optional(),
  dataCompleteness: z.enum(['high', 'medium', 'low']).nullable().optional(),
  
  announcementDate: z.string(),
  announcementTitle: z.string().nullable().optional(),
  announcementStage: z.enum(['筹划', '进展', '完成']).nullable().optional(),
  
  stockCode: z.string().nullable().optional(),
  companyName: z.string(),
  exchange: z.string().nullable().optional(),
  companyProvince: z.string().nullable().optional(),
  companyIndustry: z.string().nullable().optional(),
  
  investmentType: z.enum(['M&A', 'Greenfield', 'Other']),
  investmentRationale: z.string().nullable().optional(),
  
  targetName: z.string().nullable().optional(),
  targetIndustry: z.string().nullable().optional(),
  targetCountryCode: z.string().nullable().optional(),
  targetCountryName: z.string(),
  targetRegion: z.string().nullable().optional(),
  
  dealSizeOriginal: z.string().nullable().optional(),
  originalCurrency: z.string().nullable().optional(),
  dealSizeUsd: z.string(),
  
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
    list: publicProcedure
      .input(investmentFiltersSchema)
      .query(async ({ input }) => {
        const investments = await getAllInvestments(input);
        return investments;
      }),

    detail: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const investment = await getInvestmentById(input.id);
        return investment;
      }),

    stats: publicProcedure.query(async () => {
      const stats = await getInvestmentStats();
      return stats;
    }),

    countries: publicProcedure.query(async () => {
      const countries = await getDistinctCountries();
      return countries;
    }),

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
          validatedAt: item.validatedAt ? new Date(item.validatedAt) : null,
        }));
        const success = await createManyInvestments(data);
        return { success };
      }),

    // Translate Chinese text to English using LLM
    translate: publicProcedure
      .input(z.object({ text: z.string(), type: z.enum(['industry', 'region', 'company', 'target', 'rationale', 'announcement']).optional() }))
      .mutation(async ({ input }) => {
        if (!input.text || input.text.length === 0) {
          return { text: input.text, translated: input.text };
        }

        try {
          const prompt = input.type === 'region' 
            ? `Translate the following Chinese region/location name to English. Return only the translated name, nothing else:\n${input.text}`
            : `Translate the following Chinese industry name to English. Return only the translated name, nothing else:\n${input.text}`;

          const response = await invokeLLM({
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
          });

          const translated = response.choices[0]?.message.content;
          if (typeof translated === 'string') {
            return { text: input.text, translated: translated.trim() };
          }
          return { text: input.text, translated: input.text };
        } catch (error) {
          console.error('[Translation] Failed to translate:', error);
          return { text: input.text, translated: input.text };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
