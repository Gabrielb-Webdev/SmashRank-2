'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PROVINCES, TOURNAMENT_FORMATS } from '@/lib/constants';
import toast from 'react-hot-toast';
import { Trophy } from 'lucide-react';

export default function CreateTournamentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    province: '',
    isOnline: false,
    format: 'DOUBLE_ELIMINATION',
    maxParticipants: '',
    startDate: '',
    registrationStart: '',
    registrationEnd: '',
    checkinStart: '',
    checkinEnd: '',
    rules: '',
    stageList: 'Battlefield, Final Destination, Smashville, Town & City, Pokémon Stadium 2',
  });

  // Redirigir si no es admin
  if (session?.user.role !== 'ADMIN') {
    router.push('/tournaments');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast.success('¡Torneo creado exitosamente!');
      router.push(`/tournaments/${data.slug}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-neon">
              <Trophy className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="title-manga text-4xl mb-2">Crear Torneo</h1>
          <p className="text-gray-400">Configura tu nuevo torneo de Smash Bros</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre del Torneo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="SmashRank Argentina - Regional CABA"
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <textarea
                  id="description"
                  className="flex w-full rounded-lg border-2 border-primary bg-gray-800/50 px-4 py-2 text-sm text-white placeholder:text-gray-400 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/50 min-h-[100px]"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción del torneo..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="province">Provincia *</Label>
                  <select
                    id="province"
                    className="flex h-11 w-full rounded-lg border-2 border-primary bg-gray-800/50 px-4 py-2 text-sm text-white focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/50"
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    required
                  >
                    <option value="">Selecciona provincia</option>
                    {PROVINCES.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="format">Formato *</Label>
                  <select
                    id="format"
                    className="flex h-11 w-full rounded-lg border-2 border-primary bg-gray-800/50 px-4 py-2 text-sm text-white focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/50"
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                    required
                  >
                    {TOURNAMENT_FORMATS.map((format) => (
                      <option key={format.value} value={format.value}>
                        {format.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isOnline"
                    checked={formData.isOnline}
                    onChange={(e) => setFormData({ ...formData, isOnline: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <Label htmlFor="isOnline" className="mb-0">Torneo Online</Label>
                </div>

                <div>
                  <Label htmlFor="maxParticipants">Máximo de Participantes</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                    placeholder="32"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Fechas y Horarios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="startDate">Fecha y Hora de Inicio *</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="registrationStart">Inscripciones Abren *</Label>
                  <Input
                    id="registrationStart"
                    type="datetime-local"
                    value={formData.registrationStart}
                    onChange={(e) => setFormData({ ...formData, registrationStart: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="registrationEnd">Inscripciones Cierran *</Label>
                  <Input
                    id="registrationEnd"
                    type="datetime-local"
                    value={formData.registrationEnd}
                    onChange={(e) => setFormData({ ...formData, registrationEnd: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="checkinStart">Check-in Abre *</Label>
                  <Input
                    id="checkinStart"
                    type="datetime-local"
                    value={formData.checkinStart}
                    onChange={(e) => setFormData({ ...formData, checkinStart: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="checkinEnd">Check-in Cierra *</Label>
                  <Input
                    id="checkinEnd"
                    type="datetime-local"
                    value={formData.checkinEnd}
                    onChange={(e) => setFormData({ ...formData, checkinEnd: e.target.value })}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Reglas y Configuración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="rules">Reglas del Torneo</Label>
                <textarea
                  id="rules"
                  className="flex w-full rounded-lg border-2 border-primary bg-gray-800/50 px-4 py-2 text-sm text-white placeholder:text-gray-400 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/50 min-h-[100px]"
                  value={formData.rules}
                  onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                  placeholder="3 stocks, 7 minutos, sin items..."
                />
              </div>

              <div>
                <Label htmlFor="stageList">Lista de Escenarios</Label>
                <Input
                  id="stageList"
                  value={formData.stageList}
                  onChange={(e) => setFormData({ ...formData, stageList: e.target.value })}
                  placeholder="Battlefield, Final Destination, Smashville..."
                />
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Torneo'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
