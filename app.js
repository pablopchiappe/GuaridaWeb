// Scroll suave sin modificar la URL (evita que al reabrir la página salte a una sección)
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

fetch('config.json')
  .then(r => r.json())
  .then(cfg => {
    const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
    const href = (id, url) => { const el = document.getElementById(id); if (el) el.href = url; };

    // Tipografía
    const tip = cfg.tipografias?.[cfg.tipografia];
    if (tip) {
      const link = document.querySelector('link[href*="fonts.googleapis.com"]');
      if (link) link.href = tip.googleFonts;
      const root = document.documentElement.style;
      root.setProperty('--font-head', tip['font-head']);
      root.setProperty('--font-body', tip['font-body']);
    }

    // Imagen de fondo del hero
    if (cfg.heroImg) {
      document.documentElement.style.setProperty('--hero-img', `url('${cfg.heroImg}')`);
      const heroImgEl = document.getElementById('hero-img');
      if (heroImgEl) heroImgEl.src = cfg.heroImg;
    }

    // Paleta de colores
    const paleta = cfg.paletas?.[cfg.paleta];
    if (paleta) {
      const root = document.documentElement.style;
      Object.entries(paleta).forEach(([k, v]) => root.setProperty(`--${k}`, v));
    }

    document.getElementById('page-title').textContent = cfg.nombre;
    document.querySelector('meta[name="description"]').content = cfg.descripcion ?? '';

    const navLogo = document.getElementById('nav-logo');
    if (navLogo && cfg.logo) { navLogo.src = cfg.logo; navLogo.alt = cfg.nombre; }
    else if (navLogo) navLogo.style.display = 'none';

    set('nav-nombre',   cfg.nombre);
    set('hero-nombre',  cfg.nombre);
    set('hero-slogan',  cfg.slogan);
    set('hero-desc',    cfg.descripcion ?? '');
    set('footer-nombre', cfg.nombre);

    href('nav-cta',      cfg.appUrl);
    href('inscripcion-btn', cfg.appUrl);
    href('cursos-link',  cfg.cursosUrl);
    href('footer-cta', cfg.appUrl);

    const ig = cfg.contacto?.instagram;
    if (ig) href('footer-ig', `https://instagram.com/${ig}`);

    // Servicios
    const grid = document.getElementById('grid-servicios');
    if (grid && cfg.servicios) {
      grid.innerHTML = cfg.servicios.map(s => `
        <div class="servicio-card">
          <div class="servicio-card__icono">
            <img src="${s.icono}" alt="${s.nombre}" />
          </div>
          <h3 class="servicio-card__nombre">${s.nombre}</h3>
          <p class="servicio-card__desc">${s.descripcion}</p>
        </div>`).join('');
    }

    // Horarios
    const hl = document.getElementById('horarios-list');
    if (hl && cfg.horarios) {
      hl.innerHTML = cfg.horarios.map(h => `
        <li>
          <span class="dias">${h.dias}</span>
          <span class="hora">${h.horario}</span>
        </li>`).join('');
    }

    // Contacto
    const cl = document.getElementById('contacto-list');
    if (cl && cfg.contacto) {
      const c = cfg.contacto;
      const items = [];

      if (c.telefono)
        items.push(['📞', `<a href="tel:${c.telefono.replace(/\s/g,'')}">${c.telefono}</a>`]);

      if (c.whatsapp)
        items.push(['💬', `<a href="https://wa.me/${c.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>`]);

      if (c.email)
        items.push(['✉️', `<a href="mailto:${c.email}">${c.email}</a>`]);

      if (c.instagram)
        items.push(['📷', `<a href="https://instagram.com/${c.instagram}" target="_blank" rel="noopener">@${c.instagram}</a>`]);

      if (c.direccion) {
        const mapHref = c.mapsUrl ?? `https://maps.google.com/?q=${encodeURIComponent(c.direccion)}`;
        items.push(['📍', `<a href="${mapHref}" target="_blank" rel="noopener">${c.direccion}</a>`]);
      }

      cl.innerHTML = items.map(([icon, content]) => `
        <li>
          <span class="icon">${icon}</span>
          <span>${content}</span>
        </li>`).join('');
    }
  })
  .catch(err => console.error('Error cargando config.json:', err));
