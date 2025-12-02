'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ConfigureStagesPage() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [starterStages, setStarterStages] = useState<string[]>([]);
  const [counterpickStages, setCounterpickStages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchTournaments();
    fetchStages();
  }, []);

  const fetchTournaments = async () => {
    try {
      const res = await fetch('/api/tournaments');
      const data = await res.json();
      // La API devuelve un array directo, no un objeto con propiedad tournaments
      setTournaments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  };

  const fetchStages = async () => {
    try {
      const res = await fetch('/api/stages');
      const data = await res.json();
      setStages(data || []);
    } catch (error) {
      console.error('Error fetching stages:', error);
    }
  };

  const seedStages = async () => {
    if (!confirm('¿Crear los 8 stages legales de Smash Ultimate?')) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/admin/seed-stages', {
        method: 'POST',
      });
      
      if (res.ok) {
        const data = await res.json();
        alert(`✅ ${data.message}`);
        fetchStages(); // Recargar stages
      } else {
        const data = await res.json();
        alert('Error: ' + (data.error || 'Error desconocido'));
      }
    } catch (error) {
      alert('Error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleTournamentChange = (tournamentId: string) => {
    setSelectedTournament(tournamentId);
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (tournament) {
      setStarterStages(tournament.starterStages || []);
      setCounterpickStages(tournament.counterpickStages || []);
    }
  };

  const toggleStarter = (stageId: string) => {
    setStarterStages(prev => 
      prev.includes(stageId) 
        ? prev.filter(id => id !== stageId)
        : [...prev, stageId]
    );
  };

  const toggleCounterpick = (stageId: string) => {
    setCounterpickStages(prev => 
      prev.includes(stageId) 
        ? prev.filter(id => id !== stageId)
        : [...prev, stageId]
    );
  };

  const handleSave = async () => {
    if (!selectedTournament) {
      alert('Selecciona un torneo primero');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/configure-stages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournamentId: selectedTournament,
          starterStages,
          counterpickStages,
        }),
      });

      if (res.ok) {
        alert('✅ Stages configurados exitosamente!');
        fetchTournaments();
      } else {
        const data = await res.json();
        alert('Error: ' + (data.error || 'Error desconocido'));
      }
    } catch (error) {
      alert('Error al guardar: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const quickSetup = () => {
    // Configuración rápida con stages típicos de Smash Ultimate
    // Buscar stages por nombre
    const findStageByName = (name: string) => 
      stages.find(s => s.name.toLowerCase().includes(name.toLowerCase()))?.id;

    const starters = [
      findStageByName('battlefield'),
      findStageByName('final destination'),
      findStageByName('pokemon stadium'),
      findStageByName('smashville'),
      findStageByName('town'),
    ].filter(Boolean);

    const counterpicks = [
      findStageByName('kalos'),
      findStageByName('lylat'),
      findStageByName('yoshi'),
    ].filter(Boolean);

    setStarterStages(starters as string[]);
    setCounterpickStages(counterpicks as string[]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">
              ⚙️ Configurar Stages
            </h1>
            <p className="text-slate-400">
              Configura los stages starter y counterpick para cada torneo
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            ← Volver
          </button>
        </div>

        {/* Selector de Torneo */}
        <div className="bg-slate-900 border-2 border-slate-800 rounded-xl p-6 mb-6">
          <label className="block text-white font-bold mb-3">
            Seleccionar Torneo:
          </label>
          <select
            value={selectedTournament}
            onChange={(e) => handleTournamentChange(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
          >
            <option value="">-- Selecciona un torneo --</option>
            {tournaments.map((tournament) => (
              <option key={tournament.id} value={tournament.id}>
                {tournament.name} ({tournament.format})
              </option>
            ))}
          </select>

          <div className="flex gap-3 mt-4">
            {stages.length === 0 && (
              <button
                onClick={seedStages}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 text-white rounded-lg transition-colors"
              >
                🎭 Crear Stages Legales
              </button>
            )}
            {selectedTournament && stages.length > 0 && (
              <button
                onClick={quickSetup}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                ⚡ Configuración Rápida (Smash Ultimate)
              </button>
            )}
          </div>
        </div>

        {selectedTournament && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Starter Stages */}
            <div className="bg-slate-900 border-2 border-green-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                🟢 Starter Stages ({starterStages.length})
              </h2>
              <p className="text-sm text-slate-400 mb-4">
                Usados en Game 1 - Patrón de ban 1-2-1
              </p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {stages.map((stage) => (
                  <label
                    key={stage.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      starterStages.includes(stage.id)
                        ? 'bg-green-600/20 border-2 border-green-600'
                        : 'bg-slate-800 border-2 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={starterStages.includes(stage.id)}
                      onChange={() => toggleStarter(stage.id)}
                      className="w-5 h-5"
                    />
                    <span className="text-white font-semibold">{stage.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Counterpick Stages */}
            <div className="bg-slate-900 border-2 border-blue-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                🔵 Counterpick Stages ({counterpickStages.length})
              </h2>
              <p className="text-sm text-slate-400 mb-4">
                Usados en Games 2-3 - Ganador banea 3
              </p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {stages.map((stage) => (
                  <label
                    key={stage.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      counterpickStages.includes(stage.id)
                        ? 'bg-blue-600/20 border-2 border-blue-600'
                        : 'bg-slate-800 border-2 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={counterpickStages.includes(stage.id)}
                      onChange={() => toggleCounterpick(stage.id)}
                      className="w-5 h-5"
                    />
                    <span className="text-white font-semibold">{stage.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        {selectedTournament && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading || starterStages.length === 0}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold rounded-xl transition-all shadow-lg disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Guardando...' : '💾 Guardar Configuración'}
            </button>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-900/20 border-2 border-blue-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-3">ℹ️ Información</h3>
          <ul className="space-y-2 text-slate-300">
            <li>• <strong>Starter Stages:</strong> Se usan en Game 1 con patrón de ban 1-2-1</li>
            <li>• <strong>Counterpick Stages:</strong> Se agregan a los disponibles en Games 2-3</li>
            <li>• El ganador banea 3 stages en Games 2-3, el perdedor elige</li>
            <li>• DSR: No puedes elegir stages donde ya ganaste</li>
            <li>• Recomendado: 5-7 starters, 2-3 counterpicks</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
