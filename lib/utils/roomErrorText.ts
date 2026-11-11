import { GAMES_UI } from '@/data/games/locale';
import {
  ROOM_ERROR_CODES,
  type RoomErrorCode,
} from '@/lib/constants/careerMp';
import { RoomApiError } from '@/lib/queries/rooms';

function isRoomErrorCode(code: string): code is RoomErrorCode {
  return (ROOM_ERROR_CODES as readonly string[]).includes(code);
}

// The room API answers a refusal with its code as the error's message
export function roomErrorCode(error: unknown): RoomErrorCode {
  return error instanceof RoomApiError && isRoomErrorCode(error.message)
    ? error.message
    : 'generic';
}

// The server answers a refusal with a code; the sentence is the screen's
export function roomErrorText(code: RoomErrorCode): string {
  const errors: Partial<Record<string, string>> = GAMES_UI.careerMp.errors;
  return errors[code] ?? GAMES_UI.careerMp.errors.generic;
}
