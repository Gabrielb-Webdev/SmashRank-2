'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { PROVINCES, TOURNAMENT_FORMATS } from '@/lib/constants';
import toast from 'react-hot-toast';
import { Trophy, Calendar, MapPin, Users, Settings, Wifi, Info, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CreateTournamentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    province: 'Buenos Aires',
    isOnline: true,
    format: 'DOUBLE_ELIMINATION',
    maxParticipants: '32',
    startDate: '',
    registrationStart: '',
    registrationEnd: '',
    checkinStart: '',
    checkinEnd: '',
    rules: '3 stocks, 7 minutos, sin items',
    stageList: 'Battlefield, Final Destination, Smashville, Town & City, Pokémon Stadium 2',
  });

  // Auto-calcular fechas sugeridas
  useEffect(() => {
    if (!formData.startDate) {
      const now = new Date();
      const startDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 días
      const regStart = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000); // +1 día
      const regEnd = new Date(startDate.getTime() - 2 * 60 * 60 * 1000); // 2h antes
      const checkinStart = new Date(startDate.getTime() - 1 * 60 * 60 * 1000); // 1h antes
      const checkinEnd = new Date(startDate.getTime() - 15 * 60 * 1000); // 15min antes

      setFormData(prev => ({
        ...prev,
        startDate: formatDateTimeLocal(startDate),
        registrationStart: formatDateTimeLocal(regStart),
        registrationEnd: formatDateTimeLocal(regEnd),
        checkinStart: formatDateTimeLocal(checkinStart),
        checkinEnd: formatDateTimeLocal(checkinEnd),
      }));
    }
  }, []);

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Redirigir si no es admin
  if (session?.user.role !== 'ADMIN') {
    router.push('/tournaments');
    return null;
  }

  const steps = [
    { id: 1, name: 'Información Básica', icon: Info },
    { id: 2, name: 'Fechas y Horarios', icon: Calendar },
    { id: 3, name: 'Reglas y Configuración', icon: Settings },
  ];

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.name && formData.province && formData.format;
      case 2:
        return formData.startDate && formData.registrationStart && formData.registrationEnd && formData.checkinStart && formData.checkinEnd;
      case 3:
        return true; // Reglas son opcionales
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    } else {
      toast.error('Por favor completa todos los campos requeridos');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('¡Torneo creado exitosamente!');
        router.push('/tournaments');
        router.refresh();
      } else {
        toast.error(data.error || 'Error al crear el torneo');
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a0a 100%)'}}>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)', boxShadow: '0 4px 20px rgba(220, 20, 60, 0.5)'}}>
                <Trophy className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-black text-white mb-2">Crear Torneo</h1>
            <p className="text-slate-400">Configura tu nuevo torneo de Super Smash Bros Ultimate</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                      currentStep >= step.id 
                        ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white' 
                        : 'bg-slate-800 text-slate-500'
                    }`}>
                      {currentStep > step.id ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <step.icon className="w-6 h-6" />
                      )}
                    </div>
                    <span className={`text-sm font-semibold text-center ${
                      currentStep >= step.id ? 'text-white' : 'text-slate-500'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-1 flex-1 mx-4 rounded-full transition-all ${
                      currentStep > step.id ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-slate-800'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Información Básica */}
            {currentStep === 1 && (
              <div className="card p-6 animate-fade-in-up">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                    <Info className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Información Básica</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="label">🏆 Nombre del Torneo *</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Torneo Smash Argentina 2024"
                      required
                    />
                    <p className="text-xs text-slate-500 mt-1">El nombre aparecerá en el listado de torneos</p>
                  </div>

                  <div>
                    <label className="label">📝 Descripción</label>
                    <textarea
                      className="input min-h-[100px]"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe tu torneo..."
                    />
                    <p className="text-xs text-slate-500 mt-1">Información adicional sobre el torneo</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="label">📍 Provincia *</label>
                      <select
                        className="input"
                        value={formData.province}
                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      >
                        {PROVINCES.map((prov) => (
                          <option key={prov} value={prov}>{prov}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="label">🎮 Formato *</label>
                      <select
                        className="input"
                        value={formData.format}
                        onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                      >
                        {TOURNAMENT_FORMATS.map((format) => (
                          <option key={format.value} value={format.value}>
                            {format.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50">
                      <Wifi className="w-5 h-5 text-blue-400" />
                      <div className="flex-1">
                        <label className="label mb-0">Torneo Online</label>
                        <p className="text-xs text-slate-500">Se juega por internet</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.isOnline}
                        onChange={(e) => setFormData({ ...formData, isOnline: e.target.checked })}
                        className="w-5 h-5 rounded accent-red-500"
                      />
                    </div>

                    <div>
                      <label className="label">👥 Máximo de Participantes</label>
                      <input
                        type="number"
                        className="input"
                        value={formData.maxParticipants}
                        onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                        placeholder="32"
                        min="2"
                      />
                      <p className="text-xs text-slate-500 mt-1">Opcional - Deja vacío para ilimitado</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Fechas y Horarios */}
            {currentStep === 2 && (
              <div className="card p-6 animate-fade-in-up">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Fechas y Horarios</h2>
                </div>

                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-300 font-semibold mb-1">💡 Fechas Pre-cargadas</p>
                        <p className="text-xs text-slate-400">
                          Hemos configurado fechas sugeridas automáticamente. Puedes modificarlas según necesites.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="label">🏁 Fecha y Hora de Inicio del Torneo *</label>
                    <input
                      type="datetime-local"
                      className="input"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                    <p className="text-xs text-slate-500 mt-1">Cuándo empieza el torneo</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="label">✅ Inscripciones Abren *</label>
                      <input
                        type="datetime-local"
                        className="input"
                        value={formData.registrationStart}
                        onChange={(e) => setFormData({ ...formData, registrationStart: e.target.value })}
                        required
                      />
                      <p className="text-xs text-slate-500 mt-1">Inicio de inscripciones</p>
                    </div>

                    <div>
                      <label className="label">🚫 Inscripciones Cierran *</label>
                      <input
                        type="datetime-local"
                        className="input"
                        value={formData.registrationEnd}
                        onChange={(e) => setFormData({ ...formData, registrationEnd: e.target.value })}
                        required
                      />
                      <p className="text-xs text-slate-500 mt-1">Cierre de inscripciones</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="label">⏰ Check-in Abre *</label>
                      <input
                        type="datetime-local"
                        className="input"
                        value={formData.checkinStart}
                        onChange={(e) => setFormData({ ...formData, checkinStart: e.target.value })}
                        required
                      />
                      <p className="text-xs text-slate-500 mt-1">Inicio de check-in</p>
                    </div>

                    <div>
                      <label className="label">⛔ Check-in Cierra *</label>
                      <input
                        type="datetime-local"
                        className="input"
                        value={formData.checkinEnd}
                        onChange={(e) => setFormData({ ...formData, checkinEnd: e.target.value })}
                        required
                      />
                      <p className="text-xs text-slate-500 mt-1">Cierre de check-in</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Reglas y Configuración */}
            {currentStep === 3 && (
              <div className="card p-6 animate-fade-in-up">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Reglas y Configuración</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="label">📋 Reglas del Torneo</label>
                    <textarea
                      className="input min-h-[120px]"
                      value={formData.rules}
                      onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                      placeholder="3 stocks, 7 minutos, sin items..."
                    />
                    <p className="text-xs text-slate-500 mt-1">Define las reglas generales del torneo</p>
                  </div>

                  <div>
                    <label className="label">🎮 Lista de Escenarios</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.stageList}
                      onChange={(e) => setFormData({ ...formData, stageList: e.target.value })}
                      placeholder="Battlefield, Final Destination, Smashville..."
                    />
                    <p className="text-xs text-slate-500 mt-1">Stages permitidos en el torneo</p>
                  </div>

                  {/* Resumen Final */}
                  <div className="mt-8 p-6 rounded-lg" style={{background: 'rgba(220, 20, 60, 0.1)', border: '2px solid rgba(220, 20, 60, 0.3)'}}>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" style={{color: '#ffd700'}} />
                      Resumen del Torneo
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">Nombre:</p>
                        <p className="text-white font-semibold">{formData.name || 'Sin nombre'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Formato:</p>
                        <p className="text-white font-semibold">
                          {TOURNAMENT_FORMATS.find(f => f.value === formData.format)?.label}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Ubicación:</p>
                        <p className="text-white font-semibold">
                          {formData.isOnline ? '🌐 Online' : `📍 ${formData.province}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Participantes:</p>
                        <p className="text-white font-semibold">
                          {formData.maxParticipants ? `Máx. ${formData.maxParticipants}` : 'Sin límite'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex gap-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn-secondary px-6 py-3 flex-1"
                >
                  ← Anterior
                </button>
              )}
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary px-6 py-3 flex-1"
                  disabled={!validateStep(currentStep)}
                >
                  Siguiente →
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn-primary px-6 py-3 flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="spinner w-5 h-5" />
                      Creando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Crear Torneo
                    </span>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 rounded-lg border-2 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
