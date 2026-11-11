'use client';

import { useState } from 'react';
import ElectionNightCutscene from '@/components/games/career/ElectionNightCutscene';
import ElectionPollBars from '@/components/games/career/ElectionPollBars';
import ChoiceButton from '@/components/preview/ChoiceButton';
import ElectionScenesPreview from '@/components/preview/ElectionScenesPreview';
import { previewRoster } from '@/components/preview/previewRoster';
import ParliamentChamber from '@/components/games/career/ParliamentChamber';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import { PARTY_SEAT_ORDER } from '@/data/games/careerElections';
import { SPONSOR_IDS } from '@/data/games/careerSponsors';
import { GAMES_UI } from '@/data/games/locale';
import { electionResult, governmentSeats } from '@/lib/utils/careerElections';
import type { PremierBlame, PremierSpeech } from '@/lib/utils/careerPremier';
import type { SponsorId } from '@/lib/utils/careerSave';

const SPONSOR_NAMES = GAMES_UI.career.sponsors.names as Record<
  SponsorId,
  string
>;

// Sample vote shares that land on each shape of government
const PRESETS: { label: string; votes: Record<SponsorId, number> }[] = [
  {
    label: 'Red + Blue',
    votes: { red: 35, yellow: 26, blue: 25, green: 14 },
  },
  {
    label: 'Yellow alone',
    votes: { yellow: 54, blue: 20, red: 16, green: 10 },
  },
  {
    label: 'Blue + Yellow',
    votes: { blue: 38, yellow: 22, green: 21, red: 19 },
  },
  {
    label: 'Three-way',
    votes: { green: 30, yellow: 28, blue: 24, red: 18 },
  },
];

const BLAME_CHOICES: { id: PremierBlame; label: string }[] = [
  { id: 'first', label: 'First election, blames the Alliance' },
  { id: 'previous', label: 'Blames the previous government' },
  { id: 'rival', label: 'Re-elected, blames the opposition' },
];
const LINE_CHOICES = [0, 1, 2, 3, 4, 5];

const PLAYER_CHOICES: { id: SponsorId | null; label: string }[] = [
  { id: null, label: 'No sponsor' },
  ...SPONSOR_IDS.map((id) => ({ id, label: SPONSOR_NAMES[id] })),
];

// Everything the election adds to the career, on a click: the broadcast,
// the chamber and the poll bars, over a few sample results
export default function ElectionPreviewLab() {
  const characters = previewRoster();
  const player = characters[0].slug;
  const otherPremier = characters[1].slug;
  const [preset, setPreset] = useState(0);
  const [playerSponsor, setPlayerSponsor] = useState<SponsorId | null>(
    'red'
  );
  const [playing, setPlaying] = useState(0);
  const [barsKey, setBarsKey] = useState(0);
  const [premierYou, setPremierYou] = useState(false);
  const [blame, setBlame] = useState<PremierBlame>('previous');
  const [line, setLine] = useState(0);
  const result = electionResult(PRESETS[preset].votes);
  const characterBySlug = new Map(characters.map((c) => [c.slug, c]));
  const leader = result.government[0];
  const beaten = [...PARTY_SEAT_ORDER]
    .filter((id) => !result.government.includes(id))
    .sort((a, b) => result.seats[b] - result.seats[a]);
  const premier: PremierSpeech = {
    slug: premierYou ? player : otherPremier,
    party: leader,
    blame,
    target:
      blame === 'first'
        ? null
        : blame === 'previous'
          ? (PARTY_SEAT_ORDER.find((id) => id !== leader) ?? null)
          : (beaten[0] ?? null),
    seed: line,
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3 rounded-3xl border border-frost-border/40 bg-slate-900/70 p-4 sm:p-5">
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-sky-200">
          Result
        </h2>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((entry, index) => (
            <ChoiceButton
              key={entry.label}
              active={preset === index}
              onClick={() => {
                setPreset(index);
                setBarsKey((k) => k + 1);
              }}
            >
              {entry.label}
            </ChoiceButton>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {PLAYER_CHOICES.map((choice) => (
            <ChoiceButton
              key={choice.label}
              active={playerSponsor === choice.id}
              onClick={() => setPlayerSponsor(choice.id)}
            >
              {choice.label}
            </ChoiceButton>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <ChoiceButton active={!premierYou} onClick={() => setPremierYou(false)}>
            Premier: another coach
          </ChoiceButton>
          <ChoiceButton active={premierYou} onClick={() => setPremierYou(true)}>
            Premier: you
          </ChoiceButton>
        </div>
        <div className="flex flex-wrap gap-2">
          {BLAME_CHOICES.map((choice) => (
            <ChoiceButton
              key={choice.id}
              active={blame === choice.id}
              onClick={() => setBlame(choice.id)}
            >
              {choice.label}
            </ChoiceButton>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {LINE_CHOICES.map((index) => (
            <ChoiceButton
              key={index}
              active={line === index}
              onClick={() => setLine(index)}
            >
              Line {index + 1}
            </ChoiceButton>
          ))}
        </div>
        <button
          onClick={() => setPlaying((k) => k + 1)}
          className="self-start rounded-xl border border-red-400/50 bg-red-500/15 px-5 py-2 text-xs font-black uppercase tracking-[0.3em] text-red-200 transition hover:border-red-300 hover:bg-red-500/25 hover:text-white"
        >
          Play broadcast
        </button>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-3xl border border-frost-border/40 bg-slate-900/70 p-4 sm:p-5">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-sky-200">
            Assembly
          </h2>
          <ParliamentChamber
            seats={result.seats}
            government={result.government}
            dimOutside
          />
          <ul className="flex flex-col gap-1.5">
            {[...PARTY_SEAT_ORDER]
              .sort((a, b) => result.seats[b] - result.seats[a])
              .map((id) => {
                const inGovernment = result.government.includes(id);
                const leads = result.government[0] === id;
                return (
                  <li
                    key={id}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs ${
                      inGovernment
                        ? 'border-emerald-400/30 bg-emerald-500/5 text-slate-100'
                        : 'border-slate-800 text-slate-400'
                    }`}
                  >
                    <SponsorEmblem sponsorId={id} className="h-4 w-4" />
                    <span className="flex-1 font-semibold">
                      {SPONSOR_NAMES[id]}
                    </span>
                    <span className="font-mono tabular-nums">
                      {result.seats[id]}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${
                        leads
                          ? 'border-emerald-400 text-emerald-300'
                          : inGovernment
                            ? 'border-emerald-400/50 text-emerald-300/80'
                            : 'border-red-400/50 text-red-300'
                      }`}
                    >
                      {leads ? 'leads' : inGovernment ? 'government' : 'opposition'}
                    </span>
                  </li>
                );
              })}
          </ul>
          <span className="text-right font-mono text-xs text-slate-400">
            {governmentSeats(result)} / 100
          </span>
        </section>

        <section className="flex flex-col gap-3 rounded-3xl border border-frost-border/40 bg-slate-900/70 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-sky-200">
              Poll
            </h2>
            <button
              onClick={() => setBarsKey((k) => k + 1)}
              className="rounded-lg border border-sky-200/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-300 transition hover:border-sky-200/45 hover:text-white"
            >
              Again
            </button>
          </div>
          <ElectionPollBars key={barsKey} votes={result.votes} />
          <span className="text-[11px] text-slate-400">
            The winner is marked in the broadcast, these are just the bars.
          </span>
        </section>
      </div>

      <ElectionScenesPreview result={result} />

      {playing > 0 && (
        <ElectionNightCutscene
          key={playing}
          result={result}
          premier={premier}
          playerSponsor={playerSponsor}
          playerSlug={player}
          characterBySlug={characterBySlug}
          onClose={() => setPlaying(0)}
        />
      )}
    </div>
  );
}
