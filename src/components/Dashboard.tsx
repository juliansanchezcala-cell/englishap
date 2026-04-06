import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { Users, GraduationCap, Percent, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../lib/utils';

export const Dashboard: React.FC = () => {
  const { 
    consolidated, 
    viewMode, 
    setViewMode, 
    selectedFaculty, 
    selectedProgram, 
    selectedPeriod
  } = useAppStore();

  const filteredData = useMemo(() => {
    return consolidated.filter(s => {
      const matchFaculty = selectedFaculty === 'Todas' || s.faculty === selectedFaculty;
      const matchProgram = selectedProgram === 'Todos' || s.program === selectedProgram;
      // Period filter is more complex as it's historical, but we filter students who have entries in that period
      const matchPeriod = selectedPeriod === 'Todos' || 
        s.historicalRET.some(r => r.period === selectedPeriod) ||
        s.currentCourses.some(c => c.period === selectedPeriod);
      
      return matchFaculty && matchProgram && matchPeriod;
    });
  }, [consolidated, selectedFaculty, selectedProgram, selectedPeriod]);

  const kpis = useMemo(() => {
    if (filteredData.length === 0) return { avgOverall: 0, avgAttendance: 0, totalStudents: 0, highRisk: 0 };
    
    const totalStudents = filteredData.length;
    const highRisk = filteredData.filter(s => s.riskLevel === 'Alto').length;
    
    let sumOverall = 0;
    let countOverall = 0;
    let sumAttendance = 0;
    let countAttendance = 0;

    filteredData.forEach(s => {
      if (s.historicalRET.length > 0) {
        sumOverall += s.historicalRET[0].overall;
        countOverall++;
      }
      if (s.currentCourses.length > 0) {
        sumAttendance += s.currentCourses[0].attendance;
        countAttendance++;
      }
    });

    return {
      avgOverall: countOverall > 0 ? (sumOverall / countOverall).toFixed(1) : 0,
      avgAttendance: countAttendance > 0 ? (sumAttendance / countAttendance).toFixed(1) : 0,
      totalStudents,
      highRisk
    };
  }, [filteredData]);

  const chartData = useMemo(() => {
    // Group by faculty
    const facultyGroups: Record<string, any> = {};

    filteredData.forEach(s => {
      const f = s.faculty || 'Sin facultad';
      if (!facultyGroups[f]) {
        facultyGroups[f] = { 
          name: f, 
          reading: 0, writing: 0, listening: 0, speaking: 0, countRET: 0,
          grade: 0, countGrade: 0
        };
      }
      
      if (s.historicalRET.length > 0) {
        const r = s.historicalRET[0];
        facultyGroups[f].reading += r.reading;
        facultyGroups[f].writing += r.writing;
        facultyGroups[f].listening += r.listening;
        facultyGroups[f].speaking += r.speaking;
        facultyGroups[f].countRET++;
      }

      if (s.currentCourses.length > 0) {
        facultyGroups[f].grade += s.currentCourses[0].finalGrade;
        facultyGroups[f].countGrade++;
      }
    });

    return Object.values(facultyGroups).map(g => ({
      name: g.name,
      Reading: g.countRET > 0 ? (g.reading / g.countRET).toFixed(1) : 0,
      Writing: g.countRET > 0 ? (g.writing / g.countRET).toFixed(1) : 0,
      Listening: g.countRET > 0 ? (g.listening / g.countRET).toFixed(1) : 0,
      Speaking: g.countRET > 0 ? (g.speaking / g.countRET).toFixed(1) : 0,
      Promedio: g.countGrade > 0 ? (g.grade / g.countGrade).toFixed(1) : 0,
    }));
  }, [filteredData]);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Total Estudiantes" value={kpis.totalStudents} icon={Users} color="text-blue-600" />
        <KPICard title="Promedio Overall (RET)" value={kpis.avgOverall} icon={GraduationCap} color="text-[#B5A264]" />
        <KPICard title="% Asistencia Promedio" value={`${kpis.avgAttendance}%`} icon={Percent} color="text-emerald-600" />
        <KPICard title="Riesgo Alto" value={kpis.highRisk} icon={AlertTriangle} color="text-red-600" />
      </div>

      {/* Charts Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-slate-800">Análisis de Desempeño por Facultad</h2>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setViewMode('clases')}
              className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all", viewMode === 'clases' ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700")}
            >
              Vista Clases
            </button>
            <button 
              onClick={() => setViewMode('ret')}
              className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all", viewMode === 'ret' ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700")}
            >
              Vista RET
            </button>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'ret' ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="Reading" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Writing" fill="#B5A264" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Listening" fill="#475569" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Speaking" fill="#1e293b" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="Promedio" stroke="#B5A264" strokeWidth={3} dot={{ r: 6, fill: '#B5A264', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const KPICard: React.FC<{ title: string; value: string | number; icon: any; color: string }> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
    <div className={cn("p-3 rounded-lg bg-slate-50", color)}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);
