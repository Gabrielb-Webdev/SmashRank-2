'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Calendar, MapPin, Users, Check, X, Edit, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function TournamentDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showUnregisterModal, setShowUnregisterModal] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [timeUntilCheckin, setTimeUntilCheckin] = useState<string>('');
  const [registrationStatus, setRegistrationStatus] = useState<string>('');
  const [canRegister, setCanRegister] = useState(false);
  const tournamentId = params.id;

  useEffect(() => {
    fetchTournament();
  }, [tournamentId]);

  // Contador regresivo para check-in
  useEffect(() => {
    if (!tournament || !isRegistered || hasCheckedIn) return;

    const updateCountdown = () => {
      const now = new Date();
      // Las fechas de la DB vienen en UTC, JavaScript las convierte automáticamente a hora local del navegador
      const checkinStart = new Date(tournament.checkinStart);
      const checkinEnd = new Date(tournament.checkinEnd);

      if (now < checkinStart) {
        // Antes del check-in
        const diff = checkinStart.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeUntilCheckin(`Check-in abre en ${hours}h ${minutes}m ${seconds}s`);
        setCanCheckIn(false);
      } else if (now >= checkinStart && now <= checkinEnd) {
        // Durante el check-in
        const diff = checkinEnd.getTime() - now.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeUntilCheckin(`⏰ ${minutes}m ${seconds}s restantes`);
        setCanCheckIn(true);
      } else {
        // Después del check-in
        setTimeUntilCheckin('Check-in cerrado');
        setCanCheckIn(false);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [tournament, isRegistered, hasCheckedIn]);

  // Contador para estado de inscripciones
  useEffect(() => {
    if (!tournament) return;

    const updateRegistrationStatus = () => {
      const now = new Date();
      // Las fechas de la DB vienen en UTC, JavaScript las convierte automáticamente
      const startDate = new Date(tournament.startDate);
      const checkinStart = new Date(tournament.checkinStart);
      
      if (now < startDate) {
        // Antes del inicio del torneo - INSCRIPCIONES ABIERTAS
        const diff = startDate.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        // Mostrar mensaje especial si ya abrió el check-in (últimos 30 minutos)
        if (now >= checkinStart) {
          if (hours > 0) {
            setRegistrationStatus(`⏰ Check-in abierto | Inscripciones cierran en ${hours}h ${minutes}m`);
          } else if (minutes > 0) {
            setRegistrationStatus(`⏰ Check-in abierto | Inscripciones cierran en ${minutes}m ${seconds}s`);
          } else {
            setRegistrationStatus(`⏰ Check-in abierto | Inscripciones cierran en ${seconds}s`);
          }
        } else {
          if (hours > 0) {
            setRegistrationStatus(`Inscripciones cierran en ${hours}h ${minutes}m`);
          } else if (minutes > 0) {
            setRegistrationStatus(`Inscripciones cierran en ${minutes}m ${seconds}s`);
          } else {
            setRegistrationStatus(`Inscripciones cierran en ${seconds}s`);
          }
        }
        setCanRegister(true);
      } else {
        // Después del inicio del torneo - INSCRIPCIONES CERRADAS
        setRegistrationStatus('Inscripciones cerradas - Esperando inicio del torneo');
        setCanRegister(false);
      }
    };

    updateRegistrationStatus();
    const interval = setInterval(updateRegistrationStatus, 1000);

    return () => clearInterval(interval);
  }, [tournament]);

  const fetchTournament = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}`);
      const data = await response.json();
      
      if (response.ok) {
        setTournament(data);
        
        // Verificar si el usuario está registrado
        if (session) {
          const userRegistration = data.registrations.find(
            (reg: any) => reg.userId === session.user.id
          );
          setIsRegistered(!!userRegistration);
          setHasCheckedIn(userRegistration?.checkedIn || false);
          
          // Verificar si puede hacer check-in
          const now = new Date();
          // Las fechas de la DB vienen en UTC, JavaScript las convierte automáticamente a hora local
          const checkinStart = new Date(data.checkinStart);
          const checkinEnd = new Date(data.checkinEnd);
          setCanCheckIn(
            now >= checkinStart && 
            now <= checkinEnd && 
            userRegistration && 
            !userRegistration.checkedIn
          );
        }
      }
    } catch (error) {
      console.error('Error al cargar torneo:', error);
      toast.error('Error al cargar el torneo');
    } finally {
      setLoading(false);
    }
  };

  const confirmRegister = async () => {
    setRegistering(true);
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al inscribirse');
      }

      toast.success('¡Inscripción exitosa!');
      setShowRegisterModal(false);
      fetchTournament();
    } catch (error: any) {
      toast.error(error.message || 'Error al procesar la inscripción');
    } finally {
      setRegistering(false);
    }
  };

  const confirmUnregister = async () => {
    setRegistering(true);
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/register`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al cancelar inscripción');
      }

      toast.success('Inscripción cancelada');
      setShowUnregisterModal(false);
      fetchTournament();
    } catch (error: any) {
      toast.error(error.message || 'Error al cancelar la inscripción');
    } finally {
      setRegistering(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/checkin`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast.success('¡Check-in completado!');
      fetchTournament();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este torneo? Esta acción no se puede deshacer.')) return;

    try {
      const response = await fetch(`/api/tournaments/${tournamentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      toast.success('Torneo eliminado');
      router.push('/tournaments');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loader" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Trophy className="w-24 h-24 text-gray-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">Torneo no encontrado</h1>
        <Link href="/tournaments">
          <Button>Volver a Torneos</Button>
        </Link>
      </div>
    );
  }

  const canEdit = session && (session.user.id === tournament.createdById || session.user.role === 'ADMIN');

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a0a 100%)'}}>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Header */}
        <div className="relative mb-8 p-8 rounded-2xl overflow-hidden" style={{background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.15) 0%, rgba(255, 215, 0, 0.1) 100%)', border: '2px solid rgba(220, 20, 60, 0.3)'}}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-500/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-yellow-500/20 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)', boxShadow: '0 8px 25px rgba(220, 20, 60, 0.5)'}}>
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-black text-white mb-2" style={{textShadow: '0 2px 10px rgba(0,0,0,0.5)'}}>{tournament.name}</h1>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold" style={{background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.4)'}}>
                      {tournament.status === 'REGISTRATION_OPEN' ? '🟢 Inscripciones Abiertas' : tournament.status}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold" style={{background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.4)'}}>
                      🌐 Online
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {canEdit && (
                  <>
                    <Link href={`/tournaments/${tournamentId}/bracket`}>
                      <button className="px-4 py-2 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold transition-all flex items-center gap-2 shadow-lg">
                        <Trophy className="w-4 h-4" />
                        Bracket
                      </button>
                    </Link>
                    <Link href={`/tournaments/${tournamentId}/edit`}>
                      <button className="px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white font-semibold transition-all flex items-center gap-2 border border-slate-700">
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>
                    </Link>
                    <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold transition-all border border-red-500/40">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
            {tournament.description && (
              <p className="text-slate-300 text-lg mt-4">{tournament.description}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl" style={{background: 'rgba(220, 20, 60, 0.1)', border: '2px solid rgba(220, 20, 60, 0.3)'}}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Formato</p>
                </div>
                <p className="text-white font-bold text-lg">{tournament.format.replace('_', ' ')}</p>
              </div>

              <div className="p-4 rounded-xl" style={{background: 'rgba(34, 197, 94, 0.1)', border: '2px solid rgba(34, 197, 94, 0.3)'}}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Ubicación</p>
                </div>
                <p className="text-white font-bold text-lg">
                  {tournament.isOnline ? '🌐 Online' : tournament.province}
                </p>
              </div>

              <div className="p-4 rounded-xl" style={{background: 'rgba(59, 130, 246, 0.1)', border: '2px solid rgba(59, 130, 246, 0.3)'}}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Inicio</p>
                </div>
                <p className="text-white font-bold text-sm">{formatDate(tournament.startDate)}</p>
              </div>

              <div className="p-4 rounded-xl" style={{background: 'rgba(168, 85, 247, 0.1)', border: '2px solid rgba(168, 85, 247, 0.3)'}}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Jugadores</p>
                </div>
                <p className="text-white font-bold text-lg">
                  {tournament.registrations?.length || 0}
                  {tournament.maxParticipants && <span className="text-slate-400"> / {tournament.maxParticipants}</span>}
                </p>
              </div>
            </div>

            {/* Rules & Stages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tournament.rules && (
                <div className="p-6 rounded-xl" style={{background: 'rgba(15, 23, 42, 0.6)', border: '2px solid rgba(220, 20, 60, 0.2)'}}>
                  <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                    📋 Reglas del Torneo
                  </h3>
                  <p className="text-slate-300 leading-relaxed">{tournament.rules}</p>
                </div>
              )}

              {tournament.stageList && (
                <div className="p-6 rounded-xl" style={{background: 'rgba(15, 23, 42, 0.6)', border: '2px solid rgba(255, 215, 0, 0.2)'}}>
                  <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                    🎮 Lista de Escenarios
                  </h3>
                  <p className="text-slate-300 leading-relaxed">{tournament.stageList}</p>
                </div>
              )}
            </div>

            {/* Participants */}
            <div className="p-6 rounded-xl" style={{background: 'rgba(15, 23, 42, 0.6)', border: '2px solid rgba(220, 20, 60, 0.3)'}}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold text-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  Participantes
                </h3>
                <span className="px-4 py-2 rounded-full font-bold" style={{background: 'rgba(220, 20, 60, 0.2)', color: '#ffd700', border: '1px solid rgba(220, 20, 60, 0.4)'}}>
                  {tournament.registrations.length} jugadores
                </span>
              </div>
              
              {tournament.registrations.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">Aún no hay participantes inscritos</p>
                  <p className="text-slate-500 text-sm mt-2">¡Sé el primero en inscribirte!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2" style={{scrollbarWidth: 'thin'}}>
                  {tournament.registrations.map((reg: any, index: number) => (
                    <div
                      key={reg.id}
                      className="flex items-center justify-between p-4 rounded-lg transition-all hover:scale-[1.02]"
                      style={{background: 'rgba(30, 41, 59, 0.5)', border: '2px solid rgba(220, 20, 60, 0.2)'}}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white" style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)'}}>
                            #{index + 1}
                          </div>
                        </div>
                        {reg.character ? (
                          <>
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl" style={{background: 'rgba(220, 20, 60, 0.1)', border: '2px solid rgba(220, 20, 60, 0.3)'}}>
                              {reg.character.name[0]}
                            </div>
                            <div>
                              <p className="text-white font-bold text-lg">{reg.user.username}</p>
                              <p className="text-sm text-slate-400">
                                <span className="text-yellow-400">⚡</span> {reg.character.name} · Skin {reg.skin.number}
                              </p>
                            </div>
                          </>
                        ) : (
                          <div>
                            <p className="text-white font-bold text-lg">{reg.user.username}</p>
                            <p className="text-sm text-slate-400">
                              <span className="text-yellow-400">⚡</span> Personaje por definir
                            </p>
                          </div>
                        )}
                      </div>
                      {reg.checkedIn && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{background: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.4)'}}>
                          <Check className="w-4 h-4 text-green-400" />
                          <span className="text-sm font-bold text-green-400">Check-in</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            <div className="p-6 rounded-xl" style={{background: 'rgba(220, 20, 60, 0.1)', border: '2px solid rgba(220, 20, 60, 0.4)'}}>
              <h3 className="text-white font-bold text-xl mb-4">🎮 Acción</h3>
              
              {!session ? (
                <div>
                  <p className="text-slate-300 mb-4 text-sm">Inicia sesión para participar en este torneo</p>
                  <Link href="/auth/signin">
                    <button className="w-full py-3 rounded-lg font-bold text-white transition-all hover:scale-105" style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)', boxShadow: '0 4px 15px rgba(220, 20, 60, 0.4)'}}>
                      Iniciar Sesión
                    </button>
                  </Link>
                </div>
              ) : isRegistered ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-lg text-center" style={{background: 'rgba(34, 197, 94, 0.2)', border: '2px solid rgba(34, 197, 94, 0.4)'}}>
                    <Check className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-green-400 font-bold">¡Estás inscrito!</p>
                  </div>
                  
                  {registrationStatus && (
                    <div className="p-3 rounded-lg text-center" style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)'}}>
                      <p className="text-yellow-400 text-xs font-semibold">{registrationStatus}</p>
                    </div>
                  )}
                  
                  {hasCheckedIn ? (
                    <div className="p-4 rounded-lg text-center" style={{background: 'rgba(59, 130, 246, 0.2)', border: '2px solid rgba(59, 130, 246, 0.4)'}}>
                      <Check className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <p className="text-blue-400 font-bold">Check-in Completado</p>
                    </div>
                  ) : (
                    <>
                      {timeUntilCheckin && (
                        <div className="p-4 rounded-lg text-center" style={{background: 'rgba(255, 215, 0, 0.1)', border: '2px solid rgba(255, 215, 0, 0.3)'}}>
                          <p className="text-yellow-400 font-bold text-sm">{timeUntilCheckin}</p>
                        </div>
                      )}
                      
                      {canCheckIn && (
                        <button onClick={handleCheckIn} className="w-full py-3 rounded-lg font-bold text-white transition-all hover:scale-105" style={{background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'}}>
                          ✅ Hacer Check-in
                        </button>
                      )}
                    </>
                  )}
                  
                  <button onClick={() => setShowUnregisterModal(true)} className="w-full py-3 rounded-lg font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all border-2 border-red-500/40">
                    Cancelar Inscripción
                  </button>
                </div>
              ) : (
                <>
                  {registrationStatus && (
                    <div className="mb-3 p-3 rounded-lg text-center" style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)'}}>
                      <p className="text-yellow-400 text-xs font-semibold">{registrationStatus}</p>
                    </div>
                  )}
                  
                  {canRegister ? (
                    <button onClick={() => setShowRegisterModal(true)} className="w-full py-3 rounded-lg font-bold text-white transition-all hover:scale-105" style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)', boxShadow: '0 4px 15px rgba(220, 20, 60, 0.4)'}}>
                      🏆 Inscribirse Ahora
                    </button>
                  ) : (
                    <button disabled className="w-full py-3 rounded-lg font-bold text-gray-500 cursor-not-allowed" style={{background: 'rgba(100, 100, 100, 0.2)', border: '2px solid rgba(100, 100, 100, 0.3)'}}>
                      Inscripciones Cerradas
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Important Dates */}
            <div className="p-6 rounded-xl" style={{background: 'rgba(15, 23, 42, 0.6)', border: '2px solid rgba(255, 215, 0, 0.3)'}}>
              <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" style={{color: '#ffd700'}} />
                Fechas Importantes
              </h3>
              <div className="space-y-4">
                <div className="p-3 rounded-lg" style={{background: 'rgba(220, 20, 60, 0.1)', border: '1px solid rgba(220, 20, 60, 0.3)'}}>
                  <p className="text-xs text-slate-400 uppercase mb-1 flex items-center gap-2">
                    <span>🏁</span> Inicio del Torneo
                  </p>
                  <p className="text-white font-bold">{formatDate(tournament.startDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación de Inscripción */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" style={{background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)'}}>
          <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border-2 border-red-500/30 shadow-2xl animate-scale-in" style={{boxShadow: '0 20px 60px rgba(220, 20, 60, 0.3)'}}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)'}}>
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Confirmar Inscripción</h3>
                <p className="text-sm text-slate-400">Torneo: {tournament?.name}</p>
              </div>
            </div>
            
            <div className="my-6 p-4 rounded-lg" style={{background: 'rgba(220, 20, 60, 0.1)', border: '1px solid rgba(220, 20, 60, 0.3)'}}>
              <p className="text-slate-300 text-sm mb-3">Al inscribirte aceptas:</p>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Participar siguiendo las reglas del torneo</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Realizar el check-in antes del inicio</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Mantener una conducta deportiva</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRegisterModal(false)}
                disabled={registering}
                className="flex-1 py-3 px-4 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors border-2 border-slate-700 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmRegister}
                disabled={registering}
                className="flex-1 py-3 px-4 rounded-lg font-bold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)', boxShadow: '0 4px 15px rgba(220, 20, 60, 0.4)'}}
              >
                {registering ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Inscribiendo...
                  </span>
                ) : (
                  '✓ Confirmar Inscripción'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cancelar Inscripción */}
      {showUnregisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" style={{background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)'}}>
          <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border-2 border-red-500/30 shadow-2xl animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center border-2 border-red-500/40">
                <X className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Cancelar Inscripción</h3>
                <p className="text-sm text-slate-400">¿Estás seguro?</p>
              </div>
            </div>
            
            <p className="text-slate-300 text-sm mb-6">
              Al cancelar tu inscripción perderás tu lugar en el torneo. Esta acción no se puede deshacer.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUnregisterModal(false)}
                disabled={registering}
                className="flex-1 py-3 px-4 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors border-2 border-slate-700 disabled:opacity-50"
              >
                No, mantener inscripción
              </button>
              <button
                onClick={confirmUnregister}
                disabled={registering}
                className="flex-1 py-3 px-4 rounded-lg font-bold text-white bg-red-500/20 hover:bg-red-500/30 transition-all border-2 border-red-500/40 disabled:opacity-50"
              >
                {registering ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                    Cancelando...
                  </span>
                ) : (
                  'Sí, cancelar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
