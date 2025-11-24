/*
  script/script.js
  -----------------
  Lightweight UI helpers for the page:
  - Location dropdown (fetches a states JSON and renders a searchable list)
  - Mobile-friendly nav toggle (small dependency-free implementation)
  - CardsCarousel, Carousel, PartnersCarousel: small, responsive carousels

  The code is intentionally dependency-free and aims to be readable for
  teammates who need to maintain or adapt the behavior.
*/

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


// -----------------------------------------------------------------------------
// Navigation toggle (small, dependency-free)
// Purpose: toggle a compact mobile menu and keep ARIA attributes in sync.
// -----------------------------------------------------------------------------
(function () {
  const header = document.querySelector(".nav-header");
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("nav-menu");

  // If any required element is missing, exit early (defensive check).
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

  // Toggle open/close when the hamburger is clicked.
  toggle.addEventListener("click", function () {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    if (expanded) closeMenu();
    else openMenu();
  });

  // Accessibility: close the menu on ESC key.
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  // Close when clicking outside the header area.
  document.addEventListener("click", function (e) {
    if (!header.contains(e.target)) closeMenu();
  });

  // When the user navigates using an internal link/button, close the menu.
  menu.addEventListener("click", function (e) {
    const target = e.target.closest("a,button");
    if (target) closeMenu();
  });
})();


// -----------------------------------------------------------------------------
// CardsCarousel - small responsive carousel used for the "cards" section.
// Notes:
// - Uses pixel-based translation on very small screens to avoid percent/flex quirks.
// - Uses percent-based translation on larger screens for responsive behavior.
// - Autoplays and exposes prev/next/pager interactions.
// -----------------------------------------------------------------------------
class CardsCarousel {
    constructor() {
        // DOM references (IDs are expected to exist in the page markup)
        this.list = document.getElementById('cardsCarouselList');
        this.items = this.list.querySelectorAll('.card');
        this.pagerContainer = document.getElementById('cardsPagerContainer');
        this.prevBtn = document.getElementById('cardsPrevBtn');
        this.nextBtn = document.getElementById('cardsNextBtn');

        // State
        this.currentIndex = 0;
        this.itemsPerView = this.getItemsPerView();
        this.autoplayInterval = null;
        this.autoplayDelay = 5000; // 5 seconds

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

    // Build clickable pager dots (one per page)
    createPagerDots() {
        this.pagerContainer.innerHTML = '';
        const totalPages = Math.ceil(this.items.length / this.itemsPerView);
        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement('button');
            dot.className = `cards__dot ${i === 0 ? 'is-active' : ''}`;
            dot.addEventListener('click', () => this.goToPage(i));
            this.pagerContainer.appendChild(dot);
        }
    }

    // Render the carousel position. Uses pixels for mobile (more reliable with variable gaps)
    // and percent for larger widths so items resize with the layout.
    updateCarousel() {
        const isSmall = window.innerWidth < 767;
        if (this.items.length === 0) return;

        if (isSmall) {
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

            const step = cardWidth + gap;
            const offsetPx = -this.currentIndex * step;
            this.list.style.transform = `translateX(${offsetPx}px)`;
        } else {
            // Percent-based transform keeps things responsive on wider screens
            const offset = -this.currentIndex * (100 / this.itemsPerView);
            this.list.style.transform = `translateX(calc(${offset}% - 20px))`;
        }

        this.updatePagerDots();
    }

    // Update pager dots' active state
    updatePagerDots() {
        const dots = this.pagerContainer.querySelectorAll('.cards__dot');
        const activePage = Math.floor(this.currentIndex / this.itemsPerView);
        dots.forEach((dot, idx) => {
            dot.classList.toggle('is-active', idx === activePage);
        });
    }

    // Move forward one step (wraps to start)
    next() {
        const maxIndex = this.items.length - this.itemsPerView;
        this.currentIndex = this.currentIndex < maxIndex ? this.currentIndex + 1 : 0;
        this.updateCarousel();
        this.resetAutoplay();
    }

    // Move backward one step (wraps to end)
    prev() {
        const maxIndex = this.items.length - this.itemsPerView;
        this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : maxIndex;
        this.updateCarousel();
        this.resetAutoplay();
    }

    // Jump to a specific page index
    goToPage(pageIndex) {
        this.currentIndex = pageIndex * this.itemsPerView;
        this.updateCarousel();
        this.resetAutoplay();
    }

    // Autoplay helpers
    startAutoplay() {
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
        const maxIndex = this.items.length - this.itemsPerView;
        this.currentIndex = this.currentIndex < maxIndex ? this.currentIndex + 1 : 0;
        this.updateCarousel();
    }

    // Wire up the prev/next buttons
    setupEventListeners() {
        this.nextBtn.addEventListener('click', () => this.next());
        this.prevBtn.addEventListener('click', () => this.prev());
    }

    // If the number of items per view changes on resize, rebuild pager and reset position
    handleResize() {
        const newItemsPerView = this.getItemsPerView();
        if (newItemsPerView !== this.itemsPerView) {
            this.itemsPerView = newItemsPerView;
            this.currentIndex = 0;
            this.createPagerDots();
            this.updateCarousel();
        }
    }
}

// Initialize the cards carousel when DOM is ready (defensive: ensure DOM exists first)
document.addEventListener('DOMContentLoaded', () => {
    // Guard against missing DOM nodes to avoid runtime errors
    try {
        if (document.getElementById('cardsCarouselList')) new CardsCarousel();
    } catch (err) {
        console.error('CardsCarousel init failed', err);
    }
});
class Carousel {
    constructor() {
        this.list = document.getElementById('carouselList');

        // Add a 200px left space for screens wider than 767px
        this.applyLeftSpace = () => {
            this.list.style.marginLeft = window.innerWidth > 767 ? '200px' : '0px';
        };

        // apply now and keep in sync on resize
        this.applyLeftSpace();
        window.addEventListener('resize', this.applyLeftSpace);
        this.items = this.list.querySelectorAll('.testimonial');
        this.pagerContainer = document.getElementById('pagerContainer');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.currentIndex = 0;
        this.itemsPerView = this.getItemsPerView();
        this.autoplayInterval = null;
        this.autoplayDelay = 5000; // 5 seconds

        this.init();
        this.setupEventListeners();
        this.startAutoplay();
        window.addEventListener('resize', () => this.handleResize());
    }

    init() {
        this.createPagerDots();
        this.updateCarousel();
    }

    getItemsPerView() {
        if (window.innerWidth >= 1025) return 3;
        if (window.innerWidth >= 768) return 2;
        return 1;
    }

    createPagerDots() {
        this.pagerContainer.innerHTML = '';
        const totalPages = Math.ceil(this.items.length / this.itemsPerView);
        
        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement('span');
            dot.className = `dot ${i === 0 ? 'is-active' : ''}`;
            dot.addEventListener('click', () => this.goToPage(i));
            this.pagerContainer.appendChild(dot);
        }
    }

    updateCarousel() {
        if (this.items.length === 0) return;
        const isSmall = window.innerWidth < 767;

        if (isSmall) {
            // For small screens estimate item width as 150px (or actual measured width)
            const firstItem = this.items[0];
            const itemWidth = firstItem ? firstItem.getBoundingClientRect().width || 150 : 150;

            // Estimate gap between items (if any)
            let gap = 0;
            if (this.items.length > 1) {
                const r1 = this.items[0].getBoundingClientRect();
                const r2 = this.items[1].getBoundingClientRect();
                gap = Math.round(r2.left - r1.right);
                if (isNaN(gap) || gap < 0) gap = 0;
            }

            const step = itemWidth + gap;
            const offsetPx = -this.currentIndex * step;
            this.list.style.transform = `translateX(${offsetPx}px)`;
        } else {
            const offset = -this.currentIndex * (100 / this.itemsPerView);
            this.list.style.transform = `translateX(calc(${offset}% - 20px))`;
        }

        this.updatePagerDots();
    }

    updatePagerDots() {
        const dots = this.pagerContainer.querySelectorAll('.dot');
        const activePage = Math.floor(this.currentIndex / this.itemsPerView);
        
        dots.forEach((dot, idx) => {
            dot.classList.toggle('is-active', idx === activePage);
        });
    }

    next() {
        const maxIndex = this.items.length - this.itemsPerView;
        this.currentIndex = this.currentIndex < maxIndex ? this.currentIndex + 1 : 0;
        this.updateCarousel();
        this.resetAutoplay();
    }

    prev() {
        const maxIndex = this.items.length - this.itemsPerView;
        this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : maxIndex;
        this.updateCarousel();
        this.resetAutoplay();
    }

    goToPage(pageIndex) {
        this.currentIndex = pageIndex * this.itemsPerView;
        this.updateCarousel();
        this.resetAutoplay();
    }

    startAutoplay() {
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
        const maxIndex = this.items.length - this.itemsPerView;
        this.currentIndex = this.currentIndex < maxIndex ? this.currentIndex + 1 : 0;
        this.updateCarousel();
    }

    setupEventListeners() {
        this.nextBtn.addEventListener('click', () => this.next());
        this.prevBtn.addEventListener('click', () => this.prev());
    }

    handleResize() {
        const newItemsPerView = this.getItemsPerView();
        if (newItemsPerView !== this.itemsPerView) {
            this.itemsPerView = newItemsPerView;
            this.currentIndex = 0;
            this.createPagerDots();
            this.updateCarousel();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Carousel();
});


        class PartnersCarousel {
            constructor() {
                this.list = document.getElementById('partnersCarouselList');
                this.items = this.list.querySelectorAll('.partners-block__item');
                this.pagerContainer = document.getElementById('partnersPagerContainer');
                this.prevBtn = document.getElementById('partnersPrevBtn');
                this.nextBtn = document.getElementById('partnersNextBtn');
                this.currentIndex = 0;
                this.itemsPerView = this.getItemsPerView();
                this.autoplayInterval = null;
                this.autoplayDelay = 5000; // 5 seconds

                this.init();
                this.setupEventListeners();
                this.startAutoplay();
                window.addEventListener('resize', () => this.handleResize());
            }

            init() {
                this.createPagerDots();
                this.updateCarousel();
            }

            getItemsPerView() {
                if (window.innerWidth >= 1025) return 5;
                if (window.innerWidth >= 768) return 2;
                return 1;
            }

            createPagerDots() {
                this.pagerContainer.innerHTML = '';
                const totalPages = Math.ceil(this.items.length / this.itemsPerView);
                
                for (let i = 0; i < totalPages; i++) {
                    const dot = document.createElement('span');
                    dot.className = `partners-block__dot ${i === 0 ? 'is-active' : ''}`;
                    dot.addEventListener('click', () => this.goToPage(i));
                    this.pagerContainer.appendChild(dot);
                }
            }
            updateCarousel() {
                if (this.items.length === 0) return;
                const isSmall = window.innerWidth < 767;

                if (isSmall) {
                    // For small screens estimate item width as 120px (or actual measured width)
                    const firstItem = this.items[0];
                    const itemWidth = firstItem ? firstItem.getBoundingClientRect().width || 120 : 120;

                    // Estimate gap between items (if any)
                    let gap = 0;
                    if (this.items.length > 1) {
                        const r1 = this.items[0].getBoundingClientRect();
                        const r2 = this.items[1].getBoundingClientRect();
                        gap = Math.round(r2.left - r1.right);
                        if (isNaN(gap) || gap < 0) gap = 0;
                    }

                    const step = itemWidth + gap;
                    const offsetPx = -this.currentIndex * step;
                    this.list.style.transform = `translateX(${offsetPx}px)`;
                } else {
                    const offset = -this.currentIndex * (100 / this.itemsPerView);
                    this.list.style.transform = `translateX(calc(${offset}% - 20px))`;
                }

                this.updatePagerDots();
            }

            updatePagerDots() {
                const dots = this.pagerContainer.querySelectorAll('.partners-block__dot');
                const activePage = Math.floor(this.currentIndex / this.itemsPerView);
                
                dots.forEach((dot, idx) => {
                    dot.classList.toggle('is-active', idx === activePage);
                });
            }

            next() {
                const maxIndex = this.items.length - this.itemsPerView;
                this.currentIndex = this.currentIndex < maxIndex ? this.currentIndex + 1 : 0;
                this.updateCarousel();
                this.resetAutoplay();
            }

            prev() {
                const maxIndex = this.items.length - this.itemsPerView;
                this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : maxIndex;
                this.updateCarousel();
                this.resetAutoplay();
            }

            goToPage(pageIndex) {
                this.currentIndex = pageIndex * this.itemsPerView;
                this.updateCarousel();
                this.resetAutoplay();
            }

            startAutoplay() {
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
                const maxIndex = this.items.length - this.itemsPerView;
                this.currentIndex = this.currentIndex < maxIndex ? this.currentIndex + 1 : 0;
                this.updateCarousel();
            }

            setupEventListeners() {
                this.nextBtn.addEventListener('click', () => this.next());
                this.prevBtn.addEventListener('click', () => this.prev());
            }

            handleResize() {
                const newItemsPerView = this.getItemsPerView();
                if (newItemsPerView !== this.itemsPerView) {
                    this.itemsPerView = newItemsPerView;
                    this.currentIndex = 0;
                    this.createPagerDots();
                    this.updateCarousel();
                }
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            new PartnersCarousel();
        });