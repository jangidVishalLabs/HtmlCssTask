// Small, dependency-free navigation toggle
(function () {
  const header = document.querySelector(".nav-header");
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("nav-menu");

  if (!toggle || !menu || !header) return;

  function openMenu() {
    header.classList.add("nav-open");
    toggle.setAttribute("aria-expanded", "true");
    menu.classList.add("is-open");
  }

  function closeMenu() {
    header.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    menu.classList.remove("is-open");
  }

  toggle.addEventListener("click", function (e) {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    if (expanded) closeMenu();
    else openMenu();
  });

  // Close on ESC
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  // Close when clicking outside the menu
  document.addEventListener("click", function (e) {
    if (!header.contains(e.target)) closeMenu();
  });

  // Close on navigation (tap) inside menu
  menu.addEventListener("click", function (e) {
    const target = e.target.closest("a,button");
    if (target) closeMenu();
  });
})();


// -----------------------------------------------------------------------------
// Location dropdown (searchable list of US states)
// -----------------------------------------------------------------------------
const apiURL = "https://gist.githubusercontent.com/mshafrir/2646763/raw/states_titlecase.json";

// DOM references used by the location dropdown
const locationBtn = document.querySelector(".location");
const dropdown = document.getElementById("dropdownMenu");
const searchInput = document.getElementById("searchInput");
const stateList = document.getElementById("stateList");
const locationText = document.querySelector(".location-text");

// Simple toggle to open/close the dropdown when the location button is clicked.
// We only toggle a CSS class; the UI (open/close) is handled in CSS.
if (locationBtn) {
    locationBtn.addEventListener("click", () => {
        dropdown.classList.toggle("open");
    });
}

// Loads a small JSON of states, renders them into the dropdown, and wires up
// a simple client-side filter so users can type to narrow the list.
async function loadStates() {
    try {
        const res = await fetch(apiURL);
        const states = await res.json();
        renderStates(states);

        // When the user types, filter the list in-memory and re-render.
        searchInput.addEventListener("input", () => {
            const q = searchInput.value.trim().toLowerCase();
            const filtered = states.filter(s => s.name.toLowerCase().includes(q));
            renderStates(filtered);
        });
    } catch (err) {
        // Fail gracefully: don't break the page if the fetch fails.
        console.error('Failed to load states JSON', err);
    }
}

// Renders an array of {name: 'State Name'} objects into the UL element.
function renderStates(states) {
    stateList.innerHTML = "";
    states.forEach(state => {
        const li = document.createElement("li");
        li.textContent = state.name;

        // Clicking an item selects it and closes the dropdown.
        li.onclick = () => {
            locationText.textContent = state.name;
            dropdown.classList.remove("open");
        };

        stateList.appendChild(li);
    });
}

// Start loading state data immediately.
loadStates();

// Close dropdown when clicking outside the `.content` area (lightweight behavior).
document.addEventListener("click", (e) => {
    if (!e.target.closest(".content")) {
        dropdown.classList.remove("open");
    }
});

class TestimonialsCarousel {
    constructor() {
        this.list = document.getElementById("carouselList");
        if (!this.list) return;

        this.wrapper = document.querySelector(".carousel-wrapper");
        this.pagerContainer = document.querySelector(".testimonials__pager");
        this.items = Array.from(this.list.querySelectorAll(".testimonial"));

        this.currentIndex = 0;
        this.autoplayDelay = 1000;
        this.itemsPerView = this.getItemsPerView();
        this.autoplayInterval = null;

        this.init();
        this.setupEventListeners();
        window.addEventListener("resize", () => this.handleResize());
    }

    getItemsPerView() {
        if (window.innerWidth >= 1025) return 4;
        if (window.innerWidth >= 768) return 2;
        return 1;
    }

    init() {
        this.createPagerDots();
        this.updateCarousel();
        this.startAutoplay();
    }

    createPagerDots() {
        this.pagerContainer.innerHTML = "";
        const totalPages = Math.ceil(this.items.length / this.itemsPerView);

        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement("span");
            dot.className = `dot ${i === 0 ? "is-active" : ""}`;
            dot.addEventListener("click", () => this.goToPage(i));
            this.pagerContainer.appendChild(dot);
        }
    }
    updateCarousel() {
      if (!this.items.length) return;

      // Reset any legacy margin hacks
      this.list.style.marginLeft = "0";

      // Compute item width + gap (supports modern gap on flex)
      const itemRect = this.items[0].getBoundingClientRect();
      const itemWidth = 320;
      const listStyle = getComputedStyle(this.list);
      const gap = parseFloat(listStyle.gap) || 0;
      const step = itemWidth + gap;

      // Clamp currentIndex so we never scroll past the last page
      const maxIndex = Math.max(0, this.items.length - this.itemsPerView);
      if (this.currentIndex > maxIndex) this.currentIndex = maxIndex;
      if (this.currentIndex < 0) this.currentIndex = 0;

      const offset = -(this.currentIndex * step);
      this.list.style.transform = `translateX(${offset}px)`;

      this.updatePagerDots();
    }

    updatePagerDots() {
      const dots = Array.from(this.pagerContainer.querySelectorAll(".dot"));
      const totalPages = Math.max(1, Math.ceil(this.items.length / this.itemsPerView));
      const activePage = Math.floor(this.currentIndex / this.itemsPerView);

      // Ensure pager length matches pages (defensive)
      dots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === activePage);
        // keep aria for accessibility
        dot.setAttribute("aria-current", i === activePage ? "true" : "false");
      });
    }

    goToPage(pageIndex) {
        this.currentIndex = pageIndex * this.itemsPerView;
        this.updateCarousel();
        this.resetAutoplay();
    }

    autoNext() {
        const maxIndex = this.items.length - this.itemsPerView;

        if (this.currentIndex >= maxIndex) {
            this.currentIndex = 0;
        } else {
            this.currentIndex++;
        }

        this.updateCarousel();
    }

    startAutoplay() {
        this.autoplayInterval = setInterval(() => this.autoNext(), this.autoplayDelay);
    }

    stopAutoplay() {
        clearInterval(this.autoplayInterval);
    }

    resetAutoplay() {
        this.stopAutoplay();
        this.startAutoplay();
    }

    setupEventListeners() {
        if (this.wrapper) {
            this.wrapper.addEventListener("mouseenter", () => this.stopAutoplay());
            this.wrapper.addEventListener("mouseleave", () => this.startAutoplay());
        }
    }

    handleResize() {
        const newView = this.getItemsPerView();
        if (newView !== this.itemsPerView) {
            this.itemsPerView = newView;
            this.currentIndex = 0;
            this.createPagerDots();
            this.updateCarousel();
        }
    }
}

window.addEventListener("load", () => {
    new TestimonialsCarousel();
});

(function () {
                const viewport = document.querySelector('.partners-carousel__viewport');
                const list = viewport.querySelector('.partners-block__list');
                const items = Array.from(list.children);
                const prevBtn = document.querySelector('.partners-carousel__btn--prev');
                const nextBtn = document.querySelector('.partners-carousel__btn--next');
                const dots = Array.from(document.querySelectorAll('.partners-block__dot'));
                let index = 0;
                let autoplayId = null;
                let startX = 0;
                let currentTranslate = 0;

                // Basic inline styles for carousel (keeps integration minimal)
                viewport.style.overflow = 'hidden';
                list.style.display = 'flex';
                list.style.margin = '0';
                list.style.padding = '0';
                list.style.listStyle = 'none';
                list.style.transition = 'transform 400ms ease';
                items.forEach(item => {
                item.style.flex = '0 0 auto';
                item.style.boxSizing = 'border-box';
                });

                function itemWidth() {
                return items[0] ? items[0].getBoundingClientRect().width : 0;
                }

                function update() {
                const w = itemWidth();
                currentTranslate = -index * w;
                list.style.transform = `translateX(${currentTranslate}px)`;
                dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
                }

                function prev() {
                index = (index - 1 + items.length) % items.length;
                update();
                resetAutoplay();
                }

                function next() {
                index = (index + 1) % items.length;
                update();
                resetAutoplay();
                }

                prevBtn.addEventListener('click', prev);
                nextBtn.addEventListener('click', next);

                dots.forEach((dot, i) => {
                dot.addEventListener('click', () => {
                    index = i;
                    update();
                    resetAutoplay();
                });
                });

                // autoplay
                function startAutoplay() {
                stopAutoplay();
                autoplayId = setInterval(() => {
                    next();
                }, 1000);
                }
                function stopAutoplay() {
                if (autoplayId) {
                    clearInterval(autoplayId);
                    autoplayId = null;
                }
                }
                function resetAutoplay() {
                stopAutoplay();
                startAutoplay();
                }

                // pause on hover/focus
                viewport.addEventListener('mouseenter', stopAutoplay);
                viewport.addEventListener('mouseleave', startAutoplay);
                prevBtn.addEventListener('focus', stopAutoplay);
                nextBtn.addEventListener('focus', stopAutoplay);
                prevBtn.addEventListener('blur', startAutoplay);
                nextBtn.addEventListener('blur', startAutoplay);

                // touch swipe support
                viewport.addEventListener('touchstart', (e) => {
                stopAutoplay();
                startX = e.touches[0].clientX;
                }, {passive: true});

                viewport.addEventListener('touchmove', (e) => {
                const dx = e.touches[0].clientX - startX;
                list.style.transition = 'none';
                list.style.transform = `translateX(${currentTranslate + dx}px)`;
                }, {passive: true});

                viewport.addEventListener('touchend', (e) => {
                list.style.transition = 'transform 400ms ease';
                const dx = e.changedTouches[0].clientX - startX;
                const threshold = Math.min(40, itemWidth() / 4);
                if (dx > threshold) prev();
                else if (dx < -threshold) next();
                else update();
                resetAutoplay();
                });

                // keyboard navigation
                viewport.tabIndex = 0;
                viewport.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') prev();
                if (e.key === 'ArrowRight') next();
                });

                // responsive: recalc on resize
                let resizeTimer;
                window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => update(), 120);
                });

                // init
                update();
                startAutoplay();
            })();



class CardsCarousel {
    constructor() {
        // DOM references (IDs are expected to exist in the page markup)
        this.list = document.getElementById('cardsCarouselList');
        this.items = this.list ? this.list.querySelectorAll('.card') : [];
        this.pagerContainer = document.getElementById('cardsPagerContainer');
        this.prevBtn = document.getElementById('cardsPrevBtn');
        this.nextBtn = document.getElementById('cardsNextBtn');

        // State
        this.currentIndex = 0; // this counts cards (0..n-1)
        this.itemsPerView = this.getItemsPerView();
        this.autoplayInterval = null;
        this.autoplayDelay = 5000; // 5 seconds

        // Defensive: bail if required nodes missing
        if (!this.list || !this.pagerContainer) return;

        // Initialize behavior
        this.init();
        this.setupEventListeners();
        this.startAutoplay();
        window.addEventListener('resize', () => this.handleResize());
    }

    // Setup the initial DOM-pager and render first frame
    init() {
        this.createPagerDots();
        this.updateCarousel();
    }

    // Determine how many items should be visible depending on viewport width
    getItemsPerView() {
        if (window.innerWidth >= 1025) return 4;
        if (window.innerWidth >= 768) return 2;
        return 1;
    }

// Build dots for only the remaining cards
createPagerDots() {
    this.pagerContainer.innerHTML = '';

    const totalCards = this.items.length;
    const extraSlides = totalCards - this.itemsPerView;

    // If no extra slides, no dots
    if (extraSlides <= 0) return;

    // Create one dot per extra slide
    for (let i = 0; i < extraSlides+1; i++) {
        const dot = document.createElement('button');
        dot.className = `cards__dot ${i === 0 ? 'is-active' : ''}`;
        
        // dot represents starting index = i + 1 (except desktop adds bigger jumps)
        dot.addEventListener('click', () => this.goToDot(i));
        
        this.pagerContainer.appendChild(dot);
    }
}


    // Ensure currentIndex is within valid bounds
    clampIndex(index) {
        const maxIndex = Math.max(0, this.items.length - this.itemsPerView);
        if (index < 0) return 0;
        if (index > maxIndex) return maxIndex;
        return index;
    }

    // Render the carousel position. Uses pixels for mobile (more reliable with variable gaps)
    // and percent for larger widths so items resize with the layout.
    updateCarousel() {
        if (this.items.length === 0) return;

        // Clamp currentIndex so we don't show empty space at the end
        this.currentIndex = this.clampIndex(this.currentIndex);

        const isSmall = window.innerWidth < 767;

        if (isSmall) {
            // Pixel-based step per card (good for variable card widths / gaps)
            const firstCard = this.items[0];
            const cardWidth = firstCard ? firstCard.getBoundingClientRect().width || 150 : 150;

            // Estimate gap between cards (if present)
            let gap = 0;
            if (this.items.length > 1) {
                const r1 = this.items[0].getBoundingClientRect();
                const r2 = this.items[1].getBoundingClientRect();
                gap = Math.round(r2.left - r1.right);
                if (isNaN(gap) || gap < 0) gap = 0;
            }

            // step per card = card width + gap
            const step = cardWidth + gap;
            const offsetPx = -this.currentIndex * step - 20;
            this.list.style.transform = `translateX(${offsetPx}px)`;
        } else {
            // Percent-based transform: each visible card occupies (100 / itemsPerView)%
            const cardPercent = 100 / this.itemsPerView;
            const offsetPercent = -this.currentIndex * cardPercent;
            // translate by percent (no extra pixels)
            this.list.style.transform = `translateX(${offsetPercent}%)`;
        }

        this.updatePagerDots();
    }

    // Update pager dots' active state (one dot per card)
    updatePagerDots() {
        const dots = this.pagerContainer.querySelectorAll('.cards__dot');
        dots.forEach((dot, idx) => {
            dot.classList.toggle('is-active', idx === this.currentIndex);
        });
    }

    // Move forward one card (wraps to start if desired OR clamps to last full view)
    next() {
        const maxIndex = Math.max(0, this.items.length - this.itemsPerView);
        this.currentIndex = this.currentIndex < maxIndex ? this.currentIndex + 1 : 0;
        this.updateCarousel();
        this.resetAutoplay();
    }

    // Move backward one card (wraps to end)
    prev() {
        const maxIndex = Math.max(0, this.items.length - this.itemsPerView);
        this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : maxIndex;
        this.updateCarousel();
        this.resetAutoplay();
    }

    // Jump to a specific card index (used by dot buttons)
    goToCard(cardIndex) {
        this.currentIndex = this.clampIndex(cardIndex);
        this.updateCarousel();
        this.resetAutoplay();
    }

    // Autoplay helpers
    startAutoplay() {
        this.stopAutoplay();
        this.autoplayInterval = setInterval(() => {
            this.autoNext();
        }, this.autoplayDelay);
    }

    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }

    resetAutoplay() {
        this.stopAutoplay();
        this.startAutoplay();
    }

    autoNext() {
        const maxIndex = Math.max(0, this.items.length - this.itemsPerView);
        this.currentIndex = this.currentIndex < maxIndex ? this.currentIndex + 1 : 0;
        this.updateCarousel();
    }

    // Wire up the prev/next buttons (defensive checks)
    setupEventListeners() {
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.next());
        if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prev());

        // pause on mouse enter, resume on leave (nice UX)
        const viewport = document.querySelector('.cards__viewport');
        if (viewport) {
            viewport.addEventListener('mouseenter', () => this.stopAutoplay());
            viewport.addEventListener('mouseleave', () => this.startAutoplay());
        }
    }

    // If the number of items per view changes on resize, rebuild pager and reset position
    handleResize() {
        const newItemsPerView = this.getItemsPerView();
        if (newItemsPerView !== this.itemsPerView) {
            this.itemsPerView = newItemsPerView;
            // clamp current index to valid range and rebuild dots
            this.currentIndex = this.clampIndex(this.currentIndex);
            this.createPagerDots();
            this.updateCarousel();
        } else {
            // even if itemsPerView unchanged, update (layout may change)
            this.updateCarousel();
        }
    }
}

// Initialize the cards carousel when DOM is ready (defensive: ensure DOM exists first)
document.addEventListener('DOMContentLoaded', () => {
    try {
        if (document.getElementById('cardsCarouselList')) new CardsCarousel();
    } catch (err) {
        console.error('CardsCarousel init failed', err);
    }
});
