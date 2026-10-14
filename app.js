// Rexzer site interactivity — no dependencies
(function () {
  var root = document.documentElement;

  // Theme: respect saved choice, default dark
  try {
    var saved = localStorage.getItem("rexzer-theme");
    if (saved) root.setAttribute("data-theme", saved);
  } catch (e) {}
  document.getElementById("themeToggle").addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    if (next === "dark") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", next);
    try { localStorage.setItem("rexzer-theme", next); } catch (e) {}
  });

  // Mobile menu
  var burger = document.getElementById("hamburger");
  var links = document.getElementById("navLinks");
  burger.addEventListener("click", function () {
    var open = links.classList.toggle("open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  });
  links.addEventListener("click", function (e) {
    if (e.target.tagName === "A") links.classList.remove("open");
  });

  // Typing effect
  var phrases = ["rexzer deploy --prod", "lighthouse 98 · a11y 100", "remix ready ✓"];
  var typedEl = document.getElementById("typed");
  var pi = 0, ci = 0, deleting = false;
  function tick() {
    var word = phrases[pi];
    typedEl.textContent = word.slice(0, ci);
    if (!deleting) {
      ci++;
      if (ci > word.length) { deleting = true; return void setTimeout(tick, 1400); }
      setTimeout(tick, 55);
    } else {
      ci--;
      if (ci < 0) { deleting = false; pi = (pi + 1) % phrases.length; ci = 0; return void setTimeout(tick, 300); }
      setTimeout(tick, 28);
    }
  }
  tick();

  // Copy button
  document.getElementById("copyBtn").addEventListener("click", function () {
    var url = "https://my-dream-site.rexzer.dev";
    var done = function () {
      var b = document.getElementById("copyBtn");
      b.textContent = "Copied!";
      setTimeout(function () { b.textContent = "Copy"; }, 1500);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, done);
    else done();
  });

  // Reveal on scroll
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  // Work filters
  var filters = document.querySelectorAll(".filter");
  var cards = document.querySelectorAll("#workGrid .work");
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filters.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var f = btn.getAttribute("data-filter");
      cards.forEach(function (c) {
        c.style.display = (f === "all" || c.getAttribute("data-cat") === f) ? "" : "none";
      });
    });
  });

  // Animated counters
  var counters = document.querySelectorAll(".count");
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      cio.unobserve(en.target);
      var target = parseInt(en.target.getAttribute("data-target"), 10);
      var start = null, dur = 1400;
      function step(t) {
        if (!start) start = t;
        var p = Math.min((t - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        en.target.textContent = Math.round(target * eased).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.4 });
  counters.forEach(function (c) { cio.observe(c); });

  // Testimonials
  var quotes = [
    { text: "\u201CRexzer took our slow WordPress site and turned it into something that feels instant. Sales went up the same week.\u201D", name: "Maya Chen", role: "Founder, Northwind Coffee", avatar: "M" },
    { text: "\u201CThe playable launch page got 120k visits. Our investors literally played the pitch deck.\u201D", name: "Jonas Meyer", role: "CEO, Pixel Quest", avatar: "J" },
    { text: "\u201CFastest agency I've worked with. Fixed price, daily previews, zero meetings that could've been a message.\u201D", name: "Amara Rao", role: "CMO, Waveform Festival", avatar: "A" }
  ];
  var qi = 0;
  var qText = document.getElementById("quoteText");
  var qName = document.getElementById("quoteName");
  var qRole = document.getElementById("quoteRole");
  var qAvatar = document.getElementById("quoteAvatar");
  var qDots = document.getElementById("quoteDots");
  quotes.forEach(function (_, i) {
    var d = document.createElement("button");
    d.type = "button";
    d.setAttribute("aria-label", "Go to review " + (i + 1));
    if (i === 0) d.classList.add("active");
    d.addEventListener("click", function () { show(i); });
    qDots.appendChild(d);
  });
  function show(i) {
    qi = (i + quotes.length) % quotes.length;
    qText.textContent = quotes[qi].text;
    qName.textContent = quotes[qi].name;
    qRole.textContent = quotes[qi].role;
    qAvatar.textContent = quotes[qi].avatar;
    qDots.querySelectorAll("button").forEach(function (d, j) {
      d.classList.toggle("active", j === qi);
    });
  }
  document.getElementById("prevQuote").addEventListener("click", function () { show(qi - 1); });
  document.getElementById("nextQuote").addEventListener("click", function () { show(qi + 1); });
  setInterval(function () { show(qi + 1); }, 7000);

  // Billing toggle
  var billing = document.getElementById("billingToggle");
  billing.addEventListener("click", function () {
    var yearly = billing.getAttribute("aria-checked") !== "true";
    billing.setAttribute("aria-checked", yearly ? "true" : "false");
    document.querySelectorAll("[data-monthly]").forEach(function (el) {
      el.textContent = yearly ? el.getAttribute("data-yearly") : el.getAttribute("data-monthly");
    });
  });

  // Contact form
  document.getElementById("contactForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var err = document.getElementById("formError");
    var ok = document.getElementById("formSuccess");
    err.hidden = true; ok.hidden = true;
    var data = new FormData(e.target);
    var name = String(data.get("name") || "").trim();
    var email = String(data.get("email") || "").trim();
    var msg = String(data.get("message") || "").trim();
    if (name.length < 2) return fail("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Please enter a valid email address.");
    if (msg.length < 10) return fail("Tell us a little more (10+ characters).");
    ok.hidden = false;
    e.target.reset();
    function fail(m) { err.textContent = m; err.hidden = false; }
  });

  // Back to top
  document.getElementById("toTop").addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();
