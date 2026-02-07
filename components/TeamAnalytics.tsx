import React, { useState, useMemo } from 'react';
import { Partido, EstadisticaJugador, Plantilla, PlayerAggregatedStats, IdType } from '../types';
import { PercentageCircle } from './PercentageCircle';
import { PlayerDetailModal } from './PlayerDetailModal';

interface Props {
  matches: Partido[];
  stats: EstadisticaJugador[];
  roster: Plantilla[];
  teamId: IdType;
}

enum Tab {
  MATCHES = 'Partidos',
  PLAYERS_GRID = 'Jugadores (Grid)',
  PLAYERS_CARDS = 'Ficha Jugador'
}

// Updated default image URL
export const DEFAULT_PLAYER_IMAGE = "https://image.singular.live/fit-in/450x450/filters:format(webp)/0d62960e1109063fb6b062e758907fb1/images/6fd2wXUKVDiDufkJCVvnfI_w585h427.png";

export const TeamAnalytics: React.FC<Props> = ({ matches, stats, roster, teamId }) => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.MATCHES);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerAggregatedStats | null>(null);

  // Filter matches involving this team
  const teamMatches = useMemo(() => matches.filter(
    m => String(m.equipo_local_id) === String(teamId) || String(m.equipo_visitante_id) === String(teamId)
  ), [matches, teamId]);

  // Aggregate Player Stats
  const playerAggregated = useMemo(() => {
    const map = new Map<string, PlayerAggregatedStats>();

    // Initialize with roster
    roster.forEach(p => {
      map.set(String(p.jugador_id), {
        jugadorId: p.jugador_id,
        nombre: p.jugadores?.nombre_completo || 'Desconocido',
        foto: p.jugadores?.foto_url || null,
        dorsal: p.dorsal,
        pj: 0,
        puntosTotal: 0,
        minutosTotal: 0,
        faltasTotal: 0,
        t1_anotados: 0,
        t1_intentados: 0,
        ppg: 0,
        mpg: 0,
        fpg: 0,
        ppm: 0
      });
    });

    stats.forEach(s => {
      const p = map.get(String(s.jugador_id));
      if (p) {
        p.pj++;
        p.puntosTotal += s.puntos;
        p.minutosTotal += (s.minutos || 0);
        p.faltasTotal += s.faltas_personales;
        p.t1_anotados += s.t1_anotados;
        p.t1_intentados += s.t1_intentados;
      }
    });

    // Calculate averages
    const result = Array.from(map.values()).map(p => ({
      ...p,
      ppg: p.pj > 0 ? p.puntosTotal / p.pj : 0,
      mpg: p.pj > 0 ? p.minutosTotal / p.pj : 0,
      fpg: p.pj > 0 ? p.faltasTotal / p.pj : 0,
      ppm: p.minutosTotal > 0 ? p.puntosTotal / p.minutosTotal : 0
    }));

    return result.sort((a, b) => b.ppg - a.ppg); // Default sort by PPG
  }, [roster, stats]);

  // Helper to get stats for a specific match/team combo
  const getMatchTeamStats = (matchId: IdType) => {
    const matchStats = stats.filter(s => String(s.partido_id) === String(matchId));
    // Simple aggregations for the team in that match
    const t1a = matchStats.reduce((sum, s) => sum + s.t1_anotados, 0);
    const t1i = matchStats.reduce((sum, s) => sum + s.t1_intentados, 0);
    const t2a = matchStats.reduce((sum, s) => sum + s.t2_anotados, 0);
    const t2i = matchStats.reduce((sum, s) => sum + s.t2_intentados, 0);
    const t3a = matchStats.reduce((sum, s) => sum + s.t3_anotados, 0);
    const t3i = matchStats.reduce((sum, s) => sum + s.t3_intentados, 0);
    const faltas = matchStats.reduce((sum, s) => sum + s.faltas_personales, 0);

    return { t1a, t1i, t2a, t2i, t3a, t3i, faltas };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 mt-6">
      {/* Tabs Header */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {Object.values(Tab).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 text-sm font-bold uppercase tracking-wide whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab 
                ? 'border-fcbq-red text-fcbq-red bg-red-50' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* MATCHES GRID */}
        {activeTab === Tab.MATCHES && (
          <div className="grid grid-cols-1 gap-4">
            {teamMatches.length === 0 ? <p className="text-gray-500 text-center py-8">No hay partidos registrados.</p> : null}
            {teamMatches.map(match => {
              const isLocal = String(match.equipo_local_id) === String(teamId);
              const opponent = isLocal ? match.equipos_visitante : match.equipos_local;
              const teamScore = isLocal ? match.puntos_local : match.puntos_visitante;
              const oppScore = isLocal ? match.puntos_visitante : match.puntos_local;
              const result = (teamScore || 0) > (oppScore || 0) ? 'W' : 'L';
              
              const mStats = getMatchTeamStats(match.id);
              const t1Pct = mStats.t1i > 0 ? (mStats.t1a / mStats.t1i) * 100 : 0;

              return (
                <div key={match.id} className="border rounded-lg p-4 flex flex-col md:flex-row items-center gap-6 hover:shadow-md transition-shadow">
                  {/* Score Section */}
                  <div className="flex items-center gap-4 min-w-[200px]">
                     <div className={`text-2xl font-bold ${result === 'W' ? 'text-green-600' : 'text-red-600'}`}>
                        {result}
                     </div>
                     <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase">Jornada {match.jornada}</span>
                        <span className="font-bold text-gray-800">vs {opponent?.clubs?.nombre_corto || 'Rival'}</span>
                        <span className="text-lg font-mono">{teamScore} - {oppScore}</span>
                     </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                    <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                        <span className="text-xs text-gray-500 mb-1">Tiros Libres (1p)</span>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">{mStats.t1a}/{mStats.t1i}</span>
                            <PercentageCircle percentage={t1Pct} size={30} />
                        </div>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                        <span className="text-xs text-gray-500 mb-1">Tiros 2p</span>
                        <span className="font-mono font-bold text-gray-800">{mStats.t2a}/{mStats.t2i}</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                        <span className="text-xs text-gray-500 mb-1">Tiros 3p</span>
                        <span className="font-mono font-bold text-gray-800">{mStats.t3a}/{mStats.t3i}</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                        <span className="text-xs text-gray-500 mb-1">Faltas</span>
                        <span className="font-mono font-bold text-gray-800">{mStats.faltas}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PLAYER GRID */}
        {activeTab === Tab.PLAYERS_GRID && (
          <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Jugador</th>
                  <th className="px-4 py-3 text-center">PJ</th>
                  <th className="px-4 py-3 text-center">PPG</th>
                  <th className="px-4 py-3 text-center">MPG</th>
                  <th className="px-4 py-3 text-center">FPG</th>
                  <th className="px-4 py-3 text-center">% T1</th>
                </tr>
              </thead>
              <tbody>
                {playerAggregated.map(p => {
                    const t1Pct = p.t1_intentados > 0 ? (p.t1_anotados / p.t1_intentados) * 100 : 0;
                    return (
                        <tr 
                          key={p.jugadorId} 
                          className="border-b hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedPlayer(p)}
                        >
                            <td className="px-4 py-3 font-mono text-gray-500">{p.dorsal}</td>
                            <td className="px-4 py-3 font-medium text-gray-900">
                                <div className="flex items-center gap-3">
                                  {/* Small avatar in table */}
                                  <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden shrink-0">
                                      <img 
                                        src={p.foto || DEFAULT_PLAYER_IMAGE} 
                                        alt="" 
                                        className={`w-full h-full object-cover object-top ${!p.foto ? 'scale-125' : ''}`}
                                      />
                                  </div>
                                  {p.nombre}
                                </div>
                            </td>
                            <td className="px-4 py-3 text-center">{p.pj}</td>
                            <td className="px-4 py-3 text-center font-bold text-fcbq-blue">{p.ppg.toFixed(1)}</td>
                            <td className="px-4 py-3 text-center">{p.mpg.toFixed(1)}</td>
                            <td className="px-4 py-3 text-center">{p.fpg.toFixed(1)}</td>
                            <td className="px-4 py-3 flex justify-center">
                                <PercentageCircle percentage={t1Pct} size={30} />
                            </td>
                        </tr>
                    );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PLAYER CARDS - REDESIGNED */}
        {activeTab === Tab.PLAYERS_CARDS && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {playerAggregated.map(p => (
              <div 
                key={p.jugadorId} 
                onClick={() => setSelectedPlayer(p)}
                className="group bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1 relative"
              >
                {/* Dorsal Badge - Top Right */}
                <div className="absolute top-3 right-3 bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-md border border-gray-200 group-hover:bg-fcbq-red group-hover:text-white group-hover:border-fcbq-red transition-colors z-10">
                    #{p.dorsal}
                </div>

                {/* Avatar Circle */}
                <div className="w-24 h-24 rounded-full bg-gray-50 border-4 border-white shadow-md overflow-hidden mb-3 flex items-center justify-center relative ring-1 ring-gray-100">
                    <img 
                        src={p.foto || DEFAULT_PLAYER_IMAGE} 
                        alt={p.nombre}
                        className={`w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 ${!p.foto ? 'scale-125 translate-y-2' : ''}`}
                    />
                </div>
                
                {/* Name */}
                <h3 className="font-bold text-gray-900 text-sm leading-tight mb-4 truncate w-full px-2 text-center" title={p.nombre}>
                    {p.nombre}
                </h3>
                
                {/* Stats Grid - 3 Columns (PTS, PPG, MPG) */}
                <div className="grid grid-cols-3 gap-2 w-full pt-3 border-t border-gray-100">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">PTS</span>
                        <span className="text-sm font-bold text-fcbq-blue">{p.puntosTotal}</span>
                    </div>
                    <div className="flex flex-col items-center border-l border-gray-100">
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">PPG</span>
                        <span className="text-sm font-bold text-gray-700">{p.ppg.toFixed(1)}</span>
                    </div>
                    <div className="flex flex-col items-center border-l border-gray-100">
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">MPG</span>
                        <span className="text-sm font-bold text-gray-700">{p.mpg.toFixed(1)}</span>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedPlayer && (
        <PlayerDetailModal 
            player={selectedPlayer} 
            stats={stats.filter(s => String(s.jugador_id) === String(selectedPlayer.jugadorId))}
            onClose={() => setSelectedPlayer(null)} 
        />
      )}
    </div>
  );
};