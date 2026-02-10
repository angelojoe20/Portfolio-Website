document.addEventListener("DOMContentLoaded", () => {
  // 1) Reduced-motion helper
  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 2) Debounce helper
  const debounce = (fn, ms) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };

  // 3) Initialize AOS
  if (typeof AOS !== "undefined" && !prefersReducedMotion()) {
    AOS.init({ duration: 700, once: false, offset: 80 });
  } else {
    // no need to warn users; just silently skip
  }

  // 4) Typed.js rotating subtitle
  const typedTarget = document.getElementById("typed-text");
  if (typedTarget && typeof Typed !== "undefined" && !prefersReducedMotion()) {
    new Typed("#typed-text", {
      strings: [
        "Building cloud-ready systems and enterprise IT solutions.",
        "Computer Engineering student focused on Cloud & DevOps.",
        "Open to collaborations — let’s build something."
      ],
      typeSpeed: 55,
      backSpeed: 14,
      backDelay: 2500,
      loop: true,
      showCursor: true,
      cursorChar: "|"
    });
  } else if (typedTarget) {
    typedTarget.textContent = "Building cloud-ready systems and enterprise IT solutions.";
  }

  // 5) tsParticles (HERO only — calmer, more premium)
  if (window.tsParticles && !prefersReducedMotion()) {
    const heroParticlesEl = document.getElementById("particles-js");
    if (heroParticlesEl) {
      tsParticles.load("particles-js", {
        particles: {
          number: {
            value: window.innerWidth > 768 ? 55 : 25,
            density: { enable: true, value_area: 900 }
          },
          color: { value: "#ffffff" },
          shape: { type: "circle" },
          opacity: { value: 0.22, random: true },
          size: { value: 2.2, random: true },
          links: {
            enable: true,
            distance: 160,
            color: "#ffffff",
            opacity: 0.10,
            width: 1
          },
          move: { enable: true, speed: 0.8, outModes: "out" }
        },
        interactivity: {
          detectsOn: "canvas",
          events: {
            onHover: { enable: window.innerWidth > 768, mode: "grab" },
            onClick: { enable: false }
          },
          modes: {
            grab: { distance: 140, links: { opacity: 0.18 } }
          }
        },
        detectRetina: true
      });
    }
  }

  // 6) VanillaTilt
  if (window.VanillaTilt && !prefersReducedMotion()) {
    const tiltElems = document.querySelectorAll("[data-tilt]");
    if (tiltElems.length) {
      VanillaTilt.init(tiltElems, {
        max: 10,
        speed: 400,
        glare: false,
        scale: 1.02
      });
    }
  }

  // 7) Navbar show/hide (kept)
  const nav = document.querySelector(".navbar");
  const heroSection = document.getElementById("home");
  const aboutSection = document.getElementById("about-me");
  const projectsSection = document.getElementById("projects");

  if (nav && heroSection && aboutSection && projectsSection) {
    new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && nav.classList.remove("visible")),
      { threshold: 0 }
    ).observe(heroSection);

    new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && nav.classList.add("visible")),
      { threshold: 0.1, rootMargin: "-80px 0px 0px 0px" }
    ).observe(aboutSection);

    new IntersectionObserver(
      (entries) => entries.forEach((e) => !e.isIntersecting && nav.classList.remove("visible")),
      { threshold: 0, rootMargin: "0px 0px -100% 0px" }
    ).observe(projectsSection);
  }

  // 8) Mobile nav toggle (NEW)
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  if (navToggle && navLinks) {
    const closeNav = () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    };

    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close nav when a link is clicked (mobile UX)
    navLinks.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => closeNav());
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) closeNav();
    });

    // Close on ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });
  }

  // 9) Project filters (NEW)
  const filterButtons = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card[data-category]");

  if (filterButtons.length && projectCards.length) {
    const applyFilter = (filter) => {
      projectCards.forEach((card) => {
        const categories = (card.dataset.category || "")
          .split(" ")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean);

        const show = filter === "all" || categories.includes(filter);
        card.style.display = show ? "" : "none";
      });
    };

    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterButtons.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");

        const filter = (btn.dataset.filter || "all").toLowerCase();
        applyFilter(filter);

        // Refresh AOS layout after filtering
        if (typeof AOS !== "undefined" && !prefersReducedMotion()) {
          setTimeout(() => AOS.refresh(), 50);
        }
      });
    });

    // default
    applyFilter("all");
  }

  // 10) Refresh AOS on resize
  window.addEventListener(
    "resize",
    debounce(() => {
      if (typeof AOS !== "undefined" && !prefersReducedMotion()) AOS.refresh();
    }, 200)
  );
});
