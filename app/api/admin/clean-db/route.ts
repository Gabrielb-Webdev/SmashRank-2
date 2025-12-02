import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Limpiar base de datos (solo admin)
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    // Eliminar datos en orden correcto para respetar relaciones
    await prisma.$transaction([
      // Eliminar matches primero
      prisma.match.deleteMany({}),
      // Eliminar registrations
      prisma.registration.deleteMany({}),
      // Eliminar rankings
      prisma.ranking.deleteMany({}),
      // Eliminar torneos
      prisma.tournament.deleteMany({}),
      // No eliminamos usuarios ni personajes
    ]);

    return NextResponse.json({ 
      success: true,
      message: 'Datos de torneos limpiados exitosamente'
    });
  } catch (error) {
    console.error('Error al limpiar base de datos:', error);
    return NextResponse.json(
      { error: 'Error al limpiar la base de datos' },
      { status: 500 }
    );
  }
}
