# Guía de Desarrollo – OpenShell

## 1. Visión General
**OpenShell** es una CLI de terminal que permite crear, gestionar y usar agentes de IA para automatizar tareas en tu máquina.  
- **IA**: Cualquier modelo local o remoto (API).  
- **Interacciones**: Sólo cuando el usuario autoriza explícitamente la acción.  
- **Persistencia**: Contexto y automatizaciones se guardan en carpetas estructuradas dentro del proyecto.

---

## 2. Estructura de Directorios

```
OpenShell/
├── SKILLS/          # Skills que la IA puede usar (archivo *.md)
├── Context/         # Contexto específico de cada modelo
│   ├── chatgpt/     
│   │   └── history.log
│   └── claude/     
│       └── history.log
├── MCP/             # Archivos de planificación de tareas (MCP)
├── automations/     # Automatizaciones de eventos/hora
└── logs/            # Logs del sistema
```

### 2.1 Carpeta `SKILLS`
- Crea un archivo `SKILL.md` por cada skill.
- Estructura recomendada del archivo:

```
## Skill: Nombre del Skill
### Descripción
Breve descripción de lo que hace la skill.

### Entrada
- `prompt`: cadena de texto solicitada al usuario.

### Salida
- `response`: texto generado por la IA.

### Ejemplo
```bash
$ openshell run skill Nombre-del-Skill
```
```

### 2.2 Carpeta `Context`
- Cada modelo tiene su propio subdirectorio.
- Se guardan los historiales de conversación (`history.log`) y cualquier metadata persistente.

### 2.3 Carpeta `MCP`
- Archivos de **M** (Modelo), **C** (Conexión) y **P** (Planificación) en JSON o YAML.
- Ejemplo simple:

```yaml
name: backup_daily
trigger: cron("0 2 * * *")  # 02:00 AM cada día
action:
  type: script
  path: scripts/backup.sh
```

### 2.4 Carpeta `automations`
- Organización de automatizaciones por categoría.
- Cada automatización es un script Bash, Python o JSON que describe evento y acción.

---

## 3. Comandos Principales

| Comando | Descripción | Ejemplo |
|---------|-------------|---------|
| `openshell install` | Instala dependencias y configura la estructura | `sudo bash install.sh` |
| `openshell list skills` | Muestra skills disponibles | `openshell list skills` |
| `openshell run skill <name>` | Ejecuta una skill específica | `openshell run skill listar_direcciones` |
| `openshell add automation` | Crea una nueva automatización | `openshell add automation` |
| `openshell list automations` | Lista las automatizaciones activas | `openshell list automations` |
| `openshell log <action>` | Muestra logs de una acción | `openshell log backup_daily` |

---

## 4. Principios de Seguridad

1. **Consentimiento**  
   * La IA solo ejecuta acciones que el usuario haya autorizado mediante confirmación `y/n`.  
   * Operaciones críticas (p.ej. borrar archivos) requieren super‑confirmação:

   ```bash
   $ openshell run skill deleteFile
   Esto borrará /etc/passwd. ¿Continuar? y
   ```

2. **Protección de Archivos Internos**  
   * La IA NO puede modificar/eliminar ninguno de los archivos de **OpenShell** (ej. `install.sh`, `config.yaml`).  

3. **Acceso a Carpetas**  
   * La IA sólo puede leer/escribir en carpetas a las que el usuario le concedió permisos (p.ej. `SKILLS`, `Context`, `MCP`).  

4. **Túnel de Seguridad**  
   * Si un agente está configurado para usar un modelo externo y se pierde la conexión, el CLI mostrará un error y no intentará la acción.  

5. **Múltiples Modelos**  
   * Puedes tener diversos modelos activos (`chatgpt`, `claude`, `openai`).  
   * La CLI cambiará el contexto automáticamente según el modelo elegido y mantendrá sus propios logs.  

---

## 5. Ejemplo de Flujo de Trabajo

1. **Agregar una nueva Skill**  
   ```bash
   cat > SKILLS/listar_direcciones.md <<'EOF'
   ## Skill: Listar Directorios
   ...
   EOF
   OpenShell reload                                           # recarga configuración
   ```

2. **Ejecutar la Skill**  
   ```bash
   openshell run skill Listar-Directorios
   ```

3. **Crear una Automatización**  
   ```bash
   openshell add automation
   # Se abrirá el editor con el template:
   # name: my_backup
   # trigger: cron("0 2 * * *")
   # action:
   #   type: script
   #   path: scripts/backup.sh
   ```

4. **Verificar Logs**  
   ```bash
   openshell log my_backup
   ```

---

## 6. Buenas Prácticas

- **Versionar** tus `*.md` y scripts en Git.  
- **Restringir** los permisos de `SKILLS` a lectura/escritura sólo para el usuario.  
- **Seguir** la nomenclatura `snake_case` en nombres de archivo y entradas.  
- **Privar** tus claves API y credenciales en un `.env` en la raíz (no subir a repositorio).  

---

## 7. Limitaciones (Para Memorizar)

| Limite | Descripción |
|--------|-------------|
| No hacer tareas no autorizadas | La IA no realizará ninguna acción sin consentimiento. |
| No editar/eliminar OpenShell | Los archivos de core y confiClaro, aquí tienes una versión mejorada y más estructurada de INSTRUCTION.md. He añadido secciones claras, ejemplos de uso y buenas prácticas, manteniendo las restricciones que mencionaste.

    # Guía de Desarrollo – OpenShell
    
    ## 1. Visión General
    **OpenShell** es una CLI de terminal que permite crear, gestionar y usar agentes de IA para automatizar tareas en tu máquina.  
    - **IA**: Cualquier modelo local o remoto (API).  
    - **Interacciones**: Sólo cuando el usuario autoriza explícitamente la acción.  
    - **Persistencia**: Contexto y automatizaciones se guardan en carpetas estructuradas dentro del proyecto.
    
    ---
    
    ## 2. Estructura de Directorios
    

OpenShell/
├── SKILLS/          # Skills que la IA puede usar (archivo *.md)
├── Context/         # Contexto específico de cada modelo
│   ├── chatgpt/
│   │   └── history.log
│   └── claude/
│       └── history.log
├── MCP/             # Archivos de planificación de tareas (MCP)
├── automations/     # Automatizaciones de eventos/hora
└── logs/            # Logs del sistema

    
    ### 2.1 Carpeta `SKILLS`
    - Crea un archivo `SKILL.md` por cada skill.
    - Estructura recomendada del archivo:
    

## Skill: Nombre del Skill

### Descripción

Breve descripción de lo que hace la skill.

### Entrada

    * `prompt`: cadena de texto solicitada al usuario.

### Salida

    * `response`: texto generado por la IA.

### Ejemplo

    $ openshell run skill Nombre-del-Skill

    
    ### 2.2 Carpeta `Context`
    - Cada modelo tiene su propio subdirectorio.
    - Se guardan los historiales de conversación (`history.log`) y cualquier metadata persistente.
    
    ### 2.3 Carpeta `MCP`
    - Archivos de **M** (Modelo), **C** (Conexión) y **P** (Planificación) en JSON o YAML.
    - Ejemplo simple:
    
    ```yaml
    name: backup_daily
    trigger: cron("0 2 * * *")  # 02:00 AM cada día
    action:
      type: script
      path: scripts/backup.sh

### 2.4 Carpeta automations

    * Organización de automatizaciones por categoría.
    * Cada automatización es un script Bash, Python o JSON que describe evento y acción.

-------------------------------------------------

## 3. Comandos Principales

┌────────────────────────────┬────────────────────────────────────────────────┬────────────────────────────────────────┐
│ Comando                    │ Descripción                                    │ Ejemplo                                │
├────────────────────────────┼────────────────────────────────────────────────┼────────────────────────────────────────┤
│ openshell install          │ Instala dependencias y configura la estructura │ sudo bash install.sh                   │
├────────────────────────────┼────────────────────────────────────────────────┼────────────────────────────────────────┤
│ openshell list skills      │ Muestra skills disponibles                     │ openshell list skills                  │
├────────────────────────────┼────────────────────────────────────────────────┼────────────────────────────────────────┤
│ openshell run skill <name> │ Ejecuta una skill específica                   │ openshell run skill listar_direcciones │
├────────────────────────────┼────────────────────────────────────────────────┼────────────────────────────────────────┤
│ openshell add automation   │ Crea una nueva automatización                  │ openshell add automation               │
├────────────────────────────┼────────────────────────────────────────────────┼────────────────────────────────────────┤
│ openshell list automations │ Lista las automatizaciones activas             │ openshell list automations             │
├────────────────────────────┼────────────────────────────────────────────────┼────────────────────────────────────────┤
│ openshell log <action>     │ Muestra logs de una acción                     │ openshell log backup_daily             │
└────────────────────────────┴────────────────────────────────────────────────┴────────────────────────────────────────┘

-------------------------------------------------

## 4. Principios de Seguridad

    1. **Consentimiento**  
       
       
        * La IA solo ejecuta acciones que el usuario haya autorizado mediante confirmación `y/n`.  
       
        * Operaciones críticas (p.ej. borrar archivos) requieren super‑confirmação:
       
           $ openshell run skill deleteFile
           Esto borrará /etc/passwd. ¿Continuar? y
    2. **Protección de Archivos Internos**  
       
       
        * La IA NO puede modificar/eliminar ninguno de los archivos de **OpenShell** (ej. `install.sh`, `config.yaml`).
    3. **Acceso a Carpetas**  
       
       
        * La IA sólo puede leer/escribir en carpetas a las que el usuario le concedió permisos (p.ej. `SKILLS`, `Context`, `MCP`).
    4. **Túnel de Seguridad**  
       
       
        * Si un agente está configurado para usar un modelo externo y se pierde la conexión, el CLI mostrará un error y no intentará la acción.
    5. **Múltiples Modelos**  
       
       
        * Puedes tener diversos modelos activos (`chatgpt`, `claude`, `openai`).  
       
        * La CLI cambiará el contexto automáticamente según el modelo elegido y mantendrá sus propios logs.

-------------------------------------------------

## 5. Ejemplo de Flujo de Trabajo

    1. **Agregar una nueva Skill**  
       
           cat > SKILLS/listar_direcciones.md <<'EOF'
           ## Skill: Listar Directorios
           ...
           EOF
           OpenShell reload                                           # recarga configuración
    2. **Ejecutar la Skill**  
       
           openshell run skill Listar-Directorios
    3. **Crear una Automatización**  
       
           openshell add automation
           # Se abrirá el editor con el template:
           # name: my_backup
           # trigger: cron("0 2 * * *")
           # action:
           #   type: script
           #   path: scripts/backup.sh
    4. **Verificar Logs**  
       
           openshell log my_backup

-------------------------------------------------

## 6. Buenas Prácticas

    * **Versionar** tus `*.md` y scripts en Git.  
    * **Restringir** los permisos de `SKILLS` a lectura/escritura sólo para el usuario.  
    * **Seguir** la nomenclatura `snake_case` en nombres de archivo y entradas.  
    * **Privar** tus claves API y credenciales en un `.env` en la raíz (no subir a repositorio).

-------------------------------------------------

## 7. Limitaciones (Para Memorizar)

┌────────────────────────────────────┬───────────────────────────────────────────────────────────────────┐
│ Limite                             │ Descripción                                                       │
├────────────────────────────────────┼───────────────────────────────────────────────────────────────────┤
│ No hacer tareas no autorizadas     │ La IA no realizará ninguna acción sin consentimiento.             │
├────────────────────────────────────┼───────────────────────────────────────────────────────────────────┤
│ No editar/eliminar OpenShell       │ Los archivos de core y configuraciones no pueden ser modificados. │
├────────────────────────────────────┼───────────────────────────────────────────────────────────────────┤
│ No acceder a carpetas restringidas │ Solo carpetas dentro de la estructura designada.                  │
├────────────────────────────────────┼───────────────────────────────────────────────────────────────────┤
│ No borrar, editar OpenGit          │ El repositorio de GitHub (OpenGit) queda protegido.               │
└────────────────────────────────────┴───────────────────────────────────────────────────────────────────┘
