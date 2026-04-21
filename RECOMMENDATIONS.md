# Propuesta de Evolución: OpenShell 🚀

Este documento detalla recomendaciones para expandir las capacidades de OpenShell, transformándolo de una CLI básica a un entorno de automatización inteligente y seguro.

---

## 1. Comandos Sugeridos (Nuevas Funcionalidades)

| Comando | Propósito | Impacto |
|---------|-----------|---------|
| `openshell doctor` | Diagnostica la configuración, claves API y conectividad con proveedores (Ollama, OpenAI). | UX / Soporte |
| `openshell tutor` | Modo interactivo donde la IA explica qué hace cada comando mientras lo usas. | Onboarding |
| `openshell workflow` | Encadena múltiples MCPs y Skills en una secuencia lógica con estados. | Potencia |
| `openshell export <skill>` | Empaqueta una skill y sus dependencias para compartirla. | Ecosistema |
| `openshell watch <path>` | La IA monitorea una carpeta y ejecuta acciones según cambios en archivos. | Automatización |

---

## 2. Gestión de Archivos por IA (Estrategia de Seguridad)

Para que la IA manipule archivos sin riesgos catastróficos, se proponen estos tres niveles:

### A. Creación (Sandbox)
- La IA propone el contenido.
- El archivo se crea primero en `.tmp/` o una carpeta de previsualización.
- El usuario confirma la ubicación final.

### B. Edición (Algoritmo de Diff/Patch)
- **NO sobrescribir el archivo completo.** 
- La IA genera un `diff` (formato Unified Diff).
- OpenShell muestra el "Antes" y "Después" con colores (Rojo/Verde) en la terminal.
- El usuario acepta líneas específicas o el cambio total.

### C. Eliminación (Papelera Inteligente)
- `openshell run skill delete` nunca debe ejecutar `rm -rf`.
- Debe mover el archivo a `OpenShell/trash/` con un log de metadatos para permitir `openshell restore`.

---

## 3. Terminal y Visual (Aesthetics)

- **Sintaxis Highlighting:** Usar `chalk` y `clui` para colorear el código generado por la IA dentro de la terminal.
- **Spinners y Progreso:** Implementar barras de carga para llamadas a APIs lentas.
- **Modo Dashboard:** Un comando `openshell dash` que limpie la pantalla y muestre el estado de los agentes y automatizaciones activas en tiempo real.
- **Rich Output:** Tablas bien formateadas para listar skills y configuraciones.

---

## 4. Seguridad de Grado Sistema

- **Permisos por Skill:** Cada `SKILL.md` podría incluir un campo `permissions: [fs_read, network_access, shell_exec]`. Si la IA intenta algo fuera de ese scope, el CLI bloquea la acción.
- **Audit Logs:** Cada acción de la IA (aunque sea fallida o denegada) se guarda en `logs/audit.json` con un hash de integridad.
- **Rate Limiting:** Evitar que una automatización en bucle consuma todos los créditos de una API externa o sature la CPU local.

---

## 5. Integración con el Sistema

- **Detección de OS:** Si el usuario está en Linux, usar `systemd` para las automatizaciones. Si está en macOS, usar `launchd`.
- **Contexto de Hardware:** La IA debería tener acceso (lectura) a métricas básicas (RAM, CPU, Disco) para poder tomar decisiones de optimización.
- **CLI Piping:** Permitir que OpenShell reciba datos de otros comandos: `ls | openshell run skill resumir`.

---

## 6. Visión: "IA-Driven Refactoring"

Imagina que OpenShell pueda:
1. Leer un error de compilación de tu terminal.
2. Buscar la solución en la documentación local (MCP).
3. Proponer el parche exacto.
4. Aplicarlo solo tras tu `Enter`.

**"La IA no debe ser el conductor, debe ser el copiloto con el mapa y el kit de herramientas, pero el usuario siempre tiene el pie en el freno."**
