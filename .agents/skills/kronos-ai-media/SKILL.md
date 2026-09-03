# KRONOS AI MEDIA

## Identidad

**Nombre:** `kronos-ai-media`
**Proyecto:** Kronos Social AI
**Ruta:** `.agents/skills/kronos-ai-media/SKILL.md`
**Tipo:** AI Image & Video Generation Skill
**Estado:** Producción

---

# 1. PROPÓSITO

Esta skill controla la arquitectura, integración y operación de las funciones de inteligencia artificial destinadas a:

* generación de imágenes;
* generación de videos;
* procesamiento multimedia mediante IA;
* envío de prompts;
* configuración de generación;
* recepción de resultados;
* almacenamiento de resultados;
* historial de generaciones;
* estados de procesamiento;
* errores;
* integración frontend ↔ backend.

Las claves y proveedores de IA permanecen exclusivamente en backend.

---

# 2. ARQUITECTURA

El flujo principal debe ser:

```text
AI Media Screen
       ↓
AI Media Component
       ↓
Hook
       ↓
AI Media Service
       ↓
Backend API
       ↓
AI Provider
       ↓
Backend
       ↓
Storage / Database
       ↓
Frontend
```

El frontend nunca debe comunicarse directamente con proveedores privados de IA.

---

# 3. SEPARACIÓN DE RESPONSABILIDADES

Separar:

```text
Prompt
Configuration
Generation
Processing
Storage
History
Display
```

No colocar toda la lógica de generación dentro de un único componente.

Preferir:

```text
ai/
├── components/
├── hooks/
├── services/
├── types/
├── utils/
└── constants/
```

La estructura exacta debe adaptarse al repositorio existente.

---

# 4. SEGURIDAD DE CREDENCIALES

Nunca colocar en frontend:

```text
OPENAI_API_KEY
GOOGLE_API_KEY
GEMINI_API_KEY
provider secrets
storage private keys
database credentials
```

Nunca:

```javascript
const API_KEY = "secret";
```

La comunicación debe realizarse mediante el backend autorizado.

---

# 5. PROMPTS

Los prompts enviados por el usuario deben validarse antes de enviarse.

Validar:

```text
exists
type
minimum length
maximum length
allowed content
```

Ejemplo:

```javascript
export function validatePrompt(prompt) {
    if (typeof prompt !== "string") {
        throw new Error("Prompt must be a string");
    }

    const normalizedPrompt = prompt.trim();

    if (!normalizedPrompt) {
        throw new Error("Prompt cannot be empty");
    }

    if (normalizedPrompt.length > 5000) {
        throw new Error("Prompt is too long");
    }

    return normalizedPrompt;
}
```

Los límites definitivos deben coincidir con backend.

---

# 6. GENERACIÓN DE IMÁGENES

El flujo debe ser:

```text
Prompt
 ↓
Validate
 ↓
Generation Request
 ↓
Backend
 ↓
AI Provider
 ↓
Result
 ↓
Storage
 ↓
Database
 ↓
Frontend
```

El frontend debe mostrar claramente el estado:

```text
idle
generating
success
error
```

No mostrar una generación como completada hasta recibir confirmación real.

---

# 7. GENERACIÓN DE VIDEO

El video puede requerir procesamiento asíncrono.

Flujo:

```text
Create Generation
       ↓
Backend
       ↓
AI Provider
       ↓
Job Created
       ↓
Processing
       ↓
Completed
       ↓
Storage
       ↓
Frontend
```

Los estados deben representar correctamente el procesamiento:

```text
queued
processing
completed
failed
```

No bloquear innecesariamente la interfaz mientras el proveedor procesa el video.

---

# 8. JOBS ASÍNCRONOS

Cuando una generación sea asíncrona:

```javascript
async function createGeneration(payload) {
    try {
        setStatus("generating");

        const generation = await createAiGeneration(payload);

        setGeneration(generation);
    } catch (error) {
        setStatus("error");

        setError(
            error instanceof Error
                ? error.message
                : "Generation failed"
        );
    }
}
```

El estado real debe provenir del backend.

No simular procesamiento mediante `setTimeout()`.

---

# 9. ACTUALIZACIÓN DE ESTADO

El estado de una generación debe actualizarse mediante:

```text
API polling
o
Socket.IO
```

según lo que implemente el backend.

No inventar mecanismos paralelos.

Si existe Socket.IO:

```text
Generation Created
       ↓
Socket Event
       ↓
Status Update
       ↓
Frontend State
```

Los listeners deben eliminarse correctamente.

---

# 10. CONFIGURACIÓN DE GENERACIÓN

Las opciones disponibles deben proceder del backend o de constantes controladas.

Ejemplos conceptuales:

```text
model
aspectRatio
resolution
duration
style
quality
```

No enviar parámetros que el proveedor/backend no soporte.

La configuración definitiva debe coincidir con el contrato real de la API.

---

# 11. VALIDACIÓN DE PARÁMETROS

Antes de enviar una generación:

```javascript
function validateGenerationOptions(options) {
    if (!options || typeof options !== "object") {
        throw new Error("Invalid generation options");
    }

    return options;
}
```

Las validaciones específicas deben aplicarse según el contrato real.

Nunca confiar exclusivamente en la validación frontend.

---

# 12. CONTROL DE GENERACIONES

Evitar solicitudes duplicadas.

Ejemplo:

```javascript
if (generating) {
    return;
}
```

El botón de generación debe permanecer bloqueado mientras una operación no permita una nueva solicitud.

El backend también debe controlar duplicados y límites.

---

# 13. CUOTAS Y LÍMITES

Si el backend devuelve:

```text
quota exceeded
rate limit
generation limit
```

el frontend debe mostrar un mensaje comprensible.

No ocultar errores `429`.

Ejemplo conceptual:

```javascript
if (error.status === 429) {
    setError("Generation limit reached. Try again later.");
}
```

El límite real pertenece al backend.

---

# 14. RESULTADOS

Los resultados deben utilizar URLs o referencias devueltas por backend.

No construir URLs manualmente cuando el backend ya proporciona el recurso.

Ejemplo:

```javascript
const mediaUrl = generation?.result?.url;

if (!mediaUrl) {
    throw new Error("Generation result is unavailable");
}
```

---

# 15. PREVIEW

Antes de mostrar un resultado:

```text
validate result
 ↓
verify URL/reference
 ↓
render media
```

Para imágenes:

```html
<img
    src={imageUrl}
    alt="AI generated result"
/>
```

Para videos:

```html
<video
    controls
    preload="metadata"
>
    <source src={videoUrl} />
</video>
```

Los atributos definitivos deben adaptarse al proyecto.

---

# 16. ERRORES

Manejar como mínimo:

```text
400
401
403
404
409
422
429
500
502
503
Network Error
Timeout
Provider Error
```

No exponer información sensible del proveedor.

El backend debe normalizar los errores antes de enviarlos al frontend cuando sea necesario.

---

# 17. CANCELACIÓN

Cuando el backend y proveedor lo permitan, las operaciones largas deben poder cancelarse.

Flujo:

```text
Generating
   ↓
Cancel
   ↓
Backend
   ↓
Provider
   ↓
Cancelled
   ↓
Frontend
```

No simular una cancelación únicamente ocultando el componente.

---

# 18. HISTORIAL

Las generaciones completadas deben poder consultarse desde backend cuando el proyecto lo soporte.

Separar:

```text
Current Generation
Generation History
```

No almacenar indefinidamente todo el historial únicamente en memoria del navegador.

---

# 19. PAGINACIÓN DEL HISTORIAL

Cuando exista paginación:

```text
History Page 1
      ↓
Load More
      ↓
History Page 2
```

No sobrescribir resultados anteriores.

Evitar duplicados mediante identificadores únicos.

---

# 20. ALMACENAMIENTO

Los resultados generados deben utilizar el sistema de almacenamiento configurado para Kronos.

El frontend no debe conocer credenciales privadas de almacenamiento.

Flujo:

```text
AI Provider
     ↓
Backend
     ↓
Storage
     ↓
Stored URL / Reference
     ↓
Database
     ↓
Frontend
```

---

# 21. BASE DE DATOS

El frontend no accede directamente a MongoDB.

Siempre:

```text
Frontend
 ↓
Backend
 ↓
MongoDB
```

La información persistente debe ser controlada por backend.

---

# 22. REINTENTOS

Los reintentos deben utilizarse solamente cuando tenga sentido.

No repetir automáticamente operaciones que puedan generar costos o resultados duplicados.

Antes de reintentar:

```text
identify error
 ↓
determine retryable
 ↓
retry if safe
```

Los errores de validación no deben reintentarse automáticamente.

---

# 23. ESTADOS DE UI

Toda pantalla de IA debe contemplar:

```text
idle
loading
processing
success
empty
error
```

El estado debe ser visible para el usuario.

No dejar la interfaz aparentemente congelada durante una generación.

---

# 24. DISEÑO VISUAL

La sección AI Media utiliza:

```text
Deep Black
+
Bright Copper Chrome
```

Los elementos principales deben conservar la identidad:

```text
buttons
borders
inputs
cards
bars
icons
progress
results
```

El acabado debe ser:

**cobre cromado brillante, minimalista y tipo espejo.**

---

# 25. COMPONENTES

Preferir componentes especializados:

```text
PromptInput
GenerationControls
ImageGenerator
VideoGenerator
GenerationProgress
GenerationResult
GenerationHistory
MediaPreview
GenerationError
```

No crear componentes duplicados si ya existe una implementación equivalente.

---

# 26. RESPONSIVE

La interfaz debe funcionar en:

```text
mobile
tablet
desktop
```

Los controles de generación deben permanecer utilizables en pantallas pequeñas.

Los previews multimedia deben adaptarse al contenedor disponible.

---

# 27. ACCESIBILIDAD

Los controles deben tener:

* labels;
* estados de disabled;
* mensajes de error;
* feedback de procesamiento;
* texto alternativo;
* controles de video accesibles.

Los botones deben utilizar elementos semánticos.

---

# 28. RENDIMIENTO

Optimizar:

* previews;
* renders;
* consultas;
* historial;
* eventos Socket.IO;
* carga multimedia.

No descargar nuevamente un recurso que ya esté disponible en memoria cuando pueda evitarse de manera segura.

---

# 29. MEMORIA DEL NAVEGADOR

Los `ObjectURL` creados mediante:

```javascript
URL.createObjectURL(...)
```

deben liberarse cuando ya no sean necesarios:

```javascript
URL.revokeObjectURL(url);
```

Evitar acumulación de blobs.

---

# 30. ERRORES DE RED

Las operaciones deben distinguir entre:

```text
server error
network error
timeout
validation error
provider error
```

Los mensajes de UI deben ser apropiados para cada caso.

---

# 31. INTEGRACIÓN CON BACKEND

Antes de implementar un servicio de IA verificar:

```text
HTTP method
endpoint
authentication
request schema
response schema
status codes
error schema
```

No asumir contratos.

---

# 32. INTEGRACIÓN CON SOCKET.IO

Si el backend utiliza eventos para generaciones:

```text
generation.created
generation.processing
generation.completed
generation.failed
```

Los nombres reales deben coincidir exactamente con el backend.

No crear eventos inexistentes.

---

# 33. SEGURIDAD

Nunca ejecutar contenido recibido de un proveedor como código.

Nunca utilizar:

```javascript
eval(...)
```

para procesar resultados.

Sanitizar cualquier contenido que pueda terminar renderizándose como HTML.

---

# 34. COSTOS

Las operaciones que puedan consumir recursos externos deben tratarse como operaciones reales.

No ejecutar automáticamente múltiples generaciones por accidente.

El frontend debe evitar:

```text
double click
duplicate request
automatic retry loops
infinite polling
```

---

# 35. POLLING

Cuando no exista Socket.IO y el backend utilice polling:

```text
Create Job
 ↓
Poll Status
 ↓
Processing
 ↓
Poll Status
 ↓
Completed
```

Debe existir:

```text
maximum attempts
cleanup
timeout
stop on completed
stop on failed
```

Nunca crear polling infinito.

---

# 36. POLLING SEGURO

Ejemplo:

```javascript
async function waitForGeneration(getStatus, {
    interval = 3000,
    maxAttempts = 100,
} = {}) {
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const result = await getStatus();

        if (
            result.status === "completed" ||
            result.status === "failed"
        ) {
            return result;
        }

        await new Promise((resolve) => {
            setTimeout(resolve, interval);
        });
    }

    throw new Error("Generation polling timed out");
}
```

La implementación definitiva debe adaptarse al servicio real.

---

# 37. LIMPIEZA DE RECURSOS

Al desmontar una pantalla:

```text
cancel pending requests
remove socket listeners
stop polling
release object URLs
clear temporary state
```

cuando corresponda.

---

# 38. REFACTORIZACIÓN

Cuando exista código duplicado:

1. localizar servicios;
2. localizar hooks;
3. identificar comportamiento común;
4. extraer abstracción;
5. reemplazar duplicados;
6. comprobar imports;
7. ejecutar build.

No modificar contratos externos sin necesidad.

---

# 39. VALIDACIÓN FINAL

Una implementación AI Media terminada debe comprobar:

```text
✓ Prompt validation
✓ Image generation
✓ Video generation
✓ Generation states
✓ API integration
✓ Authentication
✓ Error handling
✓ Rate limits
✓ Results
✓ Storage references
✓ History
✓ Socket.IO / polling
✓ Duplicate prevention
✓ Responsive UI
✓ Security
✓ Production build
```

---

# 40. OBJETIVO FINAL

Kronos AI Media debe proporcionar una experiencia completa de generación multimedia:

```text
                  KRONOS AI MEDIA
                         │
             ┌───────────┴───────────┐
             │                       │
        IMAGE AI                 VIDEO AI
             │                       │
             └───────────┬───────────┘
                         ▼
                    AI SERVICE
                         │
                         ▼
                   KRONOS BACKEND
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
          AI Provider  Storage    MongoDB
              │
              ▼
           Result
              │
              ▼
          Kronos UI
```

La prioridad es:

**seguridad de claves → backend real → generación confiable → procesamiento asíncrono → almacenamiento → historial → experiencia de usuario → producción.**

