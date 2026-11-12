/*
  VertexStudio · dinamismo da página (acompanha o light.css)

  - barra de progresso do scroll e cabeçalho com vidro
  - hero: pontos halftone que seguem o cursor, linhas de seda que se desenham
  - painel de exemplo que inclina e endireita com o scroll (e com o rato)
  - contadores animados
  - revelações escalonadas ao scroll, títulos palavra a palavra
  - brilho que segue o rato nos cartões das vantagens

  Tudo é decorativo e respeita "prefers-reduced-motion".
*/
(function () {
  "use strict";

  var cover = document.querySelector(".cover");
  if (!cover) return;

  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var header = cover.querySelector("header");

  function clamp(n, a, b) { return Math.min(b, Math.max(a, n)); }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  /* ---------- 1. Barra de progresso ---------- */
  var bar = document.createElement("div");
  bar.className = "vs-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);

  /* ---------- 2. Linhas de seda + manchas de cor (decorativas) ---------- */
  function ribbon(n, y0, a, b, grad, cls) {
    var out = '<g class="' + cls + '" stroke="url(#' + grad + ')">';
    for (var i = 0; i < n; i++) {
      var d = "M -120 " + (y0 + i * 5.5) +
        " C 280 " + (y0 - a + i * 3.5) + ", 760 " + (y0 + b - i * 5) + ", 1560 " + (y0 + 30 + i * 9);
      out += '<path pathLength="1" style="--i:' + i + '" d="' + d + '"/>';
    }
    return out + "</g>";
  }
  var silk =
    '<svg class="vs-silk" viewBox="0 0 1440 820" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">' +
    "<defs>" +
    '<linearGradient id="vsg1" x1="0" x2="1"><stop offset="0" stop-color="#2B2BE6" stop-opacity="0"/><stop offset=".35" stop-color="#2B2BE6" stop-opacity=".55"/><stop offset=".75" stop-color="#8A22E8" stop-opacity=".5"/><stop offset="1" stop-color="#8A22E8" stop-opacity="0"/></linearGradient>' +
    '<linearGradient id="vsg2" x1="0" x2="1"><stop offset="0" stop-color="#8A22E8" stop-opacity="0"/><stop offset=".4" stop-color="#8A22E8" stop-opacity=".4"/><stop offset=".8" stop-color="#D3201F" stop-opacity=".35"/><stop offset="1" stop-color="#D3201F" stop-opacity="0"/></linearGradient>' +
    "</defs>" +
    ribbon(16, 150, 170, 300, "vsg1", "r1") +
    ribbon(14, 560, -190, -120, "vsg2", "r2") +
    "</svg>" +
    '<span class="vs-blob a" aria-hidden="true"></span><span class="vs-blob b" aria-hidden="true"></span>';
  cover.insertAdjacentHTML("afterbegin", silk);

  /* ---------- 3. Painel de exemplo (decorativo) ---------- */
  var line = "M0 92 C40 84 72 88 112 64 S192 72 232 46 S322 42 400 12";
  var show = document.createElement("div");
  show.className = "vs-show";
  show.innerHTML =
    '<div class="vs-stage" aria-hidden="true">' +
    '<span class="vs-chip c1"><i></i>Adaptado ao telemóvel</span>' +
    '<span class="vs-chip c2"><i></i>Boas práticas de SEO</span>' +
    '<span class="vs-chip c3"><i></i>MB WAY · Multibanco · Cartão</span>' +
    '<div class="vs-win">' +
    '<div class="vs-wbar"><i></i><i></i><i></i><span>oseunegocio.pt</span></div>' +
    '<div class="vs-wbody">' +
    '<div class="vs-hero"><small>Exemplo ilustrativo</small>' +
    "<strong>O seu negócio, aberto 24 horas.</strong>" +
    '<div class="vs-cta"><b>Pedir orçamento</b><em>Ver serviços</em></div>' +
    '<svg class="vs-chart" viewBox="0 0 400 110" focusable="false">' +
    '<defs><linearGradient id="vsa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>' +
    '<path class="vs-area" d="' + line + ' L400 110 L0 110Z" fill="url(#vsa)"/>' +
    '<path class="vs-line" pathLength="1" d="' + line + '" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>' +
    '<circle class="vs-dot" cx="400" cy="12" r="5" fill="#fff"/>' +
    "</svg></div>" +
    '<div class="vs-side">' +
    '<div class="vs-m"><span>Visitas</span><b data-count="12480">0</b><em>↑ 38%</em></div>' +
    '<div class="vs-m"><span>Pedidos de orçamento</span><b data-count="164">0</b><em>↑ 21%</em></div>' +
    '<div class="vs-m"><span>Velocidade no telemóvel</span><b data-count="98">0</b><em>/ 100</em></div>' +
    "</div></div></div></div>";
  cover.appendChild(show);

  var win = show.querySelector(".vs-win");
  var counters = [].slice.call(show.querySelectorAll("[data-count]"));

  function fmt(n) { try { return n.toLocaleString("pt-PT"); } catch (e) { return String(n); } }
  function setCounters(p) {
    counters.forEach(function (c) { c.textContent = fmt(Math.round(+c.getAttribute("data-count") * p)); });
  }
  var counted = false;
  function runCounters() {
    if (counted) return;
    counted = true;
    if (reduce) { setCounters(1); return; }
    var t0 = null;
    (function step(ts) {
      if (t0 === null) t0 = ts;
      var p = clamp((ts - t0) / 1800, 0, 1);
      setCounters(easeOut(p));
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }

  /* ---------- 4. Scroll: progresso, cabeçalho, parallax, inclinação ---------- */
  var ticking = false;
  function frame() {
    ticking = false;
    var y = window.pageYOffset || root.scrollTop || 0;
    var vh = window.innerHeight;
    var max = Math.max(1, root.scrollHeight - vh);
    bar.style.transform = "scaleX(" + clamp(y / max, 0, 1).toFixed(4) + ")";
    if (header) header.classList.toggle("scrolled", y > 12);
    if (!reduce) {
      cover.style.setProperty("--sy", Math.min(y, 1200));
      var r = show.getBoundingClientRect();
      var t = clamp((vh - r.top) / (vh * 0.95), 0, 1); /* 0 = a entrar, 1 = já a meio do ecrã */
      var k = easeOut(clamp(t / 0.85, 0, 1));
      win.style.setProperty("--rx", ((1 - k) * 20).toFixed(2) + "deg");
      win.style.setProperty("--sc", (0.94 + k * 0.06).toFixed(3));
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  frame();

  /* ---------- 5. Rato: pontos do hero + inclinação do painel ---------- */
  if (!reduce && window.matchMedia("(pointer:fine)").matches) {
    var raf = 0, pe = null;
    cover.addEventListener("pointermove", function (e) {
      pe = e;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var r = cover.getBoundingClientRect();
        cover.classList.add("has-pointer");
        cover.style.setProperty("--mx", ((pe.clientX - r.left) / r.width * 100).toFixed(1) + "%");
        cover.style.setProperty("--my", ((pe.clientY - r.top) / r.height * 100).toFixed(1) + "%");
        var w = win.getBoundingClientRect();
        if (pe.clientY > w.top - 80 && pe.clientY < w.bottom + 80) {
          var nx = clamp((pe.clientX - (w.left + w.width / 2)) / (w.width / 2), -1, 1);
          var ny = clamp((pe.clientY - (w.top + w.height / 2)) / (w.height / 2), -1, 1);
          win.style.setProperty("--ry", (nx * 5).toFixed(2) + "deg");
          win.style.setProperty("--rx2", (-ny * 3).toFixed(2) + "deg");
        }
      });
    });
    cover.addEventListener("pointerleave", function () {
      win.style.setProperty("--ry", "0deg");
      win.style.setProperty("--rx2", "0deg");
    });
  }

  /* ---------- 6. Revelações ao scroll ---------- */
  function markDone(el, delay) {
    setTimeout(function () { el.classList.add("done"); }, 1300 + delay);
  }

  if (!("IntersectionObserver" in window)) {
    show.classList.add("in"); runCounters();
    return;
  }

  var showIO = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { show.classList.add("in"); runCounters(); showIO.disconnect(); }
    });
  }, { threshold: 0.25 });
  showIO.observe(show);

  /* grupos: o contentor deixa de animar, os filhos entram um a um */
  var groups = [".adv article", ".steps li", ".project-shot", ".faq details", ".ec-next li"];
  groups.forEach(function (sel) {
    var items = [].slice.call(document.querySelectorAll("main " + sel));
    if (!items.length) return;
    var parent = items[0].parentElement;
    /* o contentor (e o seu pai direto, se for ele que a revelação original marcou) fica estático */
    var p = parent;
    while (p && p !== document.body) {
      if (p.classList && p.classList.contains("rv")) p.classList.add("grp");
      p = p.parentElement;
    }
    items.forEach(function (el, i) {
      var d = Math.min(i % 6, 5) * 90;
      el.classList.add("rv");
      el.style.setProperty("--d", d + "ms");
      el._d = d;
    });
  });

  /* títulos palavra a palavra */
  [].forEach.call(document.querySelectorAll("main section h2"), function (h) {
    if (h.children.length) return;
    var text = h.textContent.trim();
    if (!text) return;
    h.setAttribute("aria-label", text);
    h.classList.remove("rv");
    h.classList.add("vs-h");
    h.innerHTML = text.split(/\s+/).map(function (w, i) {
      return '<span class="vs-w" aria-hidden="true" style="--i:' + i + '">' + w + "</span>";
    }).join(" ");
  });

  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      el.classList.add("in");
      if (el.classList.contains("rv")) markDone(el, el._d || 0);
      io.unobserve(el);
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });

  [].forEach.call(document.querySelectorAll("main .rv, main .vs-h"), function (el) { io.observe(el); });

  /* ---------- 7. Brilho que segue o rato nos cartões ---------- */
  [].forEach.call(document.querySelectorAll(".adv article"), function (a) {
    a.addEventListener("pointermove", function (e) {
      var r = a.getBoundingClientRect();
      a.style.setProperty("--px", (e.clientX - r.left) + "px");
      a.style.setProperty("--py", (e.clientY - r.top) + "px");
    });
  });
})();
