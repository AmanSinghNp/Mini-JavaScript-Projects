const songs = [
  {
    id: 1,
    title: "Midnight Echoes",
    artist: "The Weeknd",
    album: "After Hours",
    cover:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDscUb3kJQAunA1gwZY2F6CR7J7OnXQSTWzuzoceZkxbKnD4BabFcsaGVp11TjejpblsP4X57wbr8kmuCppfmCLoCND0yKw0JP-aLjnn6XG1Istv5o-B_G0GYQ3yeunDLWTlzdJS_Z3r2FxjM_brC3RuqZ1bNC-Cx6lIuEYPJ1nHRM9F3Hxijd1MZHghHMImSmxCoQlSIwSvLLz9qnFxY0qX1oW_LPG7bWGdoc9URYUtusv_KtVKt0LHpwo_Fqlcnv0m0qqK8mNvxk",
    source: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: 2,
    title: "Electric Dreams",
    artist: "Daft Punk",
    album: "Discovery",
    cover:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCKlJ2soKBLEifNHH2sBZ9PXnq5bEqUu2OZEXINCIH12UIrqsY6eUTGt9vcNX8lBuE59XJLdn3p0o7drxyEm0DyqjDJHPrAZJXwMbUUMJLkaE7uO_ZMha1Xu7xcMWKFCPop_T7QFasC8IuMduf5nFwYBRVPQB2kcblR9XhjVasdjOxz6UnvuWwGChxQreFzkXTmcBU9UvRl9tO4CKDhqf_V77pcqP-04JTlflUvcvxdIxw3yZCndDbahiXyzaEjpYrTIAXcHsPNi0o",
    source: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: 3,
    title: "Retro Wave",
    artist: "Kavinsky",
    album: "OutRun",
    cover:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAOCVXGIKbEofwp9oxvraxYhzfDqYEBnROuRsX_9TjKP-1Omyt4pT-m3b78QG2hHal3PN3kVD_4x9GdVGetR2tAhaENSjq_LcbSf9glC9qxtWwA49ftG27et4eJHA2irmKt3jvNNL6rkKFB5tBO2SjOtAZGA-a80DfQxizc31qSAxFgR2Cwb1e-Oxo7BQn_w1IVFeL3ymxOe2Tyae24zFMpY7kh52KA1_KEV4idAk4zRzqUNzxFaSYFScY6uUuBFlbn188JVy_HE34",
    source: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
  {
    id: 4,
    title: "Ocean Eyes",
    artist: "Billie Eilish",
    album: "Don't Smile at Me",
    cover:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAF_6ld5cM7KOfZ2Wt2CDlvMCoRT8eYCuaMZsITY-hLtuRBszFj325suoQwp4sbN4t4ytWdUtnPHD-ZSWM5RYUH4Kc9xbv7mn20_zpsY064r2blody7hceM2I7O4OEYn_0qoDJCVyvkY4IKUOCYnyOy0BkuUr36ACFbS0OdREKgJZsrTwImAJAjffYj7cpr4wNIp0edb7uzvq2MCij5Ik1YUK9n6eVWAEzm9vXxXdazFbdSe-9V4VKZxp2TFLbdVL-j0r2hNds7ZwU",
    source: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  },
  {
    id: 5,
    title: "Neon Nights",
    artist: "The Midnight",
    album: "Endless Summer",
    cover:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDht9uYj1fkuSAzK5sFVAS9ESIVqyPVLyIrXdFCN1WbcK2lImOje6r-m4gxd-Q7nhhga2DtCfvLSkE6UEdcbs9Lkvvvtb07Finy9Jii9nrhi61oHYHD68MS4N2t7PCxsrk5VDebYk4VzFOvtbojn2Bgde0PAyBTGDKO8fog5jXEa1FO1fr-M7nDdrLPj7H3onOrqbz5nQofqVhDq4pTRFw8Qke_1ue6wfpvmFXZAiMhbPP8ug9n1IAOWyeFgA-TNVQaH64V7ukmpMg",
    source: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  },
];

// Playlists (Mock Data)
const playlists = [
  {
    title: "Daily Mix 1",
    description: "Based on your recent listening",
    cover:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA5VvfuGgvOvLzmugemyQdtGHswiSnB59gimn-l7_VYh6FEvFHH4DK6sazGAznX3abW9I-ogRC3Xdf7yxWA-pWr_yiWDpc69Tr-H-aE11zrnyngTjb1NW1omTJXizheU-Yn1htF6HinFJ_wevSqJG3WtbDtZvL5sM9k7EpgLcrTZ6izIhnSAgiJzq7JvrGg319XlTUcTWcU6CapQueJLySOXodQs_aYje9OzwP8JAVI3715BL_yeUxT0AyR64aUpNrPqu_u-DmTS3o",
    songs: [1, 2, 3], // IDs of songs in this playlist
  },
  {
    title: "Focus Flow",
    description: "Instrumental tracks for deep work",
    cover:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAzYwb3guZ4R5d4qmVVn3QfNszD8pCK6PXtzcprY4UcZMYpYujR_VCBCcizg0D4bge2OtIo5qRRGvYWzjEkB1OCDxj3xAwdhroGYKNb5LuTExvGKOZdOz0qbZoZZ6jB4ewlZVBwhRw_hRBLCanW48D8ed1XKZXMHhsiND6dt4VkIWJDrx_HNjQ-feNEpBRE8EDFVCGNoUogIG5ZDTTTMg6JKNKZFMdQydPt6lzhRECB0QCZqfmPubq5POev_mpeoqVwPTdSqMuCxiw",
    songs: [4, 5, 1],
  },
  {
    title: "Workout Energy",
    description: "High tempo beats",
    cover:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCqT5nJ6HlThZll1mU4tWpiNOKWRwGDmLuY-_cfKYRhZfiUmLCd_OsLp0egO-rtKkZS_DI8m-Yj06doxzuI7zMaEcYFo0XjPOuXnugLgiq8vJDOTtvAbVyIKLQ8zcGk81dhibUy-ynhdZWttDKlqS1kSItSfIZWRvpZ_Dtii9pHAG0MhnO4rXrZ3hMx8SNOTf59bG9E_3Ekge_Wu9qhVBXoIXneQPWxwloKoNyfb-OYWDN7kevp61S2bura6M_XUFid7hOf9kCvccA",
    songs: [2, 3, 5],
  },
];

// Audio Engine
const audio = new Audio();
let currentTrackIndex = 0;
let isPlaying = false;
let currentPlaylist = songs; // Default to all songs
let isShuffled = false;
let shuffledPlaylist = [];
let originalPlaylistOrder = [];
let repeatMode = "off"; // "off", "all", "one"
let favorites = JSON.parse(localStorage.getItem("music-player-favorites") || "[]");
let isLoading = false;
let navigationHistory = [];
let currentHistoryIndex = -1;

// DOM Elements
const playPauseBtn = document.getElementById("play-pause-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const trackTitle = document.getElementById("current-track-title");
const trackArtist = document.getElementById("current-track-artist");
const trackArt = document.getElementById("current-track-art");
const progressBar = document.getElementById("progress-bar");
const progressContainer = document.getElementById("progress-container");
const progressThumb = document.getElementById("progress-thumb");
const currentTimeEl = document.getElementById("current-time");
const totalDurationEl = document.getElementById("total-duration");
const volumeBtn = document.getElementById("mute-btn");
const volumeBar = document.getElementById("volume-bar");
const volumeContainer = document.getElementById("volume-container");
const shuffleBtn = document.getElementById("shuffle-btn");
const repeatBtn = document.getElementById("repeat-btn");
let favoriteBtn = null;
let queueBtn = null;
const searchInput = document.getElementById("search-input");

// Initialization
function init() {
  loadTrack(currentTrackIndex);
  setupEventListeners();
  renderNewReleases();
  renderMadeForYou();
}

function loadTrack(index) {
  if (index < 0) index = currentPlaylist.length - 1;
  if (index >= currentPlaylist.length) index = 0;

  currentTrackIndex = index;
  const track = currentPlaylist[index];

  isLoading = true;
  showLoadingState(true);

  audio.src = track.source;
  trackTitle.textContent = track.title;
  trackArtist.textContent = track.artist;
  trackArt.style.backgroundImage = `url("${track.cover}")`;

  // Reset progress
  progressBar.style.width = "0%";
  progressThumb.style.left = "0%";
  currentTimeEl.textContent = "0:00";
  totalDurationEl.textContent = "0:00";

  // Update favorite button
  updateFavoriteButton(track.id);

  updatePlayPauseUI();

  // Error handling
  audio.addEventListener("error", handleAudioError, { once: true });
  audio.addEventListener("canplay", () => {
    isLoading = false;
    showLoadingState(false);
  }, { once: true });
}

function handleAudioError(e) {
  isLoading = false;
  showLoadingState(false);
  showError("Failed to load track. Skipping to next...");
  setTimeout(() => {
    nextTrack();
  }, 1000);
}

function showLoadingState(show) {
  const playIcon = playPauseBtn.querySelector(".material-symbols-outlined");
  if (show) {
    playPauseBtn.classList.add("opacity-50", "cursor-wait");
    playIcon.textContent = "hourglass_empty";
  } else {
    playPauseBtn.classList.remove("opacity-50", "cursor-wait");
    updatePlayPauseUI();
  }
}

function showError(message) {
  // Create a simple toast notification
  const toast = document.createElement("div");
  toast.className = "fixed top-20 right-8 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function playTrack() {
  audio.play();
  isPlaying = true;
  updatePlayPauseUI();
}

function pauseTrack() {
  audio.pause();
  isPlaying = false;
  updatePlayPauseUI();
}

function togglePlay() {
  if (isPlaying) {
    pauseTrack();
  } else {
    playTrack();
  }
}

function nextTrack() {
  if (repeatMode === "one") {
    audio.currentTime = 0;
    playTrack();
    return;
  }

  let nextIndex;
  if (isShuffled && shuffledPlaylist.length > 0) {
    const currentTrack = currentPlaylist[currentTrackIndex];
    const currentShuffledIndex = shuffledPlaylist.findIndex(s => s.id === currentTrack.id);
    nextIndex = currentShuffledIndex + 1;
    if (nextIndex >= shuffledPlaylist.length) {
      if (repeatMode === "all") {
        shufflePlaylist();
        nextIndex = 0;
      } else {
        pauseTrack();
        return;
      }
    }
    const nextTrack = shuffledPlaylist[nextIndex];
    const actualIndex = currentPlaylist.findIndex(s => s.id === nextTrack.id);
    loadTrack(actualIndex);
  } else {
    nextIndex = currentTrackIndex + 1;
    if (nextIndex >= currentPlaylist.length) {
      if (repeatMode === "all") {
        nextIndex = 0;
      } else {
        pauseTrack();
        return;
      }
    }
    loadTrack(nextIndex);
  }
  playTrack();
}

function prevTrack() {
  if (repeatMode === "one") {
    audio.currentTime = 0;
    playTrack();
    return;
  }

  let prevIndex;
  if (isShuffled && shuffledPlaylist.length > 0) {
    const currentTrack = currentPlaylist[currentTrackIndex];
    const currentShuffledIndex = shuffledPlaylist.findIndex(s => s.id === currentTrack.id);
    prevIndex = currentShuffledIndex - 1;
    if (prevIndex < 0) {
      if (repeatMode === "all") {
        prevIndex = shuffledPlaylist.length - 1;
      } else {
        return;
      }
    }
    const prevTrack = shuffledPlaylist[prevIndex];
    const actualIndex = currentPlaylist.findIndex(s => s.id === prevTrack.id);
    loadTrack(actualIndex);
  } else {
    prevIndex = currentTrackIndex - 1;
    if (prevIndex < 0) {
      if (repeatMode === "all") {
        prevIndex = currentPlaylist.length - 1;
      } else {
        return;
      }
    }
    loadTrack(prevIndex);
  }
  playTrack();
}

function shufflePlaylist() {
  shuffledPlaylist = [...currentPlaylist];
  // Fisher-Yates shuffle
  for (let i = shuffledPlaylist.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledPlaylist[i], shuffledPlaylist[j]] = [shuffledPlaylist[j], shuffledPlaylist[i]];
  }
}

function toggleShuffle() {
  isShuffled = !isShuffled;
  if (isShuffled) {
    shufflePlaylist();
    shuffleBtn.classList.add("text-primary", "active");
    shuffleBtn.classList.remove("text-gray-400");
  } else {
    shuffleBtn.classList.remove("text-primary", "active");
    shuffleBtn.classList.add("text-gray-400");
  }
}

function toggleRepeat() {
  const modes = ["off", "all", "one"];
  const currentIndex = modes.indexOf(repeatMode);
  repeatMode = modes[(currentIndex + 1) % modes.length];
  
  const icon = repeatBtn.querySelector(".material-symbols-outlined");
  repeatBtn.classList.remove("text-primary", "text-gray-400", "active");
  
  if (repeatMode === "off") {
    repeatBtn.classList.add("text-gray-400");
    icon.textContent = "repeat";
  } else if (repeatMode === "all") {
    repeatBtn.classList.add("text-primary", "active");
    icon.textContent = "repeat";
  } else {
    repeatBtn.classList.add("text-primary", "active");
    icon.textContent = "repeat_one";
  }
}

function updatePlayPauseUI() {
  const icon = playPauseBtn.querySelector(".material-symbols-outlined");
  if (isPlaying) {
    icon.textContent = "pause";
  } else {
    icon.textContent = "play_arrow";
  }
}

// Basic Event Setup (placeholder for later phases)
function setupEventListeners() {
  playPauseBtn.addEventListener("click", togglePlay);
  nextBtn.addEventListener("click", nextTrack);
  prevBtn.addEventListener("click", prevTrack);

  // Auto-advance
  audio.addEventListener("ended", () => {
    if (repeatMode === "one") {
      audio.currentTime = 0;
      playTrack();
    } else {
      nextTrack();
    }
  });

  // Time/Progress events
  audio.addEventListener("timeupdate", updateProgress);
  audio.addEventListener("loadedmetadata", () => {
    totalDurationEl.textContent = formatTime(audio.duration);
  });

  // Seek - Click and drag
  progressContainer.addEventListener("click", setProgress);
  setupDraggableSlider(progressContainer, (percent) => {
    if (audio.duration) {
      audio.currentTime = (percent / 100) * audio.duration;
    }
  }, () => {
    if (audio.duration) {
      return (audio.currentTime / audio.duration) * 100;
    }
    return 0;
  });

  // Volume - Click and drag
  volumeBtn.addEventListener("click", toggleMute);
  volumeContainer.addEventListener("click", setVolume);
  setupDraggableSlider(volumeContainer, (percent) => {
    const volume = percent / 100;
    audio.volume = volume;
    volumeBar.style.width = `${percent}%`;
    localStorage.setItem("music-player-volume", volume);
    updateVolumeIcon(volume);
    lastVolume = volume;
  }, () => {
    return audio.volume * 100;
  });

  // Featured Play Button
  const featuredPlayBtn = document.getElementById("featured-play-btn");
  if (featuredPlayBtn) {
    featuredPlayBtn.addEventListener("click", () => {
      currentPlaylist = songs;
      loadTrack(0);
      playTrack();
    });
  }

  // Search with debouncing
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      const searchTerm = e.target.value.toLowerCase();
      
      // Show/hide clear button
      updateClearSearchButton(searchTerm.length > 0);
      
      searchTimeout = setTimeout(() => {
        const filteredSongs = songs.filter(
          (song) =>
            song.title.toLowerCase().includes(searchTerm) ||
            song.artist.toLowerCase().includes(searchTerm) ||
            song.album.toLowerCase().includes(searchTerm)
        );
        renderNewReleases(filteredSongs);
      }, 300);
    });
  }

  // Shuffle and Repeat buttons
  if (shuffleBtn) {
    shuffleBtn.addEventListener("click", toggleShuffle);
  }
  if (repeatBtn) {
    repeatBtn.addEventListener("click", toggleRepeat);
  }

  // Favorite button - get after DOM is ready
  const favoriteBtnEl = document.querySelector("#favorite-btn");
  if (favoriteBtnEl) {
    favoriteBtn = favoriteBtnEl;
    favoriteBtn.addEventListener("click", toggleFavorite);
    const currentTrack = currentPlaylist[currentTrackIndex];
    if (currentTrack) {
      updateFavoriteButton(currentTrack.id);
    }
  }

  // Queue button
  const queueBtnEl = document.getElementById("queue-btn");
  if (queueBtnEl) {
    queueBtn = queueBtnEl;
    queueBtn.addEventListener("click", showQueue);
  }

  // Mobile menu
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", toggleMobileMenu);
  }

  // Navigation buttons
  const headerButtons = document.querySelectorAll("header button");
  headerButtons.forEach(btn => {
    const icon = btn.querySelector(".material-symbols-outlined");
    if (icon) {
      if (icon.textContent.includes("chevron_left") && !btn.id) {
        btn.id = "nav-back-btn";
        btn.addEventListener("click", navigateBack);
      } else if (icon.textContent.includes("chevron_right") && !btn.id) {
        btn.id = "nav-forward-btn";
        btn.addEventListener("click", navigateForward);
      }
    }
  });

  // Add to Library button
  const allButtons = document.querySelectorAll("button");
  allButtons.forEach(btn => {
    if (btn.textContent.includes("Add to Library") && !btn.id) {
      btn.id = "add-to-library-btn";
      btn.addEventListener("click", addToLibrary);
    } else if (btn.textContent.includes("See All") && !btn.id) {
      btn.id = "see-all-btn";
      btn.addEventListener("click", showAllReleases);
    }
  });

  // Expand player button
  const expandPlayerBtn = document.querySelector("#current-track-art")?.parentElement?.querySelector("button");
  if (expandPlayerBtn && !expandPlayerBtn.id) {
    expandPlayerBtn.id = "expand-player-btn";
    expandPlayerBtn.addEventListener("click", expandPlayer);
  }

  // Navigation (Simple)
  // Assuming links have texts "Home", "Browse", etc.
  const navLinks = document.querySelectorAll("nav a");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      // Just a visual toggle for now as we don't have real routes
      navLinks.forEach((l) =>
        l.classList.remove("bg-surface-hover", "text-primary")
      );
      navLinks.forEach((l) => l.classList.add("text-gray-400"));

      link.classList.remove("text-gray-400");
      link.classList.add("bg-surface-hover", "text-primary");

      // Simple content filtering or scrolling could go here
      if (link.textContent.trim().includes("Home")) {
        document
          .getElementById("main-content")
          .scrollTo({ top: 0, behavior: "smooth" });
        renderNewReleases(songs); // Reset search
      }
    });
  });

  // Keyboard Shortcuts
  document.addEventListener("keydown", (e) => {
    // Ignore if typing in search
    if (e.target.tagName === "INPUT") return;

    switch (e.code) {
      case "Space":
        e.preventDefault();
        togglePlay();
        break;
      case "ArrowRight":
        if (e.ctrlKey || e.metaKey) {
          nextTrack();
        } else {
          audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
        }
        break;
      case "ArrowLeft":
        if (e.ctrlKey || e.metaKey) {
          prevTrack();
        } else {
          audio.currentTime = Math.max(0, audio.currentTime - 5);
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        audio.volume = Math.min(1, audio.volume + 0.1);
        volumeBar.style.width = `${audio.volume * 100}%`;
        updateVolumeIcon(audio.volume);
        break;
      case "ArrowDown":
        e.preventDefault();
        audio.volume = Math.max(0, audio.volume - 0.1);
        volumeBar.style.width = `${audio.volume * 100}%`;
        updateVolumeIcon(audio.volume);
        break;
      case "KeyM":
        e.preventDefault();
        toggleMute();
        break;
    }
  });

  // Initialize Volume from LocalStorage
  const savedVolume = localStorage.getItem("music-player-volume");
  if (savedVolume !== null) {
    audio.volume = parseFloat(savedVolume);
    volumeBar.style.width = `${audio.volume * 100}%`;
    updateVolumeIcon(audio.volume);
  }
}

let isDragging = false;

function updateProgress(e) {
  const { duration, currentTime } = e.srcElement;
  if (isNaN(duration)) return;

  const progressPercent = (currentTime / duration) * 100;
  progressBar.style.width = `${progressPercent}%`;
  progressThumb.style.left = `${progressPercent}%`;

  currentTimeEl.textContent = formatTime(currentTime);
}

function setProgress(e) {
  const width = this.clientWidth;
  const clickX = e.offsetX;
  const duration = audio.duration;

  if (duration) {
    audio.currentTime = (clickX / width) * duration;
  }
}

function setupDraggableSlider(container, onUpdate, getCurrentValue) {
  let isDraggingSlider = false;

  const startDrag = (e) => {
    isDraggingSlider = true;
    isDragging = true;
    container.style.cursor = "grabbing";
    updateSlider(e, container, onUpdate);
  };

  const updateDrag = (e) => {
    if (isDraggingSlider) {
      updateSlider(e, container, onUpdate);
    }
  };

  const endDrag = () => {
    isDraggingSlider = false;
    isDragging = false;
    container.style.cursor = "pointer";
  };

  container.addEventListener("mousedown", startDrag);
  container.addEventListener("touchstart", (e) => {
    e.preventDefault();
    startDrag(e.touches[0]);
  });

  document.addEventListener("mousemove", updateDrag);
  document.addEventListener("touchmove", (e) => {
    if (isDraggingSlider) {
      e.preventDefault();
      updateDrag(e.touches[0]);
    }
  });

  document.addEventListener("mouseup", endDrag);
  document.addEventListener("touchend", endDrag);
}

function updateSlider(e, container, onUpdate) {
  const rect = container.getBoundingClientRect();
  const x = (e.clientX || e.pageX) - rect.left;
  const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
  onUpdate(percent);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
}

let lastVolume = 1;

function setVolume(e) {
  const width = this.clientWidth;
  const clickX = e.offsetX;
  let volume = clickX / width;

  if (volume < 0) volume = 0;
  if (volume > 1) volume = 1;

  audio.volume = volume;
  volumeBar.style.width = `${volume * 100}%`;
  localStorage.setItem("music-player-volume", volume);

  updateVolumeIcon(volume);
  lastVolume = volume;
}

function toggleMute() {
  if (audio.volume > 0) {
    lastVolume = audio.volume;
    audio.volume = 0;
    volumeBar.style.width = "0%";
    updateVolumeIcon(0);
  } else {
    audio.volume = lastVolume || 1;
    volumeBar.style.width = `${audio.volume * 100}%`;
    updateVolumeIcon(audio.volume);
  }
  localStorage.setItem("music-player-volume", audio.volume);
}

function updateVolumeIcon(vol) {
  const icon = volumeBtn.querySelector(".material-symbols-outlined");
  if (vol === 0) {
    icon.textContent = "volume_off";
  } else if (vol < 0.5) {
    icon.textContent = "volume_down";
  } else {
    icon.textContent = "volume_up";
  }
}

// Placeholder render functions
function renderNewReleases(songsToRender = songs) {
  const grid = document.getElementById("new-releases-grid");
  
  if (songsToRender.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center py-12 text-center">
        <span class="material-symbols-outlined text-gray-500 mb-4" style="font-size: 48px;">search_off</span>
        <h3 class="text-white text-lg font-semibold mb-2">No results found</h3>
        <p class="text-gray-400 text-sm">Try a different search term</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = songsToRender
    .map((song) => {
      // Find the original index in the main songs array to ensure playback works correctly
      const originalIndex = songs.findIndex((s) => s.id === song.id);
      return `
        <div class="group flex flex-col gap-3 cursor-pointer" onclick="playSongFromGrid(${originalIndex})">
            <div class="relative aspect-square rounded-lg overflow-hidden bg-[#254632]">
                <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style='background-image: url("${song.cover}");'></div>
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-background-dark shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <span class="material-symbols-outlined fill">play_arrow</span>
                    </div>
                </div>
            </div>
            <div>
                <h3 class="text-white font-semibold truncate group-hover:text-primary transition-colors">${song.title}</h3>
                <p class="text-gray-400 text-sm truncate">${song.artist}</p>
            </div>
        </div>
    `;
    })
    .join("");
}

function renderMadeForYou() {
  const grid = document.getElementById("made-for-you-grid");
  grid.innerHTML = playlists
    .map(
      (playlist, index) => `
        <div class="bg-[#1a2c22] rounded-xl p-4 flex items-center gap-4 hover:bg-[#254632] transition-colors cursor-pointer group" onclick="playPlaylist(${index})">
            <div class="size-16 rounded-md bg-cover bg-center shrink-0" style='background-image: url("${playlist.cover}");'></div>
            <div class="flex-1 min-w-0">
                <h4 class="text-white font-semibold truncate">${playlist.title}</h4>
                <p class="text-gray-400 text-sm truncate">${playlist.description}</p>
            </div>
            <button class="w-10 h-10 rounded-full bg-primary text-background-dark flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                <span class="material-symbols-outlined fill">play_arrow</span>
            </button>
        </div>
    `
    )
    .join("");
}

// Helper for grid clicks
window.playSongFromGrid = (index) => {
  currentPlaylist = songs;
  loadTrack(index);
  playTrack();
};

window.playPlaylist = (index) => {
  const playlist = playlists[index];
  // Map playlist song IDs back to song objects
  const playlistSongs = playlist.songs.map((id) =>
    songs.find((s) => s.id === id)
  );
  currentPlaylist = playlistSongs;
  loadTrack(0);
  playTrack();
};

// Favorite functionality
function toggleFavorite() {
  const currentTrack = currentPlaylist[currentTrackIndex];
  const index = favorites.indexOf(currentTrack.id);
  
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(currentTrack.id);
  }
  
  localStorage.setItem("music-player-favorites", JSON.stringify(favorites));
  updateFavoriteButton(currentTrack.id);
}

function updateFavoriteButton(trackId) {
  if (!favoriteBtn) return;
  const icon = favoriteBtn.querySelector(".material-symbols-outlined");
  const isFavorite = favorites.includes(trackId);
  
  if (isFavorite) {
    favoriteBtn.classList.add("text-primary", "active");
    favoriteBtn.classList.remove("text-gray-400");
    icon.textContent = "favorite";
  } else {
    favoriteBtn.classList.remove("text-primary", "active");
    favoriteBtn.classList.add("text-gray-400");
    icon.textContent = "favorite";
  }
}

// Queue functionality
function showQueue() {
  const queueModal = document.getElementById("queue-modal");
  if (queueModal) {
    queueModal.classList.toggle("hidden");
    return;
  }
  
  const modal = document.createElement("div");
  modal.id = "queue-modal";
  modal.className = "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4";
  modal.innerHTML = `
    <div class="bg-[#1a2c22] rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-white text-xl font-bold">Queue</h2>
        <button onclick="this.closest('#queue-modal').classList.add('hidden')" class="text-gray-400 hover:text-white">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="space-y-2" id="queue-list">
        ${currentPlaylist.map((song, index) => `
          <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-[#254632] cursor-pointer ${index === currentTrackIndex ? 'bg-[#254632]' : ''}" onclick="playSongFromQueue(${index})">
            <div class="size-12 rounded-md bg-cover bg-center shrink-0" style='background-image: url("${song.cover}");'></div>
            <div class="flex-1 min-w-0">
              <p class="text-white text-sm font-medium truncate">${song.title}</p>
              <p class="text-gray-400 text-xs truncate">${song.artist}</p>
            </div>
            ${index === currentTrackIndex ? '<span class="material-symbols-outlined text-primary">volume_up</span>' : ''}
          </div>
        `).join("")}
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });
}

window.playSongFromQueue = (index) => {
  loadTrack(index);
  playTrack();
  const modal = document.getElementById("queue-modal");
  if (modal) modal.classList.add("hidden");
};

// Mobile menu
function toggleMobileMenu() {
  const sidebar = document.querySelector("aside");
  if (sidebar) {
    if (window.innerWidth < 768) {
      sidebar.classList.toggle("hidden");
      sidebar.style.position = "fixed";
      sidebar.style.zIndex = "40";
    }
  }
}

// Navigation
function navigateBack() {
  if (currentHistoryIndex > 0) {
    currentHistoryIndex--;
    const state = navigationHistory[currentHistoryIndex];
    renderContent(state);
  }
}

function navigateForward() {
  if (currentHistoryIndex < navigationHistory.length - 1) {
    currentHistoryIndex++;
    const state = navigationHistory[currentHistoryIndex];
    renderContent(state);
  }
}

function addToHistory(state) {
  navigationHistory = navigationHistory.slice(0, currentHistoryIndex + 1);
  navigationHistory.push(state);
  currentHistoryIndex = navigationHistory.length - 1;
}

function renderContent(state) {
  if (state.type === "home") {
    renderNewReleases(songs);
    document.getElementById("main-content").scrollTo({ top: 0, behavior: "smooth" });
  } else if (state.type === "search") {
    renderNewReleases(state.results);
  }
}

// Add to Library
function addToLibrary() {
  showError("Added to Library!");
  // In a real app, this would add to user's library
}

// See All
function showAllReleases() {
  addToHistory({ type: "all-releases" });
  renderNewReleases(songs);
  document.getElementById("main-content").scrollTo({ top: 0, behavior: "smooth" });
}

// Expand player
function expandPlayer() {
  showError("Expanded player view (feature coming soon)");
  // In a real app, this would show a full-screen player
}

// Clear search
function clearSearch() {
  if (searchInput) {
    searchInput.value = "";
    updateClearSearchButton(false);
    renderNewReleases(songs);
  }
}

function updateClearSearchButton(show) {
  let clearBtn = document.getElementById("clear-search-btn");
  if (show && !clearBtn) {
    clearBtn = document.createElement("button");
    clearBtn.id = "clear-search-btn";
    clearBtn.className = "absolute inset-y-0 right-0 pr-3 flex items-center text-[#95c6a9] hover:text-white";
    clearBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 20px">close</span>';
    clearBtn.addEventListener("click", clearSearch);
    const searchContainer = searchInput.parentElement;
    searchContainer.classList.add("relative");
    searchContainer.appendChild(clearBtn);
  } else if (!show && clearBtn) {
    clearBtn.remove();
  }
}


// Run init
init();












