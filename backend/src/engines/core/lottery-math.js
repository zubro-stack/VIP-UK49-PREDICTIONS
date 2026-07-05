/**
 * Equivalence pairs used by the UK49s community "mirror number" heuristic
 * (e.g. 1 and 10 are treated as interchangeable when checking for a hit).
 */
const EQUIVALENCE_PAIRS = [
  [1, 10], [2, 20], [3, 30], [4, 40], [6, 9],
  [12, 21], [13, 31], [14, 41], [16, 19],
  [23, 32], [24, 42], [26, 29], [34, 43], [36, 39], [46, 49],
];

function getEquivalent(n) {
  for (const [a, b] of EQUIVALENCE_PAIRS) {
    if (a === n) return b;
    if (b === n) return a;
  }
  return null;
}

function isEquivalent(a, b) {
  if (a === b) return true;
  return EQUIVALENCE_PAIRS.some(([p, q]) => (p === a && q === b) || (q === a && p === b));
}

function drawValues(draw) {
  return draw.numbers.concat([draw.bonus]);
}

function containsEquivalent(num, draw) {
  return drawValues(draw).some((n) => isEquivalent(num, n));
}

function containsDirect(num, draw) {
  return drawValues(draw).includes(num);
}

function computeSum(a, b) {
  return a + b;
}

function computeDiff(a, b) {
  return Math.abs(a - b);
}

function isValidPrediction(n) {
  return n >= 1 && n <= 49;
}

/**
 * Default transform: a raw sum/diff is only ever "one" prediction, kept
 * only if it lands in the playable 1-49 range.
 */
function identityTransform(raw) {
  return isValidPrediction(raw) ? [raw] : [];
}

/**
 * Bonus-engine transform: sums that overflow past 49 are digit-shifted back
 * into range instead of discarded (e.g. 73 -> 37, 55 -> 5), since the bonus
 * ball is a single 1-49 number and the community heuristic folds overflow
 * digits rather than dropping the prediction entirely.
 */
function bonusDigitShiftTransform(raw) {
  if (raw < 1) return [];
  if (raw <= 49) return [raw];
  const d1 = Math.floor(raw / 10);
  const d2 = raw % 10;
  if (d1 === d2) return d1 >= 1 ? [d1] : [];
  const reversed = d2 * 10 + d1;
  if (reversed >= 1 && reversed <= 49) return [reversed];
  const out = [];
  if (d1 >= 1) out.push(d1);
  if (d2 >= 1) out.push(d2);
  return [...new Set(out)].sort((a, b) => a - b);
}

module.exports = {
  EQUIVALENCE_PAIRS,
  getEquivalent,
  isEquivalent,
  drawValues,
  containsEquivalent,
  containsDirect,
  computeSum,
  computeDiff,
  isValidPrediction,
  identityTransform,
  bonusDigitShiftTransform,
};
