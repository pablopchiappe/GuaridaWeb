// Scroll suave sin modificar la URL (evita que al reabrir la página salte a una sección)
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

function positionCallout() {
  const callout = document.querySelector('.hero__callout');
  const btn     = document.getElementById('nav-cta');
  const svg     = document.getElementById('callout-arrow-svg');
  if (!callout || !btn || !svg) return;

  const br  = btn.getBoundingClientRect();
  const hr  = callout.parentElement.getBoundingClientRect();

  // Posiciono relativo al hero (position: absolute)
  const gap = 10;
  callout.style.top  = (br.bottom + gap + 12 - hr.top) + 'px';
  callout.style.left = (br.left + br.width / 2 - callout.offsetWidth / 2 - 120 - hr.left) + 'px';

  const cr = callout.getBoundingClientRect();

  // Flecha corta: desde el borde izquierdo del callout hasta el centro-bottom del botón
  const x1 = cr.right;
  const y1 = cr.top + cr.height / 2;
  const x2 = br.left + br.width / 2;
  const y2 = br.bottom + 6;

  const angle = Math.atan2(y2 - y1, x2 - x1);
  const len = 8;
  const ah1x = y1 - len * Math.cos(angle - 0.4);
  const ah1y = y1 - len * Math.sin(angle - 0.4);
  const ah2x = y1 - len * Math.cos(angle + 0.4);
  const ah2y = y1 - len * Math.sin(angle + 0.4);

  // Flecha apunta HACIA ARRIBA al botón
  const ax = x1, ay = y1;
  const bx = x2, by = y2;
  const aAngle = Math.atan2(by - ay, bx - ax);
  const aLen = 8;
  const a1x = bx - aLen * Math.cos(aAngle - 0.4);
  const a1y = by - aLen * Math.sin(aAngle - 0.4);
  const a2x = bx - aLen * Math.cos(aAngle + 0.4);
  const a2y = by - aLen * Math.sin(aAngle + 0.4);

  svg.innerHTML = `
    <path d="M${ax},${ay} Q${ax},${ay - 10} ${bx},${by}"
          stroke="var(--accent)" stroke-width="2" fill="none" stroke-linecap="round" opacity=".9"/>
    <path d="M${a1x},${a1y} L${bx},${by} L${a2x},${a2y}"
          stroke="var(--accent)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>`;
}

window.addEventListener('resize', () => { if (window.innerWidth > 480) positionCallout(); });

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
    if (cfg.heroImgs && cfg.heroImgs.length) {
      const imgsContainer = document.getElementById('hero-carousel-imgs');
      const dotsContainer = document.getElementById('hero-carousel-dots');
      if (imgsContainer && dotsContainer) {
        const w = cfg.heroImgWidth  ?? 749;
        const h = cfg.heroImgHeight ?? 241;
        const interval = cfg.heroImgInterval ?? 3500;
        document.documentElement.style.setProperty('--carousel-w', w + 'px');
        document.documentElement.style.setProperty('--carousel-h', h + 'px');

        cfg.heroImgs.forEach((src, i) => {
          const img = document.createElement('img');
          img.src = src; img.alt = '';
          if (i === 0) img.classList.add('active');
          imgsContainer.appendChild(img);

          const dot = document.createElement('button');
          dot.className = 'dot' + (i === 0 ? ' active' : '');
          dot.addEventListener('click', () => goTo(i));
          dotsContainer.appendChild(dot);
        });

        const imgs = imgsContainer.querySelectorAll('img');
        const dots = dotsContainer.querySelectorAll('.dot');
        let current = 0;

        function goTo(n) {
          imgs[current].classList.remove('active');
          dots[current].classList.remove('active');
          current = (n + imgs.length) % imgs.length;
          imgs[current].classList.add('active');
          dots[current].classList.add('active');
        }

        setInterval(() => goTo(current + 1), interval);
      }
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
    if (cfg.callout) {
      const el = document.getElementById('hero-callout');
      if (el) el.innerHTML = cfg.callout.replace(/\n/g, '<br>');
    }
    if (window.innerWidth > 480) setTimeout(positionCallout, 200);
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

      if (c.whatsapp) {
        items.push(['💬', `<a href="https://wa.me/${c.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>`]);
        const waBtn = document.getElementById('whatsapp-btn');
        if (waBtn) waBtn.href = `https://wa.me/${c.whatsapp}?text=${encodeURIComponent('Hola Guarida! Tengo una consulta')}`;
      }

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
