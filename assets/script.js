document.addEventListener("DOMContentLoaded", () => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const renderIcons = () => window.lucide?.createIcons();
  const icon = (name) => '<i data-lucide="' + name + '" aria-hidden="true"></i>';
  const themeToggle = document.getElementById("themeToggle");
  let savedTheme;
  try { savedTheme = localStorage.getItem("theme"); } catch {}
  const applyTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    themeToggle.innerHTML = icon(theme === "dark" ? "sun" : "moon");
    const label = "Switch to " + (theme === "dark" ? "light" : "dark") + " mode";
    themeToggle.setAttribute("aria-label", label);
    themeToggle.title = label;
    document.querySelector('meta[name="theme-color"]').content = theme === "dark" ? "#131715" : "#fafbfa";
    try { localStorage.setItem("theme", theme); } catch {}
    renderIcons();
  };
  applyTheme(savedTheme === "dark" || savedTheme === "light" ? savedTheme :
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  themeToggle.addEventListener("click", () => {
    applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  });
  document.getElementById("year").textContent = new Date().getFullYear();

  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  const closeNav = () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  };
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));
  document.addEventListener("click", (event) => {
    if (!navLinks.contains(event.target) && !navToggle.contains(event.target)) closeNav();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navLinks.classList.contains("open")) {
      closeNav();
      navToggle.focus();
    }
  });
  window.matchMedia("(min-width: 901px)").addEventListener("change", closeNav);

  // Use each section's top edge; tall expanded sections remain correctly selected.
  const links = [...navLinks.querySelectorAll("a")];
  const sections = links.map((link) => document.querySelector(link.getAttribute("href")));
  const scrollTop = document.getElementById("scrollTop");
  let scrollPending = false;
  const updateScroll = () => {
    let activeId = "";
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= 160) activeId = section.id;
    });
    links.forEach((link) => {
      const active = link.hash === "#" + activeId;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    scrollTop.classList.toggle("visible", window.scrollY > 500);
    scrollPending = false;
  };
  window.addEventListener("scroll", () => {
    if (!scrollPending) {
      scrollPending = true;
      requestAnimationFrame(updateScroll);
    }
  }, { passive: true });
  updateScroll();
  scrollTop.addEventListener("click", () => window.scrollTo({
    top: 0, behavior: reducedMotion.matches ? "instant" : "smooth"
  }));

  document.querySelectorAll(".exp-card").forEach((card, index) => {
    const body = card.querySelector(".exp-card-body");
    const title = card.querySelector("h3").textContent.trim();
    const button = document.createElement("button");
    body.id = "experience-details-" + (index + 1);
    body.hidden = true;
    button.className = "exp-toggle";
    button.type = "button";
    button.setAttribute("aria-controls", body.id);
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", "Show experience at " + title);
    button.title = "Show experience";
    button.innerHTML = icon("chevron-down");
    card.querySelector(".exp-card-header").append(button);
    button.addEventListener("click", () => {
      body.hidden = !body.hidden;
      button.setAttribute("aria-expanded", String(!body.hidden));
      button.setAttribute("aria-label", (body.hidden ? "Show" : "Hide") + " experience at " + title);
      button.title = body.hidden ? "Show experience" : "Hide experience";
      updateScroll();
    });
  });

  const setupFilters = (buttonSelector, itemSelector, attribute, categories) => {
    const buttons = [...document.querySelectorAll(buttonSelector)];
    const items = [...document.querySelectorAll(itemSelector)];
    const apply = (filter) => {
      buttons.forEach((button) => {
        const active = button.dataset[attribute] === filter;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
        button.removeAttribute("aria-selected");
      });
      items.forEach((item) => {
        item.hidden = filter !== "all" && !categories(item).includes(filter);
      });
    };
    buttons.forEach((button) => button.addEventListener("click", () => apply(button.dataset[attribute])));
    apply("all");
  };
  setupFilters(".filter-btn", ".project-card", "filter", (item) => item.dataset.category.split(" "));
  setupFilters(".cert-filter-btn", ".cert-group", "certFilter", (item) => [item.dataset.certGroup]);

  const gallery = document.getElementById("hikeGrid");
  const cards = [...gallery.querySelectorAll(".hike-card")];
  const controls = document.createElement("div");
  controls.className = "gallery-controls";
  controls.innerHTML = '<p class="gallery-count" role="status">8 trail journals</p><div class="gallery-buttons">' +
    '<button type="button" class="gallery-arrow" data-direction="-1" aria-label="Previous hiking posts" title="Previous hiking posts">' + icon("arrow-left") + '</button>' +
    '<button type="button" class="gallery-arrow" data-direction="1" aria-label="Next hiking posts" title="Next hiking posts">' + icon("arrow-right") + '</button></div>';
  gallery.before(controls);
  gallery.setAttribute("tabindex", "0");
  gallery.setAttribute("aria-label", "Hiking photo journals");
  const arrows = [...controls.querySelectorAll("button")];
  const updateGallery = () => {
    arrows[0].disabled = gallery.scrollLeft < 2;
    arrows[1].disabled = gallery.scrollLeft >= gallery.scrollWidth - gallery.clientWidth - 2;
  };
  arrows.forEach((button) => button.addEventListener("click", () => {
    const distance = cards[0].getBoundingClientRect().width + 20;
    gallery.scrollBy({ left: Number(button.dataset.direction) * distance, behavior: reducedMotion.matches ? "instant" : "smooth" });
  }));
  gallery.addEventListener("scroll", updateGallery, { passive: true });
  window.addEventListener("resize", updateGallery);
  updateGallery();

  // Defer Instagram's third-party script until the photo journal is near view.
  let instagramRequested = false;
  const loadInstagram = () => {
    if (instagramRequested) return;
    instagramRequested = true;
    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    script.onload = () => window.instgrm?.Embeds?.process();
    document.body.append(script);
  };
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadInstagram();
        observer.disconnect();
      }
    }, { rootMargin: "300px" });
    observer.observe(gallery);
  } else { loadInstagram(); }

  const totalPeaks = cards.reduce((sum, card) => sum + Number(card.dataset.peaks || 1), 0);
  document.getElementById("hikeCount").textContent = totalPeaks;
  const latest = cards.map((card) => card.dataset.date).filter(Boolean).sort().pop();
  document.getElementById("latestHike").textContent = latest ?
    new Date(latest + "T00:00:00Z").toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }) : "-";

  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    const data = new FormData(contactForm);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const subject = String(data.get("subject") || "").trim() || "Portfolio inquiry";
    const message = String(data.get("message") || "").trim();
    if (!name || !email || !message) {
      formStatus.textContent = "Please enter your name, email, and message.";
      formStatus.className = "form-status error";
      return;
    }
    const body = "Name: " + name + "\nEmail: " + email + "\n\n" + message;
    window.location.href = "mailto:angelojoedelossantos20@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    formStatus.textContent = "Your email draft is ready in your email app. Send it there to get in touch.";
    formStatus.className = "form-status";
  });

  const copyEmail = document.getElementById("copyEmail");
  let copyReset;
  copyEmail.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(copyEmail.dataset.email);
      copyEmail.innerHTML = icon("check");
      copyEmail.title = "Email copied";
      copyEmail.setAttribute("aria-label", "Email copied");
      copyEmail.classList.add("is-copied");
      formStatus.textContent = "Email address copied.";
      formStatus.className = "form-status";
      renderIcons();
      clearTimeout(copyReset);
      copyReset = setTimeout(() => {
        copyEmail.innerHTML = icon("copy");
        copyEmail.title = "Copy email address";
        copyEmail.setAttribute("aria-label", "Copy email address");
        copyEmail.classList.remove("is-copied");
        renderIcons();
      }, 2000);
    } catch {
      formStatus.textContent = "Copy is unavailable. You can select the email address or open its link.";
      formStatus.className = "form-status error";
    }
  });
  document.querySelectorAll(".icon-btn").forEach((link) => { link.title = link.getAttribute("aria-label"); });
  renderIcons();

  // Retire the legacy offline cache so old portfolio assets cannot mask updates.
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      .catch(() => {});
  }
});
