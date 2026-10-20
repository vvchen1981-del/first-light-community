import { cp, mkdir, rm, realpath, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const destination = path.resolve(root, 'dist');
if (path.dirname(destination) !== path.resolve(root)) throw Error('Invalid build destination');
// Only the generated dist directory inside this repository is replaced.
try { if (await realpath(destination) !== destination) throw Error('Refusing linked dist directory'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
await rm(destination, { recursive: true, force: true });
await mkdir(destination);
const allowlist = ['index.html','app.js','styles.css','assets','data','PRIVACY.md','THIRD_PARTY_NOTICES.md','LICENSE'];
for (const item of allowlist) await cp(path.join(root,item),path.join(destination,item),{recursive:true,dereference:false});
await writeFile(path.join(destination,'.nojekyll'),'');
console.log('Static site built in dist/ using an explicit public-file allowlist.');
