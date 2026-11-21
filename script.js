/* ============================================================
   BIRTHDAY SITE — interactions
   No libraries. Reads config.js + photos-data.js.
   ============================================================ */
(function () {
  "use strict";

  const cfg = window.BIRTHDAY_CONFIG || {};
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (id) => document.getElementById(id);
  const setText = (id, value) => {
    const el = $(id);
    if (el && value != null) el.textContent = value;
  };
  const dotted = (date) => String(date || "").replace(/-/g, " · ");

  /* ---------- 1. fill all words from config ---------- */
  function applyConfig() {
    const name = cfg.name || "Kuchupuchu";
    document.title = `Happy Birthday ${name} 🥰💗✨`;

    setText("heroName", name);
    setText("heroEmojis", cfg.emojis || "🥰💗✨");
    setText("heroTagline", cfg.tagline);
    setText("heroAge", cfg.age);
    setText("heroDob", dotted(cfg.dob));
    setText("endingName", name);
    setText("endingFrom", cfg.from);
    setText("letterFrom", cfg.from);
    setText("endingDate", dotted(cfg.birthday));
    setText("wishSub", `${cfg.age} candles, ${cfg.age} saal, aur ek hi wish — tumhari khushi.`);
    setText("giftMessage", cfg.giftMessage);
    setText("wishNote", cfg.afterWish);

    setText(
      "letterText",
      String(cfg.letter || "").replace(/__AGE__/g, cfg.age)
    );
  }

  /* ---------- 2. scroll reveal with stagger ---------- */
  function initReveal() {
    const els = Array.from(document.querySelectorAll(".reveal, [data-delay]"));
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
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el, i) => {
      const d = el.dataset.delay;
      el.style.setProperty("--d", d ? `${d}s` : `${(0.03 * (i % 6)).toFixed(2)}s`);
      io.observe(el);
    });
  }

  /* ---------- 3. floating hearts / confetti canvas ---------- */
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

    const COLORS = ["#e8608f", "#c94374", "#f4b8cd", "#b76e79", "#c69c6d", "#ffd7e4", "#f6a6c0"];
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
      const n = count || 42;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 2.4 + Math.random() * 5.4;
        parts.push({
          x, y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 2.2,
          rot: Math.random() * 6.28,
          vr: (Math.random() - 0.5) * 0.25,
          size: 5 + Math.random() * 7,
          color: COLORS[i % COLORS.length],
          life: 0,
          max: 70 + Math.random() * 45,
          shape: Math.random() < 0.45 ? "heart" : "rect",
          grav: 0.12 + Math.random() * 0.06,
        });
      }
    }
    window.__burst = burst;

    function ambient() {
      parts.push({
        x: Math.random() * w,
        y: h + 30,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -0.65 - Math.random() * 0.6,
        rot: Math.random() * 6.28,
        vr: (Math.random() - 0.5) * 0.03,
        size: 5 + Math.random() * 6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 0,
        max: 560,
        shape: "heart",
        grav: -0.002,
        ambient: true,
      });
    }

    let tick = 0;
    function frame() {
      ctx.clearRect(0, 0, w, h);
      if (++tick % 70 === 0 && parts.length < 90) ambient();

      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life++;
        p.vy += p.grav;
        p.vx *= 0.995;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;

        if (p.life > p.max || p.y > h + 70) {
          parts.splice(i, 1);
          continue;
        }

        const fade = p.life > p.max - 30 ? (p.max - p.life) / 30 : 1;
        ctx.globalAlpha = Math.max(0, Math.min(1, fade)) * (p.ambient ? 0.5 : 0.95);
        ctx.fillStyle = p.color;

        if (p.shape === "heart") {
          heart(ctx, p.x, p.y, p.size / 8);
        } else {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
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

  /* ---------- 4. cake + candles ---------- */
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
    const note = $("wishNote");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const candles = Array.from(document.querySelectorAll(".candle"));
      candles.forEach((c, i) => setTimeout(() => c.classList.add("out"), i * 55));
      btn.disabled = true;
      btn.textContent = "Wish kiya 💗";
      if (note) note.hidden = false;
      setTimeout(() => burstAt($("cake"), 70), 280);
    });
  }

  /* ---------- 5. gift box ---------- */
  function initGift() {
    const box = $("giftBox");
    const msg = $("giftMessage");
    const hint = $("giftHint");
    if (!box) return;
    box.addEventListener("click", () => {
      const open = box.classList.toggle("open");
      box.setAttribute("aria-expanded", String(open));
      if (msg) msg.hidden = !open;
      if (hint) hint.hidden = open;
      if (open) burstAt(box, 40);
    });
  }

  /* ---------- 6. envelope / letter ---------- */
  function initLetter() {
    const env = $("envelope");
    const paper = $("letterPaper");
    const hint = $("envelopeHint");
    if (!env) return;
    env.addEventListener("click", () => {
      const open = env.classList.toggle("open");
      env.setAttribute("aria-expanded", String(open));
      if (paper) paper.hidden = !open;
      if (hint) hint.hidden = open;
      if (open) burstAt(env, 34);
    });
  }

  /* ---------- 7. reasons ---------- */
  function initReasons() {
    const grid = $("reasonGrid");
    if (!grid) return;
    const reasons = Array.isArray(cfg.reasons) ? cfg.reasons : [];
    reasons.forEach((text, i) => {
      const card = document.createElement("article");
      card.className = "reason-card reveal";
      card.style.setProperty("--d", (i * 0.05).toFixed(2) + "s");
      const num = document.createElement("span");
      num.className = "reason-card__num";
      num.textContent = String(i + 1).padStart(2, "0");
      const p = document.createElement("p");
      p.textContent = text;
      card.appendChild(num);
      card.appendChild(p);
      grid.appendChild(card);
    });

    // reason cards are created after the first reveal scan
    if (reduce || !("IntersectionObserver" in window)) {
      grid.querySelectorAll(".reason-card").forEach((el) => el.classList.add("in"));
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
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    grid.querySelectorAll(".reason-card").forEach((el) => io.observe(el));
  }

  /* ---------- 8. lightbox ---------- */
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
      // restart the pop animation
      img.style.animation = "none";
      void img.offsetWidth;
      img.style.animation = "";
    }
    function close() {
      lb.hidden = true;
      document.body.style.overflow = "";
    }

    window.openBirthdayPhoto = (i) => {
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
    lb.addEventListener("click", (e) => {
      if (e.target === lb) close();
    });
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

  /* ---------- 8. gallery ---------- */
  function initGallery() {
    const grid = $("photoGrid");
    if (!grid) return;
    const photos = Array.isArray(window.BIRTHDAY_PHOTOS) ? window.BIRTHDAY_PHOTOS : [];
    const tilts = ["-2.4deg", "1.8deg", "-1.2deg", "2.6deg", "-1.9deg", "1.4deg"];

    if (!photos.length) {
      for (let i = 0; i < 6; i++) {
        const fig = document.createElement("figure");
        fig.className = "polaroid polaroid--placeholder";
        fig.style.setProperty("--tilt", tilts[i % tilts.length]);
        fig.style.setProperty("--pd", (i * 0.08).toFixed(2) + "s");
        fig.innerHTML =
          '<div class="polaroid__ph">💗</div>' +
          "<figcaption>Yahan tumhari photo aayegi ✨</figcaption>";
        grid.appendChild(fig);
      }
      setText("gallerySub", "Photos folder mein daalte hi yahan appear ho jayengi 💗");
      return;
    }

    const items = photos.map((p, i) => {
      const src = typeof p === "string" ? p : p.file || p.src || "";
      const caption = (typeof p === "object" && p.caption) ||
        (cfg.captions && cfg.captions[i % cfg.captions.length]) || "";
      const alt = (typeof p === "object" && p.alt) || caption || `Memory ${i + 1}`;
      return { src, caption, alt };
    });
    window.setBirthdayPhotos(items);

    items.forEach((it, i) => {
      const fig = document.createElement("figure");
      fig.className = "polaroid";
      fig.style.setProperty("--tilt", tilts[i % tilts.length]);
      fig.style.setProperty("--pd", (Math.min(i, 8) * 0.07).toFixed(2) + "s");

      const img = document.createElement("img");
      img.src = it.src;
      img.alt = it.alt;
      img.loading = "lazy";
      img.addEventListener("click", () => window.openBirthdayPhoto(i));

      const c = document.createElement("figcaption");
      c.textContent = it.caption;

      fig.appendChild(img);
      fig.appendChild(c);
      grid.appendChild(fig);
    });
  }

  /* ---------- boot ---------- */
  function boot() {
    applyConfig();
    initReveal();
    initCanvas();
    initCake();
    initGift();
    initLetter();
    initReasons();
    initLightbox();
    initGallery();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
