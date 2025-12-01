import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const stages = await prisma.stage.findMany({
      where: { legal: true },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(stages);
  } catch (error) {
    console.error('Error al obtener stages:', error);
    return NextResponse.json(
      { error: 'Error al obtener stages' },
      { status: 500 }
    );
  }
}
