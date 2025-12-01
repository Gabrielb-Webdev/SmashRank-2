"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Trophy, Users, AlertCircle, ArrowLeft, Sparkles, Zap, Target, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import MatchModal from '@/components/matches/MatchModal';

interface Player {
  id: string;
  username: string;
  seed: number;
  registrationId: string;
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
  roundNumber: number;
  matchNumber: number;
  player1Id?: string;
  player2Id?: string;
  winnerId?: string;
  loserId?: string;
  score?: string;
  bracket: 'winners' | 'losers' | 'grand_finals';
}

interface Bracket {
  winners: Match[];
  losers: Match[];
  grandFinals?: Match;
}

interface BracketData {
  id: string;
  tournamentId: string;
  type: string;
  data: Bracket;
  tournament: {
    id: string;
    name: string;
    registrations: Array<{
      id: string;
      seed: number | null;
      user: {
        id: string;
        username: string;
        avatar?: string;
        wins: number;
        losses: number;
        points: number;
      };
    }>;
  };
}

export default function BracketPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [bracket, setBracket] = useState<BracketData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [tournamentStatus, setTournamentStatus] = useState<string>('DRAFT');
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    loadBracket();
    loadTournamentStatus();
  }, [params.id]);

  useEffect(() => {
    if (tournamentStatus === 'IN_PROGRESS') {
      loadMatches();
      const interval = setInterval(loadMatches, 10000); // Actualizar cada 10 segundos
      return () => clearInterval(interval);
    }
  }, [tournamentStatus]);

  const loadTournamentStatus = async () => {
    try {
      const response = await fetch(`/api/tournaments/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setTournamentStatus(data.status);
      }
    } catch (err) {
      console.error('Error loading tournament status:', err);
    }
  };

  const loadMatches = async () => {
    try {
      const response = await fetch(`/api/tournaments/${params.id}/matches`);
      if (response.ok) {
        const data = await response.json();
        setMatches(data);
      }
    } catch (err) {
      console.error('Error loading matches:', err);
    }
  };

  const loadBracket = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tournaments/${params.id}/bracket`);
      
      if (response.ok) {
        const data = await response.json();
        setBracket(data);
        setPlayers(data.tournament.registrations);
      } else if (response.status === 404) {
        // Si el bracket no existe, cargar información del torneo para mostrar participantes
        const tournamentResponse = await fetch(`/api/tournaments/${params.id}`);
        if (tournamentResponse.ok) {
          const tournamentData = await tournamentResponse.json();
          setPlayers(tournamentData.registrations);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al cargar el bracket');
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBracket = async () => {
    try {
      setGenerating(true);
      setError(null);
      
      const response = await fetch(`/api/tournaments/${params.id}/bracket`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al generar el bracket');
        toast.error(data.error || 'Error al generar el bracket');
        return;
      }

      toast.success('¡Bracket generado exitosamente!');
      await loadBracket();
    } catch (err) {
      console.error('Error:', err);
      setError('Error al generar el bracket');
      toast.error('Error al generar el bracket');
    } finally {
      setGenerating(false);
    }
  };

  const handleStartTournament = async () => {
    try {
      setStarting(true);
      const response = await fetch(`/api/tournaments/${params.id}/start`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Error al iniciar el torneo');
        return;
      }

      toast.success('¡Torneo iniciado! Los jugadores pueden hacer check-in.');
      setTournamentStatus('IN_PROGRESS');
      await loadMatches();
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al iniciar el torneo');
    } finally {
      setStarting(false);
    }
  };

  // Función para generar ID de match: A, B, C... Z, AA, AB, AC... AZ, BA, BB...
  const getMatchLabel = (globalIndex: number) => {
    if (globalIndex < 26) {
      // A-Z
      return String.fromCharCode(65 + globalIndex);
    } else {
      // AA, AB, AC... AZ, BA, BB...
      const first = Math.floor(globalIndex / 26) - 1;
      const second = globalIndex % 26;
      return String.fromCharCode(65 + first) + String.fromCharCode(65 + second);
    }
  };

  // Mapa global de matches para tracking
  const matchLabelMap = new Map<string, string>();
  let globalMatchIndex = 0;

  const getPlayerInfo = (playerId: string | undefined) => {
    if (!playerId || !bracket) return null;
    const registration = bracket.tournament.registrations.find(
      r => r.user.id === playerId
    );
    return registration?.user;
  };

  const renderMatch = (match: Match, index: number, roundMatches: Match[]) => {
    // Asignar label al match si no existe
    if (!matchLabelMap.has(match.id)) {
      matchLabelMap.set(match.id, getMatchLabel(globalMatchIndex));
      globalMatchIndex++;
    }
    const matchLabel = matchLabelMap.get(match.id)!;
    
    const player1 = getPlayerInfo(match.player1Id);
    const player2 = getPlayerInfo(match.player2Id);
    
    // Si NO hay ningún jugador, no mostrar
    if (!player1 && !player2) {
      return null;
    }
    
    // Buscar match real si el torneo está en progreso
    const realMatch = tournamentStatus === 'IN_PROGRESS' 
      ? matches.find(m => m.id === match.id)
      : null;
    
    const hasWinner = realMatch ? !!realMatch.winnerId : !!match.winnerId;
    const isClickable = realMatch && (session?.user?.role === 'ADMIN' || 
      realMatch.player1Id === session?.user?.id || 
      realMatch.player2Id === session?.user?.id);

    // Si solo hay un jugador (esperando al ganador de otro match)
    const hasBothPlayers = player1 && player2;
    if (!hasBothPlayers) {
      const waitingPlayer = player1 || player2;
      const isPlayer1Waiting = !!player1;
      
      // Buscar de qué match viene el slot vacío
      const emptySlotText = "Ganador de...";
      
      return (
        <div 
          key={match.id} 
          className="rounded-lg overflow-hidden"
          style={{
            background: '#1e293b',
            border: '2px solid rgba(100, 116, 139, 0.5)',
            width: '280px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
          }}
        >
          {/* Header del match con su ID */}
          <div className="px-2 py-1 text-center border-b border-slate-700"
            style={{background: 'rgba(0, 0, 0, 0.3)'}}>
            <span className="text-xs font-bold text-yellow-400">Match {matchLabel}</span>
          </div>
          
          {/* Jugador esperando o slot esperando */}
          {isPlayer1Waiting && waitingPlayer ? (
            <>
              <div 
                className="px-3 py-3 flex items-center justify-between"
                style={{
                  background: 'rgba(100, 116, 139, 0.2)',
                  borderBottom: '1px solid rgba(71, 85, 105, 0.3)'
                }}
              >
                <div className="flex items-center gap-2.5 flex-1">
                  <div className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold"
                    style={{background: 'linear-gradient(135deg, #dc143c 0%, #ff6b6b 100%)', color: 'white'}}>
                    {waitingPlayer.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-white text-sm">{waitingPlayer.username}</span>
                </div>
              </div>
              <div 
                className="px-3 py-3 flex items-center gap-2"
                style={{background: 'rgba(30, 41, 59, 0.5)'}}
              >
                <div className="w-8 h-8 rounded flex items-center justify-center"
                  style={{background: 'rgba(71, 85, 105, 0.3)', border: '1px dashed rgba(71, 85, 105, 0.5)'}}>
                  <span className="text-slate-500 text-xs">?</span>
                </div>
                <span className="text-slate-500 italic text-sm">{emptySlotText}</span>
              </div>
            </>
          ) : (
            <>
              <div 
                className="px-3 py-3 flex items-center gap-2"
                style={{background: 'rgba(30, 41, 59, 0.5)', borderBottom: '1px solid rgba(71, 85, 105, 0.3)'}}
              >
                <div className="w-8 h-8 rounded flex items-center justify-center"
                  style={{background: 'rgba(71, 85, 105, 0.3)', border: '1px dashed rgba(71, 85, 105, 0.5)'}}>
                  <span className="text-slate-500 text-xs">?</span>
                </div>
                <span className="text-slate-500 italic text-sm">{emptySlotText}</span>
              </div>
              {waitingPlayer && (
                <div 
                  className="px-3 py-3 flex items-center justify-between"
                  style={{background: 'rgba(100, 116, 139, 0.2)'}}
                >
                  <div className="flex items-center gap-2.5 flex-1">
                    <div className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold"
                      style={{background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', color: 'white'}}>
                      {waitingPlayer.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-white text-sm">{waitingPlayer.username}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      );
    }

    // Match normal estilo start.gg
    return (
      <div 
        key={match.id} 
        onClick={() => isClickable && setSelectedMatch(realMatch)}
        className={`rounded-lg overflow-hidden transition-all ${
          isClickable ? 'cursor-pointer hover:scale-[1.02] hover:shadow-xl' : ''
        }`}
        style={{
          background: '#1e293b',
          border: `2px solid ${hasWinner ? 'rgba(34, 197, 94, 0.5)' : 'rgba(71, 85, 105, 0.5)'}`,
          width: '280px',
          boxShadow: hasWinner ? '0 4px 15px rgba(34, 197, 94, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Header del match con su ID */}
        <div className="px-2 py-1 text-center border-b border-slate-700"
          style={{background: 'rgba(0, 0, 0, 0.3)'}}>
          <span className="text-xs font-bold text-yellow-400">Match {matchLabel}</span>
        </div>
        
        {/* Player 1 */}
        <div 
          className={`px-3 py-3 flex items-center justify-between transition-all ${
            match.winnerId === match.player1Id ? 'bg-gradient-to-r from-green-900/40 to-green-800/20' : ''
          }`}
          style={{
            borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
            background: match.winnerId === match.player1Id 
              ? 'linear-gradient(90deg, rgba(22, 163, 74, 0.25) 0%, rgba(22, 163, 74, 0.05) 100%)'
              : 'rgba(30, 41, 59, 0.5)'
          }}
        >
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {/* Avatar del jugador */}
            <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              match.winnerId === match.player1Id ? 'ring-2 ring-green-400' : ''
            }`}
              style={{background: 'linear-gradient(135deg, #dc143c 0%, #ff6b6b 100%)', color: 'white'}}>
              {player1.username.charAt(0).toUpperCase()}
            </div>
            
            {/* Nombre del jugador */}
            <div className="flex-1 min-w-0">
              <span className={`font-bold text-sm truncate block ${
                match.winnerId === match.player1Id ? 'text-white' : 'text-slate-300'
              }`}>
                {player1.username}
              </span>
              {/* Personaje usado (si está disponible) */}
              {realMatch?.player1Character && (
                <span className="text-xs text-slate-400 truncate block">
                  {realMatch.player1Character}
                </span>
              )}
            </div>
          </div>

          {/* Score y winner badge */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {match.winnerId === match.player1Id && (
              <div className="w-6 h-6 rounded-sm flex items-center justify-center"
                style={{background: 'rgba(34, 197, 94, 0.3)'}}>
                <Trophy className="w-3.5 h-3.5 text-green-400" />
              </div>
            )}
            {realMatch && (
              <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-sm ${
                match.winnerId === match.player1Id ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'
              }`}>
                {realMatch.player1Score || 0}
              </div>
            )}
          </div>
        </div>

        {/* Player 2 */}
        <div 
          className={`px-3 py-3 flex items-center justify-between transition-all ${
            match.winnerId === match.player2Id ? 'bg-gradient-to-r from-green-900/40 to-green-800/20' : ''
          }`}
          style={{
            background: match.winnerId === match.player2Id 
              ? 'linear-gradient(90deg, rgba(22, 163, 74, 0.25) 0%, rgba(22, 163, 74, 0.05) 100%)'
              : 'rgba(30, 41, 59, 0.5)'
          }}
        >
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {/* Avatar del jugador */}
            <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              match.winnerId === match.player2Id ? 'ring-2 ring-green-400' : ''
            }`}
              style={{background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', color: 'white'}}>
              {player2.username.charAt(0).toUpperCase()}
            </div>
            
            {/* Nombre del jugador */}
            <div className="flex-1 min-w-0">
              <span className={`font-bold text-sm truncate block ${
                match.winnerId === match.player2Id ? 'text-white' : 'text-slate-300'
              }`}>
                {player2.username}
              </span>
              {/* Personaje usado (si está disponible) */}
              {realMatch?.player2Character && (
                <span className="text-xs text-slate-400 truncate block">
                  {realMatch.player2Character}
                </span>
              )}
            </div>
          </div>

          {/* Score y winner badge */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {match.winnerId === match.player2Id && (
              <div className="w-6 h-6 rounded-sm flex items-center justify-center"
                style={{background: 'rgba(34, 197, 94, 0.3)'}}>
                <Trophy className="w-3.5 h-3.5 text-green-400" />
              </div>
            )}
            {realMatch && (
              <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-sm ${
                match.winnerId === match.player2Id ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'
              }`}>
                {realMatch.player2Score || 0}
              </div>
            )}
          </div>
        </div>

        {/* Footer con estado del match */}
        {realMatch && realMatch.status !== 'COMPLETED' && (
          <div className="px-3 py-1.5 text-center text-xs font-bold"
            style={{
              background: realMatch.status === 'CHECKIN' ? 'rgba(234, 179, 8, 0.15)' :
                         realMatch.status === 'PLAYING' ? 'rgba(59, 130, 246, 0.15)' :
                         'rgba(71, 85, 105, 0.15)',
              color: realMatch.status === 'CHECKIN' ? '#eab308' :
                    realMatch.status === 'PLAYING' ? '#3b82f6' :
                    '#94a3b8',
              borderTop: '1px solid rgba(71, 85, 105, 0.3)'
            }}>
            {realMatch.status === 'CHECKIN' && '⏰ Esperando check-in'}
            {realMatch.status === 'PLAYING' && '🎮 En progreso'}
            {realMatch.status === 'BANNING' && '🚫 Banning stages'}
            {realMatch.status === 'STAGE_SELECT' && '🎯 Selección de stage'}
            {realMatch.status === 'CHAR_SELECT' && '🎮 Selección de personaje'}
          </div>
        )}
      </div>
    );
  };

  const getRoundName = (roundNum: number, totalRounds: number) => {
    const roundsFromEnd = totalRounds - roundNum;
    if (roundsFromEnd === 0) return 'Final';
    if (roundsFromEnd === 1) return 'Semifinal';
    if (roundsFromEnd === 2) return 'Cuartos';
    return `Ronda ${roundNum}`;
  };

  const renderBracketSection = (matches: Match[], title: string, icon: string, gradient: string) => {
    if (!matches || matches.length === 0) return null;

    // Agrupar matches por ronda
    const rounds = matches.reduce((acc, match) => {
      if (!acc[match.roundNumber]) {
        acc[match.roundNumber] = [];
      }
      acc[match.roundNumber].push(match);
      return acc;
    }, {} as Record<number, Match[]>);

    const totalRounds = Math.max(...Object.keys(rounds).map(Number));

    return (
      <div className="mb-12">
        {/* Título del bracket */}
        <div className="mb-6 p-4 rounded-xl" 
          style={{background: gradient, border: '2px solid rgba(220, 20, 60, 0.5)', boxShadow: '0 4px 20px rgba(220, 20, 60, 0.2)'}}>
          <h3 className="text-2xl font-black text-white flex items-center gap-3">
            <span className="text-3xl">{icon}</span>
            {title}
          </h3>
        </div>

        {/* Bracket horizontal tipo start.gg */}
        <div className="overflow-x-auto pb-8">
          <div className="flex gap-8 min-w-min">
            {Object.entries(rounds)
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .map(([roundNum, roundMatches]) => {
                const rNum = Number(roundNum);
                // Calcular espaciado vertical que aumenta con cada ronda
                const baseSpacing = 8;
                const verticalGap = rNum > 1 ? baseSpacing * Math.pow(2, rNum - 1) : baseSpacing;

                return (
                  <div key={roundNum} className="flex flex-col" style={{ minWidth: '300px' }}>
                    {/* Título de la ronda */}
                    <div className="mb-6 p-2.5 rounded-lg text-center sticky top-0 z-10" 
                      style={{
                        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                        border: '2px solid rgba(220, 20, 60, 0.3)',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
                      }}>
                      <h4 className="font-black text-white text-sm tracking-wide uppercase">
                        {getRoundName(rNum, totalRounds)}
                      </h4>
                    </div>

                    {/* Matches de la ronda */}
                    <div className="flex flex-col justify-around h-full" style={{ gap: `${verticalGap}px` }}>
                      {roundMatches
                        .sort((a, b) => a.matchNumber - b.matchNumber)
                        .map((match, idx) => (
                          <div key={match.id} className="flex items-center">
                            {renderMatch(match, idx, roundMatches)}
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" 
        style={{background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a0a 100%)'}}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)', animation: 'pulse 2s infinite'}}>
            <Trophy className="w-8 h-8 text-white animate-bounce" />
          </div>
          <p className="text-white font-bold">Cargando información del bracket...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a0a 100%)'}}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105"
            style={{background: 'rgba(220, 20, 60, 0.2)', border: '2px solid rgba(220, 20, 60, 0.4)'}}>
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        </div>

        {!bracket && session?.user?.role === 'ADMIN' && (
          <div className="mb-8">
            {/* Hero Section */}
            <div className="mb-8 p-8 rounded-2xl text-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.1) 0%, rgba(255, 215, 0, 0.1) 100%)',
                border: '2px solid rgba(220, 20, 60, 0.3)'
              }}>
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10"
                style={{background: 'radial-gradient(circle, #ffd700 0%, transparent 70%)'}}></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 opacity-10"
                style={{background: 'radial-gradient(circle, #dc143c 0%, transparent 70%)'}}></div>
              
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)'}}>
                  <Trophy className="w-10 h-10 text-white animate-pulse" />
                </div>
                <h1 className="text-4xl font-black mb-2 text-white">Generar Bracket</h1>
                <p className="text-slate-300 text-lg">Sistema de Eliminación Doble con Seeding Inteligente</p>
              </div>
            </div>

            {/* Stats Card */}
            <div className="mb-6 p-6 rounded-xl"
              style={{background: 'rgba(15, 23, 42, 0.6)', border: '2px solid rgba(220, 20, 60, 0.3)'}}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)'}}>
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Participantes Confirmados</p>
                    <p className="text-3xl font-black text-white">{players.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg"
                  style={{background: players.length >= 2 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', 
                          border: players.length >= 2 ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)'}}>
                  {players.length >= 2 ? (
                    <>
                      <Sparkles className="w-5 h-5 text-green-400" />
                      <span className="font-bold text-green-400">¡Listo!</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <span className="font-bold text-red-400">Mínimo 2</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Seeding Info */}
            <div className="mb-6 p-6 rounded-xl"
              style={{background: 'rgba(15, 23, 42, 0.6)', border: '2px solid rgba(220, 20, 60, 0.3)'}}>
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-yellow-400" />
                <h4 className="font-black text-white text-xl">Sistema de Seeding Inteligente</h4>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)', color: 'white'}}>1</span>
                  <span className="text-slate-300">Los jugadores se ordenan por puntos acumulados en el ranking</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)', color: 'white'}}>2</span>
                  <span className="text-slate-300">Los mejores rankeados se distribuyen estratégicamente en el bracket</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)', color: 'white'}}>3</span>
                  <span className="text-slate-300">Se garantizan enfrentamientos equilibrados en las primeras rondas</span>
                </li>
              </ul>
            </div>

            {/* Players List */}
            {players.length > 0 && (
              <div className="mb-6 p-6 rounded-xl"
                style={{background: 'rgba(15, 23, 42, 0.6)', border: '2px solid rgba(220, 20, 60, 0.3)'}}>
                <h4 className="font-black text-white text-xl mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Orden de Seeding
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {players
                    .sort((a, b) => b.user.points - a.user.points)
                    .map((player, index) => (
                      <div 
                        key={player.id} 
                        className="p-3 rounded-lg transition-all hover:scale-[1.02]"
                        style={{background: 'rgba(30, 41, 59, 0.5)', border: '2px solid rgba(100, 116, 139, 0.3)'}}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-white"
                              style={{background: index === 0 ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' : 
                                                 index === 1 ? 'linear-gradient(135deg, #c0c0c0 0%, #e0e0e0 100%)' :
                                                 index === 2 ? 'linear-gradient(135deg, #cd7f32 0%, #e89e5f 100%)' :
                                                 'linear-gradient(135deg, #dc143c 0%, #ff6b6b 100%)',
                                      color: index < 3 ? '#000' : '#fff'}}>
                              #{index + 1}
                            </span>
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
                              style={{background: 'linear-gradient(135deg, #dc143c 0%, #ff6b6b 100%)', color: 'white'}}>
                              {player.user.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-white">{player.user.username}</p>
                              <p className="text-xs text-slate-400">
                                {player.user.wins}W - {player.user.losses}L
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-black text-yellow-400">{player.user.points}</p>
                            <p className="text-xs text-slate-400">pts</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-lg flex items-center gap-3"
                style={{background: 'rgba(239, 68, 68, 0.1)', border: '2px solid rgba(239, 68, 68, 0.3)'}}>
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-red-400 font-medium">{error}</span>
              </div>
            )}

            {/* Generate/Regenerate Button */}
            <button
              onClick={handleGenerateBracket}
              disabled={generating || players.length < 2}
              className="w-full py-4 rounded-xl font-black text-white text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] hover:shadow-2xl"
              style={{
                background: players.length >= 2 
                  ? 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)' 
                  : 'rgba(100, 116, 139, 0.5)',
                border: '2px solid rgba(220, 20, 60, 0.5)',
                boxShadow: players.length >= 2 ? '0 8px 30px rgba(220, 20, 60, 0.4)' : 'none'
              }}>
              {generating ? (
                <span className="flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {bracket ? 'Regenerando' : 'Generando'} Bracket...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <Sparkles className="w-5 h-5" />
                  {bracket ? 'REGENERAR BRACKET' : 'GENERAR BRACKET'}
                  <Sparkles className="w-5 h-5" />
                </span>
              )}
            </button>

            {players.length < 2 && (
              <p className="text-center text-slate-400 mt-4 font-medium">
                ⚠️ Se necesitan al menos 2 participantes para generar el bracket
              </p>
            )}
            
            {bracket && players.length >= 2 && (
              <p className="text-center text-yellow-400 mt-4 font-medium flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                Puedes regenerar el bracket las veces que quieras antes de iniciar el torneo
              </p>
            )}

            {/* Botón Iniciar Torneo */}
            {bracket && tournamentStatus !== 'IN_PROGRESS' && (
              <div className="mt-6">
                <button
                  onClick={handleStartTournament}
                  disabled={starting}
                  className="w-full py-4 rounded-xl font-black text-white text-lg transition-all hover:scale-[1.02] hover:shadow-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: '2px solid rgba(16, 185, 129, 0.5)',
                    boxShadow: '0 8px 30px rgba(16, 185, 129, 0.4)'
                  }}>
                  {starting ? (
                    <span className="flex items-center justify-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Iniciando Torneo...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      <Play className="w-5 h-5" />
                      INICIAR TORNEO
                      <Play className="w-5 h-5" />
                    </span>
                  )}
                </button>
                <p className="text-center text-slate-400 mt-3 text-sm">
                  Al iniciar el torneo, los jugadores tendrán 5 minutos para hacer check-in en sus matches
                </p>
              </div>
            )}
          </div>
        )}

        {!bracket && session?.user?.role !== 'ADMIN' && (
          <div className="mb-8 p-12 rounded-2xl text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.1) 0%, rgba(255, 215, 0, 0.1) 100%)',
              border: '2px solid rgba(220, 20, 60, 0.3)'
            }}>
            <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{background: 'rgba(220, 20, 60, 0.2)', border: '3px solid rgba(220, 20, 60, 0.4)'}}>
              <Trophy className="w-12 h-12 text-slate-400" />
            </div>
            <h2 className="text-3xl font-black text-white mb-3">Bracket No Generado</h2>
            <p className="text-slate-300 text-lg mb-2">El bracket para este torneo aún no ha sido creado.</p>
            <p className="text-slate-400">Los administradores generarán el bracket una vez completado el check-in.</p>
            {players.length > 0 && (
              <div className="mt-6 p-4 rounded-lg inline-block" 
                style={{background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)'}}>
                <p className="text-green-400 font-bold">
                  ✅ {players.length} participante{players.length !== 1 ? 's' : ''} con check-in
                </p>
              </div>
            )}
          </div>
        )}

        {bracket && (
          <div>
            <div className="mb-8 p-8 rounded-2xl text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.1) 0%, rgba(255, 215, 0, 0.1) 100%)',
                border: '2px solid rgba(220, 20, 60, 0.3)'
              }}>
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)'}}>
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-black mb-2 text-white">Bracket del Torneo</h1>
              <p className="text-slate-300 text-lg">Eliminación Doble - {players.length} Participantes</p>
              
              {/* Botón Reset para Admin (cuando torneo está en progreso) */}
              {session?.user?.role === 'ADMIN' && tournamentStatus === 'IN_PROGRESS' && (
                <div className="mt-6 max-w-2xl mx-auto">
                  <button
                    onClick={async () => {
                      if (!confirm('¿Resetear el torneo? Esto eliminará todos los matches y volverá el torneo a estado DRAFT para que puedas regenerar el bracket.')) return;
                      try {
                        const response = await fetch(`/api/tournaments/${params.id}/reset`, {
                          method: 'POST',
                        });
                        const data = await response.json();
                        if (!response.ok) {
                          toast.error(data.error || 'Error al resetear');
                          return;
                        }
                        toast.success('Torneo reseteado exitosamente');
                        setTournamentStatus('DRAFT');
                        await loadBracket();
                      } catch (err) {
                        console.error('Error:', err);
                        toast.error('Error al resetear el torneo');
                      }
                    }}
                    className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all hover:scale-[1.02]"
                    style={{
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      border: '2px solid rgba(239, 68, 68, 0.5)',
                      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                    }}>
                    🔄 RESETEAR TORNEO (Volver a DRAFT)
                  </button>
                  <p className="text-center text-slate-400 text-xs mt-2">
                    Útil para testing: elimina matches y permite regenerar bracket
                  </p>
                </div>
              )}
              
              {/* Botones de Admin para Regenerar e Iniciar */}
              {session?.user?.role === 'ADMIN' && tournamentStatus !== 'IN_PROGRESS' && tournamentStatus !== 'COMPLETED' && (
                <div className="mt-6 max-w-2xl mx-auto space-y-4">
                  {/* Botón Regenerar */}
                  <button
                    onClick={handleGenerateBracket}
                    disabled={generating || players.length < 2}
                    className="w-full py-3 rounded-xl font-black text-white text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] hover:shadow-2xl"
                    style={{
                      background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)',
                      border: '2px solid rgba(220, 20, 60, 0.5)',
                      boxShadow: '0 4px 20px rgba(220, 20, 60, 0.3)'
                    }}>
                    {generating ? (
                      <span className="flex items-center justify-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Regenerando Bracket...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-3">
                        <Sparkles className="w-5 h-5" />
                        REGENERAR BRACKET
                        <Sparkles className="w-5 h-5" />
                      </span>
                    )}
                  </button>
                  
                  {/* Mensaje informativo */}
                  <p className="text-center text-yellow-400 text-sm font-medium flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" />
                    Puedes regenerar el bracket las veces que quieras antes de iniciar el torneo
                  </p>
                  
                  {/* Botón Iniciar Torneo */}
                  <button
                    onClick={handleStartTournament}
                    disabled={starting}
                    className="w-full py-4 rounded-xl font-black text-white text-lg transition-all hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: '2px solid rgba(16, 185, 129, 0.5)',
                      boxShadow: '0 8px 30px rgba(16, 185, 129, 0.4)'
                    }}>
                    {starting ? (
                      <span className="flex items-center justify-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Iniciando Torneo...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-3">
                        <Play className="w-5 h-5" />
                        INICIAR TORNEO
                        <Play className="w-5 h-5" />
                      </span>
                    )}
                  </button>
                  <p className="text-center text-slate-400 text-sm">
                    Al iniciar el torneo, los jugadores tendrán 5 minutos para hacer check-in en sus matches
                  </p>
                </div>
              )}
            </div>
            
            {/* Winners Bracket */}
            {renderBracketSection(
              bracket.data.winners,
              'Winners Bracket',
              '💥',
              'linear-gradient(135deg, rgba(220, 20, 60, 0.15) 0%, rgba(255, 215, 0, 0.15) 100%)'
            )}

            {/* Losers Bracket */}
            {renderBracketSection(
              bracket.data.losers,
              'Losers Bracket',
              '⚡',
              'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.15) 100%)'
            )}

            {/* Grand Finals */}
            {bracket.data.grandFinals && (
              <div className="mb-8">
                <div className="mb-6 p-6 rounded-xl" 
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(220, 20, 60, 0.2) 100%)',
                    border: '2px solid rgba(220, 20, 60, 0.3)'
                  }}>
                  <h3 className="text-2xl font-black text-white flex items-center gap-3">
                    <span className="text-3xl">🏆</span>
                    Grand Finals
                  </h3>
                </div>
                {renderMatch(bracket.data.grandFinals, 0, [bracket.data.grandFinals])}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Match Modal */}
      {selectedMatch && (
        <MatchModal
          match={selectedMatch}
          tournamentId={params.id}
          onClose={() => setSelectedMatch(null)}
          onUpdate={() => {
            loadMatches();
            setSelectedMatch(null);
          }}
        />
      )}
    </div>
  );
}
