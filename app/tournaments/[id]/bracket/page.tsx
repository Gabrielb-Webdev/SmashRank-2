"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Trophy, Users, AlertCircle, ArrowLeft, Sparkles, Zap, Target } from 'lucide-react';
import toast from 'react-hot-toast';

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
      checkedIn: boolean;
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
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [bracket, setBracket] = useState<BracketData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    loadBracket();
  }, [params.id]);

  const loadBracket = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tournaments/${params.id}/bracket`);
      
      if (response.ok) {
        const data = await response.json();
        setBracket(data);
        setPlayers(data.tournament.registrations.filter((r: any) => r.checkedIn));
      } else if (response.status === 404) {
        // Si el bracket no existe, cargar información del torneo para mostrar participantes
        const tournamentResponse = await fetch(`/api/tournaments/${params.id}`);
        if (tournamentResponse.ok) {
          const tournamentData = await tournamentResponse.json();
          setPlayers(tournamentData.registrations.filter((r: any) => r.checkedIn));
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

  const getPlayerInfo = (playerId: string | undefined) => {
    if (!playerId || !bracket) return null;
    const registration = bracket.tournament.registrations.find(
      r => r.user.id === playerId
    );
    return registration?.user;
  };

  const renderMatch = (match: Match, index: number) => {
    const player1 = getPlayerInfo(match.player1Id);
    const player2 = getPlayerInfo(match.player2Id);
    const hasWinner = !!match.winnerId;

    return (
      <div 
        key={match.id} 
        className="mb-3 p-4 rounded-xl transition-all hover:scale-[1.02]"
        style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '2px solid rgba(220, 20, 60, 0.3)',
          boxShadow: hasWinner ? '0 4px 20px rgba(220, 20, 60, 0.2)' : 'none'
        }}
      >
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
              style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)'}}>
              M{match.matchNumber}
            </div>
            <span className="text-xs text-slate-400 font-semibold">
              Ronda {match.roundNumber}
            </span>
          </div>
          {match.score && (
            <span className="text-xs font-bold px-2 py-1 rounded" 
              style={{background: 'rgba(255, 215, 0, 0.1)', color: '#ffd700'}}>
              {match.score}
            </span>
          )}
        </div>
        
        <div className="space-y-2">
          <div 
            className={`flex items-center justify-between p-3 rounded-lg transition-all ${
              match.winnerId === match.player1Id 
                ? 'ring-2 ring-green-500/50' 
                : ''
            }`}
            style={{
              background: match.winnerId === match.player1Id 
                ? 'rgba(34, 197, 94, 0.15)' 
                : 'rgba(30, 41, 59, 0.5)',
              border: match.winnerId === match.player1Id 
                ? '2px solid rgba(34, 197, 94, 0.4)' 
                : '2px solid rgba(100, 116, 139, 0.3)'
            }}
          >
            <div className="flex items-center gap-3">
              {player1 ? (
                <>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
                    style={{background: 'linear-gradient(135deg, #dc143c 0%, #ff6b6b 100%)', color: 'white'}}>
                    {player1.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-white">{player1.username}</p>
                    <p className="text-xs text-slate-400">
                      {player1.wins}W - {player1.losses}L · {player1.points} pts
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{background: 'rgba(100, 116, 139, 0.2)', border: '2px dashed rgba(100, 116, 139, 0.4)'}}>
                    <span className="text-slate-500">?</span>
                  </div>
                  <span className="text-slate-500 italic font-medium">Por definir</span>
                </div>
              )}
            </div>
            {match.winnerId === match.player1Id && (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full" 
                style={{background: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.4)'}}>
                <Trophy className="w-4 h-4 text-green-400" />
                <span className="text-xs font-bold text-green-400">Ganador</span>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <div className="px-3 py-1 rounded-full text-xs font-bold"
              style={{background: 'rgba(220, 20, 60, 0.1)', color: '#ffd700', border: '1px solid rgba(220, 20, 60, 0.3)'}}>
              VS
            </div>
          </div>

          <div 
            className={`flex items-center justify-between p-3 rounded-lg transition-all ${
              match.winnerId === match.player2Id 
                ? 'ring-2 ring-green-500/50' 
                : ''
            }`}
            style={{
              background: match.winnerId === match.player2Id 
                ? 'rgba(34, 197, 94, 0.15)' 
                : 'rgba(30, 41, 59, 0.5)',
              border: match.winnerId === match.player2Id 
                ? '2px solid rgba(34, 197, 94, 0.4)' 
                : '2px solid rgba(100, 116, 139, 0.3)'
            }}
          >
            <div className="flex items-center gap-3">
              {player2 ? (
                <>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
                    style={{background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', color: 'white'}}>
                    {player2.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-white">{player2.username}</p>
                    <p className="text-xs text-slate-400">
                      {player2.wins}W - {player2.losses}L · {player2.points} pts
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{background: 'rgba(100, 116, 139, 0.2)', border: '2px dashed rgba(100, 116, 139, 0.4)'}}>
                    <span className="text-slate-500">?</span>
                  </div>
                  <span className="text-slate-500 italic font-medium">Por definir</span>
                </div>
              )}
            </div>
            {match.winnerId === match.player2Id && (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full" 
                style={{background: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.4)'}}>
                <Trophy className="w-4 h-4 text-green-400" />
                <span className="text-xs font-bold text-green-400">Ganador</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderBracketSection = (matches: Match[], title: string, icon: string, gradient: string) => {
    if (!matches || matches.length === 0) return null;

    const rounds = matches.reduce((acc, match) => {
      if (!acc[match.roundNumber]) {
        acc[match.roundNumber] = [];
      }
      acc[match.roundNumber].push(match);
      return acc;
    }, {} as Record<number, Match[]>);

    return (
      <div className="mb-8">
        <div className="mb-6 p-6 rounded-xl" 
          style={{background: gradient, border: '2px solid rgba(220, 20, 60, 0.3)'}}>
          <h3 className="text-2xl font-black text-white flex items-center gap-3">
            <span className="text-3xl">{icon}</span>
            {title}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.entries(rounds).map(([roundNum, roundMatches]) => (
            <div key={roundNum} className="space-y-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg"
                style={{background: 'rgba(220, 20, 60, 0.1)', border: '1px solid rgba(220, 20, 60, 0.3)'}}>
                <Zap className="w-4 h-4 text-yellow-400" />
                <h4 className="text-sm font-bold text-white">
                  Ronda {roundNum}
                </h4>
              </div>
              {roundMatches.map((match, idx) => renderMatch(match, idx))}
            </div>
          ))}
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

        {!bracket && (
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

            {/* Generate Button */}
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
                  Generando Bracket...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <Sparkles className="w-5 h-5" />
                  GENERAR BRACKET
                  <Sparkles className="w-5 h-5" />
                </span>
              )}
            </button>

            {players.length < 2 && (
              <p className="text-center text-slate-400 mt-4 font-medium">
                ⚠️ Se necesitan al menos 2 participantes con check-in para generar el bracket
              </p>
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
                {renderMatch(bracket.data.grandFinals, 0)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
