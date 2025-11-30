// Utilidades para generación y gestión de brackets

export type BracketType = 'WINNERS' | 'LOSERS' | 'GRANDS';
export type MatchStatus = 'PENDING' | 'ONGOING' | 'COMPLETED';

export interface BracketMatch {
  id: string;
  tournamentId: string;
  bracketType: BracketType;
  round: number;
  matchNumber: number;
  player1Id: string | null;
  player2Id: string | null;
  player1Score: number;
  player2Score: number;
  winnerId: string | null;
  status: MatchStatus;
  nextMatchId: string | null;
  loserNextMatchId: string | null; // Para double elimination
}

export interface BracketParticipant {
  id: string;
  userId: string;
  seed: number;
  eliminated: boolean;
}

/**
 * Genera un bracket de eliminación simple
 */
export function generateSingleEliminationBracket(
  participants: BracketParticipant[],
  tournamentId: string
): BracketMatch[] {
  const matches: BracketMatch[] = [];
  const participantCount = participants.length;
  
  // Calcular el número de rondas necesarias
  const rounds = Math.ceil(Math.log2(participantCount));
  const totalSlots = Math.pow(2, rounds);
  
  // Calcular byes
  const byes = totalSlots - participantCount;
  
  // Ordenar participantes por seed
  const sortedParticipants = [...participants].sort((a, b) => a.seed - b.seed);
  
  // Primera ronda
  let matchNumber = 1;
  const firstRoundMatches: BracketMatch[] = [];
  
  for (let i = 0; i < totalSlots / 2; i++) {
    const player1Index = i;
    const player2Index = totalSlots - 1 - i;
    
    const player1 = sortedParticipants[player1Index] || null;
    const player2 = sortedParticipants[player2Index] || null;
    
    const match: BracketMatch = {
      id: `${tournamentId}-R1-M${matchNumber}`,
      tournamentId,
      bracketType: 'WINNERS',
      round: 1,
      matchNumber,
      player1Id: player1?.userId || null,
      player2Id: player2?.userId || null,
      player1Score: 0,
      player2Score: 0,
      winnerId: null,
      status: 'PENDING',
      nextMatchId: null,
      loserNextMatchId: null,
    };
    
    // Si hay un bye, marcar el ganador automáticamente
    if (!player2 && player1) {
      match.winnerId = player1.userId;
      match.status = 'COMPLETED';
    }
    
    firstRoundMatches.push(match);
    matchNumber++;
  }
  
  matches.push(...firstRoundMatches);
  
  // Generar rondas subsecuentes
  let previousRoundMatches = firstRoundMatches;
  
  for (let round = 2; round <= rounds; round++) {
    const roundMatches: BracketMatch[] = [];
    matchNumber = 1;
    
    for (let i = 0; i < previousRoundMatches.length / 2; i++) {
      const match: BracketMatch = {
        id: `${tournamentId}-R${round}-M${matchNumber}`,
        tournamentId,
        bracketType: 'WINNERS',
        round,
        matchNumber,
        player1Id: null,
        player2Id: null,
        player1Score: 0,
        player2Score: 0,
        winnerId: null,
        status: 'PENDING',
        nextMatchId: null,
        loserNextMatchId: null,
      };
      
      // Conectar matches de la ronda anterior
      const prevMatch1 = previousRoundMatches[i * 2];
      const prevMatch2 = previousRoundMatches[i * 2 + 1];
      
      if (prevMatch1) prevMatch1.nextMatchId = match.id;
      if (prevMatch2) prevMatch2.nextMatchId = match.id;
      
      roundMatches.push(match);
      matchNumber++;
    }
    
    matches.push(...roundMatches);
    previousRoundMatches = roundMatches;
  }
  
  return matches;
}

/**
 * Genera un bracket de doble eliminación
 */
export function generateDoubleEliminationBracket(
  participants: BracketParticipant[],
  tournamentId: string
): BracketMatch[] {
  const matches: BracketMatch[] = [];
  const participantCount = participants.length;
  
  // Generar bracket de ganadores
  const winnersMatches = generateSingleEliminationBracket(participants, tournamentId);
  
  // Actualizar tipo de bracket
  winnersMatches.forEach(match => {
    match.bracketType = 'WINNERS';
  });
  
  matches.push(...winnersMatches);
  
  // Generar bracket de perdedores
  const rounds = Math.ceil(Math.log2(participantCount));
  const losersRounds = (rounds - 1) * 2;
  
  let losersMatchNumber = 1;
  const losersMatches: BracketMatch[] = [];
  
  // Primera ronda del bracket de perdedores
  for (let i = 0; i < Math.floor(participantCount / 2); i++) {
    const match: BracketMatch = {
      id: `${tournamentId}-L-R1-M${losersMatchNumber}`,
      tournamentId,
      bracketType: 'LOSERS',
      round: 1,
      matchNumber: losersMatchNumber,
      player1Id: null,
      player2Id: null,
      player1Score: 0,
      player2Score: 0,
      winnerId: null,
      status: 'PENDING',
      nextMatchId: null,
      loserNextMatchId: null,
    };
    
    losersMatches.push(match);
    losersMatchNumber++;
  }
  
  // Conectar primera ronda de winners con losers
  winnersMatches
    .filter(m => m.round === 1)
    .forEach((winnerMatch, idx) => {
      const loserMatchIdx = Math.floor(idx / 2);
      if (losersMatches[loserMatchIdx]) {
        winnerMatch.loserNextMatchId = losersMatches[loserMatchIdx].id;
      }
    });
  
  matches.push(...losersMatches);
  
  // Gran Final
  const grandsMatch: BracketMatch = {
    id: `${tournamentId}-GRANDS-M1`,
    tournamentId,
    bracketType: 'GRANDS',
    round: 1,
    matchNumber: 1,
    player1Id: null,
    player2Id: null,
    player1Score: 0,
    player2Score: 0,
    winnerId: null,
    status: 'PENDING',
    nextMatchId: null,
    loserNextMatchId: null,
  };
  
  matches.push(grandsMatch);
  
  return matches;
}

/**
 * Avanza el bracket después de reportar un resultado
 */
export function advanceBracket(
  matches: BracketMatch[],
  completedMatchId: string,
  winnerId: string,
  loserId: string
): BracketMatch[] {
  const updatedMatches = [...matches];
  const completedMatch = updatedMatches.find(m => m.id === completedMatchId);
  
  if (!completedMatch) return updatedMatches;
  
  // Avanzar ganador al siguiente match
  if (completedMatch.nextMatchId) {
    const nextMatch = updatedMatches.find(m => m.id === completedMatch.nextMatchId);
    if (nextMatch) {
      if (!nextMatch.player1Id) {
        nextMatch.player1Id = winnerId;
      } else if (!nextMatch.player2Id) {
        nextMatch.player2Id = winnerId;
      }
    }
  }
  
  // En double elimination, mover perdedor al bracket de perdedores
  if (completedMatch.loserNextMatchId) {
    const loserMatch = updatedMatches.find(m => m.id === completedMatch.loserNextMatchId);
    if (loserMatch) {
      if (!loserMatch.player1Id) {
        loserMatch.player1Id = loserId;
      } else if (!loserMatch.player2Id) {
        loserMatch.player2Id = loserId;
      }
    }
  }
  
  return updatedMatches;
}

/**
 * Calcula el total de matches necesarios
 */
export function calculateTotalMatches(participantCount: number, format: 'SINGLE' | 'DOUBLE'): number {
  if (format === 'SINGLE') {
    return participantCount - 1;
  } else {
    // Double elimination: aproximadamente 2n - 2 matches (puede variar con byes)
    return (participantCount * 2) - 2;
  }
}

/**
 * Obtiene el nombre de la ronda para mostrar
 */
export function getRoundName(round: number, totalRounds: number, bracketType: BracketType): string {
  if (bracketType === 'GRANDS') return 'Gran Final';
  
  if (bracketType === 'LOSERS') {
    return `Perdedores R${round}`;
  }
  
  const roundsFromEnd = totalRounds - round;
  
  switch (roundsFromEnd) {
    case 0: return 'Final';
    case 1: return 'Semifinal';
    case 2: return 'Cuartos de Final';
    default: return `Ronda ${round}`;
  }
}
