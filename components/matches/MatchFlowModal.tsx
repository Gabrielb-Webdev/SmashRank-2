'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { X, Trophy, MessageCircle, ClipboardList, Eye, Clock, CheckCircle, Ban, User, Map } from 'lucide-react';
import toast from 'react-hot-toast';

interface MatchFlowModalProps {
  match: any;
  tournamentId: string;
  tournamentStages: {
    starterStages: string[]; // IDs de stages para game 1
    counterPickStages: string[]; // IDs de stages para game 2+
  };
  onClose: () => void;
  onUpdate: () => void;
}

type Tab = 'summary' | 'tasks' | 'chat';

export default function MatchFlowModal({ 
  match, 
  tournamentId, 
  tournamentStages,
  onClose, 
  onUpdate 
}: MatchFlowModalProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>('tasks');
  const [loading, setLoading] = useState(false);
  const [stages, setStages] = useState<any[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');

  const isPlayer1 = session?.user?.id === match?.player1?.id;
  const isPlayer2 = session?.user?.id === match?.player2?.id;
  const isAdmin = session?.user?.role === 'ADMIN';
  const canInteract = isPlayer1 || isPlayer2 || isAdmin;

  // Validar que match tenga los datos mínimos
  if (!match || !match.id) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
        <div className="bg-slate-900 rounded-2xl p-8 max-w-md">
          <p className="text-white text-center">Error: Match no válido</p>
          <button onClick={onClose} className="mt-4 w-full py-2 bg-red-600 text-white rounded-lg">Cerrar</button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchStages();
    fetchCharacters();
    loadChatMessages();
    loadMatchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMatchData = async () => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/matches/${match.id}`);
      if (response.ok) {
        const data = await response.json();
        // Actualizar el match con los datos completos incluyendo games
        // Esto se manejará mediante onUpdate() del padre
      }
    } catch (error) {
      console.error('Error loading match data:', error);
    }
  };

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

  const loadChatMessages = () => {
    // TODO: Implementar carga de mensajes desde BD
    setChatMessages([]);
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    
    // TODO: Implementar envío de mensajes a BD
    const newMessage = {
      id: Date.now(),
      userId: session?.user?.id,
      username: session?.user?.username,
      message: chatInput,
      timestamp: new Date(),
      isModerator: isAdmin,
    };
    
    setChatMessages([...chatMessages, newMessage]);
    setChatInput('');
  };

  // Renderizado del tab Summary
  const renderSummary = () => {
    const currentGame = match?.currentGame || 1;
    const games = match?.games || [];
    
    return (
      <div className="space-y-6">
        {/* Score Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-6 rounded-xl text-center ${
            (match?.player1Score || 0) > (match?.player2Score || 0)
              ? 'bg-green-500/20 border-2 border-green-500/50' 
              : 'bg-slate-800/50 border-2 border-slate-700'
          }`}>
            <div className="text-5xl font-black text-white mb-2">{match?.player1Score || 0}</div>
            <div className="text-slate-300 font-semibold">{match?.player1?.username}</div>
            {match?.winnerId === match?.player1?.id && (
              <div className="mt-2 flex items-center justify-center gap-2 text-green-400">
                <Trophy className="w-5 h-5" />
                <span className="font-bold">WINNER</span>
              </div>
            )}
          </div>

          <div className={`p-6 rounded-xl text-center ${
            (match?.player2Score || 0) > (match?.player1Score || 0)
              ? 'bg-green-500/20 border-2 border-green-500/50' 
              : 'bg-slate-800/50 border-2 border-slate-700'
          }`}>
            <div className="text-5xl font-black text-white mb-2">{match?.player2Score || 0}</div>
            <div className="text-slate-300 font-semibold">{match?.player2?.username}</div>
            {match?.winnerId === match?.player2?.id && (
              <div className="mt-2 flex items-center justify-center gap-2 text-green-400">
                <Trophy className="w-5 h-5" />
                <span className="font-bold">WINNER</span>
              </div>
            )}
          </div>
        </div>

        {/* Game History */}
        <div>
          <h3 className="text-lg font-bold text-white mb-3">Game History</h3>
          <div className="space-y-3">
            {games.map((game: any, index: number) => {
              const player1Char = characters.find(c => c.id === game.player1Character);
              const player2Char = characters.find(c => c.id === game.player2Character);
              const stage = stages.find(s => s.id === game.selectedStage);
              
              return (
                <div key={game.id || index} 
                  className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-white">Game {game.gameNumber}</span>
                    {game.winnerId && (
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        game.winnerId === match?.player1?.id 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        Winner: {game.winnerId === match?.player1?.id ? match?.player1?.username : match?.player2?.username}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      {player1Char && (
                        <div className="flex items-center gap-2">
                          <img 
                            src={`/iconos/Icons/${player1Char.name}.png`}
                            alt={player1Char.name}
                            className="w-8 h-8 rounded"
                          />
                          <span className="text-slate-300">{player1Char.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 text-right">
                      {player2Char && (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-slate-300">{player2Char.name}</span>
                          <img 
                            src={`/iconos/Icons/${player2Char.name}.png`}
                            alt={player2Char.name}
                            className="w-8 h-8 rounded"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {stage && (
                    <div className="mt-3 pt-3 border-t border-slate-700 text-center text-sm text-slate-400">
                      📍 Stage: {stage.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Renderizado del tab Tasks (el flujo principal)
  const renderTasks = () => {
    const currentGameData = match?.games?.[match?.currentGame - 1];
    const gamePhase = currentGameData?.phase || 'checkin';
    
    return (
      <div className="space-y-4">
        {/* Check-in */}
        <TaskItem
          title="Check in"
          status={match?.player1CheckIn && match?.player2CheckIn ? 'complete' : 'pending'}
          description="Both players must check in to start the match"
        >
          {(!match?.player1CheckIn || !match?.player2CheckIn) && canInteract && (
            <div className="space-y-2">
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    const res = await fetch(`/api/tournaments/${tournamentId}/matches/${match?.id}/checkin`, {
                      method: 'POST',
                    });
                    if (res.ok) {
                      toast.success('Check-in completado!');
                      onUpdate();
                    } else {
                      const data = await res.json();
                      toast.error(data.error || 'Error en check-in');
                    }
                  } catch (error) {
                    toast.error('Error durante el check-in');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading || (isPlayer1 && match?.player1CheckIn) || (isPlayer2 && match?.player2CheckIn)}
                className="w-full py-2 px-4 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
              >
                {(isPlayer1 && match?.player1CheckIn) || (isPlayer2 && match?.player2CheckIn) ? '✓ Ya hiciste Check-in' : 'Hacer Check-in'}
              </button>
              <div className="text-xs text-slate-400 text-center">
                {match?.player1CheckIn && '✓ ' + (match?.player1?.username || 'Player 1') + ' listo'}
                {match?.player1CheckIn && match?.player2CheckIn && ' • '}
                {match?.player2CheckIn && '✓ ' + (match?.player2?.username || 'Player 2') + ' listo'}
              </div>
            </div>
          )}
        </TaskItem>

        {/* Join lobby */}
        <TaskItem
          title="Join the game lobby"
          status={currentGameData?.lobbyJoined ? 'complete' : 'pending'}
          description="Both players join the online lobby"
        />

        {/* Game setup - Character & Stage selection */}
        <TaskItem
          title={`Game setup ${match.currentGame}`}
          status={currentGameData?.stage && currentGameData?.player1Character && currentGameData?.player2Character ? 'complete' : 'pending'}
          description="Character selection and stage striking"
        >
          {gamePhase === 'character_select' && currentGameData && (
            <div className="space-y-4">
              <div className="text-sm text-slate-400">
                {match.currentGame === 1 
                  ? `Turn: ${currentGameData.turn === 1 ? match.player1?.username : match.player2?.username} picks character first`
                  : `Winner picks character first: ${currentGameData.lastWinner === match.player1?.id ? match.player1?.username : match.player2?.username}`
                }
              </div>
              
              {/* Character Grid */}
              <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto p-2 bg-slate-900/50 rounded-lg">
                {characters.map((char) => (
                  <button
                    key={char.id}
                    onClick={async () => {
                      // TODO: Implementar selección de personaje
                      toast.success(`Selected ${char.name}`);
                    }}
                    className="p-2 rounded-lg border-2 border-slate-700 hover:border-yellow-500 transition-colors"
                  >
                    <img 
                      src={`/iconos/Icons/${char.name}.png`}
                      alt={char.name}
                      className="w-full h-auto rounded"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </TaskItem>

        {/* Report result */}
        <TaskItem
          title={`Report game ${match.currentGame}`}
          status={currentGameData?.winner ? 'complete' : 'pending'}
          description="Report the winner of this game"
        >
          {currentGameData && !currentGameData.winner && canInteract && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={async () => {
                  // TODO: Reportar resultado
                  toast.success('Result reported');
                }}
                className="py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                Winner: {match.player1?.username}
              </button>
              <button
                onClick={async () => {
                  // TODO: Reportar resultado
                  toast.success('Result reported');
                }}
                className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Winner: {match.player2?.username}
              </button>
            </div>
          )}
          
          {currentGameData?.reportedBy && !currentGameData?.confirmedBy && (
            <div className="text-sm text-yellow-400 text-center">
              Waiting for opponent confirmation...
            </div>
          )}
        </TaskItem>

        {/* Verify match results */}
        {match.player1Score + match.player2Score >= 2 && (
          <TaskItem
            title="Verify match results"
            status={match.winnerId ? 'complete' : 'pending'}
            description="Both players must confirm the final result"
          />
        )}
      </div>
    );
  };

  // Renderizado del tab Chat
  const renderChat = () => {
    return (
      <div className="flex flex-col h-[500px]">
        <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-slate-900/30 rounded-lg mb-4">
          {chatMessages.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            chatMessages.map((msg) => (
              <div key={msg.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {msg.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{msg.username}</span>
                    {msg.isModerator && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                        Moderator
                      </span>
                    )}
                    <span className="text-xs text-slate-500">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm">{msg.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
            placeholder="Enter a message"
            className="flex-1 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
          <button
            onClick={sendChatMessage}
            disabled={!chatInput.trim()}
            className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-slate-700 text-white font-semibold transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border-2 border-red-500/30 shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-red-900/20 to-orange-900/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-black text-white">
                {match?.roundName || 'Match'}
              </h2>
              <p className="text-slate-400 text-sm">Match #{match?.position || 0} • Best of {match?.bestOf || 3}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          {/* Players */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                {match?.player1?.username?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <div className="font-bold text-white">{match?.player1?.username || 'TBD'}</div>
                <div className="text-sm text-slate-400">{match?.player1Score || 0} wins</div>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end">
              <div className="text-right">
                <div className="font-bold text-white">{match?.player2?.username || 'TBD'}</div>
                <div className="text-sm text-slate-400">{match?.player2Score || 0} wins</div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                {match?.player2?.username?.charAt(0)?.toUpperCase() || '?'}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-800/50">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 px-6 py-3 font-semibold transition-colors relative ${
              activeTab === 'summary' 
                ? 'text-white bg-slate-900' 
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            SUMMARY
            {activeTab === 'summary' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 px-6 py-3 font-semibold transition-colors relative ${
              activeTab === 'tasks' 
                ? 'text-white bg-slate-900' 
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <ClipboardList className="w-4 h-4 inline mr-2" />
            TASKS
            {activeTab === 'tasks' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 px-6 py-3 font-semibold transition-colors relative ${
              activeTab === 'chat' 
                ? 'text-white bg-slate-900' 
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <MessageCircle className="w-4 h-4 inline mr-2" />
            CHAT
            {activeTab === 'chat' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
          {activeTab === 'summary' && renderSummary()}
          {activeTab === 'tasks' && renderTasks()}
          {activeTab === 'chat' && renderChat()}
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar para los items de tasks
function TaskItem({ 
  title, 
  status, 
  description, 
  children 
}: { 
  title: string; 
  status: 'complete' | 'pending' | 'in-progress'; 
  description: string; 
  children?: React.ReactNode;
}) {
  return (
    <div className={`p-4 rounded-lg border-2 ${
      status === 'complete' 
        ? 'bg-green-500/10 border-green-500/50' 
        : status === 'in-progress'
        ? 'bg-yellow-500/10 border-yellow-500/50'
        : 'bg-slate-800/50 border-slate-700'
    }`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
          status === 'complete' 
            ? 'bg-green-500' 
            : status === 'in-progress'
            ? 'bg-yellow-500'
            : 'bg-slate-600'
        }`}>
          {status === 'complete' && <CheckCircle className="w-4 h-4 text-white" />}
          {status === 'in-progress' && <Clock className="w-4 h-4 text-white" />}
          {status === 'pending' && <div className="w-2 h-2 rounded-full bg-slate-400" />}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-white mb-1">{title}</h4>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
        {status === 'complete' && (
          <span className="text-xs font-bold text-green-400 uppercase">COMPLETE ✓</span>
        )}
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
