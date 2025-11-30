'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '../ui/button';
import { Menu, X, Trophy, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-900/95 backdrop-blur-sm border-b-4 border-primary sticky top-0 z-50 shadow-neon">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Trophy className="w-10 h-10 text-primary group-hover:text-secondary transition-colors" />
              <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-secondary/20 transition-colors" />
            </div>
            <span className="font-smash text-2xl md:text-3xl bg-gradient-to-r from-primary via-manga-yellow to-secondary bg-clip-text text-transparent">
              SmashRank
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/tournaments" className="text-white hover:text-primary transition-colors font-bold uppercase tracking-wide">
              Torneos
            </Link>
            <Link href="/rankings" className="text-white hover:text-primary transition-colors font-bold uppercase tracking-wide">
              Rankings
            </Link>
            <Link href="/players" className="text-white hover:text-primary transition-colors font-bold uppercase tracking-wide">
              Jugadores
            </Link>
            
            {session ? (
              <>
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin/dashboard">
                    <Button variant="outline" size="sm">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Link href="/profile">
                  <Button variant="secondary" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    {session.user.username}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="outline" size="sm">
                    Ingresar
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">
                    Registrarse
                  </Button>
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
          <div className="md:hidden py-4 space-y-4 border-t border-primary/30 animate-slide-in-right">
            <Link 
              href="/tournaments" 
              className="block text-white hover:text-primary transition-colors font-bold uppercase"
              onClick={() => setIsMenuOpen(false)}
            >
              Torneos
            </Link>
            <Link 
              href="/rankings" 
              className="block text-white hover:text-primary transition-colors font-bold uppercase"
              onClick={() => setIsMenuOpen(false)}
            >
              Rankings
            </Link>
            <Link 
              href="/players" 
              className="block text-white hover:text-primary transition-colors font-bold uppercase"
              onClick={() => setIsMenuOpen(false)}
            >
              Jugadores
            </Link>
            
            {session ? (
              <div className="space-y-4 pt-4 border-t border-primary/30">
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin/dashboard" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
                <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="secondary" size="sm" className="w-full">
                    <User className="w-4 h-4 mr-2" />
                    Mi Perfil
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            ) : (
              <div className="space-y-4 pt-4 border-t border-primary/30">
                <Link href="/auth/signin" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Ingresar
                  </Button>
                </Link>
                <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button size="sm" className="w-full">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
