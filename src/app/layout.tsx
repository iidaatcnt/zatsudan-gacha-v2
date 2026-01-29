
import type { Metadata } from 'next';
import { Inter, Zen_Kaku_Gothic_New } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-en',
});

const zenKaku = Zen_Kaku_Gothic_New({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-jp',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '雑談ガチャ v2',
  description: 'AI時代の雑談ネタ提供ツール',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${zenKaku.variable} ${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

