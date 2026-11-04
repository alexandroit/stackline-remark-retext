'use strict';
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const assert = require('node:assert/strict');
const advisory = 'https://github.com/advisories/GHSA-g3hv-75wg-m249';

function review(report, lock) {
  const vulnerabilities = report.vulnerabilities;
  if (!vulnerabilities || report.error) throw new Error('npm audit did not return a valid vulnerability report');
  const ignored = new Set();
  for (const [name, item] of Object.entries(vulnerabilities)) {
    // The reviewed GHSA was narrowed to >=7 on 2026-11-04; npm still caches <11.0.1.
    // shortcut: expire this exact false-positive exception after registry propagation.
    if (Date.now() > Date.parse('2026-12-04T00:00:00Z')) continue;
    if (name !== 'minimatch' || !item.nodes?.length || !item.via?.length) continue;
    if (!item.via.every(v => typeof v === 'object' && v.url === advisory)) continue;
    if (item.nodes.every(node => {
      const version = lock.packages?.[node]?.version;
      return typeof version === 'string' && /^[0-6]\.\d+\.\d+$/.test(version);
    })) ignored.add(name);
  }
  let changed;
  do {
    changed = false;
    for (const [name, item] of Object.entries(vulnerabilities)) {
      if (ignored.has(name) || !item.via?.length) continue;
      if (item.via.every(v => typeof v === 'string' && ignored.has(v))) {
        ignored.add(name);
        changed = true;
      }
    }
  } while (changed);
  return { ignored: [...ignored], actionable: Object.keys(vulnerabilities).filter(n => !ignored.has(n)) };
}

if (process.argv.includes('--self-test')) {
  const item = { nodes: ['node_modules/minimatch'], via: [{ url: advisory }] };
  const report = { vulnerabilities: { minimatch: item, parent: { via: ['minimatch'] } } };
  const lock = version => ({ packages: { 'node_modules/minimatch': { version } } });
  assert.deepEqual(review(report, lock('3.1.5')).actionable, []);
  assert.deepEqual(review(report, lock('10.2.6')).actionable, ['minimatch', 'parent']);
  assert.deepEqual(review(report, {}).actionable, ['minimatch', 'parent']);
  assert.deepEqual(review({ vulnerabilities: { unknown: { via: [{ url: 'https://github.com/advisories/another' }] } } }, lock('3.1.5')).actionable, ['unknown']);
  assert.throws(() => review({ error: { code: 'ENOTFOUND' } }, {}));
  console.log('Reviewed-audit fail-closed checks passed');
} else {
  const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['audit', '--json', '--registry=https://registry.npmjs.org/'], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  if (result.error || ![0, 1].includes(result.status)) throw result.error || new Error(result.stderr || 'npm audit failed');
  const report = JSON.parse(result.stdout);
  const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
  const reviewed = review(report, lock);
  if (reviewed.ignored.length) console.log(`Excluded only cached GHSA-g3hv-75wg-m249 on installed minimatch <7 and its dependent alerts: ${reviewed.ignored.join(', ')}. Exception expires 2026-12-04.`);
  if (reviewed.actionable.length) {
    console.error(JSON.stringify(Object.fromEntries(reviewed.actionable.map(n => [n, report.vulnerabilities[n]])), null, 2));
    process.exitCode = 1;
  } else console.log('No actionable known dependency advisories');
}
