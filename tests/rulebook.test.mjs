import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';

async function load(name) {
  const source = await readFile(new URL(`../src/data/${name}.ts`, import.meta.url), 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
}
const basics = await load('rulebookBasics');
const clans = await load('rulebookClans');
const disciplines = await load('rulebookDisciplines');
const traits = await load('rulebookTraits');
const predators = await load('rulebookPredators');
const memoriam = await load('rulebookMemoriam');
const sections = [basics.basicsSection, basics.creationSection, clans.clansSection, disciplines.disciplineSection, traits.advantagesSection, traits.flawsSection, predators.predatorsSection, memoriam.memoriamSection];

test('all reference cards have content, unique links and printed source pages', () => {
  const ids = new Set();
  for (const section of sections) {
    assert.ok(section.entries.length > 0, section.id);
    for (const entry of section.entries) {
      assert.ok(entry.id && !ids.has(entry.id), `duplicate or missing id ${entry.id}`);
      ids.add(entry.id);
      assert.ok(entry.title && entry.summary && entry.paragraphs.length > 0, entry.id);
      assert.ok(entry.paragraphs.every((text) => typeof text === 'string' && text.trim()), entry.id);
      assert.ok(['core', 'memoriam'].includes(entry.source.book), entry.id);
      assert.match(entry.source.pages, /^\d+[\d–—,\s-]*$/, entry.id);
      const upper = entry.source.book === 'core' ? 425 : 158;
      for (const page of entry.source.pages.match(/\d+/g)) assert.ok(+page > 0 && +page <= upper, entry.id);
      if (entry.table) assert.ok(entry.table.rows.every((row) => row.length === entry.table.headers.length), entry.id);
      assert.doesNotMatch(JSON.stringify(entry), /https?:\/\/(?:www\.)?(?:wta5\.ru|vote\.su)/i, entry.id);
    }
  }
});
test('core plus Memoriam have eleven predator packages and eleven discipline categories', () => {
  assert.equal(predators.VERIFIED_PREDATOR_NAMES.length, 11);
  assert.equal(disciplines.VERIFIED_DISCIPLINE_NAMES.length, 11);
  assert.equal(disciplines.disciplineSection.entries.filter((entry) => entry.bullets?.some((line) => line.startsWith('Уровень:'))).length, 121, 'core power/ritual/formula coverage changed; re-audit against the book');
  assert.equal(disciplines.disciplineSection.entries.length, 136);
});
test('all seven Oceans of Time are present', () => {
  for (const id of ['ocean-hard', 'ocean-quiet', 'ocean-intrigue', 'ocean-excess', 'ocean-violence', 'ocean-sorcery', 'ocean-torpor']) {
    assert.ok(memoriam.memoriamSection.entries.some((entry) => entry.id === id), id);
  }
});
