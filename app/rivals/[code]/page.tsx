import type { Metadata } from 'next';
import RivalsRoomMount from '@/components/games/career-mp/RivalsRoomMount';
import BackLink from '@/components/hub/BackLink';
import { RIVALS_PATH } from '@/lib/constants/routes';
import { requestDictionary } from '@/lib/utils/requestLocale';

export async function generateMetadata(): Promise<Metadata> {
  const { careerMp } = await requestDictionary();
  return {
    title: careerMp.catalog.title,
    robots: { index: false },
  };
}

export default async function RivalsRoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const { careerMp } = await requestDictionary();
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center gap-6 px-4 pb-10 pt-18 sm:px-6 lg:max-w-5xl">
      <div className="w-full">
        <RivalsRoomMount code={code.toUpperCase()} />
      </div>
      <BackLink href={RIVALS_PATH} label={careerMp.lobby.title} />
    </div>
  );
}
