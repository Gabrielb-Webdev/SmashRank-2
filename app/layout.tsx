import type { Metadata } from 'next';
import { Inter, Bangers, Permanent_Marker } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Navbar from '@/components/layout/Navbar';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const bangers = Bangers({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bangers',
});

const permanentMarker = Permanent_Marker({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-permanent-marker',
});

export const metadata: Metadata = {
  title: 'SmashRank Argentina - Torneos de Super Smash Bros Ultimate',
  description: 'La plataforma definitiva para torneos de Super Smash Bros Ultimate en Argentina',
  manifest: '/manifest.json',
  themeColor: '#FF4655',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SmashRank AR',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${bangers.variable} ${permanentMarker.variable}`}>
      <body>
        {/* Personajes flotantes de fondo */}
        <div className="character-background">
          <div className="floating-character">
            <svg viewBox="0 0 200 200" fill="currentColor">
              <text x="100" y="100" fontSize="120" textAnchor="middle" dominantBaseline="middle">🎮</text>
            </svg>
          </div>
          <div className="floating-character">
            <svg viewBox="0 0 200 200" fill="currentColor">
              <text x="100" y="100" fontSize="120" textAnchor="middle" dominantBaseline="middle">⚔️</text>
            </svg>
          </div>
          <div className="floating-character">
            <svg viewBox="0 0 200 200" fill="currentColor">
              <text x="100" y="100" fontSize="120" textAnchor="middle" dominantBaseline="middle">👊</text>
            </svg>
          </div>
          <div className="floating-character">
            <svg viewBox="0 0 200 200" fill="currentColor">
              <text x="100" y="100" fontSize="120" textAnchor="middle" dominantBaseline="middle">⭐</text>
            </svg>
          </div>
        </div>

        <Providers>
          <div className="min-h-screen flex flex-col relative z-10">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <footer className="bg-white/90 border-t-4 border-black py-8 mt-20">
              <div className="container mx-auto px-4 text-center">
                <p className="text-black font-bold">
                  © 2024 SmashRank Argentina. Hecho con 💪 para la comunidad argentina de Smash.
                </p>
              </div>
            </footer>
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'white',
                color: 'black',
                border: '4px solid black',
                boxShadow: '6px 6px 0px 0px rgba(0, 0, 0, 1)',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
