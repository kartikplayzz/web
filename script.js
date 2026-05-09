// ── DOM refs ──────────────────────────────────────────────────────────────────
const forgiveBtn    = document.querySelector("#forgiveBtn");
const dialog        = document.querySelector("#loveDialog");
const closeDialog   = document.querySelector("#closeDialog");
const surpriseBtn   = document.querySelector("#surpriseBtn");
const shayari       = document.querySelector(".shayari");
const cinemaStage   = document.querySelector("#cinemaStage");
const flashCards    = document.querySelectorAll(".flash-card");

const surpriseLines = [
  "Gussa tumhara valid hai, par pyaar mera bhi real hai.",
  "Tum maan jao toh meri playlist ka har song romantic ho jayega.",
  "Anyaaaa, ek smile de do, main apni galti ko lesson bana lunga.",
  "Tumhari khushi meri priority hai, aaj se aur clearly.",
  "Expectations high rakho, main efforts usse bhi high rakhunga.",
  "Sorry bolna easy hai, par main prove karne ke liye ready hoon.",
];

let currentLine = 0;

if (forgiveBtn) {
  forgiveBtn.addEventListener("click", () => {
    if (typeof dialog.showModal === "function") { dialog.showModal(); return; }
    alert("Anyaaaa, please smile? Bas ek chance de do.");
  });
}

if (closeDialog) {
  closeDialog.addEventListener("click", () => dialog.close());
}

if (surpriseBtn) {
  surpriseBtn.addEventListener("click", () => {
    shayari.textContent = surpriseLines[currentLine];
    currentLine = (currentLine + 1) % surpriseLines.length;
  });
}

// ── 3-D tilt (pointer events only, zero RAF cost) ────────────────────────────
if (cinemaStage) {
  cinemaStage.addEventListener("pointermove", (e) => {
    const box = cinemaStage.getBoundingClientRect();
    const x   = (e.clientX - box.left)  / box.width  - 0.5;
    const y   = (e.clientY - box.top)   / box.height - 0.5;
    cinemaStage.style.setProperty("--tilt-y", `${x *  5}deg`);
    cinemaStage.style.setProperty("--tilt-x", `${y * -5}deg`);
  });
  cinemaStage.addEventListener("pointerleave", () => {
    cinemaStage.style.setProperty("--tilt-y", "0deg");
    cinemaStage.style.setProperty("--tilt-x", "0deg");
  });
}

// ── Flash-card scroll reveal ──────────────────────────────────────────────────
if ("IntersectionObserver" in window) {
  const cardObserver = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        cardObserver.unobserve(entry.target);
      }
    }),
    { threshold: 0.28 }
  );
  flashCards.forEach((card) => cardObserver.observe(card));
} else {
  flashCards.forEach((card) => card.classList.add("is-visible"));
}

// ── Music player ──────────────────────────────────────────────────────────────
const songs = [
  { title: "Kinni Kinni",     src: "static/Kinni_Kinni_Ghost_320_Kbps.mp3" },
  { title: "Akhiyaan Gulaab", src: "static/Akhiyaan_Gulaab_Teri_Baatan_Mein_Aisa_Uljha_Jiya_320_Kbps.mp3" },
  { title: "Tu Jaane Na",     src: "static/Tu_Jaane_Na_Reprise_Ajab_Prem_Ki_Ghazab_Kahani_320_Kbps.mp3" },
  { title: "Sahiba",          src: "static/Sahiba_Priya_Saraiya_320_Kbps.mp3" },
  { title: "Tere Liye",       src: "static/Tere_Liye_Prince_320_Kbps.mp3" },
  { title: "Aapka Hi Kehna",  src: "static/Aapka_Hi_Kehna_Banta_Keh_Do_Na_-_Majboor___Zoha_Waseem___Hindi.mp3" },
];

let currentSong = 0;

const spotifyDock     = document.querySelector("#spotifyDock");
const spotifyBubble   = document.querySelector("#spotifyBubble");
const spotifyCloseBtn = document.querySelector("#spotifyCloseBtn");
const songTitle       = document.querySelector("#songTitle");
const songCounter     = document.querySelector("#songCounter");
const nextSongBtn     = document.querySelector("#nextSongBtn");
const iframeWrap      = document.querySelector(".spotify-iframe-wrap");

// Single persistent audio element — no inline HTML duplicate
const audioPlayer     = document.createElement("audio");
audioPlayer.controls  = true;
audioPlayer.style.cssText = "width:100%;border-radius:10px;accent-color:#e33d86;display:block;";
audioPlayer.preload   = "none"; // don't touch network until user opens player
if (iframeWrap) iframeWrap.appendChild(audioPlayer);

// Show title without loading bytes
if (songTitle)   songTitle.textContent   = songs[0].title;
if (songCounter) songCounter.textContent = `Our sorry soundtrack · 1/${songs.length}`;

function loadSong(idx) {
  const song = songs[idx];
  if (songTitle)   songTitle.textContent   = song.title;
  if (songCounter) songCounter.textContent = `Our sorry soundtrack · ${idx + 1}/${songs.length}`;
  audioPlayer.src = song.src;
  audioPlayer.load();
  audioPlayer.play().catch(() => {});
}

let playerOpened = false;
if (spotifyBubble) {
  spotifyBubble.addEventListener("click", () => {
    spotifyDock.classList.add("is-open");
    if (!playerOpened) { playerOpened = true; loadSong(0); } // lazy first load
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
  });
}

if (spotifyCloseBtn) {
  spotifyCloseBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    spotifyDock.classList.remove("is-open");
  });
}

if (nextSongBtn) {
  nextSongBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    currentSong = (currentSong + 1) % songs.length;
    loadSong(currentSong);
  });
}

// ── Web Audio + Beat rings (heavily optimised) ────────────────────────────────
let audioCtx, analyser, dataArray, audioReady = false;
const beatRings  = document.querySelectorAll(".beat-ring");
const heroVideo  = document.querySelector(".hero-video");
let   rafId      = null;
let   frameCount = 0;
let   lastTime   = 0;

function setupAudioContext() {
  if (audioReady) return;
  try {
    audioCtx  = new (window.AudioContext || window.webkitAudioContext)();
    analyser  = audioCtx.createAnalyser();
    analyser.fftSize = 256;              // was 512; halves computation, same bass
    analyser.smoothingTimeConstant = 0.8;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    const src = audioCtx.createMediaElementSource(audioPlayer);
    src.connect(analyser);
    analyser.connect(audioCtx.destination);
    audioReady = true;
  } catch (e) { /* not supported */ }
}

// ~30 fps cap — was running uncapped 60 fps even when silent
function animateBeat(timestamp) {
  rafId = requestAnimationFrame(animateBeat);
  if (timestamp - lastTime < 33) return;
  lastTime = timestamp;
  if (!analyser) return;

  analyser.getByteFrequencyData(dataArray);

  let bass = 0;
  for (let i = 0; i < 6; i++) bass += dataArray[i]; // fewer bins, same feel
  bass = Math.min(bass / 6 / 255, 1);

  let vol = 0;
  for (let i = 0; i < dataArray.length; i += 2) vol += dataArray[i]; // every other bin
  vol = Math.min(vol / (dataArray.length / 2) / 255, 1);

  frameCount++;

  beatRings.forEach((ring, i) => {
    const phase     = ((frameCount / 45) + i * (1 / beatRings.length)) % 1;
    const intensity = 0.5 + bass * 1.8 + vol * 0.5;
    const scale     = 0.15 + phase * intensity * 3.5;
    const opacity   = Math.max(0, (1 - phase) * (0.25 + bass * 0.75));
    ring.style.transform   = `translate(-50%, -50%) scale(${scale})`;
    ring.style.opacity     = opacity;
    const hue = 330 + i * 12;
    ring.style.borderColor = `hsla(${hue}, 80%, 65%, ${opacity})`;
    ring.style.boxShadow   = `0 0 ${12 + bass * 28}px hsla(${hue}, 90%, 60%, ${opacity * 0.6})`;
  });

  // Only touch heroVideo DOM when there's actual bass — skips most frames
  if (heroVideo && bass > 0.12) {
    heroVideo.style.transform = `scale(${1.04 + bass * 0.05})`;
    heroVideo.style.filter    = `saturate(${1.18 + bass * 0.5}) contrast(${1.05 + bass * 0.1}) blur(${Math.max(0, 1 - bass * 2)}px)`;
  }
}

function startBeat() {
  if (!rafId && audioReady) rafId = requestAnimationFrame(animateBeat);
}

function stopBeat() {
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  beatRings.forEach((r) => {
    r.style.opacity   = 0;
    r.style.transform = "translate(-50%,-50%) scale(0)";
  });
}

// RAF only runs while audio is playing
audioPlayer.addEventListener("play", () => {
  setupAudioContext();
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
  startBeat();
});
audioPlayer.addEventListener("pause", stopBeat);
audioPlayer.addEventListener("ended", stopBeat);

// Kill all JS work when tab goes to background — biggest single win on laptops
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopBeat();
  } else if (!audioPlayer.paused && audioReady) {
    startBeat();
  }
});
