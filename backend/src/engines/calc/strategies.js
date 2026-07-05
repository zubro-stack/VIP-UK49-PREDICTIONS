/**
 * Three deterministic per-position transforms applied to a single draw
 * (not a pair of draws like the pairwise engines) - each produces one
 * predicted number per input position, or null where the transform falls
 * outside the playable 1-49 range.
 */

/** Double each number, fold back into 1-49, then add its position index, fold again. */
function strat1(numbers) {
  return numbers.map((n, i) => {
    let v = n * 2;
    if (v > 49) v -= 50;
    if (v > 49) v -= 50;
    v += i;
    if (v > 49) v -= 50;
    if (v > 49) v -= 50;
    if (v < 1) v += 50;
    if (v > 49) return null;
    return v;
  });
}

/** Subtract 5 from each number, folding under 1 back into range. */
function strat2(numbers) {
  return numbers.map((n) => {
    let v = n - 5;
    if (v < 1) v += 50;
    if (v > 49) return null;
    return v;
  });
}

/**
 * Folds the bonus ball's digits into a single seed (e.g. 73 -> 7+3=10 -> 2
 * since 10>=10 subtracts 8), then generates every 8th number from that
 * seed up to 49.
 */
function strat3(bonus) {
  let f;
  if (bonus <= 9) {
    f = bonus;
  } else {
    const s = Math.floor(bonus / 10) + (bonus % 10);
    f = s >= 10 ? s - 8 : s;
  }
  const seq = [];
  for (let v = f; v <= 49; v += 8) seq.push(v);
  return seq;
}

/** Classifies a predicted number against the two possible verification targets. */
function hitType(num, same, other) {
  if (same && same.includes(num)) return 'same';
  if (other && other.includes(num)) return 'other';
  if ((!same || !same.length) && (!other || !other.length)) return 'none';
  return 'miss';
}

module.exports = { strat1, strat2, strat3, hitType };
