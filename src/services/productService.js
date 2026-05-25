import api from './api'
import { storage, STORAGE_KEYS } from './localStorage'


// Fungsi penerjemah (Adapter) dari format Laravel ke format React UI
// Mapping kondisi: Frontend ID → enum value Backend
const CONDITION_TO_BACKEND = {
  'like-new': 'Bekas - Like New',
  'bagus': 'Bekas - Bagus',
  'oke': 'Bekas - Oke',
};
const toBackendCondition = (id) => CONDITION_TO_BACKEND[id] || 'Bekas - Bagus';

export const mapLaravelProduct = (p) => {
  if (!p) return null;
  const name = p.name || p.nama || p.product_name || p.nama_produk || 'Produk';
  const price = p.price || p.harga || p.harga_final || 0;
  const sellerId = p.user_id || p.seller_id || p.sellerId || 2;

  // Normalisasi kondisi agar sesuai dengan ID di CONDITIONS (like-new, bagus, oke)
  const rawValue = p.condition || p.kondisi || p.product_condition || p.status_barang || null;
  const slug = String(rawValue || 'bagus').toLowerCase().trim();

  let rawKondisi = 'bagus'; // default
  if (slug.includes('like') || slug.includes('new') || slug.includes('baru') || slug.includes('excellent')) {
    rawKondisi = 'like-new';
  } else if (slug.includes('oke') || slug.includes('ok') || slug.includes('fair')) {
    rawKondisi = 'oke';
  } else if (slug.includes('bagus') || slug.includes('good')) {
    rawKondisi = 'bagus';
  }


  return {
    id: p.id,
    sellerId: Number(sellerId),
    tipeJual: 'titip',
    opsiHarga: 'sendiri',
    nama: name,
    harga: Number(price),
    hargaLama: null,
    kategori: p.category || p.kategori,
    kondisi: rawKondisi,
    deskripsi: p.description || p.deskripsi,
    lokasi: p.location || p.lokasi,
    isBU: Boolean(p.is_bu || p.isBU),
    stok: Number(p.stock !== undefined ? p.stock : (p.stok !== undefined ? p.stok : 1)),
    fotos: p.images || p.fotos || p.images_url || [],
    status: p.status,
    adminNote: p.admin_note || p.admin_note,
    createdAt: p.created_at || p.createdAt,
    approvedAt: p.updated_at || p.approved_at,
    soldAt: p.sold_at,
    seller: p.seller || null
  };
};

export const productService = {
  // Public Endpoint: Ambil semua produk (biasanya yang sudah approved di Backend)
  async getAllProducts() {
    if (import.meta.env.VITE_USE_MOCK_API === 'true') {
      const localProducts = storage.get(STORAGE_KEYS.PRODUCTS) || []
      return localProducts
    }

    try {
      const response = await api.get('/products')
      const data = response.data.data || response.data || []
      return data.map(mapLaravelProduct)
    } catch (error) {
      console.error('Failed to get products', error)
      return []
    }
  },


  async getBUProducts(limit = 8) {
    if (import.meta.env.VITE_USE_MOCK_API === 'true') {
      const localProducts = storage.get(STORAGE_KEYS.PRODUCTS) || []
      return localProducts.filter(p => p.isBU === true).slice(0, limit)
    }

    try {
      // Tambahkan parameter limit dan is_bu agar backend bisa membatasi query jika mendukung
      const response = await api.get('/products', { params: { is_bu: 1, limit } })
      const products = response.data.data || response.data || []
      const mapped = products.map(mapLaravelProduct)
      // Asumsi backend punya properti isBU atau kita filter manual
      return mapped.filter(p => p.isBU === true).slice(0, limit)
    } catch (error) {
      console.error('Failed to get BU products', error)
      return []
    }
  },

  async getLatestProducts(limit = 10) {
    if (import.meta.env.VITE_USE_MOCK_API === 'true') {
      const localProducts = storage.get(STORAGE_KEYS.PRODUCTS) || []
      return localProducts.slice(0, limit)
    }

    try {
      // Tambahkan parameter limit dan sort agar backend bisa membatasi query jika mendukung
      const response = await api.get('/products', { params: { limit, sort: 'latest' } })
      let products = response.data.data || response.data || []
      const mapped = products.map(mapLaravelProduct)
      return mapped.slice(0, limit)
    } catch (error) {
      console.error('Failed to get latest products', error)
      return []
    }
  },


  async getProductById(id) {
    try {
      const response = await api.get(`/products/${id}`)
      const data = response.data.data || response.data
      return mapLaravelProduct(data)
    } catch (error) {
      console.error(`Failed to get product ${id}`, error)
      return null
    }
  },

  async searchProducts(query, filters = {}) {
    try {
      // Mengirim filter / query via params URL ke backend
      const params = { query, ...filters }
      const response = await api.get('/products', { params })
      const products = response.data.data || response.data || []
      return products.map(mapLaravelProduct)
    } catch (error) {
      console.error('Search failed', error)
      return []
    }
  },

  // Protected: Ambil produk milik seller saat ini
  async getProductsBySeller() {
    try {
      const response = await api.get('/my-products')
      const data = response.data.data || response.data || []
      return data.map(mapLaravelProduct)
    } catch (error) {
      console.error('Failed to get my products', error)
      return []
    }
  },

  async createProduct(productData) {
    if (import.meta.env.VITE_USE_MOCK_API === 'true') {
      const localProducts = storage.get(STORAGE_KEYS.PRODUCTS) || []
      const newProduct = {
        ...productData,
        id: Date.now(),
        sellerId: productData.sellerId || 1,
        status: 'pending',
        createdAt: new Date().toISOString()
      }
      localProducts.push(newProduct)
      storage.set(STORAGE_KEYS.PRODUCTS, localProducts)
      return newProduct
    }

    try {
      // Mapping untuk backend format jika berbeda
      const payload = {
        name: productData.nama,
        price: productData.harga,
        category: productData.kategori,
        description: productData.deskripsi,
        location: productData.lokasi,
        // Konversi ke format enum yang diterima backend
        condition: toBackendCondition(productData.kondisi || productData.condition),
        is_bu: productData.isBU ? 1 : 0,
        images: productData.fotos,
        stock: productData.stok || 1
      };


      const response = await api.post('/products', payload)
      return mapLaravelProduct(response.data.product || response.data.data || response.data)
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Gagal menambahkan produk')
    }
  },


  async updateProduct(id, updates) {
    try {
      // Jika updates pakai format React, kita map ke format Laravel
      const payload = { ...updates };
      if (updates.nama) payload.name = updates.nama;
      if (updates.harga) payload.price = updates.harga;
      if (updates.kategori) payload.category = updates.kategori;
      if (updates.deskripsi) payload.description = updates.deskripsi;
      if (updates.lokasi) payload.location = updates.lokasi;
      if (updates.kondisi) payload.condition = updates.kondisi;
      if (updates.isBU !== undefined) payload.is_bu = updates.isBU;
      if (updates.stok !== undefined) payload.stock = updates.stok;
      if (updates.fotos) payload.images = updates.fotos;

      const response = await api.put(`/products/${id}`, payload)
      return mapLaravelProduct(response.data.product || response.data.data || response.data)
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Gagal mengubah produk')
    }
  },

  async markAsSold(id) {
    try {
      const response = await api.put(`/products/${id}/sold`)
      return mapLaravelProduct(response.data.product || response.data.data || response.data)
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Gagal menandai terjual')
    }
  },

  async deleteProduct(id) {
    try {
      await api.delete(`/products/${id}`)
      return true
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Gagal menghapus produk')
    }
  },

  // Admin Endpoints
  async getAdminProducts() {
    try {
      const response = await api.get('/admin/products')
      const products = response.data.data || response.data || []
      return products.map(mapLaravelProduct)
    } catch (error) {
      return []
    }
  },

  async getPendingProducts() {
    if (import.meta.env.VITE_USE_MOCK_API === 'true') {
      const localProducts = storage.get(STORAGE_KEYS.PRODUCTS) || []
      return localProducts.filter(p => p.status === 'pending')
    }

    try {
      const response = await api.get('/admin/products')
      const products = response.data.data || response.data || []
      const mapped = products.map(mapLaravelProduct)
      return mapped.filter(p => p.status === 'pending')
    } catch (error) {
      return []
    }
  },


  async approveProduct(id, adminNote = '') {
    try {
      const response = await api.put(`/admin/products/${id}/approve`, { adminNote })
      return response.data
    } catch (error) {
      throw new Error('Gagal menyetujui produk')
    }
  },

  async rejectProduct(id, adminNote) {
    try {
      const response = await api.put(`/admin/products/${id}/reject`, { adminNote })
      return response.data
    } catch (error) {
      throw new Error('Gagal menolak produk')
    }
  }
}
