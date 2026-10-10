'use client';

import { useState } from 'react';
import QuoteCutscene from '@/components/games/career/QuoteCutscene';
import BroadcastFrame from '@/components/games/career/quotes/BroadcastFrame';
import QuoteSceneStage from '@/components/games/career/quotes/QuoteSceneStage';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { SPONSOR_IDS } from '@/data/games/careerSponsors';
import {
  QUOTE_LOSS_CAUSES,
  QUOTE_SCENE_BY_ID,
  QUOTE_SCENES,
  type QuoteSceneDefinition,
  type QuoteSceneId,
} from '@/lib/constants/quoteCutscenes';
import type { QuotePlayback } from '@/lib/utils/quoteCutsceneTriggers';
import { quoteHeadline, quoteSceneText } from '@/lib/utils/quoteSceneText';

const VARIANT_LABELS: Record<string, string> = {
  cholesterol: 'cholesterol',
  puke: 'puking',
  surrender: 'surrender',
  zidari: 'Masons',
  ostrvo: 'The Island',
  korporacija: 'Corporation',
  stranka: 'Party',
  none: 'no sponsor',
};

// The picker's stand-in for a speaker with no contract; the scene gets no
// variant for it
const NO_SPONSOR = 'none';

const BUTTON =
  'rounded-lg border px-3 py-1.5 text-xs font-semibold transition';
const IDLE =
  'border-sky-200/20 bg-slate-800/60 text-slate-300 hover:border-sky-200/45 hover:text-white';
const ROW_LABEL =
  'w-20 shrink-0 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500';

// A scene whose triggers each name a variant plays in one of those
// dressings; a loss-cause trigger dresses it in the cause, a sponsor
// trigger in the speaker's sponsor or none
function variantChoicesFor(def: QuoteSceneDefinition): string[] | null {
  const variants = def.triggers.flatMap((trigger): string[] =>
    trigger.variant
      ? [trigger.variant]
      : trigger.kind === 'match-result' && trigger.lossCause
        ? [...(trigger.lossCauses ?? QUOTE_LOSS_CAUSES)]
        : trigger.kind === 'match-result' && trigger.sponsorVariant
          ? [...SPONSOR_IDS, NO_SPONSOR]
          : trigger.kind === 'sponsor-accepted' && trigger.sponsorVariant
            ? [...SPONSOR_IDS]
            : [],
  );
  return variants.length > 0 ? variants : null;
}

// The one opponent a scene can have, when every trigger of it names the
// same character
function fixedOpponentOf(def: QuoteSceneDefinition): string | null {
  const named = def.triggers.map((trigger) =>
    trigger.kind === 'match-result' ? trigger.opponent : undefined,
  );
  const first = named[0];
  return first && named.every((slug) => slug === first) ? first : null;
}

type PreviewCast = {
  speaker: string;
  other?: string;
  speakerChoices: string[];
  // Null when the scene stages nobody else or its opponent is fixed
  otherChoices: string[] | null;
};

// Who the scene plays with: the picked speaker and opponent where the scene
// allows them, the nearest allowed pair otherwise
function castFor(
  def: QuoteSceneDefinition,
  roster: string[],
  pickedSpeaker: string,
  pickedOther: string,
): PreviewCast {
  const fixedOther = fixedOpponentOf(def);
  const speakerChoices = roster.filter((slug) => slug !== fixedOther);
  const speaker = speakerChoices.includes(pickedSpeaker)
    ? pickedSpeaker
    : speakerChoices[0];
  if (def.other !== 'opponent') {
    return { speaker, speakerChoices, otherChoices: null };
  }
  if (fixedOther) {
    return { speaker, other: fixedOther, speakerChoices, otherChoices: null };
  }
  const otherChoices = roster.filter((slug) => slug !== speaker);
  return {
    speaker,
    other: otherChoices.includes(pickedOther) ? pickedOther : otherChoices[0],
    speakerChoices,
    otherChoices,
  };
}

// The wording in the middle of slot `index` out of `count`
function lineRollFor(index: number, count: number): number {
  return count > 0 ? (index + 0.5) / count : 0;
}

export default function QuoteScenePreview({
  characterBySlug,
}: {
  characterBySlug: Map<string, DuelCharacter>;
}) {
  const roster = [...characterBySlug.keys()];
  const [scene, setScene] = useState<QuoteSceneId>(QUOTE_SCENES[0].id);
  const [pickedSpeaker, setPickedSpeaker] = useState(roster[0]);
  const [pickedOther, setPickedOther] = useState(roster[1]);
  const [variants, setVariants] = useState<
    Partial<Record<QuoteSceneId, string>>
  >({});
  const [wording, setWording] = useState(0);
  const [replay, setReplay] = useState(0);
  const [modal, setModal] = useState(0);
  const def = QUOTE_SCENE_BY_ID[scene];
  const nameOf = (slug: string) => characterBySlug.get(slug)?.name ?? slug;
  const { speaker, other, speakerChoices, otherChoices } = castFor(
    def,
    roster,
    pickedSpeaker,
    pickedOther,
  );
  const variantChoices = variantChoicesFor(def);
  const picked = variantChoices
    ? (variants[scene] ?? variantChoices[0])
    : def.variant;
  const variant = picked === NO_SPONSOR ? undefined : picked;
  const wordings = quoteSceneText(scene).lines[0] ?? [];
  const wordingIndex = Math.min(wording, Math.max(0, wordings.length - 1));
  const play: QuotePlayback = {
    id: scene,
    speaker,
    other,
    variant,
    lineRoll: lineRollFor(wordingIndex, wordings.length),
  };

  // The scene after this one in the list with the same cast, queued behind
  // it to try a queue
  const followUp = (): QuotePlayback => {
    const at = QUOTE_SCENES.findIndex((item) => item.id === scene);
    const next = QUOTE_SCENES[(at + 1) % QUOTE_SCENES.length];
    const cast = castFor(next, roster, pickedSpeaker, pickedOther);
    return {
      id: next.id,
      speaker: cast.speaker,
      other: cast.other,
      lineRoll: 0,
    };
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {QUOTE_SCENES.map((item) => (
          <button
            key={item.id}
            data-scene={item.id}
            onClick={() => {
              setScene(item.id);
              setWording(0);
              setReplay(replay + 1);
            }}
            className={`${BUTTON} ${
              scene === item.id
                ? 'border-red-500/60 bg-red-500/20 text-red-200'
                : IDLE
            }`}
          >
            {item.id}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className={ROW_LABEL}>Speaker</span>
        {speakerChoices.map((slug) => (
          <button
            key={slug}
            data-speaker={slug}
            onClick={() => {
              setPickedSpeaker(slug);
              setReplay(replay + 1);
            }}
            className={`${BUTTON} ${
              speaker === slug
                ? 'border-sky-400/60 bg-sky-500/15 text-sky-200'
                : IDLE
            }`}
          >
            {nameOf(slug)}
          </button>
        ))}
      </div>
      {otherChoices && (
        <div className="flex flex-wrap items-center gap-2">
          <span className={ROW_LABEL}>Opponent</span>
          {otherChoices.map((slug) => (
            <button
              key={slug}
              data-other={slug}
              onClick={() => {
                setPickedOther(slug);
                setReplay(replay + 1);
              }}
              className={`${BUTTON} ${
                other === slug
                  ? 'border-amber-400/60 bg-amber-500/15 text-amber-200'
                  : IDLE
              }`}
            >
              {nameOf(slug)}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <span className={ROW_LABEL}>Line</span>
        {wordings.map((text, index) => (
          <button
            key={text}
            onClick={() => {
              setWording(index);
              setReplay(replay + 1);
            }}
            className={`${BUTTON} ${
              wordingIndex === index
                ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200'
                : IDLE
            }`}
          >
            {text}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {variantChoices?.map((item) => (
          <button
            key={item}
            onClick={() => {
              setVariants({ ...variants, [scene]: item });
              setReplay(replay + 1);
            }}
            className={`${BUTTON} ${
              picked === item
                ? 'border-cyan-400/60 bg-cyan-500/15 text-cyan-200'
                : IDLE
            }`}
          >
            {VARIANT_LABELS[item] ?? item}
          </button>
        ))}
        {variantChoices && <span className="mx-1 h-4 w-px bg-slate-700" />}
        <button onClick={() => setReplay(replay + 1)} className={`${BUTTON} ${IDLE}`}>
          Replay
        </button>
        <button onClick={() => setModal(1)} className={`${BUTTON} ${IDLE}`}>
          Full window
        </button>
        <button onClick={() => setModal(2)} className={`${BUTTON} ${IDLE}`}>
          Two in a row
        </button>
      </div>
      <div
        data-stage="quote"
        className="overflow-hidden rounded-2xl border border-sky-200/10"
      >
        <BroadcastFrame
          key={`${scene}-${speaker}-${other ?? ''}-${variant ?? ''}-${replay}`}
          headline={quoteHeadline(def.id, variant, {
            name: nameOf(speaker),
            other: other && nameOf(other),
          })}
        >
          <QuoteSceneStage
            scene={scene}
            speaker={speaker}
            other={other}
            variant={variant}
          />
        </BroadcastFrame>
      </div>
      {modal > 0 && (
        <QuoteCutscene
          key={`modal-${scene}-${replay}-${modal}`}
          queue={[play, ...(modal > 1 ? [followUp()] : [])]}
          characterBySlug={characterBySlug}
          onDone={() => setModal(0)}
        />
      )}
    </div>
  );
}
