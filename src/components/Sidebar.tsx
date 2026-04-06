import React from 'react';
import { LayoutDashboard, ShieldAlert, Search, RefreshCw, BarChart3, TrendingUp, PieChart } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../lib/utils';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, resetData } = useAppStore();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard General', icon: LayoutDashboard },
    { id: 'risk', label: 'Gestión de Riesgo', icon: ShieldAlert },
    { id: 'search', label: 'Búsqueda Individual', icon: Search },
  ] as const;

  return (
    <div className="w-64 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 z-10">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-[#B5A264]">UR Risk Manager</h1>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Área de Inglés</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
              activeTab === item.id 
                ? "bg-[#B5A264] text-white shadow-lg" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}

        <div className="pt-8 pb-4">
          <p className="px-4 text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-4">Analítica</p>
          <div className="space-y-2">
            <AnalyticsButton 
              label="Diagnóstica" 
              icon={BarChart3} 
              active={activeTab === 'diagnostic'}
              onClick={() => setActiveTab('diagnostic')}
              color="border-blue-500/30 hover:bg-blue-500/10" 
            />
            <AnalyticsButton 
              label="Predictiva" 
              icon={TrendingUp} 
              active={activeTab === 'predictive'}
              onClick={() => setActiveTab('predictive')}
              color="border-purple-500/30 hover:bg-purple-500/10" 
            />
            <AnalyticsButton 
              label="Estratégica" 
              icon={PieChart} 
              active={activeTab === 'strategic'}
              onClick={() => setActiveTab('strategic')}
              color="border-emerald-500/30 hover:bg-emerald-500/10" 
            />
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={resetData}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-slate-800 text-slate-300 rounded-lg hover:bg-red-900/30 hover:text-red-400 transition-colors"
        >
          <RefreshCw size={18} />
          <span className="font-medium">Actualizar Datos</span>
        </button>
      </div>
    </div>
  );
};

const AnalyticsButton: React.FC<{ label: string; icon: any; color: string; active?: boolean; onClick?: () => void }> = ({ label, icon: Icon, color, active, onClick }) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center space-x-3 px-4 py-2 rounded-lg border transition-all", 
      active ? "bg-slate-800 border-white/20 text-white shadow-inner" : color,
      !active && "text-slate-400"
    )}
  >
    <Icon size={16} className={active ? "text-[#B5A264]" : ""} />
    <span>{label}</span>
  </button>
);
