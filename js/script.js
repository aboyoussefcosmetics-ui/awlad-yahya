/**
 * مصنع أولاد يحيى لتصنيع كراسي الحلاقة ومعدات الصالونات | Awlad Yahya Factory
 * Production JavaScript Application
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ==========================================
  // 1. DATA DEFINITIONS: Products & Categories
  // ==========================================
  // Synchronized dynamically from data/Awlad_Yahya_Product_Catalog_Database.xlsx via js/products-data.js
  const productsData = (typeof window !== 'undefined' && Array.isArray(window.productsData) && window.productsData.length > 0)
    ? window.productsData
    : [];

  const categoriesData = (typeof window !== 'undefined' && Array.isArray(window.categoriesData))
    ? window.categoriesData
    : [];

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

  // Render Catalog Grid
  function renderProducts(filter = 'all') {
    if (!productsContainer) return;
    productsContainer.innerHTML = '';

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
      return;
    }

    productsContainer.innerHTML = filtered.map(buildProductCardHtml).join('');
  }

  // Initial products render
  renderProducts('all');

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
  // 7. PRODUCT DETAILS SHOWCASE VIEW (PDP)
  // ==========================================
  window.showProductDetails = function(productId, updateHash = true) {
    const product = productsData.find(p => p.id === productId);
    if (!product || !productShowcaseView || !catalogGridView) return;

    const productCode = product.code || (product.specs && product.specs.code) || product.id;
    const shortDesc = product.shortDesc || (product.fullDescription ? (product.fullDescription.length > 130 ? product.fullDescription.slice(0, 127) + '...' : product.fullDescription) : `${product.categoryName} مصنع وفق أعلى معايير الجودة والمتانة من مصنع أولاد يحيى.`);

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

    // 10. Switch View Visibility & Smooth Scroll
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
