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




// --------------------- TESTIMONIAL CAROUSEL ----------------------
document.addEventListener("DOMContentLoaded", () => {
  const tList = document.querySelector(".testimonials__list");
  let tSlides = document.querySelectorAll(".testimonial");
  let tDots = document.querySelectorAll(".testimonials__pager .dot");
  const tPrev = document.querySelector(".testimonials__control--prev");
  const tNext = document.querySelector(".testimonials__control--next");
  const pager = document.querySelector(".testimonials__pager");

  if (!tList) {
    console.error("Testimonials: .testimonials__list not found.");
    return;
  }

  // Helper: read gap between slides (fallback to 16)
  function getGap() {
    try {
      const styles = getComputedStyle(tList);
      const gap = parseFloat(styles.gap || styles.columnGap || "16");
      return Number.isFinite(gap) ? gap : 16;
    } catch (e) { return 16; }
  }

  // Wait for images to be ready so sizes are correct
  const images = tList.querySelectorAll("img");
  const imagesLoaded = Array.from(images).map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise(res => img.addEventListener("load", res, { once: true }));
  });

  Promise.all(imagesLoaded).then(initCarousel).catch(initCarousel);

  function initCarousel() {
    // refresh slides & dots
    tSlides = document.querySelectorAll(".testimonial");
    let tTotal = tSlides.length;

    if (tTotal === 0) {
      console.warn("Testimonials: no .testimonial items found.");
      return;
    }

    // if only one slide, disable controls & pager
    if (tTotal === 1) {
      if (tPrev) tPrev.style.display = "none";
      if (tNext) tNext.style.display = "none";
      if (pager) pager.style.display = "none";
      return;
    }

    // Remove existing clones if any (in case of hot-reload)
    tList.querySelectorAll(".clone").forEach(n => n.remove());
    // Recalc slides after cleanup
    tSlides = document.querySelectorAll(".testimonial");
    tTotal = tSlides.length;

    // Clone first + last
    const tFirstClone = tSlides[0].cloneNode(true);
    const tLastClone = tSlides[tTotal - 1].cloneNode(true);
    tFirstClone.classList.add("clone");
    tLastClone.classList.add("clone");
    tList.appendChild(tFirstClone);
    tList.insertBefore(tLastClone, tSlides[0]);

    // Refresh NodeList
    tSlides = document.querySelectorAll(".testimonial");
    // create/refresh dot elements to match real slides
    if (pager) {
      pager.innerHTML = "";
      for (let i = 0; i < tTotal; i++) {
        const span = document.createElement("span");
        span.className = "dot" + (i === 0 ? " is-active" : "");
        pager.appendChild(span);
      }
    }
    // refresh references
    const dots = document.querySelectorAll(".testimonials__pager .dot");

    // width calc
    let tWidth;
    function updateTestimonialWidth() {
      // Use the *first* slide (may be clone) width + gap
      const first = tSlides[0];
      if (!first) return;
      // getBoundingClientRect is more reliable than offsetWidth when transforms are applied
      const rect = first.getBoundingClientRect();
      const gap = getGap();
      tWidth = Math.round(rect.width + gap);
    }
    updateTestimonialWidth();
    window.addEventListener("resize", debounce(() => {
      updateTestimonialWidth();
      // reposition at current index after resize
      tList.style.transition = "none";
      tList.style.transform = `translateX(-${tIndex * tWidth}px)`;
    }, 120));

    // slider state
    let tIndex = 1; // start at first real slide (after last-clone)
    tList.style.transform = `translateX(-${tIndex * tWidth}px)`;

    let isTransitioning = false;
    function moveTestimonials(animate = true) {
      if (animate) tList.style.transition = "transform 0.45s ease";
      else tList.style.transition = "none";
      tList.style.transform = `translateX(-${tIndex * tWidth}px)`;
      updateTestimonialDots();
    }

    // Transition end: handle clones
    tList.addEventListener("transitionend", () => {
      isTransitioning = false;
      if (tSlides[tIndex] && tSlides[tIndex].classList.contains("clone")) {
        tList.style.transition = "none";
        if (tIndex === tSlides.length - 1) {
          tIndex = 1;
        } else if (tIndex === 0) {
          tIndex = tSlides.length - 2;
        }
        tList.style.transform = `translateX(-${tIndex * tWidth}px)`;
      }
    });

    // Update dots safely
    function updateTestimonialDots() {
      const realSlideCount = tSlides.length - 2; // excluding clones
      const current = tIndex - 1; // 0-based for real slides
      const safeIndex = ((current % realSlideCount) + realSlideCount) % realSlideCount;
      const allDots = document.querySelectorAll(".testimonials__pager .dot");
      allDots.forEach(d => d.classList.remove("is-active"));
      if (allDots[safeIndex]) allDots[safeIndex].classList.add("is-active");
    }

    // Controls
    if (tNext) {
      tNext.addEventListener("click", () => {
        if (isTransitioning) return;
        isTransitioning = true;
        tIndex++;
        moveTestimonials();
      });
    }
    if (tPrev) {
      tPrev.addEventListener("click", () => {
        if (isTransitioning) return;
        isTransitioning = true;
        tIndex--;
        moveTestimonials();
      });
    }

    // Dot clicks (delegated)
    if (pager) {
      pager.addEventListener("click", (e) => {
        const dot = e.target.closest(".dot");
        if (!dot) return;
        const allDots = Array.from(document.querySelectorAll(".testimonials__pager .dot"));
        const clickedIndex = allDots.indexOf(dot);
        if (clickedIndex === -1) return;
        tIndex = clickedIndex + 1;
        moveTestimonials();
      });
    }

    // Autoplay with pause on hover/focus
    let autoplayId = null;
    function startAutoplay() {
      stopAutoplay();
      autoplayId = setInterval(() => {
        if (isTransitioning) return;
        isTransitioning = true;
        tIndex++;
        moveTestimonials();
      }, 3000);
    }
    function stopAutoplay() {
      if (autoplayId) {
        clearInterval(autoplayId);
        autoplayId = null;
      }
    }
    tList.addEventListener("mouseenter", stopAutoplay);
    tList.addEventListener("mouseleave", startAutoplay);
    tList.addEventListener("focusin", stopAutoplay);
    tList.addEventListener("focusout", startAutoplay);

    // Start autoplay
    // slight delay to ensure initial transform has been applied
    setTimeout(() => {
      updateTestimonialDots();
      startAutoplay();
    }, 50);
  }

  // simple debounce
  function debounce(fn, wait = 100) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }
});
