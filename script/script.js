const apiURL = "https://gist.githubusercontent.com/mshafrir/2646763/raw/states_titlecase.json";

const locationBtn = document.querySelector(".location");
const dropdown = document.getElementById("dropdownMenu");
const searchInput = document.getElementById("searchInput");
const stateList = document.getElementById("stateList");
const locationText = document.querySelector(".location-text");

// Toggle dropdown visibility
locationBtn.addEventListener("click", () => {
    dropdown.classList.toggle("open");
});

// Fetch US states
async function loadStates() {
    const res = await fetch(apiURL);
    const states = await res.json();
    renderStates(states);

    // Search functionality
    searchInput.addEventListener("input", () => {
        const filtered = states.filter(s =>
            s.name.toLowerCase().includes(searchInput.value.toLowerCase())
        );
        renderStates(filtered);
    });
}

function renderStates(states) {
    stateList.innerHTML = "";
    states.forEach(state => {
        const li = document.createElement("li");
        li.textContent = state.name;

        li.onclick = () => {
            locationText.textContent = state.name;
            dropdown.classList.remove("open");
        };

        stateList.appendChild(li);
    });
}

loadStates();

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
    if (!e.target.closest(".content")) {
        dropdown.classList.remove("open");
    }
});

const viewport = document.querySelector('.cards__viewport');
const list = document.querySelector('.cards__list');
const cards = document.querySelectorAll('.card');
const prev = document.querySelector('.cards__control--prev');
const next = document.querySelector('.cards__control--next');
const dots = document.querySelectorAll('.cards__dot');

let index = 0;
const total = cards.length;
let cardWidth;

// Update card width after render
function updateWidth() {
    // compute current gap from CSS (falls back to 16 if not available)
    const style = window.getComputedStyle(list);
    const gapValue = style && style.gap ? parseInt(style.gap, 10) : 16;
    const gap = Number.isFinite(gapValue) ? gapValue : 16;
    cardWidth = cards[0].offsetWidth + gap; // card + gap
}
updateWidth();
window.addEventListener("resize", updateWidth);

function updateCarousel() {
    list.style.transform = `translateX(${-index * cardWidth}px)`;
    dots.forEach(d => d.classList.remove("is-active"));
    dots[index].classList.add("is-active");
}

next.addEventListener("click", () => {
    index = (index + 1) % total;
    updateCarousel();
});

prev.addEventListener("click", () => {
    index = (index - 1 + total) % total;
    updateCarousel();
});

dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
        index = i;
        updateCarousel();
    });
});

// Autoplay
setInterval(() => {
    index = (index + 1) % total;
    updateCarousel();
}, 3000);

        class Carousel {
            constructor() {
                this.list = document.getElementById('carouselList');
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
                const offset = -this.currentIndex * (100 / this.itemsPerView);
                const extraShift = window.innerWidth > 768 ? '200px' : '0px';
                this.list.style.transform = `translateX(calc(${offset}% + ${extraShift}))`;
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
                const maxIndex = this.items.length  - this.itemsPerView;
                this.currentIndex = this.currentIndex < maxIndex ? this.currentIndex + 1 : 0;
                this.updateCarousel();
            }

            prev() {
                const maxIndex = this.items.length - this.itemsPerView;
                this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : maxIndex;
                this.updateCarousel();
            }

            goToPage(pageIndex) {
                this.currentIndex = pageIndex * this.itemsPerView;
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