const forgiveBtn = document.querySelector("#forgiveBtn");
const dialog = document.querySelector("#loveDialog");
const closeDialog = document.querySelector("#closeDialog");
const surpriseBtn = document.querySelector("#surpriseBtn");
const shayari = document.querySelector(".shayari");
const cinemaStage = document.querySelector("#cinemaStage");
const flashCards = document.querySelectorAll(".flash-card");

const surpriseLines = [
  "Gussa tumhara valid hai, par pyaar mera bhi real hai.",
  "Tum maan jao toh meri playlist ka har song romantic ho jayega.",
  "Anyaaaa, ek smile de do, main apni galti ko lesson bana lunga.",
  "Tumhari khushi meri priority hai, aaj se aur clearly.",
  "Expectations high rakho, main efforts usse bhi high rakhunga.",
  "Sorry bolna easy hai, par main prove karne ke liye ready hoon."
];

let currentLine = 0;

forgiveBtn.addEventListener("click", () => {
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
    return;
  }

  alert("Anyaaaa, please smile? Bas ek chance de do.");
});

closeDialog.addEventListener("click", () => {
  dialog.close();
});

surpriseBtn.addEventListener("click", () => {
  shayari.textContent = surpriseLines[currentLine];
  currentLine = (currentLine + 1) % surpriseLines.length;
});

if (cinemaStage) {
  cinemaStage.addEventListener("pointermove", (event) => {
    const box = cinemaStage.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    cinemaStage.style.setProperty("--tilt-y", `${x * 5}deg`);
    cinemaStage.style.setProperty("--tilt-x", `${y * -5}deg`);
  });

  cinemaStage.addEventListener("pointerleave", () => {
    cinemaStage.style.setProperty("--tilt-y", "0deg");
    cinemaStage.style.setProperty("--tilt-x", "0deg");
  });
}

if ("IntersectionObserver" in window) {
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          cardObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.28 }
  );

  flashCards.forEach((card) => cardObserver.observe(card));
} else {
  flashCards.forEach((card) => card.classList.add("is-visible"));
}

// ── Music player: bubble → click to expand ──
const songs = [
  {
    title: "Kinni Kinni",
    type: "mp3",
    src: "static/Kinni_Kinni_Ghost_320_Kbps.mp3"
  },
  {
    title: "Akhiyaan Gulaab",
    type: "mp3",
    src: "static/Akhiyaan_Gulaab_Teri_Baaton_Mein_Aisa_Uljha_Jiya_320_Kbps.mp3"
  },
  {
    title: "Tu Jaane Na",
    type: "mp3",
    src: "static/Tu_Jaane_Na_Reprise_Ajab_Prem_Ki_Ghazab_Kahani_320_Kbps.mp3"
  },
  {
    title: "Sahiba",
    type: "mp3",
    src: "static/Sahiba_Priya_Saraiya_320_Kbps.mp3"
  },
  {
    title: "Tere Liye",
    type: "mp3",
    src: "static/Tere_Liye_Prince_320_Kbps.mp3"
  },
  {
    title: "Aapka Hi Kehna",
    type: "mp3",
    src: "static/Aapka_Hi_Kehna_Banta_Keh_Do_Na_-_Majboor___Zoha_Waseem___Hindi.mp3"
  }
];

let currentSong = 0;

const spotifyDock     = document.querySelector("#spotifyDock");
const spotifyBubble   = document.querySelector("#spotifyBubble");
const spotifyCloseBtn = document.querySelector("#spotifyCloseBtn");
const audioEl         = document.querySelector("#spotifyIframe");
const songTitle       = document.querySelector("#songTitle");
const songCounter     = document.querySelector("#songCounter");
const nextSongBtn     = document.querySelector("#nextSongBtn");
const iframeWrap      = document.querySelector(".spotify-iframe-wrap");

function loadSong(idx) {
  const song = songs[idx];
  songTitle.textContent = song.title;
  if (songCounter) songCounter.textContent = `Our sorry soundtrack · ${idx + 1}/${songs.length}`;

  if (song.type === "mp3") {
    iframeWrap.innerHTML = `
      <audio controls autoplay style="width:100%;border-radius:10px;accent-color:#e33d86;">
        <source src="${song.src}" type="audio/mpeg" />
      </audio>`;
  } else {
    iframeWrap.innerHTML = `
      <iframe
        title="Spotify"
        src="${song.src}"
        width="100%" height="80" frameborder="0"
        style="border-radius:10px;display:block;"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture">
      </iframe>`;
  }
}

// Bubble click → open panel
if (spotifyBubble) {
  spotifyBubble.addEventListener("click", () => {
    spotifyDock.classList.add("is-open");
  });
}

// × button → close panel, show bubble again
if (spotifyCloseBtn) {
  spotifyCloseBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    spotifyDock.classList.remove("is-open");
  });
}

// Next song button
if (nextSongBtn) {
  nextSongBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    currentSong = (currentSong + 1) % songs.length;
    loadSong(currentSong);
  });
}
