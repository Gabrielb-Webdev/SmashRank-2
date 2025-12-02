"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Database, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MigratePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: string[];
  } | null>(null);

  // Verificar que sea admin
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
    router.push('/');
    return null;
  }

  const handleMigrate = async () => {
    try {
      setMigrating(true);
      setResult(null);
      
      const res = await fetch('/api/admin/migrate-db', {
        method: 'POST',
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setResult({
          success: false,
          message: data.error || 'Error al aplicar la migración',
          details: data.details,
        });
        toast.error('Error al aplicar la migración');
        return;
      }
      
      setResult({
        success: true,
        message: 'Migración aplicada exitosamente',
        details: data.details,
      });
      toast.success('¡Migración completada!');
    } catch (err) {
      console.error('Error:', err);
      setResult({
        success: false,
        message: 'Error de conexión al aplicar la migración',
      });
      toast.error('Error de conexión');
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          
          <h1 className="text-4xl font-black text-white mb-2">
            Migración de Base de Datos
          </h1>
          <p className="text-slate-400">
            Sistema Double Elimination - Aplicar cambios al schema
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-slate-900/50 rounded-xl border-2 border-slate-800 p-6 mb-6">
          <div className="flex items-start gap-4">
            <Database className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-white mb-3">
                Cambios que se aplicarán
              </h2>
              
              <div className="space-y-3 text-sm">
                <div>
                  <h3 className="font-semibold text-yellow-400 mb-1">Modelo Match:</h3>
                  <ul className="text-slate-300 space-y-1 ml-4">
                    <li>• roundName (String) - Nombre de la ronda</li>
                    <li>• position (Int) - Posición del match en la ronda</li>
                    <li>• player1Source, player2Source (String?) - De dónde vienen los jugadores</li>
                    <li>• loserId (String?) - ID del jugador que perdió</li>
                    <li>• scheduledTime (DateTime?) - Hora programada</li>
                    <li>• previousMatch1Id, previousMatch2Id (String?) - Matches previos</li>
                    <li>• streamUrl (String?) - URL del stream</li>
                    <li>• isLive (Boolean) - Si está en vivo</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-green-400 mb-1">Modelo Registration:</h3>
                  <ul className="text-slate-300 space-y-1 ml-4">
                    <li>• seedBadge (String?) - Badge visual del seed (A1, B2, #3)</li>
                    <li>• status (String) - Estado del jugador (ACTIVE, ELIMINATED)</li>
                    <li>• currentBracket (String) - Bracket actual (WINNERS, LOSERS)</li>
                    <li>• finalPlacement (Int?) - Posición final</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-purple-400 mb-1">Modelo Tournament:</h3>
                  <ul className="text-slate-300 space-y-1 ml-4">
                    <li>• prizePool (String?) - Premio del torneo</li>
                    <li>• streamUrls (String[]) - URLs de streams</li>
                    <li>• showProjected (Boolean) - Mostrar matches proyectados</li>
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-700">
                  <h3 className="font-semibold text-red-400 mb-1">Índices:</h3>
                  <ul className="text-slate-300 space-y-1 ml-4">
                    <li>• Match: bracketType, roundNumber, isLive</li>
                    <li>• Registration: seed, status</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Warning Card */}
        <div className="bg-yellow-900/20 border-2 border-yellow-700/50 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-yellow-200 font-semibold mb-1">
                Importante
              </p>
              <p className="text-yellow-100/80">
                Esta operación modificará la estructura de la base de datos. Los datos existentes 
                se mantendrán, pero se agregarán nuevas columnas. Es recomendable hacer un backup 
                antes de proceder.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center mb-8">
          <Button
            onClick={handleMigrate}
            disabled={migrating || result?.success}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6"
          >
            {migrating ? (
              <>
                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                Aplicando migración...
              </>
            ) : result?.success ? (
              <>
                <CheckCircle className="w-6 h-6 mr-3" />
                Migración completada
              </>
            ) : (
              <>
                <Database className="w-6 h-6 mr-3" />
                Aplicar Migración
              </>
            )}
          </Button>
        </div>

        {/* Result */}
        {result && (
          <div className={`rounded-xl border-2 p-6 ${
            result.success 
              ? 'bg-green-900/20 border-green-700/50' 
              : 'bg-red-900/20 border-red-700/50'
          }`}>
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h3 className={`text-lg font-bold mb-2 ${
                  result.success ? 'text-green-200' : 'text-red-200'
                }`}>
                  {result.message}
                </h3>
                
                {result.details && result.details.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {result.details.map((detail, idx) => (
                      <p key={idx} className={`text-sm ${
                        result.success ? 'text-green-100/80' : 'text-red-100/80'
                      }`}>
                        {detail}
                      </p>
                    ))}
                  </div>
                )}

                {result.success && (
                  <div className="mt-4 pt-4 border-t border-green-700/30">
                    <p className="text-green-100/80 text-sm mb-3">
                      ¡La migración se aplicó correctamente! Ahora podés:
                    </p>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => router.push('/admin/dashboard')}
                        variant="outline"
                        className="border-green-600 text-green-300 hover:bg-green-900/30"
                      >
                        Ir al Dashboard
                      </Button>
                      <Button
                        onClick={() => router.push('/tournaments')}
                        variant="outline"
                        className="border-green-600 text-green-300 hover:bg-green-900/30"
                      >
                        Ver Torneos
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
