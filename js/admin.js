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
    editingCategoryId: null,
    currentModalImages: [],
    currentProductPage: 1,
    productPageSize: 15,
    mediaPickerTarget: 'product'
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
    setupCharCountersAndPreview();
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
  // 4. MODULE 1: PRODUCTS MANAGEMENT (Pagination & Skeleton)
  // RULES.md Standards 1 & 4
  // ==========================================
  function renderProductsTableSkeleton(count = 6) {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;
    tbody.innerHTML = Array.from({ length: count }).map(() => `
      <tr>
        <td>
          <div class="product-row-info">
            <div class="admin-skeleton-box" style="width: 48px; height: 48px; border-radius: 4px;"></div>
            <div>
              <div class="admin-skeleton-box" style="width: 140px; height: 16px; margin-bottom: 6px;"></div>
              <div class="admin-skeleton-box" style="width: 80px; height: 12px;"></div>
            </div>
          </div>
        </td>
        <td><div class="admin-skeleton-box" style="width: 90px; height: 14px;"></div></td>
        <td><div class="admin-skeleton-box" style="width: 60px; height: 14px;"></div></td>
        <td><div class="admin-skeleton-box" style="width: 70px; height: 22px; border-radius: 50px;"></div></td>
        <td><div class="admin-skeleton-box" style="width: 20px; height: 14px;"></div></td>
        <td><div class="admin-skeleton-box" style="width: 80px; height: 32px;"></div></td>
      </tr>
    `).join('');
  }

  function renderProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    const paginationEl = document.getElementById('productsTablePagination');
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
      if (paginationEl) paginationEl.innerHTML = '';
      return;
    }

    // Pagination Calculation (RULES.md Standard 1: 15-20 items per page)
    const total = filtered.length;
    const totalPages = Math.ceil(total / state.productPageSize);
    if (state.currentProductPage > totalPages) state.currentProductPage = totalPages;
    if (state.currentProductPage < 1) state.currentProductPage = 1;

    const from = (state.currentProductPage - 1) * state.productPageSize;
    const paged = filtered.slice(from, from + state.productPageSize);

    tbody.innerHTML = paged.map(p => {
      const priceText = (p.showPrice === 'Yes' && p.price) ? `${p.price} ج.م` : 'عند الطلب';
      const isFeatured = p.featured === 'Yes';
      return `
        <tr>
          <td>
            <div class="product-row-info">
              <img src="${p.image || 'assets/images/chair-mens-classic.svg'}" class="product-thumb" alt="${p.name}" loading="lazy">
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

    renderProductsTablePagination(total, state.currentProductPage, state.productPageSize);
  }

  function renderProductsTablePagination(totalItems, currentPage, pageSize) {
    const paginationEl = document.getElementById('productsTablePagination');
    if (!paginationEl) return;
    const totalPages = Math.ceil(totalItems / pageSize);

    if (totalPages <= 1) {
      paginationEl.innerHTML = `
        <div class="admin-pagination-info">إجمالي: <strong>${totalItems}</strong> موديل مسجل بالمصنع</div>
      `;
      return;
    }

    const from = (currentPage - 1) * pageSize + 1;
    const to = Math.min(currentPage * pageSize, totalItems);

    let pagesHtml = '';
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
        pagesHtml += `
          <button type="button" class="admin-page-btn ${p === currentPage ? 'active' : ''}" onclick="window.AyAdmin.goToAdminProductPage(${p})">
            ${p}
          </button>
        `;
      } else if (p === currentPage - 2 || p === currentPage + 2) {
        pagesHtml += `<span style="color: var(--admin-text-muted); padding: 0 4px;">...</span>`;
      }
    }

    paginationEl.innerHTML = `
      <div class="admin-pagination-info">
        عرض الموديلات <strong>${from} - ${to}</strong> من إجمالي <strong>${totalItems}</strong> موديل
      </div>
      <div class="admin-pagination-btns">
        <button type="button" class="admin-page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="window.AyAdmin.goToAdminProductPage(${currentPage - 1})" aria-label="السابق">
          ← السابق
        </button>
        ${pagesHtml}
        <button type="button" class="admin-page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="window.AyAdmin.goToAdminProductPage(${currentPage + 1})" aria-label="التالي">
          التالي →
        </button>
      </div>
    `;
  }

  function goToAdminProductPage(page) {
    state.currentProductPage = page;
    renderProductsTable();
  }

  // ==========================================
  // PRODUCT MODAL TABS & DRAG-AND-DROP MANAGER
  // ==========================================
  function switchProductModalTab(tabKey) {
    const tabBtns = document.querySelectorAll('#productModalTabsNav .modal-tab-btn');
    const tabPanes = document.querySelectorAll('#productEditModal .modal-tab-content');

    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.modaltab === tabKey);
    });

    tabPanes.forEach(pane => {
      pane.classList.toggle('active', pane.id === `modalTab-${tabKey}`);
    });
  }

  function renderModalImagesGrid() {
    const grid = document.getElementById('prodImagesPreviewGrid');
    const countEl = document.getElementById('prodImagesCount');
    const inputMain = document.getElementById('prodImage');
    const inputExtra = document.getElementById('prodExtraImages');

    if (!grid) return;

    if (countEl) countEl.textContent = state.currentModalImages.length;

    // Sync underlying input fields
    if (inputMain) inputMain.value = state.currentModalImages[0] || '';
    if (inputExtra) inputExtra.value = state.currentModalImages.slice(1).join('\n');

    if (state.currentModalImages.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 24px; color: var(--admin-text-muted); background: var(--admin-bg-card); border-radius: var(--radius-md); border: 1px dashed var(--admin-border);">
          لم يتم تحديد أي صور لهذا الموديل حتى الآن. اسحب الصور وأفلتها في المربع أعلاه.
        </div>
      `;
      return;
    }

    grid.innerHTML = state.currentModalImages.map((imgUrl, idx) => {
      const isMain = idx === 0;
      const displayFilename = imgUrl.startsWith('data:') ? `صورة مرفوعة حديثاً (${idx + 1})` : imgUrl.split('/').pop();
      return `
        <div class="prod-image-card ${isMain ? 'is-main' : ''}">
          ${isMain ? '<span class="prod-img-badge">⭐ الرئيسية</span>' : ''}
          <div class="prod-img-preview">
            <img src="${imgUrl}" alt="صورة الموديل ${idx + 1}">
          </div>
          <div style="font-size: 0.72rem; color: var(--admin-text-muted); margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${displayFilename}">
            ${displayFilename}
          </div>
          <div class="prod-img-controls">
            ${!isMain ? `
              <button type="button" class="set-main" onclick="window.AyAdmin.setModalMainImage(${idx})" title="تعيين كصورة رئيسية للموديل">
                تعيين كرئيسية
              </button>
            ` : ''}
            <button type="button" class="remove-img" onclick="window.AyAdmin.removeModalImage(${idx})" title="حذف الصورة">
              حذف ✕
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  function setModalMainImage(index) {
    if (index <= 0 || index >= state.currentModalImages.length) return;
    const selected = state.currentModalImages.splice(index, 1)[0];
    state.currentModalImages.unshift(selected);
    renderModalImagesGrid();
    showToast('تم تعيين الصورة كصورة رئيسية للموديل!', 'info');
  }

  function removeModalImage(index) {
    if (index < 0 || index >= state.currentModalImages.length) return;
    state.currentModalImages.splice(index, 1);
    renderModalImagesGrid();
    showToast('تمت إزالة الصورة من الموديل.', 'info');
  }

  /**
   * Compresses an image file in the browser using HTML5 Canvas.
   * Resizes oversized phone/camera photos down to max 1400px,
   * converts to WebP (or JPEG fallback) at 0.82 quality.
   * Reduces 5-10MB images down to ~150-250KB while preserving crisp details.
   */
  function compressImageFile(file, maxWidth = 1400, maxHeight = 1400, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const originalSize = file.size;
      const reader = new FileReader();

      reader.onerror = () => reject(new Error('فشل قراءة ملف الصورة'));
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onerror = () => reject(new Error('فشل فك تشفير الصورة'));
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          // Scale down proportionally if larger than maximum bounds
          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Export as webp, fallback to jpeg if unsupported
          let outputType = 'image/webp';
          let dataUrl = canvas.toDataURL(outputType, quality);
          if (!dataUrl.startsWith('data:image/webp')) {
            outputType = 'image/jpeg';
            dataUrl = canvas.toDataURL(outputType, quality);
          }

          const compressedSize = Math.round((dataUrl.length * 3) / 4);

          // If original file was already smaller and optimized, keep original
          if (compressedSize >= originalSize && originalSize > 0) {
            dataUrl = readerEvent.target.result;
          }

          resolve({
            dataUrl,
            originalSize,
            compressedSize,
            width,
            height,
            name: file.name
          });
        };
        img.src = readerEvent.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  async function handleImageFiles(fileList) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);

    const validFiles = files.filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      showToast('يرجى اختيار ملفات صور صالحة (JPG, PNG, WEBP).', 'error');
      return;
    }

    showToast(`جاري معالجة وضغط ${validFiles.length} صورة تلقائياً لتسريع التصفح...`, 'info');

    let totalSavedKb = 0;
    let processedCount = 0;

    for (const file of validFiles) {
      try {
        const result = await compressImageFile(file);
        state.currentModalImages.push(result.dataUrl);
        processedCount++;

        const origKb = Math.round(result.originalSize / 1024);
        const compKb = Math.round(result.compressedSize / 1024);
        const saved = Math.max(0, origKb - compKb);
        totalSavedKb += saved;
      } catch (err) {
        console.error('Image compression error:', err);
        showToast(`تعذر ضغط الصورة ${file.name}`, 'error');
      }
    }

    if (processedCount > 0) {
      renderModalImagesGrid();
      const savedMb = (totalSavedKb / 1024).toFixed(1);
      const msg = totalSavedKb > 400
        ? `تم ضغط وإضافة ${processedCount} صورة بنجاح! ⚡ (تم توفير ${savedMb} MB لتسريع فتح الموقع)`
        : `تمت معالجة وإضافة ${processedCount} صورة للموديل بنجاح! ⚡`;
      showToast(msg, 'success');
    }
  }

  function openMediaPickerForOgImage() {
    state.mediaPickerTarget = 'ogImage';
    openMediaPickerModal('اختيار صورة المشاركة الافتراضية (OG Image)');
  }

  function openMediaPickerForProduct() {
    state.mediaPickerTarget = 'product';
    openMediaPickerModal('اختيار صورة من مكتبة الموقع للموديل');
  }

  function openMediaPickerModal(customTitle = 'اختيار صورة من مكتبة الموقع') {
    const modal = document.getElementById('mediaPickerModal');
    const grid = document.getElementById('mediaPickerGrid');
    const headerTitle = modal ? modal.querySelector('.modal-header h3') : null;
    if (headerTitle) headerTitle.textContent = customTitle;
    if (!modal || !grid) return;

    // Collect all available image paths
    const imageSet = new Set();
    state.products.forEach(p => {
      if (p.image) imageSet.add(p.image);
      if (Array.isArray(p.images)) p.images.forEach(img => { if (img) imageSet.add(img); });
    });
    state.categories.forEach(c => {
      if (c.image) imageSet.add(c.image);
    });
    if (Array.isArray(state.media)) {
      state.media.forEach(m => {
        if (typeof m === 'string') imageSet.add(m);
        else if (m && m.url) imageSet.add(m.url);
      });
    }

    const list = Array.from(imageSet);
    grid.innerHTML = list.map(url => `
      <div class="media-item-card" onclick="window.AyAdmin.handleMediaPickerSelect('${url}')" title="اضغط لاختيار هذه الصورة">
        <div class="media-preview-box">
          <img src="${url}" loading="lazy" alt="صورة">
        </div>
        <div class="media-filename">${url.startsWith('data:') ? 'صورة WebP مرفوعة' : url.split('/').pop()}</div>
      </div>
    `).join('');

    modal.classList.add('active');
  }

  function handleMediaPickerSelect(url) {
    if (state.mediaPickerTarget === 'ogImage') {
      selectMediaForOgImage(url);
    } else {
      selectMediaForProduct(url);
    }
  }

  function selectMediaForOgImage(url) {
    const canonicalInput = document.getElementById('cmsCanonicalUrl');
    const baseDomain = (canonicalInput?.value.trim() || 'https://awladyahya.com').replace(/\/+$/, '');
    let fullUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:')) {
      fullUrl = `${baseDomain}/${url.replace(/^\/+/, '')}`;
    }

    const ogInput = document.getElementById('cmsOgImage');
    const ogThumb = document.getElementById('cmsOgImageThumb');
    if (ogInput) ogInput.value = fullUrl;
    if (ogThumb) ogThumb.src = url;

    updateSeoLivePreview();
    closeModal('mediaPickerModal');
    showToast('تم تعيين صورة المشاركة الافتراضية بنجاح! ⚡', 'success');
  }

  function selectMediaForProduct(url) {
    if (!state.currentModalImages.includes(url)) {
      state.currentModalImages.push(url);
      renderModalImagesGrid();
      showToast('تمت إضافة الصورة للموديل بنجاح!', 'success');
    }
    closeModal('mediaPickerModal');
  }

  // Add & Edit Product Modals
  function openProductModal(productId = null) {
    state.editingProductId = productId;
    const modal = document.getElementById('productEditModal');
    const titleEl = document.getElementById('productModalTitle');
    const form = document.getElementById('productEditForm');

    // Reset to first tab
    switchProductModalTab('info');

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
      document.getElementById('prodShortDesc').value = p.shortDesc || '';
      document.getElementById('prodFullDesc').value = p.fullDescription || '';
      document.getElementById('prodSpecs').value = p.specifications || '';
      document.getElementById('prodMaterials').value = p.materials || '';
      document.getElementById('prodColors').value = p.availableColors || '';
      document.getElementById('prodWhatsapp').value = p.whatsAppMessage || '';
      document.getElementById('prodSeoTitle').value = p.seoTitle || '';
      document.getElementById('prodSeoDesc').value = p.seoDescription || '';

      // Initialize images array
      const existingImages = Array.isArray(p.images) && p.images.length > 0 ? [...p.images] : (p.image ? [p.image] : []);
      state.currentModalImages = existingImages;
      renderModalImagesGrid();
    } else {
      titleEl.textContent = 'إضافة موديل جديد للمصنع';
      form.reset();
      const nextNum = state.products.length + 1;
      document.getElementById('prodId').value = `AY-NEW-${nextNum}`;
      document.getElementById('prodCode').value = `AY-${nextNum}`;
      document.getElementById('prodStatus').value = 'Available';
      document.getElementById('prodShowPrice').value = 'Yes';
      state.currentModalImages = [];
      renderModalImagesGrid();
    }

    // Refresh Product SEO Counters
    const prodTitleInput = document.getElementById('prodSeoTitle');
    const prodTitleCounter = document.getElementById('prodSeoTitleCounter');
    if (prodTitleInput && prodTitleCounter) updateCounter(prodTitleInput, prodTitleCounter, 50, 60);

    const prodDescInput = document.getElementById('prodSeoDesc');
    const prodDescCounter = document.getElementById('prodSeoDescCounter');
    if (prodDescInput && prodDescCounter) updateCounter(prodDescInput, prodDescCounter, 140, 160);

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

    // Use currentModalImages
    let images = [...state.currentModalImages];
    // Fallback if user edited text manually in advanced details
    const manualMain = document.getElementById('prodImage')?.value.trim();
    if (images.length === 0 && manualMain) {
      images.push(manualMain);
    }
    const mainImage = images[0] || manualMain || '';

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
      image: mainImage,
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
  // ==========================================
  // 6. MODULE 3: MEDIA LIBRARY (WebP & Supabase Storage)
  // RULES.md Standard 2
  // ==========================================
  function renderMediaLibrary() {
    const grid = document.getElementById('mediaGrid');
    if (!grid) return;

    // Collect all unique images from products, categories, and uploaded media
    const imageSet = new Set();
    state.products.forEach(p => {
      if (p.image) imageSet.add(p.image);
      if (Array.isArray(p.images)) p.images.forEach(img => { if (img) imageSet.add(img); });
    });
    state.categories.forEach(c => {
      if (c.image) imageSet.add(c.image);
    });
    if (Array.isArray(state.media)) {
      state.media.forEach(m => {
        if (typeof m === 'string') imageSet.add(m);
        else if (m && m.url) imageSet.add(m.url);
      });
    }

    const list = Array.from(imageSet);
    grid.innerHTML = list.map(url => `
      <div class="media-item-card" onclick="window.AyAdmin.copyImageUrl('${url}')" title="اضغط لنسخ رابط الصورة">
        <div class="media-preview-box">
          <img src="${url}" loading="lazy" alt="وسائط">
        </div>
        <div class="media-filename">${url.startsWith('data:') ? 'صورة WebP مرفوعة' : url.split('/').pop()}</div>
      </div>
    `).join('');
  }

  function setupMediaLibraryUpload() {
    const dropzone = document.getElementById('mediaUploadDropzone');
    const fileInput = document.getElementById('mediaUploadFileInput');
    if (!dropzone || !fileInput) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, () => dropzone.classList.add('dragover'));
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, () => dropzone.classList.remove('dragover'));
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        handleMediaLibraryFiles(dt.files);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleMediaLibraryFiles(e.target.files);
        e.target.value = '';
      }
    });
  }

  async function handleMediaLibraryFiles(fileList) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) {
      showToast('يرجى اختيار ملفات صور صالحة (JPG, PNG, WEBP).', 'error');
      return;
    }

    showToast(`جاري تحويل وضغط ${files.length} صورة إلى صيغة WebP...`, 'info');

    let uploadedCount = 0;
    for (const file of files) {
      try {
        const compressed = await compressImageFile(file, 1600, 1600, 0.85);
        const uploadRes = await window.AySupabase.uploadImageToStorage(compressed.dataUrl, file.name.replace(/\.[^.]+$/, '') + '.webp');
        const finalUrl = uploadRes.url || compressed.dataUrl;

        state.media.push({
          url: finalUrl,
          title: file.name
        });
        uploadedCount++;
      } catch (err) {
        console.error('Media upload error:', err);
      }
    }

    if (uploadedCount > 0) {
      renderMediaLibrary();
      showToast(`تمت إضافة ${uploadedCount} صورة إلى مكتبة الوسائط بصيغة WebP بنجاح! ⚡`, 'success');
    }
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

    // SEO & GEO (RULES.md Standard 5)
    const seo = c.seo || {};
    setVal('cmsSeoTitle', seo.title || '');
    setVal('cmsSeoDesc', seo.desc || seo.description || '');
    setVal('cmsSeoKeywords', seo.keywords || '');
    setVal('cmsGoogleVerification', seo.googleVerification || '');
    setVal('cmsCanonicalUrl', seo.canonicalUrl || 'https://awladyahya.com');
    setVal('cmsOgImage', seo.ogImage || 'https://awladyahya.com/assets/images/hero-barber-chair.jpg');

    const ogThumb = document.getElementById('cmsOgImageThumb');
    if (ogThumb) ogThumb.src = seo.ogImage || 'assets/images/hero-barber-chair.jpg';

    // LocalBusiness & GEO Schema
    const schema = seo.businessSchema || {};
    setVal('schemaBusinessNameAr', schema.nameAr || 'مصنع أولاد يحيى لتصنيع كراسي الحلاقة ومعدات الصالونات');
    setVal('schemaBusinessNameEn', schema.nameEn || 'Awlad Yahya Barber Chairs Factory');
    setVal('schemaPhone', schema.phone || contact.phone || '+201008355616');
    setVal('schemaWhatsapp', schema.whatsapp || contact.whatsapp || '+201064116703');
    setVal('schemaAddress', schema.address || contact.address || 'القاهرة، جمهورية مصر العربية');
    setVal('schemaGeoLat', schema.geoLat || '30.0444');
    setVal('schemaGeoLng', schema.geoLng || '31.2357');
    setVal('schemaOpeningHours', schema.openingHours || contact.workingHours || 'السبت - الخميس: 9:00 ص - 8:00 م');
    setVal('schemaSocialFacebook', schema.socialFacebook || contact.facebook || 'https://www.facebook.com/YahiaSonsCosmetics');
    setVal('schemaSocialInstagram', schema.socialInstagram || 'https://www.instagram.com/');
    setVal('schemaSocialTelegram', schema.socialTelegram || contact.telegram || 'https://t.me/YahiaSons');
    setVal('schemaSocialOther', schema.socialOther || '');

    // Refresh SEO Character Counters and Live Preview
    const titleInput = document.getElementById('cmsSeoTitle');
    const titleCounter = document.getElementById('seoTitleCounter');
    if (titleInput && titleCounter) updateCounter(titleInput, titleCounter, 50, 60);

    const descInput = document.getElementById('cmsSeoDesc');
    const descCounter = document.getElementById('seoDescCounter');
    if (descInput && descCounter) updateCounter(descInput, descCounter, 140, 160);

    updateSeoLivePreview();

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
      title: document.getElementById('cmsSeoTitle').value.trim(),
      desc: document.getElementById('cmsSeoDesc').value.trim(),
      keywords: document.getElementById('cmsSeoKeywords').value.trim(),
      googleVerification: document.getElementById('cmsGoogleVerification')?.value.trim() || '',
      canonicalUrl: document.getElementById('cmsCanonicalUrl')?.value.trim() || 'https://awladyahya.com',
      ogImage: document.getElementById('cmsOgImage')?.value.trim() || 'https://awladyahya.com/assets/images/hero-barber-chair.jpg',
      businessSchema: {
        nameAr: document.getElementById('schemaBusinessNameAr')?.value.trim() || 'مصنع أولاد يحيى لتصنيع كراسي الحلاقة ومعدات الصالونات',
        nameEn: document.getElementById('schemaBusinessNameEn')?.value.trim() || 'Awlad Yahya Barber Chairs Factory',
        phone: document.getElementById('schemaPhone')?.value.trim() || '',
        whatsapp: document.getElementById('schemaWhatsapp')?.value.trim() || '',
        address: document.getElementById('schemaAddress')?.value.trim() || '',
        geoLat: document.getElementById('schemaGeoLat')?.value.trim() || '30.0444',
        geoLng: document.getElementById('schemaGeoLng')?.value.trim() || '31.2357',
        openingHours: document.getElementById('schemaOpeningHours')?.value.trim() || '',
        socialFacebook: document.getElementById('schemaSocialFacebook')?.value.trim() || '',
        socialInstagram: document.getElementById('schemaSocialInstagram')?.value.trim() || '',
        socialTelegram: document.getElementById('schemaSocialTelegram')?.value.trim() || '',
        socialOther: document.getElementById('schemaSocialOther')?.value.trim() || ''
      }
    };

    showToast('جاري حفظ إعدادات الـ SEO و Schema المنشأة...', 'info');
    await window.AySupabase.saveSiteContent('seo', data);
    showToast('تم حفظ إعدادات محركات البحث و Google Search Console و Schema المنشأة بنجاح! ⚡', 'success');
  }

  // ==========================================
  // SMART CHARACTER COUNTERS & SEO LIVE PREVIEW
  // ==========================================
  function setupCharCountersAndPreview() {
    // 1. Character counters
    const titleInput = document.getElementById('cmsSeoTitle');
    const titleCounter = document.getElementById('seoTitleCounter');
    const descInput = document.getElementById('cmsSeoDesc');
    const descCounter = document.getElementById('seoDescCounter');

    const prodTitleInput = document.getElementById('prodSeoTitle');
    const prodTitleCounter = document.getElementById('prodSeoTitleCounter');
    const prodDescInput = document.getElementById('prodSeoDesc');
    const prodDescCounter = document.getElementById('prodSeoDescCounter');

    if (titleInput && titleCounter) {
      titleInput.addEventListener('input', () => {
        updateCounter(titleInput, titleCounter, 50, 60);
        updateSeoLivePreview();
      });
    }

    if (descInput && descCounter) {
      descInput.addEventListener('input', () => {
        updateCounter(descInput, descCounter, 140, 160);
        updateSeoLivePreview();
      });
    }

    if (prodTitleInput && prodTitleCounter) {
      prodTitleInput.addEventListener('input', () => {
        updateCounter(prodTitleInput, prodTitleCounter, 50, 60);
      });
    }

    if (prodDescInput && prodDescCounter) {
      prodDescInput.addEventListener('input', () => {
        updateCounter(prodDescInput, prodDescCounter, 140, 160);
      });
    }

    // 2. Canonical & OG Image inputs live update
    document.getElementById('cmsCanonicalUrl')?.addEventListener('input', updateSeoLivePreview);
    document.getElementById('cmsOgImage')?.addEventListener('input', () => {
      const val = document.getElementById('cmsOgImage').value.trim();
      const thumb = document.getElementById('cmsOgImageThumb');
      if (thumb && val) thumb.src = val;
      updateSeoLivePreview();
    });

    document.getElementById('schemaBusinessNameAr')?.addEventListener('input', updateSeoLivePreview);
  }

  function updateCounter(inputEl, counterEl, minIdeal, maxIdeal) {
    if (!inputEl || !counterEl) return;
    const len = inputEl.value.trim().length;
    counterEl.className = 'char-counter';

    if (len === 0) {
      counterEl.textContent = `0 / ${maxIdeal} حرف`;
      counterEl.classList.add('counter-neutral');
    } else if (len >= minIdeal && len <= maxIdeal) {
      counterEl.textContent = `${len} / ${maxIdeal} حرف ✓ (طول مثالي ممتاز)`;
      counterEl.classList.add('counter-ideal');
    } else if (len > maxIdeal) {
      const over = len - maxIdeal;
      counterEl.textContent = `${len} / ${maxIdeal} حرف ⚠️ (تجاوز بمقدار ${over} حرف - سيتم قصه في جوجل)`;
      counterEl.classList.add('counter-warning');
    } else {
      const remaining = minIdeal - len;
      counterEl.textContent = `${len} / ${maxIdeal} حرف (يُفضل إضافة ${remaining} حرف إضافي)`;
      counterEl.classList.add('counter-neutral');
    }
  }

  function updateSeoLivePreview() {
    const titleVal = document.getElementById('cmsSeoTitle')?.value.trim();
    const descVal = document.getElementById('cmsSeoDesc')?.value.trim();
    const canonicalVal = document.getElementById('cmsCanonicalUrl')?.value.trim();
    const ogImgVal = document.getElementById('cmsOgImage')?.value.trim();
    const businessNameAr = document.getElementById('schemaBusinessNameAr')?.value.trim();

    const defaultTitle = 'مصنع أولاد يحيى لتصنيع كراسي الحلاقة ومعدات الصالونات';
    const defaultDesc = 'مصنع مصري رائد في تصنيع كراسي الحلاقة الهيدروليك الفاخرة، كراسي صالونات التجميل والكوافير، أحواض غسيل الشعر بأعلى معايير المتانة والضمان المباشر.';
    const defaultCanonical = 'https://awladyahya.com';
    const defaultOgImg = 'assets/images/hero-barber-chair.jpg';

    // Google SERP Elements
    const googleSitename = document.getElementById('googlePreviewSitename');
    const googleUrl = document.getElementById('googlePreviewUrl');
    const googleTitle = document.getElementById('googlePreviewTitle');
    const googleSnippet = document.getElementById('googlePreviewSnippet');

    if (googleSitename) googleSitename.textContent = businessNameAr || 'مصنع أولاد يحيى';
    if (googleUrl) googleUrl.textContent = (canonicalVal || defaultCanonical).replace(/\/+$/, '');
    if (googleTitle) googleTitle.textContent = titleVal || defaultTitle;
    if (googleSnippet) googleSnippet.textContent = descVal || defaultDesc;

    // Social / WhatsApp Elements
    const socialDomain = document.getElementById('socialPreviewDomain');
    const socialTitle = document.getElementById('socialPreviewTitle');
    const socialDesc = document.getElementById('socialPreviewDesc');
    const socialImg = document.getElementById('socialPreviewImg');
    const ogThumb = document.getElementById('cmsOgImageThumb');

    let cleanDomain = 'AWLADYAHYA.COM';
    try {
      if (canonicalVal) cleanDomain = new URL(canonicalVal).hostname.toUpperCase();
    } catch (_) {}

    if (socialDomain) socialDomain.textContent = cleanDomain;
    if (socialTitle) socialTitle.textContent = titleVal || defaultTitle;
    if (socialDesc) socialDesc.textContent = descVal || defaultDesc;
    if (socialImg) socialImg.src = ogImgVal || defaultOgImg;
    if (ogThumb && ogImgVal) ogThumb.src = ogImgVal;
  }

  function switchSeoPreviewTab(type) {
    const googleCard = document.getElementById('googleSerpPreview');
    const socialCard = document.getElementById('socialSerpPreview');
    const btnGoogle = document.getElementById('tabBtnGooglePreview');
    const btnSocial = document.getElementById('tabBtnSocialPreview');

    if (type === 'social') {
      if (googleCard) googleCard.style.display = 'none';
      if (socialCard) socialCard.style.display = 'block';
      btnGoogle?.classList.remove('active');
      btnSocial?.classList.add('active');
    } else {
      if (googleCard) googleCard.style.display = 'block';
      if (socialCard) socialCard.style.display = 'none';
      btnGoogle?.classList.add('active');
      btnSocial?.classList.remove('active');
    }
  }

  // ==========================================
  // RULES.md STANDARD 5: AUTOMATED SITEMAP & ROBOTS GENERATOR
  // ==========================================
  function generateSitemapsAction() {
    showToast('جاري توليد ملفات sitemap.xml و robots.txt...', 'info');

    const domain = (document.getElementById('cmsCanonicalUrl')?.value.trim() || 'https://awladyahya.com').replace(/\/+$/, '');
    const now = new Date().toISOString().slice(0, 10);

    // Build sitemap.xml
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    // 1. Homepage
    xml += `  <url>\n    <loc>${domain}/</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    // 2. Royal Chair Landing Page
    xml += `  <url>\n    <loc>${domain}/royal-chair.html</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;

    // 3. Categories
    state.categories.forEach(c => {
      xml += `  <url>\n    <loc>${domain}/#category/${c.id}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // 4. Products
    state.products.forEach(p => {
      xml += `  <url>\n    <loc>${domain}/#product/${p.id}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.85</priority>\n`;
      if (p.image) {
        const imgUrl = p.image.startsWith('http') ? p.image : `${domain}/${p.image.replace(/^\/+/, '')}`;
        xml += `    <image:image>\n      <image:loc>${imgUrl}</image:loc>\n      <image:title><![CDATA[${p.name}]]></image:title>\n    </image:image>\n`;
      }
      xml += `  </url>\n`;
    });

    xml += `</urlset>\n`;

    // Build robots.txt
    let robots = `# Awlad Yahya Barber Chairs Factory - Robots Directives\n`;
    robots += `# Optimized for Googlebot, Bingbot, and AI Search Crawlers\n\n`;
    robots += `User-agent: *\n`;
    robots += `Allow: /\n`;
    robots += `Disallow: /admin.html\n\n`;
    robots += `# AI Search Crawlers (GEO Optimization)\n`;
    robots += `User-agent: GPTBot\nAllow: /\n\n`;
    robots += `User-agent: Google-Extended\nAllow: /\n\n`;
    robots += `User-agent: ClaudeBot\nAllow: /\n\n`;
    robots += `Sitemap: ${domain}/sitemap.xml\n`;

    downloadFile(xml, 'sitemap.xml', 'application/xml');
    setTimeout(() => {
      downloadFile(robots, 'robots.txt', 'text/plain');
    }, 400);

    showToast('تم إنشاء وتحميل sitemap.xml و robots.txt بنجاح!', 'success');
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

    // Product Modal Tab Navigation
    const tabsNav = document.getElementById('productModalTabsNav');
    if (tabsNav) {
      tabsNav.querySelectorAll('.modal-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const tab = btn.dataset.modaltab;
          if (tab) switchProductModalTab(tab);
        });
      });
    }

    // Product Image Dropzone & File Input
    const dropzone = document.getElementById('prodDropzone');
    const fileInput = document.getElementById('prodFileInput');

    if (dropzone && fileInput) {
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
        });
      });

      ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => dropzone.classList.add('dragover'));
      });

      ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => dropzone.classList.remove('dragover'));
      });

      dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        if (dt && dt.files && dt.files.length > 0) {
          handleImageFiles(dt.files);
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          handleImageFiles(e.target.files);
          e.target.value = '';
        }
      });
    }

    setupMediaLibraryUpload();
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
    goToAdminProductPage: (p) => goToAdminProductPage(p),
    switchProductModalTab: (tabId) => switchProductModalTab(tabId),
    setModalMainImage: (idx) => setModalMainImage(idx),
    removeModalImage: (idx) => removeModalImage(idx),
    openMediaPickerForProduct: () => openMediaPickerForProduct(),
    openMediaPickerForOgImage: () => openMediaPickerForOgImage(),
    handleMediaPickerSelect: (url) => handleMediaPickerSelect(url),
    selectMediaForProduct: (url) => selectMediaForProduct(url),
    switchSeoPreviewTab: (type) => switchSeoPreviewTab(type),
    openAddCategory: () => openCategoryModal(null),
    editCategory: (id) => openCategoryModal(id),
    copyImageUrl: (url) => copyImageUrl(url),
    generateSitemapsAction: () => generateSitemapsAction(),
    testSupabaseConnection: () => testSupabaseConnectionAction(),
    copySqlSchema: () => copySqlSchema(),
    exportProductsDataJs: () => exportProductsDataJs(),
    downloadBackupJson: () => downloadBackupJson(),
    closeModal: (id) => closeModal(id)
  };

})();
