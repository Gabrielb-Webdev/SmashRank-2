import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { User, Mail, MapPin, Shield, Edit, Trophy, Target } from 'lucide-react';
import { prisma } from '@/lib/prisma';

async function getUserStats(userId: string) {
  try {
    const [user, tournamentsCount, matchesWon] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: {
          registrations: {
            include: {
              tournament: true
            }
          }
        }
      }),
      prisma.registration.count({
        where: { userId }
      }),
      prisma.match.count({
        where: {
          OR: [
            { player1Id: userId, winnerId: userId },
            { player2Id: userId, winnerId: userId }
          ]
        }
      })
    ]);

    // Calcular puntos según el sistema de ranking
    const points = (matchesWon * 100) + (tournamentsCount * 10);

    return {
      user,
      tournaments: tournamentsCount,
      wins: matchesWon,
      points
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      user: null,
      tournaments: 0,
      wins: 0,
      points: 0
    };
  }
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  const stats = await getUserStats(session.user.id);

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a0a 100%)'}}>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="card p-8 mb-6 animate-fade-in-up relative overflow-hidden">
            {/* Character decoration */}
            <div className="absolute top-4 right-4 text-6xl opacity-10">
              🎮
            </div>
            
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)', boxShadow: '0 0 30px rgba(220, 20, 60, 0.5)'}}>
                  <User className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white mb-2">{session.user.username}</h1>
                  {session.user.role === 'ADMIN' && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold" style={{background: 'rgba(220, 20, 60, 0.2)', border: '1px solid rgba(255, 215, 0, 0.5)', color: '#ffd700'}}>
                      <Shield className="w-4 h-4" />
                      Administrador
                    </span>
                  )}
                </div>
              </div>
              <button className="btn-secondary px-4 py-2">
                <Edit className="w-4 h-4 mr-2 inline" />
                Editar Perfil
              </button>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Email</p>
                  <p className="text-white font-semibold">{session.user.email}</p>
                </div>
              </div>
            </div>

            <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Provincia</p>
                  <p className="text-white font-semibold">{session.user.province || 'No especificada'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats - DATOS REALES */}
          <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6" style={{color: '#ffd700'}} />
              Estadísticas
            </h2>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg" style={{background: 'rgba(220, 20, 60, 0.1)', border: '1px solid rgba(220, 20, 60, 0.3)'}}>
                <div className="text-3xl font-black mb-1" style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                  {stats.tournaments}
                </div>
                <div className="text-sm text-slate-400 flex items-center justify-center gap-1">
                  <Target className="w-3 h-3" />
                  Torneos
                </div>
              </div>
              <div className="text-center p-4 rounded-lg" style={{background: 'rgba(220, 20, 60, 0.1)', border: '1px solid rgba(220, 20, 60, 0.3)'}}>
                <div className="text-3xl font-black mb-1" style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                  {stats.wins}
                </div>
                <div className="text-sm text-slate-400 flex items-center justify-center gap-1">
                  <Trophy className="w-3 h-3" />
                  Victorias
                </div>
              </div>
              <div className="text-center p-4 rounded-lg" style={{background: 'rgba(220, 20, 60, 0.1)', border: '1px solid rgba(220, 20, 60, 0.3)'}}>
                <div className="text-3xl font-black mb-1" style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                  {stats.points}
                </div>
                <div className="text-sm text-slate-400">Puntos</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
