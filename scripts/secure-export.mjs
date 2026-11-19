import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

// Static Next hydration requires inline scripts: authorize their exact build hashes.
const root=path.resolve('out');
async function htmlFiles(dir){const files=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())files.push(...await htmlFiles(p));else if(e.name.endsWith('.html'))files.push(p);}return files;}
const pages=await htmlFiles(root), hashes=new Set();
for(const file of pages){const html=await readFile(file,'utf8');for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(!/\bsrc\s*=/i.test(match[1])&&match[2])hashes.add(`'sha256-${createHash('sha256').update(match[2]).digest('base64')}'`);}}
const csp=["default-src 'self'",`script-src 'self' 'wasm-unsafe-eval' ${[...hashes].join(' ')}`,"script-src-attr 'none'","style-src 'self' 'unsafe-inline'","img-src 'self' data: blob:","font-src 'self'","media-src 'self' blob:","connect-src 'self'","worker-src 'self'","object-src 'none'","base-uri 'none'","form-action 'none'"].join('; ');
for(const file of pages){let html=await readFile(file,'utf8');html=html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/gi,'');html=html.replace('<head>',`<head><meta http-equiv="Content-Security-Policy" content="${csp}"><meta name="referrer" content="strict-origin-when-cross-origin">`);await writeFile(file,html);}
const headers={
 'Content-Security-Policy':`${csp}; frame-ancestors 'none'`,
 'X-Content-Type-Options':'nosniff',
 'X-Frame-Options':'DENY',
 'Referrer-Policy':'strict-origin-when-cross-origin',
 'Permissions-Policy':'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
 'Strict-Transport-Security':'max-age=31536000',
};
await writeFile(path.join(root,'_headers'),'/*\n'+Object.entries(headers).map(([k,v])=>`  ${k}: ${v}`).join('\n')+'\n');
await writeFile(path.join(root,'security-headers.json'),JSON.stringify(headers,null,2)+'\n');
console.log(`Secured ${pages.length} exported pages with ${hashes.size} script hashes; host header configuration generated.`);
