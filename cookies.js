/*
  VertexStudio · aviso de cookies
  Guarda a escolha do visitante (aceitar ou recusar) durante 12 meses, no
  armazenamento local do navegador, e avisa o resto do site:

    document.addEventListener("vs:consent", function (e) {
      if (e.detail === "accepted") {
        // Carregar aqui ferramentas opcionais (ex.: análise), só com consentimento.
      }
    });

  window.vsConsent tem o valor atual: "accepted", "rejected" ou null.
  Qualquer elemento com id="ck-open" volta a abrir o aviso.
*/
(function () {
  var KEY = "vs-cookies", LINK = "privacidade.html", MONTH12 = 365 * 24 * 3600 * 1000;

  function get() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY));
      if (s && Date.now() - Date.parse(s.date) > MONTH12) return null;
      return s;
    } catch (e) { return null; }
  }
  function set(v) {
    try { localStorage.setItem(KEY, JSON.stringify({ choice: v, date: new Date().toISOString() })); } catch (e) {}
  }

  var st = document.createElement("style");
  st.textContent =
    '#ck{position:fixed;left:16px;right:16px;bottom:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:100;max-width:560px;margin:0 auto;padding:20px;border-radius:18px;background:#0a083c;color:#fff;border:1px solid rgba(255,255,255,.18);box-shadow:0 20px 50px rgba(0,0,0,.45);font:400 .95rem/1.5 var(--body,"Instrument Sans",system-ui,sans-serif);animation:ckin .35s ease both}' +
    '#ck[hidden]{display:none}' +
    '#ck p{margin:0 0 6px}' +
    '#ck .ck-t{font-size:1.1rem}' +
    '#ck a{color:#fff;text-decoration:underline}' +
    '#ck .ck-a{display:flex;gap:10px;margin-top:14px}' +
    '#ck button{flex:1;min-height:46px;padding:0 16px;border-radius:999px;font:600 1rem var(--body,"Instrument Sans",system-ui,sans-serif);cursor:pointer;border:2px solid #fff;background:transparent;color:#fff}' +
    '#ck button:hover{background:rgba(255,255,255,.12)}' +
    '#ck button.ck-y{background:#E22A28;border-color:#E22A28}' +
    '#ck button.ck-y:hover{background:#c71f1d;border-color:#c71f1d}' +
    '#ck :focus-visible{outline:3px solid #fff;outline-offset:3px}' +
    '@keyframes ckin{from{opacity:0;transform:translateY(16px)}}' +
    '@media (prefers-reduced-motion:reduce){#ck{animation:none}}' +
    '@media (min-width:600px){#ck{left:24px;right:auto;margin:0}}';
  document.head.appendChild(st);

  var b = document.createElement("div");
  b.id = "ck";
  b.hidden = true;
  b.setAttribute("role", "region");
  b.setAttribute("aria-label", "Preferências de cookies");
  b.innerHTML =
    '<p class="ck-t"><strong>Cookies e privacidade</strong></p>' +
    '<p>Usamos apenas o armazenamento essencial para guardar esta escolha. Os cookies opcionais, como os de análise, só são ativados se os aceitar. Saiba mais na <a href="' + LINK + '">Política de Privacidade</a>.</p>' +
    '<div class="ck-a"><button type="button" data-c="rejected">Recusar</button><button type="button" data-c="accepted" class="ck-y">Aceitar</button></div>';
  document.body.appendChild(b);

  function apply(c) {
    window.vsConsent = c;
    document.dispatchEvent(new CustomEvent("vs:consent", { detail: c }));
  }

  b.addEventListener("click", function (e) {
    var t = e.target.closest("[data-c]");
    if (!t) return;
    set(t.getAttribute("data-c"));
    apply(t.getAttribute("data-c"));
    b.hidden = true;
    var o = document.getElementById("ck-open");
    if (o) o.focus();
  });

  document.addEventListener("click", function (e) {
    if (e.target.closest("#ck-open")) {
      e.preventDefault();
      b.hidden = false;
      b.querySelector("button").focus();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !b.hidden && get()) b.hidden = true;
  });

  var s = get();
  apply(s ? s.choice : null);
  if (!s) b.hidden = false;
})();
