/**
 * RoundColumn Component
 * Columna vertical que contiene todos los matches de una ronda
 */

import { MatchCardV3 } from './MatchCardV3';

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
  
  // Filtrar matches basado en showProjected
  // Si showProjected=false, solo mostrar matches con al menos un jugador
  const visibleMatches = sortedMatches.filter(match => {
    if (showProjected) return true;
    return match.player1Id || match.player2Id;
  });

  // Si no hay matches visibles, no renderizar la columna
  if (visibleMatches.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 min-w-[290px]">
      {/* Round Header - Diseño moderno */}
      <div className="text-center">
        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 rounded-lg shadow-lg">
          <h3 className="text-xs font-black text-white uppercase tracking-widest">
            {roundName}
          </h3>
        </div>
        {formattedTime && (
          <p className="text-[10px] text-slate-500 mt-1.5 font-medium">
            {formattedTime}
          </p>
        )}
      </div>
      
      {/* Matches - Recalcular gap basado en matches VISIBLES */}
      <div className="flex flex-col justify-center" style={{ 
        gap: `${visibleMatches.length >= 8 ? 8 : visibleMatches.length >= 4 ? 32 : visibleMatches.length >= 2 ? 64 : 96}px` 
      }}>
        {visibleMatches.map((match) => {
          const matchLabel = matchLabelMap.get(match.id) || match.id;
          const player1 = getPlayerInfo(match.player1Id);
          const player2 = getPlayerInfo(match.player2Id);
          
          return (
            <MatchCardV3
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
