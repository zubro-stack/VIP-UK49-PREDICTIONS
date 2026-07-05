const test = require('node:test');
const assert = require('node:assert/strict');

const { generateDraws } = require('../fixtures/generate-draws');
const legacy = require('./legacy-reference');
const { computeRepeats } = require('../../src/engines/repeats/repeats-engine');

function normalize(result) {
  return {
    windowSize: result.windowSize,
    predictions: result.predictions
      .map((p) => ({ num: p.num, pattern: p.pattern, hits: p.hits, total: p.total, tier: p.tier }))
      .sort((a, b) => a.num - b.num),
  };
}

test('computeRepeats matches legacy computeRepeats over a sorted window', () => {
  const draws = generateDraws(24, 42);
  const sorted = draws.slice().sort((a, b) => new Date(a.drawDate) - new Date(b.drawDate));

  const actual = normalize(computeRepeats(draws));
  const expected = normalize(legacy.computeRepeats(legacy.normalizeForRepeats(sorted)));
  assert.deepEqual(actual, expected);
});

test('computeRepeats matches legacy on a short (near-boundary) draw history', () => {
  const draws = generateDraws(3, 7);
  const sorted = draws.slice().sort((a, b) => new Date(a.drawDate) - new Date(b.drawDate));

  const actual = normalize(computeRepeats(draws));
  const expected = normalize(legacy.computeRepeats(legacy.normalizeForRepeats(sorted)));
  assert.deepEqual(actual, expected);
});
