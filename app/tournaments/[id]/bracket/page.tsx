"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Trophy, Users, AlertCircle } from 'lucide-react';

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
      } else if (response.status !== 404) {
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
        return;
      }

      await loadBracket();
    } catch (err) {
      console.error('Error:', err);
      setError('Error al generar el bracket');
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

    return (
      <Card key={match.id} className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold">
              Round {match.roundNumber} - Match {match.matchNumber}
            </span>
            {match.score && (
              <span className="text-xs text-muted-foreground">{match.score}</span>
            )}
          </div>
          
          <div className="space-y-2">
            <div className={`flex items-center justify-between p-2 rounded ${
              match.winnerId === match.player1Id ? 'bg-green-100 dark:bg-green-900/20' : 'bg-secondary'
            }`}>
              <div className="flex items-center gap-2">
                {player1 ? (
                  <>
                    {player1.avatar && (
                      <img 
                        src={player1.avatar} 
                        alt={player1.username}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span className="font-medium">{player1.username}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground italic">TBD</span>
                )}
              </div>
              {match.winnerId === match.player1Id && (
                <Trophy className="w-4 h-4 text-yellow-500" />
              )}
            </div>

            <div className={`flex items-center justify-between p-2 rounded ${
              match.winnerId === match.player2Id ? 'bg-green-100 dark:bg-green-900/20' : 'bg-secondary'
            }`}>
              <div className="flex items-center gap-2">
                {player2 ? (
                  <>
                    {player2.avatar && (
                      <img 
                        src={player2.avatar} 
                        alt={player2.username}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span className="font-medium">{player2.username}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground italic">TBD</span>
                )}
              </div>
              {match.winnerId === match.player2Id && (
                <Trophy className="w-4 h-4 text-yellow-500" />
              )}
            </div>
          </div>
        </CardContent>
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
                Ronda {roundNum}
              </h4>
              {roundMatches.map((match, idx) => renderMatch(match, idx))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          ← Volver
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {!bracket ? (
        <Card>
          <CardHeader>
            <CardTitle>Generar Bracket</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>
                  Participantes con check-in: {players.length}
                </span>
              </div>

              {players.length >= 2 ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Al generar el bracket, se asignarán seeds automáticamente basados en:
                  </p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Victorias totales del jugador</li>
                    <li>Ratio de victorias (wins/total)</li>
                    <li>Puntos acumulados</li>
                  </ul>

                  <Button
                    onClick={handleGenerateBracket}
                    disabled={generating}
                    className="w-full"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Trophy className="w-4 h-4 mr-2" />
                        Generar Bracket
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <p className="text-yellow-500">
                    Se necesitan al menos 2 participantes con check-in para generar el bracket.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold">{bracket.tournament.name}</h1>
            <Button
              onClick={handleGenerateBracket}
              disabled={generating}
              variant="outline"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Regenerando...
                </>
              ) : (
                'Regenerar Bracket'
              )}
            </Button>
          </div>

          <div className="mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Participantes:</span>
                    <span className="ml-2 font-semibold">{players.length}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Formato:</span>
                    <span className="ml-2 font-semibold">Doble Eliminación</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {renderBracketSection(bracket.data.winners, '🏆 Winners Bracket')}
          {renderBracketSection(bracket.data.losers, '🎯 Losers Bracket')}
          
          {bracket.data.grandFinals && (
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
