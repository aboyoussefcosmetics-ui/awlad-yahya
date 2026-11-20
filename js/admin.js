/**
 * =============================================================================
 * Awlad Yahya Factory - Admin Dashboard Application Engine
 * Supports Full CRUD for 9 Modules, Supabase Cloud Sync, and Local Fallback
 * =============================================================================
 */

(function () {
  'use strict';

  // State
  let state = {
    products: [],
    categories: [],
    siteContent: {},
    media: [],
    currentTab: 'overview',
    searchQuery: '',
    categoryFilter: 'all',
    statusFilter: 'all',
    editingProductId: null,
    editingCategoryId: null
  };

  // DOM Elements
  const tabs = document.querySelectorAll('.sidebar-nav-item');
  const tabPanes = document.querySelectorAll('.admin-tab-pane');
  const pageTitle = document.getElementById('adminPageTitle');
  const dbStatusBadge = document.getElementById('dbStatusBadge');
  const toastContainer = document.getElementById('toastContainer');
  const mobileToggleBtn = document.getElementById('mobileToggleBtn');
  const adminSidebar = document.getElementById('adminSidebar');

  // ==========================================
  // 1. INITIALIZATION & DATA LOADING
  // ==========================================
  async function initDashboard() {
    initTheme();
    setupNavigation();
    setupModals();
    await loadInitialData();
    checkDatabaseConnection();
  }

  function initTheme() {
    const savedTheme = localStorage.getItem('ay_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('ay_theme', next);
      });
    }
  }

  async function loadInitialData() {
    try {
      showToast('جاري تحميل بيانات المصنع...', 'info');

      // Load Categories & Products from Supabase or Local Cache
      state.categories = await window.AySupabase.getCategories();
      state.products = await window.AySupabase.getProducts();
      state.siteContent = await window.AySupabase.getSiteContent() || {};

      // Render Modules
      renderOverview();
      renderProductsTable();
      renderCategoriesList();
      renderMediaLibrary();
      populateSiteContentForms();

      showToast('تم تحميل البيانات بنجاح!', 'success');
    } catch (err) {
      console.error('Initialization error:', err);
      showToast('حدث خطأ أثناء تحميل البيانات: ' + err.message, 'error');
    }
  }

  async function checkDatabaseConnection() {
    if (!dbStatusBadge) return;
    dbStatusBadge.innerHTML = `<span class="db-status-dot"></span> <span>جاري فحص الاتصال...</span>`;
    const res = await window.AySupabase.testConnection();

    if (res.success && !res.needsSchema) {
      dbStatusBadge.className = 'db-status-badge';
      dbStatusBadge.innerHTML = `<span class="db-status-dot"></span> <span>متصل بـ Supabase سحابياً</span>`;
    } else if (res.needsSchema) {
      dbStatusBadge.className = 'db-status-badge offline';
      dbStatusBadge.innerHTML = `<span class="db-status-dot"></span> <span>Supabase جاهز (بحاجة لإنشاء الجداول)</span>`;
    } else {
      dbStatusBadge.className = 'db-status-badge offline';
      dbStatusBadge.innerHTML = `<span class="db-status-dot"></span> <span>وضع محلي (Offline Mode)</span>`;
    }
  }

  // ==========================================
  // 2. NAVIGATION & TABS
  // ==========================================
  function setupNavigation() {
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const targetTab = tab.dataset.tab;
        switchTab(targetTab);
      });
    });

    if (mobileToggleBtn && adminSidebar) {
      mobileToggleBtn.addEventListener('click', () => {
        adminSidebar.classList.toggle('open');
      });
    }
  }

  function switchTab(tabId) {
    state.currentTab = tabId;

    tabs.forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tabId);
    });

    tabPanes.forEach(pane => {
      pane.classList.toggle('active', pane.id === `tab-${tabId}`);
    });

    // Update Header Title
    const activeTabObj = document.querySelector(`.sidebar-nav-item[data-tab="${tabId}"]`);
    if (activeTabObj && pageTitle) {
      pageTitle.innerHTML = activeTabObj.innerHTML;
    }

    if (window.innerWidth < 992 && adminSidebar) {
      adminSidebar.classList.remove('open');
    }
  }

  // ==========================================
  // 3. MODULE 0: OVERVIEW & STATS
  // ==========================================
  function renderOverview() {
    const totalCount = state.products.length;
    const availableCount = state.products.filter(p => p.status === 'Available').length;
    const featuredCount = state.products.filter(p => p.featured === 'Yes').length;
    const catsCount = state.categories.length;

    const elTotal = document.getElementById('statTotalProducts');
    const elAvailable = document.getElementById('statAvailableProducts');
    const elFeatured = document.getElementById('statFeaturedProducts');
    const elCats = document.getElementById('statTotalCategories');

    if (elTotal) elTotal.textContent = totalCount;
    if (elAvailable) elAvailable.textContent = availableCount;
    if (elFeatured) elFeatured.textContent = featuredCount;
    if (elCats) elCats.textContent = catsCount;

    // Recent 5 products in overview table
    const overviewTableBody = document.getElementById('overviewProductsList');
    if (overviewTableBody) {
      const recent = state.products.slice(0, 5);
      overviewTableBody.innerHTML = recent.map(p => `
        <tr>
          <td>
            <div class="product-row-info">
              <img src="${p.image || 'assets/images/chair-mens-classic.svg'}" class="product-thumb" alt="${p.name}">
              <div>
                <div class="product-title-text">${p.name}</div>
                <div class="product-code-sub">كود: ${p.code || p.id}</div>
              </div>
            </div>
          </td>
          <td>${p.categoryName || p.category}</td>
          <td><strong>${p.price ? p.price + ' ج.م' : 'عند الطلب'}</strong></td>
          <td>
            <span class="badge-chip ${p.status === 'Available' ? 'success' : 'danger'}">
              ${p.status === 'Available' ? 'متوفر' : 'غير متوفر'}
            </span>
          </td>
          <td>
            <button class="icon-btn" onclick="window.AyAdmin.editProduct('${p.id}')" title="تعديل">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </td>
        </tr>
      `).join('');
    }
  }

  // ==========================================
  // 4. MODULE 1: PRODUCTS MANAGEMENT
  // ==========================================
  function renderProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    let filtered = state.products;

    // Filter by Search Query
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.code && p.code.toLowerCase().includes(q)) ||
        (p.id && p.id.toLowerCase().includes(q))
      );
    }

    // Filter by Category
    if (state.categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === state.categoryFilter);
    }

    // Filter by Status
    if (state.statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === state.statusFilter);
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 40px; color: var(--admin-text-muted);">
            لم يتم العثور على موديلات مطابقة للبحث أو الفلتر.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(p => {
      const priceText = (p.showPrice === 'Yes' && p.price) ? `${p.price} ج.م` : 'عند الطلب';
      const isFeatured = p.featured === 'Yes';
      return `
        <tr>
          <td>
            <div class="product-row-info">
              <img src="${p.image || 'assets/images/chair-mens-classic.svg'}" class="product-thumb" alt="${p.name}">
              <div>
                <div class="product-title-text">${p.name}</div>
                <div class="product-code-sub">كود: ${p.code || p.id} ${isFeatured ? '★ مميز' : ''}</div>
              </div>
            </div>
          </td>
          <td>${p.categoryName || p.category}</td>
          <td><strong>${priceText}</strong></td>
          <td>
            <span class="badge-chip ${p.status === 'Available' ? 'success' : 'danger'}">
              ${p.status === 'Available' ? 'متوفر' : 'غير متوفر'}
            </span>
          </td>
          <td>${p.displayOrder || 0}</td>
          <td>
            <div class="action-btns">
              <button class="icon-btn" onclick="window.AyAdmin.editProduct('${p.id}')" title="تعديل الموديل">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="icon-btn" onclick="window.AyAdmin.duplicateProduct('${p.id}')" title="تكرار الموديل">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
              <button class="icon-btn delete" onclick="window.AyAdmin.deleteProduct('${p.id}')" title="حذف الموديل">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Add & Edit Product Modals
  function openProductModal(productId = null) {
    state.editingProductId = productId;
    const modal = document.getElementById('productEditModal');
    const titleEl = document.getElementById('productModalTitle');
    const form = document.getElementById('productEditForm');

    // Populate Category Dropdown
    const catSelect = document.getElementById('prodCategory');
    if (catSelect) {
      catSelect.innerHTML = state.categories.map(c => `
        <option value="${c.id}">${c.name}</option>
      `).join('');
    }

    if (productId) {
      const p = state.products.find(x => x.id === productId);
      if (!p) return;
      titleEl.textContent = `تعديل الموديل: ${p.name} (${p.code || p.id})`;

      document.getElementById('prodId').value = p.id;
      document.getElementById('prodCode').value = p.code || '';
      document.getElementById('prodName').value = p.name || '';
      document.getElementById('prodCategory').value = p.category || 'BC';
      document.getElementById('prodPrice').value = p.price || '';
      document.getElementById('prodShowPrice').value = p.showPrice || 'Yes';
      document.getElementById('prodStatus').value = p.status || 'Available';
      document.getElementById('prodFeatured').value = p.featured || 'No';
      document.getElementById('prodDisplayOrder').value = p.displayOrder || 0;
      document.getElementById('prodImage').value = p.image || '';
      document.getElementById('prodExtraImages').value = Array.isArray(p.images) ? p.images.slice(1).join('\n') : '';
      document.getElementById('prodShortDesc').value = p.shortDesc || '';
      document.getElementById('prodFullDesc').value = p.fullDescription || '';
      document.getElementById('prodSpecs').value = p.specifications || '';
      document.getElementById('prodMaterials').value = p.materials || '';
      document.getElementById('prodColors').value = p.availableColors || '';
      document.getElementById('prodWhatsapp').value = p.whatsAppMessage || '';
      document.getElementById('prodSeoTitle').value = p.seoTitle || '';
      document.getElementById('prodSeoDesc').value = p.seoDescription || '';
    } else {
      titleEl.textContent = 'إضافة موديل جديد للمصنع';
      form.reset();
      // Generate clean new ID
      const nextNum = state.products.length + 1;
      document.getElementById('prodId').value = `AY-NEW-${nextNum}`;
      document.getElementById('prodCode').value = `AY-${nextNum}`;
      document.getElementById('prodStatus').value = 'Available';
      document.getElementById('prodShowPrice').value = 'Yes';
    }

    modal.classList.add('active');
  }

  async function handleProductFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('prodId').value.trim();
    const code = document.getElementById('prodCode').value.trim();
    const name = document.getElementById('prodName').value.trim();
    const category = document.getElementById('prodCategory').value;
    const catObj = state.categories.find(c => c.id === category);

    const price = document.getElementById('prodPrice').value.trim();
    const showPrice = document.getElementById('prodShowPrice').value;
    const status = document.getElementById('prodStatus').value;
    const featured = document.getElementById('prodFeatured').value;
    const displayOrder = parseInt(document.getElementById('prodDisplayOrder').value, 10) || 0;

    const mainImage = document.getElementById('prodImage').value.trim();
    const extraImagesRaw = document.getElementById('prodExtraImages').value.trim();
    const extraImages = extraImagesRaw ? extraImagesRaw.split('\n').map(s => s.trim()).filter(Boolean) : [];
    const images = mainImage ? [mainImage, ...extraImages] : extraImages;

    const shortDesc = document.getElementById('prodShortDesc').value.trim();
    const fullDescription = document.getElementById('prodFullDesc').value.trim();
    const specifications = document.getElementById('prodSpecs').value.trim();
    const materials = document.getElementById('prodMaterials').value.trim();
    const availableColors = document.getElementById('prodColors').value.trim();
    const whatsAppMessage = document.getElementById('prodWhatsapp').value.trim();
    const seoTitle = document.getElementById('prodSeoTitle').value.trim();
    const seoDescription = document.getElementById('prodSeoDesc').value.trim();

    const product = {
      id,
      code,
      name,
      category,
      categoryName: catObj ? catObj.name : category,
      price,
      showPrice,
      status,
      featured,
      displayOrder,
      image: mainImage || (images[0] || ''),
      images,
      shortDesc,
      fullDescription,
      specifications,
      materials,
      availableColors,
      customizationAvailable: 'Yes',
      whatsAppMessage,
      seoTitle,
      seoDescription,
      keywords: `${name}, ${code}, مصنع أولاد يحيى`
    };

    showToast('جاري حفظ الموديل...', 'info');
    const res = await window.AySupabase.saveProduct(product);

    if (res.success) {
      showToast('تم حفظ الموديل بنجاح!', 'success');
      state.products = await window.AySupabase.getProducts();
      renderOverview();
      renderProductsTable();
      closeModal('productEditModal');
    } else {
      showToast('تعذر حفظ الموديل: ' + (res.error || 'خطأ غير معروف'), 'error');
    }
  }

  async function duplicateProduct(productId) {
    const original = state.products.find(p => p.id === productId);
    if (!original) return;

    const copy = {
      ...original,
      id: `${original.id}-COPY`,
      code: `${original.code || original.id}-COPY`,
      name: `${original.name} (نسخة)`
    };

    showToast('جاري تكرار الموديل...', 'info');
    await window.AySupabase.saveProduct(copy);
    state.products = await window.AySupabase.getProducts();
    renderOverview();
    renderProductsTable();
    showToast('تم إنشاء نسخة من الموديل بنجاح!', 'success');
  }

  async function deleteProduct(productId) {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا الموديل نهائياً؟')) return;

    showToast('جاري الحذف...', 'info');
    const res = await window.AySupabase.deleteProduct(productId);
    if (res.success) {
      showToast('تم حذف الموديل بنجاح.', 'success');
      state.products = await window.AySupabase.getProducts();
      renderOverview();
      renderProductsTable();
    } else {
      showToast('تعذر حذف الموديل.', 'error');
    }
  }

  // ==========================================
  // 5. MODULE 2: CATEGORIES MANAGEMENT
  // ==========================================
  function renderCategoriesList() {
    const container = document.getElementById('categoriesGridContainer');
    if (!container) return;

    container.innerHTML = state.categories.map(c => {
      const pCount = state.products.filter(p => p.category === c.id).length;
      return `
        <div class="admin-card" style="margin-bottom: 0;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 44px; height: 44px; border-radius: var(--radius-md); background: var(--admin-gold-subtle); border: 1px solid var(--admin-gold); display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--admin-gold);">
                ${c.id}
              </div>
              <div>
                <h4 style="font-size: 1.1rem; font-weight: 800;">${c.name}</h4>
                <span style="font-size: 0.8rem; color: var(--admin-text-muted);">${pCount} موديلات مسجلة</span>
              </div>
            </div>
            <div class="action-btns">
              <button class="icon-btn" onclick="window.AyAdmin.editCategory('${c.id}')" title="تعديل القسم">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
            </div>
          </div>
          <p style="font-size: 0.88rem; color: var(--admin-text-muted); line-height: 1.5; margin-bottom: 14px;">${c.description || 'لا يوجد وصف مضاف لهذا القسم.'}</p>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.82rem; border-top: 1px solid var(--admin-border); padding-top: 10px;">
            <span>الترتيب: <strong>${c.displayOrder || 0}</strong></span>
            <span class="badge-chip ${c.active !== false ? 'success' : 'danger'}">${c.active !== false ? 'ظاهر بالموقع' : 'مخفي'}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function openCategoryModal(catId = null) {
    state.editingCategoryId = catId;
    const modal = document.getElementById('categoryEditModal');
    const titleEl = document.getElementById('categoryModalTitle');

    if (catId) {
      const c = state.categories.find(x => x.id === catId);
      if (!c) return;
      titleEl.textContent = `تعديل قسم: ${c.name}`;
      document.getElementById('catId').value = c.id;
      document.getElementById('catId').readOnly = true;
      document.getElementById('catName').value = c.name;
      document.getElementById('catDesc').value = c.description || '';
      document.getElementById('catImage').value = c.image || '';
      document.getElementById('catOrder').value = c.displayOrder || 0;
      document.getElementById('catActive').value = c.active !== false ? 'true' : 'false';
    } else {
      titleEl.textContent = 'إضافة قسم جديد للموقع';
      document.getElementById('categoryEditForm').reset();
      document.getElementById('catId').readOnly = false;
      document.getElementById('catActive').value = 'true';
    }
    modal.classList.add('active');
  }

  async function handleCategoryFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('catId').value.trim().toUpperCase();
    const name = document.getElementById('catName').value.trim();
    const description = document.getElementById('catDesc').value.trim();
    const image = document.getElementById('catImage').value.trim();
    const displayOrder = parseInt(document.getElementById('catOrder').value, 10) || 0;
    const active = document.getElementById('catActive').value === 'true';

    const cat = { id, name, description, image, displayOrder, active, featured: false };

    showToast('جاري حفظ القسم...', 'info');
    await window.AySupabase.saveCategory(cat);
    state.categories = await window.AySupabase.getCategories();
    renderCategoriesList();
    closeModal('categoryEditModal');
    showToast('تم حفظ القسم بنجاح!', 'success');
  }

  // ==========================================
  // 6. MODULE 3: MEDIA LIBRARY
  // ==========================================
  function renderMediaLibrary() {
    const grid = document.getElementById('mediaGrid');
    if (!grid) return;

    // Collect all unique images from products and categories
    const imageSet = new Set();
    state.products.forEach(p => {
      if (p.image) imageSet.add(p.image);
      if (Array.isArray(p.images)) p.images.forEach(img => { if (img) imageSet.add(img); });
    });
    state.categories.forEach(c => {
      if (c.image) imageSet.add(c.image);
    });

    const list = Array.from(imageSet);
    grid.innerHTML = list.map(url => `
      <div class="media-item-card" onclick="window.AyAdmin.copyImageUrl('${url}')" title="اضغط لنسخ رابط الصورة">
        <div class="media-preview-box">
          <img src="${url}" loading="lazy" alt="وسائط">
        </div>
        <div class="media-filename">${url.split('/').pop()}</div>
      </div>
    `).join('');
  }

  function copyImageUrl(url) {
    navigator.clipboard.writeText(url).then(() => {
      showToast('تم نسخ مسار الصورة إلى الحافظة بنجاح!', 'success');
    }).catch(() => {
      showToast('مسار الصورة: ' + url, 'info');
    });
  }

  // ==========================================
  // 7. MODULES 4-9: SITE CONTENT CMS
  // ==========================================
  function populateSiteContentForms() {
    const c = state.siteContent || {};

    // Hero
    const hero = c.hero || {};
    setVal('cmsHeroBadge', hero.badge || '');
    setVal('cmsHeroTitle', hero.title || '');
    setVal('cmsHeroTitleGold', hero.titleGold || '');
    setVal('cmsHeroDesc', hero.desc || '');
    setVal('cmsHeroCtaWhatsapp', hero.ctaWhatsapp || '');
    setVal('cmsHeroCtaCatalog', hero.ctaCatalog || '');
    setVal('cmsHeroStat1Val', hero.stat1Val || '');
    setVal('cmsHeroStat1Label', hero.stat1Label || '');
    setVal('cmsHeroStat2Val', hero.stat2Val || '');
    setVal('cmsHeroStat2Label', hero.stat2Label || '');
    setVal('cmsHeroStat3Val', hero.stat3Val || '');
    setVal('cmsHeroStat3Label', hero.stat3Label || '');

    // About
    const about = c.about || {};
    setVal('cmsAboutTitle', about.title || '');
    setVal('cmsAboutDesc', about.desc || '');
    setVal('cmsAboutMission', about.mission || '');

    // Contact
    const contact = c.contact || {};
    setVal('cmsContactPhone', contact.phone || '');
    setVal('cmsContactWhatsapp', contact.whatsapp || '');
    setVal('cmsContactTelegram', contact.telegram || '');
    setVal('cmsContactFacebook', contact.facebook || '');
    setVal('cmsContactAddress', contact.address || '');
    setVal('cmsContactHours', contact.workingHours || '');

    // SEO
    const seo = c.seo || {};
    setVal('cmsSeoTitle', seo.title || '');
    setVal('cmsSeoDesc', seo.desc || '');
    setVal('cmsSeoKeywords', seo.keywords || '');

    // Supabase Settings
    setVal('settingSupabaseUrl', window.AySupabase.url);
    setVal('settingSupabaseKey', window.AySupabase.key);
  }

  function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
  }

  async function saveHeroCMS(e) {
    e.preventDefault();
    const data = {
      badge: document.getElementById('cmsHeroBadge').value,
      title: document.getElementById('cmsHeroTitle').value,
      titleGold: document.getElementById('cmsHeroTitleGold').value,
      desc: document.getElementById('cmsHeroDesc').value,
      ctaWhatsapp: document.getElementById('cmsHeroCtaWhatsapp').value,
      ctaCatalog: document.getElementById('cmsHeroCtaCatalog').value,
      stat1Val: document.getElementById('cmsHeroStat1Val').value,
      stat1Label: document.getElementById('cmsHeroStat1Label').value,
      stat2Val: document.getElementById('cmsHeroStat2Val').value,
      stat2Label: document.getElementById('cmsHeroStat2Label').value,
      stat3Val: document.getElementById('cmsHeroStat3Val').value,
      stat3Label: document.getElementById('cmsHeroStat3Label').value
    };

    showToast('جاري حفظ الصفحة الرئيسية...', 'info');
    await window.AySupabase.saveSiteContent('hero', data);
    showToast('تم حفظ إعدادات الصفحة الرئيسية بنجاح!', 'success');
  }

  async function saveAboutCMS(e) {
    e.preventDefault();
    const data = {
      title: document.getElementById('cmsAboutTitle').value,
      desc: document.getElementById('cmsAboutDesc').value,
      mission: document.getElementById('cmsAboutMission').value
    };

    showToast('جاري حفظ بيانات عن المصنع...', 'info');
    await window.AySupabase.saveSiteContent('about', data);
    showToast('تم حفظ بيانات عن المصنع بنجاح!', 'success');
  }

  async function saveContactCMS(e) {
    e.preventDefault();
    const data = {
      phone: document.getElementById('cmsContactPhone').value,
      whatsapp: document.getElementById('cmsContactWhatsapp').value,
      telegram: document.getElementById('cmsContactTelegram').value,
      facebook: document.getElementById('cmsContactFacebook').value,
      address: document.getElementById('cmsContactAddress').value,
      workingHours: document.getElementById('cmsContactHours').value
    };

    showToast('جاري حفظ قنوات التواصل...', 'info');
    await window.AySupabase.saveSiteContent('contact', data);
    showToast('تم حفظ بيانات التواصل بنجاح!', 'success');
  }

  async function saveSeoCMS(e) {
    e.preventDefault();
    const data = {
      title: document.getElementById('cmsSeoTitle').value,
      desc: document.getElementById('cmsSeoDesc').value,
      keywords: document.getElementById('cmsSeoKeywords').value
    };

    showToast('جاري حفظ إعدادات SEO...', 'info');
    await window.AySupabase.saveSiteContent('seo', data);
    showToast('تم حفظ إعدادات محركات البحث بنجاح!', 'success');
  }

  // ==========================================
  // 8. SUPABASE SETTINGS & BACKUPS
  // ==========================================
  async function saveSupabaseSettings(e) {
    e.preventDefault();
    const url = document.getElementById('settingSupabaseUrl').value.trim();
    const key = document.getElementById('settingSupabaseKey').value.trim();

    window.AySupabase.setCredentials(url, key);
    showToast('تم حفظ إعدادات Supabase، جاري التحقق من الاتصال...', 'info');
    await checkDatabaseConnection();
  }

  async function testSupabaseConnectionAction() {
    showToast('جاري فحص الاتصال بقاعدة بيانات Supabase...', 'info');
    const res = await window.AySupabase.testConnection();
    if (res.success && !res.needsSchema) {
      showToast(res.message, 'success');
    } else if (res.needsSchema) {
      showToast(res.message, 'info');
    } else {
      showToast(res.message, 'error');
    }
    checkDatabaseConnection();
  }

  function copySqlSchema() {
    const sqlUrl = 'data/supabase_schema.sql';
    fetch(sqlUrl)
      .then(res => res.text())
      .then(sql => {
        navigator.clipboard.writeText(sql).then(() => {
          showToast('تم نسخ كود SQL لإنشاء جداول Supabase بنجاح! الصقه في Supabase SQL Editor واضغط Run.', 'success');
        });
      })
      .catch(() => {
        showToast('ملف الـ SQL موجود في: data/supabase_schema.sql', 'info');
      });
  }

  function exportProductsDataJs() {
    const catsStr = JSON.stringify(state.categories, null, 4);
    const prodsStr = JSON.stringify(state.products, null, 4);

    const fileContent = `// =============================================================================\n` +
      `// Awlad Yahya Factory - Synchronized Product Catalog Data\n` +
      `// Exported from Awlad Yahya Admin Dashboard\n` +
      `// Export Date: ${new Date().toISOString()}\n` +
      `// =============================================================================\n\n` +
      `window.categoriesData = ${catsStr};\n\n` +
      `window.productsData = ${prodsStr};\n`;

    downloadFile(fileContent, 'products-data.js', 'text/javascript');
    showToast('تم تحميل ملف products-data.js المحدث بنجاح!', 'success');
  }

  function downloadBackupJson() {
    const backup = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      categories: state.categories,
      products: state.products,
      siteContent: state.siteContent
    };
    downloadFile(JSON.stringify(backup, null, 2), `awlad_yahya_backup_${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
    showToast('تم تحميل ملف النسخة الاحتياطية بنجاح!', 'success');
  }

  function downloadFile(content, fileName, contentType) {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ==========================================
  // 9. MODALS & TOAST UTILITIES
  // ==========================================
  function setupModals() {
    document.querySelectorAll('.admin-modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
        }
      });
    });
  }

  function closeModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.remove('active');
  }

  function showToast(message, type = 'info') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `admin-toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Search and Filter Listeners
  const searchInput = document.getElementById('productSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderProductsTable();
    });
  }

  const categoryFilterSelect = document.getElementById('productCategoryFilter');
  if (categoryFilterSelect) {
    categoryFilterSelect.addEventListener('change', (e) => {
      state.categoryFilter = e.target.value;
      renderProductsTable();
    });
  }

  const statusFilterSelect = document.getElementById('productStatusFilter');
  if (statusFilterSelect) {
    statusFilterSelect.addEventListener('change', (e) => {
      state.statusFilter = e.target.value;
      renderProductsTable();
    });
  }

  // Forms
  document.getElementById('productEditForm')?.addEventListener('submit', handleProductFormSubmit);
  document.getElementById('categoryEditForm')?.addEventListener('submit', handleCategoryFormSubmit);
  document.getElementById('cmsHeroForm')?.addEventListener('submit', saveHeroCMS);
  document.getElementById('cmsAboutForm')?.addEventListener('submit', saveAboutCMS);
  document.getElementById('cmsContactForm')?.addEventListener('submit', saveContactCMS);
  document.getElementById('cmsSeoForm')?.addEventListener('submit', saveSeoCMS);
  document.getElementById('supabaseSettingsForm')?.addEventListener('submit', saveSupabaseSettings);

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', initDashboard);

  // Public API for HTML inline handlers
  window.AyAdmin = {
    openAddProduct: () => openProductModal(null),
    editProduct: (id) => openProductModal(id),
    duplicateProduct: (id) => duplicateProduct(id),
    deleteProduct: (id) => deleteProduct(id),
    openAddCategory: () => openCategoryModal(null),
    editCategory: (id) => openCategoryModal(id),
    copyImageUrl: (url) => copyImageUrl(url),
    testSupabaseConnection: () => testSupabaseConnectionAction(),
    copySqlSchema: () => copySqlSchema(),
    exportProductsDataJs: () => exportProductsDataJs(),
    downloadBackupJson: () => downloadBackupJson(),
    closeModal: (id) => closeModal(id)
  };

})();
