import type { Metadata } from 'next';
import { Poppins, Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Navbar from '@/components/layout/Navbar';
import { Toaster } from 'react-hot-toast';

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
  title: 'SmashRank Argentina - Torneos de Super Smash Bros Ultimate',
  description: 'La plataforma definitiva para torneos de Super Smash Bros Ultimate en Argentina. Brackets en tiempo real, rankings y más.',
  manifest: '/manifest.json',
  themeColor: '#0f172a',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SmashRank AR',
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
            <footer className="bg-slate-900 border-t border-slate-800 mt-20">
              <div className="container py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                  
                  {/* Columna 1 - Logo */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">SR</span>
                      </div>
                      <span className="text-xl font-black text-white">SmashRank</span>
                    </div>
                    <p className="text-slate-400 text-sm">
                      La plataforma definitiva para torneos de Super Smash Bros Ultimate en Argentina.
                    </p>
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
                <div className="pt-8 border-t border-slate-800 text-center text-slate-400 text-sm">
                  <p>© 2024 SmashRank Argentina • Hecho con ❤️ para la comunidad argentina de Smash</p>
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
        </Providers>
      </body>
    </html>
  );
}
