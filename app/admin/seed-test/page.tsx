'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Users, Trophy, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SeedTestPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!session || session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a0a 100%)'}}>
        <div className="text-center p-8 rounded-xl"
          style={{background: 'rgba(220, 20, 60, 0.1)', border: '2px solid rgba(220, 20, 60, 0.3)'}}>
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Acceso Denegado</h1>
          <p className="text-slate-400">Solo administradores pueden acceder a esta página</p>
        </div>
      </div>
    );
  }

  const handleSeed = async () => {
    if (!confirm('¿Estás seguro? Esto creará 29 usuarios de prueba y los inscribirá en el torneo.')) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/seed-test', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Error al crear datos de prueba');
        return;
      }

      setResult(data);
      toast.success(`¡${data.usersCreated} usuarios creados y ${data.registrationsCreated} inscritos!`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear datos de prueba');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a0a 100%)'}}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 p-8 rounded-2xl text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.1) 0%, rgba(255, 215, 0, 0.1) 100%)',
              border: '2px solid rgba(220, 20, 60, 0.3)'
            }}>
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)'}}>
              <Users className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-black mb-2 text-white">Seed de Prueba</h1>
            <p className="text-slate-300 text-lg">Crear 29 usuarios de prueba para testing</p>
          </div>

          {/* Action Card */}
          <div className="mb-6 p-6 rounded-xl"
            style={{background: 'rgba(15, 23, 42, 0.6)', border: '2px solid rgba(220, 20, 60, 0.3)'}}>
            <h2 className="text-xl font-bold text-white mb-4">¿Qué hará esto?</h2>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)', color: 'white'}}>1</span>
                <span className="text-slate-300">Crear 29 usuarios con nombres únicos (Player1, Player2, etc.)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)', color: 'white'}}>2</span>
                <span className="text-slate-300">Asignar stats aleatorios a cada usuario (wins, losses, points)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)', color: 'white'}}>3</span>
                <span className="text-slate-300">Inscribir a todos en el torneo con ID: cmimlfhr50001oqkmqg7txwzs</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)', color: 'white'}}>4</span>
                <span className="text-slate-300">Marcar a todos como checked-in automáticamente</span>
              </li>
            </ul>

            <button
              onClick={handleSeed}
              disabled={loading}
              className="w-full py-4 rounded-xl font-black text-white text-lg transition-all hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)',
                border: '2px solid rgba(220, 20, 60, 0.5)',
                boxShadow: '0 8px 30px rgba(220, 20, 60, 0.4)'
              }}>
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creando datos...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <Trophy className="w-5 h-5" />
                  CREAR 29 USUARIOS DE PRUEBA
                  <Trophy className="w-5 h-5" />
                </span>
              )}
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className="p-6 rounded-xl"
              style={{background: 'rgba(34, 197, 94, 0.1)', border: '2px solid rgba(34, 197, 94, 0.3)'}}>
              <h3 className="text-xl font-bold text-green-400 mb-4">✅ Datos creados exitosamente</h3>
              <div className="space-y-2 text-slate-300">
                <p>👥 Usuarios creados: <span className="font-bold text-white">{result.usersCreated}</span></p>
                <p>📝 Inscripciones creadas: <span className="font-bold text-white">{result.registrationsCreated}</span></p>
                <p>🎯 Torneo ID: <span className="font-mono text-xs text-slate-400">{result.tournamentId}</span></p>
              </div>
              <button
                onClick={() => router.push(`/tournaments/${result.tournamentId}`)}
                className="mt-4 w-full py-3 rounded-lg font-bold text-white transition-all hover:scale-[1.02]"
                style={{background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'}}>
                Ver Torneo
              </button>
            </div>
          )}

          {/* Warning */}
          <div className="mt-6 p-4 rounded-lg"
            style={{background: 'rgba(234, 179, 8, 0.1)', border: '2px solid rgba(234, 179, 8, 0.3)'}}>
            <p className="text-yellow-400 text-sm">
              ⚠️ <strong>Nota:</strong> Estos son datos de prueba. Los usuarios tendrán contraseñas genéricas (password123).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
