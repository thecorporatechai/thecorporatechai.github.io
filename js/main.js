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
  d.innerHTML = `<div class="n">${m ? "1" + m[2] : s.value}</div><div class="l">${s.label}</div>`;
  heroStats.appendChild(d);
  if (m) countUp(d.querySelector(".n"), parseInt(m[1], 10), m[2] || "", 3400);
});

/* ---- Services --------------------------------------------------------- */
const servicesGrid = $("#servicesGrid");
(cfg.services || []).forEach((svc) => {
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
  const sampleUrl = svc.sampleUrl || (svc.sample ? cfg.sampleReportUrl : "");
  const sampleLabel = svc.sampleLabel || "View sample report";
  const sample = /^https?:\/\//i.test(sampleUrl || "")
    ? `<a class="sample-report-link" href="${sampleUrl}" target="_blank" rel="noopener noreferrer" aria-label="${sampleLabel}"><span>★</span> ${sampleLabel}</a>`
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

  let timer = null;
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
  const start = () => { stop(); timer = setInterval(() => goNext(true), 3000); };
  const restart = () => { start(); };

  if (next) next.addEventListener("click", () => { goNext(true); restart(); });
  if (prev) prev.addEventListener("click", () => { goPrev(); restart(); });
  // Pause while the visitor is reading / interacting, resume after.
  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", start);
  carousel.addEventListener("touchstart", stop, { passive: true });
  // Pause while the tab is hidden; resume when it's visible again.
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); else start(); });

  // Auto-roll unless the visitor prefers reduced motion (arrows still work).
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

/* ---- Follow-us popup (first button click, once per session) ----------- */
// Instead of interrupting on landing, the popup appears the FIRST time the
// visitor clicks any action button/link. That first click is intercepted so the
// popup is actually seen; after dismissing, the visitor clicks again to proceed.
// It shows only once per browser session.
const followPop = $("#followPop");
if (followPop) {
  let seen = false;
  try { seen = !!sessionStorage.getItem("tccFollowSeen"); } catch (e) {}
  const markSeen = () => { seen = true; try { sessionStorage.setItem("tccFollowSeen", "1"); } catch (e) {} };
  const openPop = () => { followPop.hidden = false; document.body.classList.add("pop-open"); markSeen(); };
  const closePop = () => { followPop.hidden = true; document.body.classList.remove("pop-open"); };

  // Intercept the first action click anywhere on the page (capture phase) so the
  // popup is shown before any navigation happens.
  const onFirstClick = (e) => {
    if (seen) return;
    const t = e.target.closest("a[href], button");
    if (!t) return;
    if (t.closest("#followPop")) return;        // ignore the popup's own controls
    if (t.id === "navToggle") return;           // ignore the mobile menu toggle
    e.preventDefault();
    e.stopPropagation();
    openPop();
  };
  document.addEventListener("click", onFirstClick, true);

  // Dismiss controls — closing does NOT navigate; the visitor clicks again to go on.
  const closeBtn = $("#fpClose");
  if (closeBtn) closeBtn.addEventListener("click", closePop);
  const backdrop = $("#fpBackdrop");
  if (backdrop) backdrop.addEventListener("click", closePop);
  // Following IG / YouTube opens in a new tab and just closes the popup.
  followPop.querySelectorAll(".fp-btn").forEach((b) => b.addEventListener("click", closePop));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !followPop.hidden) closePop(); });
}

/* ---- Scroll reveal ---------------------------------------------------- */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
