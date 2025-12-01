'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

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
    const interval = setInterval(fetchBracket, 10000);
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
    return matches.filter(m => m.round === round && m.bracketType === type)
      .sort((a, b) => a.matchNumber - b.matchNumber);
  };

  const maxRound = Math.max(...winnersMatches.map(m => m.round), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="spinner border-4 border-slate-700 border-t-red-500 w-16 h-16"></div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-20">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card p-8 max-w-md mx-auto"
        >
          <p className="text-2xl font-bold mb-4">Bracket no generado</p>
          <p className="text-slate-400 mb-6">
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
              className="btn-primary"
            >
              Generar Bracket
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tabs */}
      {losersMatches.length > 0 && (
        <div className="flex gap-2 p-1 bg-slate-900/50 rounded-lg border border-slate-800 w-fit">
          <button
            onClick={() => setActiveTab('WINNERS')}
            className={`px-6 py-3 font-bold text-sm rounded-md transition-all duration-300 ${
              activeTab === 'WINNERS'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            🏆 Winners
          </button>
          <button
            onClick={() => setActiveTab('LOSERS')}
            className={`px-6 py-3 font-bold text-sm rounded-md transition-all duration-300 ${
              activeTab === 'LOSERS'
                ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg shadow-slate-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            💀 Losers
          </button>
        </div>
      )}

      {/* Bracket Display - Simplified */}
      <div className="relative">
        <div className="overflow-x-auto pb-8 custom-scrollbar">
          <div className="inline-flex gap-16 p-6">
            {Array.from({ length: maxRound }, (_, i) => i + 1).map((round) => {
              const roundMatches = getRoundMatches(round, activeTab);
              if (roundMatches.length === 0) return null;

              return (
                <div key={round} className="flex flex-col min-w-[280px]">
                  {/* Round Header */}
                  <div className="mb-4 text-center">
                    <div className="inline-block px-4 py-2 bg-red-600 rounded-lg">
                      <h3 className="text-sm font-bold text-white uppercase">
                        {getRoundName(round, maxRound)}
                      </h3>
                    </div>
                  </div>

                  {/* Matches */}
                  <div className="flex flex-col gap-4">
                    {roundMatches.map((match) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        onClick={() => setSelectedMatch(match)}
                        isAdmin={isAdmin}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grand Finals */}
      {grandsMatch && activeTab === 'WINNERS' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 pt-8"
        >
          <div className="text-center mb-8">
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="inline-block"
            >
              <div className="px-8 py-4 bg-gradient-to-r from-yellow-500 via-red-600 to-yellow-500 rounded-xl shadow-2xl shadow-red-500/50">
                <h2 className="text-3xl font-black text-white uppercase tracking-widest">
                  ⭐ GRAN FINAL ⭐
                </h2>
              </div>
            </motion.div>
          </div>
          <div className="max-w-2xl mx-auto grand-finals-container">
            <MatchCard
              match={grandsMatch}
              onClick={() => setSelectedMatch(grandsMatch)}
              isAdmin={isAdmin}
              isGrandFinal
            />
          </div>
        </motion.div>
      )}

      {/* Match Detail Modal */}
      <AnimatePresence>
        {selectedMatch && (
          <MatchDetailModal
            match={selectedMatch}
            onClose={() => setSelectedMatch(null)}
            onUpdate={fetchBracket}
            isAdmin={isAdmin}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MatchCard({ match, onClick, isAdmin, isGrandFinal = false }: any) {
  const player1IsWinner = match.winnerId === match.player1?.id;
  const player2IsWinner = match.winnerId === match.player2?.id;

  return (
    <div
      onClick={onClick}
      className={`bg-slate-900/80 border-2 rounded-xl overflow-hidden cursor-pointer hover:border-red-600 transition-all ${
        isGrandFinal ? 'border-yellow-500' : 'border-slate-700'
      }`}
    >
      {/* Header */}
      <div className="px-3 py-2 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400">Match {match.matchNumber}</span>
        {match.status === 'ONGOING' && (
          <span className="flex items-center gap-1 text-xs font-bold text-red-500">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            LIVE
          </span>
        )}
      </div>

      {/* Players */}
      <div className="p-3 space-y-2">
        {/* Player 1 */}
        <div className={`flex items-center justify-between p-2 rounded ${
          player1IsWinner ? 'bg-red-600' : 'bg-slate-800'
        }`}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {match.player1?.participants?.[0]?.character && (
              <span className="text-xl">
                {getCharacterEmoji(match.player1.participants[0].character.name)}
              </span>
            )}
            <span className={`truncate ${player1IsWinner ? 'font-bold text-white' : 'text-slate-300'}`}>
              {match.player1?.username || 'TBD'}
            </span>
            {player1IsWinner && <span>👑</span>}
          </div>
          <span className={`text-xl font-bold ml-2 ${player1IsWinner ? 'text-white' : 'text-slate-500'}`}>
            {match.player1Score || 0}
          </span>
        </div>

        {/* VS */}
        <div className="text-center text-xs font-bold text-slate-600">VS</div>

        {/* Player 2 */}
        <div className={`flex items-center justify-between p-2 rounded ${
          player2IsWinner ? 'bg-red-600' : 'bg-slate-800'
        }`}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {match.player2?.participants?.[0]?.character && (
              <span className="text-xl">
                {getCharacterEmoji(match.player2.participants[0].character.name)}
              </span>
            )}
            <span className={`truncate ${player2IsWinner ? 'font-bold text-white' : 'text-slate-300'}`}>
              {match.player2?.username || 'TBD'}
            </span>
            {player2IsWinner && <span>👑</span>}
          </div>
          <span className={`text-xl font-bold ml-2 ${player2IsWinner ? 'text-white' : 'text-slate-500'}`}>
            {match.player2Score || 0}
          </span>
        </div>
      </div>

      {/* Footer */}
      {match.status === 'COMPLETED' && (
        <div className="px-3 py-1 bg-slate-800/50 border-t border-slate-700 text-center">
          <span className="text-xs font-bold text-green-500">✓ Completado</span>
        </div>
      )}
      {match.status === 'PENDING' && match.player1 && match.player2 && (
        <div className="px-3 py-1 bg-slate-800/50 border-t border-slate-700 text-center">
          <span className="text-xs font-bold text-yellow-500">⏳ Pendiente</span>
        </div>
      )}
    </div>
  );
}

function MatchDetailModal({ match, onClose, onUpdate, isAdmin }: any) {
  const [player1Score, setPlayer1Score] = useState(match.player1Score || 0);
  const [player2Score, setPlayer2Score] = useState(match.player2Score || 0);
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-slate-900 border-2 border-red-600 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-red-600/30 custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-white mb-2">
              Detalle del Match
            </h2>
            <p className="text-sm text-slate-400">
              {match.bracketType} • Ronda {match.round} • Match {match.matchNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Player 1 Card */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className={`p-6 rounded-xl border-2 ${
              match.winnerId === match.player1?.id
                ? 'bg-gradient-to-br from-red-600/20 to-red-700/10 border-red-600'
                : 'bg-slate-800/50 border-slate-700'
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              {match.player1?.participants?.[0]?.character && (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-4xl shadow-lg">
                  {getCharacterEmoji(match.player1.participants[0].character.name)}
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white">
                  {match.player1?.username || 'TBD'}
                </h3>
                {match.player1?.participants?.[0]?.character && (
                  <p className="text-sm text-slate-400">
                    {match.player1.participants[0].character.name}
                  </p>
                )}
              </div>
              {match.winnerId === match.player1?.id && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.3 }}
                  className="text-5xl"
                >
                  👑
                </motion.div>
              )}
            </div>

            {match.status !== 'COMPLETED' && isAdmin && match.player1 && (
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-300">Puntuación:</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPlayer1Score(Math.max(0, player1Score - 1))}
                    className="w-12 h-12 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-xl transition-all"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={player1Score}
                    onChange={(e) => setPlayer1Score(Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 bg-slate-950 border-2 border-slate-700 focus:border-red-600 rounded-lg px-6 py-3 text-4xl font-black text-center text-white outline-none transition-all"
                  />
                  <button
                    onClick={() => setPlayer1Score(player1Score + 1)}
                    className="w-12 h-12 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-xl transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
            {match.status === 'COMPLETED' && (
              <div className="text-center">
                <p className="text-6xl font-black text-white">{match.player1Score}</p>
                <p className="text-sm text-slate-500 mt-2">Puntos</p>
              </div>
            )}
          </motion.div>

          {/* VS Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-slate-900 px-6 py-2 text-2xl font-black text-red-600 border-2 border-red-600 rounded-full">
                VS
              </span>
            </div>
          </div>

          {/* Player 2 Card */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`p-6 rounded-xl border-2 ${
              match.winnerId === match.player2?.id
                ? 'bg-gradient-to-br from-red-600/20 to-red-700/10 border-red-600'
                : 'bg-slate-800/50 border-slate-700'
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              {match.player2?.participants?.[0]?.character && (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-4xl shadow-lg">
                  {getCharacterEmoji(match.player2.participants[0].character.name)}
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white">
                  {match.player2?.username || 'TBD'}
                </h3>
                {match.player2?.participants?.[0]?.character && (
                  <p className="text-sm text-slate-400">
                    {match.player2.participants[0].character.name}
                  </p>
                )}
              </div>
              {match.winnerId === match.player2?.id && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.3 }}
                  className="text-5xl"
                >
                  👑
                </motion.div>
              )}
            </div>

            {match.status !== 'COMPLETED' && isAdmin && match.player2 && (
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-300">Puntuación:</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPlayer2Score(Math.max(0, player2Score - 1))}
                    className="w-12 h-12 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-xl transition-all"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={player2Score}
                    onChange={(e) => setPlayer2Score(Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 bg-slate-950 border-2 border-slate-700 focus:border-red-600 rounded-lg px-6 py-3 text-4xl font-black text-center text-white outline-none transition-all"
                  />
                  <button
                    onClick={() => setPlayer2Score(player2Score + 1)}
                    className="w-12 h-12 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-xl transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
            {match.status === 'COMPLETED' && (
              <div className="text-center">
                <p className="text-6xl font-black text-white">{match.player2Score}</p>
                <p className="text-sm text-slate-500 mt-2">Puntos</p>
              </div>
            )}
          </motion.div>

          {/* Actions */}
          {match.status !== 'COMPLETED' && isAdmin && match.player1 && match.player2 && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex gap-4 pt-6"
            >
              <button
                onClick={() => handleSubmit(match.player1.id)}
                disabled={submitting}
                className="flex-1 px-6 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:from-slate-700 disabled:to-slate-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              >
                {submitting ? '...' : `${match.player1.username} Gana 🏆`}
              </button>
              <button
                onClick={() => handleSubmit(match.player2.id)}
                disabled={submitting}
                className="flex-1 px-6 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:from-slate-700 disabled:to-slate-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              >
                {submitting ? '...' : `${match.player2.username} Gana 🏆`}
              </button>
            </motion.div>
          )}

          <button 
            onClick={onClose}
            className="w-full px-6 py-3 rounded-xl font-bold text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white transition-all"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </motion.div>
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
