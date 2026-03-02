export const SPORTS = [
  { key: "americanfootball_nfl", label: "NFL", icon: "football" },
  { key: "basketball_nba", label: "NBA", icon: "basketball" },
  { key: "mma_mixed_martial_arts", label: "UFC", icon: "swords" },
  { key: "baseball_mlb", label: "MLB", icon: "baseball" },
] as const;

export type SportKey = (typeof SPORTS)[number]["key"];

export const TIER_LIMITS = {
  free: {
    dailyAnalyses: 3,
    hasUFC: false,
    hasBetExport: false,
  },
  pro: {
    dailyAnalyses: Infinity,
    hasUFC: true,
    hasBetExport: true,
  },
} as const;

export type Tier = keyof typeof TIER_LIMITS;

export const PRO_PRICE_MONTHLY = 29;

export const BET_TYPES = ["spread", "moneyline", "total", "prop"] as const;
export type BetType = (typeof BET_TYPES)[number];

export const BET_RESULTS = ["win", "loss", "push", "pending"] as const;
export type BetResult = (typeof BET_RESULTS)[number];
