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
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="title-smash mb-4">RANKINGS</h1>
          <p className="text-xl">Los mejores jugadores de Super Smash Bros Ultimate en Argentina</p>
        </motion.div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* View Mode Toggle */}
          <div className="flex gap-4 justify-center border-b-4 border-black pb-4">
            <button
              onClick={() => {
                setViewMode('national');
                setSelectedProvince('Todas');
              }}
              className={`px-8 py-3 font-bold text-lg transition-all ${
                viewMode === 'national'
                  ? 'bg-black text-white border-4 border-black'
                  : 'bg-white text-black border-4 border-black'
              }`}
            >
              🏆 RANKING NACIONAL
            </button>
            <button
              onClick={() => setViewMode('provincial')}
              className={`px-8 py-3 font-bold text-lg transition-all ${
                viewMode === 'provincial'
                  ? 'bg-black text-white border-4 border-black'
                  : 'bg-white text-black border-4 border-black'
              }`}
            >
              📍 RANKING PROVINCIAL
            </button>
          </div>

          {/* Province Selector */}
          {viewMode === 'provincial' && (
            <div className="bg-white border-4 border-black p-6">
              <label className="block font-bold mb-3 text-lg">Seleccionar Provincia:</label>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full border-4 border-black p-3 text-lg font-bold"
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
            <div className="manga-panel p-8 max-w-md mx-auto">
              <p className="text-2xl font-bold mb-4">Sin datos</p>
              <p className="text-gray-600">
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
                className="bg-white border-4 border-black p-6 transition-all hover:translate-x-1 hover:translate-y-1"
                style={{
                  boxShadow: '6px 6px 0px 0px rgba(0, 0, 0, 1)',
                }}
              >
                <div className="flex items-center gap-6">
                  {/* Rank Badge */}
                  <div className="text-4xl font-bold min-w-[80px] text-center">
                    <div className={`${
                      entry.rank <= 3 ? 'text-5xl' : 'text-3xl'
                    }`}>
                      {getRankBadge(entry.rank)}
                    </div>
                  </div>

                  {/* Player Info */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">{entry.username}</h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="px-3 py-1 bg-black text-white font-bold">
                        📍 {entry.province}
                      </span>
                      {entry.mainCharacter && (
                        <span className="px-3 py-1 border-2 border-black font-bold">
                          🎮 {entry.mainCharacter}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-8 text-center">
                    <div className="min-w-[100px]">
                      <div className="text-3xl font-black">{entry.points}</div>
                      <div className="text-xs font-bold uppercase">Puntos</div>
                    </div>
                    <div className="min-w-[100px]">
                      <div className="text-3xl font-black">{entry.wins}</div>
                      <div className="text-xs font-bold uppercase">Victorias</div>
                    </div>
                    <div className="min-w-[100px]">
                      <div className="text-3xl font-black">{entry.tournaments}</div>
                      <div className="text-xs font-bold uppercase">Torneos</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Legend */}
        <div className="mt-12 bg-white border-4 border-black p-6">
          <h3 className="font-bold text-xl mb-4">📊 Cómo se calculan los puntos</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span><strong>100 puntos</strong> por torneo ganado</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span><strong>10 puntos</strong> por participación en torneo</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>Los rankings se actualizan automáticamente después de cada torneo</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
