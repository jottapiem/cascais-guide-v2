// Morph measurement harness — injected as a Chrome DevTools `initScript` BEFORE the app
// bundle evaluates. It must run first: framer-motion captures `requestAnimationFrame`
// once at module-eval time (createRenderBatcher(requestAnimationFrame)), so a patch
// applied after load is never seen by the spring loop.
//
// What it gives you:
//   window.__mv.frames  — one DOM sample per animation frame (transform, clipPath,
//                         sheet/chrome/scrim opacities, <main> transform, back-button
//                         pointer-events). These are the *actual applied styles*, not
//                         internal state, so they are evidence rather than inference.
//   window.__mvPauseUp(scale) / __mvPauseDown(scale)
//                       — freeze the spring at the first frame whose clone scaleX passes
//                         the given value, so a mid-flight frame can be screenshotted.
//                         Works because framer schedules its next frame from inside its
//                         own callback: don't call the callback and the whole loop stalls.
//   window.__mvResume() — flush the queued callback(s) and let it run on.
//   window.__mvRun(t, cardIdx)
//                       — return to home, tap card #cardIdx, freeze at progress ~t.
//                         Reports `cleanStart` so a run that started from a polluted
//                         state (base view still scaled, detail still mounted) is
//                         visible in the result instead of silently skewing it.
//
// Progress is derived, not read: t = (scaleX - s0) / (1 - s0), with
// s0 = cardRect.width / min(innerWidth, 448) measured on the real card before the tap.
(() => {
  const state = {
    frames: [], paused: false, pauseAtScale: null, pauseBelowScale: null, pending: [],
    origRAF: window.requestAnimationFrame.bind(window), t0: 0,
  };
  const num = (s) => {
    const m = /scale\(([-\d.]+)[,\s]*([-\d.]+)?\)/.exec(s || "");
    return m ? [parseFloat(m[1]), m[2] !== undefined ? parseFloat(m[2]) : parseFloat(m[1])] : null;
  };
  const sample = (ts) => {
    const clone = document.querySelector('div[style*="z-index: 95"]');
    if (!clone) return;
    const scrims = document.querySelectorAll(".morph-scrim");
    const main = document.querySelector("main");
    const sheet = clone.children.length > 1 ? clone.children[clone.children.length - 1] : null;
    const chrome = clone.querySelector(".pointer-events-none.absolute.inset-0.z-10");
    const backBtn = document.querySelector('button[aria-label="Terug"]');
    const sc = num(clone.style.transform);
    state.frames.push({
      ms: +(ts - state.t0).toFixed(2),
      scaleX: sc ? sc[0] : null, scaleY: sc ? sc[1] : null,
      tx: clone.style.transform, clip: clone.style.clipPath, cloneOp: clone.style.opacity,
      sheetOp: sheet ? +sheet.style.opacity : null, chromeOp: chrome ? +chrome.style.opacity : null,
      sL: scrims[0] ? +scrims[0].style.opacity : null, sH: scrims[1] ? +scrims[1].style.opacity : null,
      mainTx: main ? main.style.transform : null, mainWC: main ? main.style.willChange : null,
      backPE: backBtn ? getComputedStyle(backBtn).pointerEvents : null,
    });
  };
  window.requestAnimationFrame = function (cb) {
    return state.origRAF(function (ts) {
      if (state.paused) { state.pending.push(cb); return; }
      cb(ts);
      sample(ts);
      const last = state.frames[state.frames.length - 1];
      if (last && last.scaleX != null) {
        if (state.pauseAtScale != null && last.scaleX >= state.pauseAtScale) { state.paused = true; state.pauseAtScale = null; }
        if (state.pauseBelowScale != null && last.scaleX <= state.pauseBelowScale) { state.paused = true; state.pauseBelowScale = null; }
      }
    });
  };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  window.__mv = state;
  window.__mvReset = () => {
    state.frames.length = 0; state.paused = false; state.pauseAtScale = null;
    state.pauseBelowScale = null; state.pending.length = 0; state.t0 = performance.now();
  };
  window.__mvPauseUp = (s) => { state.pauseAtScale = s; return "armed-up:" + s; };
  window.__mvPauseDown = (s) => { state.pauseBelowScale = s; return "armed-down:" + s; };
  window.__mvResume = () => {
    state.paused = false;
    const p = state.pending.splice(0, state.pending.length);
    p.forEach((cb) => { try { cb(performance.now()); } catch (e) { /* stale frame callback */ } });
    return p.length;
  };
  // Waiting on "no back button" alone is not enough: it is also absent mid-forward-morph,
  // which is how an earlier version of this helper measured a card rect while <main> was
  // still scaled 0.93 and produced a bogus s0.
  window.__mvHome = async () => {
    window.__mvResume();
    await sleep(1300);
    for (let i = 0; i < 6; i++) {
      const back = document.querySelector('button[aria-label="Terug"]');
      if (!back) break;
      back.click();
      await sleep(1100);
    }
    await sleep(150);
    const main = document.querySelector("main");
    return {
      detailPresent: !!document.querySelector('button[aria-label="Terug"]'),
      mainTx: main.style.transform, bodyOverflow: document.body.style.overflow,
    };
  };
  window.__mvRun = async (tTarget, cardIdx) => {
    const home = await window.__mvHome();
    const card = document.querySelectorAll(".cursor-pointer")[cardIdx || 0];
    const wrapper = card.querySelector("div");
    const r = wrapper.getBoundingClientRect();
    const s0 = r.width / Math.min(window.innerWidth, 448);
    const cleanStart = home.mainTx === "" && !home.detailPresent;
    window.__mvReset();
    if (tTarget != null) window.__mvPauseUp(s0 + (1 - s0) * tTarget);
    card.click();
    await sleep(tTarget == null ? 1600 : 500);
    const f = state.frames.filter((x) => x.scaleX != null);
    const last = f[f.length - 1] || null;
    return {
      cleanStart, home, s0: +s0.toFixed(5), cardW: +r.width.toFixed(2),
      paused: state.paused, frames: f.length,
      tActual: last ? +((last.scaleX - s0) / (1 - s0)).toFixed(4) : null, last,
    };
  };
})();
