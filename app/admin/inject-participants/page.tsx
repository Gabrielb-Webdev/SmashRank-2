'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function InjectParticipantsPage() {
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
      name: 'test (32 participantes)',
      participants: 25,
      color: 'from-blue-600 to-cyan-600'
    },
    {
      id: 'cmiooupsp00031423dfzw96m0',
      name: 'asdasd (32 participantes)',
      participants: 8,
      color: 'from-green-600 to-emerald-600'
    },
    {
      id: 'cmioovc3l00051423mtmwqdmv',
      name: 'asdasddasdas (8 participantes)',
      participants: 16,
      color: 'from-purple-600 to-pink-600'
    },
    {
      id: 'cmioprpcz0001jqyumj595lm3',
      name: 'Torneo Nuevo 1',
      participants: 25,
      color: 'from-orange-600 to-red-600'
    },
    {
      id: 'cmiopry440003jqyu1yg9qi7i',
      name: 'Torneo Nuevo 2',
      participants: 8,
      color: 'from-cyan-600 to-blue-600'
    },
    {
      id: 'cmiops6c10005jqyu8y3madxe',
      name: 'Torneo Nuevo 3',
      participants: 15,
      color: 'from-pink-600 to-purple-600'
    }
  ];

  const injectParticipants = async (tournamentId: string, count: number, tournamentName: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/inject-participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournamentId,
          participantCount: count
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`✅ ${count} participantes inyectados en "${tournamentName}"!`);
        console.log('Resultado:', data);
      } else {
        toast.error(`❌ Error: ${data.error || 'Error desconocido'}`);
        console.error('Error details:', data);
      }
    } catch (error) {
      toast.error('❌ Error de conexión');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const injectAll = async () => {
    setLoading(true);
    toast.loading('Inyectando participantes a todos los torneos...');
    
    for (const tournament of tournaments) {
      await injectParticipants(tournament.id, tournament.participants, tournament.name);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo entre cada inyección
    }
    
    toast.dismiss();
    toast.success('✅ Todos los participantes fueron inyectados!');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-800 rounded-lg p-8 shadow-2xl border border-purple-500/20 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">💉 Inyectar Participantes</h1>
          <p className="text-slate-400 mb-6">
            Crea participantes ficticios en los torneos seleccionados
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
                      <p>• Participantes a crear: <strong className="text-green-400">{tournament.participants}</strong></p>
                    </div>
                  </div>
                  <button
                    onClick={() => injectParticipants(tournament.id, tournament.participants, tournament.name)}
                    disabled={loading}
                    className={`bg-gradient-to-r ${tournament.color} hover:opacity-90 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg ml-4`}
                  >
                    {loading ? '⏳' : '💉'} Inyectar
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700">
            <button
              onClick={injectAll}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Inyectando participantes...
                </span>
              ) : (
                '🚀 Inyectar a TODOS los Torneos (97 participantes en total)'
              )}
            </button>
          </div>

          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-400">
              ⚠️ <strong>Nota:</strong> Esto creará usuarios ficticios con nombres aleatorios y los registrará en los torneos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
