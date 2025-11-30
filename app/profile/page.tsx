'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { User, Mail, MapPin, Calendar, Shield, Edit } from 'lucide-react';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="card p-8 mb-6 animate-fade-in-up">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white mb-2">{session.user.username}</h1>
                  {session.user.role === 'ADMIN' && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500 text-red-400 text-sm font-bold">
                      <Shield className="w-4 h-4" />
                      Administrador
                    </span>
                  )}
                </div>
              </div>
              <button className="btn-secondary px-4 py-2">
                <Edit className="w-4 h-4 mr-2 inline" />
                Editar Perfil
              </button>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Email</p>
                  <p className="text-white font-semibold">{session.user.email}</p>
                </div>
              </div>
            </div>

            <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Provincia</p>
                  <p className="text-white font-semibold">{session.user.province || 'No especificada'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-xl font-bold text-white mb-6">Estadísticas</h2>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-black text-white mb-1">0</div>
                <div className="text-sm text-slate-400">Torneos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-white mb-1">0</div>
                <div className="text-sm text-slate-400">Victorias</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-white mb-1">0</div>
                <div className="text-sm text-slate-400">Puntos</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
