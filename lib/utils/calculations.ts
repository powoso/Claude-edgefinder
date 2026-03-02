/**
 * Convert American odds to decimal odds
 */
export function americanToDecimal(odds: number): number {
  if (odds > 0) return odds / 100 + 1;
  return 100 / Math.abs(odds) + 1;
}

/**
 * Convert American odds to implied probability
 */
export function americanToImpliedProbability(odds: number): number {
  if (odds > 0) return 100 / (odds + 100);
  return Math.abs(odds) / (Math.abs(odds) + 100);
}

/**
 * Calculate profit/loss from a bet result
 */
export function calculateProfitLoss(
  stake: number,
  odds: number,
  result: "win" | "loss" | "push"
): number {
  if (result === "push") return 0;
  if (result === "loss") return -stake;
  const decimal = americanToDecimal(odds);
  return stake * (decimal - 1);
}

/**
 * Calculate ROI as a percentage
 */
export function calculateROI(totalProfit: number, totalStaked: number): number {
  if (totalStaked === 0) return 0;
  return (totalProfit / totalStaked) * 100;
}

/**
 * Calculate Closing Line Value (CLV)
 * Positive CLV means you got a better line than closing
 */
export function calculateCLV(openingOdds: number, closingOdds: number): number {
  const openProb = americanToImpliedProbability(openingOdds);
  const closeProb = americanToImpliedProbability(closingOdds);
  return (closeProb - openProb) * 100;
}

/**
 * Calculate units won/lost (1 unit = base stake)
 */
export function calculateUnits(
  profitLoss: number,
  baseUnit: number = 100
): number {
  return profitLoss / baseUnit;
}

/**
 * Format American odds with + or - prefix
 */
export function formatOdds(odds: number): string {
  return odds > 0 ? `+${odds}` : `${odds}`;
}
