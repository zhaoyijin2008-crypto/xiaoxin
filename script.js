(function () {
  'use strict';

  var shinchanWrap = document.getElementById('shinchan');
  var shinchanChar = document.getElementById('shinchanChar');
  var soundBtn     = document.getElementById('soundBtn');
  var soundIcon    = document.getElementById('soundIcon');
  var danceText    = document.getElementById('danceText');
  var clickHint    = document.getElementById('clickHint');
  var bodyWrap     = shinchanChar.querySelector('.body-wrap');
  var butt         = shinchanChar.querySelector('.butt');
  var armL         = shinchanChar.querySelector('.arm.left');
  var armR         = shinchanChar.querySelector('.arm.right');
  var legL         = shinchanChar.querySelector('.leg.left');
  var legR         = shinchanChar.querySelector('.leg.right');

  var isDancing  = false;
  var soundOn    = true;
  var danceTimer = null;
  var audioCtx   = null;

  var phrases = ['哦哦哦～','大象大象！','耶！','嗯哼～','好耶！','哈哈哈！','屁股扭扭～'];
  var starEmojis = ['⭐','✨','🌟','💫','🎵','🎶','❤️','🎉'];

  /* ---- Web Audio (最兼容方案) ---- */
  function getCtx() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){}
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function beep(freqs, vol) {
    var ctx = getCtx(); if (!ctx) return;
    var t = ctx.currentTime;
    freqs.forEach(function(item, i) {
      var f = item[0], d = item[1], delay = item[2] || 0;
      var osc  = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0, t + delay);
      gain.gain.linearRampToValueAtTime(vol, t + delay + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + d);
      osc.start(t + delay);
      osc.stop(t + delay + d + 0.05);
    });
  }

  var sounds = [
    function() { beep([[280,0.15,0],[330,0.15,0.18],[400,0.2,0.36]], 0.4); },
    function() { beep([[350,0.13,0],[420,0.13,0.15],[380,0.13,0.30],[460,0.18,0.45]], 0.4); },
    function() {
      var ctx = getCtx(); if (!ctx) return;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.3);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.65);
    }
  ];

  function playVoice() {
    if (!soundOn) return;
    try { sounds[Math.floor(Math.random() * sounds.length)](); } catch(e) {}
  }

  /* ---- Dance ---- */
  function startDance() {
    if (isDancing) return;
    isDancing = true;
    clickHint.classList.add('hidden');
    shinchanChar.classList.add('dancing');
    bodyWrap.classList.add('dancing');
    butt.classList.add('dancing');
    armL.classList.add('dancing');
    armR.classList.add('dancing');
    legL.classList.add('dancing');
    legR.classList.add('dancing');
    showDanceText(phrases[Math.floor(Math.random() * phrases.length)]);
    burstStars();
    playVoice();
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

  function showDanceText(text) {
    danceText.textContent = text;
    danceText.className = 'dance-text show';
  }
  function hideDanceText() {
    danceText.classList.remove('show');
    danceText.classList.add('hide');
    setTimeout(function() { danceText.className = 'dance-text'; danceText.textContent = ''; }, 400);
  }

  function burstStars() {
    var cx = window.innerWidth / 2, cy = window.innerHeight * 0.5;
    for (var i = 0; i < 6; i++) {
      (function(idx) {
        setTimeout(function() {
          var el = document.createElement('div');
          el.className = 'star';
          el.textContent = starEmojis[Math.floor(Math.random() * starEmojis.length)];
          var angle = (idx / 6) * Math.PI * 2;
          var r = 60 + Math.random() * 60;
          el.style.left = (cx + Math.cos(angle) * r - 12) + 'px';
          el.style.top  = (cy + Math.sin(angle) * r - 12) + 'px';
          el.style.fontSize = (18 + Math.random() * 16) + 'px';
          document.body.appendChild(el);
          setTimeout(function() { el.remove(); }, 900);
        }, idx * 60);
      })(i);
    }
  }

  /* ---- Sound toggle ---- */
  soundBtn.addEventListener('click', function() {
    soundOn = !soundOn;
    soundIcon.textContent = soundOn ? '🔊' : '🔇';
  });

  /* ---- Click handlers ---- */
  function onInteract(e) { e.preventDefault(); startDance(); }
  shinchanWrap.addEventListener('click', onInteract);
  shinchanWrap.addEventListener('touchend', onInteract, { passive: false });
  shinchanWrap.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startDance(); }
  });

  /* ---- iOS audio unlock ---- */
  document.addEventListener('touchstart', function() {
    var c = getCtx(); if (c && c.state === 'suspended') c.resume();
  }, { once: true, passive: true });

  /* ---- Prevent double-tap zoom ---- */
  var lastTap = 0;
  document.addEventListener('touchend', function(e) {
    var now = Date.now();
    if (now - lastTap < 300) e.preventDefault();
    lastTap = now;
  }, { passive: false });

})();
