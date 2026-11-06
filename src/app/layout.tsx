import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Closéa — Premium Fashion Rental Marketplace',
    default: 'Closéa — Editorial Peer-to-Peer Fashion Rental Marketplace',
  },
  description:
    'Closéa connects women who own beautiful designer dresses with women who want to rent them for special occasions, supported by certified partner ateliers.',
  keywords: [
    'Closéa',
    'fashion rental',
    'designer dress rental',
    'peer to peer fashion',
    'haute couture rental',
    'evening gown rental',
    'sustainable luxury fashion',
  ],
  authors: [{ name: 'Closéa' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-white text-closea-grey">
        {children}
      </body>
    </html>
  );
}
