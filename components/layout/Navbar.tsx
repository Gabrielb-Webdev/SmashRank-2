'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, Trophy, User, LogOut, LayoutDashboard, Award, Gamepad2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled shadow-lg' : ''}`}>
      <div className="container">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <Trophy className="w-8 h-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" style={{color: '#ffd700'}} />
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white transition-colors leading-none" style={{textShadow: '0 0 20px rgba(220, 20, 60, 0.3)'}}>
                SmashRank
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider leading-none" style={{color: '#ffd700', textShadow: '0 0 10px rgba(255, 215, 0, 0.5)'}}>
                Ultimate
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/tournaments" className="nav-link px-4 py-2 hover:bg-slate-800 rounded-lg transition-all">
              <Gamepad2 className="inline w-4 h-4 mr-2" />
              Torneos
            </Link>
            <Link href="/rankings" className="nav-link px-4 py-2 hover:bg-slate-800 rounded-lg transition-all">
              <Award className="inline w-4 h-4 mr-2" />
              Rankings
            </Link>
            
            {session ? (
              <>
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin/dashboard">
                    <div className="px-4 py-2 rounded-lg transition-all group" style={{background: 'rgba(220, 20, 60, 0.15)', border: '1px solid rgba(220, 20, 60, 0.4)'}}>
                      <LayoutDashboard className="inline w-4 h-4 mr-2" style={{color: '#ffd700'}} />
                      <span className="font-semibold" style={{color: '#ffd700'}}>Admin</span>
                    </div>
                  </Link>
                )}
                
                <div className="ml-4 flex items-center gap-2">
                  <Link href="/profile">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all" style={{background: 'rgba(26, 10, 10, 0.8)', border: '1px solid rgba(220, 20, 60, 0.3)'}}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)', boxShadow: '0 0 15px rgba(220, 20, 60, 0.5)'}}>
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-semibold text-white">{session.user.username}</span>
                    </button>
                  </Link>
                  <button 
                    onClick={() => signOut()}
                    className="p-2 rounded-lg transition-all group"
                    style={{background: 'rgba(26, 10, 10, 0.8)', border: '1px solid rgba(220, 20, 60, 0.3)'}}
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-5 h-5 group-hover:text-white" style={{color: '#c79da0'}} />
                  </button>
                </div>
              </>
            ) : (
              <div className="ml-4 flex items-center gap-3">
                <Link href="/auth/signin">
                  <button className="btn-secondary px-6 py-2.5">
                    Ingresar
                  </button>
                </Link>
                <Link href="/auth/signup">
                  <button className="btn-primary px-6 py-2.5">
                    Registrarse
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2 hover:bg-slate-800 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-slate-800 animate-fade-in-up">
            <Link 
              href="/tournaments" 
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              <Gamepad2 className="w-5 h-5" />
              <span>Torneos</span>
            </Link>
            <Link 
              href="/rankings" 
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              <Award className="w-5 h-5" />
              <span>Rankings</span>
            </Link>
            
            {session ? (
              <div className="space-y-2 pt-4 border-t border-slate-800">
                {/* User Info */}
                <div className="px-4 py-3 rounded-lg mb-3" style={{background: 'rgba(26, 10, 10, 0.6)', border: '1px solid rgba(220, 20, 60, 0.3)'}}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background: 'linear-gradient(135deg, #dc143c 0%, #ffd700 100%)', boxShadow: '0 0 15px rgba(220, 20, 60, 0.5)'}}>
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{session.user.username}</p>
                      <p className="text-xs text-slate-400">{session.user.email}</p>
                    </div>
                  </div>
                </div>

                {session.user.role === 'ADMIN' && (
                  <Link href="/admin/dashboard" onClick={() => setIsMenuOpen(false)}>
                    <button className="w-full px-4 py-3 rounded-lg font-semibold text-left transition-all" style={{background: 'rgba(220, 20, 60, 0.15)', border: '1px solid rgba(220, 20, 60, 0.4)', color: '#ffd700'}}>
                      <LayoutDashboard className="inline w-5 h-5 mr-3" />
                      Panel de Admin
                    </button>
                  </Link>
                )}
                <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full px-4 py-3 rounded-lg text-white font-semibold text-left transition-all" style={{background: 'rgba(26, 10, 10, 0.8)', border: '1px solid rgba(220, 20, 60, 0.3)'}}>
                    <User className="inline w-5 h-5 mr-3" />
                    Mi Perfil
                  </button>
                </Link>
                <button 
                  className="w-full px-4 py-3 rounded-lg font-semibold text-left transition-all"
                  style={{background: 'rgba(26, 10, 10, 0.8)', border: '1px solid rgba(220, 20, 60, 0.3)', color: '#f8d7da'}}
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="inline w-5 h-5 mr-3" />
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-4 border-t border-slate-800">
                <Link href="/auth/signin" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white hover:border-white font-semibold transition-all">
                    Ingresar
                  </button>
                </Link>
                <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all">
                    Registrarse
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
