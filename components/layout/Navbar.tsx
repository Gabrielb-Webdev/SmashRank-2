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
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-white">
              SmashRank
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <Link href="/tournaments" className="nav-link">
              Torneos
            </Link>
            <Link href="/rankings" className="nav-link">
              Rankings
            </Link>
            
            {session ? (
              <>
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin/dashboard" className="nav-link">
                    <LayoutDashboard className="inline w-4 h-4 mr-1" />
                    Admin
                  </Link>
                )}
                
                <div className="ml-4 flex items-center gap-2">
                  <Link href="/profile">
                    <button className="btn-ghost flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{session.user.username}</span>
                    </button>
                  </Link>
                  <button 
                    onClick={() => signOut()}
                    className="btn-icon"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="ml-4 flex items-center gap-3">
                <Link href="/auth/signin">
                  <button className="btn-secondary">
                    Ingresar
                  </button>
                </Link>
                <Link href="/auth/signup">
                  <button className="btn-primary">
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
              className="block px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              <Trophy className="inline w-4 h-4 mr-2" />
              Torneos
            </Link>
            <Link 
              href="/rankings" 
              className="block px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              <Award className="inline w-4 h-4 mr-2" />
              Rankings
            </Link>
            
            {session ? (
              <div className="space-y-2 pt-4 border-t border-slate-800">
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin/dashboard" onClick={() => setIsMenuOpen(false)}>
                    <button className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold text-left">
                      <LayoutDashboard className="inline w-4 h-4 mr-2" />
                      Admin Dashboard
                    </button>
                  </Link>
                )}
                <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full px-4 py-3 rounded-lg border-2 border-slate-700 text-slate-300 hover:border-white hover:text-white font-semibold text-left transition-all">
                    <User className="inline w-4 h-4 mr-2" />
                    Mi Perfil
                  </button>
                </Link>
                <button 
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-700 text-slate-300 hover:border-red-500 hover:text-red-400 font-semibold text-left transition-all"
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="inline w-4 h-4 mr-2" />
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-4 border-t border-slate-800">
                <Link href="/auth/signin" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full px-4 py-3 rounded-lg border-2 border-slate-700 text-slate-300 hover:border-white hover:text-white font-semibold transition-all">
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
