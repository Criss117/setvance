# **Especificación de Requerimientos Técnicos: Ecosistema de Entrenamiento Setvance**

## **Introducción**

La arquitectura del sistema Setvance se concibe como una respuesta técnica a la creciente necesidad de aplicaciones de alto rendimiento en el sector del fitness que operen bajo el paradigma de "fuente de verdad local" o *offline-first*.1 En el panorama actual del desarrollo de software móvil, la dependencia de la conectividad constante representa un punto de falla crítico, especialmente en entornos como gimnasios subterráneos o instalaciones deportivas con blindaje electromagnético, donde la latencia de red degrada la experiencia del usuario.3 La filosofía de Setvance invierte esta dinámica: el dispositivo móvil actúa como un nodo autónomo capaz de gestionar la lógica de negocio, la validación de estados y el almacenamiento persistente sin requerir un servidor central en el camino crítico de la ejecución del entrenamiento.
El núcleo funcional de Setvance es la sobrecarga progresiva, un principio fisiológico que exige un incremento constante y medible de la tensión mecánica aplicada al tejido muscular para inducir adaptaciones de fuerza e hipertrofia.5 Desde una perspectiva de sistemas, la implementación de este principio requiere una gestión de datos histórica y comparativa extremadamente eficiente. La arquitectura debe permitir que un atleta, en el momento preciso de realizar una serie, reciba información predictiva basada en su rendimiento histórico global, una funcionalidad denominada internamente como "Ghost Sets" o series fantasma. 
Técnicamente, Setvance se aleja de las aplicaciones de fitness convencionales que funcionan como simples diarios estáticos. El sistema implementa una separación clara entre la planificación estratégica (Constructor) y el seguimiento táctico (Ejecutor), utilizando un modelo de datos basado en plantillas e instancias que garantiza la inmutabilidad de los planes originales mientras permite la máxima flexibilidad durante la sesión real.9 Esta documentación detalla los requerimientos técnicos, las entidades de datos y las estrategias de persistencia necesarias para construir un sistema que no solo registre el pasado, sino que sea la base atómica para modelos futuros de inteligencia artificial orientados a la optimización del rendimiento humano.

## **Arquitectura de la Información**

La estructura de datos de Setvance se fundamenta en un modelo relacional normalizado, optimizado para la recuperación de series históricas con baja latencia en entornos móviles. La arquitectura se organiza para soportar la creación de perfiles de usuario detallados, bibliotecas de ejercicios extensibles y una jerarquía de entrenamiento que permite la escalabilidad desde el nivel atómico (la serie) hasta el nivel macro (el ciclo de entrenamiento).

### **Entidades y Atributos**

La definición de entidades se ha diseñado bajo principios de atomicidad, asegurando que cada punto de dato sea capturado con el contexto suficiente para análisis posteriores por modelos de aprendizaje automático.

| Entidad | Descripción Técnica | Atributos Clave | Tipo de Dato |
| :---- | :---- | :---- | :---- |
| **Usuario** | Representa al sujeto de entrenamiento y sus parámetros base. | uuid, age, weight\_body, gender, fitness\_level, units\_preference | UUID, Integer, Decimal, String, String, String |
| **Ejercicio** | Definición abstracta de un movimiento físico. | id\_global, name, muscle\_group, equipment, is\_unilateral, resistance\_curve | UUID, String, Enum, Enum, Boolean, Enum |
| **Plantilla de Rutina** | Blueprint o maqueta de una sesión planificada. | id\_template, owner\_id, name, description, is\_archived, created\_at | UUID, UUID, String, Text, Boolean, Timestamp |
| **Elemento de Plantilla** | Vinculación entre ejercicio y plantilla con metas. | id\_item, template\_id, exercise\_id, target\_sets, target\_reps\_range, target\_rest\_time | UUID, UUID, UUID, Integer, Range, Integer |
| **Sesión Realizada** | Instancia de ejecución de una rutina o entrenamiento libre. | id\_session, user\_id, template\_id\_ref, start\_timestamp, end\_timestamp, session\_state, notes | UUID, UUID, UUID (nullable), Timestamp, Timestamp, Enum, Text |
| **Instancia de Serie** | El registro atómico de una serie de ejercicio realizada. | id\_set, session\_id, exercise\_id, weight\_lifted, reps\_performed, rpe\_value, rest\_actual, set\_index | UUID, UUID, UUID, Decimal, Integer, Float, Integer, Integer |

### **Jerarquía de Datos: Del Blueprint a la Instancia**

El sistema debe implementar una diferencia técnica estricta entre los objetos de definición y los objetos de registro. Esta jerarquía permite que el usuario modifique una sesión en tiempo real sin alterar la estructura lógica de su plan de entrenamiento a largo plazo.

1. **Capa de Definición (Template):** Los registros en esta capa son inmutables para el proceso de ejecución. Representan el "ideal" o la meta. Cualquier cambio en esta capa solo se refleja en sesiones futuras que se instancien a partir del momento de la modificación.10  
2. **Capa de Instanciación (Session):** Al iniciar un entrenamiento, el sistema clona los datos relevantes del Template hacia una nueva entrada de Sesión Realizada. Esta sesión posee su propia identidad técnica (UUID\_Session) y se desvincula operacionalmente de la plantilla.
3. **Capa Atómica (Set):** Cada serie realizada se vincula a la sesión. El sistema permite la inyección de series extra o la eliminación de series planificadas en esta capa, proporcionando una flexibilidad total frente a contingencias intra-entrenamiento.

### **Métricas de Rendimiento y Captura de Datos**

La captura de métricas se realiza de forma atómica para cada serie. Se rechaza cualquier forma de agregación promediada en el momento de la ingesta para preservar la varianza de los datos, lo cual es crítico para identificar patrones de fatiga acumulada.

* **Peso ($W$):** Representa la carga externa. El sistema debe permitir registros con precisión de dos decimales para soportar micro-cargas (ej. 1.25 kg).
* **Repeticiones ($R$):** Conteo íntegro de ciclos de trabajo completados. En el caso de ejercicios isométricos, este atributo puede ser mapeado a tiempo de duración en segundos.
* **Esfuerzo Percibido (RPE):** Se utiliza una escala subjetiva de 1 a 10\. Este atributo es fundamental para la autorregulación. Un RPE de 10 indica un fallo técnico completo, mientras que un RPE de 8 sugiere que el atleta podría haber realizado dos repeticiones adicionales (RIR 2).
* **Tiempo de Descanso:** Intervalo medido desde la finalización de una serie hasta el inicio de la siguiente. El sistema debe automatizar esta captura mediante un temporizador integrado que se activa al confirmar el registro de la serie.

## **Lógica de Recurrencia y Programación (Motor de Calendario)**

Para potenciar la planificación estratégica, Setvance implementa un motor de recurrencia avanzado que emula la flexibilidad de herramientas de productividad como Notion Calendar. Esta lógica permite que el "Constructor" defina ritmos de entrenamiento complejos que el sistema proyecta de forma autónoma en la persistencia local.

### **Entidad de Configuración de Recurrencia**

Se añade una sub-entidad vinculada a la **Plantilla de Rutina** para gestionar las reglas de repetición.

| Atributo | Descripción Técnica | Tipo de Dato |
| :--- | :--- | :--- |
| **frequency** | Unidad de tiempo base (Diaria, Semanal, Mensual, Anual, Personalizada). | Enum |
| **interval** | Multiplicador de la frecuencia (ej. cada "2" semanas). | Integer |
| **days_of_week** | Máscara de días específicos para repeticiones semanales (L, M, X, J, V, S, D). | String/Array |
| **end_condition** | Define el límite de la serie (Nunca, Fecha específica, N repeticiones). | Enum |
| **start_date** | Punto de anclaje temporal para el inicio del ciclo de recurrencia. | Date |

### **Mapeo de Patrones de Usuario**

El sistema interpreta las reglas de negocio para cubrir los siguientes escenarios de planificación:

* **Rutinas de Alta Frecuencia:** Repetición diaria o cada "X" días (ej. ciclo de descanso de 3 días).
* **Planificación Semanal Tradicional:** Días fijos a la semana (ej. Lunes, Miércoles y Viernes).
* **Bloques Laborales:** Opción preconfigurada de Lunes a Viernes.
* **Ciclos de Larga Duración:** Sesiones mensuales para evaluaciones de fuerza máxima (1RM).

### **Proyección y Limpieza de Instancias (Offline Engine)**

Dado el enfoque *offline-first*, el motor de calendario opera localmente bajo las siguientes reglas:

1.  **Horizonte de Proyección:** El sistema genera automáticamente instancias de **Sesión Realizada** en estado `Pendiente` para los próximos 30 días basándose en la configuración de recurrencia.
2.  **Sincronización de Cambios:** Si el usuario modifica el patrón de recurrencia en el Constructor, el sistema ejecuta una rutina de "limpieza de futuros", eliminando las sesiones en estado `Pendiente` que ya no coincidan con la nueva regla, preservando siempre las sesiones `Completadas`.
3.  **Independencia de Instancia:** Aunque una sesión nazca de una regla recurrente, cada instancia posee su propio `UUID_Session`. Esto permite que el usuario mueva una sesión específica de día sin alterar el resto del calendario recurrente.

### **Interacción con la FSM (Máquina de Estados)**

La recurrencia añade validaciones temporales críticas a la máquina de estados de la sesión:

* **Validación de Ventana:** Una sesión `Pendiente` solo habilita el estado `En Ejecución` cuando el tiempo actual entra en la ventana de oportunidad definida (ej. desde las 00:00 del día programado).
* **Transición a Fallida:** Si el tiempo actual excede el inicio de la siguiente sesión programada del mismo tipo sin haberse ejecutado la anterior, la instancia pendiente transita automáticamente a `Fallida` para proteger la integridad de las métricas de adherencia.

## **Reglas de Validación de Negocio**

El motor de negocio de Setvance rige la transición de los estados de entrenamiento, el cálculo de objetivos dinámicos y la integridad de la progresión del usuario. Estas reglas aseguran que la aplicación no solo registre datos, sino que proporcione una guía lógica basada en principios deportivos.

### **Lógica de Estados de Sesión**

El sistema debe gestionar el ciclo de vida de una sesión mediante una máquina de estados finitos (FSM), diferenciando claramente entre rutinas estructuradas cronológicamente y aquellas basadas en una secuencia lógica libre.

#### **Rutinas con Calendario**

Para usuarios que siguen programas con fechas de ejecución específicas, el sistema implementa una lógica de adherencia temporal.11

| Estado | Condición de Entrada | Implicación Técnica |
| :---- | :---- | :---- |
| **Pendiente** | Fecha actual $\\leq$ Fecha programada. | El objeto de sesión está creado pero no tiene datos de rendimiento. |
| **En Ejecución** | Evento start\_workout\_session disparado por el usuario. | Se bloquea el inicio de otras sesiones concurrentes.|
| **Retardo (Delay)** | Fecha actual $\>$ Fecha programada, pero no ha iniciado el siguiente ciclo de rutina. | Se permite la ejecución sin pérdida de datos históricos, marcando la sesión como "fuera de ventana".|
| **Completada** | Evento finish\_workout\_session con validación de datos. | Se disparan los cálculos de volumen total y 1RM.|
| **Fallida** | El tiempo actual excede el inicio de la siguiente sesión del mismo tipo sin haberse ejecutado. | La sesión se mueve a un historial de "no cumplido", afectando las métricas de frecuencia de entrenamiento.|

#### **Rutinas Secuenciales**

En este modo, las sesiones no están atadas a una fecha del calendario. El usuario progresa a través de una lista de entrenamientos (ej. A-B-C). El estado permanece en "Pendiente" indefinidamente hasta que el usuario decide ejecutarlo. No existe el estado de "Fallida" por tiempo, eliminando la fricción psicológica de la penalización por retraso.

### **Algoritmo de Comparación Global (Ghost Sets)**

La característica central de sobrecarga progresiva en Setvance es la capacidad de comparar el rendimiento actual contra el mejor registro histórico relevante. El sistema debe implementar un algoritmo de búsqueda global para cada ejercicio $E$ en una sesión $S$.5  
**Lógica de Selección del Ghost Set:**

1. **Consulta Primaria:** El sistema busca en la tabla SetInstance todos los registros donde exercise\_id \== E y user\_id \== actual.  
2. **Filtro de Recencia:** Se ordenan los resultados por timestamp DESC.  
3. **Priorización de Contexto:** El algoritmo prefiere el registro de la sesión anterior inmediata. Si no existe un registro en la sesión inmediata, se extiende la búsqueda a cualquier sesión histórica donde aparezca el ejercicio $E$.
4. **Mapeo de Series:** Las series se comparan uno a uno por su índice (set\_index). Si la sesión actual tiene más series que la histórica, las series excedentes muestran como objetivo el promedio de la sesión anterior o el registro más pesado alcanzado históricamente.

**Normalización mediante 1RM:** Para permitir comparaciones válidas entre series con diferentes cargas y repeticiones, el sistema utiliza el Máximo Estimado de una Repetición (e1RM). La fórmula de Brzycki se implementa para series de hasta 10 repeticiones, mientras que la de Epley se utiliza para rangos mayores, debido a su mayor precisión en intensidades bajas.

$$e1RM \= \\begin{cases} \\frac{W}{1.0278 \- (0.0278 \\times R)} & \\text{si } R \\leq 10 \\\\ W \\times (1 \+ \\frac{R}{30}) & \\text{si } R \> 10 \\end{cases}$$

### **Reglas de Mutación de Sesión Intra-Entrenamiento**

Setvance debe permitir que el atleta se desvíe del plan original sin comprometer la integridad de la base de datos.9 Las mutaciones válidas incluyen:

* **Sustitución en Caliente:** Si un equipo está ocupado, el usuario puede cambiar el ejercicio $X$ por el ejercicio $Y$. El sistema debe actualizar el exercise\_id de la instancia de sesión, pero mantener la referencia al objetivo original si el grupo muscular es coincidente.
* **Inyección de Series:** Se permite añadir series adicionales (ej. series de bombeo o *drop sets*) que no estaban en la plantilla original. Estas se registran con un flag is\_unplanned \= true para que el modelo de IA pueda diferenciar el volumen prescrito del volumen real.
* **Salto de Ejercicio:** Un usuario puede marcar un ejercicio como "no realizado". En este caso, la sesión puede completarse, pero el estado del ejercicio se guarda como "saltado" para análisis de adherencia.

## **Flujos de Proceso: Constructor vs. Ejecutor**

La arquitectura funcional de Setvance se divide en dos módulos lógicamente desacoplados. Este diseño permite que la interfaz de usuario y la lógica de negocio se adapten a dos estados mentales distintos del atleta: el de planificación y el de ejecución bajo fatiga.20

### **Proceso del Constructor (Módulo de Diseño de Entrenamiento)**

El flujo del Constructor es un entorno de edición enriquecido donde se definen las intenciones de largo plazo.

1. **Selección de Ejercicios:** El sistema presenta una biblioteca indexada por grupo muscular, equipamiento y patrón de movimiento. El usuario puede crear ejercicios personalizados, los cuales se almacenan localmente con un flag de visibilidad privada.
2. **Definición de Parámetros Meta:** Para cada ejercicio, se establecen los rangos de repeticiones objetivo y los periodos de descanso. El sistema valida que estos parámetros sean consistentes con el nivel del usuario (ej. alertar si se programan volúmenes excesivos para un principiante).
3. **Orquestación del Calendario:** Si el usuario opta por una rutina calendarizada, el Constructor genera el cronograma de sesiones. El sistema debe evitar solapamientos de sesiones y calcular los periodos de recuperación recomendados entre sesiones que trabajen el mismo grupo muscular.
4. **Persistencia del Blueprint:** Una vez finalizado el diseño, la rutina se guarda en el almacén persistente como una Plantilla de Rutina. Este objeto es de solo lectura durante la fase de ejecución.

### **Proceso del Ejecutor (Módulo de Seguimiento en Tiempo Real)**

El Ejecutor es el componente crítico que debe funcionar con máxima fluidez y resiliencia ante fallos.

1. **Inicialización de Instancia:** Al presionar "Empezar Entrenamiento", el Ejecutor solicita al motor de persistencia la creación de un nuevo UUID\_Session. Se realiza una copia de los datos de la plantilla seleccionada hacia la sesión activa.
2. **Hidratación de Datos Históricos:** Para cada ejercicio en la sesión, el Ejecutor lanza hilos paralelos de consulta para recuperar los "Ghost Sets" utilizando el algoritmo de comparación global. Estos valores se muestran como placeholders en la interfaz.
3. **Bucle de Entrenamiento (Active Tracking):**  
   * El usuario introduce $W$ y $R$.  
   * El sistema valida la entrada en tiempo real (ej. evitar pesos astronómicos que sugieran error de dedo).  
   * Al completar la serie, se activa el temporizador de descanso basado en la meta de la plantilla.
   * Los datos se escriben inmediatamente en la base de datos local (Commit) para prevenir pérdida por cierre inesperado de la app.2  
4. **Manejo de Mutaciones:** Si el usuario modifica la sesión (cambia un ejercicio o añade una serie), el Ejecutor actualiza el grafo de la sesión local. El sistema debe registrar la razón de la mutación (ej. "Falta de equipo") para mejorar las recomendaciones futuras de la IA.
5. **Finalización y Post-Procesamiento:** Al cerrar la sesión, el Ejecutor calcula métricas de impacto: volumen total acumulado, intensidad relativa promedio y registros personales (PRs) alcanzados. La sesión se marca como lista para sincronización.

## **Estrategia de Persistencia de Datos**

La persistencia en Setvance no es un componente secundario, sino el corazón de la filosofía *offline-first*. La arquitectura debe garantizar que el 100% de la funcionalidad de registro sea operativa sin internet, tratando la sincronización con la nube como un proceso asíncrono y de fondo.

### **Almacenamiento Local como Única Fuente de Verdad**

Se recomienda el uso de **SQLite** a través de la capa de abstracción **Room** (para Android) o **Core Data** (para iOS). Estas tecnologías proporcionan la robustez necesaria para manejar transacciones ACID y consultas complejas de series históricas.
**Especificaciones del Almacenamiento:**

* **Transaccionalidad:** Cada serie registrada debe ser una transacción atómica. Esto asegura que si el dispositivo se apaga durante el entrenamiento, los datos registrados hasta el segundo anterior estén a salvo.
* **Observabilidad de Datos:** La base de datos debe exponer flujos de datos reactivos (ej. Kotlin Flow o Combine). Esto permite que la interfaz de usuario se actualice automáticamente cuando cambian los datos históricos o el estado de la sincronización sin necesidad de recargas manuales.
* **Migración Offline:** El esquema de la base de datos debe ser capaz de evolucionar (actualizaciones de versión) incluso si el dispositivo no se ha conectado a internet en meses. El sistema debe gestionar scripts de migración locales robustos.

### **Sincronización y Resolución de Conflictos**

La sincronización se realiza mediante un modelo de "Consistencia Eventual". El sistema no espera al servidor para confirmar ninguna operación de escritura del usuario.

1. **Queue de Operaciones:** Todas las mutaciones (creación de rutinas, registro de series) se guardan en una cola de sincronización persistente en el disco.  
2. **Background Worker:** Se utiliza un gestor de tareas del sistema operativo (ej. WorkManager en Android o BackgroundTasks en iOS) para procesar la cola. El worker debe respetar restricciones de energía y conectividad: esperar a tener Wi-Fi o carga de batería suficiente si la cola es extensa.
3. **Estrategia de Conflictos \- Last Write Wins (LWW):** Dado que Setvance es una aplicación de uso personal, los conflictos de edición simultánea son raros. Se adoptará la estrategia de "El último registro gana" basada en timestamps UTC sincronizados con servidores de tiempo de red cuando sea posible.
4. **Identificadores Universales (UUID):** Todas las claves primarias deben ser UUIDs generados en el cliente. Esto permite crear ejercicios, rutinas y sesiones de forma totalmente offline sin riesgo de colisión de IDs cuando los datos lleguen finalmente al servidor central.

### **Estructura Atómica para Análisis de IA**

Para que el sistema sea apto para futuros modelos de inteligencia artificial (*AI-Readiness*), los datos deben almacenarse con un nivel de granularidad quirúrgico.

| Principio de IA | Requerimiento Técnico | Aplicación en Setvance |
| :---- | :---- | :---- |
| **Atomicidad** | Los datos deben estar en su forma más básica, sin promedios pre-calculados. | Se guarda cada serie individualmente con su peso, reps y RPE exactos. |
| **Normalización Temporal** | Todos los registros deben tener timestamps en formato ISO 8601 UTC. | Evita discrepancias al viajar entre zonas horarias o cambiar la hora del dispositivo. |
| **Integridad Referencial** | Cada serie debe estar vinculada a un ExerciseID global estandarizado. | Permite comparar el volumen de "Pecho" aunque el usuario use diferentes nombres locales. |
| **Captura de Metadatos** | Almacenar variables ambientales que afectan el rendimiento. | Registrar hora del día, duración total del entrenamiento y tiempo de descanso real entre series. |

### **Optimizaciones de Rendimiento Local**

Para mantener la fluidez de la app a medida que el historial del usuario crece (pudiendo alcanzar miles de series tras años de uso), se deben implementar las siguientes estrategias:

* **Indexación Estratégica:** Se deben crear índices compuestos en la tabla SetInstance sobre las columnas (exercise\_id, session\_id, timestamp). Esto permite que la recuperación de los Ghost Sets sea una operación de tiempo constante o logarítmico, evitando escaneos completos de la tabla que calentarían el procesador y drenarían la batería.
* **Pruning de Caché:** El sistema debe implementar una política de limpieza de datos antiguos en el dispositivo. Datos de sesiones con más de dos años de antigüedad pueden ser eliminados de la persistencia local para liberar espacio, siempre que existan con seguridad en el respaldo de la nube. Sin embargo, los registros de "Mejor Marca Personal" (PR) deben permanecer siempre en el dispositivo para alimentar el algoritmo de comparación global.

## **Conclusiones de la Arquitectura**

Setvance no es solo una herramienta de registro; es un sistema de gestión del rendimiento físico diseñado para la máxima confiabilidad en el "borde" (*edge*). Al adoptar un enfoque de base de datos local robusto, una máquina de estados flexible para las sesiones y un almacenamiento atómico orientado a la inteligencia artificial, Setvance se posiciona como una plataforma técnica de vanguardia.2  
La separación entre el Constructor y el Ejecutor permite una experiencia de usuario sin fricciones, mientras que el algoritmo de Ghost Sets proporciona la inteligencia necesaria para transformar cada sesión en un paso hacia la mejora continua. La implementación técnica de estas especificaciones garantizará un producto que respeta la privacidad del usuario, optimiza los recursos del hardware móvil y escala con el progreso del atleta a lo largo de los años.

#### **Obras citadas**

1. Offline-first frontend apps in 2025: IndexedDB and SQLite in the, fecha de acceso: marzo 5, 2026, [https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/](https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/)  
2. Offline-First Architecture: Designing for Reality, Not Just the Cloud, fecha de acceso: marzo 5, 2026, [https://medium.com/@jusuftopic/offline-first-architecture-designing-for-reality-not-just-the-cloud-e5fd18e50a79](https://medium.com/@jusuftopic/offline-first-architecture-designing-for-reality-not-just-the-cloud-e5fd18e50a79)  
3. How Offline Mode Improves Fitness App Reliability, fecha de acceso: marzo 5, 2026, [https://fitnessappsolutions.com/blog/fitness-app-offline/](https://fitnessappsolutions.com/blog/fitness-app-offline/)  
4. The Complete Guide to Offline-First Architecture in Android, fecha de acceso: marzo 5, 2026, [https://proandroiddev.com/the-complete-guide-to-offline-first-architecture-in-android-490d5e9d27ea](https://proandroiddev.com/the-complete-guide-to-offline-first-architecture-in-android-490d5e9d27ea)  
5. Progressive Overload Workout: The Complete Guide to ... \- Setgraph, fecha de acceso: marzo 5, 2026, [https://setgraph.app/ai-blog/progressive-overload-workout-guide](https://setgraph.app/ai-blog/progressive-overload-workout-guide)  
6. Progressive overload: the ultimate guide \- GymAware, fecha de acceso: marzo 5, 2026, [https://gymaware.com/progressive-overload-the-ultimate-guide/](https://gymaware.com/progressive-overload-the-ultimate-guide/)  
7. Previous Workout Values to Monitor Your Training \- Hevy App, fecha de acceso: marzo 5, 2026, [https://www.hevyapp.com/features/track-exercises/](https://www.hevyapp.com/features/track-exercises/)  
8. The Best Workout Tracker App for Strength Training and ... \- Setgraph, fecha de acceso: marzo 5, 2026, [https://setgraph.app/es/articles/setgraph-the-best-workout-tracker-app-for-strength-training-and-progressive-overload](https://setgraph.app/es/articles/setgraph-the-best-workout-tracker-app-for-strength-training-and-progressive-overload)  
9. Pure Training: a workout tracking application for personal trainers, fecha de acceso: marzo 5, 2026, [https://github.com/hneels/pure-training](https://github.com/hneels/pure-training)  
10. Users creating instances from a template \- is there a software pattern, fecha de acceso: marzo 5, 2026, [https://softwareengineering.stackexchange.com/questions/137273/users-creating-instances-from-a-template-is-there-a-software-pattern-that-corr](https://softwareengineering.stackexchange.com/questions/137273/users-creating-instances-from-a-template-is-there-a-software-pattern-that-corr)  
11. Workout Schedule Template Excel: Free Downloads \+ ... \- Setgraph, fecha de acceso: marzo 5, 2026, [https://setgraph.app/ai-blog/workout-schedule-template-excel-free-downloads-guide](https://setgraph.app/ai-blog/workout-schedule-template-excel-free-downloads-guide)  
12. AI in Fitness: Why Smart Data is the Key to Real Results \- STRV, fecha de acceso: marzo 5, 2026, [https://www.strv.com/blog/ai-in-fitness-why-smart-data-is-the-key-to-real-results](https://www.strv.com/blog/ai-in-fitness-why-smart-data-is-the-key-to-real-results)  
13. Practical Lab AI Readiness Starts with Data Management, fecha de acceso: marzo 5, 2026, [https://www.labmanager.com/practical-lab-ai-readiness-starts-with-data-management-33827](https://www.labmanager.com/practical-lab-ai-readiness-starts-with-data-management-33827)  
14. Database Design for Health and Fitness Tracking Applications, fecha de acceso: marzo 5, 2026, [https://www.geeksforgeeks.org/dbms/how-to-design-a-database-for-health-and-fitness-tracking-applications/](https://www.geeksforgeeks.org/dbms/how-to-design-a-database-for-health-and-fitness-tracking-applications/)  
15. How to Build a Database Schema for a Fitness Tracking Application?, fecha de acceso: marzo 5, 2026, [https://www.back4app.com/tutorials/how-to-build-a-database-schema-for-a-fitness-tracking-application](https://www.back4app.com/tutorials/how-to-build-a-database-schema-for-a-fitness-tracking-application)  
16. Data Readiness for AI: A 360-Degree Survey \- arXiv, fecha de acceso: marzo 5, 2026, [https://arxiv.org/html/2404.05779v1](https://arxiv.org/html/2404.05779v1)  
17. Specific Database Structuring For Fitness Tracking \- Stack Overflow, fecha de acceso: marzo 5, 2026, [https://stackoverflow.com/questions/23024126/specific-database-structuring-for-fitness-tracking](https://stackoverflow.com/questions/23024126/specific-database-structuring-for-fitness-tracking)  
18. Workout Database Model Help, fecha de acceso: marzo 5, 2026, [https://www.reddit.com/r/Database/comments/11uyi7l/workout\_database\_model\_help/](https://www.reddit.com/r/Database/comments/11uyi7l/workout_database_model_help/)  
19. Database design for workout tracking app. How do I model relation, fecha de acceso: marzo 5, 2026, [https://stackoverflow.com/questions/65974181/database-design-for-workout-tracking-app-how-do-i-model-relation-for-exercise-s](https://stackoverflow.com/questions/65974181/database-design-for-workout-tracking-app-how-do-i-model-relation-for-exercise-s)  
20. Building a Modern Workout Tracker: A Full-Stack Journey \- Medium, fecha de acceso: marzo 5, 2026, [https://medium.com/@dddamon06/building-a-modern-workout-tracker-a-full-stack-journey-d9f404cd7b02](https://medium.com/@dddamon06/building-a-modern-workout-tracker-a-full-stack-journey-d9f404cd7b02)  
21. What is the best way to store high frequency, periodic time-series, fecha de acceso: marzo 5, 2026, [https://www.quora.com/What-is-the-best-way-to-store-high-frequency-periodic-time-series-data](https://www.quora.com/What-is-the-best-way-to-store-high-frequency-periodic-time-series-data)  
22. Progressive Overload Findings 2022-2023 \- Kaggle, fecha de acceso: marzo 5, 2026, [https://www.kaggle.com/code/michaelnowell/progressive-overload-findings-2022-2023](https://www.kaggle.com/code/michaelnowell/progressive-overload-findings-2022-2023)  
23. Progressive Overload: The Route To Results In Strength Training, fecha de acceso: marzo 5, 2026, [https://row.gymshark.com/blog/article/progressive-overload](https://row.gymshark.com/blog/article/progressive-overload)  
24. Progressive Overload: A Beginner's Guide to Tracking \- Hevy app, fecha de acceso: marzo 5, 2026, [https://www.hevyapp.com/progressive-overload/](https://www.hevyapp.com/progressive-overload/)  
25. New progressive overload algorithm : r/MacroFactor \- Reddit, fecha de acceso: marzo 5, 2026, [https://www.reddit.com/r/MacroFactor/comments/1quzx0q/new\_progressive\_overload\_algorithm/](https://www.reddit.com/r/MacroFactor/comments/1quzx0q/new_progressive_overload_algorithm/)  
26. Understanding State Machines: A Developer's Guide to Predictable, fecha de acceso: marzo 5, 2026, [https://medium.com/@melekcharradi/understanding-state-machines-a-developers-guide-to-predictable-application-logic-d3df50e3e621](https://medium.com/@melekcharradi/understanding-state-machines-a-developers-guide-to-predictable-application-logic-d3df50e3e621)  
27. 11 Free State Machine Diagram Examples with Analysis, fecha de acceso: marzo 5, 2026, [https://edrawmax.wondershare.com/examples/state-component-diagram-examples.html](https://edrawmax.wondershare.com/examples/state-component-diagram-examples.html)  
28. State Machine v/s Flow Chart. \- MATLAB Answers \- MathWorks, fecha de acceso: marzo 5, 2026, [https://www.mathworks.com/matlabcentral/answers/467821-state-machine-v-s-flow-chart](https://www.mathworks.com/matlabcentral/answers/467821-state-machine-v-s-flow-chart)  
29. What the… State Machine \- ITNEXT, fecha de acceso: marzo 5, 2026, [https://itnext.io/what-the-state-machine-96189764567e](https://itnext.io/what-the-state-machine-96189764567e)  
30. startWorkoutSession: | Apple Developer Documentation, fecha de acceso: marzo 5, 2026, [https://developer.apple.com/documentation/healthkit/hkhealthstore/start(\_:)?changes=\_8\&language=objc](https://developer.apple.com/documentation/healthkit/hkhealthstore/start\(_:\)?changes=_8&language=objc)  
31. Delayed (after) transitions \- Stately.ai, fecha de acceso: marzo 5, 2026, [https://stately.ai/docs/delayed-transitions](https://stately.ai/docs/delayed-transitions)  
32. State machine transitions at specific times \- Stack Overflow, fecha de acceso: marzo 5, 2026, [https://stackoverflow.com/questions/7878123/state-machine-transitions-at-specific-times](https://stackoverflow.com/questions/7878123/state-machine-transitions-at-specific-times)  
33. ICSS The Comprehensive Guide to 1RM Calculators, fecha de acceso: marzo 5, 2026, [https://theicss.org/2023/09/04/the-comprehensive-guide-to-1rm-calculators/](https://theicss.org/2023/09/04/the-comprehensive-guide-to-1rm-calculators/)  
34. Retrieve From Training Log – How to Get Your Previous Weights, fecha de acceso: marzo 5, 2026, [https://help.strengthlog.com/help-article/retrieve-from-training-log/](https://help.strengthlog.com/help-article/retrieve-from-training-log/)  
35. Scheduler State Machine \- Dask.distributed, fecha de acceso: marzo 5, 2026, [https://distributed.dask.org/en/latest/scheduling-state.html](https://distributed.dask.org/en/latest/scheduling-state.html)  
36. AWS State Machine: Workflows for Scalable Cloud Automation, fecha de acceso: marzo 5, 2026, [https://www.acte.in/aws-state-machine](https://www.acte.in/aws-state-machine)  
37. workoutSession(\_:didFailWithError:) | Apple Developer Documentation, fecha de acceso: marzo 5, 2026, [https://developer.apple.com/documentation/healthkit/hkworkoutsessiondelegate/workoutsession(\_:didfailwitherror:)](https://developer.apple.com/documentation/healthkit/hkworkoutsessiondelegate/workoutsession\(_:didfailwitherror:\))  
38. Workflow Engine vs. State Machine, fecha de acceso: marzo 5, 2026, [https://workflowengine.io/blog/workflow-engine-vs-state-machine/](https://workflowengine.io/blog/workflow-engine-vs-state-machine/)  
39. Why Developers Never Use State Machines \- Workflow Engine, fecha de acceso: marzo 5, 2026, [https://workflowengine.io/blog/why-developers-never-use-state-machines/](https://workflowengine.io/blog/why-developers-never-use-state-machines/)  
40. How to Use Previous Workout Values to Improve Performance in Hevy, fecha de acceso: marzo 5, 2026, [https://help.hevyapp.com/hc/en-us/articles/36011896355479-How-to-Use-Previous-Workout-Values-to-Improve-Performance-in-Hevy](https://help.hevyapp.com/hc/en-us/articles/36011896355479-How-to-Use-Previous-Workout-Values-to-Improve-Performance-in-Hevy)  
41. Progressive Overload as You Train \- Legend \- Workout Tracker, fecha de acceso: marzo 5, 2026, [https://legend-tracker.com/feature/progressive-overload-as-you-train/](https://legend-tracker.com/feature/progressive-overload-as-you-train/)  
42. 1 Rep Max Calculator \- Calculate Your One Rep Maximum Strength, fecha de acceso: marzo 5, 2026, [https://www.topendsports.com/testing/calculators/1repmax.htm](https://www.topendsports.com/testing/calculators/1repmax.htm)  
43. 1RM Formulas Compared: Epley vs Brzycki vs Lander \- arvo.guru, fecha de acceso: marzo 5, 2026, [https://arvo.guru/resources/one-rep-max-formulas](https://arvo.guru/resources/one-rep-max-formulas)  
44. Data Model design pattern for instances of a standard item?, fecha de acceso: marzo 5, 2026, [https://www.answeroverflow.com/m/1188140841961783397](https://www.answeroverflow.com/m/1188140841961783397)  
45. A Better Workout Tracker Template for Real Muscle Growth, fecha de acceso: marzo 5, 2026, [https://strive-workout.com/2026/02/18/workout-tracker-template/](https://strive-workout.com/2026/02/18/workout-tracker-template/)  
46. Fitness App Development for Women: Key Features & UX Tips, fecha de acceso: marzo 5, 2026, [https://appinventiv.com/blog/women-fitness-aap-development/](https://appinventiv.com/blog/women-fitness-aap-development/)  
47. How to Build a Fitness App \- Complete GuideBlog Template, fecha de acceso: marzo 5, 2026, [https://instituteofpersonaltrainers.com/blog/how-to-build-fitness-app](https://instituteofpersonaltrainers.com/blog/how-to-build-fitness-app)  
48. The Action \- Executor Pattern | PDF | Database Transaction \- Scribd, fecha de acceso: marzo 5, 2026, [https://www.scribd.com/document/95584778/The-Action-Executor-Pattern](https://www.scribd.com/document/95584778/The-Action-Executor-Pattern)  
49. Experiment 2 Software Design Report for FitnessTracker | PDF \- Scribd, fecha de acceso: marzo 5, 2026, [https://www.scribd.com/document/967591400/Experiment-2-Software-Design-Report-for-FitnessTracker](https://www.scribd.com/document/967591400/Experiment-2-Software-Design-Report-for-FitnessTracker)  
50. Progressive Overload Tracker – Apps on Google Play, fecha de acceso: marzo 5, 2026, [https://play.google.com/store/apps/details?id=com.expofedir.POT\&hl=en\_IE](https://play.google.com/store/apps/details?id=com.expofedir.POT&hl=en_IE)  
51. The Science of Progressive Overload: Unlocking Your True Potential, fecha de acceso: marzo 5, 2026, [https://peakfitnessslo.com/the-science-of-progressive-overload-unlocking-your-true-potential/](https://peakfitnessslo.com/the-science-of-progressive-overload-unlocking-your-true-potential/)  
52. Build an offline-first app | App architecture \- Android Developers, fecha de acceso: marzo 5, 2026, [https://developer.android.com/topic/architecture/data-layer/offline-first](https://developer.android.com/topic/architecture/data-layer/offline-first)  
53. SQLite vs Realm for offline-first storage in field apps \- AppMaster, fecha de acceso: marzo 5, 2026, [https://appmaster.io/blog/sqlite-vs-realm-offline-field-apps](https://appmaster.io/blog/sqlite-vs-realm-offline-field-apps)  
54. VHDL state machine with several delays \- best approach?, fecha de acceso: marzo 5, 2026, [https://stackoverflow.com/questions/31138152/vhdl-state-machine-with-several-delays-best-approach](https://stackoverflow.com/questions/31138152/vhdl-state-machine-with-several-delays-best-approach)  
55. Building Offline Apps: A Fullstack Approach to Mobile Resilience, fecha de acceso: marzo 5, 2026, [https://think-it.io/insights/offline-apps](https://think-it.io/insights/offline-apps)  
56. Offline-First Android Architecture: A Practical Guide \- DhiWise, fecha de acceso: marzo 5, 2026, [https://www.dhiwise.com/post/offline-first-android-architecture-a-practical-guide](https://www.dhiwise.com/post/offline-first-android-architecture-a-practical-guide)  
57. What database is best for offline Android use? \- Tencent Cloud, fecha de acceso: marzo 5, 2026, [https://www.tencentcloud.com/techpedia/135534](https://www.tencentcloud.com/techpedia/135534)  
58. Building Offline-First Mobile Apps with Local Storage \- Dev.to, fecha de acceso: marzo 5, 2026, [https://dev.to/lacey\_glenn\_e95da24922778/building-offline-first-mobile-apps-with-local-storage-3m8n](https://dev.to/lacey_glenn_e95da24922778/building-offline-first-mobile-apps-with-local-storage-3m8n)  
59. Offline-First Apps Made Simple: Supabase \+ PowerSync, fecha de acceso: marzo 5, 2026, [https://www.powersync.com/blog/offline-first-apps-made-simple-supabase-powersync](https://www.powersync.com/blog/offline-first-apps-made-simple-supabase-powersync)  
60. Creating Flutter Apps With Offline-First Architecture \- Vibe Studio, fecha de acceso: marzo 5, 2026, [https://vibe-studio.ai/insights/creating-flutter-apps-with-offline-first-architecture](https://vibe-studio.ai/insights/creating-flutter-apps-with-offline-first-architecture)  
61. (PDF) Data Readiness for AI: A 360-Degree Survey \- ResearchGate, fecha de acceso: marzo 5, 2026, [https://www.researchgate.net/publication/389663308\_Data\_Readiness\_for\_AI\_A\_360-Degree\_Survey](https://www.researchgate.net/publication/389663308_Data_Readiness_for_AI_A_360-Degree_Survey)  
62. Data Retrieval Best Practices: Solving Missing Fitness Tracker Data, fecha de acceso: marzo 5, 2026, [https://www.thryve.health/blog/data-retrieval-fitness-tracker](https://www.thryve.health/blog/data-retrieval-fitness-tracker)  
63. Machine Learning for Human Activity Recognition: State-of-the-Art, fecha de acceso: marzo 5, 2026, [https://www.mdpi.com/2313-433X/11/3/91](https://www.mdpi.com/2313-433X/11/3/91)  
64. Data Analytics in Fitness: How Technology is Revolutionizing Health, fecha de acceso: marzo 5, 2026, [https://medium.com/the-thinkers-point/data-analytics-in-fitness-how-technology-is-revolutionizing-health-goals-02ac2e3d41ad](https://medium.com/the-thinkers-point/data-analytics-in-fitness-how-technology-is-revolutionizing-health-goals-02ac2e3d41ad)  
65. Database Schema for a Gym Exercise Log App \- Stack Overflow, fecha de acceso: marzo 5, 2026, [https://stackoverflow.com/questions/54220956/database-schema-for-a-gym-exercise-log-app](https://stackoverflow.com/questions/54220956/database-schema-for-a-gym-exercise-log-app)  
66. SQL Server Performance Tuning: 20 Indexing Strategy Tips, fecha de acceso: marzo 5, 2026, [https://www.fortifieddata.com/sql-server-performance-tuning-indexing-strategy/](https://www.fortifieddata.com/sql-server-performance-tuning-indexing-strategy/)  
67. SQL index best practices for performance \- CockroachDB, fecha de acceso: marzo 5, 2026, [https://www.cockroachlabs.com/blog/sql-performance-best-practices/](https://www.cockroachlabs.com/blog/sql-performance-best-practices/)  
68. How Do I Protect User Data in My Fitness App?, fecha de acceso: marzo 5, 2026, [https://thisisglance.com/learning-centre/how-do-i-protect-user-data-in-my-fitness-app](https://thisisglance.com/learning-centre/how-do-i-protect-user-data-in-my-fitness-app)
