import type { DuelCharacter } from "@/data/games/glizzyDuel";
import { leagueCharacters } from "@/lib/utils/duelCharacters";
import { generateLeague, type LeagueEntry } from "@/lib/utils/leagueRoster";

// Every lab plays the same generated league, so a scene reads the same names
// on every visit
const PREVIEW_LEAGUE_SEED = 20261107;

let league: LeagueEntry[] | null = null;

export function previewLeague(): LeagueEntry[] {
  league ??= generateLeague(PREVIEW_LEAGUE_SEED);
  return league;
}

// The first sixteen, registered so a lab that only has a slug finds its name
export function previewRoster(): DuelCharacter[] {
  return leagueCharacters(previewLeague().slice(0, 16));
}

// The first seed stands in for every single-character preview
export function previewLead(characters: DuelCharacter[]): DuelCharacter {
  return characters[0];
}
