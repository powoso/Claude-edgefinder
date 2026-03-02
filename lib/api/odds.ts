const BASE_URL = "https://api.the-odds-api.com/v4";

export interface OddsGame {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
}

export interface Bookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: Market[];
}

export interface Market {
  key: string;
  last_update: string;
  outcomes: Outcome[];
}

export interface Outcome {
  name: string;
  price: number;
  point?: number;
}

export interface OddsLine {
  bookmaker: string;
  bookmakerKey: string;
  homeSpread: number | null;
  homeSpreadOdds: number | null;
  awaySpread: number | null;
  awaySpreadOdds: number | null;
  homeML: number | null;
  awayML: number | null;
  total: number | null;
  overOdds: number | null;
  underOdds: number | null;
  lastUpdate: string;
}

export interface ParsedGame {
  id: string;
  sportKey: string;
  sportTitle: string;
  commenceTime: string;
  homeTeam: string;
  awayTeam: string;
  lines: OddsLine[];
  bestHomeML: number | null;
  bestAwayML: number | null;
  bestHomeSpread: { point: number; odds: number } | null;
  bestAwaySpread: { point: number; odds: number } | null;
  consensusSpread: number | null;
  lineMovement: LineMovementData | null;
}

export interface LineMovementData {
  openSpread: number | null;
  currentSpread: number | null;
  direction: "home" | "away" | "none";
  magnitude: number;
}

function extractMarket(
  bookmaker: Bookmaker,
  marketKey: string
): Market | undefined {
  return bookmaker.markets.find((m) => m.key === marketKey);
}

function findOutcome(
  market: Market | undefined,
  name: string
): Outcome | undefined {
  return market?.outcomes.find((o) => o.name === name);
}

function findOverUnder(
  market: Market | undefined,
  type: "Over" | "Under"
): Outcome | undefined {
  return market?.outcomes.find((o) => o.name === type);
}

export function parseGameOdds(game: OddsGame): ParsedGame {
  const lines: OddsLine[] = game.bookmakers.map((bm) => {
    const spreads = extractMarket(bm, "spreads");
    const h2h = extractMarket(bm, "h2h");
    const totals = extractMarket(bm, "totals");

    const homeSpreadOutcome = findOutcome(spreads, game.home_team);
    const awaySpreadOutcome = findOutcome(spreads, game.away_team);
    const homeMLOutcome = findOutcome(h2h, game.home_team);
    const awayMLOutcome = findOutcome(h2h, game.away_team);
    const over = findOverUnder(totals, "Over");
    const under = findOverUnder(totals, "Under");

    return {
      bookmaker: bm.title,
      bookmakerKey: bm.key,
      homeSpread: homeSpreadOutcome?.point ?? null,
      homeSpreadOdds: homeSpreadOutcome?.price ?? null,
      awaySpread: awaySpreadOutcome?.point ?? null,
      awaySpreadOdds: awaySpreadOutcome?.price ?? null,
      homeML: homeMLOutcome?.price ?? null,
      awayML: awayMLOutcome?.price ?? null,
      total: over?.point ?? null,
      overOdds: over?.price ?? null,
      underOdds: under?.price ?? null,
      lastUpdate: bm.last_update,
    };
  });

  // Best lines
  const homeMLs = lines.map((l) => l.homeML).filter((v): v is number => v !== null);
  const awayMLs = lines.map((l) => l.awayML).filter((v): v is number => v !== null);
  const bestHomeML = homeMLs.length ? Math.max(...homeMLs) : null;
  const bestAwayML = awayMLs.length ? Math.max(...awayMLs) : null;

  // Best spreads (most favorable point + best odds at that point)
  const homeSpreads = lines
    .filter((l) => l.homeSpread !== null && l.homeSpreadOdds !== null)
    .map((l) => ({ point: l.homeSpread!, odds: l.homeSpreadOdds! }));
  const awaySpreads = lines
    .filter((l) => l.awaySpread !== null && l.awaySpreadOdds !== null)
    .map((l) => ({ point: l.awaySpread!, odds: l.awaySpreadOdds! }));

  const bestHomeSpread = homeSpreads.length
    ? homeSpreads.reduce((best, curr) =>
        curr.point > best.point || (curr.point === best.point && curr.odds > best.odds)
          ? curr : best
      )
    : null;
  const bestAwaySpread = awaySpreads.length
    ? awaySpreads.reduce((best, curr) =>
        curr.point > best.point || (curr.point === best.point && curr.odds > best.odds)
          ? curr : best
      )
    : null;

  // Consensus spread (median of all home spreads)
  const allHomeSpreads = lines
    .map((l) => l.homeSpread)
    .filter((v): v is number => v !== null)
    .sort((a, b) => a - b);
  const consensusSpread = allHomeSpreads.length
    ? allHomeSpreads[Math.floor(allHomeSpreads.length / 2)]
    : null;

  // Line movement simulation: compare first and last bookmaker updates
  let lineMovement: LineMovementData | null = null;
  if (lines.length >= 2) {
    const sorted = [...lines]
      .filter((l) => l.homeSpread !== null)
      .sort(
        (a, b) =>
          new Date(a.lastUpdate).getTime() - new Date(b.lastUpdate).getTime()
      );
    if (sorted.length >= 2) {
      const first = sorted[0].homeSpread!;
      const last = sorted[sorted.length - 1].homeSpread!;
      const diff = last - first;
      lineMovement = {
        openSpread: first,
        currentSpread: last,
        direction: diff < 0 ? "home" : diff > 0 ? "away" : "none",
        magnitude: Math.abs(diff),
      };
    }
  }

  return {
    id: game.id,
    sportKey: game.sport_key,
    sportTitle: game.sport_title,
    commenceTime: game.commence_time,
    homeTeam: game.home_team,
    awayTeam: game.away_team,
    lines,
    bestHomeML,
    bestAwayML,
    bestHomeSpread,
    bestAwaySpread,
    consensusSpread,
    lineMovement,
  };
}

export async function getUpcomingGames(
  sportKey: string
): Promise<OddsGame[]> {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) throw new Error("ODDS_API_KEY is not set");

  const res = await fetch(
    `${BASE_URL}/sports/${sportKey}/odds?apiKey=${apiKey}&regions=us&markets=h2h,spreads,totals&oddsFormat=american`,
    { next: { revalidate: 120 } }
  );

  if (!res.ok) {
    throw new Error(`Odds API error: ${res.status}`);
  }

  return res.json();
}

export async function getEventOdds(
  sportKey: string,
  eventId: string
): Promise<OddsGame> {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) throw new Error("ODDS_API_KEY is not set");

  const res = await fetch(
    `${BASE_URL}/sports/${sportKey}/events/${eventId}/odds?apiKey=${apiKey}&regions=us&markets=h2h,spreads,totals&oddsFormat=american`,
    { next: { revalidate: 60 } }
  );

  if (!res.ok) {
    throw new Error(`Odds API error: ${res.status}`);
  }

  return res.json();
}
