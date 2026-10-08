'use client';

import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/icons/Icon';
import { ACTIVE_LOCALE, GAMES_UI } from '@/data/games/locale';
import {
  TRAILER_CAPTIONS_LOCALE,
  TRAILER_CAPTIONS_PATH,
  TRAILER_VIDEO_PATH,
} from '@/lib/constants/site';

const FOCUSABLE =
  'a[href], button:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])';

// The trailer in a dialog of its own, portaled to the body so it can sit on
// top of the onboarding tour. Everything else on the page goes inert while
// it is open; keys stop at the document so the tour's own Escape and Enter
// handlers on the window never see them. Closing pauses and unmounts the
// video, so nothing keeps playing in the background
export default function TrailerModal({ onClose }: { onClose: () => void }) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const opener = document.activeElement;
    const madeInert = Array.from(document.body.children).filter(
      (element) => element !== root && !element.hasAttribute('inert'),
    );
    madeInert.forEach((element) => element.setAttribute('inert', ''));
    dialogRef.current?.focus();
    const video = videoRef.current;
    // The click that opened the modal counts as the gesture, so the explicit
    // call starts playback even where the autoplay attribute is ignored
    video?.play().catch(() => {});
    return () => {
      video?.pause();
      madeInert.forEach((element) => element.removeAttribute('inert'));
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      event.stopPropagation();
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const end = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === dialogRef.current)) {
        event.preventDefault();
        end.focus();
      } else if (!event.shiftKey && active === end) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div
      ref={rootRef}
      className="fixed inset-0 z-[60] flex items-center justify-center p-3"
    >
      <button
        type="button"
        aria-label={GAMES_UI.shared.close}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-slate-950/80 backdrop-blur-sm"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative z-10 flex max-w-full flex-col gap-3 rounded-2xl border border-frost-border/40 bg-slate-900 p-3 shadow-2xl outline-none animate-[bubblein_0.25s_ease-out] sm:p-4"
      >
        <div className="flex items-center justify-between gap-3">
          <span
            id={titleId}
            className="text-[10px] font-bold uppercase tracking-[0.3em] text-sky-400"
          >
            {GAMES_UI.hub.trailerTitle}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={GAMES_UI.shared.close}
            className="shrink-0 rounded-full border border-sky-200/15 bg-slate-800/60 p-1.5 text-slate-400 transition hover:border-sky-200/40 hover:text-white"
          >
            <Icon name="close" className="h-3.5 w-3.5" />
          </button>
        </div>
        <video
          ref={videoRef}
          controls
          autoPlay
          playsInline
          preload="metadata"
          className="aspect-[9/16] h-[min(85vh,calc(100vh_-_7rem),calc((100vw_-_3rem)*16/9))] w-auto max-w-full rounded-xl bg-slate-950 outline-none"
        >
          <source src={TRAILER_VIDEO_PATH} type="video/mp4" />
          <track
            kind="captions"
            srcLang={TRAILER_CAPTIONS_LOCALE}
            label={GAMES_UI.shared.language[TRAILER_CAPTIONS_LOCALE]}
            src={TRAILER_CAPTIONS_PATH}
            default={ACTIVE_LOCALE === TRAILER_CAPTIONS_LOCALE}
          />
        </video>
      </div>
    </div>,
    document.body,
  );
}
