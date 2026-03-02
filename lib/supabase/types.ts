export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  tier: "free" | "pro";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  daily_analysis_count: number;
  daily_analysis_reset_at: string;
  created_at: string;
  updated_at: string;
};

export type Bet = {
  id: string;
  user_id: string;
  sport: string;
  game_description: string;
  bet_type: "spread" | "moneyline" | "total" | "prop";
  selection: string;
  odds: number;
  stake: number;
  result: "win" | "loss" | "push" | "pending" | null;
  profit_loss: number | null;
  closing_line: number | null;
  notes: string | null;
  game_date: string;
  created_at: string;
};

export type Analysis = {
  id: string;
  user_id: string;
  sport: string;
  event_id: string;
  home_team: string;
  away_team: string;
  analysis_content: {
    summary?: string;
    edges?: string;
    recommendation?: string;
    line_movement?: string;
    key_factors?: string;
  };
  confidence_score: number;
  odds_snapshot: Record<string, unknown>;
  created_at: string;
};

export type UFCFighter = {
  id: string;
  name: string;
  record: string;
  weight_class: string;
  stats: {
    striking_accuracy?: number;
    strikes_landed_per_min?: number;
    strikes_absorbed_per_min?: number;
    takedown_accuracy?: number;
    takedown_defense?: number;
    submission_avg?: number;
    knockdown_avg?: number;
  };
  recent_form: Array<{
    opponent: string;
    result: string;
    method: string;
    round: number;
    date: string;
  }>;
  updated_at: string;
};
