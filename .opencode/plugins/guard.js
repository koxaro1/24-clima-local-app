// Plugin de OpenCode: antes de cada herramienta, consulta la guardia.
// Si la guardia bloquea, lanzar un error cancela la acción.
import { evaluate, fromOpenCode } from '../guard/guard.mjs';

export const Guard = async ({ directory }) => ({
  'tool.execute.before': async (input, output) => {
    const call = fromOpenCode(input.tool, output?.args ?? {});
    const { block, reason } = evaluate(call, directory ?? process.cwd());
    if (block) throw new Error(`BLOQUEADO por guard: ${reason}`);
  },
});
