/**
 * MatchCard Component - Tarjeta de match estilo start.gg
 * Soporta múltiples estados: Completado, Pendiente, En Progreso, TBD
 */

import { cn } from '@/lib/utils';

interface PlayerInfo {
  id: string;
  username: string;
  avatar?: string;
  seed?: number;
  seedBadge?: string;
}

interface MatchCardProps {
  match: {
    id: string;
    bracketType: string;
    roundName: string;
    player1Id?: string;
    player1Source?: string;
    player2Id?: string;
    player2Source?: string;
    player1Score?: number;
    player2Score?: number;
    winnerId?: string;
    status: string;
    isLive?: boolean;
  };
  player1?: PlayerInfo | null;
  player2?: PlayerInfo | null;
  matchLabel: string; // "A", "B", "C", etc.
  onClick?: () => void;
  showProjected?: boolean;
  className?: string;
}

export function MatchCard({
  match,
  player1,
  player2,
  matchLabel,
  onClick,
  showProjected = true,
  className,
}: MatchCardProps) {
  const isCompleted = match.status === 'COMPLETED';
  const isLive = match.status === 'ONGOING' || match.isLive;
  const isPending = match.status === 'PENDING';
  const hasBothPlayers = player1 && player2;
  const hasAnyPlayer = player1 || player2;
  
  // Estado: TBD (sin jugadores definidos)
  if (!hasAnyPlayer && !showProjected) {
    return null; // No mostrar si showProjected está desactivado
  }
  
  if (!hasAnyPlayer) {
    return (
      <div
        className={cn(
          'w-[220px] bg-slate-900/60 border-2 border-dashed border-slate-700 rounded-lg p-3',
          'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <div className="flex items-center justify-center h-20">
          <div className="text-center">
            <div className="text-slate-500 text-sm mb-1">- - - - -</div>
            <div className="text-slate-600 text-xs">To be determined</div>
          </div>
        </div>
        {/* Match ID Badge */}
        <div className="absolute -top-2 -left-2 bg-slate-700 w-7 h-7 rounded-md flex items-center justify-center shadow-lg">
          <span className="text-xs font-bold text-slate-400">{matchLabel}</span>
        </div>
      </div>
    );
  }
  
  // Estado: Un solo jugador (esperando oponente)
  if (!hasBothPlayers) {
    const waitingPlayer = player1 || player2;
    const isPlayer1Waiting = !!player1;
    const emptySlotText = isPlayer1Waiting 
      ? (match.player2Source || 'Por determinar')
      : (match.player1Source || 'Por determinar');
    
    return (
      <div
        onClick={onClick}
        className={cn(
          'relative w-[220px] bg-white dark:bg-slate-900 border-2 rounded-lg overflow-hidden',
          'transition-all duration-200',
          'border-blue-400 dark:border-blue-600',
          onClick && 'cursor-pointer hover:shadow-lg hover:scale-[1.02]',
          className
        )}
      >
        {/* Player Row */}
        {isPlayer1Waiting && (
          <div className="flex items-center justify-between p-2 border-b border-slate-200 dark:border-slate-700">
            <PlayerRow player={waitingPlayer!} isWinner={false} />
          </div>
        )}
        
        {/* Empty Slot */}
        <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 dark:text-blue-400 text-[10px] font-bold">W</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 italic truncate">
              {emptySlotText.replace(/Winner of |Loser of /g, '')}
            </span>
          </div>
        </div>
        
        {!isPlayer1Waiting && waitingPlayer && (
          <div className="flex items-center justify-between p-2 border-t border-slate-200 dark:border-slate-700">
            <PlayerRow player={waitingPlayer} isWinner={false} />
          </div>
        )}
        
        {/* Match ID Badge */}
        <div className="absolute -top-2 -left-2 bg-gradient-to-br from-blue-500 to-blue-600 w-7 h-7 rounded-md flex items-center justify-center shadow-lg">
          <span className="text-xs font-bold text-white">{matchLabel}</span>
        </div>
      </div>
    );
  }
  
  // Estado: Match completo (con ambos jugadores)
  const player1IsWinner = match.winnerId === player1.id;
  const player2IsWinner = match.winnerId === player2.id;
  
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative w-[220px] bg-white dark:bg-slate-900 border-2 rounded-lg overflow-hidden',
        'transition-all duration-200',
        isCompleted && 'border-green-500 dark:border-green-600',
        isLive && 'border-yellow-500 dark:border-yellow-600 shadow-lg shadow-yellow-500/20 animate-pulse',
        isPending && 'border-slate-300 dark:border-slate-700',
        onClick && 'cursor-pointer hover:shadow-lg hover:scale-[1.02]',
        className
      )}
    >
      {/* Player 1 */}
      <div className={cn(
        'flex items-center justify-between p-2 border-b border-slate-200 dark:border-slate-700',
        player1IsWinner && 'bg-green-50 dark:bg-green-950/30'
      )}>
        <PlayerRow 
          player={player1} 
          isWinner={player1IsWinner}
          score={match.player1Score}
        />
      </div>
      
      {/* Player 2 */}
      <div className={cn(
        'flex items-center justify-between p-2',
        player2IsWinner && 'bg-green-50 dark:bg-green-950/30'
      )}>
        <PlayerRow 
          player={player2} 
          isWinner={player2IsWinner}
          score={match.player2Score}
        />
      </div>
      
      {/* Live Badge */}
      {isLive && (
        <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
          <div className="w-2 h-2 bg-white rounded-full" />
          LIVE
        </div>
      )}
      
      {/* Match ID Badge */}
      <div className={cn(
        'absolute -top-2 -left-2 w-7 h-7 rounded-md flex items-center justify-center shadow-lg',
        isCompleted && 'bg-gradient-to-br from-green-500 to-green-600',
        isLive && 'bg-gradient-to-br from-yellow-500 to-yellow-600',
        isPending && 'bg-gradient-to-br from-slate-500 to-slate-600'
      )}>
        <span className="text-xs font-bold text-white">{matchLabel}</span>
      </div>
    </div>
  );
}

/**
 * PlayerRow - Fila de jugador dentro del MatchCard
 */
interface PlayerRowProps {
  player: PlayerInfo;
  isWinner: boolean;
  score?: number;
}

function PlayerRow({ player, isWinner, score }: PlayerRowProps) {
  return (
    <>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Avatar */}
        {player.avatar ? (
          <img
            src={player.avatar}
            alt={player.username}
            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {player.username.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        {/* Name */}
        <span className={cn(
          'text-sm font-medium truncate',
          isWinner ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-400'
        )}>
          {player.username}
        </span>
        
        {/* Seed Badge */}
        {player.seedBadge && (
          <span className={cn(
            'text-xs font-bold px-2 py-0.5 rounded flex-shrink-0',
            player.seed && player.seed <= 4 
              ? 'bg-yellow-400 text-black'
              : player.seed && player.seed <= 8
              ? 'bg-green-600 text-white'
              : player.seed && player.seed <= 16
              ? 'bg-blue-600 text-white'
              : 'bg-slate-600 text-white'
          )}>
            {player.seedBadge}
          </span>
        )}
        
        {/* Winner Checkmark */}
        {isWinner && (
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 ml-auto">
            <span className="text-white text-xs font-bold">✓</span>
          </div>
        )}
      </div>
      
      {/* Score */}
      {score !== undefined && (
        <span className={cn(
          'text-lg font-bold tabular-nums ml-2',
          isWinner ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-600'
        )}>
          {score}
        </span>
      )}
    </>
  );
}

export default MatchCard;
