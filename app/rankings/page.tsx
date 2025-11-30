'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Target, MapPin, Gamepad2, TrendingUp } from 'lucide-react';

const PROVINCIAS = [
  'Todas',
  'Buenos Aires',
  'CABA',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
];

interface RankingEntry {
  rank: number;
  userId: string;
  username: string;
  province: string;
  points: number;
  tournaments: number;
  wins: number;
  mainCharacter: string | null;
}

export default function RankingsPage() {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvince, setSelectedProvince] = useState('Todas');
  const [viewMode, setViewMode] = useState<'national' | 'provincial'>('national');

  useEffect(() => {
    fetchRankings();
  }, [selectedProvince]);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const province = selectedProvince === 'Todas' ? 'all' : selectedProvince;
      const res = await fetch(`/api/rankings?province=${province}&limit=50`);
      const data = await res.json();
      setRankings(data.rankings || []);
    } catch (error) {
      console.error('Error al cargar rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="min-h-screen py-12" style={{background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a0a 100%)'}}>
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <Trophy className="w-12 h-12" style={{color: '#ffd700'}} />
            <h1 className="text-5xl md:text-6xl font-black text-white" style={{textShadow: '0 0 30px rgba(220, 20, 60, 0.6)'}}>
              RANKINGS
            </h1>
            <Trophy className="w-12 h-12" style={{color: '#ffd700'}} />
          </div>
          <p className="text-xl text-slate-300">Los mejores jugadores de Super Smash Bros Ultimate en Argentina</p>
        </motion.div>

        {/* Filters */}
        <div className="mb-8 space-y-6">
          {/* View Mode Toggle */}
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => {
                setViewMode('national');
                setSelectedProvince('Todas');
              }}
              className={`px-8 py-4 font-bold text-lg rounded-lg transition-all flex items-center gap-3 ${
                viewMode === 'national'
                  ? 'text-white'
                  : 'text-slate-400'
              }`}
              style={viewMode === 'national' ? {
                background: 'linear-gradient(135deg, #dc143c 0%, #ff1744 100%)',
                boxShadow: '0 4px 20px rgba(220, 20, 60, 0.5), 0 0 30px rgba(255, 215, 0, 0.2)',
                border: '2px solid rgba(255, 215, 0, 0.5)'
              } : {
                background: 'rgba(26, 10, 10, 0.6)',
                border: '2px solid rgba(220, 20, 60, 0.3)'
              }}
            >
              <Trophy className="w-5 h-5" />
              RANKING NACIONAL
            </button>
            <button
              onClick={() => setViewMode('provincial')}
              className={`px-8 py-4 font-bold text-lg rounded-lg transition-all flex items-center gap-3 ${
                viewMode === 'provincial'
                  ? 'text-white'
                  : 'text-slate-400'
              }`}
              style={viewMode === 'provincial' ? {
                background: 'linear-gradient(135deg, #dc143c 0%, #ff1744 100%)',
                boxShadow: '0 4px 20px rgba(220, 20, 60, 0.5), 0 0 30px rgba(255, 215, 0, 0.2)',
                border: '2px solid rgba(255, 215, 0, 0.5)'
              } : {
                background: 'rgba(26, 10, 10, 0.6)',
                border: '2px solid rgba(220, 20, 60, 0.3)'
              }}
            >
              <MapPin className="w-5 h-5" />
              RANKING PROVINCIAL
            </button>
          </div>

          {/* Province Selector */}
          {viewMode === 'provincial' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="rounded-lg p-6"
              style={{
                background: 'rgba(26, 10, 10, 0.6)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(220, 20, 60, 0.3)'
              }}
            >
              <label className="block font-bold mb-3 text-lg text-white flex items-center gap-2">
                <MapPin className="w-5 h-5" style={{color: '#ffd700'}} />
                Seleccionar Provincia:
              </label>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full rounded-lg p-4 text-lg font-semibold text-white"
                style={{
                  background: 'rgba(10, 10, 10, 0.8)',
                  border: '2px solid rgba(220, 20, 60, 0.4)'
                }}
              >
                {PROVINCIAS.map((provincia) => (
                  <option key={provincia} value={provincia} style={{background: '#1a0a0a'}}>
                    {provincia}
                  </option>
                ))}
              </select>
            </motion.div>
          )}
        </div>

        {/* Rankings Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="spinner" style={{borderTopColor: '#dc143c'}}></div>
          </div>
        ) : rankings.length === 0 ? (
          <div className="text-center py-20">
            <div className="rounded-xl p-8 max-w-md mx-auto" style={{
              background: 'rgba(26, 10, 10, 0.6)',
              border: '1px solid rgba(220, 20, 60, 0.3)'
            }}>
              <Award className="w-16 h-16 mx-auto mb-4" style={{color: '#dc143c'}} />
              <p className="text-2xl font-bold mb-4 text-white">Sin datos</p>
              <p className="text-slate-400">
                No hay jugadores registrados en esta región todavía.
              </p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {rankings.map((entry, index) => (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl p-6 transition-all hover:scale-[1.02] cursor-pointer"
                style={{
                  background: entry.rank <= 3 
                    ? 'linear-gradient(135deg, rgba(220, 20, 60, 0.2) 0%, rgba(26, 10, 10, 0.8) 100%)'
                    : 'rgba(26, 10, 10, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: entry.rank <= 3 
                    ? '2px solid rgba(255, 215, 0, 0.6)'
                    : '1px solid rgba(220, 20, 60, 0.3)',
                  boxShadow: entry.rank <= 3
                    ? '0 8px 30px rgba(220, 20, 60, 0.4), 0 0 40px rgba(255, 215, 0, 0.2)'
                    : '0 4px 15px rgba(220, 20, 60, 0.2)'
                }}
              >
                <div className="flex items-center gap-6 flex-wrap">
                  {/* Rank Badge */}
                  <div className="min-w-[80px] text-center">
                    <div className={`font-black ${
                      entry.rank <= 3 ? 'text-6xl' : 'text-4xl'
                    }`} style={{
                      background: entry.rank <= 3 
                        ? 'linear-gradient(135deg, #ffd700 0%, #dc143c 100%)'
                        : 'linear-gradient(135deg, #dc143c 0%, #8b0000 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      filter: 'drop-shadow(0 0 10px rgba(220, 20, 60, 0.5))'
                    }}>
                      {getRankBadge(entry.rank)}
                    </div>
                  </div>

                  {/* Player Info */}
                  <div className="flex-1 min-w-[200px]">
                    <h3 className="text-2xl font-bold mb-3 text-white flex items-center gap-2">
                      {entry.username}
                      {entry.rank <= 3 && <Trophy className="w-6 h-6" style={{color: '#ffd700'}} />}
                    </h3>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="px-3 py-1.5 rounded-lg font-bold text-sm flex items-center gap-2" style={{
                        background: 'rgba(220, 20, 60, 0.2)',
                        border: '1px solid rgba(220, 20, 60, 0.4)',
                        color: '#ffd700'
                      }}>
                        <MapPin className="w-4 h-4" />
                        {entry.province}
                      </span>
                      {entry.mainCharacter && (
                        <span className="px-3 py-1.5 rounded-lg font-bold text-sm flex items-center gap-2" style={{
                          background: 'rgba(26, 10, 10, 0.8)',
                          border: '1px solid rgba(220, 20, 60, 0.3)',
                          color: '#fff'
                        }}>
                          <Gamepad2 className="w-4 h-4" />
                          {entry.mainCharacter}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-6 flex-wrap">
                    <div className="text-center min-w-[90px] px-4 py-3 rounded-lg" style={{
                      background: 'rgba(220, 20, 60, 0.15)',
                      border: '1px solid rgba(220, 20, 60, 0.3)'
                    }}>
                      <div className="text-3xl font-black mb-1" style={{
                        background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        {entry.points}
                      </div>
                      <div className="text-xs font-bold uppercase text-slate-400 flex items-center justify-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Puntos
                      </div>
                    </div>
                    <div className="text-center min-w-[90px] px-4 py-3 rounded-lg" style={{
                      background: 'rgba(26, 10, 10, 0.8)',
                      border: '1px solid rgba(220, 20, 60, 0.2)'
                    }}>
                      <div className="text-3xl font-black text-white mb-1">{entry.wins}</div>
                      <div className="text-xs font-bold uppercase text-slate-400 flex items-center justify-center gap-1">
                        <Trophy className="w-3 h-3" />
                        Victorias
                      </div>
                    </div>
                    <div className="text-center min-w-[90px] px-4 py-3 rounded-lg" style={{
                      background: 'rgba(26, 10, 10, 0.8)',
                      border: '1px solid rgba(220, 20, 60, 0.2)'
                    }}>
                      <div className="text-3xl font-black text-white mb-1">{entry.tournaments}</div>
                      <div className="text-xs font-bold uppercase text-slate-400 flex items-center justify-center gap-1">
                        <Target className="w-3 h-3" />
                        Torneos
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Legend */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 rounded-xl p-6"
          style={{
            background: 'rgba(26, 10, 10, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(220, 20, 60, 0.3)',
            boxShadow: '0 4px 20px rgba(220, 20, 60, 0.2)'
          }}
        >
          <h3 className="font-bold text-xl mb-4 text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6" style={{color: '#ffd700'}} />
            Cómo se calculan los puntos
          </h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3 text-slate-300">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{
                background: 'linear-gradient(135deg, #dc143c 0%, #ff1744 100%)',
                boxShadow: '0 2px 10px rgba(220, 20, 60, 0.3)'
              }}>
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <span><strong className="text-white">100 puntos</strong> por torneo ganado</span>
            </li>
            <li className="flex items-start gap-3 text-slate-300">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{
                background: 'linear-gradient(135deg, #dc143c 0%, #ff1744 100%)',
                boxShadow: '0 2px 10px rgba(220, 20, 60, 0.3)'
              }}>
                <Target className="w-4 h-4 text-white" />
              </div>
              <span><strong className="text-white">10 puntos</strong> por participación en torneo</span>
            </li>
            <li className="flex items-start gap-3 text-slate-300">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{
                background: 'linear-gradient(135deg, #dc143c 0%, #ff1744 100%)',
                boxShadow: '0 2px 10px rgba(220, 20, 60, 0.3)'
              }}>
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span>Los rankings se actualizan automáticamente después de cada torneo</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
