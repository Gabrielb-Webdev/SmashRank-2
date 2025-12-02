import type { Metadata } from 'next';
import { Poppins, Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Navbar from '@/components/layout/Navbar';
import { Toaster } from 'react-hot-toast';
import SystemHealthCheck from '@/components/admin/SystemHealthCheck';

const poppins = Poppins({ 
  weight: ['400', '600', '700', '900'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SmashRank Argentina | Torneos de Super Smash Bros Ultimate 🎮',
  description: 'La plataforma definitiva para torneos competitivos de Super Smash Bros Ultimate en Argentina. Brackets en tiempo real, rankings provinciales y nacionales, sistema de puntos y más. Únete a la comunidad Smash más grande del país.',
  keywords: ['Super Smash Bros', 'Smash Ultimate', 'torneos', 'Argentina', 'brackets', 'rankings', 'competitivo', 'esports', 'Nintendo', 'gaming'],
  manifest: '/manifest.json',
  themeColor: '#dc143c',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  verification: {
    other: {
      'cache-version': '1.1.0',
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SmashRank AR',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
  openGraph: {
    title: 'SmashRank Argentina - Torneos de Smash Bros Ultimate',
    description: 'Plataforma de torneos competitivos de Super Smash Bros Ultimate en Argentina',
    type: 'website',
    locale: 'es_AR',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${poppins.variable} ${inter.variable}`}>
      <body className="bg-slate-900 text-white antialiased">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            
            {/* Footer Profesional */}
            <footer className="border-t mt-20" style={{background: 'rgba(10, 10, 10, 0.95)', borderColor: 'rgba(220, 20, 60, 0.3)'}}>
              <div className="container py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                  
                  {/* Columna 1 - Logo */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)', boxShadow: '0 4px 15px rgba(220, 20, 60, 0.4)'}}>
                        <span className="text-white font-bold text-xl">🎮</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xl font-black text-white leading-none">SmashRank</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider leading-none" style={{color: '#ffd700'}}>Ultimate</span>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm">
                      La plataforma definitiva para torneos de Super Smash Bros Ultimate en Argentina.
                    </p>
                    <div className="mt-4 flex gap-2 text-2xl">
                      <span>🦊</span>
                      <span>⚡</span>
                      <span>🔥</span>
                      <span>⭐</span>
                    </div>
                  </div>
                  
                  {/* Columna 2 */}
                  <div>
                    <h4 className="text-white font-bold mb-4">Plataforma</h4>
                    <ul className="space-y-2 text-sm">
                      <li><a href="/tournaments" className="text-slate-400 hover:text-white transition-colors">Torneos</a></li>
                      <li><a href="/rankings" className="text-slate-400 hover:text-white transition-colors">Rankings</a></li>
                      <li><a href="/jugadores" className="text-slate-400 hover:text-white transition-colors">Jugadores</a></li>
                    </ul>
                  </div>
                  
                  {/* Columna 3 */}
                  <div>
                    <h4 className="text-white font-bold mb-4">Recursos</h4>
                    <ul className="space-y-2 text-sm">
                      <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Documentación</a></li>
                      <li><a href="https://github.com" className="text-slate-400 hover:text-white transition-colors">GitHub</a></li>
                      <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Contacto</a></li>
                    </ul>
                  </div>
                  
                  {/* Columna 4 */}
                  <div>
                    <h4 className="text-white font-bold mb-4">Síguenos</h4>
                    <ul className="space-y-2 text-sm">
                      <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Discord</a></li>
                      <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Twitter</a></li>
                      <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Instagram</a></li>
                    </ul>
                  </div>
                </div>
                
                {/* Bottom bar */}
                <div className="pt-8 text-center text-slate-400 text-sm" style={{borderTop: '1px solid rgba(220, 20, 60, 0.2)'}}>
                  <p className="mb-2">© 2024 SmashRank Argentina • Hecho con ❤️ para la comunidad argentina de Smash</p>
                  <p className="text-xs" style={{color: '#c79da0'}}>
                    Super Smash Bros™ Ultimate es una marca registrada de Nintendo. Esta plataforma no está afiliada con Nintendo.
                  </p>
                </div>
              </div>
            </footer>
          </div>
          
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'toast',
              success: {
                className: 'toast-success',
              },
              error: {
                className: 'toast-error',
              },
            }}
          />
          <SystemHealthCheck />
        </Providers>
      </body>
    </html>
  );
}
