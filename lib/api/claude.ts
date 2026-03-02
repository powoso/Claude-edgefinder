import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

export const ANALYSIS_SYSTEM_PROMPT = `You are a sharp sports betting analyst with deep expertise in line movement, market dynamics, and statistical analysis. Your job is to find edges that casual bettors miss.

When analyzing a game, structure your response EXACTLY in this format with these headers:

## Situation Summary
[3 sentences max. What's the setup, key narrative, and market state.]

## Edges & Concerns

**For {away_team}:**
[2-3 bullet points on edges or concerns]

**For {home_team}:**
[2-3 bullet points on edges or concerns]

## Line Movement Analysis
[What the line movement tells us about sharp action. 2-3 sentences.]

## Recommended Play
[Clear recommendation: specific bet or PASS. Include confidence level 1-10.]
**Confidence: X/10**

## Hidden Factors
[2-3 factors a casual bettor would miss. Be specific and data-driven.]

Rules:
- Be direct and opinionated. Take a stance.
- Never hedge with "could go either way" or "both teams are good."
- Reference specific numbers from the data provided.
- If the data suggests a pass, say so clearly.
- Confidence 1-3 = lean/pass, 4-6 = moderate edge, 7-10 = strong play.`;

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
    `\n## Current Odds (from multiple sportsbooks)\n${JSON.stringify(input.currentOdds, null, 2)}`,
  ];

  if (input.lineMovement) {
    parts.push(
      `\n## Line Movement Data\n${JSON.stringify(input.lineMovement, null, 2)}`
    );
  }
  if (input.injuries?.length) {
    parts.push(`\n## Injury Report\n${input.injuries.join("\n")}`);
  }
  if (input.weather) {
    parts.push(`\n## Weather Conditions\n${input.weather}`);
  }
  if (input.headToHead) {
    parts.push(`\n## Head-to-Head History\n${input.headToHead}`);
  }
  if (input.recentForm) {
    parts.push(`\n## Recent Performance (Last 10)\n${input.recentForm}`);
  }

  parts.push(
    "\n\nAnalyze this game. Be specific, reference the data above, and give a clear recommendation."
  );

  return parts.join("\n");
}

export function createAnalysisStream(prompt: string) {
  return streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: ANALYSIS_SYSTEM_PROMPT,
    prompt,
    maxOutputTokens: 1500,
    temperature: 0.3,
  });
}

export function extractConfidenceScore(text: string): number {
  // Look for "Confidence: X/10" pattern
  const match = text.match(/\*?\*?Confidence:\s*(\d+)\s*\/\s*10\*?\*?/i);
  if (match) return parseInt(match[1], 10);

  // Fallback: look for any X/10 pattern near "confidence"
  const fallback = text.match(/confidence[^.]*?(\d+)\s*\/\s*10/i);
  if (fallback) return parseInt(fallback[1], 10);

  return 5; // Default if not found
}

export function parseAnalysisSections(text: string): {
  summary: string;
  edges: string;
  lineMovement: string;
  recommendation: string;
  hiddenFactors: string;
} {
  const sections = {
    summary: "",
    edges: "",
    lineMovement: "",
    recommendation: "",
    hiddenFactors: "",
  };

  const sectionMap: Record<string, keyof typeof sections> = {
    "situation summary": "summary",
    "edges & concerns": "edges",
    "edges and concerns": "edges",
    "line movement analysis": "lineMovement",
    "line movement": "lineMovement",
    "recommended play": "recommendation",
    recommendation: "recommendation",
    "hidden factors": "hiddenFactors",
  };

  // Split by ## headers
  const parts = text.split(/^## /m).filter(Boolean);

  for (const part of parts) {
    const firstLine = part.split("\n")[0].trim().toLowerCase();
    const content = part.substring(part.indexOf("\n") + 1).trim();

    for (const [key, sectionKey] of Object.entries(sectionMap)) {
      if (firstLine.includes(key)) {
        sections[sectionKey] = content;
        break;
      }
    }
  }

  return sections;
}
