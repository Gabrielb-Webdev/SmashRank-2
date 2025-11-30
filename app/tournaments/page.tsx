'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Trophy, Calendar, Users, Plus, Filter, Wifi, Clock, Gamepad2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { TOURNAMENT_FORMATS, TOURNAMENT_STATUSES } from '@/lib/constants';

export default function TournamentsPage() {
  const { data: session } = useSession();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    format: 'all',
  });

  useEffect(() => {
    fetchTournaments();
  }, [filters]);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.format !== 'all') params.append('format', filters.format);

      const response = await fetch(`/api/tournaments?${params}`);
      const data = await response.json();
      setTournaments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar torneos:', error);
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-slate-600/50 border-slate-600',
      REGISTRATION_OPEN: 'bg-green-600/20 border-green-500 text-green-400',
      REGISTRATION_CLOSED: 'bg-amber-600/20 border-amber-500 text-amber-400',
      CHECKIN_OPEN: 'bg-blue-600/20 border-blue-500 text-blue-400',
      IN_PROGRESS: 'bg-red-600/20 border-red-500 text-red-400',
      COMPLETED: 'bg-slate-600/20 border-slate-600 text-slate-400',
      CANCELLED: 'bg-red-900/20 border-red-800 text-red-500',
    };
    return colors[status] || 'bg-slate-600/50 border-slate-600';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      DRAFT: 'Borrador',
      REGISTRATION_OPEN: '🟢 Inscripciones Abiertas',
      REGISTRATION_CLOSED: 'Inscripciones Cerradas',
      CHECKIN_OPEN: 'Check-in Abierto',
      IN_PROGRESS: '🔴 En Vivo',
      COMPLETED: 'Finalizado',
      CANCELLED: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getFormatLabel = (format: string) => {
    const labels: Record<string, string> = {
      SINGLE_ELIMINATION: 'Eliminación Simple',
      DOUBLE_ELIMINATION: 'Doble Eliminación',
      ROUND_ROBIN: 'Round Robin',
      SWISS: 'Sistema Suizo',
    };
    return labels[format] || format;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-5xl font-black text-white mb-2">Torneos</h1>
            <p className="text-xl text-slate-400">Compite en los mejores torneos online de Argentina</p>
          </div>
          
          {session?.user.role === 'ADMIN' && (
            <Link href="/tournaments/create">
              <button className="btn-primary text-lg px-6 py-3">
                <Plus className="w-5 h-5 mr-2 inline" />
                Crear Torneo
              </button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="card mb-8 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold text-white">Filtros</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Estado del Torneo</label>
              <select
                className="input"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="all">Todos los Estados</option>
                {TOURNAMENT_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Formato de Competencia</label>
              <select
                className="input"
                value={filters.format}
                onChange={(e) => setFilters({ ...filters, format: e.target.value })}
              >
                <option value="all">Todos los Formatos</option>
                {TOURNAMENT_FORMATS.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tournaments Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="spinner"></div>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="card p-12 text-center">
            <Trophy className="w-20 h-20 text-slate-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">No hay torneos disponibles</h3>
            <p className="text-slate-400">Pronto habrá nuevos torneos. ¡Mantente atento!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament, index) => (
              <div 
                key={tournament.id} 
                className="tournament-card group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Header con badge de estado */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <span className={`badge text-xs font-bold uppercase tracking-wide border ${getStatusColor(tournament.status)}`}>
                      {getStatusLabel(tournament.status)}
                    </span>
                    <Trophy className="w-6 h-6 text-red-500" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                    {tournament.name}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                    {tournament.description || 'Torneo de Super Smash Bros Ultimate'}
                  </p>
                </div>

                {/* Info Grid */}
                <div className="px-6 pb-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>{formatDate(tournament.startDate)}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="font-semibold text-green-400">Torneo Online</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <Gamepad2 className="w-4 h-4 text-slate-500" />
                    <span>{getFormatLabel(tournament.format)}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span className="text-white font-semibold">
                      {tournament.currentParticipants || 0}
                      {tournament.maxParticipants && (
                        <span className="text-slate-400"> / {tournament.maxParticipants}</span>
                      )}
                    </span>
                    <span className="text-slate-500">participantes</span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="p-6 pt-4 border-t border-slate-700">
                  <Link href={`/tournaments/${tournament.id}`} className="block">
                    <button className="w-full btn-secondary py-3 font-semibold group-hover:border-red-500 group-hover:text-red-400 transition-all">
                      Ver Detalles
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
