# 🎂 Kuchupuchu Birthday Website

A tiny, mobile-friendly birthday surprise site. No build step, no dependencies —
just HTML + CSS + JS. Pink + rose gold, Hinglish words, zero voice/audio.

## 1. Photos add karo

1. Apni photos `assets/photos/` folder mein drop karo (jpg/png/webp — any names).
2. Gallery refresh karne ke liye chalao:

```bash
node list-photos.js
```

Ye `photos-data.js` banata hai (auto-generated) — gallery khud update ho jayegi.
Photos ka order alphabetical/numeric hota hai (`2.jpg` se pehle `10.jpg` nahi).

> Photos abhi nahi hain to gallery cute placeholders dikhati hai.

## 2. Words badlo

Sab text ek hi jagah hai: **`config.js`**
- `name`, `emojis`, `from`
- `dob`, `birthday`, `age`
- `tagline`, `reasons`, `captions`, `letter`, `giftMessage`

Badal ke page refresh karo — bas.

## 3. Local dekhna

```bash
# option A: seedha index.html open karo (double-click)
# option B: chhota server (recommended)
npx serve .
# ya
python -m http.server 8000
```

## 4. Online link (GitHub Pages)

```bash
git init
git add .
git commit -m "birthday site"
gh repo create kuchupuchu-birthday --public --source=. --remote=origin --push
gh api repos/Aanirudra78/kuchupuchu-birthday/pages -X POST \
  -f source='{"branch":"main","path":"/"}'
```

Link: `https://aanirudra78.github.io/kuchupuchu-birthday/`
(Pages ko 1–2 minute lagte hain. ⚠️ Free Pages par repo public hona padta hai.)

Agar pehle se repo exist kare to `git remote add origin ...` + `git push -u origin main`.

## Files

| File | Kaam |
|---|---|
| `index.html` | saare sections |
| `styles.css` | theme, layout, animations |
| `script.js` | cake, gift, envelope, gallery, lightbox, particles |
| `config.js` | 👈 saare words yahin |
| `photos-data.js` | auto-generated photo list (edit mat karo) |
| `list-photos.js` | photos scan karke `photos-data.js` banata hai |
| `assets/photos/` | 👈 photos yahan drop karo |
