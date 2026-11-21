/* ============================================================
   BIRTHDAY EXPERIENCE — all words + settings
   Edit here, refresh. Nothing else needs touching.
   ============================================================ */
window.BIRTHDAY_CONFIG = {
  name: "Kuchupuchu",
  from: "Anirudra",

  // Her DOB — the gate she has to enter
  dob: { d: 22, m: 11, y: 2007 },
  age: 19,

  texts: {
    dobKicker: "A LITTLE SOMETHING FOR YOU",
    dobTitle: "Enter your DOB",
    dobSub: "Sahi DOB dalo… phir kuch special hai 💗",
    dobIncomplete: "Pehle poori DOB select karo 🙈",
    dobWrong: "Hmm, yeh toh tumhari DOB nahi lagti…",
    dobHint: "Psst… 22 · 11 · 2007 😉",

    revealTitle: "Ohh, it's your birthday!",
    revealSub: "I think I made something for you…",
    revealBtn: "Click here",

    wishTitle: "Make your wish",
    blowBtn: "Blown the candles",
    giftBtn: "Gift for you 🎁",

    finalKicker: "HAPPY BIRTHDAY, MERI JAAN",
    finalLine1: "I LOVE YOU",
    finalLine2: "MY BABY GIRL",
    finalFrom: "from Anirudra"
  },

  labels: {
    single: "Tum",
    double: "Hum dono"
  },

  audio: {
    // soft romantic bed — starts when she enters her DOB
    romantic: "assets/audio/romantic.mp3",
    // Happy Birthday is synthesised (no file needed)
    // drop the real song here: assets/audio/rang-jo-lagyo.mp3
    rang: "assets/audio/rang-jo-lagyo.mp3",
    // play 0:35–1:30, then 2:10–2:50
    rangSegments: [[35, 90], [130, 170]],
    fallbackPhotoSeconds: 3.2,
    romanticVolume: 0.32,
    rangVolume: 0.72
  }
};
