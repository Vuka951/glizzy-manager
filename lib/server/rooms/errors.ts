import type { RoomErrorCode } from '@/lib/constants/careerMp';

// Every refused action carries a short code the client maps to a string
export class ActionError extends Error {
  code: RoomErrorCode;
  status: number;
  constructor(code: RoomErrorCode, status = 400) {
    super(code);
    this.code = code;
    this.status = status;
  }
}
