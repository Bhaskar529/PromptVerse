import type { Metadata } from 'next';
import '@/app/globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { JsonLd } from '@/components/JsonLd';
import { getFooterCollections } from '@/lib/content';
import { buildWebSiteJsonLd } from '@/lib/seo';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from '@/lib/site';

export const metadata: Metadata = {
  title: `${SITE_NAME} | ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const collections = getFooterCollections();

  return (
    <html lang="en">
      <body className="verse-shell bg-verse-bg font-sans text-white antialiased">
        <JsonLd data={buildWebSiteJsonLd()} />
        <a href="#content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-black">
          Skip to content
        </a>
        <SiteHeader />
        <main id="content">{children}</main>
        <SiteFooter collections={collections} />
      </body>
    </html>
  );
}
