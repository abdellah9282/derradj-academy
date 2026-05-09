// video-player.js

// ── CSS ───────────────────────────────────────────────────────────────────────
(function () {
  if (document.getElementById('_vp_css')) return;
  const s = document.createElement('style');
  s.id = '_vp_css';
  s.textContent = `
    .vp-wrap {
      position: relative; display: block;
      width: 100%; max-width: 720px;
      background: #000; border-radius: 12px;
      font-family: sans-serif; user-select: none;
    }
    .vp-box {
      position: relative; width: 100%;
      overflow: hidden; background: #000;
    }
    /* Overlay blocks YouTube's own click-targets */
    .vp-ov { position: absolute; inset: 0; z-index: 10; }

    /* ── Control bar ── */
    .vp-bar {
      display: flex; align-items: center;
      gap: 6px; padding: 0 10px; height: 46px;
      background: #111; box-sizing: border-box;
      flex-shrink: 0;
      transition: opacity 0.35s ease;
    }
    .vp-bar.vp-hidden { opacity: 0; pointer-events: none; }

    .vp-btn {
      background: none; border: none; color: #fff;
      font-size: 21px; cursor: pointer; line-height: 1;
      padding: 4px 6px; flex-shrink: 0;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }
    .vp-time { color: #fff; font-size: 13px; white-space: nowrap; flex-shrink: 0; }
    .vp-dur  { color: #999; }
    .vp-seek {
      flex: 1; min-width: 0; height: 4px;
      cursor: pointer; accent-color: #e00; touch-action: manipulation;
    }

    /* ── Quality dropdown ── */
    .vp-qwrap { position: relative; flex-shrink: 0; }
    .vp-qbtn  {
      font-size: 12px !important; padding: 3px 7px !important;
      font-weight: 700; color: #aaa !important; letter-spacing: .4px;
    }
    .vp-qbtn:hover { color: #fff !important; }
    .vp-qmenu {
      position: absolute; bottom: calc(100% + 6px); right: 0;
      background: rgba(10,10,10,.97);
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 8px; padding: 4px 0; min-width: 90px;
      z-index: 300; box-shadow: 0 6px 20px rgba(0,0,0,.7);
    }
    .vp-qmenu.vp-qhide { display: none; }
    .vp-qi {
      display: block; width: 100%; background: none; border: none;
      color: #bbb; padding: 9px 14px; text-align: left;
      cursor: pointer; font-size: 13px; white-space: nowrap;
      transition: background .15s;
    }
    .vp-qi:hover { background: rgba(255,255,255,.08); color: #fff; }
    .vp-qi.vp-qact { color: #e33; font-weight: 700; }

    /* ══════════════════════════════════════════
       FULLSCREEN: bar overlays the video
       so the video fills 100% of the screen
       ══════════════════════════════════════════ */
    .vp-wrap.vp-fs,
    .vp-wrap.vp-fb {
      /* box fills the entire wrap (= entire screen) */
    }
    .vp-wrap.vp-fs .vp-box,
    .vp-wrap.vp-fb .vp-box {
      width: 100% !important;
      height: 100% !important;   /* fills 100vh */
    }
    /* Bar floats over the video at the bottom */
    .vp-wrap.vp-fs .vp-bar,
    .vp-wrap.vp-fb .vp-bar {
      position: absolute !important;
      bottom: 0 !important; left: 0 !important; right: 0 !important;
      height: 52px !important;
      background: linear-gradient(to top, rgba(0,0,0,.9) 60%, transparent) !important;
      z-index: 50 !important;
    }
    /* CSS-only fallback fullscreen */
    .vp-wrap.vp-fb {
      position: fixed !important; inset: 0 !important;
      max-width: 100vw !important; width: 100vw !important;
      height: 100vh !important;   border-radius: 0 !important;
      z-index: 999999 !important;
    }

    /* Hide cursor */
    .vp-nocursor, .vp-nocursor * { cursor: none !important; }

    @media (max-width: 600px) {
      .vp-btn { font-size: 19px; padding: 5px 7px; }
      .vp-bar { height: 52px; }
    }
  `;
  document.head.appendChild(s);
})();

// ── YouTube IFrame API ────────────────────────────────────────────────────────
(function () {
  if (window._vpYTLoaded) return;
  window._vpYTLoaded = true;
  window._vpYTQ = [];
  const t = document.createElement('script');
  t.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(t);
})();
window.onYouTubeIframeAPIReady = function () {
  window._vpYTReady = true;
  (window._vpYTQ || []).forEach(f => f());
  window._vpYTQ = [];
};
function _yt(fn) {
  window._vpYTReady ? fn() : (window._vpYTQ = window._vpYTQ || [], window._vpYTQ.push(fn));
}

// ── Quality helpers ───────────────────────────────────────────────────────────
const Q_PRIORITY = ['hd2160','hd1440','hd1080','hd720','large','medium','small','tiny'];
const Q_LABEL    = {
  hd2160:'2160p', hd1440:'1440p', hd1080:'1080p',
  hd720:'720p',   large:'480p',   medium:'360p',
  small:'240p',   tiny:'144p',
};

function _bestQuality(player) {
  const available = player.getAvailableQualityLevels() || [];
  return Q_PRIORITY.find(q => available.includes(q)) || 'hd1080';
}

// Apply quality + seek trick to force YouTube to rebuffer at new quality
function _applyQuality(player, quality) {
  try {
    player.setPlaybackQuality(quality);
    const t = player.getCurrentTime();
    player.seekTo(t > 0.5 ? t - 0.1 : 0, true);
  } catch (_) {}
}

// ── State ─────────────────────────────────────────────────────────────────────
const _players = {}, _timers = {};

function _fmt(s) {
  s = Math.floor(s || 0);
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}
function _fillIframe(iframe) {
  iframe.style.cssText =
    'position:absolute;top:0;left:0;width:100%;height:100%;border:none;display:block;';
}
function _fixBoxH(wrap, box) {
  box.style.height = Math.round(wrap.clientWidth * 9 / 16) + 'px';
}

// ── Entry point ───────────────────────────────────────────────────────────────
function loadYoutubeVideo(containerId, videoId) {
  const host = document.getElementById(containerId);
  if (!host) return;

  if (_players[containerId]) {
    try { _players[containerId].destroy(); } catch (e) {}
    delete _players[containerId];
  }
  clearInterval(_timers[containerId]);

  const W  = containerId + '_w';
  const B  = containerId + '_b';
  const P  = containerId + '_p';
  const O  = containerId + '_o';
  const BR = containerId + '_bar';

  host.innerHTML = `
<div id="${W}" class="vp-wrap">
  <div id="${B}" class="vp-box">
    <div id="${P}"></div>
    <div id="${O}" class="vp-ov"></div>
  </div>
  <div id="${BR}" class="vp-bar">
    <button id="${containerId}_bt" class="vp-btn">▶</button>
    <span   id="${containerId}_cu" class="vp-time">0:00</span>
    <input  id="${containerId}_sk" class="vp-seek" type="range" min="0" max="100" value="0" step="0.1">
    <span   id="${containerId}_du" class="vp-time vp-dur">0:00</span>
    <div class="vp-qwrap">
      <button id="${containerId}_qb" class="vp-btn vp-qbtn">HD</button>
      <div    id="${containerId}_qm" class="vp-qmenu vp-qhide"></div>
    </div>
    <button id="${containerId}_fs" class="vp-btn" title="شاشة كاملة">⛶</button>
  </div>
</div>`;

  const wrap = document.getElementById(W);
  const box  = document.getElementById(B);
  _fixBoxH(wrap, box);

  _yt(() => {
    const player = new YT.Player(P, {
      videoId,
      width:  box.clientWidth  || 640,
      height: box.clientHeight || 360,
      playerVars: {
        autoplay: 1, controls: 0, rel: 0,
        modestbranding: 1, iv_load_policy: 3,
        disablekb: 1, fs: 0,
        origin: 'https://derradjacademy.com',
        playsinline: 1,
        vq: 'hd1080',
      },
      events: {
        onReady: ev => {
          const iframe = ev.target.getIframe();
          _fillIframe(iframe);

          // Pause → wait for quality levels → set best → seek 0 → play
          ev.target.pauseVideo();
          setTimeout(() => {
            const best = _bestQuality(ev.target);
            const qb   = document.getElementById(containerId + '_qb');
            try { ev.target.setPlaybackQuality(best); } catch (_) {}
            if (qb) qb.textContent = Q_LABEL[best] || 'HD';
            setTimeout(() => {
              ev.target.seekTo(0, true);
              ev.target.playVideo();
            }, 200);
          }, 600); // wait 600ms for YouTube to populate quality levels

          _wire(containerId, ev.target, W, B, BR, O, iframe);
        },

        onStateChange: ev => {
          const b = document.getElementById(containerId + '_bt');
          if (b) b.textContent =
            ev.data === YT.PlayerState.PLAYING ? '⏸' : '▶';
        },

        // Sync quality label when YouTube changes quality
        onPlaybackQualityChange: ev => {
          const qb = document.getElementById(containerId + '_qb');
          if (qb && Q_LABEL[ev.data]) qb.textContent = Q_LABEL[ev.data];
        },
      },
    });
    _players[containerId] = player;
  });
}

// ── Wire controls ─────────────────────────────────────────────────────────────
function _wire(cid, player, W, B, BR, O, iframe) {
  const wrap  = document.getElementById(W);
  const box   = document.getElementById(B);
  const bar   = document.getElementById(BR);
  const ov    = document.getElementById(O);
  const btn   = document.getElementById(cid + '_bt');
  const seek  = document.getElementById(cid + '_sk');
  const cu    = document.getElementById(cid + '_cu');
  const du    = document.getElementById(cid + '_du');
  const qBtn  = document.getElementById(cid + '_qb');
  const qMenu = document.getElementById(cid + '_qm');
  const fsBtn = document.getElementById(cid + '_fs');
  if (!wrap) return;

  // Responsive 16:9 in normal mode
  const ro = new ResizeObserver(() => {
    if (!wrap.classList.contains('vp-fs') && !wrap.classList.contains('vp-fb')) {
      _fixBoxH(wrap, box);
      _fillIframe(iframe);
    }
  });
  ro.observe(wrap);

  // ── Play / Pause ──────────────────────────────────────────────────────────
  function toggle() {
    player.getPlayerState() === YT.PlayerState.PLAYING
      ? player.pauseVideo() : player.playVideo();
  }
  ov.addEventListener('click', toggle);
  btn.addEventListener('click', toggle);

  // ── Seek ──────────────────────────────────────────────────────────────────
  let seeking = false;
  seek.addEventListener('pointerdown', () => { seeking = true; });
  seek.addEventListener('input', () => {
    const d = player.getDuration();
    if (d) player.seekTo((seek.value / 100) * d, true);
  });
  seek.addEventListener('pointerup',  () => { seeking = false; });
  seek.addEventListener('touchend',   () => { seeking = false; });

  // ── Quality menu ──────────────────────────────────────────────────────────
  let activeQ = 'hd1080';

  function buildMenu() {
    const available = (player.getAvailableQualityLevels() || []).filter(l => Q_LABEL[l]);
    const levels = available.length ? available : Q_PRIORITY.filter(l => Q_LABEL[l]);
    qMenu.innerHTML = '';
    levels.forEach(q => {
      const item = document.createElement('button');
      item.className = 'vp-qi' + (q === activeQ ? ' vp-qact' : '');
      item.textContent = Q_LABEL[q];
      item.addEventListener('click', e => {
        e.stopPropagation();
        activeQ = q;
        qBtn.textContent = Q_LABEL[q];
        qMenu.querySelectorAll('.vp-qi').forEach(i => i.classList.remove('vp-qact'));
        item.classList.add('vp-qact');
        qMenu.classList.add('vp-qhide');
        _applyQuality(player, q);
      });
      qMenu.appendChild(item);
    });
  }

  qBtn.addEventListener('click', e => {
    e.stopPropagation();
    qMenu.classList.contains('vp-qhide') ? (buildMenu(), qMenu.classList.remove('vp-qhide'))
                                          : qMenu.classList.add('vp-qhide');
  });
  document.addEventListener('click', () => qMenu.classList.add('vp-qhide'));

  // ── Auto-hide cursor + bar (after 3s idle while playing) ─────────────────
  let idleTimer = null;

  function isFS() {
    return document.fullscreenElement === wrap ||
           document.webkitFullscreenElement === wrap ||
           wrap.classList.contains('vp-fb');
  }
  function isPlaying() {
    try { return player.getPlayerState() === YT.PlayerState.PLAYING; } catch(_){ return false; }
  }

  function showUI() {
    clearTimeout(idleTimer);
    wrap.classList.remove('vp-nocursor');
    bar.classList.remove('vp-hidden');
    if (isPlaying()) {
      idleTimer = setTimeout(() => {
        wrap.classList.add('vp-nocursor');
        if (isFS()) bar.classList.add('vp-hidden');
      }, 3000);
    }
  }

  player.addEventListener('onStateChange', state => {
    if (state === YT.PlayerState.PLAYING) showUI();
    else { clearTimeout(idleTimer); wrap.classList.remove('vp-nocursor'); bar.classList.remove('vp-hidden'); }
  });

  wrap.addEventListener('mousemove',  showUI);
  wrap.addEventListener('mousedown',  showUI);
  wrap.addEventListener('touchstart', showUI, { passive: true });
  bar.addEventListener('mouseenter', () => clearTimeout(idleTimer));
  bar.addEventListener('mouseleave', () => {
    if (isPlaying()) idleTimer = setTimeout(() => {
      wrap.classList.add('vp-nocursor');
      if (isFS()) bar.classList.add('vp-hidden');
    }, 2000);
  });

  // ── Fullscreen ────────────────────────────────────────────────────────────
  const supportsFS = !!(document.documentElement.requestFullscreen ||
                        document.documentElement.webkitRequestFullscreen);

  function applyFSLayout(entering) {
    if (entering) {
      wrap.classList.add('vp-fs');
      wrap.style.borderRadius = '0';
      // box fills 100% of screen, bar overlays on top of video
      requestAnimationFrame(() => {
        box.style.height = '100%';
        _fillIframe(iframe);
        fsBtn.textContent = '✕';
        showUI();
      });
    } else {
      clearTimeout(idleTimer);
      wrap.classList.remove('vp-fs', 'vp-nocursor');
      wrap.style.borderRadius = '';
      bar.classList.remove('vp-hidden');
      box.style.height = '';        // restore to JS-managed 16:9
      _fixBoxH(wrap, box);
      _fillIframe(iframe);
      fsBtn.textContent = '⛶';
    }
  }

  // Lock screen to landscape on mobile when entering fullscreen
  function _lockLandscape() {
    try {
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {});
      } else if (screen.lockOrientation) {
        screen.lockOrientation('landscape');
      }
    } catch (_) {}
  }
  function _unlockOrientation() {
    try {
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      } else if (screen.unlockOrientation) {
        screen.unlockOrientation();
      }
    } catch (_) {}
  }

  function enterFS() {
    if (supportsFS) {
      const fn = wrap.requestFullscreen || wrap.webkitRequestFullscreen;
      fn.call(wrap)
        .then(() => _lockLandscape())
        .catch(() => { _lockLandscape(); fallbackFS(true); });
    } else {
      _lockLandscape();
      fallbackFS(true);
    }
  }
  function exitFS() {
    _unlockOrientation();
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      const fn = document.exitFullscreen || document.webkitExitFullscreen;
      fn.call(document);
    } else { fallbackFS(false); }
  }
  function fallbackFS(enter) {
    if (enter) { document.body.style.overflow = 'hidden'; wrap.classList.add('vp-fb'); }
    else        { document.body.style.overflow = '';       wrap.classList.remove('vp-fb'); }
    applyFSLayout(enter);
  }

  function onNativeFS() {
    const full = document.fullscreenElement === wrap ||
                 document.webkitFullscreenElement === wrap;
    if (!full) _unlockOrientation();
    applyFSLayout(full);
  }
  document.addEventListener('fullscreenchange',       onNativeFS);
  document.addEventListener('webkitfullscreenchange', onNativeFS);

  fsBtn.addEventListener('click', () => {
    const inFS = document.fullscreenElement === wrap ||
                 document.webkitFullscreenElement === wrap ||
                 wrap.classList.contains('vp-fb');
    inFS ? exitFS() : enterFS();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && wrap.classList.contains('vp-fb')) {
      _unlockOrientation();
      fallbackFS(false);
    }
  });

  // ── Ticker ────────────────────────────────────────────────────────────────
  _timers[cid] = setInterval(() => {
    try {
      const e = player.getCurrentTime(), d = player.getDuration();
      cu.textContent = _fmt(e);
      du.textContent = _fmt(d);
      if (!seeking && d) seek.value = (e / d) * 100;
    } catch (_) {}
  }, 500);
}
