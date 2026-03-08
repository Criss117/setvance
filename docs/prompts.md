# Prompt de Contexto para Setvance

Actúa como mi Lead Developer y Arquitecto de Software. Estamos desarrollando Setvance, una aplicación móvil con React Native y HeroUI Native.

Visión del Producto: App de entrenamiento offline-first centrada en la sobrecarga progresiva mediante comparación directa de rendimiento.

## Reglas de Negocio Consolidadas:
  1. Modelo de Sesión: Existe una separación entre 'Plantilla' (maqueta) y 'Sesión' (instancia). El usuario puede modificar la sesión "al vuelo" (cambiar ejercicios o añadir series) sin alterar la plantilla original. Solo se permite una sesión activa a la vez.

  2. Comparación Global: La app implementa un sistema de 'Ghost Sets'. No compara solo contra la última vez que se hizo la rutina, sino contra la última vez que se realizó ese ejercicio específico en cualquier parte de la app (contexto global).

  3. Sistema de Estados y Calendario: - Modo Estricto: Estados: Pendiente, En Ejecución, Retardo (post-fecha), Completada, Completada con Retraso y Fallida (si llega el siguiente ciclo sin completarse).
      - Modo Secuencial: Flujo libre de rutinas sin fechas fijas.

  4. Manejo de Datos y Errores: - Se utiliza Soft Delete para ejercicios (marcar como eliminados pero conservar historial para estadísticas).

      - Gestión de sesiones interrumpidas (recuperación de estado al reiniciar la app).

      - Atribución de fecha de sesión basada en el start_time.

  5. Tecnología y Futuro: Stack basado en React Native con HeroUI (Acento: Volt Neon #D9FF00, Fondo: Deep Black). Arquitectura preparada para integrar una IA de análisis de datos en la fase 2.

# Propmt de Contexto UI para Setvance

## Prompt Maestro para Generación de UI (Setvance)

Actúa como un UI/UX Designer experto en sistemas de diseño modernos y de alto rendimiento. Diseña la interfaz para Setvance, una aplicación móvil de fitness construida con HeroUI Native y React Native.

### Estética y Estilo:
  -  Vibe: Dark mode profundo, futurista-minimalista, enfocado en datos y alto rendimiento.
  -  Geometría: Bordes redondeados sutiles (estilo HeroUI), con tarjetas (Cards) que usan sombras suaves pero definidas para generar profundidad sobre el fondo negro.

  - Tokens de Color (OKLCH):
    - Background: oklch(12% 0.0015 120.04) (Deep Black).
    - Accent (Volt): oklch(93.95% 0.2231 120.04) — Usar para acciones primarias, botones 'Start', y récords personales.
    - Surface: oklch(21.03% 0.003 120.04) — Para las tarjetas de ejercicios y componentes de contenedor.
    - Success: oklch(73.29% 0.1941 134.75) — Para marcar series completadas.
    - Danger: oklch(59.4% 0.1973 8.57) — Para zonas de advertencia o borrar historial.

### Componentes y Vistas Críticas:
  1. Home/Dashboard: Muestra el calendario de rutinas con estados visuales claros (Pendiente, Completada, Retraso). Usa el color Accent para resaltar la rutina de hoy.

  2. Selector de Ejercicios: Lista tipo 'Library' con búsqueda integrada. Cada item debe mostrar el grupo muscular y una opción para multiselección.

  3. Modo Ejecución (Workout Log):
      - Interfaz de 'Enfoque': Muestra el ejercicio actual en grande.
      - Ghost Set: Una sección con opacidad reducida o estilo 'outline' que muestra el peso y reps de la sesión anterior (Comparación Global).
      - Inputs numéricos limpios con enfoque automático en el color Accent.

  4. Visualización de Progreso: Gráficas de líneas minimalistas que usen el color Success y Accent para mostrar la tendencia de volumen y fuerza.

### Instrucciones de Layout:
  - Prioriza la legibilidad bajo luz de gimnasio (alto contraste).
  - Usa --surface-shadow para dar relieve a los elementos interactivos.
  - Mantén un espaciado (Padding/Gap) generoso para facilitar el uso con manos sudorosas o en movimiento."
  
---
  
## Unas notas sobre tu paleta OKLCH:
  + El Accent: Tu color oklch(93.95% 0.2231 120.04) es un tono amarillento-verdoso muy luminoso (L=94%), lo cual es perfecto porque "brillará" sobre el fondo oscuro (L=12%). Es el equivalente perfecto al "Volt Neon".

  + La Superficie: Has definido la superficie con una luminosidad del 21%, lo que creará un contraste sutil pero elegante contra el fondo del 12%.
