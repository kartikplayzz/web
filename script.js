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

// ── Compact music player: two songs + collapse ──
const songs = [
  {
    title: "Tere Vaaste",
    src: "https://open.spotify.com/embed/track/3F3ZuXYFXGM1V6pk3b3zmi?utm_source=generator&autoplay=1"
  },
  {
    title: "Tum Hi Ho",
    src: "https://open.spotify.com/embed/track/2tjWCe2W7sgvS3C8NHcdtI?utm_source=generator&autoplay=1"
  }
];

let currentSong = 0;

const spotifyDock    = document.querySelector("#spotifyDock");
const spotifyIframe  = document.querySelector("#spotifyIframe");
const songTitle      = document.querySelector("#songTitle");
const nextSongBtn    = document.querySelector("#nextSongBtn");
const spotifyToggle  = document.querySelector("#spotifyToggle");
const songCounter    = document.querySelector(".spotify-label span");

function loadSong(idx) {
  const song = songs[idx];
  spotifyIframe.src = song.src;
  songTitle.textContent = song.title;
  if (songCounter) songCounter.textContent = `Our sorry soundtrack · ${idx + 1}/${songs.length}`;
}

if (nextSongBtn) {
  nextSongBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    currentSong = (currentSong + 1) % songs.length;
    loadSong(currentSong);
  });
}

if (spotifyToggle) {
  spotifyToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    spotifyDock.classList.toggle("is-collapsed");
    spotifyToggle.textContent = spotifyDock.classList.contains("is-collapsed") ? "▼" : "▲";
    spotifyToggle.title = spotifyDock.classList.contains("is-collapsed") ? "Expand" : "Collapse";
  });
}
