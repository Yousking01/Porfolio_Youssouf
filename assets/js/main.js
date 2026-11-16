/* Youssouf Djiré — portfolio behaviour: language switch, typed roles, charts, filters, contact form. */
(function () {
  "use strict";
  window.__ydReady = true; // tells the page that animations can run
  var I18N = window.I18N || {}, DATA = window.SITE_DATA || {};
  var LANGS = ["en", "fr", "ru"], STORE = "yd-lang";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var lang = "en";
  function tr(key) { var d = I18N[lang] || {}; return key in d ? d[key] : (I18N.en || {})[key] || ""; }

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function fmt(n) { return n.toLocaleString(lang, { maximumFractionDigits: 2 }); }

  /* ---------- theme (light / dark) ---------- */
  var THEME = "yd-theme", root = document.documentElement, themeBtn = $("#themeBtn");
  function applyTheme(t, animate) {
    if (animate && !REDUCED) { root.classList.add("theme-anim"); setTimeout(function () { root.classList.remove("theme-anim"); }, 450); }
    root.setAttribute("data-theme", t);
    if (themeBtn) themeBtn.setAttribute("aria-pressed", String(t === "dark"));
    var mc = $('meta[name="theme-color"]'); if (mc) mc.setAttribute("content", t === "dark" ? "#0c1726" : "#ffffff");
  }
  applyTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light", false);
  if (themeBtn) themeBtn.addEventListener("click", function () {
    var t = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(t, true);
    try { localStorage.setItem(THEME, t); } catch (e) {}
  });
  if (window.matchMedia) { // follow the system while the visitor has not chosen
    var mq = window.matchMedia("(prefers-color-scheme: dark)"), onSys = function (e) {
      var saved = null; try { saved = localStorage.getItem(THEME); } catch (err) {}
      if (saved !== "dark" && saved !== "light") applyTheme(e.matches ? "dark" : "light", true);
    };
    if (mq.addEventListener) mq.addEventListener("change", onSys); else if (mq.addListener) mq.addListener(onSys);
  }

  /* ---------- language ---------- */
  function initialLang() {
    var q = new URLSearchParams(location.search).get("lang");
    if (LANGS.indexOf(q) >= 0) return q;
    try { var s = localStorage.getItem(STORE); if (LANGS.indexOf(s) >= 0) return s; } catch (e) {}
    return "en"; // English on a first visit
  }
  function setLang(l, save) {
    lang = LANGS.indexOf(l) >= 0 ? l : "en";
    document.documentElement.lang = lang;
    $$("[data-i18n]").forEach(function (el) { el.textContent = tr(el.getAttribute("data-i18n")); });
    $$("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var p = pair.split(":"); if (p.length === 2) el.setAttribute(p[0].trim(), tr(p[1].trim()));
      });
    });
    $$("[data-num]").forEach(function (el) { el.textContent = fmt(Number(el.getAttribute("data-num"))); });
    document.title = tr("meta.title");
    var md = $('meta[name="description"]'); if (md) md.setAttribute("content", tr("meta.desc"));
    $$(".lang button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang)); });
    if (save) { try { localStorage.setItem(STORE, lang); } catch (e) {} }
    startTyping(); renderCharts();
    var st = $("#formStatus"); if (st) { st.textContent = ""; st.className = "form-status"; }
  }
  $$(".lang button").forEach(function (b) { b.addEventListener("click", function () { setLang(b.getAttribute("data-lang"), true); }); });

  /* ---------- typed roles ---------- */
  var typeTimer = null;
  function startTyping() {
    var el = $("#typed"); if (!el) return;
    clearTimeout(typeTimer);
    var roles = tr("roles").split("|"), i = 0, n = roles[0].length, del = false;
    el.textContent = roles[0];
    if (REDUCED) return;
    (function tick() {
      var word = roles[i], wait = 70;
      if (!del && n === word.length) { del = true; wait = 1700; }
      else if (del && n === 0) { del = false; i = (i + 1) % roles.length; wait = 350; }
      else { n += del ? -1 : 1; wait = del ? 35 : 70; }
      el.textContent = roles[i].slice(0, n);
      typeTimer = setTimeout(tick, wait);
    })();
  }

  /* ---------- tooltip shared by the charts ---------- */
  var tip = $("#tip");
  function showTip(html, x, y) {
    tip.innerHTML = html; tip.hidden = false;
    var r = tip.getBoundingClientRect(), px = Math.min(Math.max(8, x + 14), innerWidth - r.width - 8), py = y - r.height - 12;
    if (py < 8) py = y + 18;
    tip.style.left = px + "px"; tip.style.top = py + "px";
  }
  function hideTip() { tip.hidden = true; }
  function bindTip(el, html) {
    el.addEventListener("mousemove", function (e) { showTip(html(), e.clientX, e.clientY); });
    el.addEventListener("mouseleave", hideTip);
    el.addEventListener("focus", function () { var r = el.getBoundingClientRect(); showTip(html(), r.left + r.width / 2, r.top); });
    el.addEventListener("blur", hideTip);
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  /* ---------- charts ---------- */
  function renderCharts() { chartSkills(); chartLangs(); chartTimeline(); }
  function chartSkills() {
    var box = $("#chartSkills"); if (!box || !DATA.skills) return; box.innerHTML = "";
    var rows = DATA.skills.filter(function (d) { return d.key !== "skills.web"; }); // data domains only
    var max = Math.max.apply(null, rows.map(function (d) { return d.n; }));
    rows.forEach(function (d) {
      var row = el("div", "bar-row"); row.tabIndex = 0;
      row.appendChild(el("span", "", tr(d.key)));
      var track = el("span", "bar-track"), fill = el("span", "bar-fill"); fill.style.width = (d.n / max * 100) + "%"; fill.style.setProperty("--i", box.children.length);
      track.appendChild(fill); row.appendChild(track); row.appendChild(el("b", "", String(d.n)));
      row.setAttribute("aria-label", tr(d.key) + ": " + d.n);
      bindTip(row, function () {
        var items = d.items.map(function (s) { return s === "Data Visualization" ? tr("skill.viz") : s; });
        return "<strong>" + esc(tr(d.key)) + " (" + d.n + ")</strong><span>" + esc(items.join(", ")) + "</span>";
      });
      box.appendChild(row);
    });
  }
  function chartLangs() {
    var box = $("#chartLangs"); if (!box || !DATA.langs) return; box.innerHTML = "";
    var levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
    DATA.langs.forEach(function (d) {
      var row = el("div", "cefr-row"), name = el("span"); name.appendChild(el("b", "", tr(d.key)));
      name.appendChild(document.createTextNode(" " + d.level));
      var scale = el("div", "cefr-scale"), idx = levels.indexOf(d.level);
      levels.forEach(function (_, i) { var c = el("i", i <= idx ? "on" : ""); c.style.setProperty("--i", i); scale.appendChild(c); });
      row.appendChild(name); row.appendChild(scale); row.tabIndex = 0;
      row.setAttribute("aria-label", tr(d.key) + ": " + d.level + ", " + tr(d.key + "d"));
      bindTip(row, function () { return "<strong>" + esc(tr(d.key)) + ", " + d.level + "</strong><span>" + esc(tr(d.key + "d")) + "</span>"; });
      box.appendChild(row);
    });
    var axis = el("div", "cefr-axis"); axis.appendChild(el("span")); var ticks = el("div");
    levels.forEach(function (l) { ticks.appendChild(el("span", "", l)); }); axis.appendChild(ticks); box.appendChild(axis);
  }
  function chartTimeline() {
    var box = $("#chartTimeline"); if (!box || !DATA.timeline) return; box.innerHTML = "";
    var y0 = 2022, y1 = 2026, years = y1 - y0 + 1, total = years * 12, cols = "repeat(" + years + ", 1fr)";
    var axis = el("div", "g-axis"); axis.style.gridTemplateColumns = cols;
    for (var y = y0; y <= y1; y++) axis.appendChild(el("span", "", String(y)));
    var rows = el("div", "g-rows"), grid = el("div", "g-grid"); grid.style.gridTemplateColumns = cols;
    for (var k = 0; k < years; k++) grid.appendChild(el("i"));
    rows.appendChild(grid);
    DATA.timeline.forEach(function (d) {
      var s = (d.s[0] - y0) * 12 + d.s[1] - 1, e = (d.e[0] - y0) * 12 + d.e[1], p = "exp." + d.i;
      var row = el("div", "g-row"), label = el("div", "g-label", tr(p + ".role")), track = el("div", "g-track");
      var bar = el("button", "g-bar " + d.c); bar.type = "button"; bar.style.setProperty("--i", 4 - d.i);
      bar.style.left = (s / total * 100) + "%"; bar.style.width = ((e - s) / total * 100) + "%";
      if (s / total > 0.5) { label.classList.add("end"); label.style.marginRight = (100 - e / total * 100) + "%"; }
      else label.style.marginLeft = (s / total * 100) + "%";
      bar.setAttribute("aria-label", tr(p + ".role") + ", " + tr(p + ".org") + ", " + tr(p + ".date") + ", " + tr(p + ".dur"));
      bindTip(bar, function () { return "<strong>" + esc(tr(p + ".role")) + "</strong><span>" + esc(tr(p + ".org")) + "<br>" + esc(tr(p + ".date")) + " (" + esc(tr(p + ".dur")) + ")</span>"; });
      track.appendChild(bar); row.appendChild(label); row.appendChild(track); rows.appendChild(row);
    });
    box.appendChild(axis); box.appendChild(rows);
  }

  /* ---------- project filter ---------- */
  $$(".filters button").forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.getAttribute("data-filter");
      $$(".filters button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      $$(".web-item").forEach(function (it) {
        it.hidden = !(f === "all" || it.getAttribute("data-kind") === f);
        it.classList.remove("pop"); if (!it.hidden) { void it.offsetWidth; it.classList.add("pop"); }
      });
    });
  });

  /* ---------- navigation: active link, header shadow, close menu on click ---------- */
  var header = $(".site-header"), links = $$(".navbar .nav-link");
  var bar = $("#progress");
  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 8);
    if (bar) { var max = document.documentElement.scrollHeight - innerHeight; bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ")"; }
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { var on = a.getAttribute("href") === "#" + en.target.id; a.classList.toggle("active", on); if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach(function (s) { io.observe(s); });
  }
  links.forEach(function (a) {
    a.addEventListener("click", function () {
      var menu = $("#menu");
      if (menu.classList.contains("show") && window.bootstrap) window.bootstrap.Collapse.getOrCreateInstance(menu).hide();
    });
  });

  /* ---------- scroll reveal, chart growth and number count-up ---------- */
  function countUp(elm) {
    var target = Number(elm.getAttribute("data-num")); if (REDUCED || !isFinite(target)) return;
    var t0 = null, dur = 1100;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur), eased = 1 - Math.pow(1 - p, 3), v = target * eased;
      elm.textContent = fmt(target % 1 === 0 ? Math.round(v) : Math.round(v * 100) / 100);
      if (p < 1) requestAnimationFrame(step); else elm.textContent = fmt(target);
    }
    requestAnimationFrame(step);
  }
  var revealSel = ".figures .fig, .sec h2, .sec .h-sub, .sec .big, .sec .col-lg-7 > p, .facts, .do, .skill-group, .chart, .xp, .proj, .web-head, .web-item, .rows li, .quote, .contacts li, .form";
  var targets = $$(revealSel);
  if ("IntersectionObserver" in window && !REDUCED) {
    targets.forEach(function (n) {
      n.classList.add("reveal");
      var sib = n.parentElement ? Array.prototype.indexOf.call(n.parentElement.children, n) : 0;
      var col = n.parentElement && /col-/.test(n.parentElement.className) ? Array.prototype.indexOf.call(n.parentElement.parentElement.children, n.parentElement) : sib;
      n.style.setProperty("--d", Math.min(col, 5));
    });
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        $$("[data-num]", en.target).forEach(countUp);
        ro.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    targets.forEach(function (n) { ro.observe(n); });
  } else {
    root.classList.remove("js-anim");
  }

  /* ---------- contact form: sends the message to the inbox through FormSubmit ----------
     The address below is already public on this page, so nothing secret is exposed.
     After the first confirmed message, FormSubmit gives a random alias: paste it here in place
     of the address (https://formsubmit.co/ajax/<alias>) to hide the address from spam robots. */
  var FORM_ENDPOINT = "https://formsubmit.co/ajax/djireyoussouf1999@gmail.com";
  var form = $("#contactForm");
  function setStatus(kind, key) {
    var st = $("#formStatus"); st.className = "form-status " + kind; st.textContent = "";
    if (!key) return;
    var icon = document.createElement(kind === "wait" ? "span" : "i");
    icon.className = kind === "wait" ? "spin" : kind === "ok" ? "bi bi-check-circle" : "bi bi-exclamation-triangle";
    icon.setAttribute("aria-hidden", "true");
    st.appendChild(icon); st.appendChild(document.createTextNode(" " + tr(key)));
  }
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true, f = form.elements, btn = form.querySelector('button[type="submit"]');
    [f.name, f.email, f.message].forEach(function (inp) {
      var bad = !inp.value.trim() || (inp.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim()));
      inp.classList.toggle("invalid", bad); inp.setAttribute("aria-invalid", String(bad)); if (bad) ok = false;
    });
    if (!ok) { setStatus("err", "form.err"); return; }
    if (f._honey.value) { setStatus("ok", "form.ok"); form.reset(); return; } // a robot filled the hidden field
    setStatus("wait", "form.sending"); btn.disabled = true;
    fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        name: f.name.value.trim(), email: f.email.value.trim(), message: f.message.value.trim(),
        _subject: f.subject.value.trim() || "Portfolio: message from " + f.name.value.trim(),
        _replyto: f.email.value.trim(), _template: "table", _captcha: "false"
      })
    }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (res.ok && String(res.d.success) === "true") { setStatus("ok", "form.ok"); form.reset(); }
        else setStatus("err", "form.fail");
      })
      .catch(function () { setStatus("err", "form.fail"); })
      .then(function () { btn.disabled = false; });
  });

  setLang(initialLang(), false);
})();
