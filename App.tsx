import React, { useEffect, useState, useRef } from 'react';
import { getTemporadas, getCategoriasByTemporada, getCompeticiones, getPartidosByCompeticion, getEquiposByCompeticion, getPlantillaByEquipo, getEstadisticasByEquipo } from './services/dataService';
import { Temporada, Categoria, Competicion, Equipo, Partido, EstadisticaJugador, Plantilla, IdType } from './types';
import { Standings } from './components/Standings';
import { TeamAnalytics } from './components/TeamAnalytics';

const App: React.FC = () => {
  // Config State
  const [temporadas, setTemporadas] = useState<Temporada[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [competiciones, setCompeticiones] = useState<Competicion[]>([]);

  // Selection State - Using IdType (string | number) to be safe with DB types
  const [selectedTemporada, setSelectedTemporada] = useState<IdType>("");
  const [selectedCategoria, setSelectedCategoria] = useState<IdType>("");
  const [selectedCompeticion, setSelectedCompeticion] = useState<IdType>("");

  // Data View State
  const [loading, setLoading] = useState<boolean>(false);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<IdType | null>(null);
  
  // Team Specific Data
  const [teamStats, setTeamStats] = useState<EstadisticaJugador[]>([]);
  const [teamRoster, setTeamRoster] = useState<Plantilla[]>([]);
  const [loadingTeam, setLoadingTeam] = useState<boolean>(false);

  // Scroll / Header State
  const [showStickyHeaderTitle, setShowStickyHeaderTitle] = useState(false);
  const titleRef = useRef<HTMLDivElement>(null);

  // --- Initial Load ---
  useEffect(() => {
    const loadSeasons = async () => {
      try {
        const data = await getTemporadas();
        setTemporadas(data);
      } catch (e) {
        console.error("Error loading seasons", e);
      }
    };
    loadSeasons();
  }, []);

  // --- Handlers for cascading selects ---
  const handleTemporadaChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedTemporada(val);
    
    // Reset downstream immediately to avoid UI mismatch
    setSelectedCategoria("");
    setSelectedCompeticion("");
    setCategorias([]);
    setCompeticiones([]);
    
    if (val) {
      try {
        const data = await getCategoriasByTemporada(val);
        setCategorias(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }
  };

  const handleCategoriaChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedCategoria(val);
    
    // Reset downstream
    setSelectedCompeticion("");
    setCompeticiones([]);

    if (val && selectedTemporada) {
      try {
        const data = await getCompeticiones(selectedTemporada, val);
        setCompeticiones(data);
      } catch (error) {
        console.error("Error fetching competitions:", error);
      }
    }
  };

  const handleCompeticionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCompeticion(e.target.value);
  };

  // --- Main Data Load (Competition Selected) ---
  useEffect(() => {
    if (!selectedCompeticion) {
      setPartidos([]);
      setEquipos([]);
      return;
    }

    const loadCompData = async () => {
      setLoading(true);
      setSelectedTeamId(null);
      try {
        const [matchesData, teamsData] = await Promise.all([
          getPartidosByCompeticion(selectedCompeticion),
          getEquiposByCompeticion(selectedCompeticion)
        ]);
        setPartidos(matchesData);
        setEquipos(teamsData);
      } catch (e) {
        console.error("Error loading competition details", e);
      } finally {
        setLoading(false);
      }
    };
    loadCompData();
  }, [selectedCompeticion]);

  // --- Team Detail Load ---
  useEffect(() => {
    if (!selectedTeamId) {
        setTeamStats([]);
        setTeamRoster([]);
        return;
    }

    const loadTeamDetails = async () => {
        setLoadingTeam(true);
        try {
            const matchesIds = partidos.map(p => p.id);
            const [stats, roster] = await Promise.all([
                getEstadisticasByEquipo(selectedTeamId, matchesIds),
                getPlantillaByEquipo(selectedTeamId)
            ]);
            
            const enrichedStats = stats.map(s => ({
                ...s,
                partidos: partidos.find(p => p.id === s.partido_id)
            }));
            
            setTeamStats(enrichedStats);
            setTeamRoster(roster);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingTeam(false);
        }
    };
    loadTeamDetails();
  }, [selectedTeamId, partidos]);

  // --- Scroll Observer for Title ---
  useEffect(() => {
    // Only setup if we are showing content
    if (!selectedCompeticion || loading || !titleRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Logic: Switch to sticky header when the title element is no longer fully visible
        // (specifically when the top part is covered by the header).
        // 
        // threshold: 1 -> triggers when 'isIntersecting' changes from true (fully visible) to false (partially hidden).
        // rootMargin: '-48px ...' -> Shifts the intersection area down. 
        //    The header is 72px high.
        //    We want to trigger when the top ~24px (Category text) is covered.
        //    So we want trigger at y = 72 - 24 = 48px approx.
        //    When element top < 48px, it is "outside" the root margin box.
        
        const isScrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 72;
        setShowStickyHeaderTitle(isScrolledPast);
      },
      {
        threshold: 1,
        rootMargin: '-48px 0px 0px 0px' 
      }
    );

    observer.observe(titleRef.current);

    return () => observer.disconnect();
  }, [loading, selectedCompeticion]);


  const currentCompData = competiciones.find(c => String(c.id) === String(selectedCompeticion));
  const currentCategory = categorias.find(c => String(c.id) === String(selectedCategoria));
  const currentTeam = equipos.find(e => String(e.id) === String(selectedTeamId));

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-gray-50">
      
      {/* Header Blue - Sticky on ALL devices */}
      <header className="bg-fcbq-blue text-white shadow-lg sticky top-0 z-50 h-[72px] flex items-center transition-all duration-300">
        <div className="container mx-auto px-4 flex items-center justify-between w-full overflow-hidden">
          <div className="flex items-center gap-3 overflow-hidden">
             {/* Logo Circle: Shows Team Logo if selected, otherwise BS */}
             <div className="bg-white p-0.5 rounded-full w-10 h-10 flex items-center justify-center text-fcbq-blue font-bold text-xl shrink-0 overflow-hidden shadow-md transition-all duration-300">
               {currentTeam?.clubs?.logo_url ? (
                 <img src={currentTeam.clubs.logo_url} alt={currentTeam.nombre_especifico} className="w-full h-full object-contain rounded-full" />
               ) : (
                 "BS"
               )}
             </div>
             
             {/* Dynamic Title Switcher - Reverted to Category/Competition info only */}
             <div className="flex flex-col justify-center overflow-hidden">
                {showStickyHeaderTitle && currentCompData ? (
                  <div className="animate-fade-in leading-tight">
                    <span className="text-[10px] md:text-xs text-blue-200 font-bold uppercase block truncate max-w-[200px] md:max-w-md">
                      {currentCategory?.nombre}
                    </span>
                    <h1 className="text-sm md:text-lg font-bold truncate max-w-[200px] md:max-w-md">
                      {currentCompData.nombre}
                    </h1>
                  </div>
                ) : (
                  <h1 className="text-xl md:text-2xl font-extrabold tracking-tight truncate">
                    Brafa Stats
                  </h1>
                )}
             </div>
          </div>
          
          <div className={`text-xs md:text-sm font-medium opacity-80 shrink-0 ${showStickyHeaderTitle ? 'hidden md:block' : ''}`}>
            {!showStickyHeaderTitle ? "FCBQ Data" : ""}
          </div>
        </div>
      </header>

      {/* Filters Bar - Sticky ONLY on Desktop, positioned below header */}
      <div className="bg-white border-b border-gray-200 text-gray-800 py-4 shadow-sm md:sticky md:top-[72px] z-40">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Temporada */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Temporada</label>
              <select 
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-fcbq-blue focus:border-fcbq-blue block w-full p-2.5 shadow-sm transition-colors"
                value={selectedTemporada}
                onChange={handleTemporadaChange}
              >
                <option value="">Selecciona Temporada...</option>
                {temporadas.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
            </div>

            {/* Categoria */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Categoría</label>
              <select 
                className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 shadow-sm transition-colors ${!selectedTemporada ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'focus:ring-fcbq-blue focus:border-fcbq-blue'}`}
                value={selectedCategoria}
                onChange={handleCategoriaChange}
                disabled={!selectedTemporada}
              >
                <option value="">
                  {!selectedTemporada 
                    ? 'Selecciona Temporada primero' 
                    : categorias.length === 0 
                      ? 'No hay categorías' 
                      : 'Selecciona Categoría...'}
                </option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>

            {/* Competición */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Competición</label>
              <select 
                className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 shadow-sm transition-colors ${!selectedCategoria ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'focus:ring-fcbq-blue focus:border-fcbq-blue'}`}
                value={selectedCompeticion}
                onChange={handleCompeticionChange}
                disabled={!selectedCategoria}
              >
                <option value="">
                  {!selectedCategoria 
                    ? 'Selecciona Categoría primero' 
                    : competiciones.length === 0 
                      ? 'No hay competiciones' 
                      : 'Selecciona Competición...'}
                </option>
                {competiciones.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>

          </div>
        </div>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        
        {!selectedCompeticion ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 mx-auto max-w-2xl mt-8">
            <div className="inline-block p-6 rounded-full bg-blue-50 text-fcbq-blue mb-4">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Panel de Estadísticas</h2>
            <p className="text-gray-500 mt-3 max-w-md mx-auto">Selecciona una <span className="font-bold text-fcbq-blue">Temporada</span>, <span className="font-bold text-fcbq-blue">Categoría</span> y <span className="font-bold text-fcbq-blue">Competición</span> para ver el análisis completo.</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col justify-center items-center py-32">
             <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-fcbq-blue mb-4"></div>
             <p className="text-gray-500 font-medium animate-pulse">Cargando datos...</p>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* Header Info - Ref Attached Here for Observer */}
            <div ref={titleRef} className="flex flex-col md:flex-row md:items-end gap-4 border-b pb-4">
              <div>
                <span className="text-sm font-bold text-fcbq-red tracking-wider uppercase">{currentCategory?.nombre}</span>
                <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">{currentCompData?.nombre}</h2>
              </div>
              <div className="md:ml-auto">
                 <span className="bg-blue-100 text-fcbq-blue px-3 py-1 rounded-full text-xs font-bold">Oficial FCBQ</span>
              </div>
            </div>

            {/* Standings */}
            <Standings 
              partidos={partidos} 
              equipos={equipos} 
              isMini={currentCategory?.es_mini || false}
              selectedTeamId={selectedTeamId}
              onTeamSelect={setSelectedTeamId}
            />

            {/* Team Details Section */}
            {selectedTeamId && (
              <div id="team-details" className="scroll-mt-32 transition-all duration-500 ease-in-out">
                 {loadingTeam ? (
                    <div className="py-20 flex flex-col justify-center items-center bg-white rounded-lg border border-gray-100 mt-6">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-fcbq-blue mb-3"></div>
                        <span className="text-sm text-gray-400">Analizando equipo...</span>
                    </div>
                 ) : (
                    <TeamAnalytics 
                        matches={partidos}
                        stats={teamStats}
                        roster={teamRoster}
                        teamId={selectedTeamId}
                    />
                 )}
              </div>
            )}
          </div>
        )}

      </main>

      <footer className="bg-gray-900 text-white py-10 mt-12 border-t border-gray-800">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <div className="font-bold text-2xl mb-2 tracking-tight">Brafa Stats</div>
          <p className="text-sm text-gray-500">Analytics for Basketball Coaches</p>
          <div className="mt-8 pt-8 border-t border-gray-800 w-full text-center text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Brafa Stats. Data provided by FCBQ.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;