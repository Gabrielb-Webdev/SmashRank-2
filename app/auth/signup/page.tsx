'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PROVINCES } from '@/lib/constants';
import toast from 'react-hot-toast';
import { Zap } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    province: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (!formData.province) {
      toast.error('Selecciona tu provincia');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          province: formData.province,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrarse');
      }

      toast.success('¡Registro exitoso! Redirigiendo...');
      router.push('/auth/signin');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{
      background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(0, 0, 0, 0.9) 50%, rgba(220, 20, 60, 0.1) 100%)'
    }}>
      <div className="w-full max-w-md">
        <Card className="fade-in-up" style={{
          background: 'rgba(0, 0, 0, 0.8)',
          border: '2px solid rgba(255, 215, 0, 0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                  <Zap className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent mb-3">
              ¡Únete a la Batalla!
            </CardTitle>
            <CardDescription className="text-base text-gray-300">
              Crea tu cuenta y comienza a competir en torneos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
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
                    background: 'rgba(255, 215, 0, 0.1)',
                    border: '2px solid rgba(255, 215, 0, 0.3)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    fontSize: '16px',
                    color: 'white'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#ffd700'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 215, 0, 0.3)'}
                />
              </div>

              <div>
                <Label htmlFor="username" className="text-sm font-semibold text-gray-200 mb-2 block">NOMBRE DE USUARIO / TAG</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="TuTag"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  style={{
                    background: 'rgba(255, 215, 0, 0.1)',
                    border: '2px solid rgba(255, 215, 0, 0.3)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    fontSize: '16px',
                    color: 'white'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#ffd700'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 215, 0, 0.3)'}
                />
              </div>

              <div>
                <Label htmlFor="province" className="text-sm font-semibold text-gray-200 mb-2 block">PROVINCIA</Label>
                <select
                  id="province"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  required
                  style={{
                    background: 'rgba(255, 215, 0, 0.1)',
                    border: '2px solid rgba(255, 215, 0, 0.3)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    fontSize: '16px',
                    color: 'white',
                    width: '100%',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#ffd700'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.3)'}
                >
                  <option value="" style={{background: '#1a1a1a'}}>Selecciona tu provincia</option>
                  {PROVINCES.map((province) => (
                    <option key={province} value={province} style={{background: '#1a1a1a'}}>
                      {province}
                    </option>
                  ))}
                </select>
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
                    background: 'rgba(255, 215, 0, 0.1)',
                    border: '2px solid rgba(255, 215, 0, 0.3)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    fontSize: '16px',
                    color: 'white'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#ffd700'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 215, 0, 0.3)'}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-200 mb-2 block">CONFIRMAR CONTRASEÑA</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  style={{
                    background: 'rgba(255, 215, 0, 0.1)',
                    border: '2px solid rgba(255, 215, 0, 0.3)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    fontSize: '16px',
                    color: 'white'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#ffd700'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 215, 0, 0.3)'}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full font-bold text-lg" 
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#000',
                  boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? '🔄 Creando cuenta...' : '⚡ CREAR CUENTA'}
              </Button>

              <p className="text-center text-base text-gray-300 mt-4">
                ¿Ya tienes cuenta?{' '}
                <Link href="/auth/signin" className="text-transparent bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text hover:from-orange-500 hover:to-red-500 transition-all font-bold">
                  Inicia Sesión aquí
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
