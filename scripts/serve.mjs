import http from 'node:http';
import { readFile, stat, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const project = fileURLToPath(new URL('../', import.meta.url));
const root = path.resolve(project, process.argv.includes('--dist') ? 'dist' : '.');
const port = Number(process.env.PORT || 4340);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.woff':'font/woff','.md':'text/plain; charset=utf-8','.txt':'text/plain; charset=utf-8'};
http.createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,'http://localhost');
    const decoded=decodeURIComponent(url.pathname);
    // The development server intentionally supports /community/ to exercise project Pages paths.
    const route=decoded.replace(/^\/community(?=\/|$)/,'') || '/';
    const file=path.resolve(root,'.'+(route.endsWith('/')?route+'index.html':route));
    const relative=path.relative(root,file);
    if(relative.startsWith('..')||path.isAbsolute(relative)||relative.split(/[\\/]/).some(p=>p.startsWith('.'))) throw Error('Forbidden');
    const actual=await realpath(file);
    if(!actual.startsWith(root+path.sep)) throw Error('Forbidden');
    if(!(await stat(actual)).isFile()) throw Error('Not found');
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});
    res.end(await readFile(actual));
  } catch {
    res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}); res.end('Not found');
  }
}).listen(port,'127.0.0.1',()=>console.log(`First Light Community: http://127.0.0.1:${port}/`));
