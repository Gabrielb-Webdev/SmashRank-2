'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Calendar, MapPin, Users, Plus, Filter } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { PROVINCES, TOURNAMENT_FORMATS, TOURNAMENT_STATUSES } from '@/lib/constants';

export default function TournamentsPage() {
  const { data: session } = useSession();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    province: 'all',
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
      if (filters.province !== 'all') params.append('province', filters.province);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.format !== 'all') params.append('format', filters.format);

      const response = await fetch(`/api/tournaments?${params}`);
      const data = await response.json();
      setTournaments(data);
    } catch (error) {
      console.error('Error al cargar torneos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-500',
      REGISTRATION_OPEN: 'bg-green-500',
      REGISTRATION_CLOSED: 'bg-yellow-500',
      CHECKIN_OPEN: 'bg-blue-500',
      IN_PROGRESS: 'bg-purple-500',
      COMPLETED: 'bg-gray-600',
      CANCELLED: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusLabel = (status: string) => {
    const label = TOURNAMENT_STATUSES.find(s => s.value === status);
    return label?.label || status;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
        <div>
          <h1 className="title-manga text-4xl mb-2">Torneos</h1>
          <p className="text-gray-400">Encuentra tu próximo desafío</p>
        </div>
        
        {session?.user.role === 'ADMIN' && (
          <Link href="/tournaments/create">
            <Button size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Crear Torneo
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-white mb-2 uppercase">
                Provincia
              </label>
              <select
                className="w-full h-11 rounded-lg border-2 border-primary bg-gray-800/50 px-4 py-2 text-sm text-white"
                value={filters.province}
                onChange={(e) => setFilters({ ...filters, province: e.target.value })}
              >
                <option value="all">Todas las Provincias</option>
                {PROVINCES.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2 uppercase">
                Estado
              </label>
              <select
                className="w-full h-11 rounded-lg border-2 border-primary bg-gray-800/50 px-4 py-2 text-sm text-white"
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
              <label className="block text-sm font-bold text-white mb-2 uppercase">
                Formato
              </label>
              <select
                className="w-full h-11 rounded-lg border-2 border-primary bg-gray-800/50 px-4 py-2 text-sm text-white"
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
        </CardContent>
      </Card>

      {/* Tournaments Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="loader" />
        </div>
      ) : tournaments.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400">No se encontraron torneos</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament, index) => (
            <Card key={tournament.id} className="fade-in-up hover:scale-105" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getStatusColor(tournament.status)}`}>
                    {getStatusLabel(tournament.status)}
                  </div>
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{tournament.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {tournament.description || 'Torneo de Super Smash Bros Ultimate'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar className="w-4 h-4" />
                  {formatDate(tournament.startDate)}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <MapPin className="w-4 h-4" />
                  {tournament.isOnline ? 'Online' : tournament.province}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Users className="w-4 h-4" />
                  {tournament.currentParticipants}
                  {tournament.maxParticipants && ` / ${tournament.maxParticipants}`} participantes
                </div>
                
                <Link href={`/tournaments/${tournament.slug}`}>
                  <Button variant="secondary" className="w-full mt-4">
                    Ver Detalles
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
