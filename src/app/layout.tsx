import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    template: '%s | Closéa — Premium Fashion Rental Marketplace',
    default: 'Closéa — Editorial Peer-to-Peer Fashion Rental Marketplace',
  },
  description:
    'Closéa connects women who own beautiful designer dresses with women who want to rent them for special occasions, supported by certified partner ateliers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col font-sans bg-white text-closea-inkSoft">
        {children}
      </body>
    </html>
  );
}