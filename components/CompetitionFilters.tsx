
import React, { useMemo } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { Temporada, Categoria, Competicion } from '../types';

interface CompetitionFiltersProps {
    temporadas: Temporada[];
    categorias: Categoria[];
    competiciones: Competicion[];
    loadingCompetitions: boolean;
    selectedTemporada: string;
    selectedCategoria: string;
    selectedFase: string;
    selectedCompeticion: string;
    onTemporadaChange: (val: string) => void;
    onCategoriaChange: (val: string) => void;
    onFaseChange: (val: string) => void;
    onCompeticionChange: (val: string) => void;
}

const CompetitionFilters: React.FC<CompetitionFiltersProps> = ({
    temporadas,
    categorias,
    competiciones,
    loadingCompetitions,
    selectedTemporada,
    selectedCategoria,
    selectedFase,
    selectedCompeticion,
    onTemporadaChange,
    onCategoriaChange,
    onFaseChange,
    onCompeticionChange
}) => {

    // --- Derived State: Filtered Competitions by Phase ---
    const filteredCompeticiones = useMemo(() => {
        if (!selectedFase) return competiciones;
        return competiciones.filter(c =>
            c.nombre.toLowerCase().includes(selectedFase.toLowerCase())
        );
    }, [competiciones, selectedFase]);

    return (
        <div className="bg-white border-b border-gray-200 shadow-sm py-6">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6 items-end">
                    {/* Temporada */}
                    <div className="lg:col-span-2">
                        <label className="block mb-2 text-xs font-bold tracking-wide text-gray-500 uppercase">Temporada</label>
                        <div className="relative">
                            <select
                                value={selectedTemporada}
                                onChange={(e) => onTemporadaChange(e.target.value)}
                                className="bg-slate-50 border border-slate-200 text-gray-700 text-sm rounded-lg focus:ring-fcbq-blue focus:border-fcbq-blue block w-full p-2.5 appearance-none shadow-sm font-medium"
                            >
                                <option value="" disabled>SELECCIONAR...</option>
                                {temporadas.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
                        </div>
                    </div>

                    {/* Categoría */}
                    <div className="lg:col-span-3">
                        <label className="block mb-2 text-xs font-bold tracking-wide text-gray-500 uppercase">Categoría</label>
                        <div className="relative">
                            <select
                                value={selectedCategoria}
                                onChange={(e) => onCategoriaChange(e.target.value)}
                                className="bg-slate-50 border border-slate-200 text-gray-700 text-sm rounded-lg focus:ring-fcbq-blue focus:border-fcbq-blue block w-full p-2.5 appearance-none shadow-sm font-medium"
                            >
                                <option value="" disabled>SELECCIONAR CATEGORÍA</option>
                                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
                        </div>
                    </div>

                    {/* Fase */}
                    <div className="lg:col-span-3">
                        <label className="block mb-2 text-xs font-bold tracking-wide text-gray-500 uppercase">Fase</label>
                        <div className="relative">
                            <select
                                value={selectedFase}
                                onChange={(e) => onFaseChange(e.target.value)}
                                className="bg-slate-50 border border-slate-200 text-gray-700 text-sm rounded-lg focus:ring-fcbq-blue focus:border-fcbq-blue block w-full p-2.5 appearance-none shadow-sm font-medium disabled:opacity-50"
                                disabled={!selectedCategoria}
                            >
                                <option value="">TODAS LAS FASES</option>
                                <option value="Primera Fase">PRIMERA FASE</option>
                                <option value="Segona Fase">SEGONA FASE</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
                        </div>
                    </div>

                    {/* Competición */}
                    <div className="lg:col-span-4">
                        <label className="block mb-2 text-xs font-bold tracking-wide text-gray-500 uppercase">Competición</label>
                        <div className="relative">
                            <select
                                value={selectedCompeticion}
                                onChange={(e) => onCompeticionChange(e.target.value)}
                                className="bg-slate-50 border border-slate-200 text-gray-700 text-sm rounded-lg focus:ring-fcbq-blue focus:border-fcbq-blue block w-full p-2.5 appearance-none shadow-sm font-medium disabled:bg-gray-100 disabled:text-gray-400"
                                disabled={loadingCompetitions || !selectedTemporada || !selectedCategoria}
                            >
                                <option value="" disabled>
                                    {loadingCompetitions ? 'CARGANDO...' : (!selectedTemporada || !selectedCategoria ? 'SELECCIONA FILTROS ANTERIORES' : 'SELECCIONAR COMPETICIÓN')}
                                </option>
                                {!loadingCompetitions && filteredCompeticiones.length === 0 && selectedCategoria && <option value="" disabled>SIN RESULTADOS</option>}
                                {filteredCompeticiones.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                                {loadingCompetitions ? (
                                    <Loader2 size={16} className="animate-spin text-gray-400" />
                                ) : (
                                    <ChevronDown className="text-gray-400" size={16} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompetitionFilters;
