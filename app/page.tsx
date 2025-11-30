import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users, Calendar, Zap, Target, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 py-20">
        {/* Fondo animado */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 animate-pulse-slow" />
          <div className="speed-lines">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="speed-line"
                style={{
                  top: `${Math.random() * 100}%`,
                  width: `${Math.random() * 300 + 100}px`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className="relative z-10 text-center max-w-6xl mx-auto">
          <div className="space-y-8 fade-in-up">
            <h1 className="title-smash">
              SMASHRANK
            </h1>
            <p className="text-2xl md:text-3xl text-white font-bold uppercase tracking-widest">
              Argentina
            </p>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              La plataforma definitiva para torneos de{' '}
              <span className="text-primary font-bold">Super Smash Bros Ultimate</span> en Argentina.
              ¡Compite, mejora y conviértete en leyenda!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link href="/tournaments">
                <Button size="lg" className="w-full sm:w-auto">
                  <Trophy className="mr-2 w-5 h-5" />
                  Ver Torneos
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  <Zap className="mr-2 w-5 h-5" />
                  Registrarse Ahora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <h2 className="title-manga text-center mb-16">
            ¿Por qué SmashRank?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="fade-in-up">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-600 rounded-lg flex items-center justify-center mb-4 shadow-neon">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Torneos Profesionales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Sistema completo de brackets con Single/Double Elimination, Round Robin y Swiss.
                  Check-in automático y gestión en tiempo real.
                </p>
              </CardContent>
            </Card>

            <Card className="fade-in-up" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary-600 rounded-lg flex items-center justify-center mb-4 shadow-neon-blue">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Comunidad Argentina</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Conecta con jugadores de tu provincia. Torneos locales, regionales y nacionales.
                  ¡La escena argentina unida!
                </p>
              </CardContent>
            </Card>

            <Card className="fade-in-up" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-manga-yellow to-manga-orange rounded-lg flex items-center justify-center mb-4 shadow-manga">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Calendario Completo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Nunca te pierdas un torneo. Sistema de inscripciones y recordatorios automáticos.
                  Online y presenciales.
                </p>
              </CardContent>
            </Card>

            <Card className="fade-in-up" style={{ animationDelay: '0.3s' }}>
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-manga-pink to-manga-purple rounded-lg flex items-center justify-center mb-4 shadow-manga">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Rankings Oficiales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Sistema de puntos por torneo. Rankings nacionales, provinciales y por personaje.
                  ¡Escala posiciones!
                </p>
              </CardContent>
            </Card>

            <Card className="fade-in-up" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mb-4 shadow-neon">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Personajes y Skins</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Base de datos completa con todos los personajes y sus 8 cromas alternativos.
                  Muestra tu estilo único.
                </p>
              </CardContent>
            </Card>

            <Card className="fade-in-up" style={{ animationDelay: '0.5s' }}>
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-manga-orange to-primary rounded-lg flex items-center justify-center mb-4 shadow-manga">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Gratis y Open Source</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Plataforma gratuita hecha por la comunidad para la comunidad.
                  Sin publicidad intrusiva.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto max-w-4xl text-center">
          <Card className="bg-gradient-to-br from-primary/20 to-secondary/20 border-4">
            <CardContent className="py-16">
              <h2 className="title-manga mb-6">
                ¿Listo para el Desafío?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Únete a la comunidad más grande de Smash Bros en Argentina.
                Participa en torneos, mejora tus habilidades y haz nuevos amigos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Crear Cuenta Gratis
                  </Button>
                </Link>
                <Link href="/tournaments">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Explorar Torneos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-black/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="fade-in-up">
              <div className="text-5xl md:text-6xl font-bold text-primary mb-2">89</div>
              <div className="text-gray-400 uppercase tracking-wide">Personajes</div>
            </div>
            <div className="fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="text-5xl md:text-6xl font-bold text-secondary mb-2">24</div>
              <div className="text-gray-400 uppercase tracking-wide">Provincias</div>
            </div>
            <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="text-5xl md:text-6xl font-bold text-manga-yellow mb-2">∞</div>
              <div className="text-gray-400 uppercase tracking-wide">Torneos</div>
            </div>
            <div className="fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="text-5xl md:text-6xl font-bold text-manga-pink mb-2">1</div>
              <div className="text-gray-400 uppercase tracking-wide">Comunidad</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
