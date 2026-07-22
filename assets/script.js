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

  // Dark mode toggle
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = themeToggle?.querySelector(".theme-icon");
  const savedTheme = localStorage.getItem("theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

  const applyTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    if (themeIcon) themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
    localStorage.setItem("theme", theme);
  };

  applyTheme(savedTheme);

  themeToggle?.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
  });

  // Scroll to top
  const scrollTopBtn = document.getElementById("scrollTop");
  if (scrollTopBtn) {
    window.addEventListener("scroll", () => {
      scrollTopBtn.classList.toggle("visible", window.scrollY > 400);
    }, { passive: true });
    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

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
        "Building secure infrastructure, repeatable delivery pipelines, and practical cloud solutions.",
        "Designing AWS environments with automation, governance, and reliability in mind.",
        "Open to cloud engineering roles, collaborations, and systems-focused work."
      ],
      typeSpeed: 55,
      backSpeed: 14,
      backDelay: 2500,
      loop: true,
      showCursor: true,
      cursorChar: "|"
    });
  } else if (typedTarget) {
    typedTarget.textContent = "Building secure infrastructure, repeatable delivery pipelines, and practical cloud solutions.";
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

  // Active nav link highlighting on scroll
  const navLinkEls = document.querySelectorAll(".nav-links a[href^='#']");
  const sectionIds = [...navLinkEls].map((a) => a.getAttribute("href").slice(1));
  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

  if (sections.length && navLinkEls.length) {
    const setActive = (id) => {
      navLinkEls.forEach((a) => {
        a.classList.toggle("active", a.getAttribute("href") === `#${id}`);
      });
    };

    new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { threshold: 0.3, rootMargin: "-60px 0px -40% 0px" }
    ).observe && sections.forEach((s) =>
      new IntersectionObserver(
        (entries) => { entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }); },
        { threshold: 0.3, rootMargin: "-60px 0px -40% 0px" }
      ).observe(s)
    );
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
    // Count actual peaks: quadpeak cards = 4 peaks each, others = 1
    const totalPeaks = [...hikeCards].reduce((sum, card) => {
      const tags = card.querySelectorAll(".tag");
      const isQuad = [...tags].some(t => t.textContent.includes("4 Peaks"));
      return sum + (isQuad ? 4 : 1);
    }, 0);
    hikeCountEl.textContent = String(totalPeaks);

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

  if (!processInstagramEmbeds()) {
    let tries = 0;
    const maxTries = 10;
    const interval = setInterval(() => {
      tries += 1;
      const ok = processInstagramEmbeds();
      if (ok || tries >= maxTries) clearInterval(interval);
    }, 500);
  }

  // Instagram skeleton loaders
  document.querySelectorAll(".hike-embed blockquote.instagram-media").forEach((bq) => {
    const wrapper = bq.closest(".hike-embed");
    if (!wrapper) return;
    const skeleton = document.createElement("div");
    skeleton.className = "hike-embed-skeleton";
    wrapper.parentNode.insertBefore(skeleton, wrapper);
    wrapper.style.display = "none";
    const observer = new MutationObserver(() => {
      if (wrapper.querySelector("iframe")) {
        skeleton.remove();
        wrapper.style.display = "";
        observer.disconnect();
      }
    });
    observer.observe(wrapper, { childList: true, subtree: true });
  });

  // Contact form — opens mailto as fallback (no backend needed)
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");
  if (contactForm && formStatus) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = contactForm.contactName?.value.trim();
      const email = contactForm.contactEmail?.value.trim();
      const subject = contactForm.contactSubject?.value.trim() || "Portfolio Inquiry";
      const message = contactForm.contactMessage?.value.trim();
      if (!name || !email || !message) {
        formStatus.textContent = "Please fill in all required fields.";
        formStatus.className = "form-status error";
        return;
      }
      const mailto = `mailto:angelojoedelossantos20@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
      window.location.href = mailto;
      formStatus.textContent = "Opening your email client...";
      formStatus.className = "form-status success";
      contactForm.reset();
    });
  }

  // Copy email
  const copyEmailBtn = document.getElementById("copyEmail");
  if (copyEmailBtn) {
    const originalText = copyEmailBtn.textContent;
    copyEmailBtn.addEventListener("click", async () => {
      const email = copyEmailBtn.dataset.email || "";
      try {
        await navigator.clipboard.writeText(email);
        copyEmailBtn.textContent = "Copied";
        setTimeout(() => {
          copyEmailBtn.textContent = originalText;
        }, 1600);
      } catch {
        window.location.href = `mailto:${email}`;
      }
    });
  }

  // Refresh AOS on resize
  window.addEventListener(
    "resize",
    debounce(() => {
      if (typeof AOS !== "undefined" && !prefersReducedMotion()) AOS.refresh();
    }, 200)
  );

  // Remove the old PWA service worker so portfolio updates are visible immediately.
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.getRegistrations()
        .then((registrations) => {
          registrations.forEach((registration) => registration.unregister());
        })
        .catch(() => {});
    });
  }
});
