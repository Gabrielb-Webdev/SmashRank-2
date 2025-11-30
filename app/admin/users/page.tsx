'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Shield, Trash2, UserCog, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

interface User {
  id: string;
  email: string;
  username: string;
  role: 'ADMIN' | 'USER';
  province: string;
  createdAt: string;
  _count: {
    registrations: number;
    tournamentsCreated: number;
    matchesWon: number;
  };
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (session && session.user.role !== 'ADMIN') {
      router.push('/');
    } else {
      fetchUsers();
    }
  }, [session, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    if (!confirm(`¿Cambiar rol de este usuario?`)) return;

    setActionLoading(userId);
    try {
      const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        toast.success('Rol actualizado');
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Error al actualizar rol');
      }
    } catch (error) {
      toast.error('Error al actualizar usuario');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`¿Eliminar al usuario "${username}"? Esta acción no se puede deshacer.`)) return;

    setActionLoading(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Usuario eliminado');
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Error al eliminar usuario');
      }
    } catch (error) {
      toast.error('Error al eliminar usuario');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCleanDatabase = async () => {
    if (!confirm('⚠️ ADVERTENCIA: Esto eliminará TODOS los datos de torneos, partidas y registros. ¿Estás seguro?')) return;
    if (!confirm('¿REALMENTE estás seguro? Esta acción es IRREVERSIBLE.')) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/clean-db', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Base de datos limpiada exitosamente');
      } else {
        toast.error('Error al limpiar la base de datos');
      }
    } catch (error) {
      toast.error('Error al limpiar la base de datos');
    } finally {
      setLoading(false);
    }
  };

  if (!session || session.user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a0a 100%)'}}>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)', boxShadow: '0 4px 20px rgba(220, 20, 60, 0.5)'}}>
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-black text-white">Gestión de Usuarios</h1>
          </div>
          <p className="text-slate-400 ml-15">Administra usuarios y permisos del sistema</p>
        </div>

        {/* Danger Zone */}
        <div className="card mb-8 p-6 border-2" style={{borderColor: 'rgba(220, 20, 60, 0.5)', background: 'rgba(139, 0, 0, 0.1)'}}>
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-red-500 mb-2">Zona de Peligro</h3>
              <p className="text-slate-300 mb-4">Elimina todos los datos de torneos, partidas y registros. Los usuarios y personajes se mantienen.</p>
              <button
                onClick={handleCleanDatabase}
                disabled={loading}
                className="px-4 py-2 rounded-lg font-bold text-white transition-all"
                style={{background: 'linear-gradient(135deg, #dc143c 0%, #8b0000 100%)', boxShadow: '0 4px 12px rgba(220, 20, 60, 0.4)'}}
              >
                Limpiar Base de Datos
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Usuarios Registrados ({users.length})</h2>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">Usuario</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">Rol</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">Provincia</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">Actividad</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">Registro</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold" style={{background: user.role === 'ADMIN' ? 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)' : 'rgba(100, 100, 100, 0.5)'}}>
                            {user.username[0].toUpperCase()}
                          </div>
                          <span className="text-white font-semibold">{user.username}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-400">{user.email}</td>
                      <td className="py-4 px-4">
                        {user.role === 'ADMIN' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold" style={{background: 'rgba(220, 20, 60, 0.2)', color: '#ffd700', border: '1px solid rgba(255, 215, 0, 0.5)'}}>
                            <Shield className="w-3 h-3" />
                            ADMIN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-300">
                            USER
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-slate-400">{user.province}</td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <div className="text-slate-300">{user._count.registrations} torneos</div>
                          <div className="text-slate-500">{user._count.matchesWon} victorias</div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-400 text-sm">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleRole(user.id, user.role)}
                            disabled={actionLoading === user.id || user.id === session?.user.id}
                            className="p-2 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={user.role === 'ADMIN' ? 'Quitar admin' : 'Hacer admin'}
                          >
                            <UserCog className="w-5 h-5 text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.username)}
                            disabled={actionLoading === user.id || user.id === session?.user.id}
                            className="p-2 rounded-lg hover:bg-red-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-5 h-5 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
