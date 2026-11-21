/**
 * مصنع أولاد يحيى لتصنيع كراسي الحلاقة ومعدات الصالونات | Awlad Yahya Factory
 * Production JavaScript Application
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ==========================================
  // 1. DATA DEFINITIONS: Products & Categories
  // ==========================================
  // Synchronized dynamically from Supabase and data/Awlad_Yahya_Product_Catalog_Database.xlsx
  let productsData = (() => {
    try {
      const cached = localStorage.getItem('ay_local_products');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return (typeof window !== 'undefined' && Array.isArray(window.productsData) && window.productsData.length > 0)
      ? window.productsData
      : [];
  })();

  let categoriesData = (() => {
    try {
      const cached = localStorage.getItem('ay_local_categories');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return (typeof window !== 'undefined' && Array.isArray(window.categoriesData))
      ? window.categoriesData
      : [];
  })();

  // ==========================================
  // 2. THEME TOGGLE (Dark / Light Mode)
  // ==========================================
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('ay_theme');

  // Default is DARK MODE
  if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    updateThemeIcon('light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    updateThemeIcon('dark');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const targetTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', targetTheme);
      localStorage.setItem('ay_theme', targetTheme);
      updateThemeIcon(targetTheme);
    });
  }

  function updateThemeIcon(theme) {
    if (!themeToggleBtn) return;
    if (theme === 'light') {
      themeToggleBtn.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      `;
      themeToggleBtn.setAttribute('title', 'التحويل للوضع الليلي');
      themeToggleBtn.setAttribute('aria-label', 'التحويل للوضع الليلي');
    } else {
      themeToggleBtn.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      `;
      themeToggleBtn.setAttribute('title', 'التحويل للوضع الفاتح');
      themeToggleBtn.setAttribute('aria-label', 'التحويل للوضع الفاتح');
    }
  }

  // ==========================================
  // 3. MOBILE NAVIGATION HAMBURGER
  // ==========================================
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = navMenu.classList.contains('active');
      if (isOpen) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    // Close mobile nav when clicking any link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeMobileNav();
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !hamburgerBtn.contains(e.target) && navMenu.classList.contains('active')) {
        closeMobileNav();
      }
    });
  }

  function openMobileNav() {
    navMenu.classList.add('active');
    hamburgerBtn.classList.add('active');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    navMenu.classList.remove('active');
    hamburgerBtn.classList.remove('active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  // ==========================================
  // 4. SCROLL SPY & ACTIVE NAV LINKS
  // ==========================================
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const correspondingLink = document.querySelector(`.nav-link[href*="${sectionId}"]`);

      if (correspondingLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          correspondingLink.classList.add('active');
        } else {
          correspondingLink.classList.remove('active');
        }
      }
    });

    // Back to top button visibility
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
      if (scrollY > 500) {
        backToTopBtn.style.opacity = '1';
        backToTopBtn.style.pointerEvents = 'auto';
      } else {
        backToTopBtn.style.opacity = '0.7';
      }
    }
  });

  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ==========================================
  // 5. INTERSECTION OBSERVER ANIMATIONS
  // ==========================================
  const animatedElements = document.querySelectorAll('.fade-up');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));
  } else {
    animatedElements.forEach(el => el.classList.add('in-view'));
  }

  // ==========================================
  // 6. PRODUCTS RENDERING, PDP SHOWCASE & ROUTING
  // ==========================================
  const productsContainer = document.getElementById('productsContainer');
  const catalogGridView = document.getElementById('catalogGridView');
  const productShowcaseView = document.getElementById('productShowcaseView');
  const filterButtons = document.querySelectorAll('.products-filter-nav .filter-btn');
  const categoryChips = document.querySelectorAll('.category-chip');

  // PDP Elements
  const pdpBreadcrumbs = document.getElementById('pdpBreadcrumbs');
  const pdpCategoryBadge = document.getElementById('pdpCategoryBadge');
  const pdpCodeBadge = document.getElementById('pdpCodeBadge');
  const pdpModelPill = document.getElementById('pdpModelPill');
  const pdpTitle = document.getElementById('pdpTitle');
  const pdpShortDesc = document.getElementById('pdpShortDesc');
  const pdpMainImg = document.getElementById('pdpMainImg');
  const pdpThumbnailsStrip = document.getElementById('pdpThumbnailsStrip');
  const pdpPriceContent = document.getElementById('pdpPriceContent');
  const pdpWhatsappBtn = document.getElementById('pdpWhatsappBtn');
  const pdpSpecsGrid = document.getElementById('pdpSpecsGrid');
  const pdpFullDesc = document.getElementById('pdpFullDesc');
  const pdpRelatedGrid = document.getElementById('pdpRelatedGrid');
  const pdpZoomBtn = document.getElementById('pdpZoomBtn');

  // Category alias mapping for backward & forward compatibility
  const categoryAliasMap = {
    chairs: 'BC',
    kids: 'KC',
    shampoo: 'SH',
    spa: 'CH',
    fixtures: 'EQ'
  };

  // Render product card HTML helper
  function buildProductCardHtml(product) {
    const productCode = product.code || (product.specs && product.specs.code) || product.id;
    const shortDescription = product.shortDesc || (product.fullDescription ? (product.fullDescription.length > 110 ? product.fullDescription.slice(0, 107) + '...' : product.fullDescription) : `${product.categoryName} — خامات متينة وتصنيع متقن من مصنع أولاد يحيى.`);
    
    const defaultMsg = `مرحبًا، أرغب في الاستفسار عن موديل [${product.name}] (كود: ${productCode}) من مصنع أولاد يحيى.`;
    const encodedMsg = encodeURIComponent(product.whatsAppMessage || defaultMsg);
    const whatsappUrl = `https://wa.me/201064116703?text=${encodedMsg}`;

    let chipsHtml = `<span class="spec-chip">كود: ${productCode}</span>`;
    if (product.showPrice === 'Yes' && product.price) {
      chipsHtml += `<span class="spec-chip price-chip">${product.price} ج.م</span>`;
    } else {
      chipsHtml += `<span class="spec-chip">السعر عند الطلب</span>`;
    }
    if (product.featured === 'Yes') {
      chipsHtml += `<span class="spec-chip featured-chip">★ مميز</span>`;
    }

    return `
      <div class="product-card fade-up in-view" data-id="${product.id}">
        <div class="product-image-box" onclick="window.showProductDetails('${product.id}')" title="اضغط لعرض تفاصيل الموديل الكاملة">
          <span class="product-category-tag">${product.categoryName}</span>
          <img src="${product.image}" alt="${product.name}" loading="lazy" width="600" height="500" onerror="this.src='assets/images/chair-mens-classic.svg'">
        </div>
        <div class="product-body">
          <h4 class="product-title" onclick="window.showProductDetails('${product.id}')" style="cursor: pointer;">${product.name}</h4>
          <p class="product-desc">${shortDescription}</p>
          <div class="product-specs-summary">
            ${chipsHtml}
          </div>
          <div class="product-actions">
            <button type="button" class="btn btn-secondary btn-sm" onclick="window.showProductDetails('${product.id}')">
              عرض المواصفات
            </button>
            <a href="${whatsappUrl}" target="_blank" rel="noopener" class="btn btn-whatsapp btn-sm">
              استفسر عن السعر
            </a>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // RULES.md STANDARD 4 & 1: SKELETON LOADING & PAGINATION
  // ==========================================
  const catalogPagination = document.getElementById('catalogPagination');
  let currentCatalogPage = 1;
  const catalogPageSize = 12; // RULES.md Standard: 12 items per page for catalog grid
  let currentCategoryFilter = 'all';

  // Render Skeleton Loading Placeholders (Zero Blank Screens)
  function renderProductsSkeleton(count = 8) {
    if (!productsContainer) return;
    if (catalogPagination) catalogPagination.innerHTML = '';
    productsContainer.innerHTML = Array.from({ length: count }).map(() => `
      <div class="product-card skeleton-card">
        <div class="skeleton-img skeleton-shimmer"></div>
        <div class="product-body">
          <div class="skeleton-line title skeleton-shimmer"></div>
          <div class="skeleton-line desc skeleton-shimmer"></div>
          <div class="skeleton-chips">
            <div class="skeleton-chip skeleton-shimmer"></div>
            <div class="skeleton-chip skeleton-shimmer"></div>
          </div>
          <div class="skeleton-actions">
            <div class="skeleton-btn skeleton-shimmer"></div>
            <div class="skeleton-btn skeleton-shimmer"></div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Render Catalog Pagination Controls
  function renderCatalogPagination(totalItems, currentPage, pageSize) {
    if (!catalogPagination) return;
    const totalPages = Math.ceil(totalItems / pageSize);

    if (totalPages <= 1) {
      catalogPagination.innerHTML = '';
      catalogPagination.style.display = 'none';
      return;
    }

    catalogPagination.style.display = 'flex';
    const from = (currentPage - 1) * pageSize + 1;
    const to = Math.min(currentPage * pageSize, totalItems);

    let pagesHtml = '';
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
        pagesHtml += `
          <button type="button" class="pagination-btn ${p === currentPage ? 'active' : ''}" onclick="window.goToCatalogPage(${p})">
            ${p}
          </button>
        `;
      } else if (p === currentPage - 2 || p === currentPage + 2) {
        pagesHtml += `<span style="color: var(--text-muted); padding: 0 4px;">...</span>`;
      }
    }

    catalogPagination.innerHTML = `
      <div class="pagination-controls">
        <button type="button" class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="window.goToCatalogPage(${currentPage - 1})" aria-label="الصفحة السابقة">
          ← السابق
        </button>
        ${pagesHtml}
        <button type="button" class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="window.goToCatalogPage(${currentPage + 1})" aria-label="الصفحة التالية">
          التالي →
        </button>
      </div>
      <div class="pagination-info">
        عرض الموديلات من <strong>${from}</strong> إلى <strong>${to}</strong> من أصل <strong>${totalItems}</strong> موديل بالمصنع
      </div>
    `;
  }

  // Global Page Switcher
  window.goToCatalogPage = function(page) {
    currentCatalogPage = page;
    renderProducts(currentCategoryFilter, currentCatalogPage, true);
  };

  // Render Catalog Grid with Filter & Pagination
  function renderProducts(filter = 'all', page = 1, shouldScroll = false) {
    if (!productsContainer) return;
    currentCategoryFilter = filter;
    currentCatalogPage = page;

    const targetCategory = categoryAliasMap[filter] || filter;
    const filtered = targetCategory === 'all'
      ? productsData
      : productsData.filter(p => p.category === targetCategory || p.category === filter);

    if (filtered.length === 0) {
      productsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 45px 20px; color: var(--text-muted);">
          <p style="font-size: 1.1rem; margin-bottom: 14px;">جاري تجهيز وتصوير موديلات هذا القسم داخل المصنع قريباً.</p>
          <a href="https://wa.me/201064116703?text=${encodeURIComponent('مرحبًا، أرغب في الاستفسار عن الموديلات وتجهيزات الصالونات المتاحة لدى مصنع أولاد يحيى.')}" target="_blank" rel="noopener" class="btn btn-whatsapp btn-sm" style="display: inline-flex;">
            استفسر عن الموديلات المتاحة عبر واتساب
          </a>
        </div>
      `;
      if (catalogPagination) catalogPagination.style.display = 'none';
      return;
    }

    // Paginate slice
    const from = (currentCatalogPage - 1) * catalogPageSize;
    const pagedItems = filtered.slice(from, from + catalogPageSize);

    productsContainer.innerHTML = pagedItems.map(buildProductCardHtml).join('');
    renderCatalogPagination(filtered.length, currentCatalogPage, catalogPageSize);

    if (shouldScroll) {
      const targetSec = document.getElementById('products');
      if (targetSec) {
        const headerOffset = 135;
        const offsetPosition = targetSec.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    }
  }

  // Initial products render
  if (productsData.length === 0) {
    renderProductsSkeleton(8);
  } else {
    renderProducts('all', 1);
  }

  // Background Cloud Sync from Supabase (Smart Caching)
  if (typeof window !== 'undefined' && window.AySupabase) {
    window.AySupabase.getProducts().then(cloudProds => {
      if (Array.isArray(cloudProds) && cloudProds.length > 0) {
        productsData = cloudProds;
        renderProducts(currentCategoryFilter, currentCatalogPage);
      }
    }).catch(err => {
      console.debug('Cloud sync info:', err.message);
    });

    // Listen for live cache invalidations from Admin
    window.addEventListener('ay_cache_invalidated', (e) => {
      if (!e.detail || !e.detail.key || e.detail.key.startsWith('products')) {
        window.AySupabase.getProducts({ bypassCache: true }).then(cloudProds => {
          if (Array.isArray(cloudProds) && cloudProds.length > 0) {
            productsData = cloudProds;
            renderProducts(currentCategoryFilter, currentCatalogPage);
          }
        });
      }
    });
  }

  // Synchronize category selection across filter buttons & top bar chips
  function setGlobalCategoryFilter(category, shouldScroll = false) {
    const canonicalCategory = categoryAliasMap[category] || category;

    // Update filter nav buttons
    filterButtons.forEach(btn => {
      if (btn.dataset.filter === canonicalCategory || btn.dataset.filter === category) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update top category bar chips
    categoryChips.forEach(chip => {
      if (chip.dataset.category === canonicalCategory || chip.dataset.category === category) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    // If showcase is currently active, close it and return to catalog
    if (productShowcaseView && productShowcaseView.style.display !== 'none') {
      window.backToCatalog(false);
    }

    renderProducts(canonicalCategory);

    // Dynamic Category SEO Fallback (RULES.md Standard 5)
    if (category !== 'all') {
      const catObj = (window.categoriesData || []).find(c => c.id === canonicalCategory || c.id === category);
      if (catObj) {
        updateHeadSeo({
          title: catObj.seoTitle || `${catObj.name} | مصنع أولاد يحيى لتصنيع كراسي الحلاقة ومعدات الصالونات`,
          description: catObj.seoDescription || `${catObj.description} - تشكيلة متكاملة ومصنعة بأعلى معايير المتانة والضمان من مصنع أولاد يحيى.`,
          canonical: `https://awladyahya.com/#category/${catObj.id}`,
          ogTitle: `${catObj.name} | مصنع أولاد يحيى`,
          ogDesc: catObj.description
        });
      }
    } else {
      updateHeadSeo(defaultSeo);
    }

    if (shouldScroll) {
      const targetSec = document.getElementById('products');
      if (targetSec) {
        const headerOffset = 135;
        const elementPosition = targetSec.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  }

  // Filter Buttons Handler in Catalog View
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.filter;
      setGlobalCategoryFilter(category, false);
    });
  });

  // Top Category Bar Chips Handler
  categoryChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const category = chip.dataset.category;
      setGlobalCategoryFilter(category, true);
    });
  });

  // ==========================================
  // RULES.md STANDARD 5: DYNAMIC SEO & STRUCTURED DATA (JSON-LD)
  // ==========================================
  const defaultSeo = {
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
    keywords: document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '',
    canonical: 'https://awladyahya.com',
    ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '',
    ogDesc: document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '',
    ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content') || 'assets/images/hero-barber-chair.jpg'
  };

  function updateHeadSeo(data) {
    if (!data) return;
    if (data.title) document.title = data.title;

    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta && data.description) descMeta.setAttribute('content', data.description);

    const kwMeta = document.querySelector('meta[name="keywords"]');
    if (kwMeta && data.keywords) kwMeta.setAttribute('content', data.keywords);

    const canonicalEl = document.getElementById('canonicalLink');
    if (canonicalEl && data.canonical) canonicalEl.setAttribute('href', data.canonical);

    // OpenGraph Tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && (data.ogTitle || data.title)) ogTitle.setAttribute('content', data.ogTitle || data.title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && (data.ogDesc || data.description)) ogDesc.setAttribute('content', data.ogDesc || data.description);

    const ogImg = document.querySelector('meta[property="og:image"]');
    if (ogImg && data.ogImage) ogImg.setAttribute('content', data.ogImage);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl && data.canonical) ogUrl.setAttribute('content', data.canonical);

    // Twitter Tags
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle && (data.ogTitle || data.title)) twTitle.setAttribute('content', data.ogTitle || data.title);

    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc && (data.ogDesc || data.description)) twDesc.setAttribute('content', data.ogDesc || data.description);

    const twImg = document.querySelector('meta[name="twitter:image"]');
    if (twImg && data.ogImage) twImg.setAttribute('content', data.ogImage);

    if (data.googleVerification) {
      const gscMeta = document.getElementById('googleSiteVerificationMeta');
      if (gscMeta) gscMeta.setAttribute('content', data.googleVerification);
    }
  }

  // Dynamic Injection of LocalBusiness & Organization JSON-LD Schema (GEO Optimization)
  function updateBusinessJsonLd(seoData, contactData) {
    const orgSchemaScript = document.getElementById('orgSchemaJson');
    if (!orgSchemaScript) return;

    const bSchema = (seoData && seoData.businessSchema) || {};
    const nameAr = bSchema.nameAr || 'مصنع أولاد يحيى لتصنيع كراسي الحلاقة ومعدات الصالونات';
    const nameEn = bSchema.nameEn || 'Awlad Yahya Barber Chairs Factory';
    const phone = bSchema.phone || (contactData && contactData.phone) || '+201008355616';
    const whatsapp = bSchema.whatsapp || (contactData && contactData.whatsapp) || '+201064116703';
    const address = bSchema.address || (contactData && contactData.address) || 'القاهرة، جمهورية مصر العربية';
    const geoLat = bSchema.geoLat || '30.0444';
    const geoLng = bSchema.geoLng || '31.2357';
    const canonical = (seoData && seoData.canonicalUrl) || 'https://awladyahya.com';

    // Collect sameAs social links
    const sameAsList = [];
    if (bSchema.socialFacebook || (contactData && contactData.facebook)) {
      sameAsList.push(bSchema.socialFacebook || contactData.facebook);
    }
    if (bSchema.socialInstagram) sameAsList.push(bSchema.socialInstagram);
    if (bSchema.socialTelegram || (contactData && contactData.telegram)) {
      sameAsList.push(bSchema.socialTelegram || contactData.telegram);
    }
    if (bSchema.socialOther) sameAsList.push(bSchema.socialOther);
    if (whatsapp) sameAsList.push(`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`);

    // Parse existing FAQ if any
    let existingFaq = null;
    try {
      const parsed = JSON.parse(orgSchemaScript.textContent);
      if (parsed && Array.isArray(parsed['@graph'])) {
        existingFaq = parsed['@graph'].find(item => item['@type'] === 'FAQPage');
      }
    } catch (_) {}

    const graph = [
      {
        "@type": ["LocalBusiness", "Organization"],
        "@id": `${canonical}/#organization`,
        "name": nameAr,
        "alternateName": nameEn,
        "url": canonical,
        "logo": `${canonical}/assets/images/logo.svg`,
        "image": (seoData && seoData.ogImage) || `${canonical}/assets/images/hero-barber-chair.jpg`,
        "description": (seoData && (seoData.description || seoData.desc)) || "مصنع مصري متخصص ورائد في تصنيع كراسي الحلاقة الهيدروليك الفاخرة، كراسي صالونات التجميل والكوافير، أحواض غسيل الشعر، الشيزلونجات، وتجهيزات الصالونات المتكاملة بأعلى معايير المتانة والضمان المباشر.",
        "telephone": phone,
        "priceRange": "$$",
        "currenciesAccepted": "EGP",
        "paymentAccepted": "Cash, Bank Transfer, Vodafone Cash, Instapay",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": address,
          "addressLocality": "القاهرة",
          "addressRegion": "القاهرة",
          "addressCountry": "EG"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": geoLat,
          "longitude": geoLng
        },
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
            "opens": "09:00",
            "closes": "20:00"
          }
        ],
        "sameAs": sameAsList
      }
    ];

    if (existingFaq) {
      graph.push(existingFaq);
    }

    orgSchemaScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": graph
    }, null, 2);
  }

  // Load custom SEO / GSC settings from database
  if (typeof window !== 'undefined' && window.AySupabase) {
    Promise.all([
      window.AySupabase.getSiteContent('seo').catch(() => null),
      window.AySupabase.getSiteContent('contact').catch(() => null)
    ]).then(([seoData, contactData]) => {
      if (seoData) {
        if (seoData.title) defaultSeo.title = seoData.title;
        if (seoData.description || seoData.desc) defaultSeo.description = seoData.description || seoData.desc;
        if (seoData.keywords) defaultSeo.keywords = seoData.keywords;
        if (seoData.canonicalUrl) defaultSeo.canonical = seoData.canonicalUrl;
        if (seoData.ogImage) defaultSeo.ogImage = seoData.ogImage;
        updateHeadSeo({
          title: defaultSeo.title,
          description: defaultSeo.description,
          keywords: defaultSeo.keywords,
          canonical: defaultSeo.canonical,
          ogImage: defaultSeo.ogImage,
          googleVerification: seoData.googleVerification
        });
      }
      updateBusinessJsonLd(seoData, contactData);
    }).catch(() => {});
  }

  // ==========================================
  // 7. PRODUCT DETAILS SHOWCASE VIEW (PDP)
  // ==========================================
  window.showProductDetails = function(productId, updateHash = true) {
    const product = productsData.find(p => p.id === productId);
    if (!product || !productShowcaseView || !catalogGridView) return;

    const productCode = product.code || (product.specs && product.specs.code) || product.id;
    const catName = product.categoryName || 'كراسي ومعدات الصالونات';

    // Dynamic Fallback Title (RULES.md Standard 5)
    const fallbackTitle = `${product.name} (${productCode}) - ${catName} | مصنع أولاد يحيى`;
    const finalSeoTitle = (product.seoTitle && product.seoTitle.trim()) ? product.seoTitle.trim() : fallbackTitle;

    // Dynamic Fallback Description
    let fallbackDesc = product.shortDesc;
    if (!fallbackDesc || fallbackDesc.trim().length < 20) {
      const hydraulic = product.hydraulicPump || (product.specs && product.specs.hydraulic) || 'هيدروليك عالي التحمل';
      const leather = product.leatherType || (product.specs && product.specs.leather) || 'جلد عالي الجودة متين';
      const pricePart = (product.price && product.showPrice !== 'No') ? `بسعر ${product.price} ج.م` : 'متاح للطلب والتوريد المباشر';
      fallbackDesc = `اكتشف ${product.name} كود (${productCode}) من ${catName} بمصنع أولاد يحيى. نظام ${hydraulic} وخامات ${leather}، ${pricePart}. ضمان مصنع وتوريد لجميع المحافظات والدول العربية.`;
    }
    const finalSeoDesc = (product.seoDescription && product.seoDescription.trim()) ? product.seoDescription.trim() : fallbackDesc;

    // Dynamic OG Image
    const absoluteImg = (product.image && product.image.startsWith('http'))
      ? product.image
      : `https://awladyahya.com/${(product.image || 'assets/images/hero-barber-chair.jpg').replace(/^\/+/, '')}`;

    updateHeadSeo({
      title: finalSeoTitle,
      description: finalSeoDesc,
      keywords: product.keywords || `${product.name}, ${productCode}, ${catName}, كراسي حلاقة, كوافير, مصنع أولاد يحيى`,
      canonical: `https://awladyahya.com/#product/${product.id}`,
      ogTitle: product.name,
      ogDesc: finalSeoDesc,
      ogImage: absoluteImg
    });

    // 1. Breadcrumbs
    if (pdpBreadcrumbs) {
      pdpBreadcrumbs.innerHTML = `
        <a href="#hero">الرئيسية</a>
        <span class="breadcrumb-separator">/</span>
        <a href="javascript:void(0)" onclick="window.backToCatalog()">معرض الموديلات</a>
        <span class="breadcrumb-separator">/</span>
        <a href="javascript:void(0)" onclick="window.filterAndBackToCatalog('${product.category}')">${product.categoryName}</a>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">${product.name}</span>
      `;
    }

    // 2. Badges & Meta
    if (pdpCategoryBadge) pdpCategoryBadge.textContent = product.categoryName;
    if (pdpCodeBadge) pdpCodeBadge.textContent = `كود: ${productCode}`;
    if (pdpModelPill) pdpModelPill.textContent = `كود الموديل: ${productCode}`;
    if (pdpTitle) pdpTitle.textContent = product.name;
    if (pdpShortDesc) pdpShortDesc.textContent = shortDesc;

    // 3. Main Image & Zoom
    if (pdpMainImg) {
      pdpMainImg.src = product.image;
      pdpMainImg.alt = product.name;
    }

    if (pdpZoomBtn) {
      pdpZoomBtn.onclick = () => {
        if (window.openLightbox) {
          window.openLightbox(pdpMainImg.src, product.name, `كود الموديل: ${productCode}`);
        }
      };
    }

    // 4. Thumbnails Strip
    const allImages = (Array.isArray(product.images) && product.images.length > 0)
      ? product.images
      : [product.image];

    if (pdpThumbnailsStrip) {
      pdpThumbnailsStrip.innerHTML = '';
      if (allImages.length > 1) {
        allImages.forEach((imgSrc, idx) => {
          const thumbBtn = document.createElement('button');
          thumbBtn.type = 'button';
          thumbBtn.className = `pdp-thumb-btn ${idx === 0 ? 'active' : ''}`;
          thumbBtn.setAttribute('aria-label', `عرض زاوية الموديل رقم ${idx + 1}`);
          thumbBtn.innerHTML = `<img src="${imgSrc}" alt="${product.name} - صورة ${idx + 1}" loading="lazy">`;

          const switchImage = () => {
            if (pdpMainImg.src !== imgSrc) {
              pdpMainImg.style.opacity = '0.3';
              pdpMainImg.src = imgSrc;
              setTimeout(() => {
                pdpMainImg.style.opacity = '1';
              }, 120);
            }
            pdpThumbnailsStrip.querySelectorAll('.pdp-thumb-btn').forEach(b => b.classList.remove('active'));
            thumbBtn.classList.add('active');
          };

          thumbBtn.addEventListener('click', switchImage);
          thumbBtn.addEventListener('mouseenter', switchImage);
          pdpThumbnailsStrip.appendChild(thumbBtn);
        });
        pdpThumbnailsStrip.style.display = 'flex';
      } else {
        pdpThumbnailsStrip.style.display = 'none';
      }
    }

    // 5. Price Box
    if (pdpPriceContent) {
      if (product.showPrice === 'Yes' && product.price) {
        pdpPriceContent.innerHTML = `
          <div class="pdp-price-amount">
            <span>${product.price}</span>
            <span class="pdp-currency">ج.م</span>
          </div>
          <div class="pdp-price-note">سعر الموديل مباشرة من أرض المصنع — متاح أسعار وعروض خاصة للكميات وتجهيز الصالونات بالكامل.</div>
        `;
      } else {
        pdpPriceContent.innerHTML = `
          <div class="pdp-price-quote">السعر عند الطلب (يحدد حسب المواصفات والكمية)</div>
          <div class="pdp-price-note">متاح بيع قطاعي وجملة وتوريد لكافة المحافظات والدول العربية — تواصل معنا لمعرفة السعر الفوري.</div>
        `;
      }
    }

    // 6. WhatsApp Action CTA
    if (pdpWhatsappBtn) {
      const defaultMsg = `مرحبًا مصنع أولاد يحيى، أود الاستفسار وحجز موديل [${product.name}] (كود: ${productCode})${product.price ? ` بسعر ${product.price} ج.م` : ''}. برجاء إفادتي بالتفاصيل ومواعيد التسليم والشحن.`;
      const encodedMsg = encodeURIComponent(product.whatsAppMessage || defaultMsg);
      pdpWhatsappBtn.href = `https://wa.me/201064116703?text=${encodedMsg}`;
    }

    // 7. Structured Specifications Grid (Key-Value Cards)
    if (pdpSpecsGrid) {
      const specsItems = [
        { label: 'كود الموديل', value: productCode, icon: '🏷️' },
        { label: 'القسم والتصنيف', value: product.categoryName, icon: '💈' },
        { label: 'نظام الحركة والمضخة', value: product.specifications || (product.specs?.pump ? `${product.specs.pump} ${product.specs.rotation || ''}` : 'مضخة هيدروليكية فولاذية عالية التحمل، صمام أمان محكم، دوران 360 درجة'), icon: '⚙️' },
        { label: 'الشاسيه والهيكل الداخلي', value: product.materials || (product.specs?.structure ? `${product.specs.structure} — ${product.specs.foam || ''}` : 'هيكل حديدي صلب معالج حرارياً ضد الصدأ، حشوة إسفنج محقون عالي الكثافة'), icon: '🔩' },
        { label: 'الجلد والتنجيد', value: (product.specs?.leather) || 'جلد صناعي مستورد عالي الجودة معالج ضد السوائل والصبغات الكيميائية وسهل التنظيف', icon: '🧵' },
        { label: 'القاعدة والاتزان', value: (product.specs?.base) || 'قاعدة متزنة دائرية أو مربعة مطلية بطبقة نيكل كروم مقاومة للخدش والتآكل', icon: '⚖️' },
        { label: 'خيارات الألوان', value: product.availableColors || (product.specs?.colors) || 'أسود، بني، كحلي، هافان، أحمر، رمادي (مع إمكانية تنفيذ أي لون خاص حسب طلب العميل)', icon: '🎨' },
        { label: 'بلد وضمان التصنيع', value: 'جمهورية مصر العربية — مصنع أولاد يحيى (ضمان مباشر وتوافر قطع الغيار)', icon: '🏭' }
      ];

      pdpSpecsGrid.innerHTML = specsItems.map(item => `
        <div class="pdp-spec-card">
          <div class="pdp-spec-label">
            <span>${item.icon}</span>
            <span>${item.label}</span>
          </div>
          <div class="pdp-spec-value">${item.value}</div>
        </div>
      `).join('');
    }

    // 8. Full Description
    if (pdpFullDesc) {
      const fullText = product.fullDescription || product.shortDesc || `${product.name} هو أحد أرقى الموديلات التي يصنعها مصنع أولاد يحيى لتجهيز صالونات الحلاقة الرجالي ومراكز التجميل والكوافير النسائي، حيث يجمع بين راحة العميل الفائقة والمتانة العالية التي تتحمل ضغط العمل اليومي المتواصل.`;
      pdpFullDesc.innerHTML = `<p>${fullText.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
    }

    // 9. Related Products Section (3-4 Models from same category)
    if (pdpRelatedGrid) {
      pdpRelatedGrid.innerHTML = '';
      const related = productsData
        .filter(p => p.id !== product.id && p.category === product.category)
        .slice(0, 4);

      if (related.length < 4) {
        const fallbacks = productsData
          .filter(p => p.id !== product.id && !related.some(r => r.id === p.id))
          .slice(0, 4 - related.length);
        related.push(...fallbacks);
      }

      pdpRelatedGrid.innerHTML = related.map(buildProductCardHtml).join('');
    }

    // 10. Inject Dynamic Product Schema (JSON-LD) for Google & AI Engines
    const productSchemaEl = document.getElementById('productDynamicSchemaJson');
    if (productSchemaEl) {
      const allAbsoluteImgs = allImages.map(img => img.startsWith('http') ? img : `https://awladyahya.com/${img.replace(/^\/+/, '')}`);
      const schemaData = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "@id": `https://awladyahya.com/#product-${product.id}`,
        "name": product.name,
        "image": allAbsoluteImgs,
        "description": product.fullDescription || shortDesc,
        "sku": productCode,
        "mpn": productCode,
        "brand": {
          "@type": "Brand",
          "name": "مصنع أولاد يحيى - Awlad Yahya"
        },
        "manufacturer": {
          "@type": "Organization",
          "name": "مصنع أولاد يحيى لتصنيع كراسي الحلاقة ومعدات الصالونات"
        },
        "category": product.categoryName,
        "offers": {
          "@type": "Offer",
          "url": `https://awladyahya.com/#product/${product.id}`,
          "priceCurrency": "EGP",
          "price": (product.showPrice === 'Yes' && product.price) ? String(product.price).replace(/[^0-9.]/g, '') : "0",
          "priceValidUntil": "2027-12-31",
          "availability": product.status === 'Available' ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
          "itemCondition": "https://schema.org/NewCondition",
          "seller": {
            "@type": "Organization",
            "name": "مصنع أولاد يحيى"
          }
        }
      };
      productSchemaEl.textContent = JSON.stringify(schemaData, null, 2);
    }

    // 11. Switch View Visibility & Smooth Scroll
    catalogGridView.style.display = 'none';
    productShowcaseView.style.display = 'block';

    if (updateHash) {
      history.pushState(null, '', `#product/${product.id}`);
    }

    // Smooth scroll to product details container
    const productsSec = document.getElementById('products');
    if (productsSec) {
      const headerOffset = 135;
      const elementPosition = productsSec.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Back to Catalog Function
  window.backToCatalog = function(updateHash = true) {
    if (catalogGridView) catalogGridView.style.display = 'block';
    if (productShowcaseView) productShowcaseView.style.display = 'none';

    // Restore Default SEO & Clear Dynamic Product Schema
    updateHeadSeo(defaultSeo);
    const productSchemaEl = document.getElementById('productDynamicSchemaJson');
    if (productSchemaEl) {
      productSchemaEl.textContent = '{}';
    }

    if (updateHash) {
      history.pushState(null, '', '#products');
    }

    const productsSec = document.getElementById('products');
    if (productsSec) {
      const headerOffset = 135;
      const elementPosition = productsSec.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Filter and Return to Catalog
  window.filterAndBackToCatalog = function(category) {
    setGlobalCategoryFilter(category, true);
  };

  // Backward compatibility: openProductModal redirects to showProductDetails
  window.openProductModal = function(productId) {
    window.showProductDetails(productId);
  };

  // URL Hash Routing Support (#product/{id})
  function handleHashRouting() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#product/')) {
      const productId = hash.replace('#product/', '').trim();
      if (productId) {
        window.showProductDetails(productId, false);
      }
    } else if (productShowcaseView && productShowcaseView.style.display !== 'none' && hash === '#products') {
      window.backToCatalog(false);
    }
  }

  window.addEventListener('hashchange', handleHashRouting);
  // Initial check on load
  handleHashRouting();

  // ==========================================
  // 8. GALLERY & LIGHTBOX MODAL
  // ==========================================
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const src = item.dataset.image || item.querySelector('img').src;
      const title = item.dataset.title || item.querySelector('.gallery-overlay-title')?.textContent || '';
      const desc = item.dataset.desc || item.querySelector('.gallery-overlay-zoom')?.textContent || '';

      if (lightboxModal && lightboxImg) {
        lightboxImg.src = src;
        lightboxImg.alt = title;
        if (lightboxTitle) lightboxTitle.textContent = title;
        if (lightboxDesc) lightboxDesc.textContent = desc;
        lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', closeLightbox);
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        closeLightbox();
      }
    });
  }

  // Expose Lightbox globally for PDP zoom button
  window.openLightbox = function(src, title, desc) {
    if (lightboxModal && lightboxImg) {
      lightboxImg.src = src;
      lightboxImg.alt = title || '';
      if (lightboxTitle) lightboxTitle.textContent = title || '';
      if (lightboxDesc) lightboxDesc.textContent = desc || '';
      lightboxModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  // Keyboard accessibility: ESC key closes open modals or PDP showcase
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (lightboxModal && lightboxModal.classList.contains('active')) {
        closeLightbox();
      } else if (productShowcaseView && productShowcaseView.style.display !== 'none') {
        window.backToCatalog();
      }
      closeMobileNav();
    }
  });

  // ==========================================
  // 9. FAQ ACCORDION
  // ==========================================
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question-btn');
    const answer = item.querySelector('.faq-answer');

    if (questionBtn && answer) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close other FAQ items
        faqItems.forEach(other => {
          if (other !== item) {
            other.classList.remove('active');
            const otherBtn = other.querySelector('.faq-question-btn');
            const otherAnswer = other.querySelector('.faq-answer');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
            if (otherAnswer) otherAnswer.style.maxHeight = null;
          }
        });

        if (isActive) {
          item.classList.remove('active');
          questionBtn.setAttribute('aria-expanded', 'false');
          answer.style.maxHeight = null;
        } else {
          item.classList.add('active');
          questionBtn.setAttribute('aria-expanded', 'true');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    }
  });

  // ==========================================
  // 10. CONTACT FORM & WHATSAPP MESSAGE BUILDER
  // ==========================================
  const contactForm = document.getElementById('contactInquiryForm');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('clientName')?.value.trim();
      const phone = document.getElementById('clientPhone')?.value.trim();
      const business = document.getElementById('businessType')?.value.trim();
      const product = document.getElementById('requiredProduct')?.value.trim();
      const quantity = document.getElementById('orderQuantity')?.value.trim();
      const message = document.getElementById('clientMessage')?.value.trim();

      if (!name || !phone) {
        alert('يرجى كتابة الاسم ورقم الهاتف على الأقل للتواصل.');
        return;
      }

      // Build structured WhatsApp inquiry text
      let text = `*طلب استفسار جديد — مصنع أولاد يحيى*\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `👤 *الاسم:* ${name}\n`;
      text += `📞 *رقم الهاتف:* ${phone}\n`;
      if (business) text += `🏢 *نوع النشاط:* ${business}\n`;
      if (product) text += `🪑 *المنتج المطلوب:* ${product}\n`;
      if (quantity) text += `📦 *الكمية المطلوبة:* ${quantity}\n`;
      if (message) text += `📝 *ملاحظات:* ${message}\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `أرجو موافاتي بالتفاصيل والأسعار وخيارات الشحن المتاحة.`;

      const whatsappDirectUrl = `https://wa.me/201064116703?text=${encodeURIComponent(text)}`;

      // Feedback animation & open WhatsApp
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = `<span>جاري تجهيز الرسالة...</span>`;
      submitBtn.disabled = true;

      setTimeout(() => {
        window.open(whatsappDirectUrl, '_blank');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        contactForm.reset();
      }, 500);
    });
  }

});
