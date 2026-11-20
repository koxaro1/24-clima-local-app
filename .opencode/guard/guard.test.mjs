import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { evaluate, fromOpenCode } from './guard.mjs';

const dir = path.resolve('/proj');
const run = (tool, args) => evaluate(fromOpenCode(tool, args), dir);
const bash = (command) => run('bash', { command });

test('1. read de .env.local se bloquea', () =>
  assert.equal(run('read', { filePath: '/proj/.env.local' }).block, true));
test('2. cat .env.local se bloquea', () => assert.equal(bash('cat .env.local').block, true));
test('3. grep -r se bloquea', () => assert.equal(bash('grep -r CANARIO .').block, true));
test('4. node -e se bloquea', () => assert.equal(bash(`node -e "console.log(1)"`).block, true));
test('5. ls .. y ~/.bashrc se bloquean', () => {
  assert.equal(bash('ls ..').block, true);
  assert.equal(bash('cat ~/.bashrc').block, true);
});
test('6. crear archivo fuera del proyecto se bloquea', () =>
  assert.equal(run('write', { filePath: '/home/otro/prueba.txt' }).block, true));
test('7. curl, wget e iwr se bloquean', () => {
  assert.equal(bash('curl https://x.com').block, true);
  assert.equal(bash('/usr/bin/curl https://x.com').block, true);
  assert.equal(bash('iwr https://x.com').block, true);
});
test('8. git push --force y reset --hard se bloquean', () => {
  assert.equal(bash('git push --force origin main').block, true);
  assert.equal(bash('git reset --hard HEAD~1').block, true);
});
test('9. editar opencode.json y .opencode se bloquea', () => {
  assert.equal(run('edit', { filePath: '/proj/opencode.json' }).block, true);
  assert.equal(run('write', { filePath: '/proj/.opencode/plugins/guard.js' }).block, true);
  assert.equal(bash('echo {} > opencode.json').block, true);
});
test('10. glob que apunta a .env se bloquea', () =>
  assert.equal(run('glob', { pattern: '**/.env*' }).block, true));
test('comandos y archivos normales se permiten', () => {
  assert.equal(bash('npm run check').block, false);
  assert.equal(bash('git status').block, false);
  assert.equal(bash('git grep -n CANARIO').block, false);
  assert.equal(run('read', { filePath: '/proj/src/app.ts' }).block, false);
  assert.equal(run('edit', { filePath: '/proj/src/app.ts' }).block, false);
});
test('el adaptador traduce nombres y argumentos de OpenCode', () => {
  const c = fromOpenCode('read', { filePath: '/proj/a.ts' });
  assert.equal(c.tool_name, 'Read');
  assert.equal(c.tool_input.file_path, '/proj/a.ts');
});
