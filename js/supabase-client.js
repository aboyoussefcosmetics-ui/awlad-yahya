/**
 * =============================================================================
 * Awlad Yahya Factory - Supabase Client & Dynamic Data Synchronization
 * Engineered per RULES.md: Relational Joins, Pagination, Smart Caching & Storage
 * =============================================================================
 */

(function (window) {
  'use strict';

  // Default Supabase Project Credentials
  const DEFAULT_SUPABASE_URL = 'https://jwpfuuebitmtnlruejkv.supabase.co';
  const DEFAULT_PUBLISHABLE_KEY = 'sb_publishable_C2xiY1qcwqqX7v3n_PTdXg_CaQZT83Q';

  const STORAGE_KEY_URL = 'ay_supabase_url';
  const STORAGE_KEY_APIKEY = 'ay_supabase_key';
  const STORAGE_KEY_LOCAL_PRODUCTS = 'ay_local_products';
  const STORAGE_KEY_LOCAL_CATEGORIES = 'ay_local_categories';
  const STORAGE_KEY_LOCAL_CONTENT = 'ay_local_content';
  const STORAGE_KEY_CACHE_PREFIX = 'ay_cache_';

  class SupabaseClient {
    constructor() {
      this.url = localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_SUPABASE_URL;
      this.key = localStorage.getItem(STORAGE_KEY_APIKEY) || DEFAULT_PUBLISHABLE_KEY;
      this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      this.isConnected = false;
      this.lastError = null;

      // Smart In-Memory Caching (RULES.md Standard 3)
      this.memoryCache = new Map();
      this.cacheTtlMs = 10 * 60 * 1000; // 10 minutes default TTL for static/semi-static data

      if (typeof window !== 'undefined') {
        window.addEventListener('online', () => { this.isOnline = true; });
        window.addEventListener('offline', () => { this.isOnline = false; });
      }
    }

    // Set & Persist Credentials
    setCredentials(url, key) {
      if (url) {
        let cleanUrl = url.trim().replace(/\/+$/, '');
        cleanUrl = cleanUrl.replace(/\/rest\/v1\/?$/, '');
        this.url = cleanUrl;
        localStorage.setItem(STORAGE_KEY_URL, cleanUrl);
      }
      if (key) {
        this.key = key.trim();
        localStorage.setItem(STORAGE_KEY_APIKEY, key.trim());
      }
      this.invalidateCache();
    }

    getRestEndpoint(table, query = '') {
      const base = this.url.replace(/\/+$/, '');
      const q = query ? (query.startsWith('?') ? query : `?${query}`) : '';
      return `${base}/rest/v1/${table}${q}`;
    }

    getStorageEndpoint(bucket, path = '') {
      const base = this.url.replace(/\/+$/, '');
      const cleanPath = path ? path.replace(/^\/+/, '') : '';
      return `${base}/storage/v1/object/${bucket}/${cleanPath}`;
    }

    getStoragePublicUrl(bucket, path) {
      const base = this.url.replace(/\/+$/, '');
      const cleanPath = path.replace(/^\/+/, '');
      return `${base}/storage/v1/object/public/${bucket}/${cleanPath}`;
    }

    getHeaders(extra = {}) {
      return {
        'apikey': this.key,
        'Authorization': `Bearer ${this.key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        ...extra
      };
    }

    // ==========================================
    // SMART CACHING LAYER (RULES.md Standard 3)
    // ==========================================
    getCache(key) {
      const now = Date.now();
      // 1. Check in-memory cache
      if (this.memoryCache.has(key)) {
        const item = this.memoryCache.get(key);
        if (item.expiry > now) {
          return item.data;
        }
        this.memoryCache.delete(key);
      }

      // 2. Check localStorage cache
      try {
        const stored = localStorage.getItem(STORAGE_KEY_CACHE_PREFIX + key);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.expiry > now) {
            this.memoryCache.set(key, parsed);
            return parsed.data;
          }
          localStorage.removeItem(STORAGE_KEY_CACHE_PREFIX + key);
        }
      } catch (e) {}

      return null;
    }

    setCache(key, data, ttlMs = this.cacheTtlMs) {
      const payload = {
        data,
        expiry: Date.now() + ttlMs
      };
      this.memoryCache.set(key, payload);
      try {
        localStorage.setItem(STORAGE_KEY_CACHE_PREFIX + key, JSON.stringify(payload));
      } catch (e) {}
    }

    invalidateCache(keyPrefix = null) {
      if (!keyPrefix) {
        this.memoryCache.clear();
        try {
          Object.keys(localStorage).forEach(k => {
            if (k.startsWith(STORAGE_KEY_CACHE_PREFIX)) localStorage.removeItem(k);
          });
        } catch (e) {}
      } else {
        for (const k of this.memoryCache.keys()) {
          if (k.startsWith(keyPrefix)) this.memoryCache.delete(k);
        }
        try {
          Object.keys(localStorage).forEach(k => {
            if (k.startsWith(STORAGE_KEY_CACHE_PREFIX + keyPrefix)) localStorage.removeItem(k);
          });
        } catch (e) {}
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ay_cache_invalidated', { detail: { key: keyPrefix } }));
      }
    }

    // Ping / Test connection
    async testConnection() {
      try {
        if (!this.url || !this.key) {
          throw new Error('يرجى تحديد رابط Supabase ومفتاح الـ API أولاً.');
        }

        const endpoint = this.getRestEndpoint('categories', 'select=id&limit=1');
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: this.getHeaders()
        });

        if (response.ok) {
          this.isConnected = true;
          this.lastError = null;
          return { success: true, status: response.status, message: 'الاتصال بـ Supabase متصل ونشط بنجاح!' };
        }

        if (response.status === 404) {
          this.isConnected = true;
          return {
            success: true,
            needsSchema: true,
            status: 404,
            message: 'تم التحقق من صحة المفتاح، ولكن جداول قاعدة البيانات لم تُنشأ بعد. يرجى تشغيل كود الـ SQL المرفق داخل Supabase SQL Editor.'
          };
        }

        const errText = await response.text();
        this.isConnected = false;
        this.lastError = errText;
        return { success: false, status: response.status, message: `خطأ في الاتصال (${response.status}): ${errText}` };
      } catch (err) {
        this.isConnected = false;
        this.lastError = err.message;
        return { success: false, message: `تعذر الاتصال بالخادم: ${err.message}` };
      }
    }

    // ==========================================
    // 1. PRODUCTS API (Relational Joins & Pagination)
    // RULES.md Standards 1 & 2
    // ==========================================
    /**
     * Fetches products with Relational Join (no N+1 queries) and optional Pagination.
     * @param {Object} options
     * @param {number|null} options.page - 1-based page number. If null, returns all items array.
     * @param {number} options.pageSize - items per page (default 12)
     * @param {string} options.category - category filter ('all' or ID like 'BC')
     * @param {string} options.status - status filter ('all', 'Available', 'Out of stock')
     * @param {string} options.search - search keyword
     * @param {boolean} options.bypassCache - force fresh fetch
     */
    async getProducts(options = {}) {
      const {
        page = null,
        pageSize = 12,
        category = 'all',
        status = 'all',
        search = '',
        bypassCache = false
      } = (typeof options === 'object' && options !== null) ? options : {};

      const cacheKey = `products_all`;
      let allProducts = bypassCache ? null : this.getCache(cacheKey);

      if (!allProducts) {
        try {
          // Relational Join to fetch related category data in a SINGLE request (No N+1)
          const endpoint = this.getRestEndpoint(
            'products',
            'select=*,categories(id,name,description,image)&order=display_order.asc'
          );
          const res = await fetch(endpoint, { headers: this.getHeaders() });
          if (res.ok) {
            const cloudData = await res.json();
            if (Array.isArray(cloudData) && cloudData.length > 0) {
              allProducts = cloudData.map(p => this.normalizeProductFromDb(p));
              this.setCache(cacheKey, allProducts, 5 * 60 * 1000); // 5 min TTL
              localStorage.setItem(STORAGE_KEY_LOCAL_PRODUCTS, JSON.stringify(allProducts));
            }
          }
        } catch (err) {
          console.warn('Supabase getProducts failed, falling back to cache:', err.message);
        }
      }

      // Fallback 1: LocalStorage cache
      if (!allProducts) {
        const cached = localStorage.getItem(STORAGE_KEY_LOCAL_PRODUCTS);
        if (cached) {
          try { allProducts = JSON.parse(cached); } catch (e) {}
        }
      }

      // Fallback 2: static catalog data
      if (!allProducts || !Array.isArray(allProducts) || allProducts.length === 0) {
        allProducts = (typeof window !== 'undefined' && Array.isArray(window.productsData))
          ? window.productsData
          : [];
      }

      // If page is not requested, return the full array (backward compatibility)
      if (page === null) {
        return allProducts;
      }

      // Apply filtering
      let filtered = [...allProducts];

      if (category && category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
      }

      if (status && status !== 'all') {
        filtered = filtered.filter(p => p.status === status);
      }

      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        filtered = filtered.filter(p =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.code && p.code.toLowerCase().includes(q)) ||
          (p.shortDesc && p.shortDesc.toLowerCase().includes(q)) ||
          (p.categoryName && p.categoryName.toLowerCase().includes(q))
        );
      }

      // Apply Pagination (RULES.md Standard 1: limit 12-20 items per page)
      const total = filtered.length;
      const validPage = Math.max(1, parseInt(page, 10) || 1);
      const validPageSize = Math.max(1, parseInt(pageSize, 10) || 12);
      const totalPages = Math.max(1, Math.ceil(total / validPageSize));
      const adjustedPage = Math.min(validPage, totalPages);
      const from = (adjustedPage - 1) * validPageSize;
      const to = from + validPageSize;
      const pagedData = filtered.slice(from, to);

      return {
        data: pagedData,
        total,
        page: adjustedPage,
        pageSize: validPageSize,
        totalPages,
        hasPrev: adjustedPage > 1,
        hasNext: adjustedPage < totalPages
      };
    }

    async saveProduct(product) {
      // 1. Update local cache immediately (Optimistic UI)
      const currentList = await this.getProducts();
      const existingIdx = currentList.findIndex(p => p.id === product.id);
      if (existingIdx >= 0) {
        currentList[existingIdx] = { ...currentList[existingIdx], ...product };
      } else {
        currentList.push(product);
      }
      localStorage.setItem(STORAGE_KEY_LOCAL_PRODUCTS, JSON.stringify(currentList));
      this.invalidateCache('products');

      // 2. Sync to Supabase
      try {
        const payload = this.normalizeProductToDb(product);
        const endpoint = this.getRestEndpoint('products', 'on_conflict=id');
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: this.getHeaders({ 'Prefer': 'resolution=merge-duplicates,return=representation' }),
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errBody = await res.text();
          console.warn('Supabase saveProduct returned non-ok:', res.status, errBody);
          return { success: true, localOnly: true, error: errBody };
        }
        return { success: true, cloudSynced: true };
      } catch (err) {
        console.warn('Supabase saveProduct error:', err.message);
        return { success: true, localOnly: true, error: err.message };
      }
    }

    async deleteProduct(productId) {
      // 1. Remove from local cache
      const currentList = await this.getProducts();
      const filtered = currentList.filter(p => p.id !== productId);
      localStorage.setItem(STORAGE_KEY_LOCAL_PRODUCTS, JSON.stringify(filtered));
      this.invalidateCache('products');

      // 2. Delete from Supabase
      try {
        const endpoint = this.getRestEndpoint('products', `id=eq.${encodeURIComponent(productId)}`);
        const res = await fetch(endpoint, {
          method: 'DELETE',
          headers: this.getHeaders()
        });
        return { success: res.ok };
      } catch (err) {
        console.warn('Supabase deleteProduct error:', err.message);
        return { success: true, localOnly: true };
      }
    }

    // ==========================================
    // 2. CATEGORIES API (Cached & Indexed)
    // ==========================================
    async getCategories(bypassCache = false) {
      const cacheKey = 'categories_all';
      let cats = bypassCache ? null : this.getCache(cacheKey);

      if (!cats) {
        try {
          const endpoint = this.getRestEndpoint('categories', 'select=*&order=display_order.asc');
          const res = await fetch(endpoint, { headers: this.getHeaders() });
          if (res.ok) {
            const cloudCats = await res.json();
            if (Array.isArray(cloudCats) && cloudCats.length > 0) {
              cats = cloudCats.map(c => this.normalizeCategoryFromDb(c));
              this.setCache(cacheKey, cats, 15 * 60 * 1000); // 15 min TTL
              localStorage.setItem(STORAGE_KEY_LOCAL_CATEGORIES, JSON.stringify(cats));
            }
          }
        } catch (err) {
          console.warn('Supabase getCategories failed, falling back:', err.message);
        }
      }

      if (!cats) {
        const cached = localStorage.getItem(STORAGE_KEY_LOCAL_CATEGORIES);
        if (cached) {
          try { cats = JSON.parse(cached); } catch (e) {}
        }
      }

      return (Array.isArray(cats) && cats.length > 0)
        ? cats
        : ((typeof window !== 'undefined' && Array.isArray(window.categoriesData)) ? window.categoriesData : []);
    }

    async saveCategory(category) {
      const currentList = await this.getCategories();
      const idx = currentList.findIndex(c => c.id === category.id);
      if (idx >= 0) {
        currentList[idx] = { ...currentList[idx], ...category };
      } else {
        currentList.push(category);
      }
      localStorage.setItem(STORAGE_KEY_LOCAL_CATEGORIES, JSON.stringify(currentList));
      this.invalidateCache('categories');

      try {
        const payload = this.normalizeCategoryToDb(category);
        const endpoint = this.getRestEndpoint('categories', 'on_conflict=id');
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: this.getHeaders({ 'Prefer': 'resolution=merge-duplicates,return=representation' }),
          body: JSON.stringify(payload)
        });
        return { success: res.ok };
      } catch (err) {
        return { success: true, localOnly: true };
      }
    }

    async deleteCategory(categoryId) {
      const currentList = await this.getCategories();
      const filtered = currentList.filter(c => c.id !== categoryId);
      localStorage.setItem(STORAGE_KEY_LOCAL_CATEGORIES, JSON.stringify(filtered));
      this.invalidateCache('categories');

      try {
        const endpoint = this.getRestEndpoint('categories', `id=eq.${encodeURIComponent(categoryId)}`);
        const res = await fetch(endpoint, { method: 'DELETE', headers: this.getHeaders() });
        return { success: res.ok };
      } catch (err) {
        return { success: true, localOnly: true };
      }
    }

    // ==========================================
    // 3. SITE CONTENT CMS (Cached)
    // ==========================================
    async getSiteContent(sectionId = null, bypassCache = false) {
      const cacheKey = sectionId ? `site_content_${sectionId}` : 'site_content_all';
      let content = bypassCache ? null : this.getCache(cacheKey);

      if (!content) {
        try {
          const query = sectionId ? `id=eq.${sectionId}&select=*` : 'select=*';
          const endpoint = this.getRestEndpoint('site_content', query);
          const res = await fetch(endpoint, { headers: this.getHeaders() });
          if (res.ok) {
            const list = await res.json();
            if (Array.isArray(list)) {
              const map = {};
              list.forEach(row => { map[row.id] = row.data; });
              content = sectionId ? map[sectionId] : map;
              this.setCache(cacheKey, content, 15 * 60 * 1000);
              localStorage.setItem(STORAGE_KEY_LOCAL_CONTENT, JSON.stringify(map));
            }
          }
        } catch (err) {}
      }

      if (!content) {
        const cached = localStorage.getItem(STORAGE_KEY_LOCAL_CONTENT);
        if (cached) {
          try {
            const map = JSON.parse(cached);
            content = sectionId ? map[sectionId] : map;
          } catch (e) {}
        }
      }

      return content;
    }

    async saveSiteContent(sectionId, data) {
      let map = {};
      try {
        map = JSON.parse(localStorage.getItem(STORAGE_KEY_LOCAL_CONTENT) || '{}');
      } catch (e) {}
      map[sectionId] = data;
      localStorage.setItem(STORAGE_KEY_LOCAL_CONTENT, JSON.stringify(map));
      this.invalidateCache(`site_content_${sectionId}`);
      this.invalidateCache('site_content_all');

      try {
        const payload = { id: sectionId, section: sectionId, data: data, updated_at: new Date().toISOString() };
        const endpoint = this.getRestEndpoint('site_content', 'on_conflict=id');
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: this.getHeaders({ 'Prefer': 'resolution=merge-duplicates,return=representation' }),
          body: JSON.stringify(payload)
        });
        return { success: res.ok };
      } catch (err) {
        return { success: true, localOnly: true };
      }
    }

    // ==========================================
    // 4. SUPABASE STORAGE (RULES.md Standard 2)
    // Uploads WebP/compressed images directly to Storage
    // ==========================================
    async uploadImageToStorage(dataUrlOrBlob, fileName, bucket = 'media') {
      try {
        let blob = dataUrlOrBlob;
        let mimeType = 'image/webp';

        if (typeof dataUrlOrBlob === 'string' && dataUrlOrBlob.startsWith('data:')) {
          const parts = dataUrlOrBlob.split(',');
          mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/webp';
          const bstr = atob(parts[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          blob = new Blob([u8arr], { type: mimeType });
        }

        const safeName = (fileName || `image_${Date.now()}.webp`).replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `uploads/${Date.now()}_${safeName}`;
        const endpoint = this.getStorageEndpoint(bucket, path);

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'apikey': this.key,
            'Authorization': `Bearer ${this.key}`,
            'Content-Type': mimeType,
            'x-upsert': 'true'
          },
          body: blob
        });

        if (res.ok) {
          const publicUrl = this.getStoragePublicUrl(bucket, path);
          return { success: true, url: publicUrl, path };
        } else {
          // If storage bucket isn't created yet or fails, fallback safely to data URL
          return { success: true, url: dataUrlOrBlob, localOnly: true };
        }
      } catch (err) {
        console.warn('Storage upload error, using local data URL:', err.message);
        return { success: true, url: dataUrlOrBlob, localOnly: true };
      }
    }

    // ==========================================
    // 5. DATA NORMALIZATION (DB <-> Frontend)
    // ==========================================
    normalizeProductFromDb(db) {
      // If categories joined object is returned, use its name
      const joinedCatName = db.categories?.name;
      return {
        id: db.id,
        code: db.code || db.id,
        name: db.name || '',
        category: db.category || 'BC',
        categoryName: joinedCatName || db.category_name || '',
        shortDesc: db.short_desc || '',
        fullDescription: db.full_description || '',
        status: db.status || 'Available',
        featured: db.featured || 'No',
        displayOrder: db.display_order || 0,
        price: db.price || '',
        showPrice: db.show_price || 'Yes',
        image: db.image || '',
        images: Array.isArray(db.images) ? db.images : (db.image ? [db.image] : []),
        specifications: db.specifications || '',
        materials: db.materials || '',
        availableColors: db.available_colors || '',
        customizationAvailable: db.customization_available || 'Yes',
        whatsAppMessage: db.whatsapp_message || '',
        seoTitle: db.seo_title || '',
        seoDescription: db.seo_description || '',
        keywords: db.keywords || ''
      };
    }

    normalizeProductToDb(p) {
      return {
        id: p.id,
        code: p.code || p.id,
        name: p.name || '',
        category: p.category || 'BC',
        category_name: p.categoryName || '',
        short_desc: p.shortDesc || '',
        full_description: p.fullDescription || '',
        status: p.status || 'Available',
        featured: p.featured || 'No',
        display_order: parseInt(p.displayOrder, 10) || 0,
        price: p.price ? String(p.price) : '',
        show_price: p.showPrice || 'Yes',
        image: p.image || (Array.isArray(p.images) && p.images[0]) || '',
        images: Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []),
        specifications: p.specifications || '',
        materials: p.materials || '',
        available_colors: p.availableColors || '',
        customization_available: p.customizationAvailable || 'Yes',
        whatsapp_message: p.whatsAppMessage || '',
        seo_title: p.seoTitle || '',
        seo_description: p.seoDescription || '',
        keywords: p.keywords || '',
        updated_at: new Date().toISOString()
      };
    }

    normalizeCategoryFromDb(c) {
      return {
        id: c.id,
        name: c.name,
        description: c.description || '',
        image: c.image || '',
        displayOrder: c.display_order || 0,
        active: c.active !== false,
        featured: c.featured === true,
        seoTitle: c.seo_title || '',
        seoDescription: c.seoDescription || ''
      };
    }

    normalizeCategoryToDb(c) {
      return {
        id: c.id,
        name: c.name,
        description: c.description || '',
        image: c.image || '',
        display_order: parseInt(c.displayOrder, 10) || 0,
        active: c.active !== false,
        featured: c.featured === true,
        seo_title: c.seoTitle || '',
        seo_description: c.seoDescription || '',
        updated_at: new Date().toISOString()
      };
    }
  }

  // Export globally
  window.AySupabase = new SupabaseClient();

})(typeof window !== 'undefined' ? window : this);
