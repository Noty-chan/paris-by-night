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

const { parseCreationScore, suggestClanDisciplines, updateCreationAttribute, updateCreationSkill } = await import(await moduleURL(new URL('../src/lib/creation.ts', import.meta.url)));
const { defaultCharacter } = await import(await moduleURL(new URL('../src/data/character.ts', import.meta.url)));
const { CORE_CLAN_PROFILES } = await import(await moduleURL(new URL('../src/data/rulebookClans.ts', import.meta.url)));

test('creation scores accept only integer ratings from zero through five', () => {
  assert.equal(parseCreationScore('0'), 0);
  assert.equal(parseCreationScore('5'), 5);
  for (const value of ['', '-1', '6', '2.5', '3x']) assert.equal(parseCreationScore(value), null, value);
});

test('clan suggestion preserves named powers and unknown disciplines', () => {
  const original = {
    ...defaultCharacter,
    clanBane: 'Своя запись из старого клана',
    disciplines: [
      { id: 'old-potence', name: 'Мощь', rating: 2, powers: 'Парящий прыжок' },
      { id: 'custom', name: 'Омут', rating: 4, powers: 'Своя сила' },
      { id: 'blank', name: '', rating: 0, powers: '' },
    ],
  };
  const gangrel = CORE_CLAN_PROFILES.find((profile) => profile.name === 'Гангрел');
  const updated = suggestClanDisciplines(original, gangrel);
  assert.ok(updated.disciplines.some((entry) => entry.id === 'old-potence' && entry.name === 'Мощь' && entry.rating === 2 && entry.powers === 'Парящий прыжок'));
  assert.ok(updated.disciplines.some((entry) => entry.id === 'custom' && entry.name === 'Омут' && entry.rating === 4 && entry.powers === 'Своя сила'));
  assert.deepEqual(updated.disciplines.filter((entry) => gangrel.disciplines.includes(entry.name)).map((entry) => entry.name), gangrel.disciplines);
  assert.equal(updated.clanBane, gangrel.bane);
});

test('attribute recalculation keeps damage marks and skill editing preserves unknown entries', () => {
  const original = {
    ...defaultCharacter,
    attributes: { ...defaultCharacter.attributes, Выносливость: 4 },
    healthDamage: [1, 2, 0, 0],
    willpowerDamage: [2, 1],
    skills: { ...defaultCharacter.skills, 'Домашний навык': 3 },
  };
  const updated = updateCreationAttribute(original, 'Выносливость', 5);
  assert.equal(updated.healthMax, 8);
  assert.deepEqual(updated.healthDamage.slice(0, 2), [1, 2]);
  assert.deepEqual(updated.willpowerDamage, [2, 1]);
  const withSkill = updateCreationSkill(updated, 'Атлетика', 2);
  assert.equal(withSkill.skills['Домашний навык'], 3);
  assert.equal(withSkill.skills.Атлетика, 2);
  assert.deepEqual(withSkill.disciplines, original.disciplines);
});
