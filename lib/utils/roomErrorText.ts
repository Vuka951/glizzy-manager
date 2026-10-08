import { GAMES_UI } from '@/data/games/locale';
import type { RoomErrorCode } from '@/lib/constants/careerMp';
import { CareerMpApiError } from '@/lib/queries/careerMp';

export function roomErrorCode(error: unknown): RoomErrorCode {
  return error instanceof CareerMpApiError ? error.code : 'generic';
}

// The server answers a refusal with a code; the sentence is the screen's
export function roomErrorText(code: RoomErrorCode): string {
  const errors: Partial<Record<string, string>> = GAMES_UI.careerMp.errors;
  return errors[code] ?? GAMES_UI.careerMp.errors.generic;
}
