'use client';

import CareerFramesProvider from '@/components/games/career/CareerFramesProvider';
import TownKioskChooser, {
  type TownKioskPaper,
  type TownKioskStats,
} from '@/components/games/career/town/TownKioskChooser';
import TownLeagueStats from '@/components/games/career/town/TownLeagueStats';
import PreviewWoodFrame from '@/components/preview/PreviewWoodFrame';
import { sampleCareer } from '@/components/preview/sampleCareer';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type { CoachTagMap } from '@/lib/types/careerMp';
import { careerPoints, rankBySeeding } from '@/lib/utils/careerPoints';
import { seasonName } from '@/lib/utils/localeNames';
import { fmt } from '@/lib/utils/format';

const noop = () => undefined;
const MASTHEAD = GAMES_UI.career.select.masthead;
const CUP_TITLE = GAMES_UI.career.newspaper.recapTitle;
const MP = GAMES_UI.careerMp.expansion;

const EDITION_HEADLINES = [
  { cup: 'CHAMPION', gazette: 'ELECTIONS', lines: ['RAID IN THE CELLAR', 'PLOT REJECTED'] },
  { cup: 'ON THE SLIDE', gazette: 'PRICES FALL', lines: ['HIT BY A CAR', 'DERBY LOST'] },
  { cup: 'CHAMPION', gazette: 'MARKET HALTS TRADING', lines: ['A CURSE ON THE GLIZZIES'] },
  { cup: 'COLLECTIVIZATION', gazette: 'RAID ON THE HILL', lines: ['LAW FAILS', 'COALITION VOTED IN'] },
];

function paper(
  key: string,
  season: number,
  cup: boolean,
  headline: string,
  lines: string[],
  unread = false,
): TownKioskPaper {
  return {
    key,
    title: cup ? CUP_TITLE : MASTHEAD,
    sub: fmt(GAMES_UI.career.newspaper.issue, { theme: seasonName(season), year: 12 }),
    cup,
    season,
    headline,
    lines,
    unread,
    onOpen: noop,
  };
}

// The kiosk's counter in every state it can be in: three papers with the
// one the town waits on glowing, every edition's pair of covers, a lone
// special issue, and the stats insert open in single player and in a room
export default function TownKioskPreview({ characters }: { characters: DuelCharacter[] }) {
  const career = sampleCareer({ slugs: characters.map((c) => c.slug) });
  const characterBySlug = new Map(characters.map((c) => [c.slug, c]));
  const humans = [career.playerSlug, career.rivalSlug ?? ''].filter(Boolean);
  const coaches: CoachTagMap = Object.fromEntries(
    humans.map((slug, i) => [slug, { name: ['Ana', 'Mare'][i], color: (['sky', 'orange'] as const)[i] }]),
  );
  const stats = (shared: boolean): TownKioskStats => ({
    sub: fmt(GAMES_UI.career.hud.year, { year: career.year }),
    leaders: rankBySeeding(career.characters, career.playerSlug)
      .slice(0, 3)
      .map((slug) => ({
        slug,
        name: characterBySlug.get(slug)?.name ?? slug,
        points: careerPoints(career.characters[slug]),
      })),
    sheet: (
      <TownLeagueStats
        career={career}
        characterBySlug={characterBySlug}
        coaches={shared ? coaches : undefined}
        shared={shared}
      />
    ),
  });
  const three = [
    paper('league', 0, false, 'ELECTIONS', ['RAID IN THE CELLAR', 'PLOT REJECTED'], true),
    paper('last', 3, true, 'CHAMPION', ['ON THE SLIDE']),
    paper('prev', 3, false, 'PRICES FALL', ['HIT BY A CAR', 'DERBY LOST']),
  ];
  return (
    <CareerFramesProvider>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start gap-4">
          <PreviewWoodFrame size="wide">
            <TownKioskChooser papers={three} stats={stats(false)} />
          </PreviewWoodFrame>
          <PreviewWoodFrame size="phone">
            <TownKioskChooser papers={three} stats={stats(false)} />
          </PreviewWoodFrame>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {EDITION_HEADLINES.map((headlines, edition) => (
            <PreviewWoodFrame key={edition} size="wide">
              <TownKioskChooser
                papers={[
                  paper(`cup-${edition}`, edition, true, headlines.cup, headlines.lines.slice(1)),
                  paper(`gazette-${edition}`, edition, false, headlines.gazette, headlines.lines),
                ]}
              />
            </PreviewWoodFrame>
          ))}
        </div>
        <div className="flex flex-wrap items-start gap-4">
          <PreviewWoodFrame size="phone">
            <TownKioskChooser
              papers={[
                {
                  key: 'expansion',
                  title: MP.masthead,
                  sub: MP.issue,
                  season: 0,
                  headline: MP.headline,
                  unread: false,
                  onOpen: noop,
                },
              ]}
              stats={stats(true)}
            />
          </PreviewWoodFrame>
          <PreviewWoodFrame size="phone">{stats(false).sheet}</PreviewWoodFrame>
          <PreviewWoodFrame size="phone">{stats(true).sheet}</PreviewWoodFrame>
        </div>
      </div>
    </CareerFramesProvider>
  );
}
