'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { Trophy } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Email o contraseña incorrectos');
      } else {
        toast.success('¡Bienvenido de vuelta!');
        router.push('/tournaments');
        router.refresh();
      }
    } catch (error) {
      toast.error('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="fade-in-up">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-neon">
                <Trophy className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl">¡Bienvenido de Vuelta!</CardTitle>
            <CardDescription>
              Inicia sesión para continuar tu camino al top
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>

              <p className="text-center text-sm text-gray-400">
                ¿No tienes cuenta?{' '}
                <Link href="/auth/signup" className="text-primary hover:text-secondary transition-colors font-bold">
                  Regístrate
                </Link>
              </p>
            </form>

            <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-primary/30">
              <p className="text-xs text-gray-400 mb-2 font-bold">Cuentas de prueba:</p>
              <p className="text-xs text-gray-400">Admin: admin@smashrank.ar / admin123</p>
              <p className="text-xs text-gray-400">Usuario: user1@smashrank.ar / user123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
