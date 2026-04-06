import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ComposedChart, Line, Area
} from 'recharts';
import { useAppStore } from '../store/useAppStore';
import { Lightbulb, Target, Users } from 'lucide-react';

export const StrategicAnalytics: React.FC = () => {
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

  const strategyDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach(s => {
      if (s.strategy) {
        counts[s.strategy] = (counts[s.strategy] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  const impactAnalysis = useMemo(() => {
    // Group by attendance ranges and see average grade
    const ranges = [
      { min: 0, max: 50, label: '0-50%', count: 0, sumGrade: 0 },
      { min: 50, max: 70, label: '50-70%', count: 0, sumGrade: 0 },
      { min: 70, max: 85, label: '70-85%', count: 0, sumGrade: 0 },
      { min: 85, max: 100, label: '85-100%', count: 0, sumGrade: 0 },
    ];

    filteredData.forEach(s => {
      const course = selectedPeriod === 'Todos' ? s.currentCourses[0] : s.currentCourses.find(c => c.period === selectedPeriod);
      if (course) {
        const range = ranges.find(r => course.attendance >= r.min && course.attendance < r.max);
        if (range) {
          range.count++;
          range.sumGrade += course.finalGrade;
        }
      }
    });

    return ranges.map(r => ({
      range: r.label,
      Estudiantes: r.count,
      Promedio: r.count > 0 ? (r.sumGrade / r.count).toFixed(1) : 0
    }));
  }, [filteredData, selectedPeriod]);

  const projections = useMemo(() => {
    const highRisk = filteredData.filter(s => s.riskLevel === 'Alto').length;
    // Projection logic: 
    // 1 RET spot per high risk student
    // 1 additional course per 20 high risk students
    return {
      retSpots: highRisk,
      additionalCourses: Math.ceil(highRisk / 20)
    };
  }, [filteredData]);

  return (
    <div className="space-y-6">
      {/* Projection Summary Card */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
          <Target size={120} />
        </div>
        <div className="relative z-10 space-y-1">
          <h3 className="text-lg font-bold text-[#B5A264]">Proyección de Recursos Académicos</h3>
          <p className="text-slate-400 text-sm">Estimación basada en la población actual de riesgo alto</p>
        </div>
        <div className="relative z-10 flex gap-8">
          <div className="text-center">
            <p className="text-3xl font-black">{projections.retSpots}</p>
            <p className="text-[10px] uppercase font-bold text-slate-400">Cupos RET</p>
          </div>
          <div className="text-center border-l border-slate-700 pl-8">
            <p className="text-3xl font-black">{projections.additionalCourses}</p>
            <p className="text-[10px] uppercase font-bold text-slate-400">Cursos Extra</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategy Allocation */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Target className="text-[#B5A264]" size={20} />
            Distribución de Estrategias Recomendadas
          </h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={strategyDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={150} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#B5A264" radius={[0, 4, 4, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Impact Analysis */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Lightbulb className="text-amber-500" size={20} />
            Impacto de la Asistencia en Calificaciones
          </h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={impactAnalysis}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#B5A264' }} domain={[0, 100]} />
                <Tooltip />
                <Bar yAxisId="left" dataKey="Estudiantes" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="Promedio" stroke="#B5A264" strokeWidth={3} dot={{ r: 6, fill: '#B5A264' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Strategic Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RecommendationCard 
          title="Prioridad de Recursos" 
          desc="Asignar 40% más de horas de tutoría a estudiantes con asistencia < 70%."
          icon={Users}
        />
        <RecommendationCard 
          title="Foco en Habilidades" 
          desc="Implementar 'Writing Bootcamps' para los programas de Administración y Economía."
          icon={Target}
        />
        <RecommendationCard 
          title="Alerta Temprana" 
          desc="Activar protocolo de bienestar al detectar 2 inasistencias consecutivas."
          icon={Lightbulb}
        />
      </div>
    </div>
  );
};

const RecommendationCard: React.FC<{ title: string; desc: string; icon: any }> = ({ title, desc, icon: Icon }) => (
  <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-xl flex items-start space-x-4">
    <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm">
      <Icon size={20} />
    </div>
    <div>
      <h5 className="font-bold text-emerald-900 text-sm">{title}</h5>
      <p className="text-xs text-emerald-800 mt-1 leading-relaxed">{desc}</p>
    </div>
  </div>
);
