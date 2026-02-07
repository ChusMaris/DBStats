import { supabase } from '../supabaseClient';
import { 
  Temporada, Categoria, Competicion, Partido, Equipo, EstadisticaJugadorPartido, PartidoMovimiento 
} from '../types';

export const fetchTemporadas = async (): Promise<Temporada[]> => {
  const { data, error } = await supabase.from('temporadas').select('*').order('nombre', { ascending: false });
  if (error) throw error;
  return data as Temporada[];
};

export const fetchCategorias = async (): Promise<Categoria[]> => {
  const { data, error } = await supabase.from('categorias').select('*').order('nombre');
  if (error) throw error;
  return data as Categoria[];
};

export const fetchCompeticiones = async (temporadaId: number | string, categoriaId: number | string): Promise<Competicion[]> => {
  const { data, error } = await supabase
    .from('competiciones')
    .select('*')
    .eq('temporada_id', temporadaId)
    .eq('categoria_id', categoriaId)
    .order('nombre');
    
  if (error) throw error;
  return data as Competicion[];
};

export const fetchCompeticionDetails = async (competicionId: number | string) => {
  const matchesResponse = await supabase
    .from('partidos')
    .select(`
      *,
      equipo_local:equipos!equipo_local_id(id, nombre_especifico, clubs:clubs!equipos_club_id_fkey(id, nombre, logo_url, nombre_corto)),
      equipo_visitante:equipos!equipo_visitante_id(id, nombre_especifico, clubs:clubs!equipos_club_id_fkey(id, nombre, logo_url, nombre_corto))
    `)
    .eq('competicion_id', competicionId)
    .order('jornada', { ascending: true });

  if (matchesResponse.error) throw matchesResponse.error;

  const teamsResponse = await supabase
    .from('equipos')
    .select(`
        *,
        clubs:clubs!equipos_club_id_fkey (*)
    `)
    .eq('competicion_id', competicionId);

  if (teamsResponse.error) throw teamsResponse.error;

  return {
    partidos: matchesResponse.data, 
    equipos: teamsResponse.data
  };
};

export const fetchTeamStats = async (competicionId: number | string, equipoId: number | string) => {
    const matchesResponse = await supabase
        .from('partidos')
        .select(`
            *,
            equipo_local:equipos!equipo_local_id(id, nombre_especifico, clubs:clubs!equipos_club_id_fkey(logo_url)),
            equipo_visitante:equipos!equipo_visitante_id(id, nombre_especifico, clubs:clubs!equipos_club_id_fkey(logo_url))
        `)
        .eq('competicion_id', competicionId)
        .or(`equipo_local_id.eq.${equipoId},equipo_visitante_id.eq.${equipoId}`)
        .order('fecha_hora', { ascending: false });
    
    if (matchesResponse.error) throw matchesResponse.error;

    const matchIds = (matchesResponse.data || []).map(m => m.id);

    const plantillaResponse = await supabase
        .from('plantillas')
        .select(`
            dorsal,
            jugador_id,
            equipo_id,
            jugadores (*)
        `)
        .eq('equipo_id', equipoId);
    
    if (plantillaResponse.error) throw plantillaResponse.error;

    let statsData: EstadisticaJugadorPartido[] = [];
    if (matchIds.length > 0) {
        const statsResponse = await supabase
            .from('estadisticas_jugador_partido')
            .select('*')
            .in('partido_id', matchIds);
            
        if (statsResponse.error) throw statsResponse.error;
        statsData = statsResponse.data || [];
    }

    let movementsData: PartidoMovimiento[] = [];
    if (matchIds.length > 0) {
        const movsResponse = await supabase
            .from('partido_movimientos')
            .select('*')
            .in('partido_id', matchIds)
            .order('id', { ascending: true });
        
        if (!movsResponse.error) {
            movementsData = movsResponse.data || [];
        }
    }

    return {
        matches: matchesResponse.data,
        plantilla: plantillaResponse.data,
        stats: statsData,
        movements: movementsData
    };
};