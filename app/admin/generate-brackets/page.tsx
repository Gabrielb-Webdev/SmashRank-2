'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function GenerateBracketsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (session?.user.role !== 'ADMIN') {
    router.push('/');
    return null;
  }

  const tournaments = [
    {
      id: 'cmiootw2n00011423j1qg8mf5',
      name: 'test',
      participants: 32,
    },
    {
      id: 'cmiooupsp00031423dfzw96m0',
      name: 'asdasd',
      participants: 32,
    },
    {
      id: 'cmioovc3l00051423mtmwqdmv',
      name: 'asdasddasdas',
      participants: 24,
    },
    {
      id: 'cmioprpcz0001jqyumj595lm3',
      name: 'Torneo Nuevo 1',
      participants: 25,
    },
    {
      id: 'cmiopry440003jqyu1yg9qi7i',
      name: 'Torneo Nuevo 2',
      participants: 8,
    },
    {
      id: 'cmiops6c10005jqyu8y3madxe',
      name: 'Torneo Nuevo 3',
      participants: 15,
    }
  ];

  const generateBracket = async (tournamentId: string, tournamentName: string) => {
    setLoading(true);
    try {
      console.log(`🎯 Generando bracket para ${tournamentName}...`);
      
      const response = await fetch(`/api/tournaments/${tournamentId}/brackets/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`✅ Bracket generado para "${tournamentName}"!`);
        console.log('Bracket generado:', data);
      } else {
        toast.error(`❌ Error en "${tournamentName}": ${data.error || 'Error desconocido'}`);
        console.error('Error details:', data);
      }
    } catch (error) {
      toast.error(`❌ Error de conexión en "${tournamentName}"`);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAllBrackets = async () => {
    setLoading(true);
    toast.loading('Generando todos los brackets...');
    
    for (const tournament of tournaments) {
      console.log(`\n🎯 Procesando: ${tournament.name}`);
      await generateBracket(tournament.id, tournament.name);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos entre cada uno
    }
    
    toast.dismiss();
    toast.success('✅ ¡Todos los brackets generados!');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-800 rounded-lg p-8 shadow-2xl border border-purple-500/20 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">🎯 Generar Brackets</h1>
          <p className="text-slate-400 mb-6">
            Genera los brackets para torneos que ya tienen participantes
          </p>

          <div className="space-y-4">
            {tournaments.map((tournament, index) => (
              <div 
                key={tournament.id}
                className="bg-slate-900/50 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {index + 1}. {tournament.name}
                    </h3>
                    <div className="space-y-1 text-sm text-slate-400">
                      <p>• ID: <code className="text-purple-400">{tournament.id}</code></p>
                      <p>• Participantes: <strong className="text-green-400">{tournament.participants}</strong></p>
                    </div>
                  </div>
                  <button
                    onClick={() => generateBracket(tournament.id, tournament.name)}
                    disabled={loading}
                    className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:opacity-90 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg ml-4"
                  >
                    {loading ? '⏳' : '🎯'} Generar
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700">
            <button
              onClick={generateAllBrackets}
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generando brackets...
                </span>
              ) : (
                '🚀 Generar TODOS los Brackets (6 torneos)'
              )}
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-400">
              💡 <strong>Tip:</strong> Esto generará los brackets Double Elimination con seeding automático para todos los torneos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
