# 🎀 Kuchupuchu · Birthday Experience

A one-screen-at-a-time birthday surprise in baby pink. No build step, no
frameworks — just HTML, CSS and JS.

**Live:** https://aanirudra78.github.io/kuchupuchu-birthday/

## The flow

1. **Enter your DOB** — she types 22 · 11 · 2007.
2. **"Ohh, it's your birthday!"** — "I think I made something for you…"
3. **Click here** → soft romantic piano fades into a music-box **Happy Birthday**.
4. **Cake** — big *"Make your wish"*, 19 candles. After 5 seconds it fades and
   **"Blown the candles"** appears.
5. **Blown the candles** → flames go out, smoke, confetti.
6. **Gift for you** → **Rang Jo Lagyo** starts (0:35–1:30, then 2:10–2:50).
7. **Photos** — all her solo photos first, then both-of-you photos, one every
   ~3 seconds (timed to the song).
8. **Final** — full-screen **I LOVE YOU / MY BABY GIRL**, *from Anirudra*.

## Photos

```
assets/photos/single/   ← her photos  (s01.jpg … s14.jpg)
assets/photos/double/   ← both of you (d01.jpg … d18.jpg)
```

After adding/removing photos run:

```bash
node list-photos.js
```

## Words / timings / songs

Everything lives in **`config.js`**:
- `dob`, `age`, `from`
- `texts` — every line on screen
- `audio.romantic`, `audio.rang`
- `audio.rangSegments` — `[[35, 90], [130, 170]]`
- `audio.rangVolume`, `audio.romanticVolume`

## Run locally

```bash
npx serve .
# or just double-click index.html
```

> Audio needs a click to start (browser rule), so the romantic song begins when
> she presses **Enter** on the DOB screen.

## Deploy (GitHub Pages)

```bash
git add .
git commit -m "birthday experience"
git push
```

Pages updates in 1–2 minutes.

> ⚠️ Free GitHub Pages needs a public repo — anyone with the link can open it.

## Files

| File | Kaam |
|---|---|
| `index.html` | the five stages |
| `styles.css` | baby-pink theme + animations |
| `script.js` | DOB gate, audio, cake, slideshow, final |
| `config.js` | 👈 all words / songs / timings |
| `photos-data.js` | auto-generated photo list |
| `list-photos.js` | scans single/ + double/ |
| `assets/photos/` | optimised photos |
| `assets/audio/` | romantic.mp3 + rang-jo-lagyo.mp3 |
