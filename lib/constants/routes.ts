export const MANAGER_PATH = '/manager';
export const RIVALS_PATH = '/rivals';

export function rivalsRoomPath(code: string): string {
  return `${RIVALS_PATH}/${code}`;
}
