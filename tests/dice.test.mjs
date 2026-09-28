import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';

const source = await readFile(new URL('../src/lib/dice.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { interpretDice } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const white = (value) => ({ value, hunger: false });
const red = (value) => ({ value, hunger: true });

test('critical pair below difficulty still fails', () => {
  assert.equal(interpretDice([white(10), white(10)], 5).success, false);
  assert.match(interpretDice([red(10), white(10)], 5).title, /^Провал/);
});
test('any hunger ten makes a winning critical messy, even the odd ten', () => {
  assert.match(interpretDice([white(10), white(10), red(10)], 5).title, /^Грязный крит · 5/);
});
test('a hunger one on failed check is bestial even with successes', () => {
  assert.match(interpretDice([red(1), white(6)], 2).title, /^Звериный провал/);
  assert.match(interpretDice([red(1), white(10), white(10)], 5).title, /^Звериный провал/);
});
test('hunger signs alone do not force a special result', () => {
  assert.match(interpretDice([red(10)], 1).title, /^Успех/);
  assert.match(interpretDice([red(1), white(6)], 1).title, /^Успех/);
});
test('critical pairs add correct number of successes', () => {
  assert.match(interpretDice([white(10), white(10), white(10), white(10)], 8).title, /8 успехов/);
  assert.equal(interpretDice([white(10), white(10), white(10), white(10)], 9).success, false);
});
