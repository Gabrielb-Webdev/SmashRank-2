'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function TestTournamentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (session?.user.role !== 'ADMIN') {
    router.push('/');
    return null;
  }

  const createTestTournament = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/test-tournament', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('✅ Torneo de prueba creado exitosamente!');
        console.log('Torneo creado:', data);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800 rounded-lg p-8 shadow-2xl border border-purple-500/20">
          <h1 className="text-3xl font-bold text-white mb-2">🧪 Test: Crear Torneo</h1>
          <p className="text-slate-400 mb-6">
            Crea un torneo de prueba directamente en la base de datos
          </p>

          <div className="bg-slate-900/50 rounded-lg p-6 mb-6 border border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-3">📋 Datos del Torneo</h2>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>• <strong>Nombre:</strong> Torneo de Prueba {new Date().getTime()}</li>
              <li>• <strong>Formato:</strong> Double Elimination</li>
              <li>• <strong>Participantes:</strong> 8 jugadores</li>
              <li>• <strong>Inicio:</strong> En 7 días</li>
              <li>• <strong>Reglas:</strong> 3 stocks, 7 minutos, Sin Items</li>
              <li>• <strong>Estado:</strong> REGISTRATION_OPEN</li>
            </ul>
          </div>

          <button
            onClick={createTestTournament}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creando torneo...
              </span>
            ) : (
              '🚀 Crear Torneo de Prueba'
            )}
          </button>

          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-400">
              ⚠️ <strong>Nota:</strong> Este endpoint bypasea la validación del frontend y crea el torneo directamente en la DB con valores hardcodeados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
