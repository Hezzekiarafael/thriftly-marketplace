import { productService } from './productService';

export const aiService = {
  async getPriceRecommendation(nama, kategori, kondisi) {
    try {
      // 1. Ambil semua produk dari database internal
      const allProducts = await productService.getAllProducts();
      
      if (!nama || nama.length < 3) return this.getDefaultRange(kategori, kondisi);

      // 2. Cari barang serupa berdasarkan kata kunci (Keyword Match)
      const keywords = nama.toLowerCase().split(' ').filter(k => k.length > 2);
      
      const similarProducts = allProducts.filter(p => {
        const pName = (p.nama || '').toLowerCase();
        const hasKeyword = keywords.some(k => pName.includes(k));
        const sameCategory = p.kategori === kategori;
        return hasKeyword || sameCategory;
      });

      // 3. Jika ketemu banyak data, ambil median harga
      if (similarProducts.length > 0) {
        const prices = similarProducts.map(p => p.harga).sort((a, b) => a - b);
        const median = prices[Math.floor(prices.length / 2)];
        const min = Math.min(...prices);
        const max = Math.max(...prices);

        return {
          recommended: median,
          min: min,
          max: max,
          reason: `Berdasarkan ${similarProducts.length} produk sejenis di database kami.`
        };
      }

      // 4. Jika database kosong, gunakan estimasi Smart Heuristic
      return this.getDefaultRange(kategori, kondisi);
    } catch (error) {
      console.error('Local Recommendation Error:', error);
      return this.getDefaultRange(kategori, kondisi);
    }
  },

  getDefaultRange(kategori, kondisi) {
    const ranges = {
      'elektronik-gadget': { rec: 1500000, min: 500000, max: 5000000 },
      'fashion-aksesoris': { rec: 150000, min: 30000, max: 500000 },
      'kendaraan': { rec: 15000000, min: 5000000, max: 100000000 },
      'rumah-tangga': { rec: 200000, min: 50000, max: 1000000 },
      'hobi-olahraga': { rec: 300000, min: 50000, max: 2000000 },
      'buku-alat-tulis': { rec: 35000, min: 10000, max: 150000 }
    };

    const data = ranges[kategori] || { rec: 100000, min: 20000, max: 500000 };
    
    // Penyesuaian berdasarkan kondisi
    const multipliers = { 'like-new': 1.0, 'bagus': 0.8, 'oke': 0.6 };
    const mult = multipliers[kondisi] || 0.8;

    return {
      recommended: Math.round(data.rec * mult),
      min: Math.round(data.min * mult),
      max: Math.round(data.max * mult),
      reason: "Estimasi berdasarkan kategori produk (Data pembanding belum cukup)."
    };
  }
};
