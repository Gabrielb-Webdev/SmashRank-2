/**
 * RoundColumn Component
 * Columna vertical que contiene todos los matches de una ronda
 */

import { MatchCardNew } from './MatchCardNew';

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
  status: string;
  isLive?: boolean;
  scheduledTime?: Date | string;
  streamUrl?: string;
}

interface PlayerInfo {
  id: string;
  username: string;
  avatar?: string;
  seed?: number;
  seedBadge?: string;
}

interface RoundColumnProps {
  roundName: string;
  roundNumber: number;
  matches: Match[];
  matchLabelMap: Map<string, string>;
  getPlayerInfo: (playerId?: string) => PlayerInfo | null;
  onMatchClick?: (match: Match) => void;
  showProjected?: boolean;
  scheduledTime?: Date;
}

export function RoundColumn({
  roundName,
  roundNumber,
  matches,
  matchLabelMap,
  getPlayerInfo,
  onMatchClick,
  showProjected = true,
  scheduledTime,
}: RoundColumnProps) {
  // Ordenar matches por position
  const sortedMatches = [...matches].sort((a, b) => a.position - b.position);
  
  // Calcular espaciado basado en la cantidad de matches (efecto embudo)
  // Más matches = menos espaciado, menos matches = más espaciado
  const matchCount = sortedMatches.length;
  const gapSize = matchCount >= 8 ? 8 : matchCount >= 4 ? 32 : matchCount >= 2 ? 64 : 96;
  
  // Formatear fecha/hora si existe
  const formattedTime = scheduledTime 
    ? new Date(scheduledTime).toLocaleString('es-AR', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      })
    : null;
  
  return (
    <div className="flex flex-col gap-3 min-w-[240px]">
      {/* Round Header */}
      <div className="text-center">
        <div className="inline-flex items-center px-3 py-1 bg-slate-800/50 border border-slate-700/50 rounded-md">
          <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            {roundName}
          </h3>
        </div>
        {formattedTime && (
          <p className="text-[10px] text-slate-600 mt-1">
            {formattedTime}
          </p>
        )}
      </div>
      
      {/* Matches */}
      <div className="flex flex-col justify-center" style={{ gap: `${gapSize}px` }}>
        {sortedMatches.map((match) => {
          const matchLabel = matchLabelMap.get(match.id) || match.id;
          const player1 = getPlayerInfo(match.player1Id);
          const player2 = getPlayerInfo(match.player2Id);
          
          return (
            <MatchCardNew
              key={match.id}
              match={match}
              player1={player1}
              player2={player2}
              matchLabel={matchLabel}
              onClick={() => onMatchClick?.(match)}
              showProjected={showProjected}
            />
          );
        })}
      </div>
    </div>
  );
}

export default RoundColumn;
