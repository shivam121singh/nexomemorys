// Dynamic tilt angles for polaroid scrapbook effect
const TILTS = [-3.5, -2, -1, 1.5, 2.5, 3];

function getTilt() {
  return TILTS[Math.floor(Math.random() * TILTS.length)];
}

// 1. Fetch & Render memories
async function renderVaultMemories() {
  const container = document.getElementById('memoryWallGrid');
  if (!container) return;

  container.innerHTML = '<p style="color:var(--text-muted); text-align:center; grid-column:1/-1;">Fetching vault archive from MongoDB...</p>';

  const memories = await LoreAPI.fetchMemories();
  container.innerHTML = '';

  if (memories.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted); text-align:center; grid-column:1/-1;">The vault is empty. Be the first to drop some lore!</p>';
    return;
  }

  memories.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'polaroid-card';
    card.style.setProperty('--rot', `${getTilt()}deg`);

    const mediaHtml = item.mediaType === 'video'
      ? `<video controls class="polaroid-media"><source src="${item.url}" type="video/mp4"></video>`
      : `<img src="${item.url}" alt="${item.caption || 'Memory'}" loading="lazy" />`;

    card.innerHTML = `
      <div class="media-box">
        ${mediaHtml}
      </div>
      <div class="polaroid-info">
        <p class="polaroid-caption">${item.caption || 'Untitled lore.'}</p>
        <div class="polaroid-meta">
          <span>— @${item.uploader}</span>
          <button class="like-btn" onclick="handleLike('${item._id}', this)">
            ❤️ <span>${item.likes || 0}</span>
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

// 2. Upload Modal
function openUploadModal() {
  document.getElementById('uploadModal').style.display = 'flex';
}

function closeUploadModal() {
  document.getElementById('uploadModal').style.display = 'none';
  document.getElementById('uploadStatusMessage').innerText = '';
}

async function handleMediaUpload(e) {
  e.preventDefault();

  const fileInput = document.getElementById('mediaFileInput');
  const uploader = document.getElementById('uploaderInput').value;
  const caption = document.getElementById('captionInput').value;
  const pin = document.getElementById('pinInput').value;
  const statusEl = document.getElementById('uploadStatusMessage');
  const submitBtn = document.getElementById('uploadSubmitBtn');

  if (!fileInput.files[0]) {
    statusEl.innerText = 'Please select a photo or video!';
    return;
  }

  const formData = new FormData();
  formData.append('mediaFile', fileInput.files[0]);
  formData.append('uploader', uploader);
  formData.append('caption', caption);
  formData.append('pin', pin);

  submitBtn.disabled = true;
  statusEl.innerText = 'Uploading to Cloudinary & MongoDB Atlas... ⏳';

  try {
    await LoreAPI.uploadMemory(formData);
    statusEl.innerText = 'Saved to vault forever! ✨';
    setTimeout(() => {
      closeUploadModal();
      document.getElementById('loreUploadForm').reset();
      renderVaultMemories();
    }, 1200);
  } catch (err) {
    statusEl.innerText = `Error: ${err.message}`;
  } finally {
    submitBtn.disabled = false;
  }
}

// 3. Like functionality
async function handleLike(id, btnElement) {
  const updated = await LoreAPI.likeMemory(id);
  if (updated && updated.likes !== undefined) {
    btnElement.querySelector('span').innerText = updated.likes;
    btnElement.style.transform = 'scale(1.3)';
    setTimeout(() => { btnElement.style.transform = 'scale(1)'; }, 200);
  }
}

// 4. Dark/Light Theme toggle
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const target = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', target);
}

// 5. Soundwave Equalizer Generator & Synthesizer Engine
const TOTAL_BARS = 32;
const equalizerWave = document.getElementById('equalizerWave');
const bars = [];

for (let i = 0; i < TOTAL_BARS; i++) {
  const bar = document.createElement('div');
  bar.className = 'wave-bar';
  equalizerWave.appendChild(bar);
  bars.push(bar);
}

let audioCtx = null;
let isAudioPlaying = false;
let synthTimer = null;
let visualizerTimer = null;

function toggleSoundtrack() {
  const vinyl = document.getElementById('vinylRecord');
  const btn = document.getElementById('audioToggleBtn');

  if (!isAudioPlaying) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    isAudioPlaying = true;
    vinyl.classList.add('spinning');
    btn.innerText = '⏸ PAUSE SOUNDTRACK';
    btn.classList.replace('btn-pink', 'btn-lime');

    // Chords: Cmaj7, Am7, Fmaj7, G7
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 349.23]  // G7
    ];
    let chordIndex = 0;

    synthTimer = setInterval(() => {
      if (!isAudioPlaying) return;
      const currentChord = chords[chordIndex % chords.length];
      chordIndex++;

      currentChord.forEach((freq, idx) => {
        setTimeout(() => {
          if (!isAudioPlaying) return;
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.6);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 1.6);
        }, idx * 120);
      });
    }, 1800);

    // Dynamic wave animation loop
    visualizerTimer = setInterval(() => {
      bars.forEach((bar) => {
        const height = Math.floor(Math.random() * 32) + 6;
        bar.style.height = `${height}px`;
      });
    }, 100);

  } else {
    isAudioPlaying = false;
    vinyl.classList.remove('spinning');
    btn.innerText = '▶ RESUME SOUNDTRACK';
    btn.classList.replace('btn-lime', 'btn-pink');
    clearInterval(synthTimer);
    clearInterval(visualizerTimer);

    // Reset visualizer bars
    bars.forEach((bar) => {
      bar.style.height = '6px';
    });
  }
}

// Initial Run
document.addEventListener('DOMContentLoaded', () => {
  renderVaultMemories();
});