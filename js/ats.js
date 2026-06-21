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

  /* ---- Analyze flow (-> results page) --------------------------------- */
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
      location.href = `result.html?s=${r.total}&b=${r.band}&i=${r.issues}`;
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
