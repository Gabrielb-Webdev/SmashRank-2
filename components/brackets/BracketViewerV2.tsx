/**
 * BracketViewerV2 - NUEVO DISEÑO SIMPLIFICADO
 * Version: 2.0.0
 * Cache-Buster: 20251201-2001
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import MatchFlowModal from '@/components/matches/MatchFlowModal';

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

interface BracketViewerV2Props {
  tournamentId: string;
  isAdmin: boolean;
}

export default function BracketViewerV2({ tournamentId, isAdmin }: BracketViewerV2Props) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [activeTab, setActiveTab] = useState<'WINNERS' | 'LOSERS'>('WINNERS');
  const [tournamentStages, setTournamentStages] = useState<{ starterStages: string[]; counterPickStages: string[] }>({ 
    starterStages: [], 
    counterPickStages: [] 
  });
  const router = useRouter();

  useEffect(() => {
    fetchBracket();
    fetchTournamentData();
    const interval = setInterval(fetchBracket, 10000);
    return () => clearInterval(interval);
  }, [tournamentId]);

  const fetchBracket = async () => {
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/bracket`);
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error('Error al cargar bracket:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTournamentData = async () => {
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}`);
      if (!res.ok) {
        console.error('Error al cargar torneo:', res.status);
        return;
      }
      const data = await res.json();
      if (data && data.tournament) {
        setTournamentStages({
          starterStages: Array.isArray(data.tournament.starterStages) ? data.tournament.starterStages : [],
          counterPickStages: Array.isArray(data.tournament.counterpickStages) ? data.tournament.counterpickStages : [],
        });
      }
    } catch (error) {
      console.error('Error al cargar datos del torneo:', error);
      // Si falla, usar valores por defecto
      setTournamentStages({
        starterStages: [],
        counterPickStages: [],
      });
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
                const res = await fetch(`/api/tournaments/${tournamentId}/bracket`, {
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

      {/* Match Flow Modal */}
      {selectedMatch && (
        <MatchFlowModal
          match={selectedMatch}
          tournamentId={tournamentId}
          tournamentStages={tournamentStages}
          onClose={() => setSelectedMatch(null)}
          onUpdate={fetchBracket}
        />
      )}
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
