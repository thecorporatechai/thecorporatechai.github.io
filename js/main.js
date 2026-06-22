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

/* ---- Hero stats ------------------------------------------------------- */
const heroStats = $("#heroStats");
(cfg.stats || []).forEach((s) => {
  const d = document.createElement("div");
  d.className = "hstat";
  d.innerHTML = `<div class="n">${s.value}</div><div class="l">${s.label}</div>`;
  heroStats.appendChild(d);
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
  const sample = svc.sample && cfg.sampleReportUrl
    ? `<a class="sample-report-link" href="${cfg.sampleReportUrl}" target="_blank" rel="noopener noreferrer" aria-label="View sample resume report"><span>★</span> View sample report</a>`
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

/* ---- Follow-us popup (shows once per browser session) ----------------- */
const followPop = $("#followPop");
if (followPop) {
  const closePop = () => { followPop.hidden = true; document.body.classList.remove("pop-open"); };
  const dismiss = () => { try { sessionStorage.setItem("tccFollowSeen", "1"); } catch (e) {} closePop(); };
  let seen = false;
  try { seen = !!sessionStorage.getItem("tccFollowSeen"); } catch (e) {}
  if (!seen) setTimeout(() => { followPop.hidden = false; document.body.classList.add("pop-open"); }, 1600);
  const closeBtn = $("#fpClose");
  if (closeBtn) closeBtn.addEventListener("click", dismiss);
  const backdrop = $("#fpBackdrop");
  if (backdrop) backdrop.addEventListener("click", dismiss);
  followPop.querySelectorAll(".fp-btn").forEach((b) => b.addEventListener("click", dismiss));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !followPop.hidden) dismiss(); });
}

/* ---- Scroll reveal ---------------------------------------------------- */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
