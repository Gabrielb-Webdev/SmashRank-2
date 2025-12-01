import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  // La fecha viene de la DB como ISO string en UTC
  // Intl.DateTimeFormat automáticamente la convertirá a la zona horaria local del navegador del usuario
  // Si creas el torneo a las 22:00 en Argentina y alguien lo ve desde España (UTC+1), verá 02:00 del día siguiente
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    // NO especificamos timeZone para que use la zona horaria local del usuario
  }).format(d);
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function generateBracket(participants: number): any {
  // Encuentra la potencia de 2 más cercana
  const roundedParticipants = Math.pow(2, Math.ceil(Math.log2(participants)));
  const rounds = Math.log2(roundedParticipants);
  
  return {
    rounds,
    totalMatches: roundedParticipants - 1,
    participantsWithBye: roundedParticipants - participants,
  };
}

export function calculateSeeding(registrations: any[]): any[] {
  // Ordenar por fecha de registro (primero inscrito = mejor seed)
  return registrations
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((reg, index) => ({
      ...reg,
      seed: index + 1,
    }));
}

export function isAdmin(role: string): boolean {
  return role === 'ADMIN';
}

export function canEditTournament(userId: string, tournamentCreatorId: string, role: string): boolean {
  return userId === tournamentCreatorId || role === 'ADMIN';
}
