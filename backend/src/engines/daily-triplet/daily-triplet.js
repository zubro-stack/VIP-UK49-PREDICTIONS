const TOTAL_NUMBERS = 49;
const TRIPLET_SIZE = 3;

function binomial(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let r = 1;
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
  return Math.round(r);
}

const TOTAL_TRIPLETS = binomial(TOTAL_NUMBERS, TRIPLET_SIZE); // 18424 distinct 3-number combinations of 1-49

/** Combinatorial unranking: turns a 0-based index into the idx-th 3-combination of 1-49, in lexicographic order. */
function unrank(idx) {
  const combo = [];
  let rem = idx;
  let start = 1;
  for (let i = TRIPLET_SIZE; i >= 1; i--) {
    for (let v = start; v <= TOTAL_NUMBERS - i + 1; v++) {
      const count = binomial(TOTAL_NUMBERS - v, i - 1);
      if (rem < count) {
        combo.push(v);
        start = v + 1;
        break;
      }
      rem -= count;
    }
  }
  return combo;
}

/** Same triplet index for everyone on a given calendar day - rotates daily through all 18424 combinations. */
function getDailyOffset(now = Date.now()) {
  return Math.floor(now / 86400000) % TOTAL_TRIPLETS;
}

/**
 * A user's daily triplet: their permanent slot (assigned once, at account
 * creation) shifted by the day's rotating offset, wrapped into the
 * combination space - the same mechanism as the legacy anonymous version,
 * except the slot is tied to a real user account instead of a per-browser
 * counter in a sandboxed storage API.
 */
function computeDailyTriplet(dailySlot, now = Date.now()) {
  const offset = getDailyOffset(now);
  const tripletIndex = (dailySlot + offset) % TOTAL_TRIPLETS;
  return { triplet: unrank(tripletIndex), offset };
}

module.exports = { binomial, unrank, getDailyOffset, computeDailyTriplet, TOTAL_NUMBERS, TRIPLET_SIZE, TOTAL_TRIPLETS };
