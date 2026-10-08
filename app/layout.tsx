import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import AchievementToast from '@/components/games/AchievementToast';
import Onboarding from '@/components/hub/Onboarding';
import SettingsButton from '@/components/hub/SettingsButton';
import ClientOnly from '@/components/shared/ClientOnly';
import { dictionaryFor } from '@/data/games/locale';
import { OPEN_GRAPH_LOCALE, SITE_URL } from '@/lib/constants/site';
import { requestLocale } from '@/lib/utils/requestLocale';
import './globals.css';

// latin-ext carries the Serbian diacritics; without it č, ć, ž, š and đ drop
// to a system fallback mid-word and render soft next to the rest of the text
const sans = Inter({
  variable: '--font-app-sans',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
});

const mono = Roboto_Mono({
  variable: '--font-app-mono',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await requestLocale();
  const { hub } = dictionaryFor(locale);
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      template: `%s · ${hub.siteName}`,
      default: hub.siteName,
    },
    description: hub.intro,
    applicationName: hub.siteName,
    openGraph: {
      siteName: hub.siteName,
      locale: OPEN_GRAPH_LOCALE[locale],
      type: 'website',
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await requestLocale();
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable}`}
    >
      <body className="antialiased min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('theme')==='light'){document.documentElement.classList.add('light')}}catch(e){}",
          }}
        />
        <ClientOnly>
          <SettingsButton />
        </ClientOnly>
        <main>{children}</main>
        <ClientOnly>
          <Onboarding />
          <AchievementToast />
        </ClientOnly>
      </body>
    </html>
  );
}
