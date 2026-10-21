import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'ClipBin - Text & File Sharing',
  description: 'Fast, secure, anonymous text pastes and private file sharing with password protection and auto-expiry.',
  keywords: ['pastebin', 'file share', 'anonymous', 'secure paste', 'burn after read', 'code sharing'],
  authors: [{ name: 'ClipBin' }],
  openGraph: {
    title: 'ClipBin - Text & File Sharing',
    description: 'Fast, secure, anonymous text pastes and private file sharing with password protection and auto-expiry.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('clipbin-theme');
                  if (saved === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <Header />
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 sm:py-12">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
