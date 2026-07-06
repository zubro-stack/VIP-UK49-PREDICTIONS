const test = require('node:test');
const assert = require('node:assert/strict');

const { generateDraws } = require('../fixtures/generate-draws');
const { runPairwiseBacktest } = require('../../src/engines/backtest/pairwise-backtest');
const { runBacktest, BACKTESTABLE_CODES } = require('../../src/engines/backtest');
const { pairwiseEngines } = require('../../src/engines/pairwise');

const draws = generateDraws(24, 42);

test('BACKTESTABLE_CODES covers all 7 pairwise engines plus repeats, v3 and calc', () => {
  Object.keys(pairwiseEngines).forEach((code) => assert.ok(BACKTESTABLE_CODES.includes(code)));
  assert.ok(BACKTESTABLE_CODES.includes('repeats'));
  assert.ok(BACKTESTABLE_CODES.includes('v3'));
  assert.ok(BACKTESTABLE_CODES.includes('calc'));
});

test('runPairwiseBacktest actually detects real hits (not just always zero)', () => {
  const { checkpoints, summary } = runPairwiseBacktest('v1-seq', draws);
  assert.ok(checkpoints.length > 0, 'should produce at least one checkpoint');
  assert.ok(summary.totalPredictions > 0, 'should have made at least one prediction');
  assert.ok(summary.totalHits > 0, 'should have found at least one real hit across the replay');
  assert.ok(summary.totalHits <= summary.totalPredictions);
  assert.ok(summary.overallHitRate >= 0 && summary.overallHitRate <= 1);
  checkpoints.forEach((c) => {
    assert.ok(c.hits <= c.predictionsCount);
    if (c.hitRate != null) assert.ok(c.hitRate >= 0 && c.hitRate <= 1);
  });
});

test('runPairwiseBacktest is consistent across all 7 pairwise engines', () => {
  Object.keys(pairwiseEngines).forEach((code) => {
    const { checkpoints, summary } = runPairwiseBacktest(code, draws);
    assert.ok(summary.totalHits <= summary.totalPredictions, `${code}: hits should never exceed predictions`);
    checkpoints.forEach((c) => assert.ok(c.hits <= c.predictionsCount, `${code}: checkpoint hits <= predictions`));
  });
});

test('runBacktest dispatches to repeats, v3 and calc performance functions', () => {
  const repeats = runBacktest('repeats', draws);
  assert.ok(Array.isArray(repeats.breakdown));
  assert.ok(repeats.summary.totalHits <= repeats.summary.totalPredictions);

  const v3 = runBacktest('v3', draws);
  assert.ok(Array.isArray(v3.breakdown));
  assert.ok(v3.summary.totalHits <= v3.summary.totalPredictions);

  const calc = runBacktest('calc', draws);
  assert.ok(Array.isArray(calc.breakdown));
  assert.equal(calc.breakdown.length, 6);
  assert.ok(calc.summary.totalHits <= calc.summary.totalPredictions);
  assert.ok(calc.summary.totalPredictions > 0);
});

test('runBacktest rejects an engine with no backtest support', () => {
  assert.throws(() => runBacktest('unknown-engine', draws));
});
