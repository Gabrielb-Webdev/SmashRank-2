/**
 * Página del Bracket - Sistema Double Elimination estilo start.gg
 * Incluye tabs, show projected, streams, y visualización completa
 */

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Loader2, Trophy, Users, AlertCircle, ArrowLeft, Sparkles, Play, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import MatchModal from '@/components/matches/MatchModal';
import { BracketView } from '@/components/brackets/BracketView';

interface Tournament {
  id: string;
  name: string;
  prizePool?: string;
  status: string;
  registrations: Registration[];
}

interface Registration {
  id: string;
  seed: number | null;
  seedBadge: string | null;
  user: {
    id: string;
    username: string;
    avatar?: string;
    wins: number;
    losses: number;
    points: number;
  };
}

interface Match {
  id: string;
  tournamentId?: string;
  bracketType: string;
  roundName: string;
  roundNumber: number;
  position: number;
  player1Id?: string;
  player1Source?: string;
  player2Id?: string;
  player2Source?: string;
  player1Score?: number;
  player2Score?: number;
  winnerId?: string;
  loserId?: string;
  status: string;
  isLive?: boolean;
  scheduledTime?: Date | string;
  nextMatchId?: string;
  nextLoserMatchId?: string;
  previousMatch1Id?: string;
  previousMatch2Id?: string;
}

interface BracketData {
  id: string;
  tournament: Tournament;
  data: {
    winners: Match[];
    losers: Match[];
    grandFinals?: Match;
  };
}

type Tab = 'overview' | 'brackets' | 'standings' | 'matches';

export default function BracketPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [starting, setStarting] = useState(false);
  
  const [bracket, setBracket] = useState<BracketData | null>(null);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  
  const [activeTab, setActiveTab] = useState<Tab>('brackets');
  const [showProjected, setShowProjected] = useState(true);
  
  const isAdmin = session?.user?.role === 'ADMIN';
  
  useEffect(() => {
    loadData();
  }, [params.id]);
  
  useEffect(() => {
    if (tournament?.status === 'IN_PROGRESS') {
      loadMatches();
      const interval = setInterval(loadMatches, 10000); // Poll cada 10s
      return () => clearInterval(interval);
    }
  }, [tournament?.status]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar torneo
      const tournamentRes = await fetch(`/api/tournaments/${params.id}`);
      if (tournamentRes.ok) {
        const tournamentData = await tournamentRes.json();
        setTournament(tournamentData);
      }
      
      // Cargar bracket si existe
      const bracketRes = await fetch(`/api/tournaments/${params.id}/bracket`);
      if (bracketRes.ok) {
        const bracketData = await bracketRes.json();
        setBracket(bracketData);
        setTournament(bracketData.tournament);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const loadMatches = async () => {
    try {
      const res = await fetch(`/api/tournaments/${params.id}/matches`);
      if (res.ok) {
        const data = await res.json();
        setMatches(data);
      }
    } catch (err) {
      console.error('Error loading matches:', err);
    }
  };
  
  const handleGenerateBracket = async () => {
    try {
      setGenerating(true);
      
      const res = await fetch(`/api/tournaments/${params.id}/bracket`, {
        method: 'POST',
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.error || 'Error al generar bracket');
        return;
      }
      
      toast.success('¡Bracket generado exitosamente!');
      await loadData();
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al generar el bracket');
    } finally {
      setGenerating(false);
    }
  };
  
  const handleStartTournament = async () => {
    try {
      setStarting(true);
      
      const res = await fetch(`/api/tournaments/${params.id}/start`, {
        method: 'POST',
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.error || 'Error al iniciar torneo');
        return;
      }
      
      toast.success('¡Torneo iniciado!');
      await loadData();
      await loadMatches();
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al iniciar el torneo');
    } finally {
      setStarting(false);
    }
  };
  
  const getPlayerInfo = (playerId?: string) => {
    if (!playerId || !bracket) return null;
    
    const registration = bracket.tournament.registrations.find(
      r => r.user.id === playerId
    );
    
    if (!registration) return null;
    
    return {
      id: registration.user.id,
      username: registration.user.username,
      avatar: registration.user.avatar,
      seed: registration.seed || undefined,
      seedBadge: registration.seedBadge || undefined,
    };
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-white font-semibold">Cargando bracket...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-6">
        {/* Header con botón volver */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        </div>
        
        {/* Tournament Header */}
        {tournament && (
          <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-black text-white mb-1">
                  {tournament.name}
                  {tournament.prizePool && (
                    <span className="text-yellow-400 ml-3">({tournament.prizePool})</span>
                  )}
                </h1>
                <p className="text-slate-400">Bracket</p>
              </div>
              
              {isAdmin && tournament.status !== 'IN_PROGRESS' && (
                <div className="flex gap-3">
                  {bracket && (
                    <Button
                      onClick={handleGenerateBracket}
                      disabled={generating}
                      className="bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Regenerando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Regenerar Bracket
                        </>
                      )}
                    </Button>
                  )}
                  
                  {bracket && (
                    <Button
                      onClick={handleStartTournament}
                      disabled={starting}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      {starting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Iniciando...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Iniciar Torneo
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Tabs Navigation */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-slate-700">
            {(['overview', 'brackets', 'standings', 'matches'] as Tab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-semibold capitalize transition-colors relative ${
                  activeTab === tab
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-yellow-500" />
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'brackets' && (
          <>
            {!bracket && isAdmin && (
              <div className="mb-8 p-8 bg-slate-900/50 rounded-xl border-2 border-slate-800 text-center">
                <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Generar Bracket</h2>
                <p className="text-slate-400 mb-6">
                  {tournament?.registrations.length || 0} participantes confirmados
                </p>
                
                {(tournament?.registrations.length || 0) < 2 ? (
                  <div className="flex items-center justify-center gap-2 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <span>Se necesitan al menos 2 participantes</span>
                  </div>
                ) : (
                  <Button
                    onClick={handleGenerateBracket}
                    disabled={generating}
                    size="lg"
                    className="bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generando Bracket...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        GENERAR BRACKET
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
            
            {!bracket && !isAdmin && (
              <div className="mb-8 p-12 bg-slate-900/50 rounded-xl border-2 border-slate-800 text-center">
                <Trophy className="w-20 h-20 text-slate-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">
                  Bracket No Generado
                </h2>
                <p className="text-slate-400">
                  El bracket será generado por los administradores antes de iniciar el torneo
                </p>
              </div>
            )}
            
            {bracket && (
              <>
                {/* Show Projected Toggle */}
                <div className="mb-6 flex items-center justify-between">
                  <button
                    onClick={() => setShowProjected(!showProjected)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors"
                  >
                    {showProjected ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                    <span className="font-medium">
                      {showProjected ? 'Ocultando' : 'Mostrando'} Matches Proyectados
                    </span>
                  </button>
                  
                  <div className="text-sm text-slate-400">
                    {bracket.tournament.registrations.length} participantes
                  </div>
                </div>
                
                {/* Bracket Visualization */}
                <BracketView
                  winnersMatches={bracket.data.winners}
                  losersMatches={bracket.data.losers}
                  grandFinals={bracket.data.grandFinals}
                  getPlayerInfo={getPlayerInfo}
                  onMatchClick={(match) => {
                    // Solo permitir click si el torneo está en progreso
                    if (tournament?.status === 'IN_PROGRESS') {
                      setSelectedMatch(match);
                    }
                  }}
                  showProjected={showProjected}
                />
              </>
            )}
          </>
        )}
        
        {activeTab === 'overview' && (
          <div className="p-8 bg-slate-900/50 rounded-xl border-2 border-slate-800 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Vista General</h3>
            <p className="text-slate-400">Próximamente: estadísticas del torneo, streams en vivo, etc.</p>
          </div>
        )}
        
        {activeTab === 'standings' && (
          <div className="p-8 bg-slate-900/50 rounded-xl border-2 border-slate-800 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Clasificación</h3>
            <p className="text-slate-400">Próximamente: tabla de posiciones y resultados finales</p>
          </div>
        )}
        
        {activeTab === 'matches' && (
          <div className="p-8 bg-slate-900/50 rounded-xl border-2 border-slate-800 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Todos los Matches</h3>
            <p className="text-slate-400">Próximamente: lista completa de matches con filtros</p>
          </div>
        )}
      </div>
      
      {/* Match Modal */}
      {selectedMatch && (
        <MatchModal
          match={selectedMatch as any}
          tournamentId={params.id}
          onClose={() => setSelectedMatch(null)}
          onUpdate={() => {
            loadMatches();
            loadData();
            setSelectedMatch(null);
          }}
        />
      )}
    </div>
  );
}
