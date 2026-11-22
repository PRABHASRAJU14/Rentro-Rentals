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
    this.setupUnifiedScroll();
    this.setupActiveNavIndicator();
    this.setupMobileDrawerBackdrop();

    if (this.isReducedMotion) {
      document.querySelectorAll('.rentro-reveal').forEach(el => el.classList.add('is-revealed'));
      return;
    }

    this.setupScrollObserver();
    this.scanAndReveal();
    this.setupMutationObserver();
    this.setupSmoothScroll();
  },

  // 1. Core Scroll Reveal Observer (Triggers as user scrolls down into view)
  setupScrollObserver() {
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers without IntersectionObserver
      document.querySelectorAll('.rentro-reveal').forEach(el => el.classList.add('is-revealed'));
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -25px 0px',
      threshold: 0.05
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

  // 2. Scan and Tag Elements with Reveal & Cascading Stagger Delays
  scanAndReveal(root = document) {
    if (this.isReducedMotion) {
      root.querySelectorAll('.rentro-reveal').forEach(el => el.classList.add('is-revealed'));
      return;
    }
    if (!this.observer) return;

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
            const staggerDelay = Math.min(index * 80, 500); // 80ms cascading stagger delay per card
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

  // 4. Unified RAF-Throttled Scroll Controller (Progress Bar + Navbar Shadow + Parallax)
  // Consolidates all scroll event handling into 1 single passive listener to eliminate all lag
  setupUnifiedScroll() {
    // Hairline Top Scroll Progress Bar creation
    if (!document.getElementById('rentroScrollProgressBar')) {
      const bar = document.createElement('div');
      bar.className = 'rentro-scroll-progress';
      bar.id = 'rentroScrollProgressBar';
      document.body.prepend(bar);
      this.progressBar = bar;
    } else {
      this.progressBar = document.getElementById('rentroScrollProgressBar');
    }

    const navbar = document.querySelector('.rentro-navbar');
    const heroBg = document.querySelector('.hero-bg-image');
    let isTicking = false;

    const onScrollUpdate = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;

      // A. Navbar subtle sticky blur & shadow transition
      if (navbar) {
        if (scrollY > 16) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }

      // B. Top hairline scroll progress bar
      if (this.progressBar) {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
        this.progressBar.style.width = `${progress}%`;
      }

      // C. Hardware-accelerated Parallax (only for hero while visible)
      if (heroBg && !this.isReducedMotion && scrollY <= 750) {
        const yOffset = Math.min(scrollY * 0.15, 40);
        heroBg.style.transform = `translate3d(0, ${yOffset}px, 0)`;
      }

      isTicking = false;
    };

    window.addEventListener('scroll', () => {
      if (!isTicking) {
        window.requestAnimationFrame(onScrollUpdate);
        isTicking = true;
      }
    }, { passive: true });

    // Initial check on load
    onScrollUpdate();
  },

  // 5. Active Navigation Page Indicator
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

  // 6. Mobile Drawer Backdrop & Smooth Dismissal
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

  // 7. Fluid In-Page Anchor Smooth Scrolling with Header Offset
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

  // 8. Polished Page Entrance
  setupPageEntrance() {
    document.body.classList.add('rentro-page-ready');
  },

  // 9. Helper to render clean shimmer skeleton placeholders
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

  // 10. Helper to render helpful empty states
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
