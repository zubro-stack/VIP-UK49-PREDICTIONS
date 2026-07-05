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

module.exports = {
  sortDraws,
  byType,
  daysBetween,
  findNextDayTargets,
  findSameDayTarget,
};
