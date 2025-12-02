'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function SystemHealthCheck() {
  const [status, setStatus] = useState<{
    database: 'checking' | 'ok' | 'error';
    stages: 'checking' | 'ok' | 'error';
    migration: 'checking' | 'ok' | 'pending' | 'error';
    message: string;
  }>({
    database: 'checking',
    stages: 'checking',
    migration: 'checking',
    message: 'Verificando sistema...',
  });

  useEffect(() => {
    checkSystemHealth();
  }, []);

  const checkSystemHealth = async () => {
    try {
      // 1. Verificar stages
      const stagesRes = await fetch('/api/stages');
      const stagesOk = stagesRes.ok;

      // 2. Verificar si la migración está completa verificando la estructura de la API
      const tournamentsRes = await fetch('/api/tournaments');
      const tournamentsData = await tournamentsRes.json();
      
      // Verificar si el primer torneo tiene la propiedad starterStages (incluso si está vacía)
      const hasMigration = tournamentsData.tournaments && tournamentsData.tournaments.length > 0
        ? tournamentsData.tournaments[0].hasOwnProperty('starterStages')
        : true; // Si no hay torneos, asumimos que la migración está OK

      if (!hasMigration) {
        setStatus({
          database: 'ok',
          stages: stagesOk ? 'ok' : 'error',
          migration: 'pending',
          message: '⚠️ Migración pendiente: Ejecuta la migración en /admin/migration',
        });
      } else {
        setStatus({
          database: 'ok',
          stages: stagesOk ? 'ok' : 'error',
          migration: 'ok',
          message: '✅ Sistema listo para usar',
        });
      }
    } catch (error) {
      setStatus({
        database: 'error',
        stages: 'error',
        migration: 'error',
        message: '❌ Error al verificar sistema',
      });
    }
  };

  const getIcon = (state: string) => {
    switch (state) {
      case 'ok':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-slate-500 border-t-white animate-spin" />;
    }
  };

  if (status.migration === 'pending') {
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-md">
        <div className="bg-yellow-900 border-2 border-yellow-600 rounded-xl p-4 shadow-2xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-white mb-2">⚠️ Acción Requerida</h3>
              <p className="text-sm text-yellow-100 mb-3">
                Necesitas ejecutar la migración de base de datos para usar el sistema de match flow.
              </p>
              <div className="space-y-2 text-xs text-yellow-200">
                <p>1. Ve a https://console.neon.tech/</p>
                <p>2. SQL Editor</p>
                <p>3. Ejecuta <code className="bg-yellow-950 px-1 py-0.5 rounded">neon_migration.sql</code></p>
              </div>
              <a
                href="/admin/migration"
                className="mt-3 block text-center py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-colors"
              >
                🚀 Ejecutar Migración Ahora
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
