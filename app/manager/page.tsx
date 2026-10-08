import type { Metadata } from 'next';
import ManagerGameMount from '@/components/games/career/ManagerGameMount';
import BackLink from '@/components/hub/BackLink';
import PageIntro from '@/components/hub/PageIntro';
import { MANAGER_PATH } from '@/lib/constants/routes';
import { requestDictionary } from '@/lib/utils/requestLocale';

export async function generateMetadata(): Promise<Metadata> {
  const ui = await requestDictionary();
  return {
    title: { absolute: ui.catalog.career.title },
    description: ui.career.page.intro,
    alternates: { canonical: MANAGER_PATH },
  };
}

export default async function ManagerPage() {
  const ui = await requestDictionary();
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center gap-10 px-4 pb-16 pt-20 sm:px-6 sm:pt-24 lg:max-w-5xl">
      <PageIntro
        eyebrow={ui.career.page.eyebrow}
        title={ui.catalog.career.title}
      />

      <div className="w-full">
        <ManagerGameMount />
      </div>

      <BackLink href="/" label={ui.hub.back} />
    </div>
  );
}
