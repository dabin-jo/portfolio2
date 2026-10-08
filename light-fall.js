/*!
 * light-fall.js — 히어로의 빛 3개가 하나씩 사선으로 떨어지며 원 잔상을 남기고
 * 화면 아래로 사라지는 스크롤 전환. "빛 낙하 미리보기" 페이지와 같은 렌더링 코드입니다.
 *
 * 사용법
 *   const fall = LightFall.init({
 *     container: document.querySelector('.hero'),        // pin 되는 섹션 (position: relative 필요)
 *     lights: [                                           // 히어로 빛 DOM 요소
 *       { el: document.querySelector('.light-green'), key: 'g' },
 *       { el: document.querySelector('.light-pink'),  key: 'p' },
 *       { el: document.querySelector('.light-blue'),  key: 'b' },
 *     ],
 *     params: { ...미리보기에서 복사한 JSON... },
 *   });
 *   // GSAP ScrollTrigger 예시
 *   ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: '+=180%', pin: true, scrub: true,
 *     onUpdate: self => fall.setProgress(self.progress) });
 *
 * 이 파일은 "빛"만 담당합니다. 히어로 글자 fade-out(params.textEnd)과
 * 배경색 전환·십자말풀이 fade-in(params.bgStart)은 같은 progress 값으로 기존 코드에서 처리하세요.
 */
(function (global) {
  'use strict';

  var EASES = {
    power2: function (t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; },
    power3: function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    sine: function (t) { return -(Math.cos(Math.PI * t) - 1) / 2; },
    linear: function (t) { return t; }
  };

  // 미리보기 페이지의 "추천값"과 동일. 미리보기에서 복사한 JSON으로 덮어쓰면 됩니다.
  var DEFAULTS = {
    soft: .4, shrink: .42, order: 'pgb',
    angle: -28, handle: .4, sbend: .08, endX: .46, endY: .86, spread: .5, stagger: .08, converge: .45,
    tail: .6, spacing: .05, taper: .2, tailFade: .55, exitFade: .6,
    textEnd: .12, shrinkEnd: .25, moveStart: .15, moveEnd: 1, bgStart: .72, ease: 'power2',
    orbFade: .85, orbBlur: .03, blend: 'lighten', // 히어로 원과 같은 모양·겹침 방식
    smooth: 18,     // 잔상 전체를 부드럽게 뭉개는 정도(px). 크면 원 테두리가 덜 보임
    fadeIn: .06     // 스크롤 시작 직후 히어로 → 낙하 빛으로 서서히 넘어가는 구간
  };

  var LEVELS = 32, SPR = 256;
  var LS = .5; // 잔상은 절반 해상도로 그린 뒤 살짝 흐리게 해서 확대 — 원이 겹겹이 보이는 줄무늬를 없애고 가볍게
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var clamp = function (v) { return Math.min(1, Math.max(0, v)); };
  var sm = function (t) { return t * t * (3 - 2 * t); };
  var seg = function (p, a, b) { return b <= a ? (p >= a ? 1 : 0) : clamp((p - a) / (b - a)); };
  var cub = function (a, b, c, d, t) { var u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d; };

  // 요소의 background-image(radial-gradient)에서 색 정지점을 읽어옵니다.
  function readStops(el) {
    var bg = getComputedStyle(el).backgroundImage || '';
    var re = /rgba?\(([^)]+)\)\s*([\d.]+%)?/g, m, out = [];
    while ((m = re.exec(bg))) {
      var c = m[1].split(',').map(function (v) { return parseFloat(v); });
      out.push({ rgb: [c[0], c[1], c[2]], pos: m[2] ? parseFloat(m[2]) / 100 : null });
    }
    if (out.length < 2) return null;
    out.forEach(function (s, i) { if (s.pos == null) s.pos = i / (out.length - 1); });
    return out.map(function (s) { return [s.pos, s.rgb]; });
  }
  function hexToRgb(h) { var n = parseInt(h.slice(1), 16); return [n >> 16, n >> 8 & 255, n & 255]; }
  function normStops(stops) { // [[offset, '#hex' | [r,g,b]]]
    return stops.map(function (s) { return [s[0], typeof s[1] === 'string' ? hexToRgb(s[1]) : s[1]]; });
  }
  var rgbStr = function (c, k) { k = k == null ? 1 : k; return 'rgb(' + c.map(function (v) { return Math.round(v * k); }).join(',') + ')'; };

  function init(opts) {
    var P = Object.assign({}, DEFAULTS, opts.params || {});
    var container = opts.container;
    var cv = document.createElement('canvas');
    cv.setAttribute('aria-hidden', 'true');
    Object.assign(cv.style, {
      position: 'absolute', inset: '0', width: '100%', height: '100%', pointerEvents: 'none',
      opacity: '0', zIndex: opts.zIndex != null ? String(opts.zIndex) : '1'
    });
    container.appendChild(cv);
    var ctx = cv.getContext('2d');
    var mix = document.createElement('canvas'), mx = mix.getContext('2d');   // 절반 해상도 합성용
    var soft = document.createElement('canvas'), sx = soft.getContext('2d', { willReadFrequently: true }); // 절반 해상도 블러용

    var L = opts.lights.map(function (l) {
      var stops = l.stops ? normStops(l.stops) : readStops(l.el);
      if (!stops) { console.warn('[LightFall] 색을 읽지 못했어요. lights[].stops를 직접 넣어주세요.', l.el); stops = [[0, [255, 255, 255]], [1, [200, 200, 200]]]; }
      return { el: l.el, key: l.key, stops: stops, highlight: l.highlight, shape: l.shape, hx: 0, hy: 0, D: 0, pad: 1, layer: null, spr: null };
    });
    L.forEach(function (l) { var c = document.createElement('canvas'); l.layer = { c: c, x: c.getContext('2d') }; });

    // 히어로 원(script.js drawOrb)과 똑같이 그리는 스프라이트:
    // 같은 색 정지점 → orbFade 지점에서 투명(검정)으로, 하이라이트 중심 이동(highlight), blur(반지름 × orbBlur)
    function buildSprites() {
      L.forEach(function (l) {
        var hl = typeof l.highlight === 'function' ? (l.highlight() || [0, 0]) : (l.highlight || [0, 0]);
        var base = document.createElement('canvas'); base.width = base.height = SPR; var b = base.getContext('2d');
        b.fillStyle = '#000'; b.fillRect(0, 0, SPR, SPR);
        var R = SPR / 2, rr = R / (1 + P.orbBlur * 3); // blur가 잘리지 않도록 여백을 둠
        l.pad = R / rr;                                   // 스프라이트 크기 / 원 지름 비율
        if (l.shape && global.__paintShape) { // 히어로의 모양 있는 빛(네잎·별)과 똑같이
          var st = l.stops;
          global.__paintShape(b, l.shape, R, R, rr, [rgbStr(st[0][1]), rgbStr(st[1][1]), rgbStr(st[2][1])], hl[0], hl[1]);
        } else {
        var g = b.createRadialGradient(R + hl[0] * rr, R + hl[1] * rr, 0, R, R, rr);
        l.stops.forEach(function (s) { g.addColorStop(clamp(s[0]), rgbStr(s[1])); });
        g.addColorStop(clamp(P.orbFade), 'rgb(0,0,0)');
        b.filter = P.orbBlur > 0 ? 'blur(' + (rr * P.orbBlur) + 'px)' : 'none';
        b.fillStyle = g; b.beginPath(); b.arc(R, R, rr, 0, 7); b.fill();
        b.filter = 'none';
        }
        var lv = [];
        for (var j = 1; j <= LEVELS; j++) {
          var c = document.createElement('canvas'); c.width = c.height = SPR; var x = c.getContext('2d');
          x.drawImage(base, 0, 0); x.fillStyle = 'rgba(0,0,0,' + (1 - j / LEVELS) + ')'; x.fillRect(0, 0, SPR, SPR); lv.push(c);
        }
        l.spr = lv;
      });
    }

    var W = 0, H = 0;
    // 히어로 빛의 실제 위치·크기를 컨테이너 기준으로 측정
    function measure() {
      var cr = container.getBoundingClientRect();
      W = Math.round(cr.width); H = Math.round(cr.height);
      if (cv.width !== W || cv.height !== H) {
        cv.width = W; cv.height = H;
        var w2 = Math.ceil(W * LS), h2 = Math.ceil(H * LS);
        mix.width = soft.width = w2; mix.height = soft.height = h2;
        L.forEach(function (l) { l.layer.c.width = w2; l.layer.c.height = h2; });
      }
      L.forEach(function (l) {
        var r = l.el.getBoundingClientRect();
        l.hx = (r.left + r.width / 2 - cr.left) / W;
        l.hy = (r.top + r.height / 2 - cr.top) / H;
        l.D = Math.max(r.width, r.height);
      });
    }

    function buildPaths(Dsh) {
      var a = P.angle * Math.PI / 180, dir = [Math.sin(a), Math.cos(a)], nrm = [-dir[1], dir[0]];
      return L.map(function (l) {
        var rank = Math.max(0, P.order.indexOf(l.key));
        var h = [l.hx * W, l.hy * H];
        var off = (rank - 1) * P.spread * Dsh;
        var lead = (1 - rank) * P.spread * Dsh * .6;
        var eg = [P.endX * W + nrm[0] * off + dir[0] * lead, P.endY * H + nrm[1] * off + dir[1] * lead];
        var ey = P.endY * H + dir[1] * lead, ei = [h[0] + dir[0] / dir[1] * (ey - h[1]), ey];
        var e = [lerp(ei[0], eg[0], P.converge), lerp(ei[1], eg[1], P.converge)];
        var hl = P.handle * H;
        var c1 = [h[0] + nrm[0] * P.sbend * W + dir[0] * hl * .3, h[1] + hl * .7];
        var c2 = [e[0] - dir[0] * hl - nrm[0] * P.sbend * W, e[1] - dir[1] * hl - nrm[1] * P.sbend * W];
        var all = [], N = 140, i;
        for (i = 0; i <= N; i++) { var t = i / N; all.push([cub(h[0], c1[0], c2[0], e[0], t), cub(h[1], c1[1], c2[1], e[1], t)]); }
        var len = [0];
        for (i = 1; i < all.length; i++) len.push(len[i - 1] + Math.hypot(all[i][0] - all[i - 1][0], all[i][1] - all[i - 1][1]));
        var curve = len[len.length - 1] || 1;
        var ext = Math.max(0, (H + Dsh - e[1])) / Math.max(.2, dir[1]) + curve * P.tail + Dsh;
        for (i = 1; i <= 40; i++) { var d = ext * i / 40; all.push([e[0] + dir[0] * d, e[1] + dir[1] * d]); len.push(curve + d); }
        return { all: all, len: len, total: curve + ext, curve: curve, rank: rank };
      });
    }
    function at(path, d) {
      var all = path.all, len = path.len;
      if (d <= 0) return all[0]; if (d >= path.total) return all[all.length - 1];
      var lo = 0, hi = len.length - 1;
      while (hi - lo > 1) { var m = (lo + hi) >> 1; if (len[m] < d) lo = m; else hi = m; }
      var t = (d - len[lo]) / ((len[hi] - len[lo]) || 1);
      return [lerp(all[lo][0], all[hi][0], t), lerp(all[lo][1], all[hi][1], t)];
    }

    var prog = 0, active = false;
    function setHeroVisible(v) { L.forEach(function (l) { l.el.style.visibility = v ? '' : 'hidden'; }); cv.style.opacity = v ? '0' : '1'; }

    function render() {
      var p = prog;
      if (p <= 0.0005) {          // 히어로 상태: 원래 DOM 빛만 보이게
        if (active) { active = false; setHeroVisible(true); }
        return;
      }
      if (!active) { measure(); buildSprites(); active = true; L.forEach(function (l) { l.el.style.visibility = 'hidden'; }); }
      if (!W) return;
      var E = EASES[P.ease] || EASES.power2;
      var s1 = E(seg(p, 0, P.shrinkEnd));
      var Davg = L.reduce(function (s, l) { return s + l.D; }, 0) / L.length;
      var paths = buildPaths(Davg * P.shrink);

      mx.setTransform(1, 0, 0, 1, 0, 0); mx.globalCompositeOperation = 'source-over'; mx.fillStyle = '#000'; mx.fillRect(0, 0, mix.width, mix.height);
      L.forEach(function (l, i) {
        var lx = l.layer.x, path = paths[i];
        lx.setTransform(1, 0, 0, 1, 0, 0);
        lx.globalCompositeOperation = 'source-over'; lx.fillStyle = '#000'; lx.fillRect(0, 0, l.layer.c.width, l.layer.c.height);
        lx.setTransform(LS, 0, 0, LS, 0, 0); // 좌표는 원래 크기 그대로 쓰고 절반으로 그림
        lx.globalCompositeOperation = 'lighten';
        // 스프라이트에는 blur 여백(pad)이 포함돼 있어서, 원 지름이 히어로와 같아지도록 그만큼 키워서 그림
        var size0 = lerp(l.D, l.D * P.shrink, s1) * l.pad;
        var st = P.moveStart + path.rank * P.stagger, en = P.moveEnd - (2 - path.rank) * P.stagger;
        var sk = E(seg(p, st, Math.max(st + .01, en)));
        var head = path.total * sk;
        var tailLen = path.curve * P.tail * seg(head / path.curve, 0, .2 + P.tail * .6);
        var tail = Math.max(0, head - tailLen);
        var step = Math.max(2, size0 * P.spacing);
        var n = Math.max(1, Math.ceil((head - tail) / step));
        for (var k = 0; k <= n; k++) {
          var d = tail + (head - tail) * (k / n), q = n ? k / n : 1;
          var pt = at(path, d);
          var sz = size0 * lerp(1 - P.taper, 1, q);
          var yf = 1 - P.exitFade * sm(clamp((pt[1] - H * .55) / (H * .5)));
          var bright = lerp(1 - P.tailFade, 1, q) * yf;
          if (bright < 1 / (LEVELS * 2)) continue;
          var lvl = Math.min(LEVELS - 1, Math.max(0, Math.round(bright * LEVELS) - 1));
          lx.drawImage(l.spr[lvl], pt[0] - sz / 2, pt[1] - sz / 2, sz, sz);
        }
        mx.globalCompositeOperation = i === 0 ? 'source-over' : (P.blend || 'lighten');
        mx.drawImage(l.layer.c, 0, 0);
      });
      // 절반 해상도에서 한 번만 흐리게 한 뒤 원래 크기로 확대 — 잔상 줄무늬와 겹침 경계가 부드러워짐
      sx.globalCompositeOperation = 'source-over'; sx.filter = 'none'; sx.fillStyle = '#000'; sx.fillRect(0, 0, soft.width, soft.height);
      // 스크롤 시작 직후엔 히어로와 똑같이(블러 0) 시작해서 fadeIn 구간 동안 부드러움을 서서히 올림 → 바뀌는 순간이 안 보임
      var fi = P.fadeIn > 0 ? sm(clamp(p / P.fadeIn)) : 1;
      var bl = P.smooth * fi * LS;
      sx.filter = bl > .3 ? 'blur(' + bl + 'px)' : 'none';
      sx.drawImage(mix, 0, 0);
      sx.filter = 'none';
      // 검정 바탕을 투명으로 바꿈(밝기 → 알파). 이렇게 해야 캔버스 뒤의 배경색 전환이 그대로 보임
      // (예전엔 검정 캔버스가 배경을 가려서, 섹션이 올라갈 때 검정↔회색 경계가 뚝 끊겨 보였음)
      var img = sx.getImageData(0, 0, soft.width, soft.height), d = img.data;
      for (var q = 0; q < d.length; q += 4) {
        var a = Math.max(d[q], d[q + 1], d[q + 2]);
        if (a === 0) { d[q + 3] = 0; continue; }
        var k = 255 / a; d[q] = d[q] * k; d[q + 1] = d[q + 1] * k; d[q + 2] = d[q + 2] * k; d[q + 3] = a;
      }
      sx.putImageData(img, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over'; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(soft, 0, 0, W, H);
      cv.style.opacity = '1';
    }

    buildSprites();
    measure();
    var ro = new ResizeObserver(function () { if (active) { setHeroVisible(true); measure(); setHeroVisible(false); } else measure(); render(); });
    ro.observe(container);

    return {
      setProgress: function (v) { prog = clamp(v); render(); },
      setParams: function (np) { Object.assign(P, np); buildSprites(); render(); },
      params: P,
      destroy: function () { ro.disconnect(); setHeroVisible(true); cv.remove(); }
    };
  }

  global.LightFall = { init: init, DEFAULTS: DEFAULTS };
})(window);
