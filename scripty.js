 /* ==========================================================================
   SUMMIT RIDGE ROOFING — SCRIPT.JS
   Handles: nav, mobile menu, scroll effects, counters, before/after slider,
   contact form validation, privacy modal, back-to-top, reveal animations.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------- FOOTER YEAR ---------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- STICKY NAV SHADOW ---------------- */
  const navHeader = document.getElementById('navHeader');
  const backToTop = document.getElementById('backToTop');

  function onScroll(){
    const scrolled = window.scrollY > 40;
    navHeader.classList.toggle('is-scrolled', scrolled);
    backToTop.classList.toggle('is-visible', window.scrollY > 500);
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top:0, behavior:'smooth' });
  });

  /* ---------------- MOBILE MENU ---------------- */
  const burger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');

  function closeMenu(){
    burger.classList.remove('is-open');
    navLinks.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    burger.classList.toggle('is-open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  /* ---------------- SMOOTH SCROLL WITH NAV OFFSET ---------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId.length <= 1) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const offset = 96;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior:'smooth' });
    });
  });

  /* ---------------- SCROLL REVEAL ---------------- */
  const revealTargets = document.querySelectorAll(
    '.service-card, .review-card, .gallery_item, .area-block, .stat, .aboutmedia, .about_content'
  );
  revealTargets.forEach(el => el.setAttribute('data-reveal', ''));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting){
        setTimeout(() => entry.target.classList.add('is-visible'), i % 6 * 70);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold:0.15 });

  revealTargets.forEach(el => revealObserver.observe(el));

  /* ---------------- ANIMATED COUNTERS ---------------- */
  const counters = document.querySelectorAll('.stat__num');

  function animateCounter(el){
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1600;
    const start = performance.now();

    function tick(now){
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold:0.5 });

  counters.forEach(c => counterObserver.observe(c));

  /* ---------------- BEFORE / AFTER SLIDER ---------------- */
  const baSlider = document.getElementById('baSlider');
  const baBeforeWrap = document.getElementById('baBeforeWrap');
  const baHandle = document.getElementById('baHandle');

  if (baSlider){
    let dragging = false;

    function setPosition(clientX){
      const rect = baSlider.getBoundingClientRect();
      let x = clientX - rect.left;
      x = Math.max(0, Math.min(x, rect.width));
      const percent = (x / rect.width) * 100;
      baBeforeWrap.style.width = percent + '%';
      baHandle.style.left = percent + '%';
    }

    function startDrag(e){
      dragging = true;
      baSlider.classList.add('is-dragging');
    }
    function stopDrag(){ dragging = false; }
    function onMove(e){
      if (!dragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      setPosition(clientX);
    }

    baHandle.addEventListener('mousedown', startDrag);
    baHandle.addEventListener('touchstart', startDrag, { passive:true });
    baSlider.addEventListener('click', (e) => setPosition(e.clientX));

    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive:true });
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchend', stopDrag);
  }

  /* ---------------- CONTACT FORM VALIDATION ---------------- */
  const form = document.getElementById('estimateForm');
  const formSuccess = document.getElementById('formSuccess');

  const validators = {
    name: v => v.trim().length >= 2,
    phone: v => /^[\d\s()+-]{7,}$/.test(v.trim()),
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    address: v => v.trim().length >= 5,
    service: v => v.trim().length > 0
  };

  if (form){
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      let isValid = true;

      Object.keys(validators).forEach(fieldName => {
        const field = form.elements[fieldName];
        const wrapper = field.closest('.form-field');
        const valid = validators[fieldName](field.value);
        wrapper.classList.toggle('has-error', !valid);
        if (!valid) isValid = false;
      });

      if (!isValid){
        const firstError = form.querySelector('.has-error input, .has-error select');
        if (firstError) firstError.focus();
        return;
      }

      // Simulate successful submission (no backend wired up)
      form.reset();
      formSuccess.classList.add('is-visible');

      setTimeout(() => {
        formSuccess.classList.remove('is-visible');
      }, 6000);
    });

    // Clear error state as the user types/selects
    Object.keys(validators).forEach(fieldName => {
      const field = form.elements[fieldName];
      field.addEventListener('input', () => {
        field.closest('.form-field').classList.remove('has-error');
      });
      field.addEventListener('change', () => {
        field.closest('.form-field').classList.remove('has-error');
      });
    });
  }

  /* ---------------- PRIVACY MODAL ---------------- */
  const privacyModal = document.getElementById('privacyModal');
  const privacyLink = document.getElementById('privacyLink');
  const privacyClose = document.getElementById('privacyClose');
  const privacyBackdrop = document.getElementById('privacyBackdrop');

  function openModal(){
    privacyModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    privacyModal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (privacyLink){
    privacyLink.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    privacyClose.addEventListener('click', closeModal);
    privacyBackdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

});