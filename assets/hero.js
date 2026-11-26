// Cover-art style hero: a gently rocking ball-and-stick model over drifting light.
// Molecules come from assets/molecules.js (generated from the author's .xyz file); one is picked
// at random on each visit and the button under the art switches to the next one.
(function () {
  var cv = document.getElementById('mol');
  var LIB = window.HERO_MOLECULES || [];
  if (!cv || !cv.getContext || !LIB.length) return;
  var ctx = cv.getContext('2d');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- look ----------
  var STYLE = {
    H:  { r: 0.27, lo: '#5d6276', mid: '#cfd3e2', hi: '#ffffff', st: '150,154,172' },
    C:  { r: 0.42, lo: '#141726', mid: '#5b6383', hi: '#d2d7ee', st: '52,57,84' },
    N:  { r: 0.45, lo: '#14205f', mid: '#4f72ff', hi: '#d4ddff', st: '52,72,170' },
    O:  { r: 0.45, lo: '#5a0c12', mid: '#e0403f', hi: '#ffd2cc', st: '150,50,55' },
    F:  { r: 0.40, lo: '#3b5e12', mid: '#9ed654', hi: '#f0ffd2', st: '110,150,60' },
    S:  { r: 0.58, lo: '#6b5200', mid: '#e8c22a', hi: '#fff5c2', st: '160,130,40' },
    Cl: { r: 0.55, lo: '#1d5a1d', mid: '#4fcf52', hi: '#d8ffd6', st: '60,140,60' },
    Ni: { r: 0.72, lo: '#1f5940', mid: '#5fbf95', hi: '#e2fff0', st: '60,130,100', glow: '110,220,170' },
    Zn: { r: 0.72, lo: '#3b2a7e', mid: '#9a82ea', hi: '#f3edff', st: '96,78,170', glow: '150,115,255' },
    Tb: { r: 0.92, lo: '#0d4b45', mid: '#3cc9b4', hi: '#dafff9', st: '40,140,128', glow: '90,220,200' }
  };
  function style(el) { return STYLE[el] || STYLE.C; }

  var specks = [];
  for (var i = 0; i < 22; i++) specks.push({ x: Math.random(), y: Math.random(), r: 8 + Math.random() * 46, a: 0.05 + Math.random() * 0.12, s: 0.2 + Math.random() * 0.8, hue: Math.random() < 0.7 ? '170,140,255' : '255,120,170' });

  // ---------- current molecule ----------
  var cur, M, nbrs, halfW, halfH, glow;
  function choose(idx) {
    cur = (idx + LIB.length) % LIB.length;
    M = LIB[cur];
    nbrs = M.el.map(function () { return []; });
    M.bonds.forEach(function (b) { nbrs[b[0]].push([b[1], b[2] === 'c']); nbrs[b[1]].push([b[0], b[2] === 'c']); });
    // half-extents that stay valid while the model rocks about the vertical axis
    halfW = 0; halfH = 0; glow = '150,115,255';
    M.xyz.forEach(function (p, i) {
      var r = style(M.el[i]).r;
      halfW = Math.max(halfW, Math.hypot(p[0], p[2]) + r);
      halfH = Math.max(halfH, Math.hypot(p[1], p[2] * 0.45) + r);
      if (style(M.el[i]).glow) glow = style(M.el[i]).glow;
    });
    caption();
  }
  function caption() {
    var box = document.getElementById('mol-name');
    if (!box) return;
    box.textContent = '';
    var a = document.createElement('a');
    a.href = 'publications.html#pub-' + M.pub;
    a.textContent = M.name;
    box.appendChild(a);
    if (M.journal) {
      box.appendChild(document.createTextNode(' · '));
      var j = document.createElement('i'); j.textContent = M.journal; box.appendChild(j);
      box.appendChild(document.createTextNode(' ' + M.year));
    }
  }

  var W = 0, H = 0, dpr = 1, textRight = 0;
  function resize() {
    var rect = cv.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width; H = rect.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var hero = document.querySelector('.cover .hero');
    textRight = hero ? hero.getBoundingClientRect().right - rect.left : W * 0.5;
  }

  function stick(p1, p2, w, rgb, dim) {
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(' + rgb + ',' + dim + ')'; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(p1.X, p1.Y); ctx.lineTo(p2.X, p2.Y); ctx.stroke();
    ctx.strokeStyle = 'rgba(205,200,245,' + 0.30 * dim + ')'; ctx.lineWidth = w * 0.32;
    ctx.beginPath(); ctx.moveTo(p1.X - w * 0.18, p1.Y - w * 0.18); ctx.lineTo(p2.X - w * 0.18, p2.Y - w * 0.18); ctx.stroke();
  }

  function frame(t) {
    ctx.clearRect(0, 0, W, H);
    // the free box beside (desktop) or above (phone) the text block
    var narrow = W < 720, bx, by, bw, bh;
    if (narrow) { bw = W * 0.92; bh = 186; bx = W / 2; by = 14 + bh / 2; }   // keep in step with .cover-caption top in style.css
    else { var free = Math.max(W - textRight, W * 0.3); bw = free - 40; bh = H * 0.86; bx = textRight + free / 2; by = H / 2; }
    var k = Math.min(bw / 2 / halfW, bh / 2 / halfH), f = 4 * Math.max(halfW, halfH);
    var R = Math.max(halfW, halfH) * k;

    ctx.globalCompositeOperation = 'lighter';
    specks.forEach(function (p) {
      var x = ((p.x + t * 0.000004 * p.s) % 1) * W, y = p.y * H + Math.sin(t * 0.0003 * p.s + p.x * 9) * 6;
      var g = ctx.createRadialGradient(x, y, 0, x, y, p.r);
      g.addColorStop(0, 'rgba(' + p.hue + ',' + p.a + ')'); g.addColorStop(1, 'rgba(' + p.hue + ',0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, p.r, 0, Math.PI * 2); ctx.fill();
    });
    var halo = ctx.createRadialGradient(bx, by, 0, bx, by, R * 1.2);
    halo.addColorStop(0, 'rgba(' + glow + ',0.32)'); halo.addColorStop(0.5, 'rgba(' + glow + ',0.10)'); halo.addColorStop(1, 'rgba(' + glow + ',0)');
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(bx, by, R * 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    // rock about the vertical axis with a gentle tilt; the molecular plane faces the viewer at rest
    var ay = reduce ? 0.35 : 0.6 * Math.sin(t * 0.00022), ax = reduce ? -0.35 : -0.35 + 0.15 * Math.sin(t * 0.00015);
    var cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
    var P = M.xyz.map(function (p, i) {
      var x = p[0] * cy + p[2] * sy, z = -p[0] * sy + p[2] * cy, y = p[1];
      var y2 = y * cx - z * sx, z2 = y * sx + z * cx, s = f / (f + z2);
      return { X: bx + x * k * s, Y: by - y2 * k * s, z: z2, s: s, el: M.el[i] };
    });

    // Painter's order, far to near; each bond is split at its midpoint and each half is drawn
    // just before its own atom, so every ball covers the end of its own stick.
    var order = P.map(function (p, i) { return i; }).sort(function (a, b) { return P[b].z - P[a].z; });
    order.forEach(function (i) {
      var p = P[i], S = style(p.el);
      nbrs[i].forEach(function (nb) {
        var q = P[nb[0]], mid = { X: (p.X + q.X) / 2, Y: (p.Y + q.Y) / 2 };
        var w = (nb[1] ? 0.13 : 0.22) * k * (p.s + q.s) / 2;
        var dim = 0.55 + 0.45 * Math.max(0, Math.min(1, 0.5 - (p.z + q.z) / (4 * halfW)));
        stick(p, mid, w, S.st, dim);
      });
      var rr = S.r * k * p.s;
      var g = ctx.createRadialGradient(p.X - rr * 0.38, p.Y - rr * 0.42, rr * 0.08, p.X, p.Y, rr);
      g.addColorStop(0, S.hi); g.addColorStop(0.45, S.mid); g.addColorStop(1, S.lo);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.X, p.Y, rr, 0, Math.PI * 2); ctx.fill();
      if (S.glow) {
        ctx.globalCompositeOperation = 'lighter';
        var gl = ctx.createRadialGradient(p.X, p.Y, 0, p.X, p.Y, rr * 3);
        gl.addColorStop(0, 'rgba(' + S.glow + ',0.42)'); gl.addColorStop(1, 'rgba(' + S.glow + ',0)');
        ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(p.X, p.Y, rr * 3, 0, Math.PI * 2); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }
    });
  }

  // the viewer can stop the motion; the choice is remembered on this device
  var running = false, visible = true, paused = false;
  try { paused = localStorage.getItem('heroPaused') === '1'; } catch (e) {}
  function loop(t) { if (!running) return; frame(t); requestAnimationFrame(loop); }
  function start() { if (reduce || paused || running || !visible || document.hidden) return; running = true; requestAnimationFrame(loop); }
  function stop() { running = false; }

  choose(Math.floor(Math.random() * LIB.length));
  resize(); frame(performance.now());
  window.addEventListener('resize', function () { resize(); frame(performance.now()); });
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; visible ? start() : stop(); }).observe(cv);
  }
  var next = document.getElementById('mol-next');
  if (next) next.addEventListener('click', function () { choose(cur + 1); frame(performance.now()); });
  var pb = document.getElementById('mol-pause');
  if (pb) {
    if (reduce) pb.hidden = true;   // nothing moves under reduced motion
    else {
      var sync = function () {
        pb.setAttribute('aria-pressed', String(paused));
        pb.setAttribute('aria-label', paused ? '分子を動かす' : '分子の動きを止める');
      };
      sync();
      pb.addEventListener('click', function () {
        paused = !paused; sync();
        try { localStorage.setItem('heroPaused', paused ? '1' : '0'); } catch (e) {}
        paused ? stop() : start();
      });
    }
  }
  start();
  window.__heroMol = { choose: function (i) { choose(i); frame(performance.now()); }, count: LIB.length };
})();
