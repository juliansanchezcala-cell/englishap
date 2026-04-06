import React, { useCallback } from 'react';
import Papa from 'papaparse';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAppStore, type RETData, type CourseData } from '../store/useAppStore';
import { useDataProcessor } from '../hooks/useDataProcessor';
import { parseNumber } from '../lib/utils';

export const FileUploader: React.FC = () => {
  const { setRETData, setCourseData, retData, courseData } = useAppStore();
  const { processData } = useDataProcessor();

  const handleFileUpload = (type: 'ret' | 'courses', file: File) => {
    Papa.parse(file, {
      header: true,
      delimiter: ';',
      skipEmptyLines: true,
      complete: (results) => {
        if (type === 'ret') {
          const processed: RETData[] = results.data.map((row: any) => ({
            studentName: row['Nombres del Estudiante'],
            document: row['Documento'],
            email: row['Correo'],
            level: row['NIVEL AL QUE SE PRESENTA'],
            faculty: row['Facultad'] || 'Sin facultad',
            program: row['Programa'] || 'Sin programa',
            reading: parseNumber(row['Reading']),
            writing: parseNumber(row['writing']),
            listening: parseNumber(row['Listening']),
            speaking: parseNumber(row['Speaking']),
            overall: parseNumber(row['Overall']),
            approved: row['Aprobó'],
            period: row['Periodo']
          }));
          setRETData(processed);
          if (courseData.length > 0) processData(processed, courseData);
        } else {
          const processed: CourseData[] = results.data.map((row: any) => ({
            course: row['Curso'],
            id: row['ID'],
            email: row['E-mail'],
            faculty: row['Facultad'] || 'Sin facultad',
            program: row['Programa'] || 'Sin programa',
            attendance: parseNumber(row['% Asistencia']),
            finalGrade: parseNumber(row['FINAL COURSE GRADE\n100%'] || row['FINAL COURSE GRADE']),
            concept: row['Concepto malla'],
            period: row['Periodo']
          }));
          setCourseData(processed);
          if (retData.length > 0) processData(retData, processed);
        }
      }
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <UploadCard 
        title="Histórico RET" 
        description="Cargar archivo CSV con resultados de exámenes RET"
        onUpload={(file) => handleFileUpload('ret', file)}
        isLoaded={retData.length > 0}
      />
      <UploadCard 
        title="Cursos Actuales" 
        description="Cargar archivo CSV con asistencia y notas de cursos"
        onUpload={(file) => handleFileUpload('courses', file)}
        isLoaded={courseData.length > 0}
      />
    </div>
  );
};

interface UploadCardProps {
  title: string;
  description: string;
  onUpload: (file: File) => void;
  isLoaded: boolean;
}

const UploadCard: React.FC<UploadCardProps> = ({ title, description, onUpload, isLoaded }) => {
  return (
    <div className={`relative group border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
      isLoaded ? 'border-green-500 bg-green-50/30' : 'border-slate-300 hover:border-[#B5A264] bg-white'
    }`}>
      <div className="flex flex-col items-center text-center space-y-4">
        <div className={`p-4 rounded-full ${isLoaded ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500 group-hover:text-[#B5A264]'}`}>
          {isLoaded ? <CheckCircle2 size={32} /> : <Upload size={32} />}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>
        <input
          type="file"
          accept=".csv"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
        />
        {isLoaded && (
          <span className="text-xs font-medium text-green-600 flex items-center gap-1">
            <CheckCircle2 size={12} /> Archivo cargado correctamente
          </span>
        )}
      </div>
    </div>
  );
};
