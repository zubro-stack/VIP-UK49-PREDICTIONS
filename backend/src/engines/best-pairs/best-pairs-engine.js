const { NUMBER_GROUPS } = require('../v3/chart');

const MAX_SELECTED_NUMBERS = 14;

/** All k-length combinations of arr, order-preserving (index-based, no repeats). */
function kCombos(arr, k) {
  const result = [];
  function helper(start, combo) {
    if (combo.length === k) {
      result.push(combo.slice());
      return;
    }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      helper(i + 1, combo);
      combo.pop();
    }
  }
  helper(0, []);
  return result;
}

function comboKey(arr) {
  return arr.slice().sort((a, b) => a - b).join('-');
}

/**
 * Given a user-chosen set of numbers, finds every k-sized combination of
 * them that appears together on at least one chart line - "these numbers
 * have historically clustered on the same line" is the heuristic. Combos
 * backed by more lines rank higher.
 */
function findBestCombos(userNumbers, k) {
  const seen = new Map();
  const results = [];

  NUMBER_GROUPS.forEach((line, lineIdx) => {
    const matching = line.filter((n) => userNumbers.includes(n));
    if (matching.length < k) return;
    kCombos(matching, k).forEach((combo) => {
      const key = comboKey(combo);
      if (!seen.has(key)) {
        const entry = { combo: combo.slice().sort((a, b) => a - b), lines: [], lineIdxs: [] };
        seen.set(key, entry);
        results.push(entry);
      }
      const entry = seen.get(key);
      entry.lines.push(line);
      entry.lineIdxs.push(lineIdx);
    });
  });

  results.sort((a, b) => {
    if (b.lines.length !== a.lines.length) return b.lines.length - a.lines.length;
    for (let i = 0; i < a.combo.length; i++) {
      if (a.combo[i] !== b.combo[i]) return a.combo[i] - b.combo[i];
    }
    return 0;
  });

  return results;
}

module.exports = { kCombos, comboKey, findBestCombos, MAX_SELECTED_NUMBERS };
