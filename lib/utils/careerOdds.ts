import {
  BET_ODDS_MARGIN,
  BET_ODDS_MAX,
  BET_ODDS_MIN,
  BET_ODDS_RANK_WEIGHT,
  BET_ODDS_SOFTNESS,
  CAREER_BET_UNLOCK_CUPS,
  TITLE_CHANCE_SOFTNESS,
} from '@/data/games/careerEconomy';
import { careerPoints, rankBySeeding } from '@/lib/utils/careerPoints';
import type { CharacterCareerState, SavedCareer } from '@/lib/utils/careerSave';

export type MatchOdds = { a: number; b: number };

// What actually wins a match on the night joins the table points: trained
// lives and sniffer outright win turns, nutrition keeps the stomach in the game,
// fanSkill only wins cameras. Cholesterol and a wild appetite cost you
const STRENGTH_LIVES_WEIGHT = 3;
const STRENGTH_NJUH_WEIGHT = 3;
const STRENGTH_NUTRITION_WEIGHT = 2;
const STRENGTH_STRESS_DIVISOR = 20;
const STRENGTH_APPETITE_PENALTY = 3;

export function matchStrength(ch: CharacterCareerState | undefined): number {
  if (!ch) return 0;
  const appetiteWild = ch.appetite > 80 || ch.appetite < 25;
  return (
    careerPoints(ch) +
    ch.livesCap.level * STRENGTH_LIVES_WEIGHT +
    ch.njuh.level * STRENGTH_NJUH_WEIGHT +
    ch.nutrition.level * STRENGTH_NUTRITION_WEIGHT -
    ch.stress / STRENGTH_STRESS_DIVISOR -
    (appetiteWild ? STRENGTH_APPETITE_PENALTY : 0)
  );
}

// Side a's win chance, 0..1: strength difference and the table position gap.
// The bookie's odds and every broadcast graphic read this one number
export function matchWinChance(
  characters: Record<string, CharacterCareerState>,
  aSlug: string,
  bSlug: string,
): number {
  const ranks = rankBySeeding(characters);
  const edge =
    matchStrength(characters[aSlug]) -
    matchStrength(characters[bSlug]) +
    BET_ODDS_RANK_WEIGHT * (ranks.indexOf(bSlug) - ranks.indexOf(aSlug));
  return 1 / (1 + 10 ** (-edge / BET_ODDS_SOFTNESS));
}

// Everyone's share of the title, 0..1, from the same strength and table
// position the bookie prices a match with, spread over the cup's own scale
export function titleChances(
  characters: Record<string, CharacterCareerState>,
): Record<string, number> {
  const ranks = rankBySeeding(characters);
  const weights = Object.fromEntries(
    Object.keys(characters).map((slug) => [
      slug,
      10 **
        ((matchStrength(characters[slug]) -
          BET_ODDS_RANK_WEIGHT * ranks.indexOf(slug)) /
          TITLE_CHANCE_SOFTNESS),
    ]),
  );
  const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
  return Object.fromEntries(
    Object.entries(weights).map(([slug, w]) => [slug, w / total]),
  );
}

export function matchOdds(
  characters: Record<string, CharacterCareerState>,
  aSlug: string,
  bSlug: string,
  maxOdds: number = BET_ODDS_MAX,
): MatchOdds {
  const chanceA = matchWinChance(characters, aSlug, bSlug);
  const toOdds = (chance: number) =>
    Math.min(
      maxOdds,
      Math.max(BET_ODDS_MIN, Math.round((BET_ODDS_MARGIN / chance) * 10) / 10),
    );
  return { a: toOdds(chanceA), b: toOdds(1 - chanceA) };
}

export function formatOdds(odds: number): string {
  return odds.toFixed(1).replace(/\.0$/, '');
}

// Betting on matches stays banned for the opening cups of the comeback, a
// leftover from the match fixing scandal; the league lifts it by letter
export function careerBettingUnlocked(career: SavedCareer): boolean {
  return career.standingsHistory.length >= CAREER_BET_UNLOCK_CUPS;
}
