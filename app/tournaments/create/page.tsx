'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { TOURNAMENT_FORMATS } from '@/lib/constants';
import toast from 'react-hot-toast';
import { Trophy, Calendar, MapPin, Users, Settings, Wifi, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import DateTimePicker from '@/components/DateTimePicker';

export default function CreateTournamentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isOnline: true,
    format: 'DOUBLE_ELIMINATION',
    maxParticipants: '32',
    startDate: '',
    stockCount: '3',
    timeLimit: '7',
    itemsRule: 'SIN_ITEMS',
    stages: [] as string[],
  });

  const participantOptions = ['8', '16', '32', '64', '128', '256'];
  const stockOptions = ['1', '2', '3', '4', '5'];
  const timeLimitOptions = ['3', '5', '6', '7', '8', '10', '12', '15'];
  
  const itemsOptions = [
    { value: 'SIN_ITEMS', label: 'Sin Items' },
    { value: 'TODOS', label: 'Todos los Items' },
    { value: 'SOLO_POKEBOLAS', label: 'Solo Pokébolas y Esferas Asistentes' },
    { value: 'PERSONALIZADOS', label: 'Items Personalizados' },
  ];

  const stageOptions = [
    'Battlefield',
    'Final Destination',
    'Smashville',
    'Town & City',
    'Pokémon Stadium 2',
    'Kalos Pokémon League',
    'Lylat Cruise',
    'Yoshi\'s Story',
    'Hollow Bastion',
    'Northern Cave',
    'Small Battlefield',
  ];

  // Auto-calcular fecha sugerida
  useEffect(() => {
    if (!formData.startDate) {
      const now = new Date();
      const startDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 días

      setFormData(prev => ({
        ...prev,
        startDate: formatDateTimeLocal(startDate),
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
        return formData.name && formData.format && formData.maxParticipants;
      case 2:
        return formData.startDate;
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    // Solo crear el torneo si estamos en el paso 3
    if (currentStep !== 3) {
      return;
    }
    
    setLoading(true);

    try {
      // Construir reglas y stageList a partir de los campos individuales
      const itemsLabel = itemsOptions.find(opt => opt.value === formData.itemsRule)?.label || 'Sin Items';
      const rules = `${formData.stockCount} stocks, ${formData.timeLimit} minutos, ${itemsLabel}`;
      const stageList = formData.stages.length > 0 ? formData.stages.join(', ') : 'Battlefield, Final Destination, Smashville, Town & City, Pokémon Stadium 2';

      const payload = {
        name: formData.name,
        description: formData.description || '',
        format: formData.format,
        maxParticipants: parseInt(formData.maxParticipants) || 16,
        startDate: formData.startDate,
        rules,
        stageList,
      };

      console.log('📤 Enviando datos al servidor:', payload);

      const res = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      console.log('📥 Respuesta del servidor:', { status: res.status, data });

      if (res.ok) {
        toast.success('¡Torneo creado exitosamente!');
        router.push('/tournaments');
        router.refresh();
      } else {
        console.error('❌ Error del servidor:', data);
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

          <div>
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
                      <label className="label">🎮 Formato *</label>
                      <select
                        className="input text-base font-semibold"
                        value={formData.format}
                        onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                      >
                        {TOURNAMENT_FORMATS.map((format) => (
                          <option key={format.value} value={format.value}>
                            {format.icon} {format.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-slate-500 mt-1">Tipo de bracket del torneo</p>
                    </div>

                    <div>
                      <label className="label">👥 Máximo de Participantes *</label>
                      <select
                        className="input"
                        value={formData.maxParticipants}
                        onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                        required
                      >
                        {participantOptions.map((num) => (
                          <option key={num} value={num}>{num} participantes</option>
                        ))}
                      </select>
                      <p className="text-xs text-slate-500 mt-1">Capacidad del torneo</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-start gap-3">
                      <Wifi className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-green-300 font-semibold mb-1">🌐 Torneo Online</p>
                        <p className="text-xs text-slate-400">
                          Todos los torneos son online. Los usuarios indican su provincia en su perfil para rankings regionales.
                        </p>
                      </div>
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
                        <p className="text-sm text-blue-300 font-semibold mb-1">💡 Fechas Automáticas</p>
                        <p className="text-xs text-slate-400">
                          Las inscripciones se abren al publicar. El check-in se abre 30 minutos antes del inicio. Ambos cierran cuando inicia el torneo.
                        </p>
                      </div>
                    </div>
                  </div>

                  <DateTimePicker
                    label="🏁 Fecha y Hora de Inicio del Torneo"
                    value={formData.startDate}
                    onChange={(value) => setFormData({ ...formData, startDate: value })}
                    color="red"
                    icon={<Calendar className="w-4 h-4 text-white" />}
                    min={new Date().toISOString().slice(0, 16)}
                    required
                  />

                  <div className="p-4 rounded-lg" style={{background: 'rgba(34, 197, 94, 0.1)', border: '2px solid rgba(34, 197, 94, 0.3)'}}>
                    <h4 className="font-bold text-green-400 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Fechas Automáticas Configuradas
                    </h4>
                    <div className="space-y-2 text-sm text-slate-300">
                      <p>✅ <strong>Inscripciones:</strong> Abiertas al publicar hasta el inicio</p>
                      <p>⏰ <strong>Check-in:</strong> Abierto 30 minutos antes del inicio</p>
                      <p>🏁 <strong>Cierre:</strong> Ambos cierran cuando inicia el torneo</p>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="label">💪 Cantidad de Stocks</label>
                      <select
                        className="input"
                        value={formData.stockCount}
                        onChange={(e) => setFormData({ ...formData, stockCount: e.target.value })}
                      >
                        {stockOptions.map(stock => (
                          <option key={stock} value={stock}>
                            {stock} {stock === '1' ? 'stock' : 'stocks'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="label">⏱️ Tiempo Límite</label>
                      <select
                        className="input"
                        value={formData.timeLimit}
                        onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
                      >
                        {timeLimitOptions.map(time => (
                          <option key={time} value={time}>
                            {time} minutos
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="label">📦 Items</label>
                      <select
                        className="input"
                        value={formData.itemsRule}
                        onChange={(e) => setFormData({ ...formData, itemsRule: e.target.value })}
                      >
                        {itemsOptions.map(item => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label">🎮 Escenarios Permitidos</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 rounded-lg" style={{background: 'rgba(15, 23, 42, 0.6)', border: '2px solid rgba(220, 20, 60, 0.2)'}}>
                      {stageOptions.map(stage => (
                        <label key={stage} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={formData.stages.includes(stage)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, stages: [...formData.stages, stage] });
                              } else {
                                setFormData({ ...formData, stages: formData.stages.filter(s => s !== stage) });
                              }
                            }}
                            className="w-4 h-4 rounded border-2 border-slate-600 bg-slate-800 checked:bg-gradient-to-br checked:from-red-500 checked:to-orange-500 focus:ring-2 focus:ring-red-500"
                          />
                          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{stage}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Selecciona los escenarios permitidos para el torneo</p>
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
                        <p className="text-slate-400">Modalidad:</p>
                        <p className="text-white font-semibold">🌐 Online</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Capacidad:</p>
                        <p className="text-white font-semibold">Máx. {formData.maxParticipants} jugadores</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Reglas:</p>
                        <p className="text-white font-semibold">
                          {formData.stockCount} stocks, {formData.timeLimit} min, {itemsOptions.find(opt => opt.value === formData.itemsRule)?.label}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Escenarios:</p>
                        <p className="text-white font-semibold">
                          {formData.stages.length > 0 ? `${formData.stages.length} seleccionados` : 'Usar predeterminados'}
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
                  type="button"
                  onClick={() => handleSubmit()}
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
          </div>
        </div>
      </div>
    </div>
  );
}
