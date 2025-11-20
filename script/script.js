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

 class CardsCarousel {
            constructor() {
                this.list = document.getElementById('cardsCarouselList');
                        this.applyLeftSpace = () => {
            this.list.style.marginLeft = window.innerWidth > 767 ? '13px' : '-10px';
        };

        // apply now and keep in sync on resize
        this.applyLeftSpace();
                this.items = this.list.querySelectorAll('.card');
                this.pagerContainer = document.getElementById('cardsPagerContainer');
                this.prevBtn = document.getElementById('cardsPrevBtn');
                this.nextBtn = document.getElementById('cardsNextBtn');
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
                if (window.innerWidth >= 1025) return 4;
                if (window.innerWidth >= 768) return 2;
                return 1;
            }

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

            updateCarousel() {
                const offset = -this.currentIndex * (100 / this.itemsPerView);
                this.list.style.transform = `translateX(${offset}%)`;
                this.updatePagerDots();
            }

            updatePagerDots() {
                const dots = this.pagerContainer.querySelectorAll('.cards__dot');
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
            new CardsCarousel();
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
        const offset = -this.currentIndex * (100 / this.itemsPerView);
        this.list.style.transform = `translateX(calc(${offset}% - 20px))`;
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
                const offset = -this.currentIndex * (100 / this.itemsPerView);
                this.list.style.transform = `translateX(calc(${offset}% - 20px))`;
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