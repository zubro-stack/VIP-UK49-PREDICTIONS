const test = require('node:test');
const assert = require('node:assert/strict');

const { generateDraws } = require('../fixtures/generate-draws');
const legacy = require('./legacy-reference');
const { sortDraws } = require('../../src/engines/core/draw-utils');
const { analyzeZones } = require('../../src/engines/v3/zone-analysis');
const { computeRemainders } = require('../../src/engines/v3/remainders');
const { computePairsTripletsPerformance } = require('../../src/engines/v3/locked-sets');
const { computeHotNumbers, computeHotNumbersPerformance } = require('../../src/engines/v3/hot-numbers');
const { computeChartPredictions } = require('../../src/engines/v3/chart-predictions');
const { computeCommonNumbers } = require('../../src/engines/v3/common-numbers');
const { collectCrossEnginePredictions } = require('../../src/engines/v3/cross-engine-predictions');

const draws = generateDraws(24, 42);
const sorted = sortDraws(draws);

function sortNums(arr) { return arr.slice().sort((a, b) => a - b); }

test('analyzeZones matches legacy zA', () => {
  const actual = analyzeZones(sorted);
  const expected = legacy.zA(sorted);
  const norm = (r, predsKey) => ({
    predictions: r[predsKey].map((p) => ({ num: p.num, score: p.sc ?? p.score, bestPriority: p.bp ?? p.bestPriority })).sort((a, b) => a.num - b.num),
    tierCounts: { 1: (r.tiers[1] || []).length, 2: (r.tiers[2] || []).length, 3: (r.tiers[3] || []).length },
  });
  assert.deepEqual(norm(actual, 'predictions'), norm(expected, 'preds'));
});

test('computeRemainders matches legacy remainders computation', () => {
  const actual = computeRemainders(sorted);
  const expected = legacy.remaindersCompute(sorted);
  const norm = (r) => ({
    pairs: r.pairs.map((p) => ({ remaining: p.remaining, backingCount: p.backingCount, earliestWin: p.earliestWin })),
    triplets: r.triplets.map((p) => ({ remaining: p.remaining, backingCount: p.backingCount, earliestWin: p.earliestWin })),
  });
  assert.deepEqual(norm(actual), norm(expected));
});

test('computePairsTripletsPerformance matches legacy ptHist', () => {
  const actual = computePairsTripletsPerformance(sorted);
  const expected = legacy.ptHist(sorted);
  const norm = (r) => ({
    pairRows: r.pairRows.map((row) => ({ drawDate: row.drawDate, total: row.total, hitCount: row.hits.length })),
    tripletRows: r.tripletRows.map((row) => ({ drawDate: row.drawDate, total: row.total, hitCount: row.hits.length })),
  });
  assert.deepEqual(norm(actual), norm(expected));
});

test('collectCrossEnginePredictions matches legacy collectAllPreds', () => {
  const actual = collectCrossEnginePredictions(draws);
  const expected = legacy.collectAllPreds(draws);
  assert.deepEqual(sortNums(actual.seq), sortNums(expected.seq));
  assert.deepEqual(sortNums(actual.fam), sortNums(expected.fam));
  assert.deepEqual(sortNums(actual.v2), sortNums(expected.v2));
});

test('computeHotNumbers matches legacy hot memo', () => {
  const actual = computeHotNumbers(sorted);
  const expected = legacy.hotMemo(sorted);
  const norm = (arr, numKey, srcKey) => arr.map((x) => ({ num: x[numKey], sources: x[srcKey].slice().sort() })).sort((a, b) => a.num - b.num);
  assert.deepEqual(norm(actual, 'num', 'sources'), norm(expected, 'n', 'src'));
});

test('computeHotNumbersPerformance matches legacy hitsHist', () => {
  const actual = computeHotNumbersPerformance(sorted);
  const expected = legacy.hitsHist(sorted);
  const norm = (r) => r.map((row) => ({ drawDate: row.drawDate, totalHot: row.totalHot, hits: sortNums(row.hits) }));
  assert.deepEqual(norm(actual), norm(expected));
});

test('computeChartPredictions matches legacy chart predictions from hot numbers', () => {
  const hot = computeHotNumbers(sorted);
  const legacyHot = legacy.hotMemo(sorted);
  const actual = computeChartPredictions(hot);
  const expected = legacy.chartPredsFromHot(legacyHot);
  const norm = (r) => r.map((m) => ({ group: m.group, count: m.count, missing: sortNums(m.missing) }));
  assert.deepEqual(norm(actual), norm(expected));
});

test('computeCommonNumbers matches legacy common numbers', () => {
  const preds = collectCrossEnginePredictions(draws);
  const legacyPreds = legacy.collectAllPreds(draws);
  const actual = computeCommonNumbers(preds);
  const expected = legacy.commonNumsFromPreds(legacyPreds);
  const norm = (r, numKey) => r.map((x) => ({ num: x[numKey], sources: x.v1Sources.slice().sort() }));
  assert.deepEqual(norm(actual, 'num'), norm(expected, 'n'));
});
