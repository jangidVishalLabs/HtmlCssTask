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

// ============================================
// CAROUSEL SCRIPT FOR CARDS, TESTIMONIALS, AND PARTNERS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // 1. CARDS CAROUSEL
    // ============================================
    const cardsViewport = document.querySelector('.cards__viewport');
    const cardsList = document.querySelector('.cards__list');
    const cardItems = document.querySelectorAll('.card');
    const cardsPrevBtn = document.querySelector('.cards__control--prev');
    const cardsNextBtn = document.querySelector('.cards__control--next');
    const cardsDots = document.querySelectorAll('.cards__dot');
    
    let cardsCurrentIndex = 0;
    let cardsAutoplayInterval;
    const cardsAutoplayDelay = 4000;
    
    function getCardsPerView() {
        const width = window.innerWidth;
        if (width < 768) return 1;
        if (width < 1025) return 1;
        return 4;
    }
    
    function updateCardsCarousel() {
        const cardsPerView = getCardsPerView();
        const cardWidth = cardItems[0].offsetWidth;
        const gap = 16;
        const offset = -(cardsCurrentIndex * (cardWidth + gap));
        
        cardsList.style.transform = `translateX(${offset}px)`;
        
        // Update dots
        cardsDots.forEach((dot, index) => {
            dot.classList.toggle('is-active', index === cardsCurrentIndex);
        });
    }
    
    function cardsNext() {
        const cardsPerView = getCardsPerView();
        const maxIndex = Math.ceil(cardItems.length / cardsPerView) - 1;
        
        cardsCurrentIndex = (cardsCurrentIndex + 1) > maxIndex ? 0 : cardsCurrentIndex + 1;
        updateCardsCarousel();
    }
    
    function cardsPrev() {
        const cardsPerView = getCardsPerView();
        const maxIndex = Math.ceil(cardItems.length / cardsPerView) - 1;
        
        cardsCurrentIndex = (cardsCurrentIndex - 1) < 0 ? maxIndex : cardsCurrentIndex - 1;
        updateCardsCarousel();
    }
    
    function startCardsAutoplay() {
        cardsAutoplayInterval = setInterval(cardsNext, cardsAutoplayDelay);
    }
    
    function stopCardsAutoplay() {
        clearInterval(cardsAutoplayInterval);
    }
    
    // Event listeners for Cards
    if (cardsNextBtn) {
        cardsNextBtn.addEventListener('click', () => {
            cardsNext();
            stopCardsAutoplay();
            startCardsAutoplay();
        });
    }
    
    if (cardsPrevBtn) {
        cardsPrevBtn.addEventListener('click', () => {
            cardsPrev();
            stopCardsAutoplay();
            startCardsAutoplay();
        });
    }
    
    cardsDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            cardsCurrentIndex = index;
            updateCardsCarousel();
            stopCardsAutoplay();
            startCardsAutoplay();
        });
    });
    
    // Pause on hover for Cards
    if (cardsViewport) {
        cardsViewport.addEventListener('mouseenter', stopCardsAutoplay);
        cardsViewport.addEventListener('mouseleave', startCardsAutoplay);
    }
    
    // Initialize Cards carousel
    updateCardsCarousel();
    startCardsAutoplay();
    
    // ============================================
    // 2. TESTIMONIALS CAROUSEL
    // ============================================
const testimonialsTrack = document.querySelector('.testimonials__track');
const testimonialsList = document.querySelector('.testimonials__list');
const testimonialItems = document.querySelectorAll('.testimonial');
const testimonialsPrevBtn = document.querySelector('.testimonials__control--prev');
const testimonialsNextBtn = document.querySelector('.testimonials__control--next');
const testimonialsDots = document.querySelectorAll('.testimonials__pager .dot');

let testimonialsCurrentIndex = 0;
let testimonialsAutoplayInterval;
const testimonialsAutoplayDelay = 5000;

// -------- NEW FUNCTION (IMPORTANT) --------
function getSlideWidth() {
    return testimonialsTrack.offsetWidth;   // full visible width
}

function getTestimonialsPerView() {
    const width = window.innerWidth;
    if (width < 768) return 1;
    if (width < 1025) return 2; // better UX for tablets
    return 3;
}

function updateTestimonialsCarousel() {
    const slideWidth = getSlideWidth();
    const offset = -(testimonialsCurrentIndex * slideWidth);

    testimonialsList.style.transform = `translateX(${offset}px)`;

    testimonialsDots.forEach((dot, index) => {
        dot.classList.toggle('is-active', index === testimonialsCurrentIndex);
    });
}

function testimonialsNext() {
    const testimonialsPerView = getTestimonialsPerView();
    const maxIndex = Math.ceil(testimonialItems.length / testimonialsPerView) - 1;

    testimonialsCurrentIndex++;
    if (testimonialsCurrentIndex > maxIndex) testimonialsCurrentIndex = 0;

    updateTestimonialsCarousel();
}

function testimonialsPrev() {
    const testimonialsPerView = getTestimonialsPerView();
    const maxIndex = Math.ceil(testimonialItems.length / testimonialsPerView) - 1;

    testimonialsCurrentIndex--;
    if (testimonialsCurrentIndex < 0) testimonialsCurrentIndex = maxIndex;

    updateTestimonialsCarousel();
}

function startTestimonialsAutoplay() {
    testimonialsAutoplayInterval = setInterval(testimonialsNext, testimonialsAutoplayDelay);
}

function stopTestimonialsAutoplay() {
    clearInterval(testimonialsAutoplayInterval);
}


// Controls
testimonialsNextBtn?.addEventListener("click", () => {
    testimonialsNext();
    stopTestimonialsAutoplay();
    startTestimonialsAutoplay();
});

testimonialsPrevBtn?.addEventListener("click", () => {
    testimonialsPrev();
    stopTestimonialsAutoplay();
    startTestimonialsAutoplay();
});

// Dots
testimonialsDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
        testimonialsCurrentIndex = index;
        updateTestimonialsCarousel();
        stopTestimonialsAutoplay();
        startTestimonialsAutoplay();
    });
});

// Pause on hover (desktop only)
testimonialsTrack?.addEventListener("mouseenter", stopTestimonialsAutoplay);
testimonialsTrack?.addEventListener("mouseleave", startTestimonialsAutoplay);

// Recalculate on window resize (IMPORTANT FIX)
window.addEventListener("resize", updateTestimonialsCarousel);

// Init
updateTestimonialsCarousel();
startTestimonialsAutoplay();

    // ============================================
    // 3. PARTNERS CAROUSEL
    // ============================================
    const partnersList = document.querySelector('.partners-block__list');
    const partnerItems = document.querySelectorAll('.partners-block__item');
    const partnersPrevBtn = document.querySelector('.partners-prev');
    const partnersNextBtn = document.querySelector('.partners-next');
    const partnersPager = document.querySelector('.partners-block__pager');
    
    let partnersCurrentIndex = 0;
    let partnersAutoplayInterval;
    const partnersAutoplayDelay = 3500;
    
    function getPartnersPerView() {
        const width = window.innerWidth;
        if (width < 768) return 1;
        if (width < 1024) return 3;
        return 5;
    }
    
    function createPartnersDots() {
        if (!partnersPager) return;
        partnersPager.innerHTML = '';
        
        const partnersPerView = getPartnersPerView();
        const totalDots = Math.ceil(partnerItems.length / partnersPerView);
        
        for (let i = 0; i < totalDots; i++) {
            const dot = document.createElement('span');
            dot.classList.add('partners-block__dot');
            if (i === 0) dot.classList.add('is-active');
            dot.addEventListener('click', () => {
                partnersCurrentIndex = i;
                updatePartnersCarousel();
                stopPartnersAutoplay();
                startPartnersAutoplay();
            });
            partnersPager.appendChild(dot);
        }
    }
    
    function updatePartnersCarousel() {
        const partnersPerView = getPartnersPerView();
        const partnerWidth = partnerItems[0].offsetWidth;
        const gap = 16;
        const offset = -(partnersCurrentIndex * partnersPerView * (partnerWidth + gap));
        
        partnersList.style.transform = `translateX(${offset}px)`;
        
        // Update dots
        const dots = document.querySelectorAll('.partners-block__dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('is-active', index === partnersCurrentIndex);
        });
    }
    
    function partnersNext() {
        const partnersPerView = getPartnersPerView();
        const maxIndex = Math.ceil(partnerItems.length / partnersPerView) - 1;
        
        partnersCurrentIndex = (partnersCurrentIndex + 1) > maxIndex ? 0 : partnersCurrentIndex + 1;
        updatePartnersCarousel();
    }
    
    function partnersPrev() {
        const partnersPerView = getPartnersPerView();
        const maxIndex = Math.ceil(partnerItems.length / partnersPerView) - 1;
        
        partnersCurrentIndex = (partnersCurrentIndex - 1) < 0 ? maxIndex : partnersCurrentIndex - 1;
        updatePartnersCarousel();
    }
    
    function startPartnersAutoplay() {
        partnersAutoplayInterval = setInterval(partnersNext, partnersAutoplayDelay);
    }
    
    function stopPartnersAutoplay() {
        clearInterval(partnersAutoplayInterval);
    }
    
    // Event listeners for Partners
    if (partnersNextBtn) {
        partnersNextBtn.addEventListener('click', () => {
            partnersNext();
            stopPartnersAutoplay();
            startPartnersAutoplay();
        });
    }
    
    if (partnersPrevBtn) {
        partnersPrevBtn.addEventListener('click', () => {
            partnersPrev();
            stopPartnersAutoplay();
            startPartnersAutoplay();
        });
    }
    
    // Pause on hover for Partners
    if (partnersList) {
        partnersList.addEventListener('mouseenter', stopPartnersAutoplay);
        partnersList.addEventListener('mouseleave', startPartnersAutoplay);
    }
    
    // Initialize Partners carousel
    createPartnersDots();
    updatePartnersCarousel();
    startPartnersAutoplay();
    
    // ============================================
    // WINDOW RESIZE HANDLER
    // ============================================
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Reset indices on resize
            cardsCurrentIndex = 0;
            testimonialsCurrentIndex = 0;
            partnersCurrentIndex = 0;
            
            // Update all carousels
            updateCardsCarousel();
            updateTestimonialsCarousel();
            createPartnersDots();
            updatePartnersCarousel();
        }, 250);
    });
});