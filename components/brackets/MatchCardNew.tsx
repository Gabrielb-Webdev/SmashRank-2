/**
 * MatchCard Component - Diseño moderno inspirado en start.gg
 * Diseño horizontal compacto y limpio
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
  matchLabel: string;
  onClick?: () => void;
  showProjected?: boolean;
  className?: string;
}

export function MatchCardNew({
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
  const hasBothPlayers = player1 && player2;
  const hasAnyPlayer = player1 || player2;
  
  const player1IsWinner = match.winnerId === player1?.id;
  const player2IsWinner = match.winnerId === player2?.id;
  
  // TBD State
  if (!hasAnyPlayer && !showProjected) return null;
  
  if (!hasAnyPlayer) {
    return (
      <div className={cn('relative w-56', className)}>
        <div className="bg-[#1a1d29] border border-slate-700/40 rounded-md overflow-hidden">
          <div className="h-14 flex items-center justify-center">
            <span className="text-slate-600 text-xs">TBD</span>
          </div>
        </div>
        <MatchBadge label={matchLabel} status="pending" />
      </div>
    );
  }
  
  // Main Match Card
  return (
    <div className={cn('relative w-56', className)} onClick={onClick}>
      <div className={cn(
        'bg-[#1a1d29] border rounded-md overflow-hidden transition-all',
        isCompleted && 'border-emerald-500/30',
        isLive && 'border-yellow-500/50 shadow-lg shadow-yellow-500/10',
        !isCompleted && !isLive && 'border-slate-700/40',
        onClick && 'cursor-pointer hover:border-slate-600 hover:shadow-lg'
      )}>
        {/* Player 1 */}
        <PlayerSlot
          player={player1}
          isWinner={player1IsWinner}
          score={match.player1Score}
          source={match.player1Source}
          showProjected={showProjected}
          isTop
        />
        
        {/* Divider */}
        <div className="h-px bg-slate-700/30" />
        
        {/* Player 2 */}
        <PlayerSlot
          player={player2}
          isWinner={player2IsWinner}
          score={match.player2Score}
          source={match.player2Source}
          showProjected={showProjected}
        />
        
        {/* Live Indicator */}
        {isLive && (
          <div className="absolute top-1 right-1 flex items-center gap-1 bg-red-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            LIVE
          </div>
        )}
      </div>
      
      <MatchBadge 
        label={matchLabel} 
        status={isCompleted ? 'completed' : isLive ? 'live' : 'pending'} 
      />
    </div>
  );
}

// Player Slot Component
interface PlayerSlotProps {
  player?: PlayerInfo | null;
  isWinner: boolean;
  score?: number;
  source?: string;
  isTop?: boolean;
  showProjected?: boolean;
}

function PlayerSlot({ player, isWinner, score, source, isTop, showProjected }: PlayerSlotProps) {
  if (!player) {
    // Determinar qué mostrar según showProjected
    let displayText = 'TBD';
    let textStyle = 'text-slate-600';
    
    if (source === 'BYE') {
      displayText = 'BYE';
      textStyle = 'text-slate-500 italic';
    } else if (showProjected && source) {
      // Mostrar texto proyectado completo (Winner of A, Loser of B, etc.)
      displayText = source;
      textStyle = 'text-slate-500 italic';
    }
    
    return (
      <div className="h-7 px-2 flex items-center bg-[#0f1117]">
        <span className={`text-[11px] truncate ${textStyle}`}>
          {displayText}
        </span>
      </div>
    );
  }
  
  return (
    <div className={cn(
      'h-7 px-2 flex items-center justify-between gap-2',
      isWinner && 'bg-emerald-950/30'
    )}>
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {/* Seed Badge - Circular */}
        {player.seedBadge && (
          <div className={cn(
            'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold',
            player.seed && player.seed <= 4 
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              : player.seed && player.seed <= 8
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : player.seed && player.seed <= 16
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'bg-slate-600/20 text-slate-400 border border-slate-600/30'
          )}>
            {player.seed}
          </div>
        )}
        
        {/* Player Name */}
        <span className={cn(
          'text-xs truncate',
          isWinner ? 'text-white font-semibold' : 'text-slate-400'
        )}>
          {player.username}
        </span>
        
        {/* Winner Check */}
        {isWinner && (
          <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <svg className="w-2.5 h-2.5 text-white" fill="none" strokeWidth="2.5" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Score */}
      {score !== undefined && (
        <span className={cn(
          'text-sm font-bold tabular-nums',
          isWinner ? 'text-emerald-400' : 'text-slate-600'
        )}>
          {score}
        </span>
      )}
    </div>
  );
}

// Match Badge Component
interface MatchBadgeProps {
  label: string;
  status: 'pending' | 'live' | 'completed';
}

function MatchBadge({ label, status }: MatchBadgeProps) {
  return (
    <div className={cn(
      'absolute -left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg',
      status === 'completed' && 'bg-emerald-500 text-white',
      status === 'live' && 'bg-yellow-500 text-black',
      status === 'pending' && 'bg-slate-600 text-slate-300'
    )}>
      {label}
    </div>
  );
}

export default MatchCardNew;
