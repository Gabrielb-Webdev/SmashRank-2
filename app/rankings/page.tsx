'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

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
          <h1 className="text-5xl md:text-6xl font-black mb-4" style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 20px rgba(220, 20, 60, 0.6))'}}>
            RANKINGS
          </h1>
          <p className="text-xl text-slate-300">Los mejores jugadores de Super Smash Bros Ultimate en Argentina</p>
        </motion.div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* View Mode Toggle */}
          <div className="flex gap-4 justify-center pb-4" style={{borderBottom: '2px solid rgba(220, 20, 60, 0.3)'}}>
            <button
              onClick={() => {
                setViewMode('national');
                setSelectedProvince('Todas');
              }}
              className="px-8 py-3 font-bold text-lg transition-all rounded-lg"
              style={{
                background: viewMode === 'national' ? 'linear-gradient(135deg, #dc143c 0%, #ff1744 100%)' : 'rgba(26, 10, 10, 0.6)',
                color: 'white',
                border: viewMode === 'national' ? '2px solid #dc143c' : '2px solid rgba(220, 20, 60, 0.3)',
                boxShadow: viewMode === 'national' ? '0 4px 20px rgba(220, 20, 60, 0.4)' : 'none'
              }}
            >
              🏆 RANKING NACIONAL
            </button>
            <button
              onClick={() => setViewMode('provincial')}
              className="px-8 py-3 font-bold text-lg transition-all rounded-lg"
              style={{
                background: viewMode === 'provincial' ? 'linear-gradient(135deg, #dc143c 0%, #ff1744 100%)' : 'rgba(26, 10, 10, 0.6)',
                color: 'white',
                border: viewMode === 'provincial' ? '2px solid #dc143c' : '2px solid rgba(220, 20, 60, 0.3)',
                boxShadow: viewMode === 'provincial' ? '0 4px 20px rgba(220, 20, 60, 0.4)' : 'none'
              }}
            >
              📍 RANKING PROVINCIAL
            </button>
          </div>

          {/* Province Selector */}
          {viewMode === 'provincial' && (
            <div className="p-6 rounded-lg" style={{background: 'rgba(26, 10, 10, 0.6)', border: '2px solid rgba(220, 20, 60, 0.3)'}}>
              <label className="block font-bold mb-3 text-lg text-white">Seleccionar Provincia:</label>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full p-3 text-lg font-bold rounded-lg text-white"
                style={{background: 'rgba(10, 10, 10, 0.8)', border: '2px solid rgba(220, 20, 60, 0.4)'}}
              >
                {PROVINCIAS.map((provincia) => (
                  <option key={provincia} value={provincia}>
                    {provincia}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Rankings Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="loader"></div>
          </div>
        ) : rankings.length === 0 ? (
          <div className="text-center py-20">
            <div className="p-8 max-w-md mx-auto rounded-lg" style={{background: 'rgba(26, 10, 10, 0.6)', border: '2px solid rgba(220, 20, 60, 0.3)'}}>
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
            className="space-y-3"
          >
            {rankings.map((entry, index) => (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 transition-all hover:scale-105 rounded-lg"
                style={{
                  background: 'rgba(26, 10, 10, 0.8)',
                  border: entry.rank <= 3 ? '2px solid #ffd700' : '2px solid rgba(220, 20, 60, 0.3)',
                  boxShadow: entry.rank <= 3 
                    ? '0 8px 30px rgba(255, 215, 0, 0.3), 0 0 20px rgba(220, 20, 60, 0.2)'
                    : '0 4px 20px rgba(220, 20, 60, 0.2)',
                }}
              >
                <div className="flex items-center gap-6">
                  {/* Rank Badge */}
                  <div className="text-4xl font-bold min-w-[80px] text-center">
                    <div 
                      className={entry.rank <= 3 ? 'text-5xl' : 'text-3xl'}
                      style={{
                        filter: entry.rank <= 3 ? 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.8))' : 'none'
                      }}
                    >
                      {getRankBadge(entry.rank)}
                    </div>
                  </div>

                  {/* Player Info */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2 text-white">{entry.username}</h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="px-3 py-1 font-bold rounded" style={{background: 'rgba(220, 20, 60, 0.2)', border: '1px solid rgba(220, 20, 60, 0.4)', color: '#ffd700'}}>
                        📍 {entry.province}
                      </span>
                      {entry.mainCharacter && (
                        <span className="px-3 py-1 font-bold rounded" style={{background: 'rgba(10, 10, 10, 0.6)', border: '1px solid rgba(255, 215, 0, 0.4)', color: '#ffd700'}}>
                          🎮 {entry.mainCharacter}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-8 text-center">
                    <div className="min-w-[100px]">
                      <div className="text-3xl font-black" style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>{entry.points}</div>
                      <div className="text-xs font-bold uppercase text-slate-400">Puntos</div>
                    </div>
                    <div className="min-w-[100px]">
                      <div className="text-3xl font-black" style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>{entry.wins}</div>
                      <div className="text-xs font-bold uppercase text-slate-400">Victorias</div>
                    </div>
                    <div className="min-w-[100px]">
                      <div className="text-3xl font-black" style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>{entry.tournaments}</div>
                      <div className="text-xs font-bold uppercase text-slate-400">Torneos</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Legend */}
        <div className="mt-12 p-6 rounded-lg" style={{background: 'rgba(26, 10, 10, 0.6)', border: '2px solid rgba(220, 20, 60, 0.3)'}}>
          <h3 className="font-bold text-xl mb-4 text-white">📊 Cómo se calculan los puntos</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <span className="font-bold" style={{color: '#dc143c'}}>•</span>
              <span><strong style={{color: '#ffd700'}}>100 puntos</strong> por torneo ganado</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold" style={{color: '#dc143c'}}>•</span>
              <span><strong style={{color: '#ffd700'}}>10 puntos</strong> por participación en torneo</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold" style={{color: '#dc143c'}}>•</span>
              <span>Los rankings se actualizan automáticamente después de cada torneo</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
