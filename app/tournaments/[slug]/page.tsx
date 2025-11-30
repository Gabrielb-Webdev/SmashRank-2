'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Calendar, MapPin, Users, Check, X, Edit, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import CharacterSelector from '@/components/tournaments/CharacterSelector';
import Link from 'next/link';

export default function TournamentDetailPage({ params }: { params: { slug: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCharacterSelector, setShowCharacterSelector] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  useEffect(() => {
    fetchTournament();
  }, [params.slug]);

  const fetchTournament = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tournaments/${params.slug}`);
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

  const handleRegister = async (characterId: string, skinId: string) => {
    try {
      const response = await fetch(`/api/tournaments/${params.slug}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId, skinId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast.success('¡Inscripción exitosa!');
      setShowCharacterSelector(false);
      fetchTournament();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUnregister = async () => {
    if (!confirm('¿Estás seguro de cancelar tu inscripción?')) return;

    try {
      const response = await fetch(`/api/tournaments/${params.slug}/register`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      toast.success('Inscripción cancelada');
      fetchTournament();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCheckIn = async () => {
    try {
      const response = await fetch(`/api/tournaments/${params.slug}/checkin`, {
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
      const response = await fetch(`/api/tournaments/${params.slug}`, {
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
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <h1 className="title-manga text-4xl">{tournament.name}</h1>
          {canEdit && (
            <div className="flex gap-2">
              <Link href={`/tournaments/${tournament.slug}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </Link>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
        <p className="text-gray-400 text-lg">{tournament.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-6 h-6" />
                Información del Torneo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 uppercase mb-1">Formato</p>
                  <p className="text-white font-bold">{tournament.format.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 uppercase mb-1">Ubicación</p>
                  <p className="text-white font-bold">
                    {tournament.isOnline ? 'Online' : tournament.province}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 uppercase mb-1">Inicio del Torneo</p>
                  <p className="text-white font-bold">{formatDate(tournament.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 uppercase mb-1">Participantes</p>
                  <p className="text-white font-bold">
                    {tournament.currentParticipants}
                    {tournament.maxParticipants && ` / ${tournament.maxParticipants}`}
                  </p>
                </div>
              </div>

              {tournament.rules && (
                <div>
                  <p className="text-sm text-gray-400 uppercase mb-2">Reglas</p>
                  <p className="text-white">{tournament.rules}</p>
                </div>
              )}

              {tournament.stageList && (
                <div>
                  <p className="text-sm text-gray-400 uppercase mb-2">Stage List</p>
                  <p className="text-white">{tournament.stageList}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Participants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6" />
                Participantes ({tournament.registrations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tournament.registrations.map((reg: any) => (
                  <div
                    key={reg.id}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-primary/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                        {reg.character.icon && (
                          <span className="text-2xl">{reg.character.name[0]}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-bold">{reg.user.username}</p>
                        <p className="text-sm text-gray-400">
                          {reg.character.name} - Skin {reg.skin.number}
                        </p>
                      </div>
                    </div>
                    {reg.checkedIn && (
                      <div className="flex items-center gap-2 text-green-500">
                        <Check className="w-5 h-5" />
                        <span className="text-sm font-bold">Check-in</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Acción</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!session ? (
                <div>
                  <p className="text-gray-400 mb-4">Inicia sesión para inscribirte</p>
                  <Link href="/auth/signin">
                    <Button className="w-full">Iniciar Sesión</Button>
                  </Link>
                </div>
              ) : isRegistered ? (
                <>
                  <div className="flex items-center gap-2 text-green-500 mb-4">
                    <Check className="w-5 h-5" />
                    <span className="font-bold">Estás inscrito</span>
                  </div>
                  
                  {canCheckIn && (
                    <Button className="w-full" onClick={handleCheckIn}>
                      Hacer Check-in
                    </Button>
                  )}
                  
                  {hasCheckedIn && (
                    <div className="flex items-center gap-2 text-blue-500 justify-center p-3 bg-blue-500/10 rounded-lg">
                      <Check className="w-5 h-5" />
                      <span className="font-bold">Check-in completado</span>
                    </div>
                  )}
                  
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleUnregister}
                  >
                    Cancelar Inscripción
                  </Button>
                </>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={() => setShowCharacterSelector(true)}
                >
                  Inscribirse
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fechas Importantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400 uppercase mb-1">Inscripciones Abren</p>
                <p className="text-white font-bold">{formatDate(tournament.registrationStart)}</p>
              </div>
              <div>
                <p className="text-gray-400 uppercase mb-1">Inscripciones Cierran</p>
                <p className="text-white font-bold">{formatDate(tournament.registrationEnd)}</p>
              </div>
              <div>
                <p className="text-gray-400 uppercase mb-1">Check-in Abre</p>
                <p className="text-white font-bold">{formatDate(tournament.checkinStart)}</p>
              </div>
              <div>
                <p className="text-gray-400 uppercase mb-1">Check-in Cierra</p>
                <p className="text-white font-bold">{formatDate(tournament.checkinEnd)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Character Selector Modal */}
      {showCharacterSelector && (
        <CharacterSelector
          onSelect={handleRegister}
          onClose={() => setShowCharacterSelector(false)}
        />
      )}
    </div>
  );
}
