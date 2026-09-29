import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtemp,readFile,cp,symlink,rm,access,mkdir} from 'node:fs/promises';
import path from 'node:path';import os from 'node:os';
const source=process.cwd();const root=await mkdtemp(path.join(os.tmpdir(),'stackline-packed-'));
const manifest=JSON.parse(await readFile('package.json','utf8'));
try {
 const result=JSON.parse(execFileSync('npm',['pack','--ignore-scripts','--json','--pack-destination',root],{encoding:'utf8'}));
 const packed=Array.isArray(result)?result[0]:Object.values(result)[0];
 const archive=path.join(root,packed.filename);execFileSync('tar',['-xzf',archive,'-C',root]);
 const target=path.join(root,'package');
 assert.deepEqual(JSON.parse(await readFile(path.join(target,'package.json'),'utf8')),manifest);
 for(const f of packed.files)assert(!/(^|\/)(node_modules|\.npmrc|\.env|\.git)(\/|$)/.test(f.path),f.path);
 for(const name of ['test.js','test.mjs','test','fixtures','tsconfig.json']) {
  try {await access(path.join(source,name));await cp(path.join(source,name),path.join(target,name),{recursive:true,errorOnExist:false,force:false});}
  catch(e){if(e.code!=='ENOENT')throw e;}
 }
 await symlink(path.join(source,'node_modules'),path.join(target,'node_modules'),'dir');
 execFileSync('npm',['run','test:upstream'],{cwd:target,stdio:'inherit'});
 try {await access(path.join(target,'test/stackline-regression.test.mjs'));execFileSync(process.execPath,['--test','test/stackline-regression.test.mjs'],{cwd:target,stdio:'inherit'});} catch(e){if(e.code!=='ENOENT')throw e;}
 console.log('The final package passed its upstream functional and focused regression suites.');
} finally {await rm(root,{recursive:true,force:true});}
