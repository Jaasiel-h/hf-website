document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('a[href^="#"]');
  const contactForm = document.getElementById('contactForm');
  const header = document.querySelector('.header');
  const nav = document.querySelector('.nav');
  const menu = document.querySelector('.nav__menu');

  // Smooth scrolling for in-page navigation
  navLinks.forEach(link => {
    link.addEventListener('click', event => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') {
        return;
      }

      const target = document.querySelector(targetId);
      if (!target) {
        return;
      }

      event.preventDefault();
      const headerHeight = header?.offsetHeight ?? 0;
      const targetPosition = target.offsetTop - headerHeight;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    });
  });

  // Contact form handling
  if (contactForm) {
    contactForm.addEventListener('submit', event => {
      event.preventDefault();
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());

      if (!data.name || !data.email || !data.message || !data.privacy || !data.type) {
        alert('Por favor completa todos los campos requeridos.');
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(data.email)) {
        alert('Por favor ingresa un email válido.');
        return;
      }

      try {
        const submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
        submissions.push({ ...data, timestamp: new Date().toISOString() });
        localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }

      const subject = `${data.type.charAt(0).toUpperCase() + data.type.slice(1)} - ${data.name} - HF Asesores`;
      const body = [
        `NOMBRE: ${data.name}`,
        `EMAIL: ${data.email}`,
        `TELÉFONO: ${data.phone || 'No especificado'}`,
        `TIPO: ${data.type}`,
        '',
        'MENSAJE:',
        data.message,
      ].join('%0D%0A');

      window.location.href = `mailto:contacto@hfasesores.mx?subject=${encodeURIComponent(subject)}&body=${body}`;
      alert('Gracias por contactarnos. Un especialista se pondrá en contacto contigo pronto.');
      contactForm.reset();
    });
  }

  // Header hide/show on scroll
  let lastScrollPosition = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    if (currentScroll > lastScrollPosition && currentScroll > 100) {
      header.style.transform = 'translateY(-100%)';
    } else {
      header.style.transform = 'translateY(0)';
    }
    lastScrollPosition = currentScroll;
  });

  // Reveal animations for cards and panels
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -60px 0px',
  });

  document.querySelectorAll('.panel, .service__item, .solution__card, .case__card, .founder__card').forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    revealObserver.observe(element);
  });

  // Mobile navigation toggle
  const ensureMobileToggle = () => {
    const existingToggle = document.querySelector('.mobile-menu-toggle');

    if (window.innerWidth <= 768) {
      if (!existingToggle && nav) {
        const toggle = document.createElement('button');
        toggle.className = 'mobile-menu-toggle';
        toggle.type = 'button';
        toggle.setAttribute('aria-label', 'Abrir menú de navegación');
        toggle.textContent = '☰';
        nav.appendChild(toggle);

        toggle.addEventListener('click', () => {
          const isOpen = menu.style.display === 'flex';
          if (isOpen) {
            menu.style.display = 'none';
          } else {
            menu.style.display = 'flex';
            menu.style.position = 'absolute';
            menu.style.top = '100%';
            menu.style.left = '0';
            menu.style.right = '0';
            menu.style.flexDirection = 'column';
            menu.style.background = '#ffffff';
            menu.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)';
            menu.style.padding = '1rem 1.5rem';
            menu.style.gap = '1rem';
          }
        });
      }
    } else {
      existingToggle?.remove();
      menu.style.display = 'flex';
      menu.style.position = 'static';
      menu.style.flexDirection = 'row';
      menu.style.background = 'none';
      menu.style.boxShadow = 'none';
      menu.style.padding = '0';
      menu.style.gap = '1.5rem';
    }
  };

  ensureMobileToggle();
  window.addEventListener('resize', ensureMobileToggle);
});
