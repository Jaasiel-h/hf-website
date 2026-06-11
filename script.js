document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('siteHeader');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header state on scroll ---------- */
  const updateHeader = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* ---------- Mobile navigation ---------- */
  if (navToggle && navMenu) {
    const closeMenu = () => {
      navMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    };

    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  /* ---------- Smooth scrolling with header offset ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      const headerHeight = header?.offsetHeight ?? 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Scroll reveal ---------- */
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Animated stat counters ---------- */
  const counters = document.querySelectorAll('.counter');
  const formatCounter = (el, value) => {
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    el.textContent = `${prefix}${Math.round(value)}${suffix}`;
  };

  const animateCounter = el => {
    const target = Number(el.dataset.target || 0);
    if (prefersReducedMotion) {
      formatCounter(el, target);
      return;
    }
    const duration = 1600;
    const start = performance.now();
    const tick = now => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      formatCounter(el, target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(el => counterObserver.observe(el));
  } else {
    counters.forEach(el => formatCounter(el, Number(el.dataset.target || 0)));
  }

  /* ---------- Investment calculator ---------- */
  const amountInput = document.getElementById('calcAmount');
  const amountOut  = document.getElementById('calcAmountOut');
  const rateInput  = document.getElementById('calcRate');
  const rateOut    = document.getElementById('calcRateOut');
  const termButtons = document.querySelectorAll('.term-btn');
  const resMonthly = document.getElementById('resMonthly');
  const resTotal   = document.getElementById('resTotal');
  const resFinal   = document.getElementById('resFinal');

  if (amountInput && amountOut && rateInput && rateOut && resMonthly && resTotal && resFinal) {
    let months = 24;

    const mxn = value =>
      new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        maximumFractionDigits: 0,
      }).format(value);

    const updateSliderFill = (input) => {
      const min   = Number(input.min);
      const max   = Number(input.max);
      const value = Number(input.value);
      const fill  = ((value - min) / (max - min)) * 100;
      input.style.setProperty('--fill', `${fill}%`);
    };

    const recalc = () => {
      const principal  = Number(amountInput.value);
      const annualRate = Number(rateInput.value) / 100;
      const monthlyInterest = (principal * annualRate) / 12;
      const totalInterest   = monthlyInterest * months;

      amountOut.textContent = `${mxn(principal)} MXN`;
      rateOut.textContent   = `${Number(rateInput.value).toFixed(1).replace('.0', '')}%`;
      resMonthly.textContent = mxn(monthlyInterest);
      resTotal.textContent   = mxn(totalInterest);
      resFinal.textContent   = mxn(principal + totalInterest);
      updateSliderFill(amountInput);
      updateSliderFill(rateInput);
    };

    amountInput.addEventListener('input', recalc);
    rateInput.addEventListener('input', recalc);

    termButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        termButtons.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        months = Number(btn.dataset.months);
        recalc();
      });
    });

    recalc();
  }

  /* ---------- Case study tabs ---------- */
  const tabs = document.querySelectorAll('.cases__tab');
  const panels = document.querySelectorAll('.cases__panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      panels.forEach(p => {
        p.classList.remove('is-active');
        p.hidden = true;
      });

      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (panel) {
        panel.hidden = false;
        panel.classList.add('is-active');
      }
    });
  });

  /* ---------- Investors journey progress ---------- */
  const investorsSection = document.getElementById('investors');
  if (investorsSection) {
    const progressBar = investorsSection.querySelector('.journey__progress');
    const steps = Array.from(investorsSection.querySelectorAll('.journey__step'));
    const journey = investorsSection.querySelector('.investors__journey');

    const updateJourneyProgress = () => {
      if (!progressBar || !journey) return;
      const rect = journey.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const distance = viewportHeight - rect.top;
      const total = rect.height + viewportHeight * 0.4;
      const ratio = Math.min(Math.max(distance / total, 0), 1);
      progressBar.style.height = `${ratio * 100}%`;
    };

    if ('IntersectionObserver' in window) {
      const journeyObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          entry.target.classList.toggle('is-active', entry.isIntersecting);
        });
      }, { threshold: 0.55, rootMargin: '-10% 0px -10% 0px' });
      steps.forEach(step => journeyObserver.observe(step));
    }

    updateJourneyProgress();
    window.addEventListener('scroll', updateJourneyProgress, { passive: true });
    window.addEventListener('resize', updateJourneyProgress);
  }

  /* ---------- Contact form ---------- */
  const contactForm = document.getElementById('contactForm');
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

      window.location.href = `mailto:contacto@hfasesores.com?subject=${encodeURIComponent(subject)}&body=${body}`;
      alert('Gracias por contactarnos. Un especialista se pondrá en contacto contigo pronto.');
      contactForm.reset();
    });
  }
});
