// Scroll suave sin modificar la URL (evita que al reabrir la página salte a una sección)
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

const scrollspyDots = document.querySelectorAll('.scrollspy__dot');
if (scrollspyDots.length) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const dot = document.querySelector(`.scrollspy__dot[data-target="${entry.target.id}"]`);
      if (!dot) return;
      scrollspyDots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
    });
  }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });

  scrollspyDots.forEach(dot => {
    const target = document.getElementById(dot.dataset.target);
    if (target) observer.observe(target);
  });
}

const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    const status = document.getElementById('contact-form-status');
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      const res = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        status.textContent = '¡Gracias! Tu mensaje fue enviado.';
        status.classList.add('ok');
        contactForm.reset();
        alert('¡Tu propuesta fue enviada correctamente! Presioná Aceptar para volver al inicio.');
        location.href = 'index.html';
      } else {
        status.textContent = 'Hubo un error, intentá de nuevo.';
        status.classList.remove('ok');
      }
    } catch {
      status.textContent = 'Hubo un error, intentá de nuevo.';
      status.classList.remove('ok');
    }
    btn.disabled = false;
  });
}

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

        imgsContainer.addEventListener('click', () => goTo(current + 1));

        setInterval(() => goTo(current + 1), interval);
      }
    }

    // Paleta de colores
    const paleta = cfg.paletas?.[cfg.paleta];
    if (paleta) {
      const root = document.documentElement.style;
      Object.entries(paleta).forEach(([k, v]) => root.setProperty(`--${k}`, v));
    }

    const pageTitle = document.getElementById('page-title');
    if (pageTitle) pageTitle.textContent = cfg.nombre;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = cfg.descripcion ?? '';

    const navLogo = document.getElementById('nav-logo');
    if (navLogo && cfg.logo) { navLogo.src = cfg.logo; navLogo.alt = cfg.nombre; }
    else if (navLogo) navLogo.style.display = 'none';

    set('nav-nombre',   cfg.nombre);
    set('hero-nombre',  cfg.nombre);
    set('hero-slogan',  cfg.slogan);
    set('hero-desc',    cfg.descripcion ?? '');

    href('nav-cta', cfg.appUrl);

    const igUrl = url => url?.startsWith('http') ? url : `https://instagram.com/${url}`;

    // Servicios
    const grid = document.getElementById('grid-servicios');
    if (grid && cfg.servicios) {
      grid.innerHTML = cfg.servicios.map(s => {
        const tag = s.enlace ? 'a' : 'div';
        const hrefAttr = s.enlace ? `href="${cfg[s.enlace] ?? '#'}"` : '';
        const cta = s.enlace ? `<span class="servicio-card__cta">${s.ctaTexto ?? 'Ver más'} →</span>` : '';
        return `
        <${tag} class="servicio-card" ${hrefAttr}>
          <div class="servicio-card__icono">
            <img src="${s.icono}" alt="${s.nombre}" />
          </div>
          <h3 class="servicio-card__nombre">${s.nombre}</h3>
          <p class="servicio-card__desc">${s.descripcion}</p>
          ${cta}
        </${tag}>`;
      }).join('');
    }

    // Footer: sitemap de servicios
    const footerServicios = document.getElementById('footer-servicios');
    if (footerServicios && cfg.servicios) {
      footerServicios.innerHTML = cfg.servicios.map(s => {
        const dest = s.enlace ? (cfg[s.enlace] ?? '#servicios') : '#servicios';
        return `<a href="${dest}">${s.nombre}</a>`;
      }).join('');
    }

    // Autores
    const gridAutores = document.getElementById('grid-autores');
    if (gridAutores && cfg.autores) {
      gridAutores.innerHTML = cfg.autores.map(a => `
        <div class="autor-card">
          <div class="autor-card__foto">
            <img src="${a.foto}" alt="${a.nombre}" />
          </div>
          <div class="autor-card__overlay">
            <h3 class="autor-card__nombre">${a.nombre}</h3>
            <div class="autor-card__desc-wrap">
              <p class="autor-card__desc">${a.descripcion}</p>
            </div>
          </div>
        </div>`).join('');

      gridAutores.querySelectorAll('.autor-card').forEach(card => {
        card.addEventListener('click', () => card.classList.toggle('is-expanded'));
      });
    }

    // Horarios
    const hl = document.getElementById('footer-horarios');
    if (hl && cfg.horarios) {
      hl.innerHTML = cfg.horarios.map(h => `
        <li>
          <span class="dias">${h.dias}</span>
          <span class="hora">${h.horario}</span>
        </li>`).join('');
    }

    // Footer: acciones rápidas + redes
    if (cfg.contacto) {
      const c = cfg.contacto;
      if (c.telefono) href('footer-telefono', `tel:${c.telefono.replace(/\s/g,'')}`);
      if (c.whatsapp) {
        const waLink = `https://wa.me/${c.whatsapp}?text=${encodeURIComponent('Hola Guarida! Tengo una consulta')}`;
        href('footer-whatsapp',  waLink);
        href('footer-whatsapp2', waLink);
        const waBtn = document.getElementById('whatsapp-btn');
        if (waBtn) waBtn.href = waLink;
      }
      if (c.instagram) href('footer-ig', igUrl(c.instagram));
      if (c.direccion) {
        const mapHref = c.mapsUrl ?? `https://maps.google.com/?q=${encodeURIComponent(c.direccion)}`;
        href('footer-ubicacion', mapHref);
      }
    }
  })
  .catch(err => console.error('Error cargando config.json:', err));
