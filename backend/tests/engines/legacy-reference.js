/**
 * Verbatim port of the discovery logic from the legacy monolith
 * (remixed-544b6f74.html, lines ~350-610), field-renamed from `date` to
 * `drawDate` for consistency with the new draw shape. This file exists
 * ONLY as a regression oracle: the new engines under src/engines/pairwise
 * must produce equivalent output, proving the extraction didn't change
 * behaviour.
 */
const SC = {
  MAX_DRAWS: 10,
  MAX_FAIL: 2,
  EQ: [[1, 10], [2, 20], [3, 30], [4, 40], [6, 9], [12, 21], [13, 31], [14, 41], [16, 19], [23, 32], [24, 42], [26, 29], [34, 43], [36, 39], [46, 49]],
  SEQ: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]],
  ALL: (() => { const p = []; for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) p.push([i, j]); return p; })(),
};

function eqv(a, b) {
  if (a === b) return true;
  return SC.EQ.some((p) => (p[0] === a && p[1] === b) || (p[1] === a && p[0] === b));
}
function inD(num, draw) { return draw.numbers.concat([draw.bonus]).some((n) => eqv(num, n)); }
function inDirect(num, draw) { return draw.numbers.concat([draw.bonus]).some((n) => n === num); }
function sortD(arr) {
  return arr.slice().sort((a, b) => {
    const d = new Date(a.drawDate) - new Date(b.drawDate);
    return d !== 0 ? d : (a.drawType === 'lunch' ? -1 : 1);
  });
}
function cF(h) { let n = 0; for (let i = h.length - 1; i >= 0; i--) { if (!h[i].hit) n++; else break; } return n; }
function finalize(map) {
  return Array.from(map.values()).map((p) => {
    const hits = p.history.filter((x) => x.hit).length;
    const cf = cF(p.history);
    const status = (hits < 2 || cf >= SC.MAX_FAIL) ? 'failed' : cf === 1 ? 'warning' : 'active';
    return { ...p, occurrences: hits, failures: cf, status };
  }).filter((p) => p.history.filter((x) => x.hit).length >= 2 || p.status === 'failed');
}

function discoverSeq(draws) {
  const sorted = sortD(draws).slice(-SC.MAX_DRAWS);
  const map = new Map();
  for (let di = 0; di < sorted.length; di++) {
    const draw = sorted[di];
    const nums = draw.numbers.concat([draw.bonus]);
    const tgts = sorted.filter((d) => Math.round((new Date(d.drawDate) - new Date(draw.drawDate)) / 86400000) === 1);
    if (!tgts.length) continue;
    for (const [i, j] of SC.SEQ) {
      const n1 = nums[i], n2 = nums[j];
      const ap = n1 + n2, sp = Math.abs(n1 - n2);
      const va = ap >= 1 && ap <= 49, vs = sp >= 1 && sp <= 49 && sp !== 0;
      if (!va && !vs) continue;
      const ah = va && tgts.some((t) => inD(ap, t));
      const sh = vs && tgts.some((t) => inD(sp, t));
      const key = `${draw.drawType}|${i}|${j}`;
      if (!map.has(key)) map.set(key, { id: key, drawType: draw.drawType, p1: i, p2: j, history: [] });
      map.get(key).history.push({
        drawDate: draw.drawDate, v1: n1, v2: n2, addPred: va ? ap : null, subPred: vs ? sp : null,
        addHit: ah, subHit: sh, hit: ah || sh,
        addDirectHit: va && tgts.some((t) => inDirect(ap, t)),
        subDirectHit: vs && tgts.some((t) => inDirect(sp, t)),
      });
    }
  }
  return finalize(map);
}

function discoverFam(draws) {
  const sorted = sortD(draws).slice(-SC.MAX_DRAWS);
  const map = new Map();
  for (const type of ['lunch', 'tea']) {
    const td = sorted.filter((d) => d.drawType === type);
    for (let k = 1; k < td.length; k++) {
      const recent = td[k], prev = td[k - 1];
      const tgts = sorted.filter((d) => Math.round((new Date(d.drawDate) - new Date(recent.drawDate)) / 86400000) === 1);
      if (!tgts.length) continue;
      const rN = recent.numbers.concat([recent.bonus]);
      const pN = prev.numbers.concat([prev.bonus]);
      for (const [ri, pi] of SC.ALL) {
        const n1 = rN[ri], n2 = pN[pi];
        const ap = n1 + n2, sp = Math.abs(n1 - n2);
        const va = ap >= 1 && ap <= 49, vs = sp >= 1 && sp <= 49 && sp !== 0;
        if (!va && !vs) continue;
        const ah = va && tgts.some((t) => inD(ap, t));
        const sh = vs && tgts.some((t) => inD(sp, t));
        const key = `fam|${type}|${ri}|${pi}`;
        if (!map.has(key)) map.set(key, { id: key, drawType: type, rp: ri, pp: pi, history: [] });
        map.get(key).history.push({
          drawDate: recent.drawDate, nextDate: tgts[0].drawDate, rv: n1, pv: n2,
          addPred: va ? ap : null, subPred: vs ? sp : null, addHit: ah, subHit: sh, hit: ah || sh,
          addDirectHit: va && tgts.some((t) => inDirect(ap, t)),
          subDirectHit: vs && tgts.some((t) => inDirect(sp, t)),
        });
      }
    }
  }
  return finalize(map);
}

function discoverV2(draws) {
  const sorted = sortD(draws).slice(-SC.MAX_DRAWS);
  const map = new Map();
  const ld = sorted.filter((d) => d.drawType === 'lunch');
  for (const L of ld) {
    const T = sorted.find((d) => d.drawType === 'tea' && d.drawDate === L.drawDate);
    if (!T) continue;
    const lN = L.numbers.concat([L.bonus]), tN = T.numbers.concat([T.bonus]);
    const tgts = sorted.filter((d) => Math.round((new Date(d.drawDate) - new Date(L.drawDate)) / 86400000) === 1);
    if (!tgts.length) continue;
    for (let lp = 0; lp < 7; lp++) {
      for (let tp = 0; tp < 7; tp++) {
        const n1 = lN[lp], n2 = tN[tp], ap = n1 + n2, sp = Math.abs(n1 - n2);
        const va = ap >= 1 && ap <= 49, vs = sp >= 1 && sp <= 49 && sp !== 0;
        if (!va && !vs) continue;
        const ah = va && tgts.some((t) => inD(ap, t));
        const sh = vs && tgts.some((t) => inD(sp, t));
        const key = `${lp}|${tp}`;
        if (!map.has(key)) map.set(key, { id: key, lp, tp, history: [] });
        map.get(key).history.push({
          drawDate: L.drawDate, lVal: n1, tVal: n2, addPred: va ? ap : null, subPred: vs ? sp : null,
          addHit: ah, subHit: sh, hit: ah || sh,
          addDirectHit: va && tgts.some((t) => inDirect(ap, t)),
          subDirectHit: vs && tgts.some((t) => inDirect(sp, t)),
        });
      }
    }
  }
  return finalize(map);
}

function discoverSameDay(draws) {
  const sorted = sortD(draws).slice(-SC.MAX_DRAWS);
  const map = new Map();
  const dateMap = {};
  sorted.forEach((d) => { if (!dateMap[d.drawDate]) dateMap[d.drawDate] = {}; dateMap[d.drawDate][d.drawType] = d; });
  Object.keys(dateMap).forEach((drawDate) => {
    const L = dateMap[drawDate].lunch, T = dateMap[drawDate].tea;
    if (!L || !T) return;
    const nums = L.numbers.concat([L.bonus]);
    for (const [pi, pj] of SC.ALL) {
      if (pj <= pi) continue;
      const n1 = nums[pi], n2 = nums[pj];
      const ap = n1 + n2, sp = Math.abs(n1 - n2);
      const va = ap >= 1 && ap <= 49, vs = sp >= 1 && sp <= 49 && sp !== 0;
      if (!va && !vs) continue;
      const ah = va && inD(ap, T), sh = vs && inD(sp, T);
      const key = `sd|${pi}|${pj}`;
      if (!map.has(key)) map.set(key, { id: key, p1: pi, p2: pj, history: [] });
      map.get(key).history.push({ drawDate, v1: n1, v2: n2, addPred: va ? ap : null, subPred: vs ? sp : null, addHit: ah, subHit: sh, hit: ah || sh });
    }
  });
  return finalize(map);
}

function bonusNums(raw) {
  if (raw < 1) return [];
  if (raw <= 49) return [raw];
  const d1 = Math.floor(raw / 10), d2 = raw % 10;
  if (d1 === d2) return d1 >= 1 ? [d1] : [];
  const rev = d2 * 10 + d1;
  if (rev >= 1 && rev <= 49) return [rev];
  const out = [];
  if (d1 >= 1) out.push(d1);
  if (d2 >= 1) out.push(d2);
  return [...new Set(out)].sort((a, b) => a - b);
}
function finalizeBonus(map) {
  return Array.from(map.values()).map((p) => {
    const hits = p.history.filter((x) => x.hit).length;
    const cf = cF(p.history);
    const status = (hits < 1 || cf >= SC.MAX_FAIL) ? 'failed' : cf === 1 ? 'warning' : 'active';
    return { ...p, occurrences: hits, failures: cf, status };
  }).filter((p) => p.history.filter((x) => x.hit).length >= 1 || p.status === 'failed');
}

function discoverBonusSeq(draws) {
  const sorted = sortD(draws).slice(-SC.MAX_DRAWS);
  const map = new Map();
  for (const draw of sorted) {
    const nums = draw.numbers.concat([draw.bonus]);
    const tgts = sorted.filter((d) => Math.round((new Date(d.drawDate) - new Date(draw.drawDate)) / 86400000) === 1);
    if (!tgts.length) continue;
    for (const [i, j] of SC.SEQ) {
      const n1 = nums[i], n2 = nums[j];
      const addPs = bonusNums(n1 + n2);
      const sp = Math.abs(n1 - n2);
      const subPs = sp >= 1 ? [sp] : [];
      if (!addPs.length && !subPs.length) continue;
      const ah = addPs.some((ap) => tgts.some((t) => eqv(ap, t.bonus)));
      const sh = subPs.some((sp2) => tgts.some((t) => eqv(sp2, t.bonus)));
      const key = `${draw.drawType}|bseq|${i}|${j}`;
      if (!map.has(key)) map.set(key, { id: key, drawType: draw.drawType, p1: i, p2: j, history: [] });
      map.get(key).history.push({ drawDate: draw.drawDate, v1: n1, v2: n2, addPreds: addPs, subPreds: subPs, addHit: ah, subHit: sh, hit: ah || sh });
    }
  }
  return finalizeBonus(map);
}

function discoverBonusFam(draws) {
  const sorted = sortD(draws).slice(-SC.MAX_DRAWS);
  const map = new Map();
  for (const type of ['lunch', 'tea']) {
    const td = sorted.filter((d) => d.drawType === type);
    for (let k = 1; k < td.length; k++) {
      const recent = td[k], prev = td[k - 1], next = td[k + 1];
      if (!next) continue;
      const rN = recent.numbers.concat([recent.bonus]);
      const pN = prev.numbers.concat([prev.bonus]);
      for (const [ri, pi2] of SC.ALL) {
        const n1 = rN[ri], n2 = pN[pi2];
        const addPs = bonusNums(n1 + n2);
        const sp = Math.abs(n1 - n2);
        const subPs = sp >= 1 ? [sp] : [];
        if (!addPs.length && !subPs.length) continue;
        const ah = addPs.some((ap) => eqv(ap, next.bonus));
        const sh = subPs.some((sp2) => eqv(sp2, next.bonus));
        const key = `bfam|${type}|${ri}|${pi2}`;
        if (!map.has(key)) map.set(key, { id: key, drawType: type, rp: ri, pp: pi2, history: [] });
        map.get(key).history.push({ drawDate: recent.drawDate, nextDate: next.drawDate, rv: n1, pv: n2, addPreds: addPs, subPreds: subPs, addHit: ah, subHit: sh, hit: ah || sh });
      }
    }
  }
  return finalizeBonus(map);
}

function discoverBonusV2(draws) {
  const sorted = sortD(draws).slice(-SC.MAX_DRAWS);
  const map = new Map();
  const ld = sorted.filter((d) => d.drawType === 'lunch');
  for (const L of ld) {
    const T = sorted.find((d) => d.drawType === 'tea' && d.drawDate === L.drawDate);
    if (!T) continue;
    const lN = L.numbers.concat([L.bonus]);
    const tN = T.numbers.concat([T.bonus]);
    const tgts = sorted.filter((d) => Math.round((new Date(d.drawDate) - new Date(L.drawDate)) / 86400000) === 1);
    if (!tgts.length) continue;
    for (let lp = 0; lp < 7; lp++) {
      for (let tp = 0; tp < 7; tp++) {
        const n1 = lN[lp], n2 = tN[tp];
        const addPs = bonusNums(n1 + n2);
        const sp = Math.abs(n1 - n2);
        const subPs = sp >= 1 ? [sp] : [];
        if (!addPs.length && !subPs.length) continue;
        const ah = addPs.some((ap) => tgts.some((t) => eqv(ap, t.bonus)));
        const sh = subPs.some((sp2) => tgts.some((t) => eqv(sp2, t.bonus)));
        const key = `bv2|${lp}|${tp}`;
        if (!map.has(key)) map.set(key, { id: key, lp, tp, history: [] });
        map.get(key).history.push({ drawDate: L.drawDate, lVal: n1, tVal: n2, addPreds: addPs, subPreds: subPs, addHit: ah, subHit: sh, hit: ah || sh });
      }
    }
  }
  return finalizeBonus(map);
}

function cW(h) { let n = 0; for (let i = h.length - 1; i >= 0; i--) { if (h[i].hit) n++; else break; } return n; }

function buildSeqCards(draws, pats) {
  const rev = sortD(draws).slice().reverse();
  const lL = rev.find((d) => d.drawType === 'lunch');
  const lT = rev.find((d) => d.drawType === 'tea');
  if (!lL && !lT) return [];
  const l10 = new Set(sortD(draws).slice(-SC.MAX_DRAWS).map((d) => d.drawDate));
  return pats
    .filter((p) => p.status === 'active' && p.history.filter((x) => x.hit).length >= 2 && p.history.some((x) => l10.has(x.drawDate) && x.hit))
    .map((pat) => {
      const src = pat.drawType === 'lunch' ? lL : lT;
      if (!src) return null;
      const nums = src.numbers.concat([src.bonus]);
      const n1 = nums[pat.p1], n2 = nums[pat.p2];
      const ap = n1 + n2, sp = Math.abs(n1 - n2);
      const lastHit = pat.history.length > 0 ? !!pat.history[pat.history.length - 1].hit : false;
      const hasDirectHit = pat.history.some((x) => x.addDirectHit || x.subDirectHit);
      return {
        id: pat.id, drawType: pat.drawType, p1: pat.p1, p2: pat.p2, v1: n1, v2: n2, srcDate: src.drawDate,
        addPred: ap >= 1 && ap <= 49 ? ap : null, subPred: sp >= 1 && sp <= 49 && sp !== 0 ? sp : null,
        totalHits: pat.history.filter((x) => x.hit).length, streak: cW(pat.history),
        last5: pat.history.filter((x) => x.hit).slice(-5).reverse(), failures: pat.failures,
        lastHit, hasDirectHit,
      };
    })
    .filter((c) => c && c.streak >= 2)
    .sort((a, b) => {
      if (a.hasDirectHit !== b.hasDirectHit) return a.hasDirectHit ? -1 : 1;
      if (a.lastHit !== b.lastHit) return a.lastHit ? -1 : 1;
      return b.streak - a.streak || b.totalHits - a.totalHits;
    });
}

const RW = 10;

function normalizeForRepeats(arr) {
  return arr.map((d) => {
    const nums = (d.numbers || []).slice();
    if (d.bonus != null && nums.indexOf(d.bonus) === -1) nums.push(d.bonus);
    return { nums, drawDate: d.drawDate, drawType: d.drawType };
  });
}

function computeRepeats(draws) {
  if (!draws || draws.length < 3) return { predictions: [], history: {} };
  const window = draws.slice(-RW);
  const n = window.length;
  if (n < 3) return { predictions: [], history: {} };
  const sets = window.map((d) => { const s = {}; const nums = d.nums || d.numbers || []; nums.forEach((x) => { s[x] = 1; }); return s; });
  const allNums = {};
  sets.forEach((s) => Object.keys(s).forEach((k) => { allNums[k] = 1; }));
  const numsList = Object.keys(allNums).map(Number);
  const history = {};
  let predictions = [];
  numsList.forEach((num) => {
    const completed = [];
    let i = 0;
    while (i <= n - 3) {
      if (!sets[i][num]) { i++; continue; }
      const A = i, B = i + 1, C = i + 2, D = i + 3;
      const hitB = !!sets[B][num];
      const hitC = !!sets[C][num];
      let pattern = null;
      if (!hitB && hitC) pattern = 'A';
      else if (hitB && !hitC) pattern = 'B';
      if (pattern) {
        if (D < n) {
          completed.push({ hitD: !!sets[D][num], pattern });
          i = D + 1;
          continue;
        } else {
          predictions.push({ num, pattern, aIdx: A, bIdx: B, cIdx: C });
          i = n;
          break;
        }
      }
      i++;
    }
    history[num] = completed;
  });
  predictions = predictions.map((p) => {
    const hArr = history[p.num] || [];
    const total = hArr.length;
    let hits = 0;
    hArr.forEach((x) => { if (x.hitD) hits++; });
    const rate = total > 0 ? hits / total : null;
    let tier = 'new';
    if (total >= 2 && rate >= 0.6) tier = 'high';
    else if (total >= 1 && rate != null && rate >= 0.33) tier = 'med';
    else if (total >= 1) tier = 'low';
    return { ...p, hits, total, rate, tier };
  });
  const tierRank = { high: 0, med: 1, low: 2, new: 3 };
  predictions.sort((a, b) => {
    if (tierRank[a.tier] !== tierRank[b.tier]) return tierRank[a.tier] - tierRank[b.tier];
    if (a.rate != null && b.rate != null && a.rate !== b.rate) return b.rate - a.rate;
    return b.total - a.total;
  });
  return { predictions, history, windowSize: n };
}

function buildFamCards(draws, pats) {
  const rev = sortD(draws).slice().reverse();
  const lD = rev.filter((d) => d.drawType === 'lunch');
  const tD = rev.filter((d) => d.drawType === 'tea');
  return pats
    .filter((p) => p.status === 'active' && p.history.filter((x) => x.hit).length >= 2)
    .map((pat) => {
      const rD = pat.drawType === 'lunch' ? lD[0] : tD[0];
      const pD2 = pat.drawType === 'lunch' ? lD[1] : tD[1];
      if (!rD || !pD2) return null;
      const rN = rD.numbers.concat([rD.bonus]);
      const pN = pD2.numbers.concat([pD2.bonus]);
      const n1 = rN[pat.rp], n2 = pN[pat.pp];
      const ap = n1 + n2, sp = Math.abs(n1 - n2);
      const lastHit = pat.history.length > 0 ? !!pat.history[pat.history.length - 1].hit : false;
      const hasDirectHit = pat.history.some((x) => x.addDirectHit || x.subDirectHit);
      return {
        id: pat.id, drawType: pat.drawType, rp: pat.rp, pp: pat.pp, rv: n1, pv: n2,
        addPred: ap >= 1 && ap <= 49 ? ap : null, subPred: sp >= 1 && sp <= 49 && sp !== 0 ? sp : null,
        totalHits: pat.history.filter((x) => x.hit).length, streak: cW(pat.history),
        lastHit, hasDirectHit,
      };
    })
    .filter((c) => c && c.streak >= 2)
    .sort((a, b) => {
      if (a.hasDirectHit !== b.hasDirectHit) return a.hasDirectHit ? -1 : 1;
      if (a.lastHit !== b.lastHit) return a.lastHit ? -1 : 1;
      return b.streak - a.streak || b.totalHits - a.totalHits;
    });
}

function buildV2Cards(draws, pats) {
  const rev = sortD(draws).slice().reverse();
  const lL = rev.find((d) => d.drawType === 'lunch');
  const lT = rev.find((d) => d.drawType === 'tea');
  if (!lL || !lT) return [];
  const lN = lL.numbers.concat([lL.bonus]), tN = lT.numbers.concat([lT.bonus]);
  return pats
    .filter((p) => p.status === 'active' && p.history.filter((h) => h.hit).length >= 2)
    .map((pat) => {
      const n1 = lN[pat.lp], n2 = tN[pat.tp], ap = n1 + n2, sp = Math.abs(n1 - n2);
      const lastHit = pat.history.length > 0 ? !!pat.history[pat.history.length - 1].hit : false;
      const hasDirectHit = pat.history.some((h) => h.addDirectHit || h.subDirectHit);
      return {
        lp: pat.lp, tp: pat.tp, lVal: n1, tVal: n2,
        addPred: ap >= 1 && ap <= 49 ? ap : null, subPred: sp >= 1 && sp <= 49 && sp !== 0 ? sp : null,
        totalHits: pat.history.filter((h) => h.hit).length, streak: cW(pat.history),
        lastHit, hasDirectHit,
      };
    })
    .filter((c) => c.streak >= 2)
    .sort((a, b) => {
      if (a.hasDirectHit !== b.hasDirectHit) return a.hasDirectHit ? -1 : 1;
      if (a.lastHit !== b.lastHit) return a.lastHit ? -1 : 1;
      return b.streak - a.streak || b.totalHits - a.totalHits;
    });
}

function collectAllPreds(draws) {
  const r = { seq: [], fam: [], v2: [], combined: new Set() };
  function push(arr, n) { if (n != null && n >= 1 && n <= 49) { arr.push(n); r.combined.add(n); } }
  try { buildSeqCards(draws, discoverSeq(draws)).forEach((c) => { push(r.seq, c.addPred); push(r.seq, c.subPred); }); } catch (e) { /* noop */ }
  try { buildFamCards(draws, discoverFam(draws)).forEach((c) => { push(r.fam, c.addPred); push(r.fam, c.subPred); }); } catch (e) { /* noop */ }
  try { buildV2Cards(draws, discoverV2(draws)).forEach((c) => { push(r.v2, c.addPred); push(r.v2, c.subPred); }); } catch (e) { /* noop */ }
  return r;
}

const { NUMBER_GROUPS: ZG, ZONE_WINDOW: ZW } = require('../../src/engines/v3/chart');

function zA(draws) {
  if (!draws.length) return { trg: [], preds: [], tiers: {} };
  const rec = draws.slice(-ZW);
  const ad = new Set();
  rec.forEach((d) => { d.numbers.forEach((n) => ad.add(n)); if (d.bonus != null) ad.add(d.bonus); });
  const trg = [];
  ZG.forEach((g, gi) => {
    const hi = g.filter((n) => ad.has(n)), mi = g.filter((n) => !ad.has(n));
    if (hi.length > 0 && mi.length > 0) trg.push({ gi, g, hi, mi, hc: hi.length, r: hi.length / g.length, p: hi.length >= 3 ? 1 : hi.length === 2 ? 2 : 3 });
  });
  trg.sort((a, b) => a.p - b.p || b.r - a.r);
  const fq = {};
  trg.forEach((t) => {
    const w = t.hc * t.hc;
    t.mi.forEach((n) => {
      if (!fq[n]) fq[n] = { sc: 0, gs: [], bp: 9, ds: [] };
      fq[n].sc += w;
      fq[n].gs.push(t.g);
      fq[n].ds.push({ g: t.g, hc: t.hc, p: t.p });
      if (t.p < fq[n].bp) fq[n].bp = t.p;
    });
  });
  const preds = Object.keys(fq).map((n) => Object.assign({ num: parseInt(n) }, fq[n])).sort((a, b) => a.bp - b.bp || b.sc - a.sc);
  const tiers = { 1: [], 2: [], 3: [] };
  preds.forEach((p) => tiers[p.bp].push(p));
  return { trg, preds, tiers };
}

function getHotNums(draws) {
  if (draws.length < 4) return [];
  try {
    const an2 = zA(draws);
    const ap2 = collectAllPreds(draws);
    const r = [];
    const hi2 = [];
    if (an2.tiers[1]) an2.tiers[1].forEach((p) => hi2.push(p.num));
    if (an2.tiers[2]) an2.tiers[2].forEach((p) => hi2.push(p.num));
    hi2.forEach((n) => { if (ap2.seq.indexOf(n) !== -1 || ap2.fam.indexOf(n) !== -1 || ap2.v2.indexOf(n) !== -1) r.push(n); });
    return r;
  } catch (e) { return []; }
}

function hotMemo(draws) {
  const an = zA(draws);
  const ap = collectAllPreds(draws);
  const r = [];
  const hi = [];
  if (an.tiers[1]) an.tiers[1].forEach((p) => hi.push(p.num));
  if (an.tiers[2]) an.tiers[2].forEach((p) => hi.push(p.num));
  hi.forEach((n) => {
    const s = [];
    if (ap.seq.indexOf(n) !== -1) s.push('V1 Seq');
    if (ap.fam.indexOf(n) !== -1) s.push('V1 Fam');
    if (ap.v2.indexOf(n) !== -1) s.push('V2');
    if (s.length > 0) {
      let zp = 1;
      if (!(an.tiers[1] && an.tiers[1].some((p) => p.num === n))) zp = 2;
      r.push({ n, src: s, zp, cnt: s.length + 1 });
    }
  });
  r.sort((a, b) => b.cnt - a.cnt || a.zp - b.zp);
  return r;
}

function chartPredsFromHot(hot) {
  if (!hot.length) return [];
  const hotSet = new Set(hot.map((x) => x.n));
  const matches = [];
  ZG.forEach((group) => {
    const overlap = group.filter((n) => hotSet.has(n));
    if (overlap.length >= 2) {
      const missing = group.filter((n) => !hotSet.has(n));
      matches.push({ group, hotInGroup: overlap, missing, count: overlap.length });
    }
  });
  matches.sort((a, b) => b.count - a.count || a.missing.length - b.missing.length);
  return matches.slice(0, 3);
}

function commonNumsFromPreds(ap) {
  const v1Set = new Set();
  ap.seq.forEach((n) => v1Set.add(n));
  ap.fam.forEach((n) => v1Set.add(n));
  const v2Set = new Set(ap.v2);
  const result = [];
  v1Set.forEach((n) => {
    if (v2Set.has(n)) {
      const sources = [];
      if (ap.seq.indexOf(n) !== -1) sources.push('Seq');
      if (ap.fam.indexOf(n) !== -1) sources.push('Fam');
      result.push({ n, v1Sources: sources });
    }
  });
  return result.sort((a, b) => a.n - b.n);
}

function remaindersCompute(srt) {
  if (!srt.length) return { pairs: [], triplets: [] };
  function buildSet(win) {
    const s = new Set();
    srt.slice(-win).forEach((d) => { d.numbers.forEach((n) => s.add(n)); if (d.bonus != null) s.add(d.bonus); });
    return s;
  }
  const setW1 = buildSet(1), setW2 = buildSet(2), setW3 = buildSet(3);
  function qualifyingInWindow(drawnSet) {
    const pr = [], tr = [];
    ZG.forEach((line, idx) => {
      const remaining = line.filter((n) => !drawnSet.has(n));
      const hit = line.filter((n) => drawnSet.has(n));
      if (hit.length < 1) return;
      if (remaining.length === 2) pr.push({ line, lineIdx: idx, remaining, hit });
      else if (remaining.length === 3) tr.push({ line, lineIdx: idx, remaining, hit });
    });
    return { pairs: pr, triplets: tr };
  }
  const q1 = qualifyingInWindow(setW1), q2 = qualifyingInWindow(setW2), q3 = qualifyingInWindow(setW3);
  function dedupByEarliestWindow(p3, p2, p1) {
    const byKey = {};
    function lineKey(item) { return item.lineIdx; }
    p3.forEach((item) => { const k = lineKey(item); if (!byKey[k]) byKey[k] = Object.assign({}, item, { earliestWin: 3 }); });
    p2.forEach((item) => { const k = lineKey(item); if (!byKey[k]) byKey[k] = Object.assign({}, item, { earliestWin: 2 }); });
    p1.forEach((item) => { const k = lineKey(item); if (!byKey[k]) byKey[k] = Object.assign({}, item, { earliestWin: 1 }); });
    return Object.keys(byKey).map((k) => byKey[k]);
  }
  const pairsAll = dedupByEarliestWindow(q3.pairs, q2.pairs, q1.pairs);
  const tripsAll = dedupByEarliestWindow(q3.triplets, q2.triplets, q1.triplets);
  function groupByRemaining(arr) {
    const groups = {};
    arr.forEach((item) => {
      const key = item.remaining.slice().sort((a, b) => a - b).join('-');
      if (!groups[key]) {
        groups[key] = {
          remaining: item.remaining.slice().sort((a, b) => a - b),
          lines: [], lineIdxs: [], hitArrays: [],
          earliestWin: item.earliestWin,
          line: item.line, lineIdx: item.lineIdx, hit: item.hit,
        };
      }
      groups[key].lines.push(item.line);
      groups[key].lineIdxs.push(item.lineIdx);
      groups[key].hitArrays.push(item.hit);
      if (item.earliestWin > groups[key].earliestWin) groups[key].earliestWin = item.earliestWin;
    });
    return Object.keys(groups).map((k) => { const g = groups[k]; g.backingCount = g.lines.length; return g; });
  }
  const pairs = groupByRemaining(pairsAll);
  const triplets = groupByRemaining(tripsAll);
  function sorter(a, b) {
    if (b.earliestWin !== a.earliestWin) return b.earliestWin - a.earliestWin;
    if (b.backingCount !== a.backingCount) return b.backingCount - a.backingCount;
    return a.remaining[0] - b.remaining[0];
  }
  pairs.sort(sorter);
  triplets.sort(sorter);
  return { pairs, triplets };
}

function buildLockedSets(asOfIdx, srtArr) {
  function buildSetAt(win) {
    const s = new Set();
    const from = Math.max(0, asOfIdx + 1 - win);
    for (let w = from; w <= asOfIdx; w++) {
      srtArr[w].numbers.forEach((n) => s.add(n));
      if (srtArr[w].bonus != null) s.add(srtArr[w].bonus);
    }
    return s;
  }
  const avail = asOfIdx + 1;
  const sets = [];
  if (avail >= 1) sets.push({ win: 1, ds: buildSetAt(1) });
  if (avail >= 2) sets.push({ win: 2, ds: buildSetAt(2) });
  if (avail >= 3) sets.push({ win: 3, ds: buildSetAt(3) });
  if (!sets.length) return { lockedPairs: [], lockedTriplets: [] };
  const pairsMap = {}, tripsMap = {};
  sets.forEach((wObj) => {
    ZG.forEach((line, idx) => {
      const rem = line.filter((n) => !wObj.ds.has(n));
      const hit = line.filter((n) => wObj.ds.has(n));
      if (hit.length === 0) return;
      const key = rem.slice().sort((a, b) => a - b).join('-');
      if (rem.length === 2) {
        if (!pairsMap[key]) pairsMap[key] = { remaining: rem.slice().sort((a, b) => a - b), lines: [], lineIdxs: [], earliestWin: wObj.win, line, lineIdx: idx, hit };
        else if (wObj.win > pairsMap[key].earliestWin) pairsMap[key].earliestWin = wObj.win;
        if (pairsMap[key].lineIdxs.indexOf(idx) === -1) { pairsMap[key].lines.push(line); pairsMap[key].lineIdxs.push(idx); }
      } else if (rem.length === 3) {
        if (!tripsMap[key]) tripsMap[key] = { remaining: rem.slice().sort((a, b) => a - b), lines: [], lineIdxs: [], earliestWin: wObj.win, line, lineIdx: idx, hit };
        else if (wObj.win > tripsMap[key].earliestWin) tripsMap[key].earliestWin = wObj.win;
        if (tripsMap[key].lineIdxs.indexOf(idx) === -1) { tripsMap[key].lines.push(line); tripsMap[key].lineIdxs.push(idx); }
      }
    });
  });
  const lockedPairs = Object.keys(pairsMap).map((k) => { const g = pairsMap[k]; return Object.assign({}, g, { backingCount: g.lines.length }); });
  const lockedTriplets = Object.keys(tripsMap).map((k) => { const g = tripsMap[k]; return Object.assign({}, g, { backingCount: g.lines.length }); });
  return { lockedPairs, lockedTriplets };
}

function ptHist(srt) {
  if (srt.length < 2) return { pairRows: [], tripletRows: [] };
  const pairRows = [], tripletRows = [];
  const dayMap = {}, dayList = [];
  srt.forEach((d) => { if (!dayMap[d.drawDate]) { dayMap[d.drawDate] = { drawDate: d.drawDate, draws: [] }; dayList.push(d.drawDate); } dayMap[d.drawDate].draws.push(d); });
  function scoreAgainst(lockedPairs, lockedTriplets, targetDraws, lockedFromLabel) {
    targetDraws.forEach((draw) => {
      const drawSet = new Set(draw.numbers.concat(draw.bonus != null ? [draw.bonus] : []));
      if (lockedPairs.length > 0) {
        const pairHits = lockedPairs.filter((p) => p.remaining.every((n) => drawSet.has(n)));
        pairRows.push({ drawDate: draw.drawDate, drawType: draw.drawType, total: lockedPairs.length, hits: pairHits, lockedFrom: lockedFromLabel });
      }
      if (lockedTriplets.length > 0) {
        const tripHits = lockedTriplets.filter((t) => t.remaining.every((n) => drawSet.has(n)));
        tripletRows.push({ drawDate: draw.drawDate, drawType: draw.drawType, total: lockedTriplets.length, hits: tripHits, lockedFrom: lockedFromLabel });
      }
    });
  }
  for (let di = 1; di < dayList.length; di++) {
    const prevDate = dayList[di - 1];
    let endIdx = -1;
    for (let k = srt.length - 1; k >= 0; k--) { if (srt[k].drawDate === prevDate) { endIdx = k; break; } }
    if (endIdx < 0) continue;
    const lockedEOD = buildLockedSets(endIdx, srt);
    if (!lockedEOD.lockedPairs.length && !lockedEOD.lockedTriplets.length) continue;
    const todayDate = dayList[di];
    scoreAgainst(lockedEOD.lockedPairs, lockedEOD.lockedTriplets, dayMap[todayDate].draws, prevDate);
  }
  dayList.forEach((d) => {
    let lunchIdx = -1, teaDraw = null;
    srt.forEach((dr, idx) => { if (dr.drawDate === d && dr.drawType === 'lunch') lunchIdx = idx; if (dr.drawDate === d && dr.drawType === 'tea') teaDraw = dr; });
    if (lunchIdx < 0 || !teaDraw) return;
    const lockedSD = buildLockedSets(lunchIdx, srt);
    if (!lockedSD.lockedPairs.length && !lockedSD.lockedTriplets.length) return;
    scoreAgainst(lockedSD.lockedPairs, lockedSD.lockedTriplets, [teaDraw], `${d} (Lunch)`);
  });
  return { pairRows: pairRows.slice().reverse().slice(0, 30), tripletRows: tripletRows.slice().reverse().slice(0, 30) };
}

function hitsHist(srt) {
  if (srt.length < 5) return [];
  const results = [];
  const dayMap = {}, dayList = [];
  srt.forEach((d) => { if (!dayMap[d.drawDate]) { dayMap[d.drawDate] = { drawDate: d.drawDate, draws: [] }; dayList.push(d.drawDate); } dayMap[d.drawDate].draws.push(d); });
  for (let di = 1; di < dayList.length; di++) {
    const prevDate = dayList[di - 1];
    let endOfPrevIdx = -1;
    for (let k = srt.length - 1; k >= 0; k--) { if (srt[k].drawDate === prevDate) { endOfPrevIdx = k; break; } }
    if (endOfPrevIdx < 0) continue;
    const prior = srt.slice(0, endOfPrevIdx + 1);
    if (prior.length < 4) continue;
    const lockedHot = getHotNums(prior);
    if (!lockedHot.length) continue;
    const todayDate = dayList[di];
    dayMap[todayDate].draws.forEach((draw) => {
      const drawNums = draw.numbers.concat(draw.bonus != null ? [draw.bonus] : []);
      const hits = lockedHot.filter((n) => drawNums.indexOf(n) !== -1);
      results.push({ drawDate: draw.drawDate, drawType: draw.drawType, hits, totalHot: lockedHot.length, hasHits: hits.length > 0, lockedFrom: prevDate });
    });
  }
  return results.slice().reverse().slice(0, 30);
}

module.exports = {
  discoverSeq, discoverFam, discoverV2, discoverSameDay,
  discoverBonusSeq, discoverBonusFam, discoverBonusV2,
  buildSeqCards, buildFamCards, buildV2Cards, collectAllPreds,
  normalizeForRepeats, computeRepeats,
  zA, getHotNums, hotMemo, chartPredsFromHot, commonNumsFromPreds,
  remaindersCompute, buildLockedSets, ptHist, hitsHist,
};
