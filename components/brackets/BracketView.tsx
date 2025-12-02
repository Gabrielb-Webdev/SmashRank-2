/**
 * BracketView Component
 * Visualización completa del bracket con Winners, Losers y Grand Finals
 * Incluye conectores SVG entre matches
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { RoundColumn } from './RoundColumn';
import { Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  streamUrl?: string;
}

interface PlayerInfo {
  id: string;
  username: string;
  avatar?: string;
  seed?: number;
  seedBadge?: string;
}

interface BracketViewProps {
  winnersMatches: Match[];
  losersMatches: Match[];
  grandFinals?: Match;
  getPlayerInfo: (playerId?: string) => PlayerInfo | null;
  onMatchClick?: (match: Match) => void;
  showProjected?: boolean;
  className?: string;
}

export function BracketView({
  winnersMatches,
  losersMatches,
  grandFinals,
  getPlayerInfo,
  onMatchClick,
  showProjected = true,
  className,
}: BracketViewProps) {
  const [matchLabelMap] = useState(() => {
    const map = new Map<string, string>();
    let counter = 0;
    
    // Generar labels: A, B, C... Z, AA, AB, AC...
    const getLabel = (index: number): string => {
      if (index < 26) {
        return String.fromCharCode(65 + index);
      } else {
        const first = Math.floor(index / 26) - 1;
        const second = index % 26;
        return String.fromCharCode(65 + first) + String.fromCharCode(65 + second);
      }
    };
    
    // Asignar labels a Winners
    winnersMatches
      .sort((a, b) => a.roundNumber - b.roundNumber || a.position - b.position)
      .forEach(match => {
        map.set(match.id, getLabel(counter++));
      });
    
    // Asignar labels a Losers
    losersMatches
      .sort((a, b) => a.roundNumber - b.roundNumber || a.position - b.position)
      .forEach(match => {
        map.set(match.id, getLabel(counter++));
      });
    
    // Grand Finals
    if (grandFinals) {
      map.set(grandFinals.id, getLabel(counter++));
    }
    
    return map;
  });
  
  // Agrupar matches por ronda
  const groupByRound = (matches: Match[]) => {
    const rounds = new Map<number, Match[]>();
    
    matches.forEach(match => {
      if (!rounds.has(match.roundNumber)) {
        rounds.set(match.roundNumber, []);
      }
      rounds.get(match.roundNumber)!.push(match);
    });
    
    return Array.from(rounds.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([roundNumber, matches]) => ({
        roundNumber,
        roundName: matches[0]?.roundName || `Round ${roundNumber}`,
        matches: matches.sort((a, b) => a.position - b.position),
      }));
  };
  
  const winnersRounds = groupByRound(winnersMatches);
  const losersRounds = groupByRound(losersMatches);
  
  return (
    <div className={cn('space-y-12', className)}>
      {/* Winners Bracket */}
      {winnersRounds.length > 0 && (
        <section>
          {/* Section Header */}
          <div className="mb-6 p-6 rounded-xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.1) 0%, rgba(255, 215, 0, 0.1) 100%)',
              border: '2px solid rgba(220, 20, 60, 0.3)'
            }}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏆</span>
              <h2 className="text-2xl font-black text-white">Winners Bracket</h2>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Pierde aquí y caes al Losers Bracket
            </p>
          </div>
          
          {/* Horizontal Scrollable Container */}
          <div className="relative">
            <div className="overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
              <div className="inline-flex items-start gap-16 min-w-min px-4">
                {winnersRounds.map((round, index) => (
                  <div key={round.roundNumber} className="flex items-center gap-8">
                    <RoundColumn
                      roundName={round.roundName}
                      roundNumber={round.roundNumber}
                      matches={round.matches}
                      matchLabelMap={matchLabelMap}
                      getPlayerInfo={getPlayerInfo}
                      onMatchClick={onMatchClick}
                      showProjected={showProjected}
                    />
                    
                    {/* Arrow Connector */}
                    {index < winnersRounds.length - 1 && (
                      <div className="flex items-center self-stretch" style={{ paddingTop: '80px' }}>
                        <ChevronRight className="w-8 h-8 text-slate-600" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Scroll Hint */}
            <div className="absolute top-4 right-4 text-xs text-slate-500 bg-slate-900/80 px-3 py-1.5 rounded-full">
              ← Desliza para ver más →
            </div>
          </div>
        </section>
      )}
      
      {/* Losers Bracket */}
      {losersRounds.length > 0 && (
        <section>
          {/* Section Header */}
          <div className="mb-6 p-6 rounded-xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
              border: '2px solid rgba(59, 130, 246, 0.3)'
            }}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚡</span>
              <h2 className="text-2xl font-black text-white">Losers Bracket</h2>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Pierde aquí y quedas eliminado del torneo
            </p>
          </div>
          
          {/* Horizontal Scrollable Container */}
          <div className="relative">
            <div className="overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
              <div className="inline-flex items-start gap-16 min-w-min px-4">
                {losersRounds.map((round, index) => (
                  <div key={round.roundNumber} className="flex items-center gap-8">
                    <RoundColumn
                      roundName={round.roundName}
                      roundNumber={round.roundNumber}
                      matches={round.matches}
                      matchLabelMap={matchLabelMap}
                      getPlayerInfo={getPlayerInfo}
                      onMatchClick={onMatchClick}
                      showProjected={showProjected}
                    />
                    
                    {/* Arrow Connector */}
                    {index < losersRounds.length - 1 && (
                      <div className="flex items-center self-stretch" style={{ paddingTop: '80px' }}>
                        <ChevronRight className="w-8 h-8 text-slate-600" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Scroll Hint */}
            <div className="absolute top-4 right-4 text-xs text-slate-500 bg-slate-900/80 px-3 py-1.5 rounded-full">
              ← Desliza para ver más →
            </div>
          </div>
        </section>
      )}
      
      {/* Grand Finals */}
      {grandFinals && (
        <section>
          {/* Section Header */}
          <div className="mb-6 p-8 rounded-xl relative overflow-hidden text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(220, 20, 60, 0.2) 100%)',
              border: '3px solid rgba(255, 215, 0, 0.5)',
              boxShadow: '0 8px 30px rgba(255, 215, 0, 0.3)'
            }}>
            <div className="flex items-center justify-center gap-4 mb-2">
              <Trophy className="w-10 h-10 text-yellow-400" />
              <h2 className="text-4xl font-black text-white">GRAND FINALS</h2>
              <Trophy className="w-10 h-10 text-yellow-400" />
            </div>
            <p className="text-slate-300 text-lg">
              Ganador de Winners vs Ganador de Losers
            </p>
          </div>
          
          {/* Grand Finals Match */}
          <div className="flex justify-center px-4">
            <div className="inline-block">
              {onMatchClick && (
                <div
                  onClick={() => onMatchClick(grandFinals)}
                  className="cursor-pointer transform hover:scale-105 transition-transform"
                >
                  {/* Usar MatchCard directamente */}
                  <div className="relative w-[320px] bg-gradient-to-br from-yellow-500/20 to-red-500/20 border-4 border-yellow-500 rounded-xl overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent" />
                    
                    <div className="relative z-10 p-4 space-y-3">
                      {/* Player 1 */}
                      <div className={cn(
                        'flex items-center justify-between p-3 rounded-lg',
                        'bg-slate-900/80 border-2',
                        grandFinals.winnerId === grandFinals.player1Id ? 'border-green-500' : 'border-slate-700'
                      )}>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {getPlayerInfo(grandFinals.player1Id)?.username || (
                            <span className="text-slate-400 italic text-sm">
                              {grandFinals.player1Source?.replace('Winner of ', 'Ganador del ') || 'Por determinar'}
                            </span>
                          )}
                          {grandFinals.winnerId === grandFinals.player1Id && (
                            <Trophy className="w-5 h-5 text-yellow-400 ml-auto" />
                          )}
                        </div>
                        {grandFinals.player1Score !== undefined && (
                          <span className="text-2xl font-black text-white ml-4">
                            {grandFinals.player1Score}
                          </span>
                        )}
                      </div>
                      
                      {/* VS Divider */}
                      <div className="flex items-center justify-center">
                        <div className="px-4 py-1 bg-gradient-to-r from-yellow-500 to-red-500 rounded-full">
                          <span className="text-white font-black text-sm">VS</span>
                        </div>
                      </div>
                      
                      {/* Player 2 */}
                      <div className={cn(
                        'flex items-center justify-between p-3 rounded-lg',
                        'bg-slate-900/80 border-2',
                        grandFinals.winnerId === grandFinals.player2Id ? 'border-green-500' : 'border-slate-700'
                      )}>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {getPlayerInfo(grandFinals.player2Id)?.username || (
                            <span className="text-slate-400 italic text-sm">
                              {grandFinals.player2Source?.replace('Winner of ', 'Ganador del ') || 'Por determinar'}
                            </span>
                          )}
                          {grandFinals.winnerId === grandFinals.player2Id && (
                            <Trophy className="w-5 h-5 text-yellow-400 ml-auto" />
                          )}
                        </div>
                        {grandFinals.player2Score !== undefined && (
                          <span className="text-2xl font-black text-white ml-4">
                            {grandFinals.player2Score}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Match Label */}
                    <div className="absolute -top-3 -left-3 bg-gradient-to-br from-yellow-400 to-yellow-600 w-10 h-10 rounded-lg flex items-center justify-center shadow-2xl border-2 border-yellow-300">
                      <span className="text-sm font-black text-black">
                        {matchLabelMap.get(grandFinals.id) || 'GF'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default BracketView;
