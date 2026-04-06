import { useAppStore, type RETData, type CourseData, type ConsolidatedStudent } from '../store/useAppStore';
import { parseNumber } from '../lib/utils';

export function useDataProcessor() {
  const { setConsolidated } = useAppStore();

  const processData = (retRaw: RETData[], coursesRaw: CourseData[]) => {
    // Group by email/id
    const studentMap = new Map<string, ConsolidatedStudent>();

    // Process Courses first (current state)
    coursesRaw.forEach(course => {
      const key = course.email?.toLowerCase() || course.id;
      if (!key) return;

      if (!studentMap.has(key)) {
        studentMap.set(key, {
          id: course.id,
          name: '', // Will be filled by RET or later
          email: course.email,
          faculty: course.faculty || 'Sin facultad',
          program: course.program || 'Sin programa',
          riskLevel: 'Bajo',
          strategy: '',
          historicalRET: [],
          currentCourses: []
        });
      }
      
      const student = studentMap.get(key)!;
      student.currentCourses.push(course);
    });

    // Process RET (historical)
    retRaw.forEach(ret => {
      const key = ret.email?.toLowerCase() || ret.document;
      if (!key) return;

      if (!studentMap.has(key)) {
        studentMap.set(key, {
          id: ret.document,
          name: ret.studentName,
          email: ret.email,
          faculty: ret.faculty || 'Sin facultad',
          program: ret.program || 'Sin programa',
          riskLevel: 'Bajo',
          strategy: '',
          historicalRET: [],
          currentCourses: []
        });
      }

      const student = studentMap.get(key)!;
      if (!student.name) student.name = ret.studentName;
      student.historicalRET.push(ret);
    });

    // Calculate Risk and Strategies
    const consolidated = Array.from(studentMap.values()).map(student => {
      const latestCourse = student.currentCourses[0]; // Assuming sorted or just latest
      const latestRET = student.historicalRET[0];

      let risk: 'Alto' | 'Medio' | 'Bajo' = 'Bajo';
      let strategy = 'Seguimiento estándar';

      // High Risk Logic
      const isReprobado = latestCourse?.concept?.toLowerCase().includes('reprobado');
      const lowAttendance = latestCourse && latestCourse.attendance < 70;
      const lowOverall = latestRET && latestRET.overall < 60;

      if (isReprobado || lowAttendance || lowOverall) {
        risk = 'Alto';
        strategy = lowAttendance ? 'Tutoría de Asistencia y Bienestar' : 'Refuerzo Académico Intensivo';
        if (isReprobado) strategy = 'Preparación para Curso de Verano / Repetición';
      } 
      else {
        // Medium Risk Logic: Core skills (Writing/Speaking) below 70% of a threshold (e.g. 70 points)
        const lowWriting = latestRET && latestRET.writing < 15; // Assuming max is around 25
        const lowSpeaking = latestRET && latestRET.speaking < 15;

        if (lowWriting || lowSpeaking) {
          risk = 'Medio';
          strategy = lowWriting ? 'Taller de Writing Center' : 'Club de Conversación (Speaking)';
        }
      }

      return { ...student, riskLevel: risk, strategy };
    });

    setConsolidated(consolidated);
  };

  return { processData };
}
