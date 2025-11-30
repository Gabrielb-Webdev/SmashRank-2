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
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <footer className="bg-gray-900/80 border-t-4 border-primary py-8 mt-20">
              <div className="container mx-auto px-4 text-center">
                <p className="text-gray-400">
                  © 2024 SmashRank Argentina. Hecho con 💪 para la comunidad argentina de Smash.
                </p>
              </div>
            </footer>
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1F2937',
                color: '#fff',
                border: '2px solid #FF4655',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
