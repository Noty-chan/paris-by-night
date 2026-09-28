import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';

const compiled = new Map();
async function moduleURL(url) {
  if (compiled.has(url.href)) return compiled.get(url.href);
  const source = await readFile(url, 'utf8');
  let js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
  const imports = [...js.matchAll(/from\s+["'](\.[^"']+)["']/g)];
  for (const match of imports) {
    const dependency = new URL(`${match[1]}.ts`, url);
    js = js.replace(match[0], `from ${JSON.stringify(await moduleURL(dependency))}`);
  }
  const result = `data:text/javascript;base64,${Buffer.from(js).toString('base64')}`;
  compiled.set(url.href, result);
  return result;
}
const { migrateCharacter, defaultCharacter } = await import(await moduleURL(new URL('../src/data/character.ts', import.meta.url)));

test('book catalog replacement preserves character data and all raw PDF fields', () => {
  const fields = Object.fromEntries(Array.from({ length: 413 }, (_, index) => [`field${index}`, `Значение Ф\n${index}`]));
  const raw = {
    ...defaultCharacter, name: 'Филипп', clan: 'Геката', predatorType: 'Гробокопатель',
    disciplines: [{ id: 'old', name: 'Забвение', rating: 3, powers: 'Своя сила' }],
    advantages: [{ id: 'custom', name: 'Своё достоинство', rating: 2, note: 'Не удалять' }],
    flaws: [{ id: 'custom-flaw', name: 'Свой недостаток', rating: 1, note: 'Не удалять' }],
    convictions: 'Фраза', touchstones: 'Филипп',
    humanityAnchors: [{ id: 'anchor', conviction: 'Фраза', touchstone: 'Филипп' }],
    ritualsCeremonies: 'Обряд\nЦеремония', wod5Pdf: { fields },
  };
  const migrated = migrateCharacter(JSON.parse(JSON.stringify(raw)));
  for (const key of ['name', 'clan', 'predatorType', 'disciplines', 'advantages', 'flaws', 'humanityAnchors', 'ritualsCeremonies', 'wod5Pdf']) {
    assert.deepEqual(migrated[key], raw[key], key);
  }
  assert.deepEqual(migrateCharacter(JSON.parse(JSON.stringify(migrated))), migrated);
});
test('derived tracks use only attributes and retain marks', () => {
  const migrated = migrateCharacter({ ...defaultCharacter, attributes: { ...defaultCharacter.attributes, Выносливость: 4, Самообладание: 3, Упорство: 4 }, healthMax: 100, willpowerMax: 100, healthDamage: [1, 2], willpowerDamage: [2, 1] });
  assert.equal(migrated.healthMax, 7);
  assert.equal(migrated.willpowerMax, 7);
  assert.deepEqual(migrated.healthDamage.slice(0, 2), [1, 2]);
  assert.deepEqual(migrated.willpowerDamage.slice(0, 2), [2, 1]);
});
