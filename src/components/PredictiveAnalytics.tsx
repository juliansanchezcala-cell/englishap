import React, { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../lib/utils';
import { TrendingUp, AlertCircle, Users, Clock } from 'lucide-react';

export const PredictiveAnalytics: React.FC = () => {
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

  const predictions = useMemo(() => {
    return filteredData.map(s => {
      // If a period is selected, only consider data from that period for prediction
      const relevantCourse = selectedPeriod === 'Todos' 
        ? s.currentCourses[0] 
        : s.currentCourses.find(c => c.period === selectedPeriod);
      
      const relevantRET = selectedPeriod === 'Todos'
        ? s.historicalRET[0]
        : s.historicalRET.find(r => r.period === selectedPeriod);

      const attendance = relevantCourse?.attendance || 0;
      const prevOverall = relevantRET?.overall || 0;
      
      // Simple prediction logic: 
      // Probability of failure increases as attendance and prev score drop
      const failProb = Math.min(100, Math.max(0, 
        (100 - attendance) * 0.6 + (100 - prevOverall) * 0.4
      ));

      return {
        ...s,
        attendance,
        score: prevOverall,
        prob: failProb
      };
    });
  }, [filteredData]);

  const stats = useMemo(() => {
    const total = predictions.length;
    if (total === 0) return null;

    const criticalRisk = predictions.filter(p => p.prob > 80).length;
    const lowAttendance = predictions.filter(p => p.attendance < 70 && p.attendance > 0).length;
    const lowHistory = predictions.filter(p => p.score < 60 && p.score > 0).length;
    const priorityIntervention = predictions.filter(p => p.prob > 60).length;

    return {
      criticalRisk,
      lowAttendance,
      lowHistory,
      priorityIntervention,
      total
    };
  }, [predictions]);

  if (!stats) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center">
        <p className="text-slate-500">No hay datos suficientes para generar predicciones en esta selección.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PredictiveCard 
          title="Proyección de Riesgo Crítico"
          value={stats.criticalRisk}
          description={`Estudiantes con una probabilidad de falla superior al 80%. Este grupo presenta una combinación de inasistencia severa y bajos antecedentes académicos.`}
          icon={AlertCircle}
          status="danger"
        />
        <PredictiveCard 
          title="Impacto de Inasistencia"
          value={stats.lowAttendance}
          description={`Estudiantes con asistencia actual por debajo del 70%. Según el modelo, la inasistencia es el predictor #1 de deserción en los niveles B1/B2.`}
          icon={Clock}
          status="warning"
        />
        <PredictiveCard 
          title="Brecha Académica Histórica"
          value={stats.lowHistory}
          description={`Estudiantes que ingresaron al curso con un Overall RET menor a 60. Requieren refuerzo pedagógico preventivo independientemente de su asistencia.`}
          icon={TrendingUp}
          status="info"
        />
        <PredictiveCard 
          title="Prioridad de Intervención"
          value={stats.priorityIntervention}
          description={`Total de la población con probabilidad de falla > 60%. Se recomienda citación inmediata a tutoría académica y seguimiento de bienestar.`}
          icon={Users}
          status="danger"
        />
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h4 className="text-xl font-bold text-[#B5A264] mb-4">Modelo de Predicción UR-English</h4>
          <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
            El análisis predictivo utiliza un algoritmo de ponderación que asigna un <strong>60% de peso a la asistencia actual</strong> y un <strong>40% al desempeño histórico (RET)</strong>. 
            Este enfoque permite identificar estudiantes vulnerables antes de que finalice el corte académico, facilitando acciones preventivas oportunas.
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12">
          <TrendingUp size={200} />
        </div>
      </div>
    </div>
  );
};

interface PredictiveCardProps {
  title: string;
  value: number;
  description: string;
  icon: any;
  status: 'danger' | 'warning' | 'info';
}

const PredictiveCard: React.FC<PredictiveCardProps> = ({ title, value, description, icon: Icon, status }) => {
  const styles = {
    danger: "border-red-200 bg-red-50 text-red-900 icon-bg-red-100 icon-text-red-600",
    warning: "border-amber-200 bg-amber-50 text-amber-900 icon-bg-amber-100 icon-text-amber-600",
    info: "border-blue-200 bg-blue-50 text-blue-900 icon-bg-blue-100 icon-text-blue-600"
  };

  const currentStyle = styles[status];

  return (
    <div className={cn("p-8 rounded-2xl border shadow-sm flex flex-col space-y-4 transition-all hover:shadow-md", currentStyle.split(' icon-')[0])}>
      <div className="flex items-center justify-between">
        <div className={cn("p-3 rounded-xl", currentStyle.split(' icon-')[1].split(' ')[0], currentStyle.split(' icon-text-')[1])}>
          <Icon size={24} />
        </div>
        <span className="text-4xl font-black">{value}</span>
      </div>
      <div>
        <h4 className="font-black uppercase tracking-widest text-xs opacity-70 mb-2">{title}</h4>
        <p className="text-sm leading-relaxed font-medium opacity-80">{description}</p>
      </div>
    </div>
  );
};
