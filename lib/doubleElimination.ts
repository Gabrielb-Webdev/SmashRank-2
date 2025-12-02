/**
 * Double Elimination Bracket Generator
 * Genera brackets estilo start.gg con Winners, Losers y Grand Finals
 */

export interface Player {
  id: string;
  username: string;
  seed: number;
  registrationId: string;
  avatar?: string;
}

export interface Match {
  id: string;
  tournamentId: string;
  bracketType: 'WINNERS' | 'LOSERS' | 'GRANDS';
  roundName: string; // "Winners Round 1", "Losers Quarter-Final"
  roundNumber: number;
  position: number;
  
  player1Id?: string;
  player1Source?: string; // "Winner of Match #5"
  player2Id?: string;
  player2Source?: string;
  
  player1Score: number;
  player2Score: number;
  winnerId?: string;
  loserId?: string;
  
  status: string; // "PENDING", "ONGOING", "COMPLETED", "DQ"
  scheduledTime?: Date;
  
  nextMatchId?: string;
  nextLoserMatchId?: string;
  previousMatch1Id?: string;
  previousMatch2Id?: string;
  
  streamUrl?: string;
  isLive: boolean;
}

export interface Bracket {
  winners: Match[];
  losers: Match[];
  grandFinals?: Match;
}

/**
 * Calcula la potencia de 2 más cercana (redondeando hacia arriba)
 */
export function nextPowerOfTwo(n: number): number {
  return Math.pow(2, Math.ceil(Math.log2(n)));
}

/**
 * Calcula el número de rondas necesarias
 */
export function calculateRounds(participants: number): number {
  return Math.ceil(Math.log2(participants));
}

/**
 * Genera el seeding óptimo para un bracket
 * Ejemplo para 8 jugadores: [1,8,4,5,2,7,3,6]
 * Esto asegura que los mejores no se enfrenten hasta las finales
 */
export function generateSeeding(numPlayers: number): number[] {
  const bracketSize = nextPowerOfTwo(numPlayers);
  const rounds = calculateRounds(bracketSize);
  
  let seeds = [1, 2];
  
  for (let i = 0; i < rounds - 1; i++) {
    const newSeeds: number[] = [];
    const sum = Math.pow(2, i + 2) + 1;
    
    for (const seed of seeds) {
      newSeeds.push(seed);
      newSeeds.push(sum - seed);
    }
    
    seeds = newSeeds;
  }
  
  return seeds.slice(0, numPlayers);
}

/**
 * Obtiene el nombre de la ronda según el número de ronda y total
 */
function getWinnersRoundName(roundNumber: number, totalRounds: number): string {
  const roundsFromEnd = totalRounds - roundNumber;
  
  if (roundsFromEnd === 0) return 'Winners Final';
  if (roundsFromEnd === 1) return 'Winners Semi-Final';
  if (roundsFromEnd === 2) return 'Winners Quarter-Final';
  return `Winners Round ${roundNumber}`;
}

function getLosersRoundName(roundNumber: number, totalRounds: number): string {
  const roundsFromEnd = totalRounds - roundNumber;
  
  if (roundsFromEnd === 0) return 'Losers Final';
  if (roundsFromEnd === 1) return 'Losers Semi-Final';
  if (roundsFromEnd === 2) return 'Losers Quarter-Final';
  return `Losers Round ${roundNumber}`;
}

/**
 * Genera un bracket de Double Elimination completo
 */
export function generateDoubleEliminationBracket(
  tournamentId: string,
  players: Player[]
): Bracket {
  const bracketSize = nextPowerOfTwo(players.length);
  const totalWinnersRounds = calculateRounds(bracketSize);
  const totalLosersRounds = (totalWinnersRounds * 2) - 1;
  
  // Generar seeding óptimo
  const seeding = generateSeeding(bracketSize);
  
  // Crear array de jugadores según el seeding (con byes si es necesario)
  const orderedPlayers: (Player | null)[] = seeding.map(seed => {
    return players.find(p => p.seed === seed) || null;
  });
  
  const winners: Match[] = [];
  const losers: Match[] = [];
  
  // ==================== WINNERS BRACKET ====================
  
  // Round 1 de Winners
  let matchIdCounter = 1;
  const firstRoundMatchCount = bracketSize / 2;
  
  // SIEMPRE crear todos los matches de R1 para mostrar todos los participantes
  for (let i = 0; i < firstRoundMatchCount; i++) {
    const player1 = orderedPlayers[i * 2];
    const player2 = orderedPlayers[i * 2 + 1];
    
    const matchId = `W-R1-M${i + 1}`;
    
    // Determinar el estado del match
    let matchStatus = 'PENDING';
    let winnerId: string | undefined;
    
    // Si solo hay un jugador (el otro es BYE), ese jugador gana automáticamente
    if (player1 && !player2) {
      matchStatus = 'COMPLETED';
      winnerId = player1.id;
    } else if (!player1 && player2) {
      matchStatus = 'COMPLETED';
      winnerId = player2.id;
    }
    
    winners.push({
      id: matchId,
      tournamentId,
      bracketType: 'WINNERS',
      roundName: getWinnersRoundName(1, totalWinnersRounds),
      roundNumber: 1,
      position: i + 1,
      player1Id: player1?.id,
      player1Source: player1 ? undefined : 'BYE',
      player2Id: player2?.id,
      player2Source: player2 ? undefined : 'BYE',
      winnerId,
      player1Score: 0,
      player2Score: 0,
      status: matchStatus,
      isLive: false,
    });
    
    matchIdCounter++;
  }
  
  // Rondas subsecuentes de Winners
  for (let round = 2; round <= totalWinnersRounds; round++) {
    const matchesInRound = Math.pow(2, totalWinnersRounds - round);
    
    for (let matchPos = 0; matchPos < matchesInRound; matchPos++) {
      const matchId = `W-R${round}-M${matchPos + 1}`;
      
      // Determinar qué matches de la ronda anterior alimentan este match
      const prevMatch1Pos = matchPos * 2;
      const prevMatch2Pos = matchPos * 2 + 1;
      const prevMatch1Id = `W-R${round - 1}-M${prevMatch1Pos + 1}`;
      const prevMatch2Id = `W-R${round - 1}-M${prevMatch2Pos + 1}`;
      
      winners.push({
        id: matchId,
        tournamentId,
        bracketType: 'WINNERS',
        roundName: getWinnersRoundName(round, totalWinnersRounds),
        roundNumber: round,
        position: matchPos + 1,
        player1Source: `Winner of ${prevMatch1Id}`,
        player2Source: `Winner of ${prevMatch2Id}`,
        previousMatch1Id: prevMatch1Id,
        previousMatch2Id: prevMatch2Id,
        player1Score: 0,
        player2Score: 0,
        status: 'PENDING',
        isLive: false,
      });
      
      // Actualizar nextMatchId de los matches anteriores
      const prev1 = winners.find(m => m.id === prevMatch1Id);
      const prev2 = winners.find(m => m.id === prevMatch2Id);
      if (prev1) prev1.nextMatchId = matchId;
      if (prev2) prev2.nextMatchId = matchId;
      
      matchIdCounter++;
    }
  }
  
  // ==================== LOSERS BRACKET ====================
  
  // Losers Round 1: Recibe perdedores de Winners R1
  const losersR1MatchCount = firstRoundMatchCount / 2;
  
  for (let i = 0; i < losersR1MatchCount; i++) {
    const matchId = `L-R1-M${i + 1}`;
    
    // Perdedores de dos matches de Winners R1
    const winnersMatch1Id = `W-R1-M${i * 2 + 1}`;
    const winnersMatch2Id = `W-R1-M${i * 2 + 2}`;
    
    losers.push({
      id: matchId,
      tournamentId,
      bracketType: 'LOSERS',
      roundName: getLosersRoundName(1, totalLosersRounds),
      roundNumber: 1,
      position: i + 1,
      player1Source: `Loser of ${winnersMatch1Id}`,
      player2Source: `Loser of ${winnersMatch2Id}`,
      player1Score: 0,
      player2Score: 0,
      status: 'PENDING',
      isLive: false,
    });
    
    // Actualizar nextLoserMatchId en winners
    const wm1 = winners.find(m => m.id === winnersMatch1Id);
    const wm2 = winners.find(m => m.id === winnersMatch2Id);
    if (wm1) wm1.nextLoserMatchId = matchId;
    if (wm2) wm2.nextLoserMatchId = matchId;
    
    matchIdCounter++;
  }
  
  // Resto de rondas de Losers
  // El losers bracket alterna entre:
  // - Rondas impares: perdedores de winners se unen
  // - Rondas pares: ganadores de losers avanzan
  
  for (let round = 2; round <= totalLosersRounds; round++) {
    const isOddRound = round % 2 === 1;
    
    // Calcular cuántos matches hay en esta ronda
    const winnersRoundForDrops = Math.ceil(round / 2) + 1;
    const matchesInRound = Math.pow(2, totalWinnersRounds - winnersRoundForDrops);
    
    for (let matchPos = 0; matchPos < matchesInRound; matchPos++) {
      const matchId = `L-R${round}-M${matchPos + 1}`;
      
      let player1Source: string;
      let player2Source: string;
      
      if (isOddRound) {
        // Ronda impar: Un slot viene de winners (perdedor), otro de losers (ganador)
        const losersMatch = `L-R${round - 1}-M${matchPos + 1}`;
        const winnersMatch = `W-R${winnersRoundForDrops}-M${matchPos + 1}`;
        
        player1Source = `Winner of ${losersMatch}`;
        player2Source = `Loser of ${winnersMatch}`;
        
        // Actualizar referencias
        const lm = losers.find(m => m.id === losersMatch);
        if (lm) lm.nextMatchId = matchId;
        
        const wm = winners.find(m => m.id === winnersMatch);
        if (wm) wm.nextLoserMatchId = matchId;
      } else {
        // Ronda par: Ambos slots vienen de losers
        const prevMatch1 = `L-R${round - 1}-M${matchPos * 2 + 1}`;
        const prevMatch2 = `L-R${round - 1}-M${matchPos * 2 + 2}`;
        
        player1Source = `Winner of ${prevMatch1}`;
        player2Source = `Winner of ${prevMatch2}`;
        
        // Actualizar referencias
        const pm1 = losers.find(m => m.id === prevMatch1);
        const pm2 = losers.find(m => m.id === prevMatch2);
        if (pm1) pm1.nextMatchId = matchId;
        if (pm2) pm2.nextMatchId = matchId;
      }
      
      losers.push({
        id: matchId,
        tournamentId,
        bracketType: 'LOSERS',
        roundName: getLosersRoundName(round, totalLosersRounds),
        roundNumber: round,
        position: matchPos + 1,
        player1Source,
        player2Source,
        player1Score: 0,
        player2Score: 0,
        status: 'PENDING',
        isLive: false,
      });
      
      matchIdCounter++;
    }
  }
  
  // ==================== GRAND FINALS ====================
  
  const winnersFinalist = `W-R${totalWinnersRounds}-M1`;
  const losersFinalist = `L-R${totalLosersRounds}-M1`;
  
  const grandFinals: Match = {
    id: 'GRAND-FINALS',
    tournamentId,
    bracketType: 'GRANDS',
    roundName: 'Grand Finals',
    roundNumber: 1,
    position: 1,
    player1Source: `Winner of ${winnersFinalist}`,
    player2Source: `Winner of ${losersFinalist}`,
    previousMatch1Id: winnersFinalist,
    previousMatch2Id: losersFinalist,
    player1Score: 0,
    player2Score: 0,
    status: 'PENDING',
    isLive: false,
  };
  
  // Actualizar nextMatchId de los finalistas
  const wf = winners.find(m => m.id === winnersFinalist);
  const lf = losers.find(m => m.id === losersFinalist);
  if (wf) wf.nextMatchId = grandFinals.id;
  if (lf) lf.nextMatchId = grandFinals.id;
  
  // ==================== PROPAGAR BYEs ====================
  // Propagar automáticamente los ganadores por BYE a la siguiente ronda
  const allMatches = [...winners, ...losers];
  
  winners.forEach(match => {
    if (match.winnerId && match.nextMatchId) {
      const nextMatch = allMatches.find(m => m.id === match.nextMatchId);
      if (nextMatch) {
        // Determinar en qué slot va el ganador
        if (nextMatch.previousMatch1Id === match.id) {
          nextMatch.player1Id = match.winnerId;
          nextMatch.player1Source = undefined;
        } else if (nextMatch.previousMatch2Id === match.id) {
          nextMatch.player2Id = match.winnerId;
          nextMatch.player2Source = undefined;
        }
      }
    }
  });
  
  return {
    winners,
    losers,
    grandFinals,
  };
}

/**
 * Actualiza un match con el resultado y propaga a matches siguientes
 */
export function propagateMatchResult(
  bracket: Bracket,
  matchId: string,
  winnerId: string,
  loserId: string
): Bracket {
  const updatedBracket = { ...bracket };
  
  // Encontrar el match
  let match = updatedBracket.winners.find(m => m.id === matchId);
  let isWinners = true;
  
  if (!match) {
    match = updatedBracket.losers.find(m => m.id === matchId);
    isWinners = false;
  }
  
  if (!match && updatedBracket.grandFinals?.id === matchId) {
    match = updatedBracket.grandFinals;
  }
  
  if (!match) return bracket;
  
  // Actualizar el match con ganador y perdedor
  match.winnerId = winnerId;
  match.loserId = loserId;
  match.status = 'COMPLETED';
  
  // Propagar ganador al siguiente match
  if (match.nextMatchId) {
    const nextMatch = [...updatedBracket.winners, ...updatedBracket.losers].find(
      m => m.id === match!.nextMatchId
    );
    
    if (nextMatch) {
      // Determinar si el ganador va a slot 1 o slot 2
      if (nextMatch.previousMatch1Id === matchId) {
        nextMatch.player1Id = winnerId;
      } else if (nextMatch.previousMatch2Id === matchId) {
        nextMatch.player2Id = winnerId;
      } else if (nextMatch.player1Source?.includes(matchId)) {
        nextMatch.player1Id = winnerId;
      } else if (nextMatch.player2Source?.includes(matchId)) {
        nextMatch.player2Id = winnerId;
      }
    }
  }
  
  // Propagar perdedor al losers bracket (solo si es Winners bracket)
  if (isWinners && match.nextLoserMatchId) {
    const loserMatch = updatedBracket.losers.find(
      m => m.id === match!.nextLoserMatchId
    );
    
    if (loserMatch) {
      // Determinar slot basado en player2Source (perdedores de winners generalmente van a slot 2)
      if (loserMatch.player2Source?.includes(matchId)) {
        loserMatch.player2Id = loserId;
      } else if (loserMatch.player1Source?.includes(matchId)) {
        loserMatch.player1Id = loserId;
      }
    }
  }
  
  return updatedBracket;
}

/**
 * Ordena jugadores por ranking para asignar seeds
 */
export function assignSeeds(registrations: any[]): Player[] {
  const sorted = [...registrations].sort((a, b) => {
    const aWins = a.user.wins || 0;
    const aLosses = a.user.losses || 0;
    const bWins = b.user.wins || 0;
    const bLosses = b.user.losses || 0;
    
    const aWinRate = aWins / (aWins + aLosses || 1);
    const bWinRate = bWins / (bWins + bLosses || 1);
    
    // Primero por victorias
    if (bWins !== aWins) {
      return bWins - aWins;
    }
    
    // Luego por win rate
    if (bWinRate !== aWinRate) {
      return bWinRate - aWinRate;
    }
    
    // Finalmente por puntos
    return (b.user.points || 0) - (a.user.points || 0);
  });
  
  return sorted.map((reg, index) => ({
    id: reg.user.id,
    username: reg.user.username,
    seed: index + 1,
    registrationId: reg.id,
    avatar: reg.user.avatar,
  }));
}

/**
 * Genera badges de seeding (A1, B2, etc.)
 */
export function generateSeedBadge(seed: number, totalPlayers: number): string {
  // Para torneos pequeños (< 32), usar formato simple
  if (totalPlayers <= 32) {
    return `#${seed}`;
  }
  
  // Para torneos grandes, dividir en pools
  const poolSize = Math.ceil(totalPlayers / 8);
  const poolLetter = String.fromCharCode(65 + Math.floor((seed - 1) / poolSize)); // A, B, C...
  const poolPosition = ((seed - 1) % poolSize) + 1;
  
  return `${poolLetter}${poolPosition}`;
}
