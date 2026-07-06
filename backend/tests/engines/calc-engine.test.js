const test = require('node:test');
const assert = require('node:assert/strict');

const { generateDraws } = require('../fixtures/generate-draws');
const legacy = require('./legacy-reference');
const { strat1, strat2, strat3, hitType } = require('../../src/engines/calc/strategies');
const { computeTrackerStats } = require('../../src/engines/calc/tracker');
const { computeCalcResult, nextCalendarDay } = require('../../src/engines/calc/calc-engine');

test('strat1/strat2/strat3/hitType match legacy exactly across the full 1-49 range', () => {
  const allNumbers = Array.from({ length: 49 }, (_, i) => i + 1);
  assert.deepEqual(strat1(allNumbers.slice(0, 6)), legacy.strat1(allNumbers.slice(0, 6)));
  assert.deepEqual(strat1([49, 1, 25, 48, 2, 47]), legacy.strat1([49, 1, 25, 48, 2, 47]));
  assert.deepEqual(strat2(allNumbers.slice(0, 6)), legacy.strat2(allNumbers.slice(0, 6)));
  for (let bonus = 1; bonus <= 49; bonus++) {
    assert.deepEqual(strat3(bonus), legacy.strat3(bonus), `strat3(${bonus})`);
  }
  assert.equal(hitType(5, [5, 6], [7]), legacy.hitType(5, [5, 6], [7]));
  assert.equal(hitType(7, [5, 6], [7]), legacy.hitType(7, [5, 6], [7]));
  assert.equal(hitType(9, [5, 6], [7]), legacy.hitType(9, [5, 6], [7]));
  assert.equal(hitType(9, [], []), legacy.hitType(9, [], []));
});

function normalizeAcc(acc) {
  const out = {};
  for (const key of ['s1l', 's1t', 's2l', 's2t', 's3l', 's3t']) {
    out[key] = {
      ...acc[key],
      history: acc[key].history.map((h) => ({ hits: h.hits, posHit: h.posHit ?? h.posH })),
    };
  }
  return out;
}

test('computeTrackerStats matches legacy over a realistic draw history', () => {
  const draws = generateDraws(24, 42);
  assert.deepEqual(normalizeAcc(computeTrackerStats(draws)), normalizeAcc(legacy.computeTrackerStats(draws)));
});

test('computeTrackerStats matches legacy with a short, gappy draw history', () => {
  const draws = generateDraws(6, 13);
  assert.deepEqual(normalizeAcc(computeTrackerStats(draws)), normalizeAcc(legacy.computeTrackerStats(draws)));
});

test('nextCalendarDay rolls over month/year boundaries correctly', () => {
  assert.equal(nextCalendarDay('2026-01-31'), '2026-02-01');
  assert.equal(nextCalendarDay('2026-12-31'), '2027-01-01');
  assert.equal(nextCalendarDay('2026-02-28'), '2026-03-01'); // 2026 is not a leap year
});

test('computeCalcResult defaults to the most recent Lunch/Tea and verifies against next-day draws when present', () => {
  const draws = generateDraws(24, 42);
  const result = computeCalcResult(draws);
  assert.ok(result.lunch);
  assert.ok(result.tea);
  assert.equal(result.lunch.s1.length, 6);
  assert.equal(result.tea.s2.length, 6);
  // generateDraws(24, ...) covers 2026-01-01..2026-01-24; no 2026-01-25 exists, so unverified.
  assert.equal(result.lunch.verified, false);
  assert.equal(result.lunch.nextDate, '2026-01-25');
  assert.equal(result.tea.verified, false);
  assert.equal(result.tea.nextDate, '2026-01-25');
});

test('computeCalcResult verifies once a next-day draw is picked as the source', () => {
  const draws = generateDraws(24, 42);
  const earlyLunch = draws.find((d) => d.drawDate === '2026-01-05' && d.drawType === 'lunch');
  const earlyTea = draws.find((d) => d.drawDate === '2026-01-05' && d.drawType === 'tea');
  const result = computeCalcResult(draws, { lunchDrawId: earlyLunch.id, teaDrawId: earlyTea.id });
  assert.equal(result.lunch.nextDate, '2026-01-06');
  assert.equal(result.lunch.verified, true);
  assert.equal(result.tea.nextDate, '2026-01-06');
  assert.equal(result.tea.verified, true);
});

test('computeCalcResult verifies each column against ITS OWN next-day draws when Lunch and Tea sources come from different dates', () => {
  const draws = generateDraws(24, 42);
  const earlyLunch = draws.find((d) => d.drawDate === '2026-01-05' && d.drawType === 'lunch');
  // Tea defaults to the most recent (2026-01-24) - a different date than the Lunch source.
  const result = computeCalcResult(draws, { lunchDrawId: earlyLunch.id });
  assert.equal(result.lunch.nextDate, '2026-01-06');
  assert.equal(result.lunch.verified, true, 'Lunch must be verified against 2026-01-06, not the Tea source date');
  assert.equal(result.tea.nextDate, '2026-01-25');
  assert.equal(result.tea.verified, false);
});

test('computeCalcResult falls back to the most recent draw when an unknown id is given', () => {
  const draws = generateDraws(24, 42);
  const result = computeCalcResult(draws, { lunchDrawId: 'does-not-exist', teaDrawId: 'also-missing' });
  assert.ok(result.lunch);
  assert.ok(result.tea);
  assert.equal(result.lunch.draw.drawDate, '2026-01-24');
  assert.equal(result.tea.draw.drawDate, '2026-01-24');
});
