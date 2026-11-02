/*
 * Makes the module's copies of original files again (see MODULE_COPIES in index.ts), keeping each copy's header
 * comment. Run in apps/web after an update of the shop when upstreamContractAddress.spec.ts reports a changed original:
 *   npx jiti modules/glas-jena/copies/generate.ts
 * A rule that no longer finds its place in the original stops with an error naming it; adapt it in
 * addressFormCopy.ts or displayCopy.ts.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { getCopyHeader, MODULE_COPIES } from './index';

const appDir = join(process.cwd(), 'app');
const runtimeDir = join(process.cwd(), 'modules/glas-jena/runtime');

for (const { file, original, make } of MODULE_COPIES) {
  const target = join(runtimeDir, file);
  const header = getCopyHeader(readFileSync(target, 'utf8'));
  writeFileSync(target, header + make(readFileSync(join(appDir, original), 'utf8')));
  process.stdout.write(`made ${file}\n`);
}
