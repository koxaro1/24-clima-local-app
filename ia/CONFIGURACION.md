# Configuración de IA (OpenCode, Windows nativo)

Herramienta: OpenCode con modelo gratuito. Entorno: Windows nativo (sin WSL), autorizado por el profesor [confirmar].
Motivo del cambio: mi cuenta de Claude es gratuita y no incluye Claude Code.

| Barrera                                                       | Riesgo que cubre                                                                                                    | Límite conocido                                                                         |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| AGENTS.md                                                     | Da reglas y contexto a la IA                                                                                        | Es una guía, no una frontera                                                            |
| opencode.json: read                                           | Deniega leer .env*, .pem, .key, keystores y el JSON de Firebase                                                     | Solo cubre la herramienta read, no comandos de shell                                    |
| opencode.json: external_directory                             | Deniega acceso fuera de la carpeta del proyecto                                                                     | Se basa en rutas detectadas; un comando de shell ofuscado podría evadirlo               |
| opencode.json: bash                                           | Por defecto pide permiso; deniega curl, wget, sudo, rm -rf, git push, git reset --hard, vercel, eas                 | Reglas por texto del comando, no un sandbox                                             |
| opencode.json: webfetch / task                                | Sin acceso web y sin subagentes                                                                                     | Un plugin no intercepta a los subagentes, por eso están desactivados                    |
| Plugin .opencode/plugins/guard.js + .opencode/guard/guard.mjs | Antes de cada acción bloquea .env*, rutas fuera del repo, curl/wget/iwr, node -e, grep -r y editar la configuración | Revisa texto (heurística); se puede evadir con ofuscación. Tiene 12 pruebas (node:test) |
| Sandbox                                                       | Aislamiento real del sistema                                                                                        | NO existe en Windows nativo: límite principal                                           |

## Dominios de red

Ninguno permitido a la IA (webfetch y curl denegados). Solo el modelo del proveedor, que lo maneja OpenCode.

## Ajustes hechos tras las pruebas

(completar)
