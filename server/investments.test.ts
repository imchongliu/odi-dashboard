import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db", () => ({
  getAllInvestments: vi.fn().mockResolvedValue([
    {
      id: 1,
      announcementDate: new Date("2024-01-15"),
      companyName: "CATL",
      stockCode: "300750.SZ",
      targetCountryName: "Germany",
      targetName: "Varta AG",
      targetIndustry: "Automotive & EV",
      investmentType: "M&A",
      dealSizeUsd: "1500000000",
      announcementStage: "完成",
      dealSpecifics: { type: "ma" },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      announcementDate: new Date("2024-02-20"),
      companyName: "BYD",
      stockCode: "002594.SZ",
      targetCountryName: "Hungary",
      targetName: null,
      targetIndustry: "Automotive & EV",
      investmentType: "Greenfield",
      dealSizeUsd: "800000000",
      announcementStage: "筹划",
      dealSpecifics: { type: "greenfield" },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getInvestmentById: vi.fn().mockImplementation((id: number) => {
    if (id === 1) {
      return Promise.resolve({
        id: 1,
        announcementDate: new Date("2024-01-15"),
        companyName: "CATL",
        stockCode: "300750.SZ",
        targetCountryName: "Germany",
        targetName: "Varta AG",
        targetIndustry: "Automotive & EV",
        investmentType: "M&A",
        dealSizeUsd: "1500000000",
        announcementStage: "完成",
        dealSpecifics: { type: "ma" },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    return Promise.resolve(null);
  }),
  getInvestmentStats: vi.fn().mockResolvedValue({
    typeStats: {
      ma: { count: 12, total: 20000000000 },
      greenfield: { count: 10, total: 5000000000 },
      other: { count: 0, total: 0 },
    },
    countryStats: [
      { country: "Germany", count: 2, total: 2000000000 },
      { country: "United States", count: 1, total: 2000000000 },
    ],
    industryStats: [
      { industry: "Automotive & EV", count: 5, total: 4000000000 },
    ],
    monthlyStats: [
      { month: "2024-01", ma: 1, greenfield: 0 },
      { month: "2024-02", ma: 0, greenfield: 1 },
    ],
    recentDeals: [],
    totalDeals: 22,
    totalAmount: 25000000000,
  }),
  getDistinctCountries: vi.fn().mockResolvedValue([
    "Germany",
    "Hungary",
    "United States",
  ]),
  getDistinctIndustries: vi.fn().mockResolvedValue([
    "Automotive & EV",
    "Technology & Gaming",
  ]),
  createManyInvestments: vi.fn().mockResolvedValue(true),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(null),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("investments router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns list of investments", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Pass empty object as required by the schema
    const result = await caller.investments.list({});

    expect(result).toHaveLength(2);
    expect(result[0].companyName).toBe("CATL");
    expect(result[1].companyName).toBe("BYD");
  });

  it("returns investment by id", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Use 'detail' instead of 'getById'
    const result = await caller.investments.detail({ id: 1 });

    expect(result).not.toBeNull();
    expect(result?.companyName).toBe("CATL");
    expect(result?.investmentType).toBe("M&A");
  });

  it("returns null for non-existent investment", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Use 'detail' instead of 'getById'
    const result = await caller.investments.detail({ id: 999 });

    expect(result).toBeNull();
  });

  it("returns investment statistics", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.investments.stats();

    expect(result).not.toBeNull();
    expect(result?.typeStats.ma.count).toBe(12);
    expect(result?.typeStats.greenfield.count).toBe(10);
    expect(result?.totalDeals).toBe(22);
  });

  it("returns distinct countries", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.investments.countries();

    expect(result).toContain("Germany");
    expect(result).toContain("Hungary");
    expect(result).toContain("United States");
  });

  it("returns distinct industries", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.investments.industries();

    expect(result).toContain("Automotive & EV");
    expect(result).toContain("Technology & Gaming");
  });
});
