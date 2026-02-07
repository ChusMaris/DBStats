export type IdType = number | string;

export interface Temporada {
  id: IdType;
  nombre: string;
}

export interface Categoria {
  id: IdType;
  nombre: string;
  es_mini: boolean;
}

export interface Competicion {
  id: IdType;
  nombre: string;
  temporada_id: IdType;
  categoria_id: IdType;
  categorias?: Categoria; // For joins
}

export interface Club {
  id: IdType;
  nombre: string;
  logo_url: string | null;
  nombre_corto: string;
}

export interface Equipo {
  id: IdType;
  club_id: IdType;
  nombre_especifico: string;
  competicion_id: IdType;
  clubs?: Club;
}

export interface Partido {
  id: IdType;
  competicion_id: IdType;
  equipo_local_id: IdType;
  equipo_visitante_id: IdType;
  puntos_local: number | null;
  puntos_visitante: number | null;
  fecha_hora: string;
  jornada: number;
  equipos_local?: { nombre_especifico: string; clubs: { nombre_corto: string; logo_url: string | null } };
  equipos_visitante?: { nombre_especifico: string; clubs: { nombre_corto: string; logo_url: string | null } };
}

export interface Jugador {
  id: IdType;
  nombre_completo: string;
  foto_url: string | null;
}

export interface Plantilla {
  equipo_id: IdType;
  jugador_id: IdType;
  dorsal: string;
  jugadores?: Jugador;
}

export interface EstadisticaJugador {
  id: IdType;
  partido_id: IdType;
  jugador_id: IdType;
  puntos: number;
  minutos: number; 
  faltas_personales: number;
  t1_anotados: number;
  t1_intentados: number;
  t2_anotados: number;
  t2_intentados: number;
  t3_anotados: number;
  t3_intentados: number;
  faltas_cometidas?: number;
  // Calculated fields for UI
  partidos?: Partido;
}

// UI Specific Types
export interface TeamStanding {
  equipoId: IdType;
  nombre: string;
  club: string;
  logo: string | null;
  pj: number;
  pg: number;
  pp: number;
  pf: number;
  pc: number;
  puntos: number;
}

export interface PlayerAggregatedStats {
  jugadorId: IdType;
  nombre: string;
  foto: string | null;
  dorsal: string;
  pj: number;
  puntosTotal: number;
  minutosTotal: number;
  faltasTotal: number;
  t1_anotados: number;
  t1_intentados: number;
  ppg: number;
  mpg: number;
  fpg: number;
  ppm: number;
}