document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("mobile-menu-btn");
  const closeBtn = document.getElementById("close-sidebar-btn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");

  const searchBtn = document.getElementById("mobile-search-btn");
  const searchContainer = document.getElementById("mobile-search-container");

  const desktopSearch = document.getElementById("search-input");
  const mobileSearch = document.getElementById("mobile-search-input");

  function openSidebar() {
    sidebar.classList.remove("-translate-x-full");
    overlay.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
  }

  function closeSidebar() {
    sidebar.classList.add("-translate-x-full");
    overlay.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  }

  menuBtn?.addEventListener("click", openSidebar);
  closeBtn?.addEventListener("click", closeSidebar);
  overlay?.addEventListener("click", closeSidebar);

  // Close mobile sidebar after selecting a filter
  document.querySelectorAll(".sidebar-link").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth < 768) {
        closeSidebar();
      }
    });
  });

  // Mobile search
  searchBtn?.addEventListener("click", () => {
    searchContainer.classList.toggle("hidden");

    if (!searchContainer.classList.contains("hidden")) {
      mobileSearch?.focus();
    }
  });

  // Keep mobile and desktop search synchronized
  mobileSearch?.addEventListener("input", (e) => {
    if (desktopSearch) {
      desktopSearch.value = e.target.value;
      desktopSearch.dispatchEvent(new Event("input"));
    }
  });
});

let articles = [
  {
    id: 1,
    source: "Smashing Mag",
    sourceIcon: "S",
    sourceBg: "bg-red-600",
    time: "2h ago",
    title: "Practical Guide To Designing For Colorblind Users",
    snippet:
      "Color blindness affects roughly 8% of men and 0.5% of women worldwide. Yet most interfaces rely heavily on color to convey meaning, status, and hierarchy. Here's how to design interfaces that work for everyone without sacrificing visual richness.",
    category: "Design",
    tagBg: "bg-pink-50 text-pink-600 border-pink-100",
    unread: true,
    saved: true,
  },
  {
    id: 2,
    source: "Cloudflare Blog",
    sourceIcon: "C",
    sourceBg: "bg-orange-500",
    time: "3h ago",
    title: "How We Reduced P99 Latency by 60% with Edge-First Caching",
    snippet:
      "Our engineering team spent the last quarter rethinking how we cache at the edge. The result: dramatically lower tail latency for our most demanding customers, and lessons applicable to any distributed system.",
    category: "Backend & DevOps",
    tagBg: "bg-amber-50 text-amber-600 border-amber-100",
    unread: true,
    saved: false,
  },
  {
    id: 3,
    source: "Simon Willison",
    sourceIcon: "S",
    sourceBg: "bg-black",
    time: "4h ago",
    title: "Building Effective RAG Systems: What Actually Works in Production",
    snippet:
      "After months of experimenting with retrieval-augmented generation in real applications, here's what I've learned about chunking strategies, embedding models, and the surprising importance of metadata filtering.",
    category: "AI & ML",
    tagBg: "bg-purple-50 text-purple-600 border-purple-100",
    unread: true,
    saved: false,
  },
  {
    id: 4,
    source: "Josh Comeau",
    sourceIcon: "J",
    sourceBg: "bg-indigo-600",
    time: "5h ago",
    title: "The Surprising Truth About CSS Container Queries",
    snippet:
      "Container queries have been available for a while now, but most developers are still using them like media queries with a different syntax. There's a much more powerful mental model that unlocks truly reusable components.",
    category: "Frontend",
    tagBg: "bg-blue-50 text-blue-600 border-blue-100",
    unread: true,
    saved: false,
  },
  {
    id: 5,
    source: "CSS-Tricks",
    sourceIcon: "C",
    sourceBg: "bg-red-500",
    time: "5h ago",
    title: "A Complete Guide to CSS Grid Layout",
    snippet:
      "Grid layout is a two-dimensional layout system for the web. It lets you lay out content in rows and columns, and has many features that make building complex layouts easy.",
    category: "Frontend",
    tagBg: "bg-blue-50 text-blue-600 border-blue-100",
    unread: true,
    saved: false,
  },
  {
    id: 6,
    source: "Figma Blog",
    sourceIcon: "F",
    sourceBg: "bg-black",
    time: "6h ago",
    title: "Introducing Variables 2.0: Design Tokens Meet Real Logic",
    snippet:
      "Variables in Figma now support conditional logic, mathematical expressions, and cross-file references. This unlocks design system workflows that were previously only possible in code.",
    category: "Design",
    tagBg: "bg-pink-50 text-pink-600 border-pink-100",
    unread: true,
    saved: true,
  },
  {
    id: 7,
    source: "Punch",
    sourceIcon: "F",
    sourceBg: "bg-blue",
    time: "8h ago",
    title: "Introducing headlines that is crucial for updates in tech.",
    snippet:
      "Variables in punch now provides update for the tech updates and job opportunities available in government.",
    category: "Design",
    tagBg: "bg-pink-50 text-pink-600 border-pink-100",
    unread: true,
    saved: true,
  },
];

let activeFilter = "all";
let searchQuery = "";
let currentViewMode = "list";

// --- DOM Elements ---
const articlesContainer = document.getElementById("articles-container");
const searchInput = document.getElementById("search-input");
const unreadBadge = document.getElementById("unread-count");
const unreadBadgeSidebar = document.getElementById("sidebar-unread-count");
const savedBadgeSidebar = document.getElementById("sidebar-saved-count");
const markAllReadBtn = document.getElementById("mark-all-read-btn");
const refreshBtn = document.getElementById("refresh-btn");
const newItemsBanner = document.getElementById("new-items-banner");
const addArticleBtn = document.getElementById("add-article-btn");
const sidebarLinks = document.querySelectorAll(".sidebar-link");
const viewModeBtns = document.querySelectorAll(".view-mode-btn");

document.addEventListener("DOMContentLoaded", () => {
  renderArticles();
  updateCounters();
  setupEventListeners();
});

function renderArticles() {
  articlesContainer.innerHTML = "";

  // Filter Articles based on search & sidebar selections
  const filtered = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.source.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if (activeFilter === "saved") {
      matchesFilter = article.saved;
    } else if (activeFilter !== "all") {
      const lowerFilter = activeFilter.toLowerCase();
      // Match EITHER by category OR by specific feed source (e.g., CSS-Tricks)
      matchesFilter =
        article.category.toLowerCase() === lowerFilter ||
        article.source.toLowerCase() === lowerFilter;
    }

    return matchesSearch && matchesFilter;
  });

  if (filtered.length === 0) {
    articlesContainer.innerHTML = `
      <div class="text-center py-12 text-gray-400 font-medium">
        <i class="fa-solid fa-folder-open text-3xl mb-2"></i>
        <p>No articles found for "${activeFilter}".</p>
      </div>
    `;
    return;
  }

  // Adjust Container Layout
  if (currentViewMode === "grid") {
    articlesContainer.className = "grid grid-cols-1 md:grid-cols-2 gap-4";
  } else {
    articlesContainer.className = "space-y-6";
  }

  // Render list
  filtered.forEach((article) => {
    const articleEl = document.createElement("article");

    if (currentViewMode === "compact") {
      articleEl.className =
        "flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 group cursor-pointer transition-all";
      articleEl.innerHTML = `
        <div class="flex items-center gap-3 overflow-hidden">
          <span class="w-2 h-2 rounded-full ${
            article.unread ? "bg-blue-600" : "bg-transparent"
          } shrink-0"></span>
          <span class="w-4 h-4 ${
            article.sourceBg
          } text-white text-[10px] font-bold rounded flex items-center justify-center shrink-0">${
        article.sourceIcon
      }</span>
          <h2 class="text-xs font-bold text-gray-900 truncate group-hover:text-blue-600">${
            article.title
          }</h2>
        </div>
        <div class="flex items-center gap-3 shrink-0 text-xs text-gray-400">
          <span>${article.time}</span>
          <button class="save-btn hover:text-amber-500 ${
            article.saved ? "text-amber-500" : ""
          }">
            <i class="${
              article.saved ? "fa-solid" : "fa-regular"
            } fa-bookmark"></i>
          </button>
        </div>
      `;
    } else {
      articleEl.className = `flex items-start gap-3 group cursor-pointer p-2 rounded-lg hover:bg-gray-50/80 transition-all ${
        currentViewMode === "grid" ? "border border-gray-200 p-4" : ""
      }`;
      articleEl.innerHTML = `
        <span class="w-2 h-2 rounded-full ${
          article.unread ? "bg-blue-600" : "bg-transparent"
        } mt-2 shrink-0"></span>
        <div class="space-y-1 w-full">
          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center gap-2">
              <span class="w-4 h-4 ${
                article.sourceBg
              } text-white text-[10px] font-bold rounded flex items-center justify-center">${
        article.sourceIcon
      }</span>
              <span class="font-medium text-gray-700">${article.source}</span>
              <span class="text-gray-400">• ${article.time}</span>
            </div>
            <button class="save-btn text-gray-400 hover:text-amber-500 ${
              article.saved ? "text-amber-500" : ""
            }">
              <i class="${
                article.saved ? "fa-solid" : "fa-regular"
              } fa-bookmark"></i>
            </button>
          </div>
          <h2 class="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            ${article.title}
          </h2>
          <p class="text-xs text-gray-500 leading-relaxed max-w-3xl">
            ${article.snippet}
          </p>
          ${
            article.category
              ? `<div class="pt-1">
                  <span class="inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${article.tagBg}">${article.category}</span>
                </div>`
              : ""
          }
        </div>
      `;
    }

    articleEl.addEventListener("click", (e) => {
      if (e.target.closest(".save-btn")) return;
      markAsRead(article.id);
    });

    const saveBtn = articleEl.querySelector(".save-btn");
    saveBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleSaveArticle(article.id);
    });

    articlesContainer.appendChild(articleEl);
  });
}

// --- Helpers ---
function markAsRead(id) {
  const article = articles.find((a) => a.id === id);
  if (article && article.unread) {
    article.unread = false;
    renderArticles();
    updateCounters();
  }
}

function toggleSaveArticle(id) {
  const article = articles.find((a) => a.id === id);
  if (article) {
    article.saved = !article.saved;
    renderArticles();
    updateCounters();
  }
}

function updateCounters() {
  const unreadCount = articles.filter((a) => a.unread).length;
  const savedCount = articles.filter((a) => a.saved).length;

  unreadBadge.textContent = `${unreadCount} unread`;
  unreadBadgeSidebar.textContent = unreadCount;
  savedBadgeSidebar.textContent = savedCount;
}

// --- Event Listeners Setup ---
function setupEventListeners() {
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderArticles();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
  });

  markAllReadBtn.addEventListener("click", () => {
    articles.forEach((a) => (a.unread = false));
    renderArticles();
    updateCounters();
  });

  refreshBtn.addEventListener("click", () => {
    const icon = refreshBtn.querySelector("i");
    icon.classList.add("animate-spin");
    setTimeout(() => {
      icon.classList.remove("animate-spin");
      renderArticles();
    }, 600);
  });

  newItemsBanner.addEventListener("click", () => {
    const newArticle = {
      id: Date.now(),
      source: "Vercel Blog",
      sourceIcon: "V",
      sourceBg: "bg-black",
      time: "Just now",
      title: "Next.js 15: Introducing Dynamic Server Components & Turbopack",
      snippet:
        "We are excited to announce Next.js 15 with improvements to caching defaults, async request APIs, and production-ready Turbopack.",
      category: "Frontend",
      tagBg: "bg-blue-50 text-blue-600 border-blue-100",
      unread: true,
      saved: false,
    };

    articles.unshift(newArticle);
    newItemsBanner.classList.add("hidden");
    renderArticles();
    updateCounters();
  });

  addArticleBtn.addEventListener("click", () => {
    const title = prompt("Enter RSS Article Title:");
    if (!title) return;

    const source =
      prompt("Enter Feed Source Name:", "Custom Feed") || "Custom Feed";

    articles.unshift({
      id: Date.now(),
      source: source,
      sourceIcon: source.charAt(0).toUpperCase(),
      sourceBg: "bg-emerald-600",
      time: "Just now",
      title: title,
      snippet: "Custom article manually added to your feed pipeline.",
      category: "General Tech",
      tagBg: "bg-indigo-50 text-indigo-600 border-indigo-100",
      unread: true,
      saved: false,
    });

    renderArticles();
    updateCounters();
  });

  // Sidebar Filter Links Click Handler
  sidebarLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      // Reset style across all sidebar links
      sidebarLinks.forEach((l) => {
        l.classList.remove("bg-blue-50", "text-blue-600");
        l.classList.add("text-gray-700", "text-gray-600");
      });

      // Highlight active clicked item
      const target = e.currentTarget;
      target.classList.add("bg-blue-50", "text-blue-600");

      activeFilter = target.dataset.filter || "all";
      renderArticles();
    });
  });

  // View Switcher
  viewModeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      viewModeBtns.forEach((b) =>
        b.classList.remove("bg-white", "text-gray-800", "shadow-sm")
      );
      btn.classList.add("bg-white", "text-gray-800", "shadow-sm");

      currentViewMode = btn.dataset.view;
      renderArticles();
    });
  });
}
