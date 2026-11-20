// Guardia para OpenCode: el plugin .opencode/plugins/guard.js la llama ANTES de cada acción de la IA.
// Si bloquea, el plugin lanza un error y OpenCode cancela la acción.
// LÍMITE: es una revisión de texto (heurística); no es un sandbox real.
import path from 'node:path';

const SENSITIVE = [
  /(^|[^\w])\.env/i, // .env, .env.local, ./.env  (env.example NO coincide)
  /\.(pem|key|keystore|jks|p12|pfx)(?![\w])/i,
  /firebase-adminsdk/i,
  /service-?account[\w.-]*\.json/i,
];

const BANNED_COMMANDS = [
  [/\b(curl|wget|sudo)\b/i, 'comando de red/administrador prohibido'],
  [/\b(invoke-webrequest|invoke-restmethod|iwr|irm)\b/i, 'acceso a red desde PowerShell prohibido'],
  [/\brm\s+(-\w*r\w*f|-\w*f\w*r|--recursive)/i, 'rm -rf prohibido'],
  [/remove-item\b.*-recurse/i, 'Remove-Item -Recurse prohibido'],
  [/git\s+push\b.*(--force|--force-with-lease|\s-f\b)/i, 'git push --force prohibido'],
  [/git\s+reset\s+--hard/i, 'git reset --hard prohibido'],
  [/vercel\s+env\s+pull/i, 'vercel env pull prohibido'],
  [
    /\bnode\s+(-e|--eval|-p|--print)\b/i,
    'node -e / -p prohibido (podría leer archivos prohibidos)',
  ],
  [/\bpython3?\s+-c\b/i, 'python -c prohibido'],
  [
    /\b(powershell|pwsh)(\.exe)?\b.*\s-(c|command|enc|encodedcommand)\b/i,
    'PowerShell anidado prohibido',
  ],
  [/\b(bash|sh|cmd)(\.exe)?\s+(-c|\/c)\b/i, 'shell anidada prohibida'],
  [/\beval\b/i, 'eval prohibido'],
  [
    /\bgrep\b.*\s(-\w*r\w*|--recursive)\b/i,
    'búsqueda recursiva prohibida: usa la herramienta Grep o git grep',
  ],
  [/\b(rg|ripgrep)\b/i, 'rg prohibido: usa git grep'],
  [/findstr\b.*\/s/i, 'findstr /s prohibido: usa git grep'],
  [/select-string\b.*-recurse/i, 'Select-String -Recurse prohibido: usa git grep'],
  [/(^|[\\/\s])\.[^\\/\s]*[*?\[]/, 'comodín sobre archivos ocultos prohibido'],
];

const HOME_RE = /^(~|\$HOME|\$\{HOME\}|\$env:(USERPROFILE|HOME)|%USERPROFILE%|%HOMEPATH%)/i;

function toNative(p) {
  if (process.platform === 'win32') {
    const m = /^\/([a-z])(\/.*)?$/i.exec(p); // /c/Users/x (Git Bash) -> C:\Users\x
    if (m) return `${m[1].toUpperCase()}:${(m[2] ?? '\\').replace(/\//g, '\\')}`;
  }
  return p;
}

function isInside(p, dir) {
  const rel = path.relative(dir, path.resolve(dir, toNative(p)));
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

function checkPath(p, dir) {
  if (HOME_RE.test(p)) return 'ruta del directorio personal prohibida';
  if (p.split(/[\\/]/).includes('..')) return 'salir de la carpeta con ".." prohibido';
  const drive = /^[a-z]:[\\/]/i.test(p);
  if (drive && process.platform !== 'win32') return `ruta fuera del proyecto: ${p}`;
  const absolute = drive || /^[\\/]/.test(p);
  if (absolute && p !== '/dev/null' && !isInside(p, dir)) return `ruta fuera del proyecto: ${p}`;
  if (!absolute && !isInside(p, dir)) return `ruta fuera del proyecto: ${p}`;
  return null;
}

function checkSensitive(text) {
  return SENSITIVE.some((re) => re.test(text))
    ? 'acceso a archivos sensibles (.env*, claves) prohibido'
    : null;
}

export function evaluate(input, dir) {
  const tool = input?.tool_name ?? '';
  const ti = input?.tool_input ?? {};
  const deny = (reason) => ({ block: true, reason });

  if (tool === 'Bash') {
    const cmd = String(ti.command ?? '');
    for (const [re, why] of BANNED_COMMANDS) if (re.test(cmd)) return deny(why);
    const s = checkSensitive(cmd);
    if (s) return deny(s);
    if (/(\.claude|\.opencode|opencode\.json)(?![\w])/i.test(cmd))
      return deny('tocar la configuración de la IA prohibido');
    for (const tok of cmd.split(/[\s"'`;|&<>()=,]+/).filter(Boolean)) {
      const r = checkPath(tok, dir);
      if (
        r &&
        (HOME_RE.test(tok) || /^[a-z]:[\\/]/i.test(tok) || /^[\\/]/.test(tok) || tok.includes('..'))
      ) {
        return deny(r);
      }
    }
    return { block: false };
  }

  // Herramientas de archivos (Read, Edit, Write, Grep, Glob...)
  const fields = [
    ti.file_path,
    ti.path,
    ti.notebook_path,
    ti.glob,
    tool === 'Glob' ? ti.pattern : undefined,
  ].filter((v) => typeof v === 'string' && v.length > 0);
  for (const f of fields) {
    const s = checkSensitive(f);
    if (s) return deny(s);
  }
  for (const f of [ti.file_path, ti.path, ti.notebook_path].filter(
    (v) => typeof v === 'string' && v,
  )) {
    const r = checkPath(f, dir);
    if (r) return deny(r);
    if (/^(Edit|Write|MultiEdit|NotebookEdit)$/.test(tool)) {
      const rel = path.relative(dir, path.resolve(dir, toNative(f)));
      const first = rel.split(path.sep)[0].toLowerCase();
      if (first === '.claude' || first === '.opencode' || rel.toLowerCase() === 'opencode.json')
        return deny('editar la configuración de la IA prohibido');
    }
  }
  return { block: false };
}

// Traduce una llamada de OpenCode (nombre de herramienta + argumentos) al formato de evaluate().
const TOOL_NAMES = {
  bash: 'Bash',
  read: 'Read',
  edit: 'Edit',
  write: 'Write',
  patch: 'Edit',
  multiedit: 'MultiEdit',
  grep: 'Grep',
  glob: 'Glob',
  list: 'Glob',
};
export function fromOpenCode(tool, args = {}) {
  const name = TOOL_NAMES[String(tool).toLowerCase()] ?? String(tool);
  return {
    tool_name: name,
    tool_input: {
      command: args.command,
      file_path: args.filePath ?? args.file_path,
      path: args.path,
      pattern: args.pattern,
      glob: args.include ?? args.glob,
    },
  };
}
