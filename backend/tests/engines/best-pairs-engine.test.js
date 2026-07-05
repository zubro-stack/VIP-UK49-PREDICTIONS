const test = require('node:test');
const assert = require('node:assert/strict');

const { NUMBER_GROUPS } = require('../../src/engines/v3/chart');
const { kCombos, comboKey, findBestCombos } = require('../../src/engines/best-pairs/best-pairs-engine');

// Verbatim port of the legacy kCombos/comboKey/findBestCombos (lines 2240-2279),
// used only as a regression oracle.
function legacyKCombos(arr, k) {
  const result = [];
  function helper(start, combo) {
    if (combo.length === k) { result.push(combo.slice()); return; }
    for (let i = start; i < arr.length; i++) { combo.push(arr[i]); helper(i + 1, combo); combo.pop(); }
  }
  helper(0, []);
  return result;
}
function legacyComboKey(arr) { return arr.slice().sort((a, b) => a - b).join('-'); }
function legacyFindBestCombos(userNums, k) {
  const results = [];
  const seen = {};
  NUMBER_GROUPS.forEach((line, lineIdx) => {
    const matching = line.filter((n) => userNums.indexOf(n) !== -1);
    if (matching.length < k) return;
    legacyKCombos(matching, k).forEach((combo) => {
      const key = legacyComboKey(combo);
      if (!seen[key]) { seen[key] = { combo: combo.slice().sort((a, b) => a - b), lines: [], lineIdxs: [] }; results.push(seen[key]); }
      seen[key].lines.push(line);
      seen[key].lineIdxs.push(lineIdx);
    });
  });
  results.sort((a, b) => {
    if (b.lines.length !== a.lines.length) return b.lines.length - a.lines.length;
    for (let i = 0; i < a.combo.length; i++) if (a.combo[i] !== b.combo[i]) return a.combo[i] - b.combo[i];
    return 0;
  });
  return results;
}

test('kCombos matches legacy for a representative set', () => {
  assert.deepEqual(kCombos([1, 2, 3, 4], 2), legacyKCombos([1, 2, 3, 4], 2));
  assert.deepEqual(kCombos([5, 6, 7], 3), legacyKCombos([5, 6, 7], 3));
});

test('comboKey matches legacy', () => {
  assert.equal(comboKey([3, 1, 2]), legacyComboKey([3, 1, 2]));
});

test('findBestCombos matches legacy for pairs, triplets and quadruplets', () => {
  const userNumbers = [1, 2, 3, 4, 7, 11, 12, 5, 19, 42, 20, 48, 49];
  for (const k of [2, 3, 4]) {
    const actual = findBestCombos(userNumbers, k).map((r) => ({ combo: r.combo, backingCount: r.lines.length }));
    const expected = legacyFindBestCombos(userNumbers, k).map((r) => ({ combo: r.combo, backingCount: r.lines.length }));
    assert.deepEqual(actual, expected);
  }
});
