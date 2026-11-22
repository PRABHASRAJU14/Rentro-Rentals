/**
 * Rentro Rentals - Modern Fluid Animation & Scroll Reveal Controller
 * Smooth scrolling, IntersectionObserver reveals, cascading staggered animations, subtle parallax,
 * hairline scroll progress, sticky navbar transitions, and active navigation indicators.
 */

const RentroAnimations = {
  observer: null,
  mutationObserver: null,
  progressBar: null,
  isReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,

  init() {
    this.setupPageEntrance();
    this.setupScrollProgressBar();
    this.setupNavbarScroll();
    this.setupActiveNavIndicator();
    this.setupMobileDrawerBackdrop();

    if (this.isReducedMotion) {
      return;
    }

    this.setupScrollObserver();
    this.scanAndReveal();
    this.setupMutationObserver();
    this.setupSmoothScroll();
    this.setupParallax();

    // Universal Safety Fallback: Ensure no element is ever stuck invisible
    setTimeout(() => {
      document.querySelectorAll('.rentro-reveal:not(.is-revealed)').forEach(el => {
        el.classList.add('is-revealed');
      });
    }, 450);
  },

  // 1. Core Scroll Reveal Observer
  setupScrollObserver() {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08
    };

    this.observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, observerOptions);
  },

  // 2. Scan and Tag Elements with Reveal & Stagger Delays
  scanAndReveal(root = document) {
    if (this.isReducedMotion || !this.observer) return;

    // Single standalone elements to reveal
    const standaloneSelectors = [
      '.hero-text-content',
      '.hero-search-card',
      '.section-head',
      '.provider-cta-banner',
      '.booking-widget-card',
      '.pricing-summary-card',
      '.vehicle-detail-main',
      '.auth-card',
      '.confirm-layout',
      '.payment-box'
    ];

    standaloneSelectors.forEach(sel => {
      root.querySelectorAll(sel).forEach(el => {
        if (!el.classList.contains('rentro-reveal') && !el.classList.contains('is-revealed')) {
          el.classList.add('rentro-reveal');
          this.observer.observe(el);
        }
      });
    });

    // Grouped Containers for Cascading Stagger Animations (Cards, Items, Columns)
    const groupedContainers = [
      { container: '.trust-grid', items: '.trust-item' },
      { container: '.categories-grid', items: '.category-card' },
      { container: '.vehicles-grid', items: '.vehicle-card' },
      { container: '.city-grid', items: '.city-card' },
      { container: '.how-it-works-grid', items: '.step-card' },
      { container: '.testimonials-grid', items: '.testimonial-card' },
      { container: '.features-grid', items: '.feature-card' }
    ];

    groupedContainers.forEach(group => {
      root.querySelectorAll(group.container).forEach(cont => {
        const items = cont.querySelectorAll(group.items);
        items.forEach((item, index) => {
          if (!item.classList.contains('rentro-reveal') && !item.classList.contains('is-revealed')) {
            item.classList.add('rentro-reveal');
            const staggerDelay = Math.min(index * 90, 600); // 90ms cascading delay per item
            item.style.setProperty('--stagger-delay', `${staggerDelay}ms`);
            this.observer.observe(item);
          }
        });
      });
    });
  },

  // 3. Dynamic DOM Mutation Observer (for AJAX / dynamic storage renders)
  setupMutationObserver() {
    if (this.isReducedMotion) return;

    this.mutationObserver = new MutationObserver((mutations) => {
      let shouldScan = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          shouldScan = true;
          break;
        }
      }
      if (shouldScan) {
        this.scanAndReveal();
      }
    });

    const mainContainers = [
      document.getElementById('featuredVehiclesGrid'),
      document.getElementById('landingCityGrid'),
      document.getElementById('searchResultsGrid'),
      document.getElementById('fleetTableBody'),
      document.getElementById('bookingsTableBody'),
      document.getElementById('recentBookingsTableBody')
    ];

    mainContainers.forEach(container => {
      if (container) {
        this.mutationObserver.observe(container, { childList: true, subtree: true });
      }
    });
  },

  // 4. Hairline Top Scroll Progress Bar
  setupScrollProgressBar() {
    if (document.getElementById('rentroScrollProgressBar')) return;

    const bar = document.createElement('div');
    bar.className = 'rentro-scroll-progress';
    bar.id = 'rentroScrollProgressBar';
    document.body.prepend(bar);
    this.progressBar = bar;

    window.addEventListener('scroll', () => {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      if (this.progressBar) {
        this.progressBar.style.width = `${scrolled}%`;
      }
    }, { passive: true });
  },

  // 5. Sticky Navigation Bar Scroll Shadow & Blur Transition
  setupNavbarScroll() {
    const navbar = document.querySelector('.rentro-navbar');
    if (!navbar) return;

    const checkScroll = () => {
      if (window.pageYOffset > 18) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();
  },

  // 6. Active Navigation Page Indicator
  setupActiveNavIndicator() {
    const currentPath = window.location.pathname.toLowerCase();
    const navLinks = document.querySelectorAll('.nav-link, .drawer-link');

    navLinks.forEach(link => {
      const href = (link.getAttribute('href') || '').toLowerCase();
      if (!href) return;

      const isHome = (currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath === '') &&
                     (href.endsWith('index.html') || href === '/' || href === 'index.html');
      const isMatch = href !== 'index.html' && href !== '/' && currentPath.includes(href.replace('../', '').replace('./', ''));

      if (isHome || isMatch) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  },

  // 7. Mobile Drawer Backdrop & Smooth Dismissal
  setupMobileDrawerBackdrop() {
    let backdrop = document.getElementById('rentroDrawerBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'drawer-backdrop';
      backdrop.id = 'rentroDrawerBackdrop';
      document.body.appendChild(backdrop);
    }

    const drawer = document.getElementById('mobileDrawer');
    const toggleBtn = document.getElementById('mobileNavToggle');
    const closeBtn = document.getElementById('closeDrawerBtn');

    if (!drawer) return;

    const openDrawer = () => {
      drawer.classList.add('open');
      backdrop.classList.add('active');
    };

    const closeDrawer = () => {
      drawer.classList.remove('open');
      backdrop.classList.remove('active');
    };

    if (toggleBtn) toggleBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);

    // Escape key closes drawer
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeDrawer();
      }
    });
  },

  // 8. Fluid In-Page Anchor Smooth Scrolling with Header Offset
  setupSmoothScroll() {
    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;

      const hash = anchor.getAttribute('href');
      if (!hash || hash === '#' || hash === '') return;

      const targetElem = document.querySelector(hash);
      if (targetElem) {
        e.preventDefault();
        const navHeight = document.querySelector('.rentro-navbar')?.offsetHeight || 72;
        const targetPos = targetElem.getBoundingClientRect().top + window.pageYOffset - navHeight - 16;

        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });

        // Update URL hash without jumping
        if (history.pushState) {
          history.pushState(null, null, hash);
        }
      }
    });
  },

  // 9. Subtle Hardware-Accelerated Parallax Motion
  setupParallax() {
    if (this.isReducedMotion) return;

    const heroBg = document.querySelector('.hero-bg-image');
    if (!heroBg) return;

    let ticking = false;
    let lastScrollY = window.pageYOffset;

    window.addEventListener('scroll', () => {
      lastScrollY = window.pageYOffset;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Limit parallax to hero visibility range
          if (lastScrollY <= 800) {
            const yOffset = Math.min(lastScrollY * 0.16, 45); // Subtle 0.16 ratio
            heroBg.style.transform = `translate3d(0, ${yOffset}px, 0)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  },

  // 10. Polished Page Entrance
  setupPageEntrance() {
    document.body.classList.add('rentro-page-ready');
  },

  // 11. Helper to render clean shimmer skeleton placeholders
  renderSkeleton(container, count = 3) {
    if (!container) return;
    const cards = Array.from({ length: count }, () => `
      <div class="skeleton-card">
        <div class="skeleton-box" style="height: 140px; margin-bottom: 16px;"></div>
        <div class="skeleton-box skeleton-title"></div>
        <div class="skeleton-box skeleton-text" style="width: 80%;"></div>
        <div class="skeleton-box skeleton-text" style="width: 50%;"></div>
      </div>
    `).join('');
    container.innerHTML = cards;
  },

  // 12. Helper to render helpful empty states
  renderEmptyState(container, { icon = '🔍', title = 'No items found', message = 'There are no records to display right now.', actionText = '', actionLink = '' } = {}) {
    if (!container) return;
    container.innerHTML = `
      <div class="rentro-empty-state">
        <div class="rentro-empty-state-icon">${icon}</div>
        <h3 class="rentro-empty-state-title">${title}</h3>
        <p class="rentro-empty-state-desc">${message}</p>
        ${actionText && actionLink ? `<a href="${actionLink}" class="btn btn-primary">${actionText}</a>` : ''}
      </div>
    `;
  }
};

window.RentroAnimations = RentroAnimations;

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => RentroAnimations.init());
} else {
  RentroAnimations.init();
}
