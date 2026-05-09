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

if (forgiveBtn) forgiveBtn.addEventListener("click", () => {
  typeof dialog.showModal === "function"
    ? dialog.showModal()
    : alert("Anyaaaa, please smile? Bas ek chance de do.");
});
if (closeDialog) closeDialog.addEventListener("click", () => dialog.close());
if (surpriseBtn) surpriseBtn.addEventListener("click", () => {
  shayari.textContent = surpriseLines[currentLine];
  currentLine = (currentLine + 1) % surpriseLines.length;
});

// ── Cinema 3-D tilt (no RAF — only fires on pointer move) ────────────────────
if (cinemaStage) {
  cinemaStage.addEventListener("pointermove", (e) => {
    const b = cinemaStage.getBoundingClientRect();
    cinemaStage.style.setProperty("--tilt-y", `${((e.clientX - b.left)  / b.width  - 0.5) *  5}deg`);
    cinemaStage.style.setProperty("--tilt-x", `${((e.clientY - b.top)   / b.height - 0.5) * -5}deg`);
  });
  cinemaStage.addEventListener("pointerleave", () => {
    cinemaStage.style.setProperty("--tilt-y", "0deg");
    cinemaStage.style.setProperty("--tilt-x", "0deg");
  });
}

// ── Flash-card reveal ─────────────────────────────────────────────────────────
if ("IntersectionObserver" in window) {
  const cardObs = new IntersectionObserver(
    (entries) => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("is-visible"); cardObs.unobserve(e.target); }
    }), { threshold: 0.28 }
  );
  flashCards.forEach(c => cardObs.observe(c));
} else {
  flashCards.forEach(c => c.classList.add("is-visible"));
}

// ── KEY FIX: Pause CSS animations for off-screen sections ────────────────────
// content-visibility does NOT stop animations — we must do it manually.
// CSS has animation-play-state: paused by default for these sections.
// Adding .section-visible sets animation-play-state: running via CSS.
const animatedSections = document.querySelectorAll(
  ".sticker-section, .car-section, .photo-story-section"
);
if ("IntersectionObserver" in window && animatedSections.length) {
  const sectionObs = new IntersectionObserver(
    (entries) => entries.forEach(e => {
      e.target.classList.toggle("section-visible", e.isIntersecting);
    }),
    { rootMargin: "100px 0px" }  // start a little before entering view
  );
  animatedSections.forEach(s => sectionObs.observe(s));
}

// ── VIDEO: pause/play background video based on visibility ───────────────────
// The feature video (in hero stage) is a 2nd decode of same file — huge RAM+CPU.
// Fix: share the same MediaStream from hero-video into the feature video slot,
// or if browser doesn't support it, just pause the feature video.
const heroBg      = document.querySelector(".hero-video");
const featureVid  = document.querySelector(".hero-feature-video");

if (heroBg && featureVid) {
  // Try to share the stream (one decode, two displays) — works in modern browsers
  try {
    if (typeof heroBg.captureStream === "function") {
      featureVid.srcObject = heroBg.captureStream();
      featureVid.removeAttribute("src");
      featureVid.muted = true;
      featureVid.play().catch(() => {});
    }
    // Remove the <source> child so the browser doesn't double-load the file
    featureVid.querySelectorAll("source").forEach(s => s.remove());
  } catch (e) {
    // Fallback: just mute + allow browser to play its own copy (still better than before)
  }
}

// Pause BOTH videos when hero scrolls out of view — saves CPU when user scrolls down
if (heroBg) {
  const heroSection = document.querySelector(".hero");
  const heroObs = new IntersectionObserver(
    (entries) => {
      const visible = entries[0].isIntersecting;
      if (visible) {
        heroBg.play().catch(() => {});
        if (featureVid && featureVid.srcObject) featureVid.play().catch(() => {});
      } else {
        heroBg.pause();
        if (featureVid) featureVid.pause();
      }
    },
    { threshold: 0.05 }
  );
  if (heroSection) heroObs.observe(heroSection);
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

// Single audio element injected by JS — no duplicate HTML audio element
const audioPlayer        = document.createElement("audio");
audioPlayer.controls     = true;
audioPlayer.preload      = "none";   // Don't load any bytes until user opens player
audioPlayer.style.cssText = "width:100%;border-radius:10px;accent-color:#e33d86;display:block;";
if (iframeWrap) iframeWrap.appendChild(audioPlayer);

// Show title metadata without loading audio
if (songTitle)   songTitle.textContent   = songs[0].title;
if (songCounter) songCounter.textContent = `Our sorry soundtrack · 1/${songs.length}`;

function loadSong(idx) {
  const s = songs[idx];
  if (songTitle)   songTitle.textContent   = s.title;
  if (songCounter) songCounter.textContent = `Our sorry soundtrack · ${idx + 1}/${songs.length}`;
  audioPlayer.src = s.src;
  audioPlayer.preload = "auto";
  audioPlayer.load();
  audioPlayer.play().catch(() => {});
}

let playerOpened = false;
if (spotifyBubble) {
  spotifyBubble.addEventListener("click", () => {
    spotifyDock.classList.add("is-open");
    if (!playerOpened) { playerOpened = true; loadSong(0); }   // lazy — no network hit until click
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

// ── Beat rings — Web Audio (CPU optimised) ────────────────────────────────────
let audioCtx, analyser, dataArray, audioReady = false;
const beatRings = document.querySelectorAll(".beat-ring");
const heroVideo = document.querySelector(".hero-video");
let rafId = null, lastTime = 0, frameCount = 0;

function setupAudioContext() {
  if (audioReady) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;                    // 256 not 512 — half data, same bass feel
    analyser.smoothingTimeConstant = 0.8;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    const src = audioCtx.createMediaElementSource(audioPlayer);
    src.connect(analyser);
    analyser.connect(audioCtx.destination);
    audioReady = true;
  } catch (e) {}
}

function animateBeat(ts) {
  rafId = requestAnimationFrame(animateBeat);
  if (ts - lastTime < 34) return;             // cap at ~30 fps — was 60 fps
  lastTime = ts;
  if (!analyser) return;

  analyser.getByteFrequencyData(dataArray);

  // Bass: first 6 bins only
  let bass = 0;
  for (let i = 0; i < 6; i++) bass += dataArray[i];
  bass = Math.min(bass / 6 / 255, 1);

  // Volume: sample every 2nd bin
  let vol = 0;
  for (let i = 0; i < dataArray.length; i += 2) vol += dataArray[i];
  vol = Math.min(vol / (dataArray.length * 0.5) / 255, 1);

  frameCount++;

  beatRings.forEach((ring, i) => {
    const phase   = ((frameCount / 45) + i / beatRings.length) % 1;
    const scale   = 0.15 + phase * (0.5 + bass * 1.8 + vol * 0.5) * 3.5;
    const opacity = Math.max(0, (1 - phase) * (0.25 + bass * 0.75));
    const hue     = 330 + i * 12;
    ring.style.transform   = `translate(-50%,-50%) scale(${scale})`;
    ring.style.opacity     = opacity;
    ring.style.borderColor = `hsla(${hue},80%,65%,${opacity})`;
    ring.style.boxShadow   = `0 0 ${12 + bass * 28}px hsla(${hue},90%,60%,${opacity * 0.6})`;
  });

  // Only update heroVideo DOM when there's actual bass energy
  if (heroVideo && bass > 0.12) {
    heroVideo.style.transform = `scale(${1.04 + bass * 0.05})`;
    heroVideo.style.filter    = `saturate(${1.18 + bass * 0.5}) contrast(${1.05 + bass * 0.1}) blur(${Math.max(0, 1 - bass * 2)}px)`;
  }
}

function startBeat() { if (!rafId && audioReady) rafId = requestAnimationFrame(animateBeat); }
function stopBeat()  {
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  beatRings.forEach(r => { r.style.opacity = 0; r.style.transform = "translate(-50%,-50%) scale(0)"; });
}

audioPlayer.addEventListener("play",  () => { setupAudioContext(); if (audioCtx?.state === "suspended") audioCtx.resume(); startBeat(); });
audioPlayer.addEventListener("pause", stopBeat);
audioPlayer.addEventListener("ended", stopBeat);

// Pause all heavy work when tab goes background — biggest single win on laptops
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopBeat();
    // Also pause videos to free GPU decode when tab is backgrounded
    heroBg?.pause();
    featureVid?.pause();
  } else {
    if (!audioPlayer.paused && audioReady) startBeat();
    heroBg?.play().catch(() => {});
  }
});
