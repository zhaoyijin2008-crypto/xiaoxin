/* ===========================
   蜡笔小新 · 大象舞 · script.js
   =========================== */

(function () {
  'use strict';

  /* ---------- DOM refs ---------- */
  const shinchanWrap  = document.getElementById('shinchan');
  const shinchanChar  = document.getElementById('shinchanChar');
  const soundBtn      = document.getElementById('soundBtn');
  const soundIcon     = document.getElementById('soundIcon');
  const danceText     = document.getElementById('danceText');
  const clickHint     = document.getElementById('clickHint');

  /* --- queryAll for dance class toggling --- */
  const bodyWrap = shinchanChar.querySelector('.body-wrap');
  const butt     = shinchanChar.querySelector('.butt');
  const armL     = shinchanChar.querySelector('.arm.left');
  const armR     = shinchanChar.querySelector('.arm.right');
  const legL     = shinchanChar.querySelector('.leg.left');
  const legR     = shinchanChar.querySelector('.leg.right');

  /* ---------- State ---------- */
  let isDancing   = false;
  let soundOn     = true;
  let audioCtx    = null;
  let danceTimer  = null;

  /* ---------- Dance phrases ---------- */
  const phrases = [
    '哦哦哦～',
    '大象大象！',
    '耶！',
    '嗯哼～',
    '好耶！',
    '哈哈哈！',
    '屁股扭扭～',
  ];

  /* ============================
     Web Audio - Synth Voices
     ============================ */
  function getAudioCtx() {
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        return null;
      }
    }
    // Resume if suspended (autoplay policy)
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  /**
   * Play a fun cartoon "wah-wah-wah" voice synth.
   * No external files needed — pure Web Audio API.
   */
  function playVoice() {
    if (!soundOn) return;
    const ctx = getAudioCtx();
    if (!ctx) return;

    const voices = [
      playOhOhOh,
      playDaXiangDaXiang,
      playFunnySlide,
    ];
    const fn = voices[Math.floor(Math.random() * voices.length)];
    fn(ctx);
  }

  /* "哦哦哦" - three rising notes */
  function playOhOhOh(ctx) {
    const freqs = [280, 330, 395];
    freqs.forEach((freq, i) => {
      const t = ctx.currentTime + i * 0.18;
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 0.8, t);
      osc.frequency.exponentialRampToValueAtTime(freq, t + 0.05);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.9, t + 0.14);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.35, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

      osc.start(t);
      osc.stop(t + 0.18);
    });
  }

  /* "大象大象" - playful melody */
  function playDaXiangDaXiang(ctx) {
    const melody = [
      { f: 350, d: 0.14 },
      { f: 420, d: 0.14 },
      { f: 380, d: 0.14 },
      { f: 460, d: 0.18 },
    ];
    let offset = 0;
    melody.forEach(({ f, d }) => {
      const t = ctx.currentTime + offset;
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + d);

      osc.start(t);
      osc.stop(t + d + 0.02);
      offset += d + 0.02;
    });
  }

  /* Funny slide whistle sound */
  function playFunnySlide(ctx) {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.25);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.55);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  }

  /* ============================
     Dance Logic
     ============================ */
  function startDance() {
    if (isDancing) return;
    isDancing = true;

    // Hide hint
    clickHint.classList.add('hidden');

    // Start dancing classes
    shinchanChar.classList.add('dancing');
    bodyWrap.classList.add('dancing');
    butt.classList.add('dancing');
    armL.classList.add('dancing');
    armR.classList.add('dancing');
    legL.classList.add('dancing');
    legR.classList.add('dancing');

    // Show random phrase
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    showDanceText(phrase);

    // Burst stars
    burstStars();

    // Play sound
    playVoice();

    // Stop after 3 seconds
    danceTimer = setTimeout(stopDance, 3000);
  }

  function stopDance() {
    clearTimeout(danceTimer);
    isDancing = false;

    shinchanChar.classList.remove('dancing');
    bodyWrap.classList.remove('dancing');
    butt.classList.remove('dancing');
    armL.classList.remove('dancing');
    armR.classList.remove('dancing');
    legL.classList.remove('dancing');
    legR.classList.remove('dancing');

    hideDanceText();
  }

  /* ============================
     Text Effect
     ============================ */
  function showDanceText(text) {
    danceText.textContent = text;
    danceText.className = 'dance-text show';
  }

  function hideDanceText() {
    danceText.classList.remove('show');
    danceText.classList.add('hide');
    setTimeout(() => {
      danceText.className = 'dance-text';
      danceText.textContent = '';
    }, 400);
  }

  /* ============================
     Star Burst
     ============================ */
  const starEmojis = ['⭐', '✨', '🌟', '💫', '🎵', '🎶', '❤️', '🎉'];

  function burstStars() {
    const count = 6;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.5;

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const star = document.createElement('div');
        star.className = 'star';
        star.textContent = starEmojis[Math.floor(Math.random() * starEmojis.length)];

        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        const radius = 60 + Math.random() * 60;
        star.style.left = (cx + Math.cos(angle) * radius - 12) + 'px';
        star.style.top  = (cy + Math.sin(angle) * radius - 12) + 'px';
        star.style.fontSize = (18 + Math.random() * 16) + 'px';

        document.body.appendChild(star);
        setTimeout(() => star.remove(), 900);
      }, i * 60);
    }
  }

  /* ============================
     Sound Toggle
     ============================ */
  soundBtn.addEventListener('click', () => {
    soundOn = !soundOn;
    soundIcon.textContent = soundOn ? '🔊' : '🔇';
    soundBtn.setAttribute('aria-label', soundOn ? '关闭声音' : '开启声音');
  });

  /* ============================
     Click / Tap on Shinchan
     ============================ */
  function handleInteract(e) {
    e.preventDefault();
    startDance();
  }

  shinchanWrap.addEventListener('click', handleInteract);
  shinchanWrap.addEventListener('touchend', handleInteract, { passive: false });

  // Keyboard accessibility
  shinchanWrap.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      startDance();
    }
  });

  /* ============================
     Hide hint on first interaction
     ============================ */
  let hintShown = true;
  function hideHintPermanently() {
    if (hintShown) {
      hintShown = false;
      // Hint hides on dance start
    }
  }
  shinchanWrap.addEventListener('click', hideHintPermanently, { once: true });

  /* ============================
     Resume AudioContext on iOS
     Safari requires user gesture
     ============================ */
  document.addEventListener('touchstart', () => {
    const ctx = getAudioCtx();
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }, { once: true, passive: true });

  /* ============================
     Prevent double-tap zoom on mobile
     ============================ */
  let lastTouch = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouch < 300) e.preventDefault();
    lastTouch = now;
  }, { passive: false });

  /* ============================
     Console easter egg
     ============================ */
  console.log('%c蜡笔小新大象舞 🐘', 'font-size:20px;color:#e84040;font-weight:bold;');
  console.log('%c点击小新让他跳舞！', 'font-size:14px;color:#2266cc;');

})();
