const DEFAULT_MAX_FAIL = 2;
const DEFAULT_MIN_HITS = 2;

/** Consecutive hits counting back from the most recent history entry. */
function currentStreak(history) {
  let n = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].hit) n++;
    else break;
  }
  return n;
}

/** Consecutive misses counting back from the most recent history entry. */
function currentFailStreak(history) {
  let n = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (!history[i].hit) n++;
    else break;
  }
  return n;
}

/**
 * Turns a Map of in-progress pattern records into the final pattern list:
 * computes occurrences/failures/status, and drops patterns that never
 * reached the minimum hit count and aren't already flagged as failed.
 *
 * `minHits` is 2 for standard engines and 1 for bonus engines (the bonus
 * ball is a single number, so hits are rarer and the bar is lower).
 */
function finalizePatterns(map, { maxFail = DEFAULT_MAX_FAIL, minHits = DEFAULT_MIN_HITS } = {}) {
  return Array.from(map.values())
    .map((pattern) => {
      const hits = pattern.history.filter((h) => h.hit).length;
      const failures = currentFailStreak(pattern.history);
      const status = hits < minHits || failures >= maxFail ? 'failed' : failures === 1 ? 'warning' : 'active';
      return { ...pattern, occurrences: hits, failures, status };
    })
    .filter((pattern) => pattern.occurrences >= minHits || pattern.status === 'failed');
}

module.exports = {
  DEFAULT_MAX_FAIL,
  DEFAULT_MIN_HITS,
  currentStreak,
  currentFailStreak,
  finalizePatterns,
};
