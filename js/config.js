/* =====================================================================
   The Corporate Chai — site configuration
   Edit the values below to update the site. No build step required.
   Shared by index.html and all sub-pages (tools / social / certifications).
   ===================================================================== */
const SITE_CONFIG = {
  /* --- Contact & socials ---------------------------------------------- */
  whatsapp: "919032687452",                 // international format, no "+"
  whatsappDisplay: "+91 90326 87452",
  email: "thecorporatechai@gmail.com",
  domain: "thecorporatechai.in",
  instagram: "https://www.instagram.com/thecorporatechai.in",
  youtube: "https://www.youtube.com/@thecorporatechai_in",
  linkedin: "https://www.linkedin.com/company/thecorporatechai/?viewAsMember=true",   // company page
  facebook: "https://www.facebook.com/share/1DCNZBtcvo/",   // Facebook page
  twitter: "https://x.com/D_CorporateChai",                 // X (Twitter)

  /* --- Founder --------------------------------------------------------- */
  founder: {
    name: "Arava Anantha Rao",
    title: "Founder · Information Security Professional",
    bio: "An Information Security professional helping people get noticed, get hired, and grow — with honest, practical, no-nonsense career support.",
    linkedin: "https://www.linkedin.com/in/aanantharao/",  // founder personal LinkedIn
    website: "https://aravaanantharao.in"
  },

  /* --- WhatsApp group (Corporate Majdoor Community) -------------------
     Group info → Invite via link. Used by the community + Coming Soon. */
  whatsappGroupUrl: "https://whatsapp.com/channel/0029Vb8MuHREquiUlbG34I47",

  /* --- Free HR contact list (follow-to-unlock) ------------------------
     Paste your OneDrive "anyone with the link" URL to the Excel sheet. */
  hrContactsUrl: "https://docs.google.com/spreadsheets/d/11RINwimXdBOxgIPD5c_PXuM0jmwbqpKh/edit?gid=1862004380#gid=1862004380",

  /* --- Google review link (Rate us) ----------------------------------
     From Google Business Profile → Ask for reviews → copy link. */
  googleReviewUrl: "https://g.page/r/CVzq0t8L2X00EBM/review",

  /* --- Hero stats ------------------------------------------------------ */
  stats: [
    { value: "1000+",  label: "Professionals helped", sub: "and counting" },
    { value: "500+",   label: "Interview calls landed", sub: "after our help" },
    { value: "10s",    label: "Instant ATS score", sub: "free, in your browser" },
    { value: "24–48h", label: "Resume delivery", sub: "fast turnaround" }
  ],

  /* --- Rolling highlights ticker (under the header) -------------------- */
  highlights: [
    "Resume Rewrites", "LinkedIn Makeovers", "Naukri Optimization",
    "Recruiter Connections", "ATS Templates", "Certification Kits", "Premium Tools"
  ],

  /* --- Reviews ticker (in the Services section) ------------------------ */
  reviews: [
    "“Loved it!” ⭐⭐⭐⭐⭐", "Got 3 interview calls in a week",
    "Finally cleared the ATS bots", "Got a call from Deloitte 🎉",
    "Recruiters started reaching out", "Worth every rupee",
    "Got shortlisted at Accenture", "My LinkedIn reach blew up"
  ],

  /* --- ATS checker --> paid CTAs --------------------------------------- */
  rewriteServiceId: "02",                 // ₹199 rewrite (WhatsApp)
  templatesServiceId: "01",               // ₹49 DIY templates flash-card
  rewritePrice: "₹199",
  reportPrice: "₹19",                     // detailed fix report (WhatsApp)
  sampleReportUrl: "https://drive.google.com/file/d/1YUeiuonOJZDDY09GT_1Lfx4kiA4Bx0qo/view?usp=sharing",
  buildPrice: "₹250",                     // "Build my resume" service (offer price)
  buildPriceOriginal: "₹500",             // struck-through original
  buildOffer: "50% off · first 100 users",
  scoreBands: { medium: 55, high: 80 },   // <medium = Weak, <high = Medium, else Strong

  /* --- Paid services (cards under "Services") -------------------------- */
  services: [
    { id: "00", title: "ATS Resume Report", price: "₹19", priceNote: "detailed score report", sample: true,
      sampleHref: "samples.html#reports", sampleLabel: "View sample report",
      feats: ["Complete ATS score breakdown", "Priority fixes for shortlist chances", "Sample report preview available"],
      whatsappMsg: "Hi! I want the detailed ATS Resume Report (₹19)." },

    { id: "01", title: "5 ATS Resume Templates", price: "₹49", priceNote: "5 editable templates",
      feats: ["5 industry-specific templates", "Editable Word + PDF", "Instant download"],
      // Sample-templates "View sample" button → paste the Google Drive share link
      // below (the button stays hidden until a valid https:// link is added).
      sampleHref: "samples.html#templates",
      sampleLabel: "View sample template",
      whatsappMsg: "Hi! I want the 5 ATS Resume Templates pack (₹49)." },

    { id: "02", title: "ATS Resume Rewrite", price: "₹199", priceNote: "complete rewrite", bonus: "Free AI job-hunting prompts",
      feats: ["Professionally rewritten content", "Keyword + impact optimization", "Clean ATS-friendly formatting"],
      whatsappMsg: "Hi! I want the ATS Resume Rewrite service (₹199)." },

    { id: "03", title: "Resume + Naukri Optimization", price: "₹399", priceNote: "visibility boost", bonus: "Free AI job-hunting prompts",
      feats: ["Everything in Resume Rewrite", "Naukri profile optimization", "More recruiter visibility"],
      whatsappMsg: "Hi! I want Resume + Naukri Optimization (₹399)." },

    { id: "04", title: "Complete Career Boost", price: "₹499", priceNote: "LinkedIn + Naukri + Resume", featured: true, bonus: "Free AI job-hunting prompts",
      feats: ["LinkedIn profile optimization", "Naukri + ATS resume rewrite", "Personal branding boost"],
      whatsappMsg: "Hi! I want the Complete Career Boost Package (₹499)." },

    { id: "05", title: "LinkedIn Premium Services", price: "₹699*", priceNote: "starting from",
      feats: ["Career, Business & more — all types", "Premium access + visibility boost", "Stand out to recruiters & clients"],
      whatsappMsg: "Hi! I'm interested in LinkedIn Premium Services (career / business)." },

    { id: "06", title: "Premium Tools at Lower Cost", price: "Up to 70% off", priceNote: "Canva, ChatGPT Plus & more",
      feats: ["Canva Pro, ChatGPT Plus & more", "Coursera & Udemy Pro access", "Genuine, low-cost plans"],
      href: "tools.html" },

    { id: "07", title: "Social Media Services", price: "₹20*", priceNote: "starting from",
      feats: ["Instagram growth services", "YouTube growth services", "Followers, views, engagement & more"],
      href: "social.html" },

    { id: "08", title: "Certifications, Exam-Prep & AI Prompts", price: "₹20*", priceNote: "starting from",
      feats: ["Roadmaps + study materials", "AI Prompts Pack included", "ISO 27001, CompTIA & more"],
      href: "certifications.html" },

    { id: "FREE", free: true, title: "1500+ Verified HR Contacts", price: "₹0", priceNote: "free Excel directory",
      feats: ["Verified HR & recruiter emails", "Across 50+ top companies", "Updated regularly · no signup"] }
  ],

  /* --- Service 06 page: Premium tools --------------------------------- */
  toolsPage: [
    { name: "Canva Pro", note: "Design like a pro — templates, brand kit, magic tools." },
    { name: "ChatGPT Plus", note: "Priority access to the most capable AI models." },
    { name: "Gemini Pro", note: "Google's advanced AI — long context & deep reasoning." },
    { name: "Coursera Plus", note: "Unlimited courses & professional certificates." },
    { name: "Udemy Pro", note: "Top-rated courses across tech, business & design." },
    { name: "LinkedIn Premium", note: "InMail, insights and recruiter visibility." }
    /* add more tools here — they appear automatically */
  ],

  /* --- Service 07 page: Social media services ------------------------- */
  socialPage: {
    instagram: [
      { name: "Instagram Followers", note: "Real, gradual follower growth." },
      { name: "Instagram Likes", note: "Boost likes on your posts & reels." },
      { name: "Instagram Shares", note: "More shares for wider reach." },
      { name: "Instagram Engagement", note: "Comments, saves & overall engagement." }
    ],
    youtube: [
      { name: "YouTube Shorts Views", note: "Views for your Shorts." },
      { name: "YouTube Video Views", note: "Views for long-form videos." },
      { name: "YouTube Subscribers", note: "Grow your subscriber base." }
    ]
    /* add more categories/items here */
  },

  /* --- Service 08 page: 3 sections (prompt packs / certs / exams) ------ */
  aiPromptPacks: [
    { title: "AI Job-Hunting Prompt Pack", price: "₹19",
      desc: "100+ prompts for resumes, cover letters, interview prep, LinkedIn & cold emails.",
      whatsappMsg: "Hi! I want the AI Job-Hunting Prompt Pack (₹19)." },
    { title: "Thumbnail & Reel-Cover Prompt Pack", price: "₹19",
      desc: "Prompts to create scroll-stopping YouTube thumbnails & reel / cover pages.",
      whatsappMsg: "Hi! I want the Thumbnail & Reel-Cover Prompt Pack (₹19)." },
    { title: "Photo & Poster Design Prompt Pack", price: "₹19*",
      desc: "Prompts for photo editing, poster & graphic design — plus a free website.",
      whatsappMsg: "Hi! I want the Photo & Poster Design Prompt Pack + free website (₹19)." }
    /* add more prompt packs here */
  ],
  examPacks: [
    { title: "SSC CGL Pack", price: "₹49*",
      desc: "Study material, a study plan, notes, reference videos & suggested course sites — all included.",
      whatsappMsg: "Hi! I want the SSC CGL exam pack (₹49)." }
    /* add more exam packs here */
  ],
  certifications: [
    { code: "ISO 27001:2022 LA", name: "Lead Auditor", desc: "Roadmap, study materials & guidance to clear the exam." },
    { code: "ISO 27001:2022 LI", name: "Lead Implementer", desc: "Roadmap, study materials & guidance to clear the exam." },
    { code: "CompTIA Security+", name: "SY0-701", desc: "Roadmap, study materials & AI prompt cheat sheets." }
    /* add more certifications here */
  ],

  /* --- Results page: impact timeline + social proof -------------------
     Edit these to your real outcomes. Company names render as text chips
     (swap for real logo images later if you have the rights to use them). */
  impactTimeline: [
    { when: "Week 1", text: "Interview calls start landing in the inbox." },
    { when: "Week 2–3", text: "2–3 calls a week + recruiters reaching out directly." },
    { when: "Ongoing", text: "LinkedIn profile views & reach climb steadily." }
  ],
  companies: [
    "Deloitte", "PwC", "EY", "KPMG", "Accenture", "Tech Mahindra",
    "TCS", "Infosys", "Wipro", "Deutsche Bank", "Capgemini", "Cognizant"
  ],

  /* --- Samples page (samples.html) ------------------------------------
     Image tiles shown on the Samples page. Drop a new image in
     assets/samples/ and add a line here — it appears automatically. */
  sampleTemplates: [
    { img: "assets/samples/template-01.jpg", name: "ATS · GRC / Security" },
    { img: "assets/samples/template-02.jpg", name: "ATS · Developer" },
    { img: "assets/samples/template-03.jpg", name: "Modern · Black & White" },
    { img: "assets/samples/template-04.jpg", name: "Simple Professional · A4" },
    { img: "assets/samples/template-05.jpg", name: "Simple Professional" },
    { img: "assets/samples/template-06.jpg", name: "Standard Professional" },
    { img: "assets/samples/template-07.jpg", name: "Modern Professional · Gold" },
    { img: "assets/samples/template-08.jpg", name: "Software Engineer" },
    { img: "assets/samples/template-09.jpg", name: "Simple CV · Blue" },
    { img: "assets/samples/template-10.jpg", name: "Nursing / Healthcare" },
    { img: "assets/samples/template-11.jpg", name: "Fresh Graduate" },
    { img: "assets/samples/template-12.jpg", name: "Corporate ATS · Minimalist" },
    { img: "assets/samples/template-13.jpg", name: "Accountant · Minimalist" },
    { img: "assets/samples/template-14.jpg", name: "Modern Professional · Navy" },
    { img: "assets/samples/template-15.jpg", name: "Professional Modern CV" },
    { img: "assets/samples/template-16.jpg", name: "Accounting Executive CV" }
  ],
  sampleReports: [
    { img: "assets/samples/report-01.jpg", name: "ATS Score Report · Page 1" },
    { img: "assets/samples/report-02.jpg", name: "ATS Score Report · Page 2" }
  ],

  /* --- Coming soon ----------------------------------------------------- */
  comingSoon: [
    { tag: "CC", title: "Corporate Connect", sub: "1:1 with industry mentors",
      desc: "Like AstroTalk, but for your career. Book real conversations with verified industry mentors & SMEs — not generic advice." },
    { tag: "in", title: "LinkedIn Profile Score Checker", sub: "Free · coming soon",
      desc: "Paste your LinkedIn profile and get an instant strength score with clear, actionable tips to get noticed by recruiters." }
  ]
};
