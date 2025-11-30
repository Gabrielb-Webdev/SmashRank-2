import Link from 'next/link';
import { Trophy, Users, Calendar, Zap, Target, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 py-20 border-b-8 border-black">
        {/* Líneas de velocidad manga */}
        <div className="speed-lines">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="speed-line"
              style={{
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 400 + 200}px`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Contenido */}
        <div className="relative z-10 text-center max-w-6xl mx-auto">
          <div className="space-y-8">
            <div className="manga-impact">
              <h1 className="title-smash mb-4">
                SMASHRANK
              </h1>
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="h-1 w-32 bg-black"></div>
                <p className="text-3xl md:text-4xl font-black uppercase tracking-widest">
                  ARGENTINA
                </p>
                <div className="h-1 w-32 bg-black"></div>
              </div>
            </div>
            
            <div className="bg-white border-8 border-black p-8 max-w-3xl mx-auto" style={{ boxShadow: '12px 12px 0px 0px rgba(0, 0, 0, 1)' }}>
              <p className="text-xl md:text-2xl font-bold leading-relaxed">
                La plataforma definitiva para torneos de{' '}
                <span className="bg-black text-white px-2 py-1">Super Smash Bros Ultimate</span> en Argentina.
                <br />
                ¡Compite, mejora y conviértete en leyenda!
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
              <Link href="/tournaments" className="w-full sm:w-auto">
                <button className="btn-manga w-full sm:w-auto text-xl px-8 py-4">
                  <Trophy className="inline mr-2 w-6 h-6" />
                  VER TORNEOS
                </button>
              </Link>
              <Link href="/auth/signup" className="w-full sm:w-auto">
                <button className="btn-manga-secondary w-full sm:w-auto text-xl px-8 py-4">
                  <Zap className="inline mr-2 w-6 h-6" />
                  REGISTRARSE
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="title-manga text-center mb-16">
            ¿POR QUÉ SMASHRANK?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card-manga p-6">
              <div className="w-16 h-16 bg-black flex items-center justify-center mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-3">Torneos Profesionales</h3>
              <p className="text-gray-700 font-medium">
                Sistema completo de brackets con Single/Double Elimination, Round Robin y Swiss.
                Check-in automático y gestión en tiempo real.
              </p>
            </div>

            <div className="card-manga p-6">
              <div className="w-16 h-16 bg-black flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-3">Comunidad Argentina</h3>
              <p className="text-gray-700 font-medium">
                Conecta con jugadores de tu provincia. Torneos locales, regionales y nacionales.
                ¡La escena argentina unida!
              </p>
            </div>

            <div className="card-manga p-6">
              <div className="w-16 h-16 bg-black flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-3">Calendario Completo</h3>
              <p className="text-gray-700 font-medium">
                Nunca te pierdas un torneo. Sistema de inscripciones y recordatorios automáticos.
                Online y presenciales.
              </p>
            </div>

            <div className="card-manga p-6">
              <div className="w-16 h-16 bg-black flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-3">Rankings Oficiales</h3>
              <p className="text-gray-700 font-medium">
                Sistema de puntos por torneo. Rankings nacionales, provinciales y por personaje.
                ¡Escala posiciones!
              </p>
            </div>

            <div className="card-manga p-6">
              <div className="w-16 h-16 bg-black flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-3">Personajes y Skins</h3>
              <p className="text-gray-700 font-medium">
                Base de datos completa con todos los personajes y sus 8 cromas alternativos.
                Muestra tu estilo único.
              </p>
            </div>

            <div className="card-manga p-6">
              <div className="w-16 h-16 bg-black flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-3">Gratis y Open Source</h3>
              <p className="text-gray-700 font-medium">
                Plataforma gratuita hecha por la comunidad para la comunidad.
                Sin publicidad intrusiva.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative bg-white border-t-8 border-b-8 border-black">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="manga-panel p-16">
            <h2 className="title-manga mb-8">
              ¿LISTO PARA EL DESAFÍO?
            </h2>
            <p className="text-2xl font-bold mb-8 max-w-2xl mx-auto leading-relaxed">
              Únete a la comunidad más grande de Smash Bros en Argentina.
              <br />
              Participa en torneos, mejora tus habilidades y haz nuevos amigos.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/auth/signup">
                <button className="btn-manga text-xl px-8 py-4 w-full sm:w-auto">
                  CREAR CUENTA GRATIS
                </button>
              </Link>
              <Link href="/tournaments">
                <button className="btn-manga-secondary text-xl px-8 py-4 w-full sm:w-auto">
                  EXPLORAR TORNEOS
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="border-4 border-black p-8" style={{ boxShadow: '6px 6px 0px 0px rgba(0, 0, 0, 1)' }}>
              <div className="text-6xl md:text-7xl font-black mb-2">89</div>
              <div className="text-lg font-bold uppercase tracking-wide">Personajes</div>
            </div>
            <div className="border-4 border-black p-8" style={{ boxShadow: '6px 6px 0px 0px rgba(0, 0, 0, 1)' }}>
              <div className="text-6xl md:text-7xl font-black mb-2">24</div>
              <div className="text-lg font-bold uppercase tracking-wide">Provincias</div>
            </div>
            <div className="border-4 border-black p-8" style={{ boxShadow: '6px 6px 0px 0px rgba(0, 0, 0, 1)' }}>
              <div className="text-6xl md:text-7xl font-black mb-2">∞</div>
              <div className="text-lg font-bold uppercase tracking-wide">Torneos</div>
            </div>
            <div className="border-4 border-black p-8" style={{ boxShadow: '6px 6px 0px 0px rgba(0, 0, 0, 1)' }}>
              <div className="text-6xl md:text-7xl font-black mb-2">1</div>
              <div className="text-lg font-bold uppercase tracking-wide">Comunidad</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
