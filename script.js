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



class Carousel {
    constructor() {
        this.list = document.getElementById('carouselList');

        // Add a 200px left space for screens wider than 767px
        this.applyLeftSpace = () => {
            this.list.style.marginLeft = window.innerWidth > 767 ? '50px' : '0px';
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

    // Dots = each slide after the initial visible slides
    const totalDots = this.items.length - this.itemsPerView;

    for (let i = 0; i <= totalDots; i++) {
        const dot = document.createElement('span');
        dot.className = `dot ${i === 0 ? 'is-active' : ''}`;
        dot.dataset.index = i;
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
            this.list.style.transform = `translateX(calc(${offset}% - 50px))`;
        }

        this.updatePagerDots();
    }

updatePagerDots() {
    const dots = this.pagerContainer.querySelectorAll('.dot');
    dots.forEach((dot) => {
        const idx = Number(dot.dataset.index);
        dot.classList.toggle('is-active', idx === this.currentIndex);
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
    this.currentIndex = pageIndex;
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
                    this.autoplayDelay = 3000; // 3 seconds

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
                        const offsetPx = -this.currentIndex * step;
                        this.list.style.transform = `translateX(${offsetPx}px)`;
                    } else {
                        // Percent-based transform: each visible card occupies (100 / itemsPerView)%
                        
                        const firstCard = this.items[0];
                        const gap = document.defaultView.getComputedStyle(this.list).gap;
                        const cardWidth = firstCard ? firstCard.getBoundingClientRect().width || 220 : 220;
                          const step = cardWidth + parseFloat(gap);
                        const offsetPx = -this.currentIndex * step;
                        console.log(offsetPx)

                        // translate by percent (no extra pixels)
                        this.list.style.transform = `translateX(${offsetPx}px)`;
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
                    // this.resetAutoplay();
                }

                // Move backward one card (wraps to end)
                prev() {
                    const maxIndex = Math.max(0, this.items.length - this.itemsPerView);
                    this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : maxIndex;
                    this.updateCarousel();
                    // this.resetAutoplay();
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
