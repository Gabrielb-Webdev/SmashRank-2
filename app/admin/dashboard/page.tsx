'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Users, Calendar, Settings, BarChart3, Shield } from 'lucide-react';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user.role !== 'ADMIN') {
      router.push('/');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (session?.user.role !== 'ADMIN') {
    return null;
  }

  const stats = [
    { label: 'Torneos Activos', value: '2', icon: Trophy, color: 'from-red-500 to-orange-500' },
    { label: 'Usuarios Totales', value: '5', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: 'Partidas Jugadas', value: '0', icon: BarChart3, color: 'from-purple-500 to-pink-500' },
    { label: 'Personajes', value: '5', icon: Shield, color: 'from-green-500 to-emerald-500' },
  ];

  const quickActions = [
    { label: 'Crear Torneo', href: '/tournaments/create', icon: Trophy, description: 'Organiza un nuevo torneo' },
    { label: 'Ver Torneos', href: '/tournaments', icon: Calendar, description: 'Gestionar torneos existentes' },
    { label: 'Rankings', href: '/rankings', icon: BarChart3, description: 'Ver clasificaciones' },
    { label: 'Configuración', href: '/admin/settings', icon: Settings, description: 'Ajustes del sistema' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">Panel de Administración</h1>
              <p className="text-slate-400">Bienvenido, {session.user.username}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* Recent Activity */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Actividad Reciente</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-green-600/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">Base de datos inicializada</p>
                <p className="text-sm text-slate-400">5 usuarios y 2 torneos creados</p>
              </div>
              <span className="text-xs text-slate-500">Hoy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
