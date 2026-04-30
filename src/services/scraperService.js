import api from './api'
import { CATEGORIES } from '../constants/categories'
import { CONDITIONS } from '../constants/conditions'
import { ALL_LOCATIONS } from '../constants/locations'

/**
 * Service untuk scraping data produk dari Tokopedia.
 * 
 * Flow:
 * 1. Frontend kirim URL ke backend endpoint POST /api/scrape/tokopedia
 * 2. Backend melakukan scraping (server-side, karena CORS)
 * 3. Backend return data mentah (title, price, description, images, location, condition)
 * 4. Frontend mapping data tersebut ke form fields yang sesuai
 */
export const scraperService = {

  /**
   * Validasi apakah URL merupakan link Tokopedia yang valid.
   * Kita terima semua format link Tokopedia (tokopedia.com atau tokopedia.link)
   */
  isValidTokopediaUrl(url) {
    if (!url || typeof url !== 'string') return false
    const trimmed = url.trim()
    const patterns = [
      /^https?:\/\/(www\.)?tokopedia\.com\/.+/i,
      /^https?:\/\/tokopedia\.link\/.+/i,
    ]
    return patterns.some(p => p.test(trimmed))
  },

  /**
   * Kirim URL ke backend untuk di-scrape, lalu mapping hasilnya ke format form
   */
  async scrapeFromUrl(url) {
    try {
      const response = await api.post('/scrape/tokopedia', { url: url.trim() })
      const rawData = response.data.data || response.data

      // Mapping data dari backend ke format form frontend
      return this.mapScrapedData(rawData)
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal mengambil data dari Tokopedia'
      throw new Error(message)
    }
  },

  /**
   * Mapping data mentah dari scraper ke format form AddProduct
   */
  mapScrapedData(raw) {
    const result = {
      nama: raw.title || raw.name || '',
      deskripsi: raw.description || '',
      harga: this.parsePrice(raw.price),
      kategori: this.mapCategory(raw.category || raw.title || ''),
      kondisi: this.mapCondition(raw.condition || ''),
      lokasi: this.mapLocation(raw.location || ''),
      fotos: raw.images || raw.photos || [],
      tokopediaUrl: raw.url || raw.source_url || '',
    }

    return result
  },

  /**
   * Parse harga dari string ke number (e.g. "Rp 5.000.000" → 5000000)
   */
  parsePrice(priceStr) {
    if (!priceStr) return 0
    if (typeof priceStr === 'number') return priceStr
    // Hilangkan semua karakter non-digit
    const digits = String(priceStr).replace(/[^\d]/g, '')
    return parseInt(digits, 10) || 0
  },

  /**
   * Mapping kategori dari text scraping ke ID kategori frontend
   */
  mapCategory(text) {
    if (!text) return ''
    const lower = text.toLowerCase()

    const categoryKeywords = {
      'elektronik-gadget': ['phone', 'laptop', 'tablet', 'gadget', 'electronic', 'elektronik', 'hp', 'iphone', 'samsung', 'smartphone', 'komputer', 'computer', 'kamera', 'camera', 'speaker', 'headphone', 'earphone', 'smartwatch', 'console', 'playstation', 'ps5', 'ps4', 'xbox', 'nintendo'],
      'fashion-aksesoris': ['fashion', 'baju', 'celana', 'sepatu', 'tas', 'jam', 'aksesoris', 'clothing', 'shoes', 'bag', 'watch', 'kaos', 'jacket', 'jaket', 'dress', 'kemeja', 'topi', 'sandal', 'sneakers', 'jersey'],
      'kendaraan': ['mobil', 'motor', 'sepeda', 'car', 'motorcycle', 'bicycle', 'bike', 'kendaraan', 'vehicle', 'vespa', 'honda', 'yamaha', 'suzuki', 'toyota', 'daihatsu'],
      'rumah-tangga': ['furniture', 'meja', 'kursi', 'lemari', 'sofa', 'kasur', 'dapur', 'kitchen', 'home', 'rumah', 'dekor', 'rak', 'tv', 'televisi', 'ac', 'kulkas', 'mesin cuci'],
      'hobi-olahraga': ['sport', 'olahraga', 'gym', 'fitness', 'game', 'gaming', 'hobi', 'hobby', 'collectible', 'figure', 'musik', 'music', 'gitar', 'guitar', 'sepeda', 'bola', 'raket'],
      'buku-alat-tulis': ['book', 'buku', 'novel', 'stationery', 'alat tulis', 'pensil', 'pena', 'komik', 'manga', 'majalah']
    }

    for (const [catId, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(kw => lower.includes(kw))) {
        // Pastikan catId valid
        if (CATEGORIES.find(c => c.id === catId)) {
          return catId
        }
      }
    }

    return '' // Biar user pilih manual
  },

  /**
   * Mapping kondisi dari text scraping ke ID kondisi frontend
   */
  mapCondition(text) {
    if (!text) return ''
    const lower = text.toLowerCase()

    if (lower.includes('new') || lower.includes('baru') || lower.includes('like new') || lower.includes('excellent') || lower.includes('sempurna')) {
      return 'like-new'
    }
    if (lower.includes('good') || lower.includes('bagus') || lower.includes('baik') || lower.includes('terawat')) {
      return 'bagus'
    }
    if (lower.includes('fair') || lower.includes('oke') || lower.includes('cukup') || lower.includes('used') || lower.includes('bekas')) {
      return 'oke'
    }

    return 'bagus' // Default
  },

  /**
   * Mapping lokasi dari text scraping ke ID lokasi frontend
   */
  mapLocation(text) {
    if (!text) return ''
    const lower = text.toLowerCase()

    // Coba cocokkan dengan lokasi yang ada di constants
    const match = ALL_LOCATIONS.find(loc => {
      const locName = loc.nama.toLowerCase()
      return lower.includes(locName) || locName.includes(lower)
    })

    if (match) return match.id

    // Coba partial match (nama kota saja tanpa prefix Kota/Kab)
    const partialMatch = ALL_LOCATIONS.find(loc => {
      const simpleName = loc.nama.replace(/^(Kota |Kab\. )/, '').toLowerCase()
      return lower.includes(simpleName) || simpleName.includes(lower)
    })

    return partialMatch ? partialMatch.id : ''
  }
}
