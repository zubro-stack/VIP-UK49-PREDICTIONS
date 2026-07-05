const { strat1, strat2, strat3, hitType } = require('./strategies');
const { byType } = require('../core/draw-utils');
const { drawValues } = require('../core/lottery-math');

/** The calendar day after the later of two draw dates (string-only, YYYY-MM-DD, no timezone conversion). */
function nextCalendarDay(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + 1);
  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function classify(predictions, sameValues, otherValues) {
  return predictions.map((n) => ({ value: n, hit: n == null ? 'none' : hitType(n, sameValues, otherValues) }));
}

function computeStrategies(draw) {
  return { draw, s1: strat1(draw.numbers), s2: strat2(draw.numbers), s3: strat3(draw.bonus) };
}

/**
 * Applies the three strategies (strat1/strat2/strat3) to a chosen Lunch
 * and Tea source draw (defaulting to the most recent of each), then
 * verifies the predictions against whatever next-day draws are already
 * recorded - "same" = hit in the next draw of the same type, "other" =
 * hit in the next draw of the other type, "none" = no verification data
 * yet. Also reports the same-day Lunch-to-Tea strategy (no day offset).
 */
function computeCalcResult(draws, { lunchDrawId, teaDrawId } = {}) {
  const lunchDraws = byType(draws, 'lunch').slice().sort((a, b) => (a.drawDate < b.drawDate ? 1 : -1));
  const teaDraws = byType(draws, 'tea').slice().sort((a, b) => (a.drawDate < b.drawDate ? 1 : -1));

  const selectedLunch = (lunchDrawId ? lunchDraws.find((d) => d.id === lunchDrawId) : lunchDraws[0]) ?? null;
  const selectedTea = (teaDrawId ? teaDraws.find((d) => d.id === teaDrawId) : teaDraws[0]) ?? null;
  if (!selectedLunch && !selectedTea) return null;

  const lunch = selectedLunch ? computeStrategies(selectedLunch) : null;
  const tea = selectedTea ? computeStrategies(selectedTea) : null;

  const sourceDate = selectedLunch && selectedTea
    ? (selectedLunch.drawDate > selectedTea.drawDate ? selectedLunch.drawDate : selectedTea.drawDate)
    : (selectedLunch ?? selectedTea).drawDate;
  const nextDate = nextCalendarDay(sourceDate);
  const nextLunch = draws.find((d) => d.drawDate === nextDate && d.drawType === 'lunch') ?? null;
  const nextTea = draws.find((d) => d.drawDate === nextDate && d.drawType === 'tea') ?? null;
  const sameDayTea = selectedLunch
    ? draws.find((d) => d.drawDate === selectedLunch.drawDate && d.drawType === 'tea') ?? null
    : null;

  const nextLunchValues = nextLunch ? drawValues(nextLunch) : [];
  const nextTeaValues = nextTea ? drawValues(nextTea) : [];
  const sameDayTeaValues = sameDayTea ? drawValues(sameDayTea) : [];
  const verified = Boolean(nextLunch || nextTea);

  return {
    lunch: lunch && {
      draw: lunch.draw,
      s1: classify(lunch.s1, nextLunchValues, nextTeaValues),
      s2: classify(lunch.s2, nextLunchValues, nextTeaValues),
      s3: classify(lunch.s3, nextLunchValues, nextTeaValues),
      sameDay: {
        s1: classify(lunch.s1, sameDayTeaValues, []),
        s2: classify(lunch.s2, sameDayTeaValues, []),
        s3: classify(lunch.s3, sameDayTeaValues, []),
      },
    },
    tea: tea && {
      draw: tea.draw,
      s1: classify(tea.s1, nextTeaValues, nextLunchValues),
      s2: classify(tea.s2, nextTeaValues, nextLunchValues),
      s3: classify(tea.s3, nextTeaValues, nextLunchValues),
    },
    nextDate,
    nextLunch,
    nextTea,
    sameDayTea,
    verified,
  };
}

module.exports = { computeCalcResult, nextCalendarDay };
