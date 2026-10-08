import type { Metadata } from 'next';
import AchievementsBoard from '@/components/games/AchievementsBoard';
import BrandMark from '@/components/hub/BrandMark';
import GameCard from '@/components/hub/GameCard';
import ManagerCardArt from '@/components/hub/ManagerCardArt';
import PageIntro from '@/components/hub/PageIntro';
import RivalsCardArt from '@/components/hub/RivalsCardArt';
import TrailerButton from '@/components/hub/TrailerButton';
import ClientOnly from '@/components/shared/ClientOnly';
import { MANAGER_PATH, RIVALS_PATH } from '@/lib/constants/routes';
import { requestDictionary } from '@/lib/utils/requestLocale';

export async function generateMetadata(): Promise<Metadata> {
  const { hub } = await requestDictionary();
  return {
    title: hub.title,
    description: hub.intro,
    alternates: { canonical: '/' },
  };
}

export default async function HubPage() {
  const ui = await requestDictionary();
  const achievements = ui.achievements.page;

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center gap-10 px-4 pb-16 pt-20 sm:px-6 sm:pt-24">
      <PageIntro
        mark={<BrandMark />}
        eyebrow={ui.hub.eyebrow}
        title={ui.hub.title}
        intro={ui.hub.intro}
        noteTitle={ui.hub.aboutTitle}
        note={ui.hub.about}
      />

      <div className="flex w-full flex-col items-center gap-5">
        <div className="grid w-full gap-4 sm:grid-cols-2">
          <GameCard
            href={MANAGER_PATH}
            art={<ManagerCardArt />}
            mode={ui.catalog.modes.single}
            title={ui.catalog.career.title}
            playLabel={ui.hub.play}
          />
          <GameCard
            href={RIVALS_PATH}
            art={<RivalsCardArt />}
            mode={ui.catalog.modes.multi}
            title={ui.careerMp.catalog.title}
            playLabel={ui.hub.play}
          />
        </div>
        <TrailerButton label={ui.hub.trailer} />
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-frost-border/50 to-transparent" />

      <section className="flex w-full max-w-2xl flex-col items-center gap-6 pb-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-sky-400">
            {achievements.eyebrow}
          </p>
          <h2 className="text-2xl font-bold text-white">{achievements.title}</h2>
        </div>
        <ClientOnly fallback={<div className="min-h-96 w-full" />}>
          <AchievementsBoard />
        </ClientOnly>
      </section>
    </div>
  );
}
