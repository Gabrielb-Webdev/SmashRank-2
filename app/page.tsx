import Link from 'next/link';
import Image from 'next/image';
import { Trophy, Users, Calendar, Target, Shield, Zap, MapPin, Award, TrendingUp, Gamepad2 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      
      {/* ============================================
          🎯 HERO SECTION
          ============================================ */}
      <section className="hero relative">
        {/* Background Characters */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Banjo Kazooie - Left side */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/3 h-auto opacity-20 hidden lg:block">
            <Image 
              src="/banjo-kazooie.png" 
              alt="Banjo Kazooie"
              width={500}
              height={500}
              className="object-contain animate-fade-in-up"
              priority
            />
          </div>
          
          {/* Terry Bogard - Right side */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-auto opacity-20 hidden lg:block">
            <Image 
              src="/terry-bogard.png" 
              alt="Terry Bogard"
              width={500}
              height={500}
              className="object-contain animate-fade-in-up animate-delay-200"
              priority
            />
          </div>
        </div>

        <div className="container relative z-10 py-20 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Columna Izquierda - Texto */}
            <div className="space-y-8 animate-fade-in-up">
              <div>
                <h1 className="hero-title">
                  COMPITE EN LOS <span style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 20px rgba(220, 20, 60, 0.6))'}}>MEJORES TORNEOS</span> DE SMASH
                </h1>
                <p className="hero-subtitle">
                  La plataforma definitiva para torneos de Super Smash Bros Ultimate en Argentina. 
                  Profesional, rápida y hecha para competidores.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/tournaments">
                  <button className="btn-primary text-lg px-8 py-4 w-full sm:w-auto">
                    <Gamepad2 className="inline mr-2 w-5 h-5" />
                    Explorar Torneos
                  </button>
                </Link>
                <Link href="/auth/signup">
                  <button className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto">
                    <Zap className="inline mr-2 w-5 h-5" />
                    Crear Cuenta Gratis
                  </button>
                </Link>
              </div>

              {/* Mini Stats */}
              <div className="flex gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-white">89</div>
                  <div className="text-sm text-slate-400">Personajes</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">24</div>
                  <div className="text-sm text-slate-400">Provincias</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">∞</div>
                  <div className="text-sm text-slate-400">Torneos</div>
                </div>
              </div>
            </div>
            
            {/* Columna Derecha - Visual */}
            <div className="relative animate-scale-in animate-delay-200 hidden lg:block">
              <div className="relative glass-container rounded-2xl p-8">
                {/* Mockup de bracket */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-white mb-6">
                    <span className="text-xl font-bold">🏆 Grand Finals</span>
                    <span className="badge-live">EN VIVO</span>
                  </div>
                  
                  <div className="bracket-match">
                    <div className="bracket-player bracket-player-winner">
                      <span className="font-semibold text-white">🔥 Player1</span>
                      <span className="text-green-400 font-bold">3</span>
                    </div>
                    <div className="bracket-player bracket-player-loser">
                      <span className="font-semibold text-slate-400">Player2</span>
                      <span className="text-slate-500">1</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 mt-6">
                    <div className="flex-1 text-center p-3 bg-slate-900/50 rounded-lg">
                      <div className="text-2xl font-bold text-white">156</div>
                      <div className="text-xs text-slate-400">Jugadores</div>
                    </div>
                    <div className="flex-1 text-center p-3 bg-slate-900/50 rounded-lg">
                      <div className="text-2xl font-bold text-white">12</div>
                      <div className="text-xs text-slate-400">Comunidades</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decoración */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-red-500 to-orange-500 rounded-full blur-3xl opacity-20"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-3xl opacity-20"></div>
            </div>
          </div>
        </div>
        
        {/* Decorative grid pattern */}
        <div className="absolute inset-0 dot-pattern opacity-10"></div>
      </section>

      {/* ============================================
          📊 STATS SECTION
          ============================================ */}
      <section className="py-16 bg-slate-800/50">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="stat-card animate-fade-in-up">
              <div className="stat-number">89</div>
              <div className="stat-label">Torneos Realizados</div>
            </div>
            <div className="stat-card animate-fade-in-up animate-delay-100">
              <div className="stat-number">24</div>
              <div className="stat-label">Provincias Activas</div>
            </div>
            <div className="stat-card animate-fade-in-up animate-delay-200">
              <div className="stat-number">156</div>
              <div className="stat-label">Jugadores Registrados</div>
            </div>
            <div className="stat-card animate-fade-in-up animate-delay-300">
              <div className="stat-number">12</div>
              <div className="stat-label">Comunidades Activas</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          ⚡ FEATURES SECTION
          ============================================ */}
      <section className="section bg-slate-900">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="section-title">¿Por qué SmashRank?</h2>
            <p className="section-subtitle">
              La plataforma más completa para la escena competitiva argentina
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="feature-card group">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Torneos Profesionales</h3>
              <p className="text-slate-400">
                Sistema completo con Single/Double Elimination, Round Robin y Swiss. 
                Brackets en tiempo real.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card group">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Comunidad Argentina</h3>
              <p className="text-slate-400">
                Conecta con jugadores de tu provincia. Rankings locales, regionales y nacionales.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card group">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Gestión Completa</h3>
              <p className="text-slate-400">
                Check-in automático, notificaciones, gestión de participantes y mucho más.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="feature-card group">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Base de Personajes Oficial</h3>
              <p className="text-slate-400">
                Todos los personajes y skins de Ultimate. Muestra tu main en tu perfil y brackets.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="feature-card group">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Rankings y Stats</h3>
              <p className="text-slate-400">
                Power Rankings provinciales y nacionales. Estadísticas detalladas de tu rendimiento.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="feature-card group">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Gratis y Open Source</h3>
              <p className="text-slate-400">
                Plataforma completamente gratuita para toda la comunidad. Transparente y confiable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          🏆 CTA SECTION
          ============================================ */}
      <section className="section gradient-primary relative overflow-hidden">
        <div className="container relative z-10 text-center">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
            ¿Listo para el Desafío?
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Únete a la comunidad competitiva de Smash Bros más grande de Argentina.
            <br />
            Participa en torneos, mejora tu ranking y demuestra quién es el mejor.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <button className="px-12 py-4 text-xl font-bold bg-white text-red-600 rounded-lg hover:bg-slate-100 hover:scale-105 transition-all duration-300 shadow-2xl">
                CREAR CUENTA GRATIS
              </button>
            </Link>
          </div>
          
          <Link href="/tournaments">
            <button className="mt-6 text-white/80 hover:text-white underline transition-colors">
              o explorar torneos sin registrarme
            </button>
          </Link>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 text-9xl">🎮</div>
          <div className="absolute bottom-10 right-10 text-9xl">🏆</div>
          <div className="absolute top-1/2 left-1/4 text-7xl">⚔️</div>
          <div className="absolute top-1/3 right-1/4 text-7xl">⭐</div>
        </div>
      </section>

    </div>
  );
}
