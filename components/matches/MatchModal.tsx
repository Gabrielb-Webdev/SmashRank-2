'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { X, Clock, Trophy, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface MatchModalProps {
  match: any;
  tournamentId: string;
  onClose: () => void;
  onUpdate: () => void;
}

export default function MatchModal({ match, tournamentId, onClose, onUpdate }: MatchModalProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [currentGame, setCurrentGame] = useState<any>(null);
  const [stages, setStages] = useState<any[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  const isPlayer1 = session?.user?.id === match.player1Id;
  const isPlayer2 = session?.user?.id === match.player2Id;
  const isParticipant = isPlayer1 || isPlayer2;
  const isAdmin = session?.user?.role === 'ADMIN';
  const canInteract = isParticipant || isAdmin;

  useEffect(() => {
    fetchStages();
    fetchCharacters();
    if (match.games && match.games.length > 0) {
      setCurrentGame(match.games[match.currentGame - 1] || match.games[match.games.length - 1]);
    }
  }, [match]);

  useEffect(() => {
    if (match.checkInDeadline && match.status === 'CHECKIN') {
      const interval = setInterval(() => {
        const deadline = new Date(match.checkInDeadline);
        const now = new Date();
        const diff = Math.max(0, deadline.getTime() - now.getTime());
        setTimeRemaining(Math.floor(diff / 1000));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [match]);

  const fetchStages = async () => {
    try {
      const response = await fetch('/api/stages');
      if (response.ok) {
        const data = await response.json();
        setStages(data);
      }
    } catch (error) {
      console.error('Error fetching stages:', error);
    }
  };

  const fetchCharacters = async () => {
    try {
      const response = await fetch('/api/characters');
      if (response.ok) {
        const data = await response.json();
        setCharacters(data);
      }
    } catch (error) {
      console.error('Error fetching characters:', error);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/tournaments/${tournamentId}/matches/${match.id}/checkin`,
        { method: 'POST' }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      toast.success('¡Check-in completado!');
      onUpdate();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBanStage = async (stageId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/tournaments/${tournamentId}/matches/${match.id}/ban-stage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameNumber: match.currentGame,
            stageId,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      toast.success('Stage baneado');
      onUpdate();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStage = async (stageId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/tournaments/${tournamentId}/matches/${match.id}/select-stage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameNumber: match.currentGame,
            stageId,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      toast.success('Stage seleccionado');
      onUpdate();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCharacter = async (characterId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/tournaments/${tournamentId}/matches/${match.id}/select-character`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameNumber: match.currentGame,
            characterId,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      toast.success('Personaje seleccionado');
      onUpdate();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReportResult = async (winnerId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/tournaments/${tournamentId}/matches/${match.id}/report-result`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameNumber: match.currentGame,
            winnerId,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      const result = await response.json();
      if (result.needsConfirmation) {
        toast.success('Resultado reportado. Esperando confirmación del oponente.');
      } else {
        toast.success('¡Resultado confirmado!');
      }
      onUpdate();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAvailableStages = () => {
    if (!currentGame) return stages;
    
    const gameNumber = match.currentGame;
    let availableStages = stages;

    if (gameNumber === 1) {
      // Game 1: Solo starters
      availableStages = stages.filter(s => s.starter);
    } else {
      // Games 2+: Starters + Counterpicks
      availableStages = stages.filter(s => s.starter || s.counterpick);
    }

    // Filtrar baneados
    if (currentGame.bannedStages) {
      availableStages = availableStages.filter(
        s => !currentGame.bannedStages.includes(s.id)
      );
    }

    return availableStages;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{background: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(8px)'}}>
      <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2"
        style={{borderColor: 'rgba(220, 20, 60, 0.4)', boxShadow: '0 20px 60px rgba(220, 20, 60, 0.3)'}}>
        
        {/* Header */}
        <div className="sticky top-0 z-10 p-6 border-b border-slate-700"
          style={{background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.15) 0%, rgba(255, 215, 0, 0.1) 100%)'}}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <Trophy className="w-6 h-6 text-yellow-400" />
                {match.bracketType} - Round {match.round} Match {match.matchNumber}
              </h2>
              <p className="text-slate-400 text-sm mt-1">Best of {match.bestOf}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Status & Timer */}
          {match.status === 'CHECKIN' && timeRemaining > 0 && (
            <div className="p-4 rounded-xl text-center"
              style={{background: 'rgba(239, 68, 68, 0.1)', border: '2px solid rgba(239, 68, 68, 0.3)'}}>
              <div className="flex items-center justify-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-red-400 animate-pulse" />
                <span className="text-2xl font-black text-red-400">{formatTime(timeRemaining)}</span>
              </div>
              <p className="text-sm text-slate-400">Tiempo restante para check-in</p>
            </div>
          )}

          {/* Players */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl"
              style={{
                background: isPlayer1 || match.winnerId === match.player1Id
                  ? 'rgba(220, 20, 60, 0.15)'
                  : 'rgba(30, 41, 59, 0.5)',
                border: `2px solid ${match.winnerId === match.player1Id ? 'rgba(34, 197, 94, 0.4)' : 'rgba(220, 20, 60, 0.3)'}`,
              }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold text-white"
                  style={{background: 'linear-gradient(135deg, #dc143c 0%, #ff6b6b 100%)'}}>
                  {match.player1?.username?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-bold text-white">{match.player1?.username || 'TBD'}</p>
                  {match.player1CheckIn && (
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Check-in ✓
                    </p>
                  )}
                </div>
              </div>
              {match.winnerId === match.player1Id && (
                <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                  <Trophy className="w-4 h-4" />
                  GANADOR
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl"
              style={{
                background: isPlayer2 || match.winnerId === match.player2Id
                  ? 'rgba(59, 130, 246, 0.15)'
                  : 'rgba(30, 41, 59, 0.5)',
                border: `2px solid ${match.winnerId === match.player2Id ? 'rgba(34, 197, 94, 0.4)' : 'rgba(59, 130, 246, 0.3)'}`,
              }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold text-white"
                  style={{background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'}}>
                  {match.player2?.username?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-bold text-white">{match.player2?.username || 'TBD'}</p>
                  {match.player2CheckIn && (
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Check-in ✓
                    </p>
                  )}
                </div>
              </div>
              {match.winnerId === match.player2Id && (
                <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                  <Trophy className="w-4 h-4" />
                  GANADOR
                </div>
              )}
            </div>
          </div>

          {/* Check-in Button */}
          {match.status === 'CHECKIN' && isParticipant && (
            <div>
              {(isPlayer1 && !match.player1CheckIn) || (isPlayer2 && !match.player2CheckIn) ? (
                <button
                  onClick={handleCheckIn}
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-black text-white text-lg transition-all hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)',
                    boxShadow: '0 8px 30px rgba(220, 20, 60, 0.4)',
                  }}>
                  {loading ? 'Procesando...' : '✓ HACER CHECK-IN'}
                </button>
              ) : (
                <div className="p-4 rounded-xl text-center"
                  style={{background: 'rgba(34, 197, 94, 0.1)', border: '2px solid rgba(34, 197, 94, 0.3)'}}>
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-green-400 font-bold">Check-in completado</p>
                  <p className="text-sm text-slate-400 mt-1">Esperando al oponente...</p>
                </div>
              )}
            </div>
          )}

          {/* Game Content */}
          {currentGame && canInteract && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg" style={{background: 'rgba(220, 20, 60, 0.1)', border: '1px solid rgba(220, 20, 60, 0.3)'}}>
                <h3 className="font-bold text-white mb-2">Game {match.currentGame} - {currentGame.status}</h3>
              </div>

              {/* Stage Banning */}
              {currentGame.status === 'BANNING' && (
                <div>
                  <h4 className="font-bold text-white mb-3">Banear Stages ({currentGame.bannedStages?.length || 0})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {getAvailableStages().map((stage) => (
                      <button
                        key={stage.id}
                        onClick={() => handleBanStage(stage.id)}
                        disabled={loading || currentGame.bannedStages?.includes(stage.id)}
                        className="p-3 rounded-lg border-2 transition-all hover:scale-105 disabled:opacity-50"
                        style={{
                          background: 'rgba(30, 41, 59, 0.5)',
                          borderColor: currentGame.bannedStages?.includes(stage.id)
                            ? 'rgba(239, 68, 68, 0.5)'
                            : 'rgba(100, 116, 139, 0.3)',
                        }}>
                        <p className="font-bold text-white text-sm">{stage.name}</p>
                        {currentGame.bannedStages?.includes(stage.id) && (
                          <p className="text-xs text-red-400 mt-1">BANEADO</p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stage Selection */}
              {currentGame.status === 'STAGE_SELECT' && (
                <div>
                  <h4 className="font-bold text-white mb-3">Seleccionar Stage</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {getAvailableStages().map((stage) => (
                      <button
                        key={stage.id}
                        onClick={() => handleSelectStage(stage.id)}
                        disabled={loading}
                        className="p-3 rounded-lg border-2 transition-all hover:scale-105"
                        style={{
                          background: 'rgba(34, 197, 94, 0.1)',
                          borderColor: 'rgba(34, 197, 94, 0.4)',
                        }}>
                        <p className="font-bold text-white text-sm">{stage.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Character Selection */}
              {currentGame.status === 'CHAR_SELECT' && (
                <div>
                  <h4 className="font-bold text-white mb-3">Seleccionar Personaje</h4>
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-96 overflow-y-auto p-2">
                    {characters.map((char) => (
                      <button
                        key={char.id}
                        onClick={() => handleSelectCharacter(char.id)}
                        disabled={loading}
                        className="p-2 rounded-lg border-2 transition-all hover:scale-105 hover:shadow-lg hover:border-[#dc143c]"
                        style={{
                          background: 'rgba(30, 41, 59, 0.8)',
                          borderColor: 'rgba(100, 116, 139, 0.5)',
                        }}>
                        <img 
                          src={`/iconos/Icons/${char.name}.png`}
                          alt={char.name}
                          className="w-full h-auto mb-1 rounded"
                          onError={(e) => {
                            // Fallback si la imagen no carga
                            const img = e.target as HTMLImageElement;
                            img.style.display = 'none';
                          }}
                        />
                        <p className="font-bold text-white text-[10px] truncate">{char.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Report Result */}
              {(currentGame.status === 'PLAYING' || currentGame.status === 'REPORTING') && (
                <div>
                  <h4 className="font-bold text-white mb-3">Reportar Resultado</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleReportResult(match.player1Id)}
                      disabled={loading}
                      className="py-4 rounded-xl font-bold text-white transition-all hover:scale-105"
                      style={{
                        background: 'linear-gradient(135deg, #dc143c 0%, #ff6b6b 100%)',
                        boxShadow: '0 4px 15px rgba(220, 20, 60, 0.4)',
                      }}>
                      {match.player1?.username} ganó
                    </button>
                    <button
                      onClick={() => handleReportResult(match.player2Id)}
                      disabled={loading}
                      className="py-4 rounded-xl font-bold text-white transition-all hover:scale-105"
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                      }}>
                      {match.player2?.username} ganó
                    </button>
                  </div>
                  {currentGame.reportedBy && !currentGame.confirmedBy && (
                    <div className="mt-3 p-3 rounded-lg text-center"
                      style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)'}}>
                      <p className="text-yellow-400 text-sm">Esperando confirmación del oponente...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Match History */}
          {match.games && match.games.length > 0 && (
            <div>
              <h4 className="font-bold text-white mb-3">Historial de Games</h4>
              <div className="space-y-2">
                {match.games.map((game: any) => {
                  const p1Character = characters.find(c => c.id === game.player1Character);
                  const p2Character = characters.find(c => c.id === game.player2Character);
                  const selectedStage = stages.find(s => s.id === game.selectedStage);
                  
                  return (
                    <div key={game.id} className="p-3 rounded-lg"
                      style={{background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(100, 116, 139, 0.3)'}}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-bold">Game {game.gameNumber}</span>
                        {game.winnerId && (
                          <span className="text-green-400 text-sm flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            {game.winnerId === match.player1Id ? match.player1?.username : match.player2?.username}
                          </span>
                        )}
                      </div>
                      
                      {/* Characters */}
                      <div className="flex items-center gap-3 mb-2">
                        {p1Character && (
                          <div className="flex items-center gap-2">
                            <img 
                              src={`/iconos/Icons/${p1Character.name}.png`}
                              alt={p1Character.name}
                              className="w-8 h-8 rounded"
                            />
                            <span className="text-xs text-slate-300">{p1Character.name}</span>
                          </div>
                        )}
                        <span className="text-slate-500 text-xs">vs</span>
                        {p2Character && (
                          <div className="flex items-center gap-2">
                            <img 
                              src={`/iconos/Icons/${p2Character.name}.png`}
                              alt={p2Character.name}
                              className="w-8 h-8 rounded"
                            />
                            <span className="text-xs text-slate-300">{p2Character.name}</span>
                          </div>
                        )}
                      </div>
                      
                      {selectedStage && (
                        <p className="text-slate-400 text-xs">📍 {selectedStage.name}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Admin only: View all matches */}
          {!canInteract && (
            <div className="p-4 rounded-lg text-center"
              style={{background: 'rgba(100, 116, 139, 0.1)', border: '1px solid rgba(100, 116, 139, 0.3)'}}>
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-400">Solo los participantes pueden interactuar con este match</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
