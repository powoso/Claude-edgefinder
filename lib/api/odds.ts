// The Odds API client — Phase 2
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
