'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function TournamentDiagnosticsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session) return;
    
    if (session.user.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    loadTournaments();
  }, [session, router]);

  const loadTournaments = async () => {
    try {
      const response = await fetch('/api/tournaments');
      const data = await response.json();
      const tournamentsData = Array.isArray(data) ? data : [];
      setTournaments(tournamentsData);
    } catch (error) {
      console.error('Error loading tournaments:', error);
      toast.error('Error al cargar torneos');
    }
  };

  const diagnoseTournament = async (tournamentId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}`);
      const data = await response.json();
      const tournament = data.tournament || data;

      // Diagnóstico completo
      const diagnosis = {
        id: tournament.id,
        name: tournament.name,
        status: tournament.status,
        registrations: tournament.registrations || [],
        registrationCount: tournament.registrations?.length || 0,
        maxParticipants: tournament.maxParticipants,
        startDate: tournament.startDate,
        registrationStart: tournament.registrationStart,
        registrationEnd: tournament.registrationEnd,
        hasBracket: false,
        issues: [] as string[],
      };

      // Verificar bracket
      try {
        const bracketResponse = await fetch(`/api/tournaments/${tournamentId}/bracket`);
        diagnosis.hasBracket = bracketResponse.ok;
      } catch (err) {
        diagnosis.hasBracket = false;
      }

      // Detectar problemas
      if (diagnosis.status !== 'REGISTRATION_OPEN') {
        diagnosis.issues.push(`❌ Status es "${diagnosis.status}" (debería ser "REGISTRATION_OPEN")`);
      }

      if (diagnosis.registrationCount === 0) {
        diagnosis.issues.push('❌ No hay participantes inscritos');
      }

      const now = new Date();
      if (diagnosis.registrationEnd && new Date(diagnosis.registrationEnd) < now) {
        diagnosis.issues.push('⚠️ Las inscripciones ya cerraron por fecha');
      }

      if (diagnosis.registrationCount >= diagnosis.maxParticipants) {
        diagnosis.issues.push('⚠️ Torneo lleno (max participantes alcanzado)');
      }

      if (!diagnosis.hasBracket && diagnosis.registrationCount > 0) {
        diagnosis.issues.push('⚠️ Hay participantes pero no se ha generado el bracket');
      }

      if (diagnosis.issues.length === 0) {
        diagnosis.issues.push('✅ Todo parece estar en orden');
      }

      setDiagnostics(diagnosis);
      setSelectedTournament(tournament);
    } catch (error) {
      console.error('Error diagnosing tournament:', error);
      toast.error('Error al diagnosticar torneo');
    } finally {
      setLoading(false);
    }
  };

  const fixTournamentStatus = async (tournamentId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/fix-tournament-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('✅ Status del torneo actualizado a REGISTRATION_OPEN');
        diagnoseTournament(tournamentId);
      } else {
        toast.error(data.error || 'Error al actualizar');
      }
    } catch (error) {
      toast.error('Error al actualizar status');
    } finally {
      setLoading(false);
    }
  };

  const extendRegistration = async (tournamentId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/extend-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('✅ Inscripciones extendidas 7 días');
        diagnoseTournament(tournamentId);
      } else {
        toast.error(data.error || 'Error al extender');
      }
    } catch (error) {
      toast.error('Error al extender inscripciones');
    } finally {
      setLoading(false);
    }
  };

  if (!session || session.user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-800 rounded-lg p-8 shadow-2xl border border-purple-500/20 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">🔧 Diagnóstico de Torneos</h1>
          <p className="text-slate-400 mb-6">
            Detecta y soluciona problemas con inscripciones y configuración
          </p>

          {/* Lista de Torneos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {tournaments.map((tournament) => (
              <div
                key={tournament.id}
                className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 hover:border-purple-500/50 transition-all cursor-pointer"
                onClick={() => diagnoseTournament(tournament.id)}
              >
                <h3 className="text-lg font-bold text-white mb-2">{tournament.name}</h3>
                <div className="text-sm text-slate-400 space-y-1">
                  <p>• ID: <code className="text-purple-400">{tournament.id}</code></p>
                  <p>• Status: <span className="text-yellow-400">{tournament.status}</span></p>
                  <p>• Participantes: <span className="text-green-400">{tournament.currentParticipants || 0}</span></p>
                </div>
              </div>
            ))}
          </div>

          {/* Diagnóstico Detallado */}
          {diagnostics && (
            <div className="bg-slate-900 rounded-lg p-6 border border-purple-500/30">
              <h2 className="text-2xl font-bold text-white mb-4">
                📊 Diagnóstico: {diagnostics.name}
              </h2>

              {/* Problemas Detectados */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-bold text-red-400 mb-3">Problemas Detectados:</h3>
                <div className="space-y-2">
                  {diagnostics.issues.map((issue: string, index: number) => (
                    <p key={index} className="text-white">{issue}</p>
                  ))}
                </div>
              </div>

              {/* Información del Torneo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-slate-400 mb-2">Estado</h4>
                  <p className="text-xl font-bold text-white">{diagnostics.status}</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-slate-400 mb-2">Participantes</h4>
                  <p className="text-xl font-bold text-white">
                    {diagnostics.registrationCount} / {diagnostics.maxParticipants || '∞'}
                  </p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-slate-400 mb-2">Bracket Generado</h4>
                  <p className="text-xl font-bold text-white">
                    {diagnostics.hasBracket ? '✅ Sí' : '❌ No'}
                  </p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-slate-400 mb-2">Fin Inscripciones</h4>
                  <p className="text-sm text-white">
                    {diagnostics.registrationEnd 
                      ? new Date(diagnostics.registrationEnd).toLocaleString('es-AR')
                      : 'No definido'}
                  </p>
                </div>
              </div>

              {/* Participantes Inscritos */}
              <div className="bg-slate-800 rounded-lg p-4 mb-6">
                <h4 className="text-lg font-semibold text-white mb-3">
                  👥 Participantes Inscritos ({diagnostics.registrationCount})
                </h4>
                {diagnostics.registrations.length > 0 ? (
                  <div className="space-y-2">
                    {diagnostics.registrations.map((reg: any) => (
                      <div key={reg.id} className="flex items-center justify-between bg-slate-900 rounded p-3">
                        <div>
                          <p className="text-white font-semibold">{reg.user.username}</p>
                          <p className="text-xs text-slate-400">ID: {reg.userId}</p>
                        </div>
                        <div className="text-sm text-green-400">✓ Inscrito</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-4">No hay participantes inscritos</p>
                )}
              </div>

              {/* Acciones Correctivas */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-yellow-400 mb-4">🔧 Acciones Correctivas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {diagnostics.status !== 'REGISTRATION_OPEN' && (
                    <button
                      onClick={() => fixTournamentStatus(diagnostics.id)}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all"
                    >
                      {loading ? '⏳' : '🔄'} Cambiar a REGISTRATION_OPEN
                    </button>
                  )}
                  
                  <button
                    onClick={() => extendRegistration(diagnostics.id)}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all"
                  >
                    {loading ? '⏳' : '📅'} Extender Inscripciones +7 días
                  </button>

                  <button
                    onClick={() => router.push(`/admin/generate-brackets`)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all"
                  >
                    🎯 Ir a Generar Brackets
                  </button>

                  <button
                    onClick={() => router.push(`/tournaments/${diagnostics.id}`)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-all"
                  >
                    👁️ Ver Torneo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
