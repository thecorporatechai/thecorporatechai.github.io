/* =====================================================================
   The Corporate Chai — UI wiring (nav, ticker, services, footer)
   ===================================================================== */
const $ = (sel) => document.querySelector(sel);
const cfg = SITE_CONFIG;
const waUrl = (message = "Hi! I'd like to know more about The Corporate Chai.") =>
  `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(message)}`;
const setHref = (id, href) => { const el = document.getElementById(id); if (el) el.href = href; };

/* ---- Mobile nav ------------------------------------------------------- */
const navToggle = $("#navToggle");
const navLinks = $("#navLinks");
navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);
});
navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
  navLinks.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
}));

/* ---- Links ------------------------------------------------------------ */
["ctaWhatsapp", "floatWhatsapp"].forEach((id) => setHref(id, waUrl()));
setHref("communityJoinBtn", cfg.whatsappGroupUrl);
setHref("rateBtn", cfg.googleReviewUrl);
setHref("feedbackBtn", `mailto:${cfg.email}?subject=${encodeURIComponent("Feedback for The Corporate Chai")}`);
setHref("fpIg", cfg.instagram);
setHref("fpYt", cfg.youtube);
setHref("heroIg", cfg.instagram);
setHref("wwdRewriteBtn", waUrl("Hi! I'd like the ATS Resume Rewrite service (" + (cfg.rewritePrice || "₹199") + ")."));

/* ---- Rolling highlights ticker ---------------------------------------- */
const tickerItem = (t) => `<span>${t}</span><i>✦</i>`;
const tickerTrack = $("#tickerTrack");
if (tickerTrack && Array.isArray(cfg.highlights)) {
  const seq = cfg.highlights.map(tickerItem).join("");
  tickerTrack.innerHTML = seq + seq;        // duplicated for a seamless loop
}
const reviewTicker = $("#reviewTicker");
if (reviewTicker && Array.isArray(cfg.reviews)) {
  const seq = cfg.reviews.map(tickerItem).join("");
  reviewTicker.innerHTML = seq + seq;
}

/* ---- Hero stats (count-up animation) ---------------------------------- */
// Each numeric stat ticks up from 1 to its target over ~3.4s on page load,
// preserving any suffix like "+". Respects reduced-motion preferences.
const heroStats = $("#heroStats");
const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function countUp(el, target, suffix, duration) {
  if (reduceMotion) { el.textContent = target + suffix; return; }
  const start = performance.now();
  let done = false;
  const finish = () => { if (!done) { done = true; el.textContent = target + suffix; } };
  const tick = (now) => {
    if (done) return;
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);                 // easeOutCubic
    el.textContent = Math.max(1, Math.round(1 + (target - 1) * eased)) + suffix;
    if (p < 1) requestAnimationFrame(tick);
    else finish();
  };
  requestAnimationFrame(tick);
  // Safety net: rAF is paused in background tabs — guarantee the final value
  // still lands if the visitor switches away before the animation finishes.
  setTimeout(finish, duration + 400);
}
(cfg.stats || []).forEach((s) => {
  const d = document.createElement("div");
  d.className = "hstat";
  const m = String(s.value).match(/^(\d+)(.*)$/);          // split "100+" -> 100, "+"
  d.innerHTML = `<div class="n">${m ? "1" + m[2] : s.value}</div><div class="l">${s.label}</div>${s.sub ? `<div class="s">${s.sub}</div>` : ""}`;
  heroStats.appendChild(d);
  if (m) countUp(d.querySelector(".n"), parseInt(m[1], 10), m[2] || "", 3400);
});

/* ---- Hero resume showcase — cycles weak ↔ strong with a synced gauge --- */
(function () {
  const stack = document.querySelector(".hv-stack");
  const shots = stack ? Array.prototype.slice.call(stack.querySelectorAll(".hv-shot")) : [];
  const fill = document.querySelector(".hvg-fill");
  const numEl = document.getElementById("heroScore");
  const lblEl = document.querySelector(".hv-verdict-lbl");
  const pill1 = document.querySelector(".hv-pill-1");
  const pill2 = document.querySelector(".hv-pill-2");
  if (!stack || shots.length < 2 || !fill || !numEl) { if (numEl) numEl.textContent = "88"; return; }

  // Strong slides show real templates crisp (with-photo + clean no-photo). Weak
  // slides show genuine "bad resume" examples, softly blurred — no overlays.
  // `img` indexes into .hv-shot: 0–3 good templates, 4–5 bad-resume examples.
  const slides = [
    { img: 0, score: 90, label: "Strong", tone: "strong" },   // with photo
    { img: 4, score: 38, label: "Weak",   tone: "weak"   },   // bad resume
    { img: 1, score: 88, label: "Strong", tone: "strong" },   // no photo
    { img: 5, score: 44, label: "Weak",   tone: "weak"   },   // bad resume
    { img: 2, score: 92, label: "Strong", tone: "strong" },   // no photo (ATS)
    { img: 3, score: 87, label: "Strong", tone: "strong" }    // with photo
  ];
  const COLOR = { weak: "#ef4444", strong: "#22c55e" };
  const PILL_COLOR = { weak: "#ef4444", strong: "#1e7a44" };
  const PILLS = {
    strong: [{ ic: "✓", t: "ATS-friendly" }, { ic: "✓", t: "Recruiter-ready" }],
    weak:   [{ ic: "✕", t: "Weak formatting" }, { ic: "✕", t: "Keyword gaps" }]
  };
  const setPill = (el, item, color) => {
    if (!el || !item) return;
    el.innerHTML = '<i class="pi">' + item.ic + '</i> ' + item.t;
    const pi = el.querySelector(".pi");
    if (pi) pi.style.color = color;
  };
  const ARC = 314;
  let idx = -1, numRaf = null, timer = null;

  function animateNum(to) {
    cancelAnimationFrame(numRaf);
    const from = parseInt(numEl.textContent, 10) || 0, start = performance.now(), dur = 850;
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      numEl.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) numRaf = requestAnimationFrame(step);
    };
    numRaf = requestAnimationFrame(step);
  }
  function show(n) {
    const s = slides[n], c = COLOR[s.tone];
    const weak = s.tone === "weak";
    shots.forEach((img, k) => {
      img.style.opacity = k === s.img ? "1" : "0";
      img.style.filter = (k === s.img && weak) ? "blur(3.5px)" : "none";
    });
    stack.classList.toggle("is-weak", weak);
    fill.style.stroke = c;
    fill.style.strokeDashoffset = ARC * (1 - s.score / 100);
    numEl.style.color = c;
    if (lblEl) { lblEl.textContent = s.label; lblEl.style.color = c; lblEl.style.opacity = "1"; }
    const pills = PILLS[s.tone] || PILLS.strong;
    setPill(pill1, pills[0], PILL_COLOR[s.tone]);
    setPill(pill2, pills[1], PILL_COLOR[s.tone]);
    animateNum(s.score);
  }
  function next() { idx = (idx + 1) % slides.length; show(idx); }

  next();   // show first state immediately
  if (!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
    timer = setInterval(next, 3400);
    document.addEventListener("visibilitychange", () => {
      clearInterval(timer);
      if (!document.hidden) timer = setInterval(next, 3400);
    });
  }
})();

/* ---- Services (homepage carousel; the full list lives on services.html) */
const servicesGrid = $("#servicesGrid");
if (servicesGrid) (cfg.services || []).forEach((svc) => {
  const card = document.createElement("article");
  const feats = (svc.feats || []).map((f) => `<div>${f}</div>`).join("");

  // Free gift card (HR contacts) — highlighted inside the grid.
  if (svc.free) {
    card.className = "svc-card free-card reveal";
    card.innerHTML = `
      <span class="gift-badge">🎁 FREE</span>
      <div class="svc-num">FREE GIFT</div>
      <h3 class="svc-title">${svc.title}</h3>
      <div class="svc-feats">${feats}</div>
      <div class="svc-price-row">
        <div class="svc-price"><strong>${svc.price}</strong><small>${svc.priceNote}</small></div>
        <a class="svc-cta-link" href="${cfg.hrContactsUrl}" target="_blank" rel="noopener noreferrer" aria-label="Open the free HR directory">Open →</a>
      </div>`;
    servicesGrid.appendChild(card);
    return;
  }

  card.className = `svc-card reveal${svc.featured ? " featured" : ""}`;
  const cta = svc.href
    ? `<a class="svc-cta-link" href="${svc.href}" aria-label="Explore ${svc.title}">Explore →</a>`
    : `<a class="svc-cta-link" href="${waUrl(svc.whatsappMsg)}" target="_blank" rel="noopener noreferrer" aria-label="Enquire about ${svc.title}">Get this →</a>`;
  const bonus = svc.bonus ? `<div class="bonus-line">🎁 ${svc.bonus} <span>included free</span></div>` : "";
  // Per-service "View sample" button. A service can either set its own `sampleUrl`
  // (e.g. the templates card) or use `sample: true` to fall back to the shared
  // report sample link. The button only renders when the link is a real URL.
  const sampleHref = svc.sampleHref || svc.sampleUrl || (svc.sample ? cfg.sampleReportUrl : "");
  const sampleLabel = svc.sampleLabel || "View sample report";
  const sampleExt = /^https?:\/\//i.test(sampleHref || "");
  const sample = sampleHref
    ? `<a class="sample-report-link" href="${sampleHref}"${sampleExt ? ' target="_blank" rel="noopener noreferrer"' : ''} aria-label="${sampleLabel}"><span>★</span> ${sampleLabel}</a>`
    : "";
  card.innerHTML = `
    ${svc.featured ? '<span class="best-tag">BEST VALUE</span>' : ""}
    <div class="svc-num">SERVICE ${svc.id}</div>
    <h3 class="svc-title">${svc.title}</h3>
    <div class="svc-feats">${feats}</div>
    ${bonus}
    ${sample}
    <div class="svc-price-row">
      <div class="svc-price"><strong>${svc.price}</strong><small>${svc.priceNote}</small></div>
      ${cta}
    </div>`;
  servicesGrid.appendChild(card);
});

/* ---- Services carousel (auto-rolling + left/right arrows) -------------- */
(function () {
  const track = servicesGrid;
  const carousel = $("#svcCarousel");
  if (!track || !carousel) return;
  const prev = $("#svcPrev"), next = $("#svcNext");

  // Width of one card + the flex gap, so each step lands on the next card.
  const step = () => {
    const c = track.querySelector(".svc-card");
    const gap = parseFloat(getComputedStyle(track).columnGap || "22") || 22;
    return c ? c.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
  };
  const atEnd = () => track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
  const atStart = () => track.scrollLeft <= 4;
  const goNext = (loop) => {
    if (loop && atEnd()) track.scrollTo({ left: 0, behavior: "smooth" });
    else track.scrollBy({ left: step(), behavior: "smooth" });
  };
  const goPrev = () => {
    if (atStart()) track.scrollTo({ left: track.scrollWidth, behavior: "smooth" });
    else track.scrollBy({ left: -step(), behavior: "smooth" });
  };

  // Smooth, continuous "marquee" auto-scroll — premium feel, ~3 tiles gliding.
  let raf = null;
  const SPEED = 0.7;                       // px per frame ≈ 42px/s
  const tick = () => {
    if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 1) track.scrollLeft = 0;
    else track.scrollLeft += SPEED;
    raf = requestAnimationFrame(tick);
  };
  const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = null; } };
  const start = () => { stop(); raf = requestAnimationFrame(tick); };

  // Arrows pause the glide, step one card, then resume.
  if (next) next.addEventListener("click", () => { stop(); goNext(true); setTimeout(start, 900); });
  if (prev) prev.addEventListener("click", () => { stop(); goPrev(); setTimeout(start, 900); });
  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", start);
  carousel.addEventListener("touchstart", stop, { passive: true });
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); else start(); });

  // Glide unless the visitor prefers reduced motion (arrows still work).
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && !document.hidden) start();
})();

/* ---- Follow logos under services -------------------------------------- */
const followLogos = $("#followLogos");
if (followLogos && window.TCC_ICON) {
  followLogos.innerHTML =
    `<a class="social-ico" href="${cfg.instagram}" target="_blank" rel="noopener noreferrer" aria-label="Instagram">${TCC_ICON.instagram}</a>` +
    `<a class="social-ico" href="${cfg.youtube}" target="_blank" rel="noopener noreferrer" aria-label="YouTube">${TCC_ICON.youtube}</a>`;
}

/* ---- Coming soon (Notify -> WhatsApp group) --------------------------- */
const comingGrid = $("#comingGrid");
(cfg.comingSoon || []).forEach((cs) => {
  const card = document.createElement("article");
  card.className = "cs-card astro reveal";
  card.innerHTML = `
    <div class="cs-orb">${cs.tag}</div>
    <h4>${cs.title}</h4>
    <div class="cs-role">${cs.sub}</div>
    <p>${cs.desc}</p>
    <div class="cs-foot">
      <span class="coming-soon-pill">Coming Soon</span>
      <a class="cs-notify" href="${cfg.whatsappGroupUrl}" target="_blank" rel="noopener noreferrer">Notify me →</a>
    </div>`;
  comingGrid.appendChild(card);
});

/* ---- Footer: founder box + colourful social icons --------------------- */
const founderBox = $("#founderBox");
if (founderBox && cfg.founder) {
  const f = cfg.founder;
  founderBox.innerHTML = `
    <strong>${f.name}</strong>
    <span class="founder-title">${f.title}</span>
    <div class="founder-actions">
      <a class="founder-link" href="${f.linkedin}" target="_blank" rel="noopener noreferrer">Connect on LinkedIn →</a>
      <a class="founder-link founder-website" href="${f.website}" target="_blank" rel="noopener noreferrer">Explore my website →</a>
    </div>`;
}
if (typeof renderContactRow === "function") renderContactRow($("#socialRow"), cfg);

/* ---- Welcome launch-offer popup (once per session, auto-disappears) --- */
// Falls back to built-in copy so it still works even if config.js isn't updated;
// edit js/config.js -> launchOffer to change the text/date without touching code.
const launchPop = $("#launchPop");
const lo = cfg.launchOffer || {
  enabled: true,
  badge: "🎉 Launch Offer",
  title: "Flat 5% OFF on all services",
  sub: "Contact us now to claim it — and follow us on Instagram for our monthly giveaway. This month: 🎧 Earphones!",
  validTill: "⏳ Valid till 15 July 2026"
};
if (launchPop && lo && lo.enabled !== false) {
  const set = (id, txt) => { const el = document.getElementById(id); if (el && txt) el.textContent = txt; };
  set("lpBadge", lo.badge); set("lpTitle", lo.title); set("lpSub", lo.sub);
  setHref("lpIg", cfg.instagram);
  if (cfg.store) setHref("lpStore", cfg.store);

  let seen = false;
  try { seen = !!sessionStorage.getItem("tccLaunchSeen"); } catch (e) {}
  let hideTimer = null;
  const close = () => {
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    launchPop.classList.add("lp-closing");
    setTimeout(() => { launchPop.hidden = true; launchPop.classList.remove("lp-closing"); }, 400);
  };
  const open = () => {
    launchPop.hidden = false;
    try { sessionStorage.setItem("tccLaunchSeen", "1"); } catch (e) {}
    hideTimer = setTimeout(close, 12000);   // disappears on its own after 12s
  };
  if (!seen) setTimeout(open, 1400);
  const lpClose = $("#lpClose");
  if (lpClose) lpClose.addEventListener("click", close);
  const lpBackdrop = $("#lpBackdrop");
  if (lpBackdrop) lpBackdrop.addEventListener("click", close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !launchPop.hidden) close(); });
}

/* ---- Gift deep link (legacy #gift → gifts page) ----------------------- */
// The gift chooser is now a standalone page. Keep old shared #gift links
// working by forwarding them to gifts.html.
if ((location.hash || "").toLowerCase() === "#gift") location.replace("gifts.html");

/* ---- Scroll reveal ---------------------------------------------------- */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
