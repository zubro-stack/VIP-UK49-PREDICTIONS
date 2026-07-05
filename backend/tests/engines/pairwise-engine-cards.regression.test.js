const test = require('node:test');
const assert = require('node:assert/strict');

const { generateDraws } = require('../fixtures/generate-draws');
const legacy = require('./legacy-reference');
const { pairwiseEngines } = require('../../src/engines/pairwise');

const draws = generateDraws(24, 42);

function normalizeCard(c) {
  return {
    drawType: c.drawType,
    positionA: c.positionA ?? c.p1,
    positionB: c.positionB ?? c.p2,
    addPreds: (c.addPreds ?? (c.addPred != null ? [c.addPred] : [])).slice().sort((a, b) => a - b),
    subPreds: (c.subPreds ?? (c.subPred != null ? [c.subPred] : [])).slice().sort((a, b) => a - b),
    totalHits: c.totalHits,
    streak: c.streak,
    lastHit: c.lastHit,
    hasDirectHit: c.hasDirectHit,
  };
}

test('v1-seq buildCards (with recency gate) matches legacy buildSeqCards', () => {
  const patterns = pairwiseEngines['v1-seq'].discover(draws);
  const actual = pairwiseEngines['v1-seq'].buildCards(draws, patterns).map(normalizeCard);
  const expected = legacy.buildSeqCards(draws, legacy.discoverSeq(draws)).map(normalizeCard);
  assert.deepEqual(actual, expected);
});
