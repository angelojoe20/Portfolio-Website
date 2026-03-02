// assets/script.js
document.addEventListener("DOMContentLoaded", () => {
  // Reduced-motion helper
  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Debounce helper
  const debounce = (fn, ms) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };

  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Initialize AOS
  if (typeof AOS !== "undefined" && !prefersReducedMotion()) {
    AOS.init({ duration: 700, once: false, offset: 80 });
  }

  // Typed.js rotating subtitle
  const typedTarget = document.getElementById("typed-text");
  if (typedTarget && typeof Typed !== "undefined" && !prefersReducedMotion()) {
    // eslint-disable-next-line no-new
    new Typed("#typed-text", {
      strings: [
        "Building cloud-ready systems and DevOps solutions.",
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
    typedTarget.textContent = "Building cloud-ready systems and DevOps solutions.";
  }

  // tsParticles (HERO)
  if (window.tsParticles && !prefersReducedMotion()) {
    const heroParticlesEl = document.getElementById("particles-js");
    if (heroParticlesEl) {
      tsParticles.load("particles-js", {
        particles: {
          number: {
            value: window.innerWidth > 768 ? 55 : 25,
            density: { enable: true, area: 900 }
          },
          color: { value: "#111827" },
          shape: { type: "circle" },
          opacity: { value: 0.12, random: true },
          size: { value: 2.2, random: true },
          links: {
            enable: true,
            distance: 160,
            color: "#111827",
            opacity: 0.06,
            width: 1
          },
          move: { enable: true, speed: 0.7, outModes: "out" }
        },
        interactivity: {
          detectsOn: "canvas",
          events: {
            onHover: { enable: window.innerWidth > 768, mode: "grab" },
            onClick: { enable: false }
          },
          modes: {
            grab: { distance: 140, links: { opacity: 0.12 } }
          }
        },
        detectRetina: true
      });
    }
  }

  // VanillaTilt
  if (window.VanillaTilt && !prefersReducedMotion()) {
    const tiltElems = document.querySelectorAll("[data-tilt]");
    if (tiltElems.length) {
      VanillaTilt.init(tiltElems, {
        max: 8,
        speed: 400,
        glare: false,
        scale: 1.02
      });
    }
  }

  // Navbar show/hide (with fallback)
  const nav = document.querySelector(".navbar");
  const heroSection = document.getElementById("home");

  if (nav && heroSection) {
    if (!("IntersectionObserver" in window)) {
      nav.classList.add("visible");
    } else {
      new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) nav.classList.remove("visible");
            else nav.classList.add("visible");
          });
        },
        { threshold: 0.2 }
      ).observe(heroSection);
    }
  }

  // Mobile nav toggle
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
      if (isOpen) navLinks.querySelector("a")?.focus();
    });

    navLinks.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", closeNav);
    });

    document.addEventListener("click", (e) => {
      if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) closeNav();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });
  }

  // Project filters (tabs)
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
        filterButtons.forEach((b) => {
          b.classList.remove("is-active");
          b.setAttribute("aria-selected", "false");
        });

        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");

        const filter = (btn.dataset.filter || "all").toLowerCase();
        applyFilter(filter);

        if (typeof AOS !== "undefined" && !prefersReducedMotion()) {
          setTimeout(() => AOS.refresh(), 50);
        }
      });
    });

    applyFilter("all");
  }

  // Hiking stats (UTC-safe sorting)
  const hikeCards = document.querySelectorAll(".hike-card[data-date]");
  const hikeCountEl = document.getElementById("hikeCount");
  const latestHikeEl = document.getElementById("latestHike");

  const toUTC = (iso) => {
    const [y, m, d] = (iso || "").split("-").map(Number);
    if (!y || !m || !d) return NaN;
    return Date.UTC(y, m - 1, d);
  };

  const formatDate = (iso) => {
    const utc = toUTC(iso);
    if (!utc) return iso || "—";
    const dt = new Date(utc);
    return dt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  if (hikeCards.length && hikeCountEl && latestHikeEl) {
    hikeCountEl.textContent = String(hikeCards.length);

    const dates = [...hikeCards]
      .map((c) => (c.dataset.date || "").trim())
      .filter(Boolean)
      .sort((a, b) => toUTC(a) - toUTC(b));

    const latest = dates[dates.length - 1];
    latestHikeEl.textContent = latest ? formatDate(latest) : "—";
  }

  // Instagram embed reprocess (handles cases where embed.js loads after DOMContentLoaded)
  const processInstagramEmbeds = () => {
    if (
      window.instgrm &&
      window.instgrm.Embeds &&
      typeof window.instgrm.Embeds.process === "function"
    ) {
      window.instgrm.Embeds.process();
      return true;
    }
    return false;
  };

  // Try now, then retry a few times if embed.js loads late
  if (!processInstagramEmbeds()) {
    let tries = 0;
    const maxTries = 10;
    const interval = setInterval(() => {
      tries += 1;
      const ok = processInstagramEmbeds();
      if (ok || tries >= maxTries) clearInterval(interval);
    }, 500);
  }

  // Refresh AOS on resize
  window.addEventListener(
    "resize",
    debounce(() => {
      if (typeof AOS !== "undefined" && !prefersReducedMotion()) AOS.refresh();
    }, 200)
  );
});