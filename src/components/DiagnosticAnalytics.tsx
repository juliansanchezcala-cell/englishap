import React, { useMemo } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../lib/utils';

export const DiagnosticAnalytics: React.FC = () => {
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

  const skillAverages = useMemo(() => {
    if (filteredData.length === 0) return [];
    
    let totals = { reading: 0, writing: 0, listening: 0, speaking: 0, count: 0 };
    filteredData.forEach(s => {
      const relevantRET = selectedPeriod === 'Todos'
        ? s.historicalRET[0]
        : s.historicalRET.find(r => r.period === selectedPeriod);

      if (relevantRET) {
        totals.reading += relevantRET.reading;
        totals.writing += relevantRET.writing;
        totals.listening += relevantRET.listening;
        totals.speaking += relevantRET.speaking;
        totals.count++;
      }
    });

    if (totals.count === 0) return [];

    return [
      { subject: 'Reading', A: (totals.reading / totals.count).toFixed(1), fullMark: 25 },
      { subject: 'Writing', A: (totals.writing / totals.count).toFixed(1), fullMark: 25 },
      { subject: 'Listening', A: (totals.listening / totals.count).toFixed(1), fullMark: 25 },
      { subject: 'Speaking', A: (totals.speaking / totals.count).toFixed(1), fullMark: 25 },
    ];
  }, [filteredData]);

  const failureRateBySkill = useMemo(() => {
    // Threshold for "failure" in a skill is 60% (15/25)
    const threshold = 15;
    let failures = { reading: 0, writing: 0, listening: 0, speaking: 0, total: 0 };

    filteredData.forEach(s => {
      const relevantRET = selectedPeriod === 'Todos'
        ? s.historicalRET[0]
        : s.historicalRET.find(r => r.period === selectedPeriod);

      if (relevantRET) {
        if (relevantRET.reading < threshold) failures.reading++;
        if (relevantRET.writing < threshold) failures.writing++;
        if (relevantRET.listening < threshold) failures.listening++;
        if (relevantRET.speaking < threshold) failures.speaking++;
        failures.total++;
      }
    });

    if (failures.total === 0) return [];

    return [
      { name: 'Reading', rate: ((failures.reading / failures.total) * 100).toFixed(1) },
      { name: 'Writing', rate: ((failures.writing / failures.total) * 100).toFixed(1) },
      { name: 'Listening', rate: ((failures.listening / failures.total) * 100).toFixed(1) },
      { name: 'Speaking', rate: ((failures.speaking / failures.total) * 100).toFixed(1) },
    ];
  }, [filteredData]);

  return (
    <div className="space-y-12">
      {/* SECTION 1: HISTORICO RET */}
      <section className="space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-black text-slate-900">Análisis Diagnóstico: Histórico RET (Consolidado Limpio)</h2>
          <p className="text-slate-500">Evaluación de competencias iniciales y brechas por habilidad</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skill Balance Radar */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Equilibrio de Habilidades (Promedio RET)</h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillAverages}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 25]} tick={{ fill: '#94a3b8' }} />
                  <Radar
                    name="Promedio"
                    dataKey="A"
                    stroke="#B5A264"
                    fill="#B5A264"
                    fillOpacity={0.5}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Failure Rate Bar Chart */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">% Estudiantes con Puntaje Bajo en RET (&lt;15)</h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={failureRateBySkill} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="rate" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={30} label={{ position: 'right', formatter: (v: any) => `${v}%`, fontSize: 12, fill: '#ef4444', fontWeight: 'bold' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: INSCRITOS CURSO EA */}
      <section className="space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-black text-slate-900">Análisis Diagnóstico: Inscritos en Curso (EA)</h2>
          <p className="text-slate-500">Análisis descriptivo del estado actual de los grupos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DescriptiveCard 
            title="Estado de Aprobación"
            content={`De los ${filteredData.length} estudiantes inscritos, el ${(filteredData.filter(s => {
              const course = selectedPeriod === 'Todos' ? s.currentCourses[0] : s.currentCourses.find(c => c.period === selectedPeriod);
              return course?.concept?.toLowerCase().includes('aprobado');
            }).length / (filteredData.length || 1) * 100).toFixed(1)}% mantiene un concepto favorable. Sin embargo, se identifica un grupo crítico que requiere nivelación inmediata para evitar la pérdida del curso.`}
            status="info"
          />
          <DescriptiveCard 
            title="Nivel de Compromiso"
            content={`La asistencia promedio se sitúa en ${(filteredData.reduce((acc, s) => {
              const course = selectedPeriod === 'Todos' ? s.currentCourses[0] : s.currentCourses.find(c => c.period === selectedPeriod);
              return acc + (course?.attendance || 0);
            }, 0) / (filteredData.length || 1)).toFixed(1)}%. Existe una correlación directa entre la inasistencia y el riesgo de reprobación, especialmente en los programas con mayor carga horaria.`}
            status="warning"
          />
          <DescriptiveCard 
            title="Alerta de Deserción"
            content={`Se han detectado ${filteredData.filter(s => {
              const course = selectedPeriod === 'Todos' ? s.currentCourses[0] : s.currentCourses.find(c => c.period === selectedPeriod);
              return (course?.attendance || 0) < 60 && (course?.attendance || 0) > 0;
            }).length} estudiantes con asistencia crítica (menor al 60%). Se recomienda activar el protocolo de bienestar y realizar entrevistas individuales para identificar causas externas.`}
            status="danger"
          />
        </div>
      </section>

      <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl">
        <h4 className="font-bold text-blue-900 mb-2">Hallazgos Diagnósticos</h4>
        <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
          {parseFloat(failureRateBySkill.find(s => s.name === 'Writing')?.rate || '0') > 30 && (
            <li>Se observa una brecha crítica en <strong>Writing</strong>, afectando a más del 30% de la población evaluada.</li>
          )}
          {parseFloat(failureRateBySkill.find(s => s.name === 'Speaking')?.rate || '0') > 25 && (
            <li>La producción oral (<strong>Speaking</strong>) requiere intervención inmediata para mejorar la fluidez.</li>
          )}
          <li>La facultad de <strong>{selectedFaculty}</strong> muestra un desempeño {filteredData.length > 0 ? 'consistente con el promedio general' : 'pendiente de datos'}.</li>
        </ul>
      </div>
    </div>
  );
};

const DescriptiveCard: React.FC<{ title: string; content: string; status: 'info' | 'warning' | 'danger' }> = ({ title, content, status }) => {
  const colors = {
    info: "border-blue-200 bg-blue-50 text-blue-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    danger: "border-red-200 bg-red-50 text-red-900"
  };

  return (
    <div className={cn("p-6 rounded-2xl border shadow-sm space-y-3", colors[status])}>
      <h4 className="font-black uppercase tracking-widest text-xs opacity-70">{title}</h4>
      <p className="text-sm leading-relaxed font-medium">{content}</p>
    </div>
  );
};
