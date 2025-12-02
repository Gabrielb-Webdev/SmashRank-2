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
          {/* Section Header - Diseño profesional */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-red-500/10 rounded-xl blur-xl" />
            <div className="relative px-6 py-5 rounded-xl bg-slate-900/90 border-2 border-yellow-500/30 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-red-500 flex items-center justify-center shadow-xl">
                    <Trophy className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">WINNERS BRACKET</h2>
                    <p className="text-yellow-400 text-xs font-semibold uppercase tracking-wider">Lose → Drop to Losers</p>
                  </div>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {winnersRounds.length} rounds
                </div>
              </div>
            </div>
          </div>
          
          {/* Layout tipo Excel/Tabla */}
          <div className="relative">
            <div className="overflow-x-auto pb-8">
              {/* Fila de Headers (como títulos de columnas de Excel) */}
              <div className="inline-flex gap-16 min-w-min px-4 mb-6">
                {winnersRounds.map((round, index) => (
                  <div key={`header-${round.roundNumber}`} className="flex items-center gap-8">
                    <div className="w-[290px] text-center">
                      <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 rounded-lg shadow-lg">
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">
                          {round.roundName}
                        </h3>
                      </div>
                    </div>
                    
                    {/* Espaciador para la flecha */}
                    {index < winnersRounds.length - 1 && (
                      <div className="w-8" />
                    )}
                  </div>
                ))}
              </div>
              
              {/* Fila de Contenido (matches) */}
              <div className="inline-flex items-center gap-16 min-w-min px-4">
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
                      hideHeader={true}
                    />
                    
                    {/* Arrow Connector */}
                    {index < winnersRounds.length - 1 && (
                      <div className="flex items-center">
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
          {/* Section Header - Diseño profesional */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-xl" />
            <div className="relative px-6 py-5 rounded-xl bg-slate-900/90 border-2 border-blue-500/30 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-xl">
                    <span className="text-white text-2xl">⚡</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">LOSERS BRACKET</h2>
                    <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider">Lose → Elimination</p>
                  </div>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {losersRounds.length} rounds
                </div>
              </div>
            </div>
          </div>
          
          {/* Layout tipo Excel/Tabla */}
          <div className="relative">
            <div className="overflow-x-auto pb-8">
              {/* Fila de Headers (como títulos de columnas de Excel) */}
              <div className="inline-flex gap-16 min-w-min px-4 mb-6">
                {losersRounds.map((round, index) => (
                  <div key={`header-${round.roundNumber}`} className="flex items-center gap-8">
                    <div className="w-[290px] text-center">
                      <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 rounded-lg shadow-lg">
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">
                          {round.roundName}
                        </h3>
                      </div>
                    </div>
                    
                    {/* Espaciador para la flecha */}
                    {index < losersRounds.length - 1 && (
                      <div className="w-8" />
                    )}
                  </div>
                ))}
              </div>
              
              {/* Fila de Contenido (matches) */}
              <div className="inline-flex items-center gap-16 min-w-min px-4">
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
                      hideHeader={true}
                    />
                    
                    {/* Arrow Connector */}
                    {index < losersRounds.length - 1 && (
                      <div className="flex items-center">
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
          {/* Section Header - Diseño épico */}
          <div className="mb-10 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-red-500/20 to-purple-500/20 rounded-2xl blur-2xl animate-pulse" />
            <div className="relative px-8 py-6 rounded-2xl bg-slate-900/95 border-4 border-yellow-500 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-6">
                <Trophy className="w-14 h-14 text-yellow-400 animate-bounce" />
                <div className="text-center">
                  <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-400 to-purple-400 tracking-tight">
                    GRAND FINALS
                  </h2>
                  <p className="text-slate-300 text-sm font-bold uppercase tracking-widest mt-1">
                    Winner Takes All
                  </p>
                </div>
                <Trophy className="w-14 h-14 text-yellow-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
          
          {/* Grand Finals Match */}
          <div className="flex justify-center px-4">
            <div className="inline-block">
              {onMatchClick && (
                <div
                  onClick={() => onMatchClick(grandFinals)}
                  className="cursor-pointer transform hover:scale-105 transition-all duration-300"
                >
                  {/* Card especial de Grand Finals */}
                  <div className="relative w-[400px] bg-slate-900 border-4 border-yellow-500 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-red-500/10 to-purple-500/10" />
                    
                    <div className="relative z-10 p-6 space-y-4">
                      {/* Player 1 */}
                      <div className={cn(
                        'flex items-center justify-between p-4 rounded-xl transition-all',
                        'bg-slate-800/80 backdrop-blur-sm border-3',
                        grandFinals.winnerId === grandFinals.player1Id 
                          ? 'border-emerald-500 shadow-lg shadow-emerald-500/20' 
                          : 'border-slate-700'
                      )}>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className={cn(
                            "text-lg font-bold truncate",
                            grandFinals.winnerId === grandFinals.player1Id ? "text-white" : "text-slate-300"
                          )}>
                            {getPlayerInfo(grandFinals.player1Id)?.username || (
                              <span className="text-slate-500 italic text-base">
                                {showProjected 
                                  ? (grandFinals.player1Source || 'TBD')
                                  : 'TBD'
                                }
                              </span>
                            )}
                          </span>
                          {grandFinals.winnerId === grandFinals.player1Id && (
                            <div className="ml-auto">
                              <Trophy className="w-6 h-6 text-yellow-400 animate-pulse" />
                            </div>
                          )}
                        </div>
                        {grandFinals.player1Score !== undefined && (
                          <div className={cn(
                            "ml-4 w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-black",
                            grandFinals.winnerId === grandFinals.player1Id 
                              ? "bg-emerald-500 text-white" 
                              : "bg-slate-900 text-slate-400"
                          )}>
                            {grandFinals.player1Score}
                          </div>
                        )}
                      </div>
                      
                      {/* VS Divider */}
                      <div className="flex items-center justify-center">
                        <div className="px-6 py-2 bg-gradient-to-r from-yellow-500 via-red-500 to-purple-500 rounded-full shadow-lg">
                          <span className="text-white font-black text-lg tracking-wider">VS</span>
                        </div>
                      </div>
                      
                      {/* Player 2 */}
                      <div className={cn(
                        'flex items-center justify-between p-4 rounded-xl transition-all',
                        'bg-slate-800/80 backdrop-blur-sm border-3',
                        grandFinals.winnerId === grandFinals.player2Id 
                          ? 'border-emerald-500 shadow-lg shadow-emerald-500/20' 
                          : 'border-slate-700'
                      )}>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className={cn(
                            "text-lg font-bold truncate",
                            grandFinals.winnerId === grandFinals.player2Id ? "text-white" : "text-slate-300"
                          )}>
                            {getPlayerInfo(grandFinals.player2Id)?.username || (
                              <span className="text-slate-500 italic text-base">
                                {showProjected 
                                  ? (grandFinals.player2Source || 'TBD')
                                  : 'TBD'
                                }
                              </span>
                            )}
                          </span>
                          {grandFinals.winnerId === grandFinals.player2Id && (
                            <div className="ml-auto">
                              <Trophy className="w-6 h-6 text-yellow-400 animate-pulse" />
                            </div>
                          )}
                        </div>
                        {grandFinals.player2Score !== undefined && (
                          <div className={cn(
                            "ml-4 w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-black",
                            grandFinals.winnerId === grandFinals.player2Id 
                              ? "bg-emerald-500 text-white" 
                              : "bg-slate-900 text-slate-400"
                          )}>
                            {grandFinals.player2Score}
                          </div>
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
