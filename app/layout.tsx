import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'], // latin-ext kvůli českým znakům
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'HoloBoard',
  description: 'Prémiový hybridní systém sezení pro paddleboardy.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" className={inter.variable}>
      <body className="bg-paper font-sans text-ink">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
