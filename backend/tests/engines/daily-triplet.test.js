const test = require('node:test');
const assert = require('node:assert/strict');

const legacy = require('./legacy-reference');
const { binomial, unrank, TOTAL_TRIPLETS, computeDailyTriplet } = require('../../src/engines/daily-triplet/daily-triplet');

test('TOTAL_TRIPLETS matches legacy TTOTAL (C(49,3) = 18424)', () => {
  assert.equal(TOTAL_TRIPLETS, legacy.TTOTAL);
});

test('binomial matches legacy across a representative range', () => {
  for (const [n, k] of [[49, 3], [49, 0], [49, 49], [10, 4], [7, 2], [0, 0]]) {
    assert.equal(binomial(n, k), legacy.binomial(n, k), `binomial(${n},${k})`);
  }
});

test('unrank matches legacy across the full 0..TOTAL_TRIPLETS-1 index range', () => {
  // Full range check - unrank must be a faithful bijection with the legacy version.
  for (let idx = 0; idx < TOTAL_TRIPLETS; idx += 137) {
    assert.deepEqual(unrank(idx), legacy.unrank(idx), `unrank(${idx})`);
  }
  assert.deepEqual(unrank(0), legacy.unrank(0));
  assert.deepEqual(unrank(TOTAL_TRIPLETS - 1), legacy.unrank(TOTAL_TRIPLETS - 1));
});

test('computeDailyTriplet wraps slots around the combination space and rotates daily', () => {
  const day1 = new Date('2026-01-01T12:00:00Z').getTime();
  const day2 = new Date('2026-01-02T12:00:00Z').getTime();
  const { triplet: t1 } = computeDailyTriplet(5, day1);
  const { triplet: t2 } = computeDailyTriplet(5, day2);
  assert.equal(t1.length, 3);
  assert.notDeepEqual(t1, t2, 'the same slot should get a different triplet on a different day');

  // Two slots exactly TOTAL_TRIPLETS apart always land on the same triplet on the same day.
  const { triplet: tA } = computeDailyTriplet(42, day1);
  const { triplet: tB } = computeDailyTriplet(42 + TOTAL_TRIPLETS, day1);
  assert.deepEqual(tA, tB);
});
