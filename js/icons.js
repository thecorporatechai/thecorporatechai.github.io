/* =====================================================================
   The Corporate Chai — shared colourful "Connect with us" icons.
   Used by the home footer and every sub-page footer.
   ===================================================================== */
(function () {
  const ICON = {
    whatsapp: '<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#25D366"/><path d="M9 7.2c.4 0 .8.3.9.7l.4 1.5c.1.4 0 .8-.3 1l-.7.6c.5 1 1.3 1.8 2.3 2.3l.6-.7c.2-.3.6-.4 1-.3l1.5.4c.4.1.7.5.7.9v1c0 .6-.5 1.1-1.1 1A8 8 0 0 1 8 8.3C8 7.7 8.4 7.2 9 7.2z" fill="#fff"/></svg>',
    instagram: '<svg viewBox="0 0 24 24"><defs><linearGradient id="tccIg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#feda75"/><stop offset=".5" stop-color="#d62976"/><stop offset="1" stop-color="#962fbf"/></linearGradient></defs><rect width="24" height="24" rx="6" fill="url(#tccIg)"/><rect x="6.4" y="6.4" width="11.2" height="11.2" rx="3.4" fill="none" stroke="#fff" stroke-width="1.5"/><circle cx="12" cy="12" r="2.7" fill="none" stroke="#fff" stroke-width="1.5"/><circle cx="15.7" cy="8.3" r="1.05" fill="#fff"/></svg>',
    youtube: '<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#FF0000"/><path d="M10 8.4l6.2 3.6L10 15.6z" fill="#fff"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#0A66C2"/><circle cx="8" cy="8.2" r="1.3" fill="#fff"/><rect x="6.8" y="10.4" width="2.4" height="7" fill="#fff"/><path d="M11.4 10.4h2.3v1a2.7 2.7 0 0 1 4.9 1.6v4.4h-2.4v-3.9c0-.8-.5-1.3-1.2-1.3s-1.3.6-1.3 1.4v3.8h-2.3z" fill="#fff"/></svg>',
    email: '<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#d9971c"/><rect x="5.5" y="7.5" width="13" height="9" rx="1.6" fill="none" stroke="#fff" stroke-width="1.5"/><path d="M6 8.6l6 4.4 6-4.4" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>',
    facebook: '<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#1877F2"/><path d="M14.6 12.2h1.7l.3-2.2h-2v-1.4c0-.6.2-1 1.1-1h1V5.6c-.2 0-.9-.1-1.6-.1-1.7 0-2.8 1-2.8 2.9v1.6H9.5v2.2h1.8V19h2.3v-6.8z" fill="#fff"/></svg>',
    twitter: '<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#000"/><path d="M6.5 6.5h2.7l2.5 3.4 3-3.4h1.6l-3.9 4.4 4.5 6.2h-2.7l-2.8-3.8-3.3 3.8H6.5l4.2-4.8z" fill="#fff"/></svg>'
  };
  window.TCC_ICON = ICON;

  window.renderContactRow = function (el, cfg) {
    if (!el || !cfg) return;
    const links = [
      { k: "whatsapp", href: `https://wa.me/${cfg.whatsapp}`, label: "WhatsApp" },
      { k: "instagram", href: cfg.instagram, label: "Instagram" },
      { k: "youtube", href: cfg.youtube, label: "YouTube" },
      { k: "linkedin", href: cfg.linkedin, label: "LinkedIn" },
      { k: "twitter", href: cfg.twitter, label: "X" },
      { k: "facebook", href: cfg.facebook, label: "Facebook" },
      { k: "email", href: `mailto:${cfg.email}`, label: "Email" }
    ].filter((l) => l.href);
    el.innerHTML = links.map((l) =>
      `<a class="social-ico" href="${l.href}" target="_blank" rel="noopener noreferrer" aria-label="${l.label}" title="${l.label}">${ICON[l.k]}</a>`
    ).join("");
  };
})();
