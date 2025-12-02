'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CheckCircle, XCircle, AlertTriangle, Loader2, Database, Zap } from 'lucide-react';

export default function MigrationPage() {
  const { data: session } = useSession();
  const [status, setStatus] = useState<'idle' | 'checking' | 'running' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [migrationNeeded, setMigrationNeeded] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      checkMigrationStatus();
    }
  }, [session]);

  const addLog = (log: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`]);
  };

  const checkMigrationStatus = async () => {
    setStatus('checking');
    addLog('🔍 Verificando estado de la base de datos...');

    try {
      const res = await fetch('/api/tournaments');
      const data = await res.json();
      
      // La API devuelve un array directo, no { tournaments: [...] }
      const tournaments = Array.isArray(data) ? data : [];
      
      const hasMigration = tournaments.some((t: any) => 
        t.hasOwnProperty('starterStages') || t.hasOwnProperty('counterpickStages')
      );

      if (hasMigration) {
        setMigrationNeeded(false);
        setMessage('✅ La migración ya fue ejecutada. Sistema listo!');
        setStatus('success');
        addLog('✅ Migración detectada. No se requiere acción.');
      } else {
        setMigrationNeeded(true);
        setMessage('⚠️ Migración pendiente. Click en "Ejecutar Migración" para activar el sistema.');
        setStatus('idle');
        addLog('⚠️ Migración requerida.');
      }
    } catch (error) {
      setMessage('❌ Error al verificar estado');
      setStatus('error');
      addLog(`❌ Error: ${error}`);
    }
  };

  const runMigration = async () => {
    setStatus('running');
    setMessage('⏳ Ejecutando migración...');
    addLog('🚀 Iniciando proceso de migración...');

    try {
      const res = await fetch('/api/admin/migrate', {
        method: 'POST',
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage('✅ Migración completada exitosamente!');
        setMigrationNeeded(false);
        addLog('✅ Migración ejecutada con éxito!');
        addLog('✅ Tablas actualizadas: MatchGame, Match, Tournament');
        addLog('✅ Índices creados correctamente');
        
        // Auto-redirect después de 3 segundos
        setTimeout(() => {
          addLog('↪️ Redirigiendo a configuración de stages...');
          window.location.href = '/admin/configure-stages';
        }, 3000);
      } else {
        setStatus('error');
        setMessage(`❌ Error: ${data.error || 'Error desconocido'}. Revisa los logs.`);
        addLog(`❌ Error en migración: ${data.error}`);
        if (data.details) {
          addLog(`📋 Detalles: ${data.details}`);
        }
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(`❌ Error de conexión: ${error.message}. Verifica Neon.`);
      addLog(`❌ Error de conexión: ${error.message}`);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-white text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-900/20 border-2 border-red-500 rounded-xl p-8 max-w-md text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Acceso Denegado</h1>
          <p className="text-red-300">Solo administradores pueden acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Database className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Sistema de Migración</h1>
              <p className="text-slate-400">Match Flow System - Database Update</p>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className={`rounded-2xl p-8 mb-6 border-2 ${
          status === 'success' ? 'bg-green-900/20 border-green-500' :
          status === 'error' ? 'bg-red-900/20 border-red-500' :
          status === 'running' ? 'bg-blue-900/20 border-blue-500' :
          migrationNeeded ? 'bg-yellow-900/20 border-yellow-500' :
          'bg-slate-800/50 border-slate-700'
        }`}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {status === 'success' && <CheckCircle className="w-12 h-12 text-green-400" />}
              {status === 'error' && <XCircle className="w-12 h-12 text-red-400" />}
              {status === 'running' && <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />}
              {status === 'checking' && <Loader2 className="w-12 h-12 text-slate-400 animate-spin" />}
              {status === 'idle' && migrationNeeded && <AlertTriangle className="w-12 h-12 text-yellow-400" />}
              {status === 'idle' && !migrationNeeded && <CheckCircle className="w-12 h-12 text-green-400" />}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">
                {status === 'success' ? '¡Migración Exitosa!' :
                 status === 'error' ? 'Error en Migración' :
                 status === 'running' ? 'Ejecutando...' :
                 status === 'checking' ? 'Verificando...' :
                 migrationNeeded ? 'Acción Requerida' :
                 'Sistema Actualizado'}
              </h2>
              <p className="text-lg text-slate-300">{message}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={checkMigrationStatus}
            disabled={status === 'running'}
            className="py-4 px-6 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 text-white font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Database className="w-5 h-5" />
            Verificar Estado
          </button>

          <button
            onClick={runMigration}
            disabled={status === 'running' || !migrationNeeded}
            className="py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 disabled:opacity-50 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/50"
          >
            <Zap className="w-5 h-5" />
            {status === 'running' ? 'Ejecutando...' : 'Ejecutar Migración'}
          </button>
        </div>

        {/* What will be done */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-6">
          <h3 className="text-xl font-bold text-white mb-4">🔧 Cambios que se aplicarán:</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
              <div>
                <strong className="text-white">MatchGame:</strong>
                <span className="text-slate-300"> Agregar columnas para phase, turnos, bans, lobby status</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 flex-shrink-0"></div>
              <div>
                <strong className="text-white">Match:</strong>
                <span className="text-slate-300"> Agregar arrays para DSR (Dave's Stupid Rule)</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 flex-shrink-0"></div>
              <div>
                <strong className="text-white">Tournament:</strong>
                <span className="text-slate-300"> Agregar configuración de starter/counterpick stages</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-yellow-400 mt-1.5 flex-shrink-0"></div>
              <div>
                <strong className="text-white">Índices:</strong>
                <span className="text-slate-300"> Crear índices para mejor rendimiento</span>
              </div>
            </div>
          </div>
        </div>

        {/* Logs */}
        {logs.length > 0 && (
          <div className="bg-black/50 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">📋 Logs de Ejecución:</h3>
            <div className="bg-black rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-sm">
              {logs.map((log, index) => (
                <div key={index} className="text-green-400 mb-1">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps */}
        {status === 'success' && (
          <div className="mt-6 bg-blue-900/20 border-2 border-blue-500 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-3">✅ Próximos Pasos:</h3>
            <ol className="space-y-2 text-slate-300">
              <li>1. Serás redirigido automáticamente a la configuración de stages</li>
              <li>2. Selecciona un torneo y haz click en "Quick Setup"</li>
              <li>3. Guarda la configuración</li>
              <li>4. ¡Prueba el match flow completo!</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
