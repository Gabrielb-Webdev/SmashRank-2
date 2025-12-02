/**
 * MatchCardV3 - Diseño profesional minimalista
 * Estilo inspirado en torneos de esports profesionales
 */

import { cn } from '@/lib/utils';

interface PlayerInfo {
  id: string;
  username: string;
  avatar?: string;
  seed?: number;
  seedBadge?: string;
}

interface MatchCardV3Props {
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

export function MatchCardV3({
  match,
  player1,
  player2,
  matchLabel,
  onClick,
  showProjected = true,
  className,
}: MatchCardV3Props) {
  const isCompleted = match.status === 'COMPLETED';
  const isLive = match.status === 'ONGOING' || match.isLive;
  const hasAnyPlayer = player1 || player2;
  
  // Si no hay jugadores y showProjected está desactivado, NO renderizar nada
  if (!hasAnyPlayer && !showProjected) {
    return null;
  }
  
  const player1IsWinner = match.winnerId === player1?.id;
  const player2IsWinner = match.winnerId === player2?.id;
  
  return (
    <div 
      className={cn('relative group', className)}
      onClick={onClick}
    >
      {/* Match Label - Esquina superior izquierda */}
      <div className="absolute -top-2 -left-2 z-10">
        <div className={cn(
          'w-6 h-6 rounded flex items-center justify-center text-[10px] font-black shadow-md',
          isLive && 'bg-red-500 text-white animate-pulse',
          isCompleted && 'bg-emerald-500 text-white',
          !isLive && !isCompleted && 'bg-slate-700 text-slate-300'
        )}>
          {matchLabel}
        </div>
      </div>

      {/* Main Card */}
      <div className={cn(
        'w-64 bg-slate-900 rounded-lg overflow-hidden transition-all',
        'border-2',
        isLive && 'border-red-500 shadow-lg shadow-red-500/20',
        isCompleted && 'border-emerald-500/50',
        !isLive && !isCompleted && 'border-slate-700',
        onClick && 'cursor-pointer hover:border-slate-500 hover:shadow-xl'
      )}>
        
        {/* Player 1 */}
        <PlayerRow
          player={player1}
          source={match.player1Source}
          score={match.player1Score}
          isWinner={player1IsWinner}
          showProjected={showProjected}
        />
        
        {/* Divider */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
        
        {/* Player 2 */}
        <PlayerRow
          player={player2}
          source={match.player2Source}
          score={match.player2Score}
          isWinner={player2IsWinner}
          showProjected={showProjected}
        />
      </div>

      {/* Live Indicator */}
      {isLive && (
        <div className="absolute -top-1 -right-1 z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
            <div className="relative w-3 h-3 bg-red-500 rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
}

interface PlayerRowProps {
  player?: PlayerInfo | null;
  source?: string;
  score?: number;
  isWinner: boolean;
  showProjected?: boolean;
}

function PlayerRow({ player, source, score, isWinner, showProjected }: PlayerRowProps) {
  if (!player && !showProjected) {
    return null;
  }

  return (
    <div className={cn(
      'flex items-center justify-between px-3 py-2.5',
      isWinner && 'bg-gradient-to-r from-emerald-500/10 to-transparent'
    )}>
      {/* Left: Player Info */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {player ? (
          <>
            {/* Seed */}
            {player.seed && (
              <div className={cn(
                'flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center',
                'text-[11px] font-black border-2',
                player.seed <= 4 && 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
                player.seed > 4 && player.seed <= 8 && 'bg-blue-500/20 border-blue-500 text-blue-400',
                player.seed > 8 && player.seed <= 16 && 'bg-purple-500/20 border-purple-500 text-purple-400',
                player.seed > 16 && 'bg-slate-600/20 border-slate-600 text-slate-400'
              )}>
                {player.seed}
              </div>
            )}
            
            {/* Username */}
            <span className={cn(
              'text-sm font-medium truncate',
              isWinner ? 'text-white font-bold' : 'text-slate-300'
            )}>
              {player.username}
            </span>
            
            {/* Winner Badge */}
            {isWinner && (
              <div className="flex-shrink-0 ml-auto">
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" strokeWidth="3" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              </div>
            )}
          </>
        ) : (
          // Projected Text
          <span className="text-xs text-slate-500 italic truncate">
            {source === 'BYE' ? 'BYE' : source || 'TBD'}
          </span>
        )}
      </div>
      
      {/* Right: Score */}
      {score !== undefined && (
        <div className={cn(
          'flex-shrink-0 ml-3 w-8 h-8 rounded flex items-center justify-center',
          'text-base font-black',
          isWinner ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
        )}>
          {score}
        </div>
      )}
    </div>
  );
}

export default MatchCardV3;
