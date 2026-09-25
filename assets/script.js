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
    document.querySelector('meta[name="theme-color"]').content = theme === "dark" ? "#14171b" : "#f8f9fb";
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
    if (!navLinks.classList.contains("open")) return;
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation");
    navToggle.innerHTML = icon("menu");
    renderIcons();
  };
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    navToggle.innerHTML = icon(open ? "x" : "menu");
    renderIcons();
  });
  navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));
  document.addEventListener("click", (event) => {
    const path = event.composedPath();
    if (!path.includes(navLinks) && !path.includes(navToggle)) closeNav();
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
    const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollRange > 0 && window.scrollY >= scrollRange - 2) activeId = sections.at(-1).id;
    document.getElementById("readingProgress").style.transform = "scaleX(" +
      Math.max(0, Math.min(1, window.scrollY / Math.max(1, scrollRange))) + ")";
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
  window.addEventListener("resize", updateScroll);
  document.fonts.ready.then(updateScroll);
  if ("ResizeObserver" in window) new ResizeObserver(updateScroll).observe(document.getElementById("main"));
  updateScroll();
  scrollTop.addEventListener("click", () => window.scrollTo({
    top: 0, behavior: reducedMotion.matches ? "instant" : "smooth"
  }));

  const experienceToggles = [];
  const experienceToolbar = document.createElement("div");
  experienceToolbar.className = "experience-toolbar";
  const expandAll = document.createElement("button");
  expandAll.type = "button";
  expandAll.className = "icon-btn";
  experienceToolbar.append(expandAll);
  document.querySelector(".exp-list").before(experienceToolbar);
  const updateExpandAll = () => {
    const allOpen = experienceToggles.every(({body}) => !body.hidden);
    expandAll.setAttribute("aria-expanded", String(allOpen));
    expandAll.setAttribute("aria-label", allOpen ? "Collapse all companies" : "Expand all companies");
    expandAll.title = expandAll.getAttribute("aria-label");
    expandAll.innerHTML = icon(allOpen ? "chevrons-up" : "chevrons-down");
    renderIcons();
  };
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
    const setExpanded = (expanded) => {
      body.hidden = !expanded;
      button.setAttribute("aria-expanded", String(expanded));
      button.setAttribute("aria-label", (body.hidden ? "Show" : "Hide") + " experience at " + title);
      button.title = body.hidden ? "Show experience" : "Hide experience";
      updateScroll();
    };
    experienceToggles.push({body, setExpanded});
    button.addEventListener("click", () => {
      setExpanded(body.hidden);
      updateExpandAll();
    });
  });
  expandAll.setAttribute("aria-controls", experienceToggles.map(({body}) => body.id).join(" "));
  expandAll.addEventListener("click", () => {
    const expand = experienceToggles.some(({body}) => body.hidden);
    experienceToggles.forEach(({setExpanded}) => setExpanded(expand));
    updateExpandAll();
  });
  updateExpandAll();

  ["cloud", "code-xml", "database", "book-open-check"].forEach((name, index) => {
    document.querySelectorAll(".focus-index")[index].insertAdjacentHTML("beforeend", icon(name));
  });
  document.getElementById("awsCredentialCount").textContent = document.querySelectorAll('[data-cert-category="aws"]').length;
  document.querySelectorAll(".cert-mark").forEach(mark => mark.insertAdjacentHTML("beforeend", icon("award")));
  document.querySelectorAll("[data-expires]").forEach(dates => {
    if (Date.now() <= Date.parse(dates.dataset.expires + "T23:59:59")) return;
    const status = document.createElement("span");
    status.className = "credential-expired";
    status.textContent = "Expired";
    const mark = dates.closest(".cert-card").querySelector(".cert-mark");
    mark.lastElementChild?.remove();
    mark.append(status);
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
      updateScroll();
    };
    buttons.forEach((button) => button.addEventListener("click", () => apply(button.dataset[attribute])));
    apply("all");
  };
  setupFilters(".filter-btn", ".project-card", "filter", (item) => item.dataset.category.split(" "));
  setupFilters(".cert-filter-btn", ".cert-group", "certFilter", (item) => [item.dataset.certGroup]);

  const mediaDialog = document.getElementById("mediaDialog");
  const mediaContent = document.getElementById("mediaContent");
  const mediaTitle = document.getElementById("mediaTitle");
  const mediaStatus = document.getElementById("mediaStatus");
  const mediaSource = document.getElementById("mediaSource");
  const mediaVariants = document.getElementById("mediaVariants");
  let previewRequest = 0;
  let embedObserver;
  let embedTimer;
  const clearPreview = () => {
    previewRequest++;
    embedObserver?.disconnect();
    clearTimeout(embedTimer);
    mediaContent.replaceChildren();
  };
  const openPreview = (title, source, sourceLabel) => {
    clearPreview();
    mediaTitle.textContent = title;
    mediaSource.href = source;
    mediaSource.innerHTML = sourceLabel + " " + icon("arrow-up-right");
    mediaStatus.textContent = "";
    mediaVariants.hidden = true;
    mediaDialog.showModal();
    renderIcons();
  };
  document.getElementById("closeMedia").addEventListener("click", () => mediaDialog.close());
  mediaDialog.addEventListener("close", clearPreview);
  mediaDialog.addEventListener("click", event => {
    const bounds = mediaDialog.getBoundingClientRect();
    if (event.target === mediaDialog && (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom)) mediaDialog.close();
  });
  document.querySelectorAll(".project-card").forEach(card => {
    const title = card.querySelector("h3").textContent.trim();
    const notes = card.querySelector(".case-study-grid");
    const details = document.createElement("details");
    details.className = "project-details";
    const summary = document.createElement("summary");
    summary.innerHTML = "Project notes " + icon("chevron-down");
    summary.setAttribute("aria-label", "Project notes for " + title);
    notes.replaceWith(details);
    details.append(summary, notes);
    const img = card.querySelector(".project-image");
    const media = img.closest("picture") || img;
    const preview = document.createElement("button");
    preview.type = "button";
    preview.className = "project-preview";
    preview.setAttribute("aria-label", "Preview " + title);
    preview.title = "View screenshot";
    media.replaceWith(preview);
    preview.append(media);
    preview.insertAdjacentHTML("beforeend", '<span class="preview-icon">' + icon("maximize-2") + "</span>");
    preview.addEventListener("click", () => {
      openPreview(title, img.dataset.full || img.dataset.desktop || img.src, "Open full-size image");
      const full = document.createElement("img");
      full.alt = img.alt;
      full.addEventListener("error", () => { mediaStatus.textContent = "The image could not load. The original file is linked below."; });
      mediaContent.append(full);
      if (img.dataset.desktop && img.dataset.mobile) {
        mediaVariants.hidden = false;
        const selectView = view => {
          full.src = img.dataset[view];
          mediaSource.href = full.src;
          mediaVariants.querySelectorAll("button").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.view === view)));
        };
        mediaVariants.querySelectorAll("button").forEach(button => { button.onclick = () => selectView(button.dataset.view); });
        selectView(window.matchMedia("(max-width: 640px)").matches ? "mobile" : "desktop");
      } else { full.src = img.dataset.full || img.src; }
    });
    const source = card.querySelector(".project-content > .btn-link");
    source.innerHTML = "Source code " + icon("arrow-up-right");
    source.setAttribute("aria-label", "Source code for " + title);
  });

  const gallery = document.getElementById("hikeGrid");
  const cards = [...gallery.querySelectorAll(".hike-card")];
  const controls = document.createElement("div");
  controls.className = "gallery-controls";
  controls.innerHTML = '<p class="gallery-count" role="status"></p><div class="gallery-buttons">' +
    '<button type="button" class="gallery-arrow" data-direction="-1" aria-label="Previous hiking posts" title="Previous hiking posts">' + icon("arrow-left") + '</button>' +
    '<button type="button" class="gallery-arrow" data-direction="1" aria-label="Next hiking posts" title="Next hiking posts">' + icon("arrow-right") + '</button></div>';
  gallery.before(controls);
  gallery.setAttribute("tabindex", "0");
  gallery.setAttribute("aria-label", "Hiking photo journals");
  const arrows = [...controls.querySelectorAll("button")];
  const galleryStep = () => cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(gallery).columnGap);
  const updateGallery = () => {
    arrows[0].disabled = gallery.scrollLeft < 2;
    arrows[1].disabled = gallery.scrollLeft >= gallery.scrollWidth - gallery.clientWidth - 2;
    const start = Math.max(0, Math.round(gallery.scrollLeft / galleryStep()));
    const visible = Math.max(1, Math.floor((gallery.clientWidth + parseFloat(getComputedStyle(gallery).columnGap)) / galleryStep()));
    controls.querySelector(".gallery-count").textContent = String(start + 1).padStart(2, "0") + "-" +
      String(Math.min(cards.length, start + visible)).padStart(2, "0") + " / " + String(cards.length).padStart(2, "0") + " journals";
  };
  arrows.forEach((button) => button.addEventListener("click", () => {
    const distance = galleryStep();
    gallery.scrollBy({ left: Number(button.dataset.direction) * distance, behavior: reducedMotion.matches ? "instant" : "smooth" });
  }));
  gallery.addEventListener("scroll", updateGallery, { passive: true });
  window.addEventListener("resize", updateGallery);
  gallery.addEventListener("keydown", event => {
    if (event.target !== gallery || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const left = event.key === "Home" ? 0 : event.key === "End" ? gallery.scrollWidth :
      gallery.scrollLeft + (event.key === "ArrowLeft" ? -1 : 1) * galleryStep();
    gallery.scrollTo({left, behavior: reducedMotion.matches ? "instant" : "smooth"});
  });
  updateGallery();

  // Instagram is requested only after a visitor opens a specific journal.
  let instagramPromise;
  const loadInstagram = () => {
    if (window.instgrm?.Embeds) return Promise.resolve();
    if (instagramPromise) return instagramPromise;
    instagramPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      const fail = () => { clearTimeout(timer); script.remove(); instagramPromise = null; reject(new Error("Instagram unavailable")); };
      const timer = setTimeout(fail, 10000);
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      script.onload = () => { clearTimeout(timer); window.instgrm?.Embeds ? resolve() : fail(); };
      script.onerror = fail;
      document.body.append(script);
    });
    return instagramPromise;
  };
  cards.forEach((card, index) => {
    const title = card.querySelector("h3").textContent.trim();
    const embed = card.querySelector("blockquote").cloneNode(true);
    const permalink = embed.dataset.instgrmPermalink;
    card.querySelector(".hike-embed").remove();
    const cover = document.createElement("div");
    cover.className = "trail-cover";
    cover.setAttribute("aria-hidden", "true");
    cover.innerHTML = '<span class="trail-number">' + String(index + 1).padStart(2, "0") + "</span>" + icon("mountain");
    card.prepend(cover);
    const actions = document.createElement("div");
    actions.className = "hike-actions";
    const source = card.querySelector(".btn-link");
    source.innerHTML = "Instagram journal " + icon("arrow-up-right");
    source.setAttribute("aria-label", title + " on Instagram");
    source.replaceWith(actions);
    actions.append(source);
    const preview = document.createElement("button");
    preview.type = "button";
    preview.className = "icon-btn hike-preview";
    preview.setAttribute("aria-label", "Preview " + title + " journal");
    preview.title = "Preview " + title + " journal";
    preview.innerHTML = icon("images");
    actions.append(preview);
    preview.addEventListener("click", async () => {
      openPreview(title, permalink, "Open on Instagram");
      const request = previewRequest;
      mediaContent.append(embed.cloneNode(true));
      mediaStatus.textContent = "Loading Instagram preview...";
      const unavailable = () => { if (request === previewRequest) mediaStatus.textContent = "Instagram preview unavailable. The original journal is linked below."; };
      try {
        await loadInstagram();
        if (request !== previewRequest) return;
        embedObserver = new MutationObserver(() => {
          const frame = mediaContent.querySelector("iframe");
          if (!frame) return;
          frame.title = title + " Instagram post";
          mediaStatus.textContent = "Instagram controls the availability of this post.";
          embedObserver.disconnect();
          clearTimeout(embedTimer);
        });
        embedObserver.observe(mediaContent, {childList: true, subtree: true});
        window.instgrm.Embeds.process();
        embedTimer = setTimeout(unavailable, 10000);
      } catch { unavailable(); }
    });
  });

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
    formStatus.textContent = "Continue in your email app to send your message.";
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
