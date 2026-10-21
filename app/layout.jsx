import './globals.css';
import '@/components/Karaoke/karaoke.css';
import { LanguageProvider } from '@/components/LanguageProvider';
import { KaraokePlayerProvider } from '@/components/Karaoke/KaraokePlayerProvider';
import KaraokeOverlays from '@/components/Karaoke/KaraokeOverlays';

const description =
  'Semua tentang Asuka Cheeda Jetto, dokter hewan virtual: profil, cover lagu, VETTALK, dan semua akun resminya di satu halaman.';

export const metadata = {
  // Absolute URLs for link previews. On Vercel, Next falls back to the production domain on its own.
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
  title: 'Website Asuka Jetto',
  description,
  openGraph: {
    type: 'website',
    siteName: 'Website Asuka Jetto',
    title: 'Website Asuka Jetto',
    description,
    locale: 'id_ID',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Website Asuka Jetto',
    description,
  },
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,400..800;1,62..125,400..700&family=JetBrains+Mono:wght@400;500;700&family=Urbanist:wght@400..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LanguageProvider>
          {/* One audio engine for the whole site: it keeps playing across sections and between pages. */}
          <KaraokePlayerProvider>
            {children}
            <KaraokeOverlays />
          </KaraokePlayerProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
