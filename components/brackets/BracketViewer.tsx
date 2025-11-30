'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface Match {
  id: string;
  round: number;
  matchNumber: number;
  bracketType: string;
  player1: any;
  player2: any;
  player1Score: number;
  player2Score: number;
  winner: any;
  status: string;
}

interface BracketViewerProps {
  tournamentId: string;
  isAdmin: boolean;
}

export default function BracketViewer({ tournamentId, isAdmin }: BracketViewerProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [activeTab, setActiveTab] = useState<'WINNERS' | 'LOSERS'>('WINNERS');
  const router = useRouter();

  useEffect(() => {
    fetchBracket();
    const interval = setInterval(fetchBracket, 10000); // Actualizar cada 10 segundos
    return () => clearInterval(interval);
  }, [tournamentId]);

  const fetchBracket = async () => {
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/brackets`);
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error('Error al cargar bracket:', error);
    } finally {
      setLoading(false);
    }
  };

  const winnersMatches = matches.filter(m => m.bracketType === 'WINNERS');
  const losersMatches = matches.filter(m => m.bracketType === 'LOSERS');
  const grandsMatch = matches.find(m => m.bracketType === 'GRANDS');

  const getRoundMatches = (round: number, type: 'WINNERS' | 'LOSERS') => {
    return matches.filter(m => m.round === round && m.bracketType === type);
  };

  const maxRound = Math.max(...winnersMatches.map(m => m.round), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="loader"></div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="manga-panel p-8 max-w-md mx-auto">
          <p className="text-2xl font-bold mb-4">Bracket no generado</p>
          <p className="text-gray-600 mb-6">
            El bracket aún no ha sido generado para este torneo.
          </p>
          {isAdmin && (
            <button
              onClick={async () => {
                const res = await fetch(`/api/tournaments/${tournamentId}/brackets/generate`, {
                  method: 'POST',
                });
                if (res.ok) {
                  fetchBracket();
                }
              }}
              className="btn-manga"
            >
              Generar Bracket
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tabs para Winners/Losers */}
      {losersMatches.length > 0 && (
        <div className="flex gap-4 border-b-4 border-black">
          <button
            onClick={() => setActiveTab('WINNERS')}
            className={`px-6 py-3 font-bold text-lg transition-all ${
              activeTab === 'WINNERS'
                ? 'bg-black text-white border-4 border-black -mb-1'
                : 'bg-white text-black border-4 border-black border-b-0'
            }`}
          >
            🏆 Winners Bracket
          </button>
          <button
            onClick={() => setActiveTab('LOSERS')}
            className={`px-6 py-3 font-bold text-lg transition-all ${
              activeTab === 'LOSERS'
                ? 'bg-black text-white border-4 border-black -mb-1'
                : 'bg-white text-black border-4 border-black border-b-0'
            }`}
          >
            💀 Losers Bracket
          </button>
        </div>
      )}

      {/* Bracket Display */}
      <div className="overflow-x-auto pb-8">
        <div className="inline-flex gap-8 min-w-full">
          {Array.from({ length: maxRound }, (_, i) => i + 1).map((round) => {
            const roundMatches = getRoundMatches(round, activeTab);
            if (roundMatches.length === 0) return null;

            return (
              <div key={round} className="flex flex-col gap-6 min-w-[300px]">
                <h3 className="text-xl font-bold text-center mb-4 border-b-4 border-black pb-2">
                  {getRoundName(round, maxRound)}
                </h3>
                {roundMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onClick={() => setSelectedMatch(match)}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Grand Finals */}
      {grandsMatch && activeTab === 'WINNERS' && (
        <div className="mt-12 border-t-4 border-black pt-8">
          <h2 className="text-3xl font-bold text-center mb-8">
            ⭐ GRAN FINAL ⭐
          </h2>
          <div className="max-w-2xl mx-auto">
            <MatchCard
              match={grandsMatch}
              onClick={() => setSelectedMatch(grandsMatch)}
              isAdmin={isAdmin}
              isGrandFinal
            />
          </div>
        </div>
      )}

      {/* Match Detail Modal */}
      {selectedMatch && (
        <MatchDetailModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onUpdate={fetchBracket}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}

function MatchCard({ match, onClick, isAdmin, isGrandFinal = false }: any) {
  const getStatusColor = () => {
    if (match.status === 'COMPLETED') return 'bg-white';
    if (match.status === 'ONGOING') return 'bg-gray-100';
    return 'bg-white';
  };

  const getPlayerDisplay = (player: any, isWinner: boolean) => {
    if (!player) return 'TBD';
    
    return (
      <div className={`flex items-center gap-3 ${isWinner ? 'font-black' : ''}`}>
        {player.participants?.[0]?.character && (
          <span className="text-2xl">
            {getCharacterEmoji(player.participants[0].character.name)}
          </span>
        )}
        <span className={isWinner ? 'text-lg' : ''}>{player.username}</span>
      </div>
    );
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, x: 2, y: 2 }}
      className={`${getStatusColor()} border-4 border-black p-4 cursor-pointer transition-all ${
        isGrandFinal ? 'border-8' : ''
      }`}
      style={{
        boxShadow: '6px 6px 0px 0px rgba(0, 0, 0, 1)',
      }}
      onClick={onClick}
    >
      <div className="space-y-3">
        {/* Player 1 */}
        <div className={`flex items-center justify-between p-3 border-2 border-black ${
          match.winnerId === match.player1?.id ? 'bg-black text-white' : 'bg-white'
        }`}>
          {getPlayerDisplay(match.player1, match.winnerId === match.player1?.id)}
          <span className="text-2xl font-bold">{match.player1Score}</span>
        </div>

        {/* VS Divider */}
        <div className="text-center font-bold text-sm border-t-2 border-b-2 border-black py-1">
          VS
        </div>

        {/* Player 2 */}
        <div className={`flex items-center justify-between p-3 border-2 border-black ${
          match.winnerId === match.player2?.id ? 'bg-black text-white' : 'bg-white'
        }`}>
          {getPlayerDisplay(match.player2, match.winnerId === match.player2?.id)}
          <span className="text-2xl font-bold">{match.player2Score}</span>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mt-3 text-center">
        {match.status === 'COMPLETED' && (
          <span className="inline-block bg-black text-white px-3 py-1 text-xs font-bold">
            ✓ COMPLETADO
          </span>
        )}
        {match.status === 'ONGOING' && (
          <span className="inline-block bg-white border-2 border-black px-3 py-1 text-xs font-bold animate-pulse">
            ⚡ EN VIVO
          </span>
        )}
        {match.status === 'PENDING' && match.player1 && match.player2 && (
          <span className="inline-block bg-white border-2 border-black px-3 py-1 text-xs font-bold">
            ⏳ PENDIENTE
          </span>
        )}
      </div>
    </motion.div>
  );
}

function MatchDetailModal({ match, onClose, onUpdate, isAdmin }: any) {
  const [player1Score, setPlayer1Score] = useState(match.player1Score);
  const [player2Score, setPlayer2Score] = useState(match.player2Score);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (winnerId: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tournaments/${match.tournamentId}/matches/${match.id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          winnerId,
          player1Score,
          player2Score,
        }),
      });

      if (res.ok) {
        onUpdate();
        onClose();
      }
    } catch (error) {
      console.error('Error al reportar resultado:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white border-8 border-black p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: '12px 12px 0px 0px rgba(0, 0, 0, 1)' }}
      >
        <h2 className="text-3xl font-bold mb-6 border-b-4 border-black pb-4">
          Detalle del Match
        </h2>

        <div className="space-y-6">
          {/* Player 1 */}
          <div className="border-4 border-black p-6">
            <h3 className="text-xl font-bold mb-4">{match.player1?.username || 'TBD'}</h3>
            {match.status !== 'COMPLETED' && isAdmin && (
              <div className="flex items-center gap-4 mb-4">
                <label className="font-bold">Score:</label>
                <input
                  type="number"
                  min="0"
                  value={player1Score}
                  onChange={(e) => setPlayer1Score(parseInt(e.target.value))}
                  className="border-4 border-black px-4 py-2 w-24 text-2xl font-bold text-center"
                />
              </div>
            )}
            {match.status === 'COMPLETED' && (
              <p className="text-4xl font-bold">{match.player1Score}</p>
            )}
          </div>

          {/* VS */}
          <div className="text-center text-3xl font-bold">VS</div>

          {/* Player 2 */}
          <div className="border-4 border-black p-6">
            <h3 className="text-xl font-bold mb-4">{match.player2?.username || 'TBD'}</h3>
            {match.status !== 'COMPLETED' && isAdmin && (
              <div className="flex items-center gap-4 mb-4">
                <label className="font-bold">Score:</label>
                <input
                  type="number"
                  min="0"
                  value={player2Score}
                  onChange={(e) => setPlayer2Score(parseInt(e.target.value))}
                  className="border-4 border-black px-4 py-2 w-24 text-2xl font-bold text-center"
                />
              </div>
            )}
            {match.status === 'COMPLETED' && (
              <p className="text-4xl font-bold">{match.player2Score}</p>
            )}
          </div>

          {/* Actions */}
          {match.status !== 'COMPLETED' && isAdmin && match.player1 && match.player2 && (
            <div className="flex gap-4 pt-6 border-t-4 border-black">
              <button
                onClick={() => handleSubmit(match.player1.id)}
                disabled={submitting}
                className="btn-manga flex-1"
              >
                {match.player1.username} Gana
              </button>
              <button
                onClick={() => handleSubmit(match.player2.id)}
                disabled={submitting}
                className="btn-manga flex-1"
              >
                {match.player2.username} Gana
              </button>
            </div>
          )}

          <button onClick={onClose} className="btn-manga-secondary w-full mt-4">
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function getRoundName(round: number, maxRound: number): string {
  const roundsFromEnd = maxRound - round;
  
  switch (roundsFromEnd) {
    case 0: return 'FINAL';
    case 1: return 'SEMIFINAL';
    case 2: return 'CUARTOS';
    default: return `RONDA ${round}`;
  }
}

function getCharacterEmoji(characterName: string): string {
  // Mapeo básico de personajes a emojis
  const emojiMap: Record<string, string> = {
    'Mario': '👨',
    'Luigi': '👨‍🦰',
    'Pikachu': '⚡',
    'Fox': '🦊',
    'Link': '🗡️',
    'Samus': '🤖',
    'Kirby': '💖',
  };
  
  return emojiMap[characterName] || '🎮';
}
