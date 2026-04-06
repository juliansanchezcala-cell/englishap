import { create } from 'zustand';

export interface RETData {
  studentName: string;
  document: string;
  email: string;
  level: string;
  faculty: string;
  program: string;
  reading: number;
  writing: number;
  listening: number;
  speaking: number;
  overall: number;
  approved: string;
  period: string;
}

export interface CourseData {
  course: string;
  id: string;
  email: string;
  faculty: string;
  program: string;
  attendance: number;
  finalGrade: number;
  concept: string;
  period: string;
}

export interface ConsolidatedStudent {
  id: string;
  name: string;
  email: string;
  faculty: string;
  program: string;
  riskLevel: 'Alto' | 'Medio' | 'Bajo';
  strategy: string;
  historicalRET: RETData[];
  currentCourses: CourseData[];
}

interface AppState {
  retData: RETData[];
  courseData: CourseData[];
  consolidated: ConsolidatedStudent[];
  faculties: string[];
  programs: string[];
  periods: string[];
  
  // Filters
  selectedFaculty: string;
  selectedProgram: string;
  selectedPeriod: string;
  
  // UI State
  activeTab: 'dashboard' | 'risk' | 'search' | 'diagnostic' | 'predictive' | 'strategic';
  viewMode: 'clases' | 'ret';
  
  setRETData: (data: RETData[]) => void;
  setCourseData: (data: CourseData[]) => void;
  setConsolidated: (data: ConsolidatedStudent[]) => void;
  setFilters: (filters: { faculty?: string; program?: string; period?: string }) => void;
  setActiveTab: (tab: 'dashboard' | 'risk' | 'search' | 'diagnostic' | 'predictive' | 'strategic') => void;
  setViewMode: (mode: 'clases' | 'ret') => void;
  resetData: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  retData: [],
  courseData: [],
  consolidated: [],
  faculties: [],
  programs: [],
  periods: [],
  
  selectedFaculty: 'Todas',
  selectedProgram: 'Todos',
  selectedPeriod: 'Todos',
  
  activeTab: 'dashboard',
  viewMode: 'clases',
  
  setRETData: (data) => set({ retData: data }),
  setCourseData: (data) => set({ courseData: data }),
  setConsolidated: (data) => {
    const faculties = Array.from(new Set(data.map(s => s.faculty || 'Sin facultad'))).sort();
    const programs = Array.from(new Set(data.map(s => s.program || 'Sin programa'))).sort();
    const periods = Array.from(new Set([
      ...data.flatMap(s => s.historicalRET.map(r => r.period)),
      ...data.flatMap(s => s.currentCourses.map(c => c.period))
    ])).filter(Boolean).sort().reverse();
    
    set({ 
      consolidated: data, 
      faculties: ['Todas', ...faculties],
      programs: ['Todos', ...programs],
      periods: ['Todos', ...periods]
    });
  },
  setFilters: (filters) => set((state) => ({ ...state, ...filters })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setViewMode: (mode) => set({ viewMode: mode }),
  resetData: () => set({
    retData: [],
    courseData: [],
    consolidated: [],
    faculties: [],
    programs: [],
    periods: [],
    selectedFaculty: 'Todas',
    selectedProgram: 'Todos',
    selectedPeriod: 'Todos'
  }),
}));
