# 🥀 Kuchupuchu · Birthday

A cinematic, scroll-driven birthday site — dark wine, cream and rose gold,
film grain, full-bleed photos, first-person Hinglish words. No voice, no audio,
no build step.

**Live:** https://aanirudra78.github.io/kuchupuchu-birthday/

## 1. Photos add karo (10–15 best photos)

1. `assets/photos/` mein photos drop karo (jpg / png / webp).
2. Folder mein terminal khol ke chalao:

```bash
node list-photos.js
```

Ye `photos-data.js` regenerate karta hai. Page refresh — cover, chapters,
reel aur ending sab automatically bhar jayenge.

> Photo order alphabetical/numeric hai (`01.jpg`, `02.jpg` … best).
> Photos nahi hain to elegant dark placeholders dikhte hain.

## 2. Words badlo (first person)

Sab kuch **`config.js`** mein hai:
- `name`, `from`, `dob`, `birthday`, `age`
- `coverKicker`, `coverLine`
- `intro.lines` — shuruaat ki baatein
- `chapters` — scroll wali 5 lines (photos ke saath)
- `reasons` — 10 lines
- `wish` — cake section
- `letter` — poori chitthi
- `ending` — last screen
- `captions` + `photoFocus` — photo captions aur face framing

`photoFocus` mein `"center 30%"` type values se portrait photos ka chehra
frame mein rehta hai.

## 3. Local dekhna

```bash
npx serve .
# ya seedha index.html double-click
```

## 4. Online update (GitHub Pages)

```bash
git add .
git commit -m "photos + new design"
git push
```

Pages 1–2 minute mein update ho jaata hai.
Link: **https://aanirudra78.github.io/kuchupuchu-birthday/**

> ⚠️ Free GitHub Pages par repo public hota hai — link jiske paas hai wahi dekh sakta hai.

## Files

| File | Kaam |
|---|---|
| `index.html` | structure |
| `styles.css` | cinematic theme + animations |
| `script.js` | scroll story, reel, cake, letter, lightbox, particles |
| `config.js` | 👈 saare words / details |
| `photos-data.js` | auto-generated photo list |
| `list-photos.js` | photos scan → `photos-data.js` |
| `assets/photos/` | 👈 photos yahan |
