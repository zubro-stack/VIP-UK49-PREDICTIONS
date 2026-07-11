const DRAW_TYPE_ORDER = { lunch: 0, tea: 1 };

function sortDraws(draws) {
  return draws.slice().sort((a, b) => {
    const d = new Date(a.drawDate) - new Date(b.drawDate);
    if (d !== 0) return d;
    return DRAW_TYPE_ORDER[a.drawType] - DRAW_TYPE_ORDER[b.drawType];
  });
}

function byType(draws, drawType) {
  return draws.filter((d) => d.drawType === drawType);
}

function daysBetween(fromDraw, toDraw) {
  return Math.round((new Date(toDraw.drawDate) - new Date(fromDraw.drawDate)) / 86400000);
}

/** All draws (any type) exactly one calendar day after the anchor draw. */
function findNextDayTargets(sortedDraws, anchorDraw) {
  return sortedDraws.filter((d) => daysBetween(anchorDraw, d) === 1);
}

/** The draw of `targetType` on the same calendar day as the anchor draw. */
function findSameDayTarget(sortedDraws, anchorDraw, targetType) {
  return sortedDraws.find((d) => d.drawType === targetType && d.drawDate === anchorDraw.drawDate) || null;
}

/** The most recent draw of a given type, or null if none exists yet. */
function latestOfType(sortedDraws, drawType) {
  return sortedDraws.slice().reverse().find((d) => d.drawType === drawType) || null;
}

/** The two most recent draws of a given type as [mostRecent, previous], or null if fewer than 2 exist. */
function latestTwoOfType(sortedDraws, drawType) {
  const typed = byType(sortedDraws, drawType).slice().reverse();
  return typed.length >= 2 ? [typed[0], typed[1]] : null;
}

/**
 * The latest Lunch draw and the latest Tea draw, found independently - NOT
 * guaranteed to be from the same calendar day (e.g. if today's Lunch is in
 * but today's Tea hasn't been entered yet, this pairs today's Lunch with
 * yesterday's Tea). This matches the legacy engine's own live-card builder
 * verbatim (`rev.find(lunch)` / `rev.find(tea)`, independently) - the
 * historical discover() pass enforces strict same-day pairing via
 * findSameDayTarget, but the live "current prediction" card intentionally
 * does not.
 */
function latestLunchTeaPair(sortedDraws) {
  const lunch = latestOfType(sortedDraws, 'lunch');
  const tea = latestOfType(sortedDraws, 'tea');
  return lunch && tea ? { lunch, tea } : null;
}

/**
 * Groups (already sorted) draws by calendar date, preserving date order.
 * Returns { dayMap, dayList } - dayMap maps a date string to its draws
 * (Lunch/Tea, in sorted order), dayList is the ordered list of dates.
 */
function groupByDay(sortedDraws) {
  const dayMap = new Map();
  const dayList = [];
  sortedDraws.forEach((d) => {
    if (!dayMap.has(d.drawDate)) {
      dayMap.set(d.drawDate, []);
      dayList.push(d.drawDate);
    }
    dayMap.get(d.drawDate).push(d);
  });
  return { dayMap, dayList };
}

module.exports = {
  sortDraws,
  byType,
  daysBetween,
  findNextDayTargets,
  findSameDayTarget,
  latestOfType,
  latestTwoOfType,
  latestLunchTeaPair,
  groupByDay,
};
