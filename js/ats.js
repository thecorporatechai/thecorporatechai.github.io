/* =====================================================================
   The Corporate Chai — free, in-browser ATS resume score checker.
   Upload a resume -> a short "cooking up your score" animation ->
   it scores the resume locally and sends you to the results page
   (result.html) with the score in the URL. The file itself is never
   uploaded or stored — only the resulting number travels onward.
   ===================================================================== */
(function () {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const els = {
    drop: $("#fileDrop"),
    file: $("#resumeFile"),
    status: $("#formStatus"),
    input: $("#atsInput"),
    result: $("#atsResult")
  };
  if (!els.file || !els.result) return;

  const CFG = (typeof SITE_CONFIG !== "undefined" && SITE_CONFIG) ? SITE_CONFIG : {};
  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  }

  function setStatus(message, type) {
    els.status.textContent = message || "";
    els.status.className = "form-status" + (message ? " show" : "") + (type ? " form-status--" + type : "");
  }

  /* ---- Upload (auto-runs the check) ----------------------------------- */
  els.file.addEventListener("change", () => { if (els.file.files[0]) analyze(els.file.files[0]); });
  ["dragenter", "dragover"].forEach((ev) =>
    els.drop.addEventListener(ev, (e) => { e.preventDefault(); els.drop.classList.add("dragover"); }));
  ["dragleave", "drop"].forEach((ev) =>
    els.drop.addEventListener(ev, (e) => { e.preventDefault(); els.drop.classList.remove("dragover"); }));
  els.drop.addEventListener("drop", (e) => {
    if (e.dataTransfer.files.length) { els.file.files = e.dataTransfer.files; analyze(e.dataTransfer.files[0]); }
  });

  /* ---- Text extraction ------------------------------------------------ */
  async function extractText(file) {
    const name = file.name.toLowerCase();
    if (name.endsWith(".txt")) return file.text();
    if (name.endsWith(".pdf")) {
      if (!window.pdfjsLib) throw new Error("PDF reader failed to load. Please check your connection or try a DOCX file.");
      const buf = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      let text = "";
      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const content = await page.getTextContent();
        text += content.items.map((i) => i.str).join(" ") + "\n";
      }
      return text;
    }
    if (name.endsWith(".docx") || name.endsWith(".doc")) {
      if (!window.mammoth) throw new Error("DOCX reader failed to load. Please check your connection or try a PDF file.");
      const buf = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer: buf });
      return result.value;
    }
    throw new Error("Unsupported file type. Please upload a PDF, DOCX or TXT file.");
  }

  /* ---- Scoring -------------------------------------------------------- */
  const ACTION_VERBS = [
    "led", "managed", "built", "created", "developed", "designed", "launched",
    "improved", "increased", "reduced", "delivered", "drove", "owned", "achieved",
    "implemented", "optimized", "automated", "spearheaded", "streamlined",
    "coordinated", "analyzed", "engineered", "scaled", "boosted", "negotiated",
    "mentored", "executed", "established", "generated", "grew", "saved", "shipped"
  ];
  const STOPWORDS = new Set((
    "the a an and or for to of in on at by with from as is are be will you your we our " +
    "this that these those it its they their he she his her i me my can must should " +
    "have has had do does did not no yes job role work team company who whom which what " +
    "when where why how about into over under out up down per via etc such including " +
    "responsibilities requirements experience skills ability strong good excellent plus"
  ).split(/\s+/));
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const tokenize = (t) => (t.toLowerCase().match(/[a-z][a-z+.#-]{1,}/g) || [])
    .map((w) => w.replace(/[.+#-]+$/, "")).filter((w) => w.length >= 3 && !STOPWORDS.has(w));

  function scoreResume(text) {
    const raw = (text || "").replace(/[   ]/g, " ");
    const lower = raw.toLowerCase();
    const words = (raw.match(/\b[\w'-]+\b/g) || []).length;
    const lines = raw.split(/\r?\n/);

    const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(raw);
    const pm = raw.match(/(\+?\d[\d\s().-]{7,}\d)/);
    const hasPhone = !!pm && pm[0].replace(/\D/g, "").length >= 8;
    const hasProfileLink = /linkedin\.com\//i.test(raw) || /github\.com\//i.test(raw);
    const pages = Math.max(1, Math.ceil(words / 500));

    const sec = (re) => re.test(lower);
    const hasExperience = sec(/\b(experience|work history|employment|professional background)\b/);
    const hasEducation = sec(/\b(education|academic|qualification)\b/);
    const hasSkills = sec(/\b(skills|technical skills|core competenc|expertise)\b/);
    const hasSummary = sec(/\b(summary|objective|profile|about me)\b/);

    const quantHits = (raw.match(/(\d+\s?%|₹\s?\d|\$\s?\d|\b\d+\s?\+|\b\d{2,}\b)/g) || []).length;
    let verbHits = 0;
    ACTION_VERBS.forEach((v) => { if (new RegExp("\\b" + v + "\\b", "i").test(raw)) verbHits++; });

    const hasBullets = lines.filter((l) => /^\s*[•▪◦–⁃*-]/.test(l)).length >= 3;
    const hasDates = /\b(19|20)\d{2}\b/.test(raw);
    const letters = (raw.match(/[a-z]/gi) || []).length;
    const upper = (raw.match(/[A-Z]/g) || []).length;
    const tooShouty = letters > 0 && upper / letters > 0.45;
    const garbled = (raw.match(/�/g) || []).length > 10;
    const toks = tokenize(raw);
    const uniqueRatio = toks.length ? new Set(toks).size / toks.length : 0;

    let earned = 0, possible = 0;
    const add = (e, m) => { earned += e; possible += m; };
    add((hasEmail ? 4 : 0) + (hasPhone ? 4 : 0) + (hasProfileLink ? 3 : 0) +
        ((words >= 300 && words <= 1100) ? 4 : (words >= 200 && words <= 1400 ? 2 : 1)), 15);
    add((hasExperience ? 8 : 0) + (hasSkills ? 7 : 0) + (hasEducation ? 5 : 0) + (hasSummary ? 5 : 0), 25);
    add((quantHits >= 8 ? 12 : quantHits >= 4 ? 8 : quantHits >= 1 ? 4 : 0) +
        (verbHits >= 8 ? 13 : verbHits >= 4 ? 9 : verbHits >= 1 ? 5 : 0), 25);
    add((hasBullets ? 5 : 0) + (hasDates ? 4 : 0) + (tooShouty ? 0 : 3) + (garbled ? 0 : 3), 15);
    add(Math.round(clamp(verbHits / 8, 0, 1) * 8) + (hasBullets ? 4 : 0), 12);
    add(Math.round(clamp((uniqueRatio - 0.3) / 0.4, 0, 1) * 8), 8);

    const total = clamp(Math.round((earned / possible) * 100), 0, 100);
    const bands = CFG.scoreBands || { medium: 55, high: 80 };
    const band = total >= bands.high ? "high" : total >= bands.medium ? "medium" : "low";

    const problems = [
      !hasEmail, !hasPhone, !hasProfileLink, !hasSummary, !hasSkills,
      !hasExperience, !hasEducation, quantHits < 4, verbHits < 4, !hasBullets,
      (words < 300 || pages > 2), garbled, uniqueRatio < 0.45
    ];
    return { total, band, issues: problems.filter(Boolean).length };
  }

  /* ---- Loading -------------------------------------------------------- */
  const LOADING_MSGS = [
    "Brewing your resume…", "Reading between the lines…", "Scanning for ATS keywords…",
    "Measuring impact &amp; clarity…", "Checking articulation &amp; repetition…", "Plating up your score…"
  ];
  function showLoading() {
    els.input.hidden = true;
    els.result.hidden = false;
    els.result.innerHTML = `
      <div class="ats-loading">
        <div class="ats-spinner"><span></span><span></span><span></span></div>
        <p class="ats-loading-msg" id="atsLoadMsg">${LOADING_MSGS[0]}</p>
        <p class="ats-loading-sub">Cooking up your score…</p>
      </div>`;
    const msgEl = $("#atsLoadMsg");
    let i = 0;
    return setInterval(() => { i = (i + 1) % LOADING_MSGS.length; if (msgEl) msgEl.innerHTML = LOADING_MSGS[i]; }, 750);
  }

  /* ---- Result card (rendered inline; replaces the old result.html) ----- */
  function waLink(m) { return `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(m)}`; }
  // Scroll the WINDOW to an element — never the .ats-section itself. The section is
  // overflow:hidden (a scroll container), so calling scrollIntoView on a child would
  // scroll the section internally and clip its own heading under the page hero.
  function scrollIntoChecker(el) {
    try {
      var sec = el.closest && el.closest(".ats-section");
      if (sec) sec.scrollTop = 0;
      var nav = document.querySelector(".subnav");
      var navH = nav ? nav.offsetHeight : 0;
      var y = el.getBoundingClientRect().top + window.pageYOffset - navH - 14;
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    } catch (e) { /* no-op */ }
  }
  function resetChecker() {
    els.result.hidden = true;
    els.result.innerHTML = "";
    els.input.hidden = false;
    els.file.value = "";
    setStatus("");
    scrollIntoChecker(els.input);
  }
  function renderScoreCard(total, band, issues) {
    const bands = CFG.scoreBands || { medium: 55, high: 80 };
    if (["low", "medium", "high"].indexOf(band) < 0) band = total >= bands.high ? "high" : total >= bands.medium ? "medium" : "low";
    const VERDICT = { low: "Weak", medium: "Medium", high: "Strong" };
    const tmpl = (CFG.services || []).find((s) => s.id === (CFG.templatesServiceId || "01")) || {};
    const sampleReportUrl = CFG.sampleReportUrl || "#";
    const reportUrl = waLink(`Hi! I used the free ATS checker and scored ${total}/100. I'd like the detailed fix report (${CFG.reportPrice || "₹19"}).`);
    const rewriteUrl = waLink(`Hi! I used the free ATS checker and scored ${total}/100. I'd like the ATS Resume Rewrite (${CFG.rewritePrice || "₹199"}) to fix it.`);
    const tmplUrl = waLink(tmpl.whatsappMsg || "Hi! I want the ATS resume templates (₹49).");
    const ARC = Math.PI * 90;
    const offset = ARC * (1 - total / 100);
    const issuesHtml = issues > 0
      ? `<p class="rc-issues">${issues} ${issues === 1 ? "issue" : "issues"} found</p>`
      : `<p class="rc-issues ok">No major issues 🎉</p>`;
    els.result.innerHTML = `
      <div class="rc-card band-${band}">
        <h4 class="rc-title">Resume Checker</h4>
        <div class="semi-gauge">
          <svg viewBox="0 0 220 128" aria-hidden="true">
            <path class="sg-track" d="M20 118 A 90 90 0 0 1 200 118"></path>
            <path class="sg-fill" d="M20 118 A 90 90 0 0 1 200 118" style="stroke-dasharray:${ARC};stroke-dashoffset:${ARC}"></path>
          </svg>
          <div class="sg-score"><strong>${total}</strong><span>/100</span></div>
        </div>
        <div class="rc-verdict">${VERDICT[band]}</div>
        ${issuesHtml}
        <a class="sample-report-btn" href="${sampleReportUrl}" target="_blank" rel="noopener noreferrer">View sample report →</a>
        <a class="btn btn-primary btn-full" href="${reportUrl}" target="_blank" rel="noopener noreferrer">Unlock full report — ${CFG.reportPrice || "₹19"} →</a>
        <a class="btn btn-dark btn-full" href="${rewriteUrl}" target="_blank" rel="noopener noreferrer">Rewrite my resume — ${CFG.rewritePrice || "₹199"} →</a>
        <a class="ats-reset" id="atsReset" role="button" tabindex="0">↻ Check another resume</a>
        <div class="diy-card">
          <div class="diy-copy">
            <span class="diy-tag">DIY · ${tmpl.price || "₹49"}</span>
            <strong>Prefer to fix it yourself?</strong>
            <p>Grab our 5 ATS-ready resume templates and rewrite it on your own.</p>
          </div>
          <a class="btn btn-primary" href="${tmplUrl}" target="_blank" rel="noopener noreferrer">Get templates →</a>
        </div>
        <p class="ats-privacy">🔒 Scored in your browser — your resume was never uploaded or stored.</p>
        <p class="ats-disclaimer">*This ATS score is generated by our own heuristic logic for guidance only. It is not aligned with, or endorsed by, any specific ATS, employer or official benchmark.</p>
      </div>`;
    els.result.hidden = false;
    els.input.hidden = true;
    requestAnimationFrame(() => { const f = els.result.querySelector(".sg-fill"); if (f) f.style.strokeDashoffset = offset; });
    const reset = document.getElementById("atsReset");
    if (reset) reset.addEventListener("click", resetChecker);
    scrollIntoChecker(els.result);
  }

  /* ---- Analyze flow (renders the result card inline) ------------------- */
  async function analyze(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setStatus("That file is over 5 MB. Please upload a smaller version.", "error"); els.file.value = ""; return; }
    setStatus("");
    const timer = showLoading();
    const minDelay = new Promise((r) => setTimeout(r, 600));
    try {
      const text = await extractText(file);
      if (!text || text.replace(/\s/g, "").length < 120) {
        throw new Error("We couldn't read enough text — this may be a scanned/image PDF. Try a DOCX or a text-based PDF.");
      }
      const r = scoreResume(text);
      await minDelay;
      clearInterval(timer);
      renderScoreCard(r.total, r.band, r.issues);
    } catch (err) {
      clearInterval(timer);
      els.result.hidden = true;
      els.result.innerHTML = "";
      els.input.hidden = false;
      els.file.value = "";
      setStatus(err.message || "Something went wrong while reading the file. Please try a different format.", "error");
    }
  }
})();
