/* ============================================================
   KUCHUPUCHU · BIRTHDAY SITE — interactions
   No libraries. Reads config.js + photos-data.js.
   ============================================================ */
(function () {
  "use strict";

  const cfg = window.BIRTHDAY_CONFIG || {};
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (id) => document.getElementById(id);
  const photos = Array.isArray(window.BIRTHDAY_PHOTOS) ? window.BIRTHDAY_PHOTOS : [];

  const setText = (id, value) => {
    const el = $(id);
    if (el && value != null) el.textContent = value;
  };
  const dotted = (date) => String(date || "").replace(/-/g, " · ");

  const srcOf = (p) => (typeof p === "string" ? p : (p && (p.file || p.src)) || "");
  const capOf = (p, i) =>
    (p && typeof p === "object" && p.caption) ||
    (cfg.captions && cfg.captions[i % cfg.captions.length]) ||
    "";
  const focusOf = (i) =>
    (cfg.photoFocus && cfg.photoFocus[i % cfg.photoFocus.length]) || "center 35%";

  function makeImage(src, alt, focus, eager) {
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt || "";
    img.loading = eager ? "eager" : "lazy";
    img.decoding = "async";
    img.draggable = false;
    img.style.setProperty("--focus", focus || "center 35%");
    return img;
  }

  /* ---------- 1. words ---------- */
  function applyConfig() {
    const name = cfg.name || "Kuchupuchu";
    document.title = `${name} · Happy Birthday`;

    setText("coverKicker", cfg.coverKicker || dotted(cfg.birthday));
    setText("coverName", name);
    setText("coverLine", cfg.coverLine || "Happy Birthday, meri jaan");
    setText("coverAge", cfg.age);
    setText("coverDob", dotted(cfg.dob));

    setText("introLead", (cfg.intro && cfg.intro.lead) || `${name},`);

    setText("wishKicker", cfg.wish && cfg.wish.kicker);
    setText("wishTitle", cfg.wish && cfg.wish.title);
    setText("wishLine", cfg.wish && cfg.wish.line);
    setText("wishAfter", cfg.wish && cfg.wish.after);

    setText("letterText", String(cfg.letter || "").replace(/__AGE__/g, cfg.age));
    setText("letterFrom", cfg.from);

    setText("endingKicker", cfg.ending && cfg.ending.kicker);
    setText("endingTitle", cfg.ending && cfg.ending.title);
    setText("endingName", name);
    setText("endingSub", cfg.ending && cfg.ending.sub);
    setText("endingFrom", cfg.from);
    setText("endingDate", dotted(cfg.birthday));
  }

  /* ---------- 2. cover + ending photos ---------- */
  function buildCover() {
    const cover = $("cover");
    const img = $("coverImg");
    if (!cover || !img) return;
    if (photos.length) {
      img.src = srcOf(photos[0]);
      img.alt = capOf(photos[0], 0);
      img.style.objectPosition = focusOf(0);
      img.loading = "eager";
      cover.classList.add("has-photo");
    }
  }

  function buildEnding() {
    const ending = $("ending");
    const img = $("endingImg");
    if (!ending || !img) return;
    if (photos.length) {
      const p = photos[photos.length - 1];
      img.src = srcOf(p);
      img.alt = capOf(p, photos.length - 1);
      img.style.objectPosition = focusOf(photos.length - 1);
      ending.classList.add("has-photo");
    }
  }

  /* ---------- 3. intro lines ---------- */
  function buildIntro() {
    const wrap = $("introLines");
    if (!wrap) return;
    const lines = (cfg.intro && cfg.intro.lines) || [];
    lines.forEach((line, i) => {
      const p = document.createElement("p");
      p.className = "intro__line r";
      p.style.setProperty("--d", `${(i * 0.16 + 0.1).toFixed(2)}s`);
      p.textContent = line;
      wrap.appendChild(p);
    });
  }

  /* ---------- 4. chapters ---------- */
  function buildChapters() {
    const wrap = $("chapters");
    if (!wrap) return;
    const chapters = Array.isArray(cfg.chapters) ? cfg.chapters : [];

    chapters.forEach((ch, i) => {
      const photoIndex = photos.length ? (1 + i) % photos.length : -1;
      const photo = photoIndex >= 0 ? photos[photoIndex] : null;

      const section = document.createElement("section");
      section.className = "chapter";

      const media = document.createElement("div");
      media.className = "chapter__media";

      if (photo) {
        media.appendChild(makeImage(srcOf(photo), capOf(photo, photoIndex), focusOf(photoIndex), false));
      } else {
        const ph = document.createElement("div");
        ph.className = "chapter__ph";
        const b = document.createElement("b");
        b.textContent = String(i + 1).padStart(2, "0");
        ph.appendChild(b);
        ph.appendChild(document.createTextNode("photo"));
        media.appendChild(ph);
      }

      const body = document.createElement("div");
      body.className = "chapter__body r";
      body.style.setProperty("--d", "0.08s");

      const num = document.createElement("span");
      num.className = "chapter__num";
      num.textContent = String(i + 1).padStart(2, "0");

      const line = document.createElement("p");
      line.className = "chapter__line";
      line.textContent = ch.line || "";

      body.appendChild(num);
      body.appendChild(line);
      section.appendChild(media);
      section.appendChild(body);
      wrap.appendChild(section);
    });
  }

  /* ---------- 5. reel ---------- */
  function buildReel() {
    const track = $("reelTrack");
    if (!track) return;

    const items = [];
    if (photos.length) {
      photos.forEach((p, i) => {
        items.push({ src: srcOf(p), caption: capOf(p, i), alt: capOf(p, i) });
      });
    }
    if (window.setBirthdayPhotos) window.setBirthdayPhotos(items);

    if (!photos.length) {
      for (let i = 0; i < 8; i++) {
        const card = document.createElement("figure");
        card.className = "reel__card reel__card--ph";
        const b = document.createElement("b");
        b.textContent = String(i + 1).padStart(2, "0");
        card.appendChild(b);
        card.appendChild(document.createTextNode("photo"));
        track.appendChild(card);
      }
      setText("reelHint", "Photos aate hi yahan tumhare saare pal aa jayenge 💗");
      return;
    }

    photos.forEach((p, i) => {
      const card = document.createElement("figure");
      card.className = "reel__card";
      card.appendChild(makeImage(srcOf(p), capOf(p, i), focusOf(i), false));

      const cap = document.createElement("figcaption");
      const idx = document.createElement("span");
      idx.textContent = String(i + 1).padStart(2, "0");
      cap.appendChild(idx);
      cap.appendChild(document.createTextNode(capOf(p, i)));
      card.appendChild(cap);

      card.addEventListener("click", () => {
        if (typeof window.openBirthdayPhoto === "function") window.openBirthdayPhoto(i);
      });
      track.appendChild(card);
    });
  }

  function initReelDrag() {
    const track = $("reelTrack");
    if (!track) return;
    let down = false, startX = 0, startScroll = 0, moved = 0;

    track.addEventListener("pointerdown", (e) => {
      down = true;
      startX = e.clientX;
      startScroll = track.scrollLeft;
      moved = 0;
      track.classList.add("dragging");
    });
    track.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 6) moved = 1;
      track.scrollLeft = startScroll - dx;
    });
    const end = () => {
      down = false;
      track.classList.remove("dragging");
      setTimeout(() => { moved = 0; }, 60);
    };
    track.addEventListener("pointerup", end);
    track.addEventListener("pointercancel", end);
    track.addEventListener("pointerleave", end);

    // a drag should not open the lightbox
    track.addEventListener("click", (e) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
  }

  /* ---------- 6. reasons ---------- */
  function buildReasons() {
    const list = $("reasonsList");
    if (!list) return;
    const reasons = Array.isArray(cfg.reasons) ? cfg.reasons : [];
    reasons.forEach((text, i) => {
      const li = document.createElement("li");
      li.className = "reasons__item r";
      li.style.setProperty("--d", `${(i * 0.05).toFixed(2)}s`);
      const p = document.createElement("p");
      p.textContent = text;
      li.appendChild(p);
      list.appendChild(li);
    });
  }

  /* ---------- 7. cake ---------- */
  function initCake() {
    const count = Number(cfg.age) || 19;
    const wrap = $("candles");
    if (wrap) {
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

    const btn = $("blowBtn");
    const after = $("wishAfter");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const candles = Array.from(document.querySelectorAll(".candle"));
      candles.forEach((c, i) => setTimeout(() => c.classList.add("out"), i * 55));
      btn.disabled = true;
      btn.textContent = "Wish ho gayi 💗";
      if (after) after.hidden = false;
      setTimeout(() => burstAt($("cake"), 60), 300);
    });
  }

  /* ---------- 8. letter seal ---------- */
  function initLetter() {
    const seal = $("letterSeal");
    if (!seal) return;
    seal.addEventListener("click", () => {
      burstAt(seal, 30);
      seal.style.transform = "translateX(-50%) scale(0.9) rotate(8deg)";
      setTimeout(() => { seal.style.transform = ""; }, 220);
    });
  }

  /* ---------- 9. lightbox ---------- */
  function initLightbox() {
    const lb = $("lightbox");
    const img = $("lbImg");
    const cap = $("lbCap");
    if (!lb) return;
    let items = [];
    let index = 0;

    function show(i) {
      if (!items.length) return;
      index = (i + items.length) % items.length;
      const it = items[index];
      img.src = it.src;
      img.alt = it.alt || it.caption || "";
      cap.textContent = it.caption || "";
      img.style.animation = "none";
      void img.offsetWidth;
      img.style.animation = "";
    }
    function close() {
      lb.hidden = true;
      document.body.style.overflow = "";
    }

    window.openBirthdayPhoto = (i) => {
      if (!items.length) return;
      lb.hidden = false;
      document.body.style.overflow = "hidden";
      show(i);
    };
    window.setBirthdayPhotos = (arr) => {
      items = Array.isArray(arr) ? arr : [];
    };

    $("lbClose").addEventListener("click", close);
    $("lbPrev").addEventListener("click", () => show(index - 1));
    $("lbNext").addEventListener("click", () => show(index + 1));
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    document.addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(index - 1);
      else if (e.key === "ArrowRight") show(index + 1);
    });

    let sx = 0;
    lb.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 45) show(dx > 0 ? index - 1 : index + 1);
    }, { passive: true });
  }

  /* ---------- 10. reveal ---------- */
  function initReveal() {
    const els = Array.from(document.querySelectorAll(".r"));
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
  }

  /* ---------- 11. parallax ---------- */
  function initParallax() {
    if (reduce) return;
    const media = Array.from(document.querySelectorAll(".chapter__media"));
    if (!media.length) return;

    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      media.forEach((m) => {
        const img = m.querySelector("img");
        if (!img) return;
        const r = m.getBoundingClientRect();
        if (r.bottom < -80 || r.top > vh + 80) return;
        const progress = (r.top + r.height / 2 - vh / 2) / vh; // -1 .. 1
        img.style.setProperty("--py", `${(progress * -38).toFixed(1)}px`);
      });
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
  }

  /* ---------- 12. progress bar ---------- */
  function initProgress() {
    const bar = $("progressBar");
    if (!bar) return;
    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
      bar.style.width = `${(p * 100).toFixed(2)}%`;
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
  }

  /* ---------- 13. particles ---------- */
  function initCanvas() {
    const canvas = $("fx");
    if (!canvas || reduce) return;
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const COLORS = ["#d3ac6f", "#e9cfa4", "#d98a9e", "#b3576f", "#f4ead9"];
    const parts = [];

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
      const n = count || 40;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 2.2 + Math.random() * 5;
        parts.push({
          x, y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 2,
          rot: Math.random() * 6.28,
          vr: (Math.random() - 0.5) * 0.24,
          size: 4 + Math.random() * 6,
          color: COLORS[i % COLORS.length],
          life: 0,
          max: 70 + Math.random() * 45,
          shape: Math.random() < 0.5 ? "heart" : "spark",
          grav: 0.1 + Math.random() * 0.06,
        });
      }
    }
    window.__burst = burst;

    function ambient() {
      parts.push({
        x: Math.random() * w,
        y: h + 24,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -0.5 - Math.random() * 0.55,
        rot: Math.random() * 6.28,
        vr: (Math.random() - 0.5) * 0.02,
        size: 3 + Math.random() * 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 0,
        max: 620,
        shape: "heart",
        grav: -0.001,
        ambient: true,
      });
    }

    let tick = 0;
    function frame() {
      ctx.clearRect(0, 0, w, h);
      if (++tick % 90 === 0 && parts.length < 70) ambient();

      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life++;
        p.vy += p.grav;
        p.vx *= 0.995;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;

        if (p.life > p.max || p.y > h + 60) {
          parts.splice(i, 1);
          continue;
        }

        const fade = p.life > p.max - 30 ? (p.max - p.life) / 30 : 1;
        ctx.globalAlpha = Math.max(0, Math.min(1, fade)) * (p.ambient ? 0.45 : 0.9);
        ctx.fillStyle = p.color;

        if (p.shape === "heart") {
          heart(ctx, p.x, p.y, p.size / 8);
        } else {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size * 0.28, 0);
          ctx.lineTo(0, p.size);
          ctx.lineTo(-p.size * 0.28, 0);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function burstAt(el, count) {
    if (!el || typeof window.__burst !== "function") return;
    const r = el.getBoundingClientRect();
    window.__burst(r.left + r.width / 2, r.top + r.height * 0.35, count);
  }

  /* ---------- boot ---------- */
  function boot() {
    applyConfig();
    buildCover();
    buildEnding();
    buildIntro();
    buildChapters();
    initLightbox();   // define openBirthdayPhoto before reel cards
    buildReel();
    initReelDrag();
    buildReasons();
    initCake();
    initLetter();
    initReveal();
    initParallax();
    initProgress();
    initCanvas();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
