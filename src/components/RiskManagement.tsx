import React, { useMemo } from 'react';
import { Download, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../lib/utils';

export const RiskManagement: React.FC = () => {
  const { consolidated, selectedFaculty, selectedProgram, selectedPeriod } = useAppStore();

  const filteredData = useMemo(() => {
    return consolidated.filter(s => {
      const matchFaculty = selectedFaculty === 'Todas' || s.faculty === selectedFaculty;
      const matchProgram = selectedProgram === 'Todos' || s.program === selectedProgram;
      const matchPeriod = selectedPeriod === 'Todos' || 
        s.historicalRET.some(r => r.period === selectedPeriod) || 
        s.currentCourses.some(c => c.period === selectedPeriod);
      return matchFaculty && matchProgram && matchPeriod;
    });
  }, [consolidated, selectedFaculty, selectedProgram, selectedPeriod]);

  const riskData = useMemo(() => {
    return filteredData
      .filter(s => s.riskLevel !== 'Bajo')
      .sort((a, b) => (a.riskLevel === 'Alto' ? -1 : 1));
  }, [filteredData]);

  const exportToCSV = () => {
    const headers = ['ID', 'Nombre', 'Correo', 'Facultad', 'Programa', 'Nivel de Riesgo', 'Estrategia Recomendada'];
    const rows = filteredData.map(s => [
      s.id, s.name, s.email, s.faculty, s.program, s.riskLevel, s.strategy
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `consolidado_riesgo_ur_${selectedFaculty}_${selectedPeriod}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const facultyRiskCount = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach(s => {
      if (s.riskLevel === 'Alto') {
        counts[s.faculty] = (counts[s.faculty] || 0) + 1;
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [filteredData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestión de Estudiantes Vulnerables</h2>
          <p className="text-slate-500">Listado priorizado por semáforo de riesgo académico</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-all shadow-md"
        >
          <Download size={18} />
          <span>Exportar para Power BI</span>
        </button>
      </div>

      {/* Faculty Risk Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {facultyRiskCount.map(([faculty, count]) => (
          <div key={faculty} className="bg-white p-4 rounded-xl border-l-4 border-red-500 shadow-sm border-y border-r border-slate-200">
            <p className="text-[10px] font-bold text-slate-500 uppercase truncate">{faculty}</p>
            <p className="text-2xl font-black text-slate-900">{count} <span className="text-xs font-medium text-slate-400">en riesgo alto</span></p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estudiante</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Facultad / Programa</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Nivel de Riesgo</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estrategia Recomendada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {riskData.length > 0 ? riskData.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-900">{student.name || 'Sin nombre'}</div>
                  <div className="text-xs text-slate-500">{student.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-700 font-medium">{student.faculty}</div>
                  <div className="text-xs text-slate-500">{student.program}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1.5",
                      student.riskLevel === 'Alto' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    )}>
                      <AlertCircle size={12} />
                      <span>{student.riskLevel}</span>
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-start space-x-2">
                    <div className="mt-0.5 p-1 rounded bg-slate-100 text-slate-600">
                      <CheckCircle2 size={14} />
                    </div>
                    <span className="text-sm text-slate-700">{student.strategy}</span>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center space-y-2">
                    <HelpCircle size={48} className="text-slate-200" />
                    <p className="text-lg font-medium">No se detectaron estudiantes en riesgo</p>
                    <p className="text-sm">Cargue datos o ajuste los filtros para ver resultados</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
