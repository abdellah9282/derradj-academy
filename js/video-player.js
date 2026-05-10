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
    .vp-ov { position: absolute; inset: 0; z-index: 10; }

    .vp-bar {
      display: flex; align-items: center;
      gap: 6px; padding: 0 10px; height: 46px;
      background: #111; box-sizing: border-box;
      flex-shrink: 0;
      transition: opacity 0.4s ease;
    }
    .vp-bar.vp-hidden { opacity: 0 !important; pointer-events: none !important; }

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

    /* Quality dropdown */
    .vp-qwrap { position: relative; flex-shrink: 0; }
    .vp-qbtn  { font-size: 12px !important; padding: 3px 7px !important;
                 font-weight: 700; color: #aaa !important; letter-spacing: .4px; }
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

    /* Fullscreen: bar overlays video so video fills 100% screen */
    .vp-wrap.vp-fs .vp-box,
    .vp-wrap.vp-fb .vp-box {
      width: 100% !important; height: 100% !important;
    }
    .vp-wrap.vp-fs .vp-bar,
    .vp-wrap.vp-fb .vp-bar {
      position: absolute !important;
      bottom: 0 !important; left: 0 !important; right: 0 !important;
      height: 52px !important;
      background: linear-gradient(to top, rgba(0,0,0,.9) 60%, transparent) !important;
      z-index: 50 !important;
    }
    .vp-wrap.vp-fb {
      position: fixed !important; inset: 0 !important;
      max-width: 100vw !important; width: 100vw !important;
      height: 100vh !important; border-radius: 0 !important;
      z-index: 999999 !important;
    }

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
  const av = player.getAvailableQualityLevels() || [];
  return Q_PRIORITY.find(q => av.includes(q)) || 'hd1080';
}
function _applyQuality(player, quality) {
  try {
    player.setPlaybackQuality(quality);
    const t = player.getCurrentTime();
    player.seekTo(t > 0.5 ? t - 0.1 : 0, true);
  } catch (_) {}
}

// ── Helpers ───────────────────────────────────────────────────────────────────
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
  clearInterval(_timers[containerId + '_w']);

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
          ev.target.pauseVideo();
          setTimeout(() => {
            const best = _bestQuality(ev.target);
            const qb   = document.getElementById(containerId + '_qb');
            try { ev.target.setPlaybackQuality(best); } catch (_) {}
            if (qb) qb.textContent = Q_LABEL[best] || 'HD';
            setTimeout(() => { ev.target.seekTo(0, true); ev.target.playVideo(); }, 200);
          }, 600);
          _wire(containerId, ev.target, W, B, BR, O, iframe);
        },
        onStateChange: ev => {
          const b = document.getElementById(containerId + '_bt');
          if (b) b.textContent = ev.data === YT.PlayerState.PLAYING ? '⏸' : '▶';
        },
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

  const _isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  let _lastAct = Date.now(); // timestamp of last user interaction
  let _barVis  = true;       // current bar visibility state
  let _prevSt  = -1;         // previous player state (for edge detection)

  function _showBar() {
    if (_barVis) return;
    _barVis = true;
    bar.classList.remove('vp-hidden');
    wrap.classList.remove('vp-nocursor');
  }
  function _hideBar() {
    if (!_barVis) return;
    _barVis = false;
    bar.classList.add('vp-hidden');
    wrap.classList.add('vp-nocursor');
  }
  function _onActivity() {
    _lastAct = Date.now();
    _showBar();
  }

  // ── Auto-hide watcher (pure polling — no event dependency) ────────────────
  // Checks player state every 300ms directly via getPlayerState().
  // This is the only reliable way since player.addEventListener() in YT API
  // expects a global function NAME string, not a function reference.
  _timers[cid + '_w'] = setInterval(() => {
    try {
      const st = player.getPlayerState();
      // Detect transition INTO playing → reset idle timer
      if (st === YT.PlayerState.PLAYING && _prevSt !== YT.PlayerState.PLAYING) {
        _lastAct = Date.now();
      }
      _prevSt = st;
      if (st === YT.PlayerState.PLAYING) {
        if (Date.now() - _lastAct >= 2000) _hideBar();
      } else {
        _showBar(); // paused / buffering / ended → always show
      }
    } catch (_) {}
  }, 300);

  // User interaction → show bar + reset 2s countdown
  wrap.addEventListener('mousemove',  _onActivity);
  wrap.addEventListener('mousedown',  _onActivity);
  wrap.addEventListener('touchstart', _onActivity, { passive: true });
  if (!_isMobile) bar.addEventListener('mouseenter', _onActivity);

  // Responsive 16:9
  const ro = new ResizeObserver(() => {
    if (!wrap.classList.contains('vp-fs') && !wrap.classList.contains('vp-fb')) {
      _fixBoxH(wrap, box); _fillIframe(iframe);
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
    const av  = (player.getAvailableQualityLevels() || []).filter(l => Q_LABEL[l]);
    const lvl = av.length ? av : Q_PRIORITY.filter(l => Q_LABEL[l]);
    qMenu.innerHTML = '';
    lvl.forEach(q => {
      const item = document.createElement('button');
      item.className = 'vp-qi' + (q === activeQ ? ' vp-qact' : '');
      item.textContent = Q_LABEL[q];
      item.addEventListener('click', e => {
        e.stopPropagation();
        activeQ = q; qBtn.textContent = Q_LABEL[q];
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
    qMenu.classList.contains('vp-qhide')
      ? (buildMenu(), qMenu.classList.remove('vp-qhide'))
      : qMenu.classList.add('vp-qhide');
  });
  document.addEventListener('click', () => qMenu.classList.add('vp-qhide'));


  // ── Fullscreen ────────────────────────────────────────────────────────────
  function isFS() {
    return document.fullscreenElement === wrap ||
           document.webkitFullscreenElement === wrap ||
           wrap.classList.contains('vp-fb');
  }

  const supportsFS = !!(document.documentElement.requestFullscreen ||
                        document.documentElement.webkitRequestFullscreen);

  function applyFSLayout(entering) {
    if (entering) {
      wrap.classList.add('vp-fs');
      wrap.style.borderRadius = '0';
      requestAnimationFrame(() => {
        box.style.height = '100%';
        _fillIframe(iframe);
        fsBtn.textContent = '✕';
        _onActivity(); // show bar briefly then watcher takes over
      });
    } else {
      wrap.classList.remove('vp-fs');
      wrap.style.borderRadius = '';
      box.style.height = '';
      _fixBoxH(wrap, box);
      _fillIframe(iframe);
      fsBtn.textContent = '⛶';
      _showBar();
    }
  }

  // Orientation helpers
  function _lockLandscape() {
    const tryLock = () => {
      if (screen.orientation && screen.orientation.lock)
        screen.orientation.lock('landscape').catch(() => {});
      ['lockOrientation','mozLockOrientation','msLockOrientation']
        .forEach(fn => { if (screen[fn]) try { screen[fn]('landscape'); } catch(_){} });
    };
    setTimeout(tryLock, 150);
  }
  function _unlockOrientation() {
    try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); }
    catch (_) {}
    ['unlockOrientation','mozUnlockOrientation','msUnlockOrientation']
      .forEach(fn => { if (screen[fn]) try { screen[fn](); } catch(_){} });
  }

  function _onOrientationChange() {
    if (!isFS()) return;
    setTimeout(() => {
      box.style.width = '100%'; box.style.height = '100%'; _fillIframe(iframe);
    }, 350);
  }
  window.addEventListener('orientationchange', _onOrientationChange);
  if (screen.orientation) screen.orientation.addEventListener('change', _onOrientationChange);

  function enterFS() {
    if (supportsFS) {
      const fn = wrap.requestFullscreen || wrap.webkitRequestFullscreen;
      fn.call(wrap).then(_lockLandscape).catch(() => { fallbackFS(true); _lockLandscape(); });
    } else { fallbackFS(true); _lockLandscape(); }
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
    const full = document.fullscreenElement === wrap || document.webkitFullscreenElement === wrap;
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
      _unlockOrientation(); fallbackFS(false);
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
