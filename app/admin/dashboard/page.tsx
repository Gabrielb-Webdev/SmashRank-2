import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Trophy, Users, Calendar, Settings, BarChart3, Shield, Gamepad2 } from 'lucide-react';
import { prisma } from '@/lib/prisma';

async function getAdminStats() {
  try {
    const [
      tournamentsCount,
      activeTournamentsCount,
      usersCount,
      matchesCount,
      charactersCount,
      recentActivity
    ] = await Promise.all([
      prisma.tournament.count(),
      prisma.tournament.count({
        where: {
          status: {
            in: ['REGISTRATION_OPEN', 'CHECKIN_OPEN', 'IN_PROGRESS']
          }
        }
      }),
      prisma.user.count(),
      prisma.match.count(),
      prisma.character.count(),
      prisma.tournament.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { registrations: true }
          }
        }
      })
    ]);

    return {
      tournaments: tournamentsCount,
      activeTournaments: activeTournamentsCount,
      users: usersCount,
      matches: matchesCount,
      characters: charactersCount,
      recentActivity
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      tournaments: 0,
      activeTournaments: 0,
      users: 0,
      matches: 0,
      characters: 0,
      recentActivity: []
    };
  }
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const stats = await getAdminStats();

  const statsCards = [
    { label: 'Torneos Activos', value: stats.activeTournaments, icon: Trophy, color: 'from-red-500 to-orange-500' },
    { label: 'Usuarios Totales', value: stats.users, icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: 'Partidas Jugadas', value: stats.matches, icon: BarChart3, color: 'from-purple-500 to-pink-500' },
    { label: 'Personajes', value: stats.characters, icon: Gamepad2, color: 'from-green-500 to-emerald-500' },
  ];

  // Acciones rápidas del panel de administración
  const quickActions = [
    { label: 'Crear Torneo', href: '/tournaments/create', icon: Trophy, description: 'Organiza un nuevo torneo' },
    { label: 'Ver Torneos', href: '/tournaments', icon: Calendar, description: 'Gestionar torneos existentes' },
    { label: 'Gestionar Usuarios', href: '/admin/users', icon: Users, description: 'Administrar usuarios del sistema' },
    { label: 'Configurar Stages', href: '/admin/configure-stages', icon: Settings, description: 'Configurar stages para torneos' },
    { label: 'Rankings', href: '/rankings', icon: BarChart3, description: 'Ver clasificaciones' },
    { label: 'Diagnóstico Torneos', href: '/admin/tournament-diagnostics', icon: Shield, description: '🔧 Detectar y solucionar problemas' },
  ];



  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a0a 100%)'}}>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)', boxShadow: '0 4px 20px rgba(220, 20, 60, 0.5)'}}>
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">Panel de Administración</h1>
              <p className="text-slate-400">Bienvenido, {session.user.username}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid - DATOS REALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statsCards.map((stat, index) => (
            <div
              key={stat.label}
              className="card p-6 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={action.href}
                href={action.href}
                className="card p-6 group hover:border-red-500/50 transition-all animate-fade-in-up"
                style={{ animationDelay: `${(index + 4) * 0.1}s` }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-gradient-to-br group-hover:from-red-500 group-hover:to-orange-500 transition-all">
                    <action.icon className="w-8 h-8 text-slate-400 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                    {action.label}
                  </h3>
                  <p className="text-sm text-slate-400">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>



        {/* Recent Activity - DATOS REALES */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Torneos Recientes</h2>
          {stats.recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400">No hay torneos creados aún</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentActivity.map((tournament) => (
                <div key={tournament.id} className="flex items-center gap-4 p-4 rounded-lg" style={{background: 'rgba(26, 10, 10, 0.6)', border: '1px solid rgba(220, 20, 60, 0.3)'}}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background: 'rgba(220, 20, 60, 0.2)'}}>
                    <Trophy className="w-5 h-5" style={{color: '#ffd700'}} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">{tournament.name}</p>
                    <p className="text-sm text-slate-400">
                      {tournament._count.registrations} participantes • {tournament.status}
                    </p>
                  </div>
                  <Link href={`/tournaments/${tournament.id}`} className="text-xs px-3 py-1 rounded-lg" style={{background: 'rgba(220, 20, 60, 0.2)', color: '#ffd700', border: '1px solid rgba(220, 20, 60, 0.3)'}}>
                    Ver
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
