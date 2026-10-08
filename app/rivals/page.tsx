import type { Metadata } from 'next';
import RivalsLobbyMount from '@/components/games/career-mp/RivalsLobbyMount';
import BackLink from '@/components/hub/BackLink';
import PageIntro from '@/components/hub/PageIntro';
import { RIVALS_PATH } from '@/lib/constants/routes';
import { requestDictionary } from '@/lib/utils/requestLocale';

export async function generateMetadata(): Promise<Metadata> {
  const { careerMp } = await requestDictionary();
  return {
    title: careerMp.catalog.title,
    description: careerMp.catalog.description,
    alternates: { canonical: RIVALS_PATH },
  };
}

export default async function RivalsPage() {
  const ui = await requestDictionary();
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center gap-10 px-4 pb-16 pt-20 sm:px-6 sm:pt-24 lg:max-w-5xl">
      <PageIntro
        eyebrow={ui.careerMp.page.eyebrow}
        title={ui.careerMp.catalog.title}
      />

      <div className="w-full">
        <RivalsLobbyMount />
      </div>

      <BackLink href="/" label={ui.hub.back} />
    </div>
  );
}
