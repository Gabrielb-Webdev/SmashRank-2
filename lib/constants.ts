export const PROVINCES = [
  'Buenos Aires',
  'CABA',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
] as const;

export type Province = typeof PROVINCES[number];

export const TOURNAMENT_FORMATS = [
  { value: 'SINGLE_ELIMINATION', label: 'Single Elimination' },
  { value: 'DOUBLE_ELIMINATION', label: 'Double Elimination' },
  { value: 'ROUND_ROBIN', label: 'Round Robin' },
  { value: 'SWISS', label: 'Swiss' },
] as const;

export const TOURNAMENT_STATUSES = [
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'REGISTRATION_OPEN', label: 'Inscripciones Abiertas' },
  { value: 'REGISTRATION_CLOSED', label: 'Inscripciones Cerradas' },
  { value: 'CHECKIN_OPEN', label: 'Check-in Abierto' },
  { value: 'IN_PROGRESS', label: 'En Progreso' },
  { value: 'COMPLETED', label: 'Completado' },
  { value: 'CANCELLED', label: 'Cancelado' },
] as const;

export const MATCH_STATUSES = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'IN_PROGRESS', label: 'En Progreso' },
  { value: 'COMPLETED', label: 'Completado' },
  { value: 'DQ', label: 'Descalificado' },
] as const;
