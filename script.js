/* ============================================================
   KUCHUPUCHU · BIRTHDAY EXPERIENCE
   DOB → reveal → cake → candles → gift → photos → final
   ============================================================ */
(function () {
  "use strict";

  const cfg = window.BIRTHDAY_CONFIG || {};
  const texts = cfg.texts || {};
  const audioCfg = cfg.audio || {};
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (id) => document.getElementById(id);
  const setText = (id, value) => {
    const el = $(id);
    if (el && value != null) el.textContent = value;
  };

  /* ---------- photos: singles first, then doubles ---------- */
  const allPhotos = Array.isArray(window.BIRTHDAY_PHOTOS) ? window.BIRTHDAY_PHOTOS : [];
  const singles = allPhotos.filter((p) => (p.group || "single") === "single");
  const doubles = allPhotos.filter((p) => p.group === "double");
  const ordered = singles.concat(doubles);
  if (!ordered.length && allPhotos.length) ordered.push(...allPhotos);

  /* ============================================================
     STAGES
     ============================================================ */
  function showStage(name) {
    document.querySelectorAll(".stage").forEach((s) => {
      s.classList.toggle("is-active", s.dataset.stage === name);
    });
  }

  /* ============================================================
     TEXT
     ============================================================ */
  function applyTexts() {
    setText("dobKicker", texts.dobKicker);
    setText("dobTitle", texts.dobTitle);
    setText("dobSub", texts.dobSub);
    setText("revealTitle", texts.revealTitle);
    setText("revealSub", texts.revealSub);
    setText("revealBtn", texts.revealBtn);
    setText("wishTitle", texts.wishTitle);
    setText("blowBtn", texts.blowBtn);
    setText("giftBtn", texts.giftBtn);
    setText("finalKicker", texts.finalKicker);
    setText("finalLine1", texts.finalLine1);
    setText("finalLine2", texts.finalLine2);
    setText("finalFrom", texts.finalFrom);
  }

  /* ============================================================
     AUDIO
     ============================================================ */
  let audioCtx = null;
  let muted = false;

  function ensureCtx() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    return audioCtx;
  }

  function fadeAudio(el, to, ms, done) {
    if (!el) return;
    const from = el.volume;
    const dur = Math.max(1, ms);
    const start = performance.now();
    function step(now) {
      const p = Math.min(1, (now - start) / dur);
      el.volume = Math.max(0, Math.min(1, from + (to - from) * p));
      if (p < 1) requestAnimationFrame(step);
      else if (done) done();
    }
    requestAnimationFrame(step);
  }

  /* ---------- romantic bed ---------- */
  const bgAudio = $("bgAudio");
  let bgStarted = false;

  function startRomantic() {
    if (!bgAudio || !audioCfg.romantic) return;
    if (!bgAudio.src) bgAudio.src = audioCfg.romantic;
    bgAudio.loop = true;
    bgAudio.muted = muted;
    bgAudio.volume = 0;
    const p = bgAudio.play();
    if (p && p.catch) {
      p.catch(() => {});
    }
    bgStarted = true;
    fadeAudio(bgAudio, audioCfg.romanticVolume || 0.32, 1600);
  }

  function stopRomantic() {
    if (!bgStarted || !bgAudio) return;
    bgStarted = false;
    fadeAudio(bgAudio, 0, 900, () => {
      try { bgAudio.pause(); bgAudio.currentTime = 0; } catch (e) {}
    });
  }

  /* ---------- Happy Birthday (synthesised music box) ---------- */
  let birthday = null;

  function buildBirthdayBuffer(ctx) {
    const beat = 0.5; // 120 bpm
    const melody = [
      [0, 392.0, 0.75], [0.75, 392.0, 0.25], [1, 440.0, 1], [2, 392.0, 1], [3, 523.25, 1], [4, 493.88, 2],
      [6, 392.0, 0.75], [6.75, 392.0, 0.25], [7, 440.0, 1], [8, 392.0, 1], [9, 587.33, 1], [10, 523.25, 2],
      [12, 392.0, 0.75], [12.75, 392.0, 0.25], [13, 783.99, 1], [14, 659.25, 1], [15, 523.25, 1], [16, 493.88, 1], [17, 440.0, 2],
      [19, 698.46, 0.75], [19.75, 698.46, 0.25], [20, 659.25, 1], [21, 523.25, 1], [22, 587.33, 1], [23, 523.25, 2]
    ];
    const totalBeats = 26;
    const sr = ctx.sampleRate;
    const dur = totalBeats * beat + 1.4;
    const buffer = ctx.createBuffer(1, Math.ceil(dur * sr), sr);
    const data = buffer.getChannelData(0);

    for (const [startBeat, freq, beats] of melody) {
      const t0 = startBeat * beat;
      const len = beats * beat + 0.55;
      const n0 = Math.floor(t0 * sr);
      const n1 = Math.min(data.length, Math.floor((t0 + len) * sr));
      for (let i = n0; i < n1; i++) {
        const t = (i - n0) / sr;
        const env = Math.exp(-3.1 * t) * (1 - Math.exp(-t * 190));
        const v =
          Math.sin(2 * Math.PI * freq * t) * 0.55 +
          Math.sin(2 * Math.PI * freq * 2 * t) * 0.18 +
          Math.sin(2 * Math.PI * freq * 3 * t) * 0.07;
        data[i] += v * env * 0.5;
      }
    }

    let max = 0;
    for (let i = 0; i < data.length; i++) max = Math.max(max, Math.abs(data[i]));
    if (max > 0.9) {
      const k = 0.9 / max;
      for (let i = 0; i < data.length; i++) data[i] *= k;
    }
    return buffer;
  }

  function startBirthday() {
    const ctx = ensureCtx();
    if (!ctx) return;
    const buffer = buildBirthdayBuffer(ctx);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(muted ? 0 : 0.5, ctx.currentTime + 1.2);
    birthday = { src, gain };
  }

  function stopBirthday() {
    if (!birthday) return;
    const ctx = ensureCtx();
    const { src, gain } = birthday;
    birthday = null;
    if (ctx) {
      const t = ctx.currentTime;
      gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(gain.gain.value, t);
      gain.gain.linearRampToValueAtTime(0, t + 1);
    }
    setTimeout(() => { try { src.stop(); } catch (e) {} }, 1150);
  }

  /* ---------- Rang Jo Lagyo segments ---------- */
  const rangAudio = $("rangAudio");
  let rangAvailable = null;
  let rangTimer = null;
  let rangStarted = false;

  function initRang() {
    if (!rangAudio) return;
    rangAudio.addEventListener("error", () => { rangAvailable = false; });
    rangAudio.addEventListener("canplay", () => { if (rangAvailable === null) rangAvailable = true; });
    rangAudio.src = audioCfg.rang || "";
  }

  function startRang() {
    if (!rangAudio || rangAvailable === false) { startRomantic(); return; }

    const segs = audioCfg.rangSegments || [[35, 90], [130, 170]];
    let began = false;

    const begin = () => {
      if (began) return;
      began = true;
      try { rangAudio.currentTime = segs[0][0]; } catch (e) {}
      rangAudio.muted = muted;
      rangAudio.volume = 0;
      const p = rangAudio.play();
      if (p && p.catch) {
        p.catch(() => {
          rangAvailable = false;
          startRomantic();
        });
      }
      rangStarted = true;
      fadeAudio(rangAudio, audioCfg.rangVolume || 0.72, 1300);

      let segIndex = 0;
      clearInterval(rangTimer);
      rangTimer = setInterval(() => {
        if (!rangAudio || rangAudio.paused) return;
        const seg = segs[segIndex];
        if (!seg) { clearInterval(rangTimer); return; }
        if (rangAudio.currentTime >= seg[1]) {
          segIndex++;
          if (segIndex < segs.length) {
            try { rangAudio.currentTime = segs[segIndex][0]; } catch (e) {}
          } else {
            clearInterval(rangTimer);
            fadeAudio(rangAudio, 0, 1800, () => { try { rangAudio.pause(); } catch (e) {} });
          }
        }
      }, 200);
    };

    if (rangAudio.readyState >= 1) begin();
    else {
      rangAudio.addEventListener("loadedmetadata", begin, { once: true });
      setTimeout(() => {
        if (began) return;
        if (rangAvailable === false) startRomantic();
        else begin();
      }, 3000);
    }
  }

  function stopRang() {
    clearInterval(rangTimer);
    if (!rangStarted || !rangAudio) return;
    rangStarted = false;
    fadeAudio(rangAudio, 0, 800, () => { try { rangAudio.pause(); } catch (e) {} });
  }

  /* ---------- mute ---------- */
  function applyMute() {
    if (bgAudio) bgAudio.muted = muted;
    if (rangAudio) rangAudio.muted = muted;
    if (birthday && audioCtx) {
      birthday.gain.gain.setTargetAtTime(muted ? 0 : 0.5, audioCtx.currentTime, 0.06);
    }
    const icon = $("soundIcon");
    const btn = $("soundToggle");
    if (icon) icon.textContent = muted ? "✕" : "♪";
    if (btn) {
      btn.classList.toggle("is-muted", muted);
      btn.setAttribute("aria-pressed", String(!muted));
    }
  }

  function initSoundToggle() {
    const btn = $("soundToggle");
    if (!btn) return;
    btn.addEventListener("click", () => {
      muted = !muted;
      ensureCtx();
      applyMute();
      if (!muted && bgStarted && bgAudio && bgAudio.paused) {
        bgAudio.play().catch(() => {});
      }
    });
  }

  /* ============================================================
     DOB GATE
     ============================================================ */
  let attempts = 0;
  let wishTimer = null;

  function fillSelect(sel, items, placeholder) {
    if (!sel) return;
    sel.innerHTML = "";
    const ph = document.createElement("option");
    ph.value = "";
    ph.textContent = placeholder;
    ph.disabled = true;
    ph.selected = true;
    sel.appendChild(ph);
    items.forEach((it) => {
      const o = document.createElement("option");
      o.value = it.value;
      o.textContent = it.label;
      sel.appendChild(o);
    });
  }

  function initDob() {
    const days = Array.from({ length: 31 }, (_, i) => ({
      value: i + 1,
      label: String(i + 1).padStart(2, "0")
    }));
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
      (m, i) => ({ value: i + 1, label: m })
    );
    const thisYear = new Date().getFullYear();
    const years = [];
    for (let y = thisYear; y >= 1990; y--) years.push({ value: y, label: String(y) });

    fillSelect($("dobDay"), days, "DD");
    fillSelect($("dobMonth"), months, "MM");
    fillSelect($("dobYear"), years, "YYYY");

    const form = $("dobForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = Number($("dobDay").value);
      const m = Number($("dobMonth").value);
      const y = Number($("dobYear").value);
      const err = $("dobError");

      if (!d || !m || !y) {
        showDobError(texts.dobIncomplete, false);
        shakeForm();
        return;
      }

      const target = cfg.dob || {};
      if (d === target.d && m === target.m && y === target.y) {
        if (err) err.hidden = true;
        ensureCtx();
        startRomantic();
        showStage("reveal");
      } else {
        attempts++;
        const hint = attempts >= 2;
        showDobError(hint ? texts.dobHint : texts.dobWrong, hint);
        shakeForm();
      }
    });
  }

  function showDobError(msg, isHint) {
    const err = $("dobError");
    if (!err) return;
    err.textContent = msg || "";
    err.hidden = !msg;
    err.classList.toggle("is-hint", !!isHint);
  }

  function shakeForm() {
    const form = $("dobForm");
    if (!form) return;
    form.classList.remove("dob-form-shake");
    void form.offsetWidth;
    form.classList.add("dob-form-shake");
  }

  /* ============================================================
     REVEAL → CAKE
     ============================================================ */
  function initReveal() {
    const btn = $("revealBtn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      stopRomantic();
      startBirthday();
      showStage("cake");
      resetCake();
      scheduleWish();
    });
  }

  function buildCandles() {
    const wrap = $("candles");
    if (!wrap) return;
    wrap.innerHTML = "";
    const count = Number(cfg.age) || 19;
    for (let i = 0; i < count; i++) {
      const c = document.createElement("span");
      c.className = "candle";
      c.style.setProperty("--cd", (-i * 0.13).toFixed(2) + "s");
      const f = document.createElement("span");
      f.className = "flame";
      f.style.setProperty("--fd", (-i * 0.07).toFixed(2) + "s");
      c.appendChild(f);
      wrap.appendChild(c);
    }
  }

  function resetCake() {
    clearTimeout(wishTimer);
    document.querySelectorAll(".candle").forEach((c) => c.classList.remove("out"));
    const wish = $("wishTitle");
    if (wish) wish.classList.remove("is-hidden");
    const blow = $("blowBtn");
    if (blow) {
      blow.hidden = true;
      blow.disabled = false;
    }
    const gift = $("giftBtn");
    if (gift) gift.hidden = true;
  }

  function scheduleWish() {
    clearTimeout(wishTimer);
    wishTimer = setTimeout(() => {
      const wish = $("wishTitle");
      const blow = $("blowBtn");
      if (wish) wish.classList.add("is-hidden");
      if (blow) blow.hidden = false;
    }, 5000);
  }

  function initCake() {
    buildCandles();

    const blow = $("blowBtn");
    const gift = $("giftBtn");
    if (!blow || !gift) return;

    blow.addEventListener("click", () => {
      blow.disabled = true;
      const candles = Array.from(document.querySelectorAll(".candle"));
      candles.forEach((c, i) => setTimeout(() => c.classList.add("out"), i * 55));
      setTimeout(() => {
        blow.hidden = true;
        gift.hidden = false;
        preloadAll();
        burst(window.innerWidth / 2, window.innerHeight * 0.42, 54);
      }, 900);
    });

    gift.addEventListener("click", () => {
      stopBirthday();
      startRang();
      showStage("photos");
      startSlideshow();
    });
  }

  /* ============================================================
     PHOTOS
     ============================================================ */
  const slideA = $("slideA");
  const slideB = $("slideB");
  let slideIndex = 0;
  let slideTimer = null;
  let usingA = true;
  let slideInterval = 3000;

  function preloadAll() {
    ordered.forEach((p) => {
      const im = new Image();
      im.src = p.file;
    });
  }

  function showPhoto(i) {
    const item = ordered[i];
    if (!item) return;
    const incoming = usingA ? slideB : slideA;
    const outgoing = usingA ? slideA : slideB;

    incoming.classList.remove("is-active");
    incoming.style.transition = "none";
    void incoming.offsetWidth;
    incoming.style.transition = "";
    incoming.src = item.file;
    incoming.alt = item.alt || "";

    const swap = () => {
      incoming.classList.add("is-active");
      outgoing.classList.remove("is-active");
      usingA = !usingA;
    };
    if (incoming.complete) requestAnimationFrame(swap);
    else incoming.onload = () => { incoming.onload = null; requestAnimationFrame(swap); };

    const label = $("photoLabel");
    const count = $("photoCount");
    const bar = $("photoBar");
    const labels = cfg.labels || { single: "Tum", double: "Hum dono" };
    if (label) label.textContent = item.group === "double" ? labels.double : labels.single;
    if (count) count.textContent = `${String(i + 1).padStart(2, "0")} / ${String(ordered.length).padStart(2, "0")}`;
    if (bar) bar.style.width = `${(((i + 1) / ordered.length) * 100).toFixed(2)}%`;
  }

  function startSlideshow() {
    if (!ordered.length) { showFinal(); return; }

    const segs = audioCfg.rangSegments || [[35, 90], [130, 170]];
    const totalSec = segs.reduce((sum, s) => sum + Math.max(0, s[1] - s[0]), 0);
    const seconds =
      rangAvailable === false
        ? (audioCfg.fallbackPhotoSeconds || 3.2)
        : (totalSec ? totalSec / ordered.length : 3);

    slideInterval = Math.max(1600, seconds * 1000);
    document.documentElement.style.setProperty("--kb", `${(slideInterval / 1000).toFixed(2)}s`);

    slideIndex = 0;
    usingA = true;
    if (slideA) { slideA.classList.remove("is-active"); slideA.removeAttribute("src"); }
    if (slideB) { slideB.classList.remove("is-active"); slideB.removeAttribute("src"); }

    showPhoto(0);
    clearInterval(slideTimer);
    slideTimer = setInterval(() => {
      slideIndex++;
      if (slideIndex >= ordered.length) {
        clearInterval(slideTimer);
        setTimeout(showFinal, Math.min(1500, slideInterval * 0.5));
        return;
      }
      showPhoto(slideIndex);
    }, slideInterval);
  }

  function showFinal() {
    clearInterval(slideTimer);
    stopRang();
    showStage("final");
    setTimeout(() => burst(window.innerWidth / 2, window.innerHeight * 0.45, 70), 350);
  }

  /* ============================================================
     REPLAY
     ============================================================ */
  function initReplay() {
    const btn = $("replayBtn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      clearInterval(slideTimer);
      stopRang();
      stopBirthday();
      stopRomantic();
      attempts = 0;
      resetCake();
      showDobError("", false);
      showStage("dob");
    });
  }

  /* ============================================================
     PARTICLES
     ============================================================ */
  const canvas = $("fx");
  const ctx2d = canvas ? canvas.getContext("2d") : null;
  let W = 0, H = 0, DPR = 1;
  const parts = [];
  const COLORS = ["#e87a9f", "#c9557f", "#ffd9e8", "#d3ac6f", "#ecd6ae", "#fff4f8"];

  function resizeCanvas() {
    if (!canvas) return;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx2d.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function heart(c, x, y, s) {
    c.save();
    c.translate(x, y);
    c.scale(s, s);
    c.beginPath();
    c.moveTo(0, 4);
    c.bezierCurveTo(-10, -4, -12, -12, -5, -12);
    c.bezierCurveTo(-1, -12, 0, -9, 0, -7);
    c.bezierCurveTo(0, -9, 1, -12, 5, -12);
    c.bezierCurveTo(12, -12, 10, -4, 0, 4);
    c.closePath();
    c.fill();
    c.restore();
  }

  function burst(x, y, count) {
    if (reduce || !ctx2d) return;
    const n = count || 40;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 2 + Math.random() * 5.5;
      parts.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 2,
        rot: Math.random() * 6.28,
        vr: (Math.random() - 0.5) * 0.22,
        size: 4 + Math.random() * 7,
        color: COLORS[i % COLORS.length],
        life: 0,
        max: 70 + Math.random() * 50,
        shape: Math.random() < 0.6 ? "heart" : "petal",
        grav: 0.09 + Math.random() * 0.06,
        ambient: false
      });
    }
  }

  function ambient() {
    if (reduce) return;
    parts.push({
      x: Math.random() * W,
      y: H + 26,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -0.45 - Math.random() * 0.5,
      rot: Math.random() * 6.28,
      vr: (Math.random() - 0.5) * 0.02,
      size: 4 + Math.random() * 5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 0,
      max: 720,
      shape: "heart",
      grav: -0.001,
      ambient: true
    });
  }

  let tick = 0;
  function frame() {
    if (!ctx2d) return;
    ctx2d.clearRect(0, 0, W, H);
    if (++tick % 100 === 0 && parts.length < 60) ambient();

    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life++;
      p.vy += p.grav;
      p.vx *= 0.996;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;

      if (p.life > p.max || p.y > H + 70) { parts.splice(i, 1); continue; }

      const fade = p.life > p.max - 30 ? (p.max - p.life) / 30 : 1;
      ctx2d.globalAlpha = Math.max(0, Math.min(1, fade)) * (p.ambient ? 0.42 : 0.92);
      ctx2d.fillStyle = p.color;

      if (p.shape === "heart") {
        heart(ctx2d, p.x, p.y, p.size / 8);
      } else {
        ctx2d.save();
        ctx2d.translate(p.x, p.y);
        ctx2d.rotate(p.rot);
        ctx2d.beginPath();
        ctx2d.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
        ctx2d.fill();
        ctx2d.restore();
      }
    }
    ctx2d.globalAlpha = 1;
    requestAnimationFrame(frame);
  }

  function initCanvas() {
    if (!canvas || !ctx2d) return;
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });
    if (!reduce) requestAnimationFrame(frame);
  }

  /* ============================================================
     BOOT
     ============================================================ */
  function boot() {
    applyTexts();
    initDob();
    initReveal();
    initCake();
    initReplay();
    initRang();
    initSoundToggle();
    initCanvas();
    showStage("dob");

    // small debug hook (harmless in production)
    window.__birthday = { showStage, startSlideshow, showFinal, resetCake, scheduleWish };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
