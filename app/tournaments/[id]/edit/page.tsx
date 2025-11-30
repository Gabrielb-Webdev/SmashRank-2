'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { TOURNAMENT_FORMATS } from '@/lib/constants';
import toast from 'react-hot-toast';
import { Trophy, Calendar, Settings, Wifi, Info, CheckCircle2, ArrowLeft } from 'lucide-react';
import DateTimePicker from '@/components/DateTimePicker';
import Link from 'next/link';

export default function EditTournamentPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    format: 'DOUBLE_ELIMINATION',
    maxParticipants: '32',
    startDate: '',
    rules: '3 stocks, 7 minutos, sin items',
    stageList: 'Battlefield, Final Destination, Smashville, Town & City, Pokémon Stadium 2',
  });

  const participantOptions = ['8', '16', '32', '64', '128', '256'];
  const tournamentId = params.id;

  useEffect(() => {
    fetchTournament();
  }, [tournamentId]);

  const fetchTournament = async () => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}`);
      const data = await response.json();

      if (response.ok) {
        setFormData({
          name: data.name || '',
          description: data.description || '',
          format: data.format || 'DOUBLE_ELIMINATION',
          maxParticipants: String(data.maxParticipants || 32),
          startDate: formatDateTimeLocal(new Date(data.startDate)),
          rules: data.rules || '3 stocks, 7 minutos, sin items',
          stageList: data.stageList || 'Battlefield, Final Destination, Smashville, Town & City, Pokémon Stadium 2',
        });
      } else {
        toast.error('Error al cargar el torneo');
        router.push('/tournaments');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar el torneo');
      router.push('/tournaments');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
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
        return true;
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
    
    if (!validateStep(currentStep)) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setSaving(true);
    
    try {
      const payload = {
        name: formData.name,
        description: formData.description || '',
        format: formData.format,
        maxParticipants: parseInt(formData.maxParticipants),
        startDate: formData.startDate,
        rules: formData.rules || '',
        stageList: formData.stageList || '',
      };

      const response = await fetch(`/api/tournaments/${tournamentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar torneo');
      }

      toast.success('¡Torneo actualizado exitosamente!');
      router.push(`/tournaments/${tournamentId}`);
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar el torneo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href={`/tournaments/${tournamentId}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              Volver al Torneo
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white mb-2">Editar Torneo</h1>
                <p className="text-slate-400">Modifica la configuración del torneo de Super Smash Bros Ultimate</p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className={`flex items-center gap-3 ${currentStep >= step.id ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                    currentStep >= step.id 
                      ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg' 
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-semibold text-white">{step.name}</p>
                    <p className="text-xs text-slate-500">Paso {step.id}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 rounded-full transition-all ${
                    currentStep > step.id ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-slate-800'
                  }`} />
                )}
              </div>
            ))}
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
                      placeholder="Ej: Torneo Nacional 2025"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">📝 Descripción</label>
                    <textarea
                      className="input min-h-[100px]"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe tu torneo..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="label">🎯 Formato de Competencia *</label>
                      <select
                        className="input"
                        value={formData.format}
                        onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                        required
                      >
                        {TOURNAMENT_FORMATS.map(format => (
                          <option key={format.value} value={format.value}>
                            {format.icon} {format.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="label">👥 Máximo de Participantes *</label>
                      <select
                        className="input"
                        value={formData.maxParticipants}
                        onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                        required
                      >
                        {participantOptions.map(option => (
                          <option key={option} value={option}>
                            {option} jugadores
                          </option>
                        ))}
                      </select>
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
                          Las inscripciones y check-in se abren al guardar cambios y se cierran automáticamente cuando inicia.
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
                      <p>✅ <strong>Inscripciones:</strong> Abiertas ahora hasta el inicio</p>
                      <p>⏰ <strong>Check-in:</strong> Abierto ahora hasta el inicio</p>
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
                    <p className="text-xs text-slate-500 mt-1">Escenarios permitidos separados por comas</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-6">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-3 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors border-2 border-slate-700"
                >
                  ← Anterior
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 py-3 rounded-lg font-bold text-white transition-all hover:scale-105"
                  style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)', boxShadow: '0 4px 15px rgba(220, 20, 60, 0.4)'}}
                >
                  Siguiente →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-lg font-bold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)', boxShadow: '0 4px 15px rgba(220, 20, 60, 0.4)'}}
                >
                  {saving ? 'Guardando...' : '✓ Guardar Cambios'}
                </button>
              )}

              <Link
                href={`/tournaments/${tournamentId}`}
                className="py-3 px-6 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border-2 border-slate-700"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
