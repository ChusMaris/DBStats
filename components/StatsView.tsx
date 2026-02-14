
import React, { useState } from 'react';
import Standings from './Standings';
import TeamStats from './TeamStats';
import { fetchTeamStats } from '../services/dataService';
import { Loader2 } from 'lucide-react';
import { Competicion } from '../types';

interface StatsViewProps {
  viewData: {
    matches: any[],
    realMatches: any[],
    equipos: any[],
    competicion: Competicion | null
  };
  selectedCompeticionId: string;
}

const StatsView: React.FC<StatsViewProps> = ({ viewData, selectedCompeticionId }) => {
  const [selectedTeamId, setSelectedTeamId] = useState<number | string | null>(null);
  const [teamDetails, setTeamDetails] = useState<{
    matches: any[],
    plantilla: any[],
    stats: any[],
    movements: any[]
  } | null>(null);
  const [loadingTeam, setLoadingTeam] = useState(false);

  // --- Team Selection Action ---
  const handleTeamSelect = async (teamId: number | string) => {
    if (teamId === selectedTeamId) return;
    setSelectedTeamId(teamId);
    setLoadingTeam(true);
    try {
        const compId = viewData?.competicion?.id || selectedCompeticionId;
        const details = await fetchTeamStats(compId, teamId);
        setTeamDetails(details);
        // Scroll to details logic
        setTimeout(() => {
            document.getElementById('team-details')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    } catch (e) {
        console.error(e);
    } finally {
        setLoadingTeam(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      <section>
          <div className="flex justify-between items-end mb-4 ml-1">
            <h3 className="text-xl font-semibold text-gray-600">Clasificación</h3>
          </div>
          {viewData.equipos.length > 0 ? (
              <Standings 
                  equipos={viewData.equipos} 
                  partidos={viewData.realMatches}
                  esMini={viewData.competicion?.categorias?.es_mini || false}
                  onSelectTeam={handleTeamSelect}
                  selectedTeamId={selectedTeamId}
              />
          ) : (
              <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500 text-lg">
                  No hay equipos registrados en esta competición.
              </div>
          )}
          <p className="text-sm text-gray-400 mt-2 italic">* Haz click en un equipo para ver estadísticas detalladas.</p>
      </section>

      {selectedTeamId && (
          <section id="team-details" className="scroll-mt-24">
               <div className="flex items-center justify-between mb-4 mt-12 border-b pb-2">
                   <div>
                      <h3 className="text-2xl font-bold text-fcbq-blue">
                          {viewData.equipos.find(e => e.id === selectedTeamId)?.nombre_especifico}
                      </h3>
                      <p className="text-base text-gray-500">Estadísticas detalladas</p>
                   </div>
                   {loadingTeam && <Loader2 className="animate-spin text-fcbq-blue" size={24} />}
               </div>

               {teamDetails ? (
                   <TeamStats 
                      equipoId={selectedTeamId}
                      matches={teamDetails.matches}
                      plantilla={teamDetails.plantilla}
                      stats={teamDetails.stats}
                      movements={teamDetails.movements}
                      esMini={viewData.competicion?.categorias?.es_mini || false}
                   />
               ) : (
                  !loadingTeam && <div className="p-8 text-center text-gray-500 bg-white rounded-lg border border-dashed text-lg">Selecciona un equipo para ver datos.</div>
               )}
          </section>
      )}
    </div>
  );
};

export default StatsView;
