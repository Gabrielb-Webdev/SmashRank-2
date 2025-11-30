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
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{
      background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.1) 0%, rgba(0, 0, 0, 0.9) 50%, rgba(255, 215, 0, 0.1) 100%)'
    }}>
      <div className="w-full max-w-md">
        <Card className="fade-in-up" style={{
          background: 'rgba(0, 0, 0, 0.8)',
          border: '2px solid rgba(220, 20, 60, 0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent mb-3">
              ¡Bienvenido de Vuelta!
            </CardTitle>
            <CardDescription className="text-base text-gray-300">
              Inicia sesión para continuar tu camino al top
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-sm font-semibold text-gray-200 mb-2 block">EMAIL</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={{
                    background: 'rgba(220, 20, 60, 0.1)',
                    border: '2px solid rgba(220, 20, 60, 0.3)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    fontSize: '16px',
                    color: 'white',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#dc143c'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(220, 20, 60, 0.3)'}
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-semibold text-gray-200 mb-2 block">CONTRASEÑA</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  style={{
                    background: 'rgba(220, 20, 60, 0.1)',
                    border: '2px solid rgba(220, 20, 60, 0.3)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    fontSize: '16px',
                    color: 'white',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#dc143c'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(220, 20, 60, 0.3)'}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full font-bold text-lg" 
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #dc143c 0%, #ff4500 100%)',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 15px rgba(220, 20, 60, 0.4)',
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? '🔄 Iniciando sesión...' : '🚀 INICIAR SESIÓN'}
              </Button>

              <p className="text-center text-base text-gray-300 mt-4">
                ¿No tienes cuenta?{' '}
                <Link href="/auth/signup" className="text-transparent bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text hover:from-orange-500 hover:to-yellow-500 transition-all font-bold">
                  Regístrate aquí
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
