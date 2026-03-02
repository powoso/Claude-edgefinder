import type { UFCFighter } from "@/lib/supabase/types";

// Demo fighter data for when Supabase isn't populated
export const DEMO_FIGHTERS: UFCFighter[] = [
  {
    id: "demo-1",
    name: "Islam Makhachev",
    record: "26-1-0",
    weight_class: "Lightweight",
    stats: {
      striking_accuracy: 59,
      strikes_landed_per_min: 4.23,
      strikes_absorbed_per_min: 2.45,
      takedown_accuracy: 61,
      takedown_defense: 89,
      submission_avg: 1.2,
      knockdown_avg: 0.6,
    },
    recent_form: [
      { opponent: "Charles Oliveira", result: "Win", method: "Submission (Arm Triangle)", round: 2, date: "2024-06-01" },
      { opponent: "Alexander Volkanovski", result: "Win", method: "KO/TKO", round: 1, date: "2024-02-17" },
      { opponent: "Alexander Volkanovski", result: "Win", method: "Decision", round: 5, date: "2023-10-21" },
      { opponent: "Charles Oliveira", result: "Win", method: "Submission (Arm Triangle)", round: 2, date: "2022-10-22" },
      { opponent: "Bobby Green", result: "Win", method: "KO/TKO", round: 1, date: "2022-02-26" },
    ],
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-2",
    name: "Charles Oliveira",
    record: "34-10-0",
    weight_class: "Lightweight",
    stats: {
      striking_accuracy: 53,
      strikes_landed_per_min: 3.42,
      strikes_absorbed_per_min: 3.15,
      takedown_accuracy: 42,
      takedown_defense: 56,
      submission_avg: 2.9,
      knockdown_avg: 0.4,
    },
    recent_form: [
      { opponent: "Islam Makhachev", result: "Loss", method: "Submission", round: 2, date: "2024-06-01" },
      { opponent: "Arman Tsarukyan", result: "Win", method: "Submission (Rear Naked Choke)", round: 1, date: "2024-04-13" },
      { opponent: "Beneil Dariush", result: "Win", method: "KO/TKO", round: 2, date: "2023-06-24" },
      { opponent: "Islam Makhachev", result: "Loss", method: "Submission", round: 2, date: "2022-10-22" },
      { opponent: "Justin Gaethje", result: "Win", method: "Submission (Rear Naked Choke)", round: 1, date: "2022-05-07" },
    ],
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-3",
    name: "Alex Pereira",
    record: "11-2-0",
    weight_class: "Light Heavyweight",
    stats: {
      striking_accuracy: 56,
      strikes_landed_per_min: 5.88,
      strikes_absorbed_per_min: 4.22,
      takedown_accuracy: 0,
      takedown_defense: 70,
      submission_avg: 0,
      knockdown_avg: 1.5,
    },
    recent_form: [
      { opponent: "Khalil Rountree Jr.", result: "Win", method: "KO/TKO", round: 4, date: "2024-10-05" },
      { opponent: "Jiří Procházka", result: "Win", method: "KO/TKO", round: 2, date: "2024-06-29" },
      { opponent: "Jamahal Hill", result: "Win", method: "KO/TKO", round: 1, date: "2024-04-13" },
      { opponent: "Jiří Procházka", result: "Win", method: "KO/TKO", round: 2, date: "2023-11-11" },
      { opponent: "Jan Blachowicz", result: "Win", method: "KO/TKO", round: 2, date: "2023-07-29" },
    ],
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-4",
    name: "Jiří Procházka",
    record: "30-5-1",
    weight_class: "Light Heavyweight",
    stats: {
      striking_accuracy: 50,
      strikes_landed_per_min: 6.11,
      strikes_absorbed_per_min: 5.89,
      takedown_accuracy: 33,
      takedown_defense: 60,
      submission_avg: 0.5,
      knockdown_avg: 0.8,
    },
    recent_form: [
      { opponent: "Alex Pereira", result: "Loss", method: "KO/TKO", round: 2, date: "2024-06-29" },
      { opponent: "Alex Pereira", result: "Loss", method: "KO/TKO", round: 2, date: "2023-11-11" },
      { opponent: "Glover Teixeira", result: "Win", method: "Submission (Rear Naked Choke)", round: 2, date: "2022-06-11" },
      { opponent: "Glover Teixeira", result: "Loss", method: "Submission", round: 2, date: "2022-12-10" },
      { opponent: "Dominick Reyes", result: "Win", method: "KO/TKO", round: 2, date: "2021-05-01" },
    ],
    updated_at: new Date().toISOString(),
  },
];

export const DEMO_MATCHUPS = [
  { fighterA: "demo-1", fighterB: "demo-2", weightClass: "Lightweight" },
  { fighterA: "demo-3", fighterB: "demo-4", weightClass: "Light Heavyweight" },
];
