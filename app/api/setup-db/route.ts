import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';

/**
 * Endpoint para crear las tablas en la base de datos
 * Ejecuta prisma db push
 * GET /api/setup-db
 */
export async function GET(req: NextRequest) {
  try {
    // Ejecutar prisma db push para crear las tablas
    const output = execSync('npx prisma db push --accept-data-loss', {
      encoding: 'utf-8',
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Tablas creadas exitosamente',
      output: output,
      nextStep: 'Ahora visita /api/init-db para poblar la base de datos con datos de prueba',
    });
  } catch (error: any) {
    console.error('Error al crear tablas:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error al crear tablas',
        details: error.message,
        stdout: error.stdout?.toString(),
        stderr: error.stderr?.toString(),
        alternative: 'Ejecuta manualmente: npx prisma db push',
      },
      { status: 500 }
    );
  }
}
