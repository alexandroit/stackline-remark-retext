import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const upstream=JSON.parse(await readFile('.stackline/upstream.json','utf8'));
for(const [file,hash] of Object.entries(upstream.files)) {
 if(file==='package.json' || /readme|changelog|history/i.test(file) || upstream.allowedRuntimeChanges.includes(file)) continue;
 assert.equal(createHash('sha256').update(await readFile(file)).digest('hex'),hash,'Unreviewed published-file change: '+file);
}
console.log('Published upstream runtime/type surface matches the reviewed base, except explicitly recorded fixes.');
