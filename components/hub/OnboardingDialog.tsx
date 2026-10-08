'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import AudioSettingsPanel from '@/components/games/AudioSettingsPanel';
import ManagerCardArt from '@/components/hub/ManagerCardArt';
import OnboardingModeButton from '@/components/hub/OnboardingModeButton';
import TrailerButton from '@/components/hub/TrailerButton';
import Icon from '@/components/icons/Icon';
import LanguageSwitch from '@/components/shared/LanguageSwitch';
import ThemeChips from '@/components/shared/ThemeChips';
import { GAMES_UI } from '@/data/games/locale';
import { MANAGER_PATH, RIVALS_PATH } from '@/lib/constants/routes';
import { fmt } from '@/lib/utils/format';
import { switchLocale } from '@/lib/utils/localeSwitch';
import { rememberOnboardingStep } from '@/lib/utils/onboarding';

const O = GAMES_UI.onboarding;

const STEPS = ['about', 'language', 'look', 'modes'] as const;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

const isInteractive = (target: EventTarget | null) =>
  target instanceof HTMLButtonElement ||
  target instanceof HTMLAnchorElement ||
  target instanceof HTMLInputElement;

// The first-visit tour: four cards in one modal. Escape skips, Enter moves
// on, Tab stays inside, and the page behind is inert until it closes
export default function OnboardingDialog({
  initialStep,
  onDone,
}: {
  initialStep: number;
  onDone: () => void;
}) {
  const router = useRouter();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(() =>
    Math.min(Math.max(initialStep, 0), STEPS.length - 1),
  );
  const last = step === STEPS.length - 1;
  const current = STEPS[step];

  const next = () => (last ? onDone() : setStep(step + 1));
  const back = () => setStep(Math.max(step - 1, 0));
  const play = (path: string) => {
    onDone();
    router.push(path);
  };

  useEffect(() => {
    dialogRef.current?.focus();
    const main = document.querySelector('main');
    main?.setAttribute('inert', '');
    return () => main?.removeAttribute('inert');
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onDone();
        return;
      }
      if (event.key === 'Enter' && !isInteractive(event.target)) {
        event.preventDefault();
        next();
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
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <button
        type="button"
        aria-label={O.skip}
        onClick={onDone}
        className="absolute inset-0 cursor-default bg-slate-950/75 backdrop-blur-sm"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative z-10 flex max-h-[85vh] w-full max-w-sm flex-col gap-4 overflow-y-auto rounded-2xl border border-frost-border/40 bg-slate-900 p-4 shadow-2xl outline-none animate-[bubblein_0.25s_ease-out]"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-sky-400">
            {O.eyebrow}
          </span>
          <ol
            aria-label={fmt(O.stepOf, { n: step + 1, total: STEPS.length })}
            className="flex items-center gap-1.5"
          >
            {STEPS.map((id, i) => (
              <li
                key={id}
                aria-current={i === step ? 'step' : undefined}
                className={`h-1.5 rounded-full transition-all ${
                  i === step
                    ? 'w-5 bg-amber-300'
                    : i < step
                      ? 'w-1.5 bg-amber-300/50'
                      : 'w-1.5 bg-slate-600'
                }`}
              />
            ))}
          </ol>
        </div>

        {current === 'about' && (
          <div className="overflow-hidden rounded-xl border border-frost-border/20">
            <ManagerCardArt />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <h2 id={titleId} className="text-xl font-bold text-white">
            {O.steps[current].title}
          </h2>
          {current !== 'modes' && (
            <p className="text-sm leading-relaxed text-slate-400">
              {O.steps[current].body}
            </p>
          )}
        </div>

        {current === 'about' && (
          <div className="flex">
            <TrailerButton label={GAMES_UI.hub.trailer} />
          </div>
        )}

        {current === 'language' && (
          <LanguageSwitch
            onSwitch={(locale) => {
              rememberOnboardingStep(step);
              switchLocale(locale);
            }}
          />
        )}

        {current === 'look' && (
          <div className="flex flex-col gap-3">
            <ThemeChips />
            <AudioSettingsPanel channels={[]} />
          </div>
        )}

        {current === 'modes' && (
          <div className="flex flex-col gap-2">
            <OnboardingModeButton
              title={GAMES_UI.catalog.career.title}
              description={O.steps.modes.manager}
              playLabel={O.steps.modes.playManager}
              onClick={() => play(MANAGER_PATH)}
            />
            <OnboardingModeButton
              title={GAMES_UI.careerMp.catalog.title}
              description={O.steps.modes.rivals}
              playLabel={O.steps.modes.playRivals}
              onClick={() => play(RIVALS_PATH)}
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-2 border-t border-sky-200/10 pt-3">
          <button
            type="button"
            onClick={back}
            className={`rounded-full px-3 py-2 text-xs font-bold text-slate-400 transition hover:text-slate-200 ${
              step === 0 ? 'invisible' : ''
            }`}
          >
            {O.back}
          </button>
          {last ? (
            <button
              type="button"
              onClick={onDone}
              className="rounded-full border border-sky-200/20 px-4 py-2 text-xs font-bold text-slate-300 transition hover:border-sky-200/50 hover:text-white"
            >
              {O.steps.modes.lookAround}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onDone}
                className="rounded-full px-3 py-2 text-xs font-bold text-slate-400 transition hover:text-slate-200"
              >
                {O.skip}
              </button>
              <button
                type="button"
                onClick={next}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-300/40 bg-red-400/10 px-4 py-2 text-xs font-bold text-red-200 transition hover:border-red-300/70 hover:bg-red-400/20"
              >
                {O.next}
                <Icon name="arrowRight" className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
