import {
  CAREER_MP_API_PATH,
  CAREER_MP_ROOM_NAMESPACE,
  COACH_TOKEN_HEADER,
  TOKEN_STORAGE_PREFIX,
} from '@/lib/constants/careerMp';
import { createRoomApi } from '@/lib/queries/rooms';
import type {
  ActionResponse,
  CreateRoomRequest,
  JoinRoomRequest,
  JoinRoomResponse,
  RoomAction,
  RoomSummary,
  RoomView,
} from '@/lib/types/careerMp';

export const careerMpApi = createRoomApi<{
  view: RoomView;
  action: RoomAction;
  summary: RoomSummary;
  createBody: CreateRoomRequest;
  joinBody: JoinRoomRequest;
  seated: JoinRoomResponse;
  actionResult: ActionResponse;
}>({
  basePath: CAREER_MP_API_PATH,
  tokenHeader: COACH_TOKEN_HEADER,
  storagePrefix: TOKEN_STORAGE_PREFIX,
  queryScope: CAREER_MP_ROOM_NAMESPACE,
});

export const careerMpKeys = careerMpApi.keys;

export const {
  knownRoomCodes,
  fetchRooms,
  subscribeToken,
  readToken,
  noToken,
  storeToken,
  clearToken,
  createRoom,
  joinRoom,
} = careerMpApi;
