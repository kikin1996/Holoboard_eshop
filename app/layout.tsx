import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CartProvider } from '@/components/CartContext';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'], // latin-ext kvůli českým znakům
  variable: '--font-inter',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'HoloBoard – 2v1 Paddleboard a Kajak',
    template: '%s | HoloBoard',
  },
  description:
    'HoloBoard je stabilní a pohodlné plavidlo, které kombinuje výhody paddleboardu a kajaku. Vhodné pro děti, dospělé i úplné začátečníky.',
  openGraph: {
    type: 'website',
    locale: 'cs_CZ',
    siteName: 'HoloBoard',
    title: 'HoloBoard – 2v1 Paddleboard a Kajak',
    description:
      'Stabilní a pohodlné plavidlo, které kombinuje výhody paddleboardu a kajaku. Patentováno v České republice.',
    images: [{ url: '/gallery/P1574944OB-min.jpg', width: 1200, height: 900 }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" className={inter.variable}>
      <body className="bg-paper font-sans text-ink">
        <CartProvider>
          <Navbar />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
