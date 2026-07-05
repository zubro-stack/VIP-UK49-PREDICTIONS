const test = require('node:test');
const assert = require('node:assert/strict');

const { generateDraws } = require('../fixtures/generate-draws');
const legacy = require('./legacy-reference');
const { pairwiseEngines } = require('../../src/engines/pairwise');

const draws = generateDraws(24, 42);

function normalize(patterns, posFieldA, posFieldB) {
  return patterns
    .map((p) => ({
      id: p.id,
      drawType: p.drawType ?? null,
      positionA: p[posFieldA],
      positionB: p[posFieldB],
      occurrences: p.occurrences,
      failures: p.failures,
      status: p.status,
      history: p.history.map((h) => ({
        addPreds: (h.addPreds ?? (h.addPred != null ? [h.addPred] : [])).slice().sort((a, b) => a - b),
        subPreds: (h.subPreds ?? (h.subPred != null ? [h.subPred] : [])).slice().sort((a, b) => a - b),
        addHit: h.addHit,
        subHit: h.subHit,
        hit: h.hit,
      })),
    }))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

function assertParity(newPatterns, legacyPatterns, posFieldA, posFieldB) {
  const actual = normalize(newPatterns, 'positionA', 'positionB');
  const expected = normalize(legacyPatterns, posFieldA, posFieldB);
  assert.deepEqual(actual, expected);
}

test('v1-seq matches legacy discoverSeq', () => {
  assertParity(pairwiseEngines['v1-seq'].discover(draws), legacy.discoverSeq(draws), 'p1', 'p2');
});

test('v1-fam matches legacy discoverFam', () => {
  assertParity(pairwiseEngines['v1-fam'].discover(draws), legacy.discoverFam(draws), 'rp', 'pp');
});

test('v2 matches legacy discoverV2', () => {
  assertParity(pairwiseEngines.v2.discover(draws), legacy.discoverV2(draws), 'lp', 'tp');
});

test('same-day matches legacy discoverSameDay', () => {
  assertParity(pairwiseEngines['same-day'].discover(draws), legacy.discoverSameDay(draws), 'p1', 'p2');
});

test('bonus-seq matches legacy discoverBonusSeq', () => {
  assertParity(pairwiseEngines['bonus-seq'].discover(draws), legacy.discoverBonusSeq(draws), 'p1', 'p2');
});

test('bonus-fam matches legacy discoverBonusFam', () => {
  assertParity(pairwiseEngines['bonus-fam'].discover(draws), legacy.discoverBonusFam(draws), 'rp', 'pp');
});

test('bonus-v2 matches legacy discoverBonusV2', () => {
  assertParity(pairwiseEngines['bonus-v2'].discover(draws), legacy.discoverBonusV2(draws), 'lp', 'tp');
});
