// Utilidades para generación y manejo de brackets

export interface Player {
  id: string;
  username: string;
  seed: number;
  registrationId: string;
}

export interface Match {
  id: string;
  roundNumber: number;
  matchNumber: number;
  player1Id?: string;
  player2Id?: string;
  winnerId?: string;
  loserId?: string;
  score?: string;
  bracket: 'winners' | 'losers' | 'grand_finals';
}

export interface Bracket {
  winners: Match[];
  losers: Match[];
  grandFinals?: Match;
}

/**
 * Calcula el número de rondas necesarias para N participantes
 */
export function calculateRounds(participants: number): number {
  return Math.ceil(Math.log2(participants));
}

/**
 * Calcula la potencia de 2 más cercana (redondeando hacia arriba)
 */
export function nextPowerOfTwo(n: number): number {
  return Math.pow(2, Math.ceil(Math.log2(n)));
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
 * Ordena los jugadores por su ranking/puntos para asignar seeds
 */
export function assignSeeds(players: any[]): Player[] {
  // Ordenar por:
  // 1. Victorias totales (más victorias = mejor seed)
  // 2. Ratio de victorias (victorias/juegos totales)
  // 3. Puntos totales
  const sorted = [...players].sort((a, b) => {
    const aWinRate = a.user.wins / (a.user.wins + a.user.losses || 1);
    const bWinRate = b.user.wins / (b.user.wins + b.user.losses || 1);
    
    // Primero por victorias
    if (b.user.wins !== a.user.wins) {
      return b.user.wins - a.user.wins;
    }
    
    // Luego por win rate
    if (bWinRate !== aWinRate) {
      return bWinRate - aWinRate;
    }
    
    // Finalmente por puntos
    return b.user.points - a.user.points;
  });
  
  return sorted.map((player, index) => ({
    id: player.userId,
    username: player.user.username,
    seed: index + 1,
    registrationId: player.id,
  }));
}

/**
 * Genera un bracket de double elimination
 */
export function generateDoubleEliminationBracket(players: Player[]): Bracket {
  // Los jugadores ya vienen con seeds asignados
  const bracketSize = nextPowerOfTwo(players.length);
  const seeding = generateSeeding(bracketSize);
  const numByes = bracketSize - players.length; // Cantidad de BYEs necesarios
  
  // Crear array de jugadores según el seeding
  const orderedPlayers: (Player | null)[] = seeding.map(seed => {
    return players.find(p => p.seed === seed) || null;
  });
  
  // Winners Bracket - Primera ronda
  const winnersMatches: Match[] = [];
  const matchesFirstRound = bracketSize / 2;
  
  for (let i = 0; i < matchesFirstRound; i++) {
    const player1 = orderedPlayers[i * 2];
    const player2 = orderedPlayers[i * 2 + 1];
    
    // Si alguno de los jugadores es null (BYE), no creamos el match de primera ronda
    // El jugador con BYE avanza automáticamente
    if (!player1 && !player2) {
      // Ambos slots vacíos, no crear match
      continue;
    } else if (!player1 || !player2) {
      // Un jugador tiene BYE, avanza automáticamente a ronda 2
      // No agregamos match a ronda 1, lo manejamos en ronda 2
      continue;
    }
    
    // Match normal con ambos jugadores
    winnersMatches.push({
      id: `w-r1-m${i + 1}`,
      roundNumber: 1,
      matchNumber: i + 1,
      player1Id: player1?.id,
      player2Id: player2?.id,
      bracket: 'winners',
    });
  }
  
  // Generar rondas subsecuentes del Winners Bracket
  let currentRound = 2;
  let matchesInRound = matchesFirstRound / 2;
  let matchNumberOffset = 0;
  
  // Para ronda 2, necesitamos colocar a los jugadores con BYE
  if (currentRound === 2) {
    for (let i = 0; i < matchesInRound; i++) {
      const slot1Index = i * 2;
      const slot2Index = i * 2 + 1;
      
      // Obtener ganadores de los matches de ronda 1 (o jugadores con BYE)
      const player1FromR1 = orderedPlayers[slot1Index * 2]; // Posible jugador con BYE
      const player2FromR1 = orderedPlayers[slot1Index * 2 + 1]; // Oponente de slot 1
      const player3FromR1 = orderedPlayers[slot2Index * 2]; // Posible jugador con BYE
      const player4FromR1 = orderedPlayers[slot2Index * 2 + 1]; // Oponente de slot 2
      
      // Determinar quién avanza al match de ronda 2
      let player1R2: Player | undefined;
      let player2R2: Player | undefined;
      
      // Slot 1 de ronda 2
      if (!player1FromR1 && player2FromR1) {
        player1R2 = player2FromR1; // BYE, avanza player2
      } else if (player1FromR1 && !player2FromR1) {
        player1R2 = player1FromR1; // BYE, avanza player1
      }
      // Si ambos existen, el ganador vendrá del match de R1
      
      // Slot 2 de ronda 2
      if (!player3FromR1 && player4FromR1) {
        player2R2 = player4FromR1; // BYE, avanza player4
      } else if (player3FromR1 && !player4FromR1) {
        player2R2 = player3FromR1; // BYE, avanza player3
      }
      // Si ambos existen, el ganador vendrá del match de R1
      
      winnersMatches.push({
        id: `w-r${currentRound}-m${i + 1}`,
        roundNumber: currentRound,
        matchNumber: i + 1,
        player1Id: player1R2?.id,
        player2Id: player2R2?.id,
        bracket: 'winners',
      });
    }
    
    currentRound++;
    matchesInRound = Math.floor(matchesInRound / 2);
  }
  
  // Resto de rondas del Winners Bracket
  while (matchesInRound >= 1) {
    for (let i = 0; i < matchesInRound; i++) {
      winnersMatches.push({
        id: `w-r${currentRound}-m${i + 1}`,
        roundNumber: currentRound,
        matchNumber: i + 1,
        bracket: 'winners',
      });
    }
    
    currentRound++;
    matchesInRound = Math.floor(matchesInRound / 2);
  }
  
  // Losers Bracket
  const losersMatches: Match[] = [];
  const totalRounds = calculateRounds(bracketSize);
  
  // El losers bracket tiene (2 * totalRounds - 1) rondas
  for (let round = 1; round < (2 * totalRounds); round++) {
    const matchesInLosersRound = round % 2 === 1 
      ? bracketSize / Math.pow(2, Math.ceil(round / 2) + 1)
      : bracketSize / Math.pow(2, Math.ceil(round / 2) + 1);
    
    for (let i = 0; i < matchesInLosersRound; i++) {
      losersMatches.push({
        id: `l-r${round}-m${i + 1}`,
        roundNumber: round,
        matchNumber: i + 1,
        bracket: 'losers',
      });
    }
  }
  
  // Grand Finals
  const grandFinals: Match = {
    id: 'grand-finals',
    roundNumber: 1,
    matchNumber: 1,
    bracket: 'grand_finals',
  };
  
  return {
    winners: winnersMatches,
    losers: losersMatches,
    grandFinals,
  };
}

/**
 * Actualiza un match con el resultado
 */
export function updateMatchResult(
  bracket: Bracket,
  matchId: string,
  winnerId: string,
  loserId: string,
  score?: string
): Bracket {
  const updatedBracket = { ...bracket };
  
  // Buscar el match en winners
  let match = updatedBracket.winners.find(m => m.id === matchId);
  let isWinnersBracket = true;
  
  if (!match) {
    // Buscar en losers
    match = updatedBracket.losers.find(m => m.id === matchId);
    isWinnersBracket = false;
  }
  
  if (!match) {
    // Grand Finals
    if (updatedBracket.grandFinals?.id === matchId) {
      match = updatedBracket.grandFinals;
    }
  }
  
  if (match) {
    match.winnerId = winnerId;
    match.loserId = loserId;
    match.score = score;
    
    // Avanzar al ganador al siguiente match
    if (isWinnersBracket) {
      const nextMatchNumber = Math.ceil(match.matchNumber / 2);
      const nextMatch = updatedBracket.winners.find(
        m => m.roundNumber === match!.roundNumber + 1 && m.matchNumber === nextMatchNumber
      );
      
      if (nextMatch) {
        if (match.matchNumber % 2 === 1) {
          nextMatch.player1Id = winnerId;
        } else {
          nextMatch.player2Id = winnerId;
        }
      }
      
      // Enviar al perdedor al losers bracket
      const losersRound = (match.roundNumber - 1) * 2 + 1;
      const losersMatch = updatedBracket.losers.find(
        m => m.roundNumber === losersRound
      );
      
      if (losersMatch && !losersMatch.player1Id) {
        losersMatch.player1Id = loserId;
      } else if (losersMatch && !losersMatch.player2Id) {
        losersMatch.player2Id = loserId;
      }
    }
  }
  
  return updatedBracket;
}
