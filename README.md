# Plataforma de Gestión de Riesgo Académico - UR English

Esta aplicación está diseñada para gestionar el riesgo académico de los niveles B1 y B2 del Área de Inglés de la Universidad del Rosario.

## Despliegue en Vercel

Esta aplicación está lista para ser desplegada en Vercel como una Single Page Application (SPA) con Vite.

### Pasos para el despliegue:

1.  **Conectar con GitHub/GitLab/Bitbucket:** Sube este código a un repositorio.
2.  **Importar en Vercel:** En el dashboard de Vercel, selecciona "New Project" e importa tu repositorio.
3.  **Configuración del Framework:** Vercel detectará automáticamente que es un proyecto de **Vite**.
4.  **Variables de Entorno:**
    *   Añade la variable `GEMINI_API_KEY` con tu clave de API de Google AI Studio (si la aplicación la utiliza para análisis avanzado).
5.  **Desplegar:** Haz clic en "Deploy".

### Configuración Incluida:

*   **`vercel.json`**: Configurado para manejar el enrutamiento de SPA (Single Page Application), asegurando que todas las rutas carguen el `index.html` correctamente al refrescar la página.
*   **`package.json`**: Incluye los scripts de construcción estándar (`npm run build`).

## Características Principales

*   **Dashboard Interactivo:** KPIs generales de desempeño y asistencia.
*   **Gestión de Riesgo:** Listado priorizado de estudiantes vulnerables con estrategias recomendadas.
*   **Analítica Diagnóstica:** Análisis de habilidades RET y estado actual de cursos EA.
*   **Analítica Predictiva:** Proyecciones de riesgo basadas en asistencia y desempeño previo.
*   **Analítica Estratégica:** Recomendaciones y proyecciones de recursos académicos.
*   **Búsqueda Individual:** Perfil detallado del historial académico por estudiante.

## Requisitos de Datos (CSV)

La aplicación procesa dos archivos CSV con el siguiente formato:
*   **Delimitador:** `;` (punto y coma)
*   **Decimales:** `,` (coma)
*   **Codificación:** UTF-8 o Latino (ISO-8859-1)
