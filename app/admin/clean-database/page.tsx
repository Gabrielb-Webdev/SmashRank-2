'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Trash2, AlertTriangle } from 'lucide-react';

export default function CleanDatabasePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState('');

  if (session?.user.role !== 'ADMIN') {
    router.push('/');
    return null;
  }

  const cleanDatabase = async () => {
    if (confirmation !== 'ELIMINAR TODO') {
      toast.error('Debes escribir "ELIMINAR TODO" para confirmar');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/clean-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('✅ Base de datos limpiada exitosamente!');
        console.log('Resultado:', data);
        setConfirmation('');
        
        // Esperar 2 segundos y redirigir
        setTimeout(() => {
          router.push('/');
        }, 2000);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800 rounded-lg p-8 shadow-2xl border border-red-500/50">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-red-600/20 flex items-center justify-center">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">🗑️ Limpiar Base de Datos</h1>
              <p className="text-red-400 font-semibold">¡PELIGRO! Esta acción es irreversible</p>
            </div>
          </div>

          <div className="bg-red-500/10 border-2 border-red-500/50 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-lg font-bold text-red-400 mb-2">⚠️ ADVERTENCIA CRÍTICA</h2>
                <p className="text-red-300 text-sm mb-3">
                  Esta operación eliminará PERMANENTEMENTE:
                </p>
                <ul className="space-y-2 text-sm text-red-200">
                  <li>✗ TODOS los torneos</li>
                  <li>✗ Todos los brackets y matches</li>
                  <li>✗ Todas las inscripciones (registrations)</li>
                  <li>✗ TODOS los usuarios (excepto 3 específicos)</li>
                  <li>✗ Todos los rankings</li>
                </ul>
                <p className="text-green-300 text-sm mt-3 font-semibold">
                  ✅ Se mantendrán estos usuarios:
                </p>
                <ul className="space-y-1 text-xs text-green-200 mt-2">
                  <li>• Gabriel Sin H (Gabrielbustosg01@gmail.com)</li>
                  <li>• iiori.__ (joelgomezalbornoz@hotmail.com)</li>
                  <li>• admin (admin@smashrank.ar)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-6 mb-6">
            <h3 className="text-white font-bold mb-3">🔒 Confirmación Requerida</h3>
            <p className="text-slate-400 text-sm mb-4">
              Para confirmar esta acción destructiva, escribe exactamente:
            </p>
            <div className="bg-slate-950 rounded-lg p-3 mb-4">
              <code className="text-red-400 font-mono">ELIMINAR TODO</code>
            </div>
            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="Escribe aquí..."
              className="w-full bg-slate-950 border-2 border-slate-700 focus:border-red-500 rounded-lg px-4 py-3 text-white placeholder-slate-600 outline-none transition-colors"
            />
          </div>

          <button
            onClick={cleanDatabase}
            disabled={loading || confirmation !== 'ELIMINAR TODO'}
            className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Limpiando base de datos...
              </>
            ) : (
              <>
                <Trash2 className="w-5 h-5" />
                🗑️ ELIMINAR TODO
              </>
            )}
          </button>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-400">
              💡 <strong>Nota:</strong> Después de limpiar, serás redirigido a la página principal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
