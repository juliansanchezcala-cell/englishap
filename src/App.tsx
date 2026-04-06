import React from 'react';
import { Sidebar } from './components/Sidebar';
import { FileUploader } from './components/FileUploader';
import { Dashboard } from './components/Dashboard';
import { RiskManagement } from './components/RiskManagement';
import { StudentSearch } from './components/StudentSearch';
import { DiagnosticAnalytics } from './components/DiagnosticAnalytics';
import { PredictiveAnalytics } from './components/PredictiveAnalytics';
import { StrategicAnalytics } from './components/StrategicAnalytics';
import { useAppStore } from './store/useAppStore';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const { 
    activeTab, 
    consolidated, 
    selectedFaculty, 
    selectedProgram, 
    selectedPeriod,
    faculties,
    programs,
    periods,
    setFilters 
  } = useAppStore();

  const renderContent = () => {
    if (consolidated.length === 0) {
      return (
        <div className="space-y-8">
          <div className="bg-[#B5A264]/10 border border-[#B5A264]/20 p-6 rounded-2xl flex items-start space-x-4">
            <AlertCircle className="text-[#B5A264] shrink-0" size={24} />
            <div>
              <h2 className="text-lg font-bold text-slate-900">Bienvenido al Sistema de Gestión de Riesgo</h2>
              <p className="text-slate-600 text-sm mt-1">
                Para comenzar, por favor cargue los archivos CSV correspondientes al Histórico RET y los Cursos Actuales. 
                El sistema cruzará la información automáticamente para generar los indicadores de riesgo.
              </p>
            </div>
          </div>
          <FileUploader />
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'risk':
        return <RiskManagement />;
      case 'search':
        return <StudentSearch />;
      case 'diagnostic':
        return <DiagnosticAnalytics />;
      case 'predictive':
        return <PredictiveAnalytics />;
      case 'strategic':
        return <StrategicAnalytics />;
      default:
        return <Dashboard />;
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard de Desempeño';
      case 'risk': return 'Gestión de Riesgo';
      case 'search': return 'Perfil del Estudiante';
      case 'diagnostic': return 'Analítica Diagnóstica';
      case 'predictive': return 'Analítica Predictiva';
      case 'strategic': return 'Analítica Estratégica';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                {getTitle()}
              </h1>
              <p className="text-slate-500 font-medium mt-1">Universidad del Rosario • Área de Inglés</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-900">Admin Académico</p>
                <p className="text-xs text-slate-500">Área de Inglés B1/B2</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#B5A264] flex items-center justify-center text-white font-bold shadow-md">
                AD
              </div>
            </div>
          </div>

          {consolidated.length > 0 && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-end animate-in fade-in slide-in-from-top-2 duration-500">
              <FilterSelect 
                label="Facultad" 
                options={faculties} 
                value={selectedFaculty} 
                onChange={(v) => setFilters({ faculty: v })} 
              />
              <FilterSelect 
                label="Programa" 
                options={programs} 
                value={selectedProgram} 
                onChange={(v) => setFilters({ program: v })} 
              />
              <FilterSelect 
                label="Periodo" 
                options={periods} 
                value={selectedPeriod} 
                onChange={(v) => setFilters({ period: v })} 
              />
            </div>
          )}
        </header>

        <div className="animate-in fade-in duration-700">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

const FilterSelect: React.FC<{ label: string; options: string[]; value: string; onChange: (v: string) => void }> = ({ label, options, value, onChange }) => (
  <div className="flex flex-col space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
    <select 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-[#B5A264] outline-none min-w-[200px] hover:border-[#B5A264] transition-colors cursor-pointer"
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);
