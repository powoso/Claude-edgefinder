import type { ParsedGame } from "@/lib/api/odds";

// Demo data for when the Odds API key is not configured
export function getDemoGames(sport: string): ParsedGame[] {
  const now = new Date();

  if (sport === "americanfootball_nfl") {
    return [
      createDemo({
        id: "demo-nfl-1",
        sportKey: "americanfootball_nfl",
        sportTitle: "NFL",
        homeTeam: "Kansas City Chiefs",
        awayTeam: "Buffalo Bills",
        hoursFromNow: 48,
        homeSpread: -3,
        homeML: -155,
        awayML: 130,
        total: 49.5,
        lineMove: { open: -2.5, current: -3, dir: "home" as const },
        now,
      }),
      createDemo({
        id: "demo-nfl-2",
        sportKey: "americanfootball_nfl",
        sportTitle: "NFL",
        homeTeam: "San Francisco 49ers",
        awayTeam: "Dallas Cowboys",
        hoursFromNow: 52,
        homeSpread: -6.5,
        homeML: -280,
        awayML: 230,
        total: 46.5,
        lineMove: { open: -7, current: -6.5, dir: "away" as const },
        now,
      }),
      createDemo({
        id: "demo-nfl-3",
        sportKey: "americanfootball_nfl",
        sportTitle: "NFL",
        homeTeam: "Philadelphia Eagles",
        awayTeam: "Miami Dolphins",
        hoursFromNow: 72,
        homeSpread: -2.5,
        homeML: -135,
        awayML: 115,
        total: 51,
        lineMove: { open: -1, current: -2.5, dir: "home" as const },
        now,
      }),
    ];
  }

  if (sport === "basketball_nba") {
    return [
      createDemo({
        id: "demo-nba-1",
        sportKey: "basketball_nba",
        sportTitle: "NBA",
        homeTeam: "Boston Celtics",
        awayTeam: "Milwaukee Bucks",
        hoursFromNow: 6,
        homeSpread: -4.5,
        homeML: -185,
        awayML: 155,
        total: 224.5,
        lineMove: { open: -5, current: -4.5, dir: "away" as const },
        now,
      }),
      createDemo({
        id: "demo-nba-2",
        sportKey: "basketball_nba",
        sportTitle: "NBA",
        homeTeam: "Denver Nuggets",
        awayTeam: "Los Angeles Lakers",
        hoursFromNow: 8,
        homeSpread: -7,
        homeML: -300,
        awayML: 245,
        total: 218,
        lineMove: null,
        now,
      }),
      createDemo({
        id: "demo-nba-3",
        sportKey: "basketball_nba",
        sportTitle: "NBA",
        homeTeam: "Golden State Warriors",
        awayTeam: "Phoenix Suns",
        hoursFromNow: 10,
        homeSpread: -1.5,
        homeML: -118,
        awayML: -102,
        total: 230.5,
        lineMove: { open: 1, current: -1.5, dir: "home" as const },
        now,
      }),
      createDemo({
        id: "demo-nba-4",
        sportKey: "basketball_nba",
        sportTitle: "NBA",
        homeTeam: "New York Knicks",
        awayTeam: "Brooklyn Nets",
        hoursFromNow: 4,
        homeSpread: -8.5,
        homeML: -380,
        awayML: 300,
        total: 215.5,
        lineMove: null,
        now,
      }),
    ];
  }

  if (sport === "mma_mixed_martial_arts") {
    return [
      createDemo({
        id: "demo-ufc-1",
        sportKey: "mma_mixed_martial_arts",
        sportTitle: "UFC",
        homeTeam: "Islam Makhachev",
        awayTeam: "Charles Oliveira",
        hoursFromNow: 120,
        homeSpread: -5.5,
        homeML: -225,
        awayML: 185,
        total: 2.5,
        lineMove: { open: -200, current: -225, dir: "home" as const },
        now,
      }),
      createDemo({
        id: "demo-ufc-2",
        sportKey: "mma_mixed_martial_arts",
        sportTitle: "UFC",
        homeTeam: "Alex Pereira",
        awayTeam: "Jiří Procházka",
        hoursFromNow: 120,
        homeSpread: -3.5,
        homeML: -175,
        awayML: 145,
        total: 2.5,
        lineMove: null,
        now,
      }),
    ];
  }

  if (sport === "baseball_mlb") {
    return [
      createDemo({
        id: "demo-mlb-1",
        sportKey: "baseball_mlb",
        sportTitle: "MLB",
        homeTeam: "Los Angeles Dodgers",
        awayTeam: "New York Yankees",
        hoursFromNow: 24,
        homeSpread: -1.5,
        homeML: -150,
        awayML: 128,
        total: 8.5,
        lineMove: { open: -140, current: -150, dir: "home" as const },
        now,
      }),
      createDemo({
        id: "demo-mlb-2",
        sportKey: "baseball_mlb",
        sportTitle: "MLB",
        homeTeam: "Houston Astros",
        awayTeam: "Atlanta Braves",
        hoursFromNow: 26,
        homeSpread: -1.5,
        homeML: -130,
        awayML: 110,
        total: 7.5,
        lineMove: null,
        now,
      }),
    ];
  }

  return [];
}

interface DemoParams {
  id: string;
  sportKey: string;
  sportTitle: string;
  homeTeam: string;
  awayTeam: string;
  hoursFromNow: number;
  homeSpread: number;
  homeML: number;
  awayML: number;
  total: number;
  lineMove: { open: number; current: number; dir: "home" | "away" } | null;
  now: Date;
}

function createDemo(p: DemoParams): ParsedGame {
  const commence = new Date(p.now.getTime() + p.hoursFromNow * 3600 * 1000);

  const books = ["DraftKings", "FanDuel", "BetMGM", "Caesars", "PointsBet", "BetRivers"];
  const bookKeys = ["draftkings", "fanduel", "betmgm", "caesars", "pointsbet", "betrivers"];

  const lines = books.map((book, i) => {
    const variation = (Math.random() - 0.5) * 10;
    return {
      bookmaker: book,
      bookmakerKey: bookKeys[i],
      homeSpread: p.homeSpread,
      homeSpreadOdds: -110 + Math.round(variation),
      awaySpread: -p.homeSpread,
      awaySpreadOdds: -110 + Math.round(variation),
      homeML: p.homeML + Math.round(variation),
      awayML: p.awayML + Math.round(variation),
      total: p.total,
      overOdds: -110 + Math.round(variation),
      underOdds: -110 + Math.round(variation),
      lastUpdate: new Date(
        p.now.getTime() - i * 600000
      ).toISOString(),
    };
  });

  return {
    id: p.id,
    sportKey: p.sportKey,
    sportTitle: p.sportTitle,
    commenceTime: commence.toISOString(),
    homeTeam: p.homeTeam,
    awayTeam: p.awayTeam,
    lines,
    bestHomeML: Math.max(...lines.map((l) => l.homeML!)),
    bestAwayML: Math.max(...lines.map((l) => l.awayML!)),
    bestHomeSpread: { point: p.homeSpread, odds: -108 },
    bestAwaySpread: { point: -p.homeSpread, odds: -108 },
    consensusSpread: p.homeSpread,
    lineMovement: p.lineMove
      ? {
          openSpread: p.lineMove.open,
          currentSpread: p.lineMove.current,
          direction: p.lineMove.dir,
          magnitude: Math.abs(p.lineMove.current - p.lineMove.open),
        }
      : null,
  };
}
