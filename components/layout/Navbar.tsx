'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, Trophy, User, LogOut, LayoutDashboard, Award } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b-8 border-black sticky top-0 z-50" style={{ boxShadow: '0 8px 0 0 rgba(0, 0, 0, 0.2)' }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <Trophy className="w-10 h-10 text-black" />
            <span className="text-3xl md:text-4xl font-black uppercase tracking-tight">
              SmashRank
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            <Link 
              href="/tournaments" 
              className="px-4 py-2 font-bold uppercase tracking-wide hover:bg-black hover:text-white transition-all border-2 border-transparent hover:border-black"
            >
              Torneos
            </Link>
            <Link 
              href="/rankings" 
              className="px-4 py-2 font-bold uppercase tracking-wide hover:bg-black hover:text-white transition-all border-2 border-transparent hover:border-black"
            >
              Rankings
            </Link>
            
            {session ? (
              <>
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin/dashboard">
                    <button className="px-4 py-2 bg-black text-white font-bold uppercase border-4 border-black hover:bg-white hover:text-black transition-all">
                      <LayoutDashboard className="inline w-4 h-4 mr-2" />
                      Admin
                    </button>
                  </Link>
                )}
                <Link href="/profile">
                  <button className="px-4 py-2 bg-white border-4 border-black font-bold uppercase hover:bg-black hover:text-white transition-all">
                    <User className="inline w-4 h-4 mr-2" />
                    {session.user.username}
                  </button>
                </Link>
                <button 
                  onClick={() => signOut()}
                  className="p-2 border-4 border-black hover:bg-black hover:text-white transition-all"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <button className="px-6 py-2 bg-white border-4 border-black font-bold uppercase hover:bg-black hover:text-white transition-all">
                    INGRESAR
                  </button>
                </Link>
                <Link href="/auth/signup">
                  <button className="px-6 py-2 bg-black text-white border-4 border-black font-bold uppercase hover:bg-white hover:text-black transition-all">
                    REGISTRARSE
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t-4 border-black bg-white">
            <Link 
              href="/tournaments" 
              className="block px-4 py-3 border-4 border-black font-bold uppercase hover:bg-black hover:text-white transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              Torneos
            </Link>
            <Link 
              href="/rankings" 
              className="block px-4 py-3 border-4 border-black font-bold uppercase hover:bg-black hover:text-white transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              Rankings
            </Link>
            
            {session ? (
              <div className="space-y-3 pt-4 border-t-4 border-black">
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin/dashboard" onClick={() => setIsMenuOpen(false)}>
                    <button className="w-full px-4 py-3 bg-black text-white border-4 border-black font-bold uppercase">
                      <LayoutDashboard className="inline w-4 h-4 mr-2" />
                      Admin Dashboard
                    </button>
                  </Link>
                )}
                <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full px-4 py-3 bg-white border-4 border-black font-bold uppercase hover:bg-black hover:text-white transition-all">
                    <User className="inline w-4 h-4 mr-2" />
                    Mi Perfil
                  </button>
                </Link>
                <button 
                  className="w-full px-4 py-3 border-4 border-black font-bold uppercase hover:bg-black hover:text-white transition-all"
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
              <div className="space-y-3 pt-4 border-t-4 border-black">
                <Link href="/auth/signin" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full px-4 py-3 bg-white border-4 border-black font-bold uppercase hover:bg-black hover:text-white transition-all">
                    INGRESAR
                  </button>
                </Link>
                <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full px-4 py-3 bg-black text-white border-4 border-black font-bold uppercase hover:bg-white hover:text-black transition-all">
                    REGISTRARSE
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
