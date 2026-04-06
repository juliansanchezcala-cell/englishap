import React, { useState, useMemo } from 'react';
import { Search, User, Calendar, GraduationCap, BookOpen, CheckCircle2, XCircle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../lib/utils';

export const StudentSearch: React.FC = () => {
  const { consolidated } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');

  const searchResults = useMemo(() => {
    if (!searchTerm || searchTerm.length < 3) return [];
    const lower = searchTerm.toLowerCase();
    return consolidated.filter(s => 
      s.name.toLowerCase().includes(lower) || 
      s.id.includes(lower) || 
      s.email.toLowerCase().includes(lower)
    ).slice(0, 5);
  }, [consolidated, searchTerm]);

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const selectedStudent = useMemo(() => 
    consolidated.find(s => s.id === selectedStudentId), 
    [consolidated, selectedStudentId]
  );

  const timeline = useMemo(() => {
    if (!selectedStudent) return [];
    
    const events = [
      ...selectedStudent.historicalRET.map(r => ({
        type: 'RET',
        period: r.period,
        title: `Examen RET - ${r.level}`,
        score: r.overall,
        approved: r.approved?.toLowerCase().includes('aprobo'),
        details: `R: ${r.reading} | W: ${r.writing} | L: ${r.listening} | S: ${r.speaking}`
      })),
      ...selectedStudent.currentCourses.map(c => ({
        type: 'Curso',
        period: c.period,
        title: c.course,
        score: c.finalGrade,
        approved: c.concept?.toLowerCase().includes('aprobado'),
        details: `Asistencia: ${c.attendance}% | Concepto: ${c.concept}`
      }))
    ];

    return events.sort((a, b) => b.period.localeCompare(a.period));
  }, [selectedStudent]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="text-slate-400" size={20} />
        </div>
        <input
          type="text"
          placeholder="Buscar por Nombre, ID o Correo..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#B5A264] outline-none text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        {searchResults.length > 0 && !selectedStudentId && (
          <div className="absolute w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
            {searchResults.map(s => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedStudentId(s.id);
                  setSearchTerm('');
                }}
                className="w-full px-6 py-4 text-left hover:bg-slate-50 flex items-center justify-between border-b border-slate-100 last:border-0"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-slate-100 rounded-full text-slate-500">
                    <User size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{s.name}</div>
                    <div className="text-xs text-slate-500">{s.id} • {s.email}</div>
                  </div>
                </div>
                <span className={cn(
                  "text-[10px] font-bold uppercase px-2 py-1 rounded",
                  s.riskLevel === 'Alto' ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
                )}>
                  Riesgo {s.riskLevel}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedStudent ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Profile Header */}
          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <GraduationCap size={120} />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <h3 className="text-3xl font-bold">{selectedStudent.name}</h3>
                <div className="flex flex-wrap gap-3 text-slate-400 text-sm">
                  <span className="flex items-center gap-1.5"><User size={14} /> {selectedStudent.id}</span>
                  <span className="flex items-center gap-1.5"><BookOpen size={14} /> {selectedStudent.faculty}</span>
                  <span className="flex items-center gap-1.5"><Calendar size={14} /> {selectedStudent.program}</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 min-w-[200px]">
                <p className="text-xs text-white/60 font-bold uppercase tracking-wider mb-1">Estado Actual</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold">Riesgo {selectedStudent.riskLevel}</span>
                  <div className={cn(
                    "w-3 h-3 rounded-full animate-pulse",
                    selectedStudent.riskLevel === 'Alto' ? "bg-red-500" : 
                    selectedStudent.riskLevel === 'Medio' ? "bg-amber-500" : "bg-emerald-500"
                  )} />
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-slate-800 px-2">Trayectoria Académica</h4>
            <div className="space-y-4">
              {timeline.map((event, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-6 relative">
                  <div className={cn(
                    "p-3 rounded-xl",
                    event.approved ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                  )}>
                    {event.approved ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#B5A264] uppercase tracking-widest">{event.period}</span>
                      <span className="text-lg font-black text-slate-900">{event.score}</span>
                    </div>
                    <h5 className="font-bold text-slate-900">{event.title}</h5>
                    <p className="text-sm text-slate-500">{event.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            onClick={() => setSelectedStudentId(null)}
            className="w-full py-3 text-slate-500 hover:text-slate-800 font-medium transition-colors"
          >
            Volver a buscar
          </button>
        </div>
      ) : (
        <div className="py-20 text-center space-y-4">
          <div className="inline-flex p-6 bg-slate-50 rounded-full text-slate-300">
            <Search size={48} />
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold text-slate-400">Ingrese un criterio de búsqueda</p>
            <p className="text-slate-400">Busque por nombre completo, correo institucional o documento de identidad</p>
          </div>
        </div>
      )}
    </div>
  );
};
