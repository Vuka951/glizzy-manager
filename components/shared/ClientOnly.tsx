'use client';

import { useSyncExternalStore, type ReactNode } from 'react';

const subscribe = () => () => {};

// Renders its children in the browser only. The server has no per-request
// language for client components, so any tree that reads GAMES_UI mounts
// behind this; `fallback` holds the layout until then
export default function ClientOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return mounted ? children : fallback;
}
