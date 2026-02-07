import React, { useState, useRef } from 'react';
import { PlayerAggregatedStats, EstadisticaJugador } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DEFAULT_PLAYER_IMAGE } from './TeamAnalytics'; // Import the default image constant

interface Props {
  player: PlayerAggregatedStats;
  stats: EstadisticaJugador[];
  onClose: () => void;
}

export const PlayerDetailModal: React.FC<Props> = ({ player, stats, onClose }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      // Show sticky header when scrolled past 100px (approx height where main header starts disappearing)
      const scrollTop = scrollContainerRef.current.scrollTop;
      setIsScrolled(scrollTop > 100);
    }
  };

  // Prepare data for charts
  const sortedStats = [...stats].sort((a, b) => {
    // Sort by jornada (round) if available
    if (a.partidos && b.partidos) {
      return a.partidos.jornada - b.partidos.jornada;
    }
    
    // Fallback: Sort by ID
    if (typeof a.id === 'number' && typeof b.id === 'number') {
      return a.id - b.id;
    }
    return String(a.id).localeCompare(String(b.id));
  });

  const chartData = sortedStats.map((s, index) => ({
    match: `J${s.partidos?.jornada || index + 1}`,
    puntos: s.puntos,
    tl_intentados: s.t1_intentados,
    tl_anotados: s.t1_anotados,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm p-4">
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative flex flex-col"
      >
        
        {/* STICKY HEADER (Hidden initially, appears on scroll) */}
        <div 
            className={`sticky top-0 left-0 right-0 z-40 w-full bg-gradient-to-r from-gray-900 to-fcbq-blue shadow-lg transition-all duration-300 ease-in-out flex items-center justify-between px-6 overflow-hidden ${
                isScrolled ? 'h-20 opacity-100 translate-y-0' : 'h-0 opacity-0 -translate-y-full'
            }`}
        >
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white p-0.5 shrink-0 overflow-hidden">
                    <img 
                        src={player.foto || DEFAULT_PLAYER_IMAGE} 
                        alt={player.nombre} 
                        className={`w-full h-full rounded-full object-cover object-top ${!player.foto ? 'scale-125' : ''}`}
                    />
                </div>
                <div>
                     <div className="text-[10px] text-fcbq-red font-bold uppercase leading-none mb-0.5">#{player.dorsal}</div>
                     <h3 className="text-white font-bold text-lg leading-none truncate max-w-[200px] sm:max-w-md">{player.nombre}</h3>
                </div>
            </div>
            
            {/* Sticky Header Close Button */}
            <button 
                onClick={onClose}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        {/* Original Close Button (Scrolls away) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-gray-400 hover:text-gray-700 bg-white/80 backdrop-blur hover:bg-white p-2 rounded-full transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="p-0 sm:p-0">
          {/* Main Header with Player Photo */}
          <div className="bg-gradient-to-r from-gray-900 to-fcbq-blue p-6 sm:p-8 text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white p-1 shadow-lg shrink-0 overflow-hidden flex items-center justify-center">
                 <img 
                    src={player.foto || DEFAULT_PLAYER_IMAGE} 
                    alt={player.nombre} 
                    className={`w-full h-full rounded-full object-cover object-top ${!player.foto ? 'scale-125' : ''}`}
                  />
              </div>
              
              <div className="text-center sm:text-left flex-1">
                <div className="inline-block bg-fcbq-red text-white text-xs font-bold px-2 py-1 rounded mb-2">#{player.dorsal}</div>
                <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-2">{player.nombre}</h2>
                <div className="flex gap-4 mt-4 justify-center sm:justify-start">
                  <div className="text-center px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <span className="block text-xs text-blue-100 font-bold uppercase tracking-wider">PTS</span>
                    <span className="text-2xl font-bold">{player.puntosTotal}</span>
                  </div>
                  <div className="text-center px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <span className="block text-xs text-blue-100 font-bold uppercase tracking-wider">Media</span>
                    <span className="text-2xl font-bold">{player.ppg.toFixed(1)}</span>
                  </div>
                  <div className="text-center px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <span className="block text-xs text-blue-100 font-bold uppercase tracking-wider">Min</span>
                    <span className="text-2xl font-bold">{player.mpg.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Chart 1: Points Evolution */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-800 uppercase flex items-center gap-2">
                    <span className="w-2 h-2 bg-fcbq-blue rounded-full"></span>
                    Evolución de Puntos
                  </h3>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="match" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                        labelStyle={{ color: '#64748b', fontSize: '12px' }}
                      />
                      <Line type="monotone" dataKey="puntos" stroke="#005EB8" strokeWidth={3} activeDot={{ r: 6, fill: '#005EB8', strokeWidth: 0 }} dot={{ r: 3, fill: '#005EB8' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Free Throws Evolution */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                 <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-800 uppercase flex items-center gap-2">
                    <span className="w-2 h-2 bg-fcbq-red rounded-full"></span>
                    Tiros Libres
                  </h3>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="match" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      />
                      <Bar dataKey="tl_intentados" fill="#cbd5e1" name="Intentados" radius={[4, 4, 0, 0]} barSize={20} />
                      <Bar dataKey="tl_anotados" fill="#E4002B" name="Anotados" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Matches List */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Detalle por Partido</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {stats.map((s, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200">
                      <span className="text-xs font-bold text-gray-500 uppercase">Jornada {s.partidos?.jornada || idx+1}</span>
                      <span className="text-lg font-bold text-fcbq-blue">{s.puntos} <span className="text-xs font-normal text-gray-500">pts</span></span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-gray-600">
                      <div className="flex justify-between"><span>Minutos:</span> <span className="font-bold text-gray-800">{s.minutos}</span></div>
                      <div className="flex justify-between"><span>Faltas:</span> <span className="font-bold text-gray-800">{s.faltas_personales}</span></div>
                      <div className="flex justify-between col-span-2 pt-1 border-t border-gray-200 mt-1">
                        <span>Tiros (1/2/3):</span> 
                        <span className="font-mono font-bold text-gray-800">
                          {s.t1_anotados}/{s.t1_intentados} · {s.t2_anotados}/{s.t2_intentados} · {s.t3_anotados}/{s.t3_intentados}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};