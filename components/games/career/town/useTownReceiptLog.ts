import { useState } from 'react';
import type { ActionReceiptToast } from '@/components/games/career/ActionReceipt';

type LogState = {
  key: string;
  log: ActionReceiptToast[];
};

// Every receipt the window has shown, newest first. A receipt is logged the
// first time it reaches the town and the list starts over with a new window
export function useTownReceiptLog(
  toast: ActionReceiptToast | null,
  windowKey: string,
): ActionReceiptToast[] {
  const [state, setState] = useState<LogState>({
    key: windowKey,
    log: toast ? [toast] : [],
  });
  let next = state.key === windowKey ? state : { key: windowKey, log: [] };
  if (toast && !next.log.includes(toast)) {
    next = { ...next, log: [toast, ...next.log] };
  }
  if (next !== state) setState(next);
  return next.log;
}
