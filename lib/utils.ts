import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  let d: Date;
  
  if (typeof date === 'string') {
    // Parsear como UTC para evitar conversión de zona horaria
    const utcDate = new Date(date);
    // Crear nueva fecha usando los componentes UTC como si fueran locales
    d = new Date(
      utcDate.getUTCFullYear(),
      utcDate.getUTCMonth(),
      utcDate.getUTCDate(),
      utcDate.getUTCHours(),
      utcDate.getUTCMinutes(),
      utcDate.getUTCSeconds()
    );
  } else {
    d = date;
  }
  
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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
