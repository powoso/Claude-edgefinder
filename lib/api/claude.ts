// Claude AI client — Phase 3
// Will use Vercel AI SDK with @ai-sdk/anthropic for streaming

export const ANALYSIS_SYSTEM_PROMPT = `You are a sharp sports betting analyst. Analyze the provided data and give:
(1) a 3-sentence situation summary,
(2) key edges or concerns for each side,
(3) a recommended bet or pass with confidence level 1-10,
(4) what line movement is telling us,
(5) any key factors a casual bettor would miss.
Be direct, data-driven, and never hedge excessively.`;

export interface AnalysisInput {
  sport: string;
  homeTeam: string;
  awayTeam: string;
  currentOdds: Record<string, unknown>;
  lineMovement?: Record<string, unknown>;
  injuries?: string[];
  weather?: string;
  headToHead?: string;
  recentForm?: string;
}

export function buildAnalysisPrompt(input: AnalysisInput): string {
  const parts = [
    `## Game: ${input.awayTeam} @ ${input.homeTeam}`,
    `## Sport: ${input.sport}`,
    `\n## Current Odds\n${JSON.stringify(input.currentOdds, null, 2)}`,
  ];

  if (input.lineMovement) {
    parts.push(`\n## Line Movement\n${JSON.stringify(input.lineMovement, null, 2)}`);
  }
  if (input.injuries?.length) {
    parts.push(`\n## Injuries\n${input.injuries.join("\n")}`);
  }
  if (input.weather) {
    parts.push(`\n## Weather\n${input.weather}`);
  }
  if (input.headToHead) {
    parts.push(`\n## Head-to-Head\n${input.headToHead}`);
  }
  if (input.recentForm) {
    parts.push(`\n## Recent Form\n${input.recentForm}`);
  }

  return parts.join("\n");
}
