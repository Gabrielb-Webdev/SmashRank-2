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
  const renderBracketSection = (matches: Match[], title: string, icon: string, gradient: string) => {
    if (!matches || matches.length === 0) return null;

    // Agrupar por ronda
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
  };            ? '2px solid rgba(34, 197, 94, 0.4)' 
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
  };    </CardContent>
      </Card>
    );
  };

  const renderBracketSection = (matches: Match[], title: string) => {
    if (!matches || matches.length === 0) return null;

    // Agrupar por ronda
    const rounds = matches.reduce((acc, match) => {
      if (!acc[match.roundNumber]) {
        acc[match.roundNumber] = [];
      }
      acc[match.roundNumber].push(match);
      return acc;
    }, {} as Record<number, Match[]>);

    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(rounds).map(([roundNum, roundMatches]) => (
            <div key={roundNum}>
              <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" 
        style={{background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a0a 100%)'}}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)', animation: 'pulse 2s infinite'}}>
            <Trophy className="w-8 h-8 text-white animate-bounce" />
          </div>
          <p className="text-white font-bold">Cargando bracket...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a0a 100%)'}}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105"
            style={{background: 'rgba(220, 20, 60, 0.2)', border: '2px solid rgba(220, 20, 60, 0.4)'}}
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg flex items-center gap-3 animate-shake"
            style={{background: 'rgba(239, 68, 68, 0.1)', border: '2px solid rgba(239, 68, 68, 0.3)'}}>
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-red-400 font-semibold">{error}</p>
          </div>
        )}

        {!bracket ? (
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="relative mb-8 p-8 rounded-2xl overflow-hidden"
              style={{background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.15) 0%, rgba(255, 215, 0, 0.1) 100%)', border: '2px solid rgba(220, 20, 60, 0.3)'}}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-500/20 to-transparent rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-yellow-500/20 to-transparent rounded-full blur-3xl"></div>
              
              <div className="relative z-10 text-center">
                <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                  style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)', boxShadow: '0 10px 30px rgba(220, 20, 60, 0.5)'}}>
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-5xl font-black text-white mb-4" 
                  style={{textShadow: '0 2px 10px rgba(0,0,0,0.5)'}}>
                  Generar Bracket
                </h1>
                <p className="text-slate-300 text-lg">
                  Prepara el torneo y crea el sistema de llaves competitivo
                </p>
              </div>
            </div>

            {/* Stats Card */}
            <div className="mb-6 p-6 rounded-xl"
              style={{background: 'rgba(15, 23, 42, 0.6)', border: '2px solid rgba(220, 20, 60, 0.3)'}}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'}}>
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 font-semibold">Participantes con Check-in</p>
                    <p className="text-3xl font-black text-white">{players.length}</p>
                  </div>
                </div>
                {players.length >= 2 && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full"
                    style={{background: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.4)'}}>
                    <Sparkles className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-bold text-sm">¡Listo para generar!</span>
                  </div>
                )}
              </div>
            </div>

            {players.length >= 2 ? (
              <>
                {/* Info Card */}
                <div className="mb-6 p-6 rounded-xl"
                  style={{background: 'rgba(15, 23, 42, 0.6)', border: '2px solid rgba(255, 215, 0, 0.3)'}}>
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-yellow-400" />
                    Sistema de Seeding Automático
                  </h3>
                  <p className="text-slate-300 mb-4">
                    Los seeds se asignarán automáticamente basados en el rendimiento de cada jugador:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg"
                      style={{background: 'rgba(220, 20, 60, 0.1)', border: '1px solid rgba(220, 20, 60, 0.3)'}}>
                      <div className="text-2xl mb-2">🏆</div>
                      <p className="text-sm font-bold text-white">Victorias Totales</p>
                      <p className="text-xs text-slate-400 mt-1">Mayor cantidad de wins</p>
                    </div>
                    <div className="p-4 rounded-lg"
                      style={{background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)'}}>
                      <div className="text-2xl mb-2">📊</div>
                      <p className="text-sm font-bold text-white">Ratio de Victorias</p>
                      <p className="text-xs text-slate-400 mt-1">Wins / Total de partidas</p>
                    </div>
                    <div className="p-4 rounded-lg"
                      style={{background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)'}}>
                      <div className="text-2xl mb-2">⭐</div>
                      <p className="text-sm font-bold text-white">Puntos Acumulados</p>
                      <p className="text-xs text-slate-400 mt-1">Ranking de la plataforma</p>
                    </div>
                  </div>
                </div>

                {/* Players List */}
                {players.length > 0 && (
                  <div className="mb-6 p-6 rounded-xl"
                    style={{background: 'rgba(15, 23, 42, 0.6)', border: '2px solid rgba(220, 20, 60, 0.3)'}}>
                    <h3 className="text-white font-bold text-lg mb-4">Participantes Confirmados</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2">
                      {players.map((player: any, idx: number) => (
                        <div key={player.id} className="flex items-center gap-3 p-3 rounded-lg"
                          style={{background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(220, 20, 60, 0.2)'}}>
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white"
                            style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)'}}>
                            #{idx + 1}
                          </div>
                          <div>
                            <p className="font-bold text-white">{player.user.username}</p>
                            <p className="text-xs text-slate-400">
                              {player.user.wins}W - {player.user.losses}L · {player.user.points} pts
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleGenerateBracket}
                  disabled={generating}
                  className="w-full py-4 rounded-xl font-black text-white text-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)', boxShadow: '0 8px 30px rgba(220, 20, 60, 0.5)'}}
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Generando Bracket...
                    </>
                  ) : (
                    <>
                      <Trophy className="w-6 h-6" />
                      Generar Bracket
                      <Sparkles className="w-6 h-6" />
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="p-8 rounded-xl text-center"
                style={{background: 'rgba(234, 179, 8, 0.1)', border: '2px solid rgba(234, 179, 8, 0.4)'}}>
                <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-yellow-500 mb-2">
                  Participantes Insuficientes
                </h3>
                <p className="text-yellow-400">
                  Se necesitan al menos 2 participantes con check-in para generar el bracket.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Tournament Header */}
            <div className="mb-8 p-6 rounded-2xl"
              style={{background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.15) 0%, rgba(255, 215, 0, 0.1) 100%)', border: '2px solid rgba(220, 20, 60, 0.3)'}}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center"
                    style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)', boxShadow: '0 8px 25px rgba(220, 20, 60, 0.5)'}}>
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-black text-white mb-2"
                      style={{textShadow: '0 2px 10px rgba(0,0,0,0.5)'}}>
                      {bracket.tournament.name}
                    </h1>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300 font-semibold">{players.length} participantes</span>
                      </div>
                      <div className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.4)'}}>
                        Doble Eliminación
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleGenerateBracket}
                  disabled={generating}
                  className="px-6 py-3 rounded-lg font-bold text-white transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-2"
                  style={{background: 'rgba(220, 20, 60, 0.3)', border: '2px solid rgba(220, 20, 60, 0.5)'}}
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Regenerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Regenerar Bracket
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Brackets */}
            {renderBracketSection(
              bracket.data.winners, 
              'Winners Bracket', 
              '🏆',
              'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)'
            )}
            {renderBracketSection(
              bracket.data.losers, 
              'Losers Bracket', 
              '🎯',
              'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)'
            )}
            
            {bracket.data.grandFinals && (
              <div className="mb-8">
                <div className="mb-6 p-6 rounded-xl"
                  style={{background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(220, 20, 60, 0.1) 100%)', border: '2px solid rgba(255, 215, 0, 0.4)'}}>
                  <h3 className="text-2xl font-black text-white flex items-center gap-3">
                    <span className="text-3xl">👑</span>
                    Grand Finals
                  </h3>
                </div>
                <div className="max-w-2xl mx-auto">
                  {renderMatch(bracket.data.grandFinals, 0)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}         {bracket.data.grandFinals && (
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">👑 Grand Finals</h3>
              {renderMatch(bracket.data.grandFinals, 0)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
