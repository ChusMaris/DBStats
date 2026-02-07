import { supabase } from '../supabaseClient';
import { IdType, Temporada, Categoria, Competicion, Equipo, Partido, EstadisticaJugador, Plantilla } from '../types';

export const getTemporadas = async (): Promise<Temporada[]> => {
  const { data, error } = await supabase
    .from('temporadas')
    .select('*')
    .order('nombre', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const getCategoriasByTemporada = async (temporadaId: IdType): Promise<Categoria[]> => {
  // Method 1: Get unique category IDs first from competitions in this season
  const { data: comps, error: compError } = await supabase
    .from('competiciones')
    .select('categoria_id')
    .eq('temporada_id', temporadaId);

  if (compError) throw compError;
  
  // Extract unique IDs
  const ids = Array.from(new Set(comps?.map((c: any) => c.categoria_id) || []));
  
  if (ids.length === 0) return [];

  // Method 2: Get Category details for those IDs
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .in('id', ids)
    .order('nombre');

  if (error) throw error;
  return data || [];
};

export const getCompeticiones = async (temporadaId: IdType, categoriaId: IdType): Promise<Competicion[]> => {
  const { data, error } = await supabase
    .from('competiciones')
    .select('*')
    .eq('temporada_id', temporadaId)
    .eq('categoria_id', categoriaId)
    .order('nombre');
  
  if (error) throw error;
  return data || [];
};

export const getPartidosByCompeticion = async (competicionId: IdType): Promise<Partido[]> => {
  // Using explicit relationship 'equipos_club_id_fkey' to resolve ambiguity for clubs embedding
  const { data, error } = await supabase
    .from('partidos')
    .select(`
      *,
      equipos_local:equipos!equipo_local_id(
        nombre_especifico, 
        clubs!equipos_club_id_fkey(nombre_corto, logo_url)
      ),
      equipos_visitante:equipos!equipo_visitante_id(
        nombre_especifico, 
        clubs!equipos_club_id_fkey(nombre_corto, logo_url)
      )
    `)
    .eq('competicion_id', competicionId)
    .order('fecha_hora', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const getEquiposByCompeticion = async (competicionId: IdType): Promise<Equipo[]> => {
  // Using explicit relationship 'equipos_club_id_fkey' to resolve ambiguity for clubs embedding
  const { data, error } = await supabase
    .from('equipos')
    .select(`
      *,
      clubs:clubs!equipos_club_id_fkey(*)
    `)
    .eq('competicion_id', competicionId);
  
  if (error) throw error;
  return data || [];
};

export const getPlantillaByEquipo = async (equipoId: IdType): Promise<Plantilla[]> => {
  const { data, error } = await supabase
    .from('plantillas')
    .select(`
      *,
      jugadores(*)
    `)
    .eq('equipo_id', equipoId);
  
  if (error) throw error;
  return data || [];
};

export const getEstadisticasByEquipo = async (equipoId: IdType, partidoIds: IdType[]): Promise<EstadisticaJugador[]> => {
  if (partidoIds.length === 0) return [];
  
  const { data, error } = await supabase
    .from('estadisticas_jugador_partido')
    .select(`
      *,
      partidos(*)
    `)
    .in('partido_id', partidoIds);

  if (error) throw error;
  return data || [];
};