import React, { useMemo } from 'react';
import { Partido, Equipo, TeamStanding, IdType } from '../types';

interface Props {
  partidos: Partido[];
  equipos: Equipo[];
  onTeamSelect: (teamId: IdType) => void;
  selectedTeamId: IdType | null;
  isMini: boolean;
}

export const Standings: React.FC<Props> = ({ partidos, equipos, onTeamSelect, selectedTeamId, isMini }) => {
  
  const standings = useMemo(() => {
    const stats: Record<string, TeamStanding> = {};

    // Initialize
    equipos.forEach(eq => {
      stats[String(eq.id)] = {
        equipoId: eq.id,
        nombre: eq.nombre_especifico,
        club: eq.clubs?.nombre_corto || 'Club',
        logo: eq.clubs?.logo_url || null,
        pj: 0,
        pg: 0,
        pp: 0,
        pf: 0,
        pc: 0,
        puntos: 0
      };
    });

    // Calculate
    partidos.forEach(p => {
      if (p.puntos_local !== null && p.puntos_visitante !== null) {
        const local = stats[String(p.equipo_local_id)];
        const visitor = stats[String(p.equipo_visitante_id)];

        if (local && visitor) {
          local.pj++;
          visitor.pj++;
          local.pf += p.puntos_local;
          local.pc += p.puntos_visitante;
          visitor.pf += p.puntos_visitante;
          visitor.pc += p.puntos_local;

          if (p.puntos_local > p.puntos_visitante) {
            local.pg++;
            local.puntos += 2;
            visitor.pp++;
            visitor.puntos += 1;
          } else {
            visitor.pg++;
            visitor.puntos += 2;
            local.pp++;
            local.puntos += 1;
          }
        }
      }
    });

    return Object.values(stats).sort((a, b) => {
      if (a.puntos !== b.puntos) return b.puntos - a.puntos;
      // Goal average generic
      return (b.pf - b.pc) - (a.pf - a.pc);
    });
  }, [partidos, equipos]);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100 bg-fcbq-blue bg-opacity-5">
        <h3 className="text-lg font-bold text-fcbq-blue">Clasificación {isMini ? '(Mini Basket)' : ''}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-4 py-3">Pos</th>
              <th className="px-4 py-3">Equipo</th>
              <th className="px-4 py-3 text-center">PTS</th>
              <th className="px-4 py-3 text-center">PJ</th>
              <th className="px-4 py-3 text-center">PG</th>
              <th className="px-4 py-3 text-center">PP</th>
              <th className="px-4 py-3 text-center hidden sm:table-cell">PF</th>
              <th className="px-4 py-3 text-center hidden sm:table-cell">PC</th>
              <th className="px-4 py-3 text-center hidden sm:table-cell">DIF</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team, index) => (
              <tr 
                key={team.equipoId} 
                onClick={() => onTeamSelect(team.equipoId)}
                className={`border-b cursor-pointer transition-colors duration-150 ${
                  String(selectedTeamId) === String(team.equipoId) ? 'bg-blue-50 border-l-4 border-l-fcbq-blue' : 'hover:bg-gray-50'
                }`}
              >
                <td className="px-4 py-3 font-medium text-gray-900">{index + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {team.logo ? (
                      <img src={team.logo} alt={team.club} className="w-8 h-8 object-contain" />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                        {team.club.substring(0, 2)}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-gray-800">{team.nombre}</div>
                      <div className="text-xs text-gray-500">{team.club}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center font-bold text-fcbq-blue">{team.puntos}</td>
                <td className="px-4 py-3 text-center">{team.pj}</td>
                <td className="px-4 py-3 text-center text-green-600 font-medium">{team.pg}</td>
                <td className="px-4 py-3 text-center text-red-500 font-medium">{team.pp}</td>
                <td className="px-4 py-3 text-center text-gray-500 hidden sm:table-cell">{team.pf}</td>
                <td className="px-4 py-3 text-center text-gray-500 hidden sm:table-cell">{team.pc}</td>
                <td className="px-4 py-3 text-center text-gray-500 hidden sm:table-cell">{team.pf - team.pc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};