import api from './api';
import { storage, STORAGE_KEYS } from './localStorage';


export const transactionService = {
  // 📦 Ambil semua transaksi (sebagai pembeli atau penjual)
  async getAllTransactions() {
    if (import.meta.env.VITE_USE_MOCK_API === 'true') {
      return storage.get(STORAGE_KEYS.TRANSACTIONS) || []
    }

    try {
      const response = await api.get('/transactions');
      const data = response.data.data || response.data || [];
      return data.map(t => ({
        ...t,
        id: String(t.id),
        productId: t.product_id,
        buyerId: t.buyer_id,
        sellerId: t.seller_id,
        hargaFinal: Number(t.harga_final || 0),
        status: t.status || 'pending',
        createdAt: t.created_at,
        alamatPengiriman: t.alamat_pengiriman,
        // Field di bawah ini belum ada di DB Backend Anda, kita beri default
        ongkir: Number(t.ongkir || 0)
      }));
    } catch (error) {
      console.error('Failed to fetch transactions', error);
      return [];
    }
  },


  async getAdminTransactions() {
    if (import.meta.env.VITE_USE_MOCK_API === 'true') {
      return storage.get(STORAGE_KEYS.TRANSACTIONS) || []
    }

    try {
      const response = await api.get('/admin/transactions');
      const data = response.data.data || response.data || [];
      return data.map(t => ({
        ...t,
        id: String(t.id),
        productId: t.product_id,
        buyerId: t.buyer_id,
        sellerId: t.seller_id,
        hargaFinal: Number(t.harga_final || 0),
        status: t.status || 'pending',
        createdAt: t.created_at,
        alamatPengiriman: t.alamat_pengiriman,
        ongkir: Number(t.ongkir || 0)
      }));
    } catch (error) {
      console.error('Failed to fetch admin transactions', error);
      return [];
    }
  },


  async getTransactionsByBuyer(buyerId) {
    const transactions = await this.getAllTransactions();
    // Jika backend sudah memfilter berdasarkan user yang login, kita tinggal return
    // Tapi untuk jaga-jaga kita filter manual jika backend mengembalikan semua
    return transactions.filter(t => t.buyer_id === buyerId || t.buyerId === buyerId);
  },

  async getTransactionsBySeller() {
    if (import.meta.env.VITE_USE_MOCK_API === 'true') {
      const transactions = storage.get(STORAGE_KEYS.TRANSACTIONS) || []
      const user = JSON.parse(localStorage.getItem('user'))
      return transactions.filter(t => t.seller_id === user?.id || t.sellerId === user?.id);
    }

    try {
      const response = await api.get('/seller/orders');
      const data = response.data.data || response.data || [];
      return data.map(t => ({
        ...t,
        id: String(t.id),
        productId: t.product_id,
        buyerId: t.buyer_id,
        sellerId: t.seller_id,
        hargaFinal: Number(t.harga_final || t.price || 0),
        status: t.status || 'pending',
        createdAt: t.created_at,
        alamatPengiriman: t.alamat_pengiriman,
        ongkir: Number(t.ongkir || 0)
      }));
    } catch (error) {
      console.error('Failed to fetch seller orders', error);
      return [];
    }
  },

  // 🔍 Detail transaksi
  async getTransactionById(id) {
    try {
      const response = await api.get(`/transactions/${id}`);
      const t = response.data.data || response.data;
      if (!t) return null;
      return {
        ...t,
        productId: t.product_id || t.productId,
        buyerId: t.buyer_id || t.buyerId,
        sellerId: t.seller_id || t.sellerId,
        hargaFinal: t.harga_final || t.hargaFinal,
        createdAt: t.created_at || t.createdAt,
        alamatPengiriman: t.alamat_pengiriman || t.alamatPengiriman,
      };
    } catch (error) {
      console.error('Failed to fetch transaction detail', error);
      return null;
    }
  },

  // 📝 Buat transaksi baru (Checkout)
  async createTransaction(transactionData) {
    if (import.meta.env.VITE_USE_MOCK_API === 'true') {
      const transactions = storage.get(STORAGE_KEYS.TRANSACTIONS) || []
      const newTransaction = {
        ...transactionData,
        id: String(Date.now()),
        createdAt: new Date().toISOString()
      }
      transactions.push(newTransaction)
      storage.set(STORAGE_KEYS.TRANSACTIONS, transactions)
      return newTransaction
    }

    try {
      const response = await api.post('/transactions', {
        product_id: Number(transactionData.productId),
        seller_id: Number(transactionData.sellerId),
        price: Number(transactionData.hargaFinal || 0),
        alamat_pengiriman: transactionData.alamatPengiriman
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Failed to create transaction', error);
      throw error;
    }
  },

  // 💳 Fungsi untuk mengirim permintaan pembayaran ke server (Midtrans)
  async charge(paymentData) {
    if (import.meta.env.VITE_USE_MOCK_API === 'true') {
      const transactions = storage.get(STORAGE_KEYS.TRANSACTIONS) || [];
      const orderId = `ORDER-${Date.now()}`;
      const newTransaction = {
        ...paymentData,
        id: String(Date.now()),
        order_id: orderId,
        va_number: '8077' + Math.floor(100000000000 + Math.random() * 900000000000).toString(),
        expiry_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        harga_final: paymentData.harga_final || paymentData.price || 0,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      transactions.push(newTransaction);
      storage.set(STORAGE_KEYS.TRANSACTIONS, transactions);
      return { success: true, data: newTransaction };
    }

    try {
      const response = await api.post('/payment/charge', paymentData);
      return response.data;
    } catch (error) {
      console.error('Failed to charge payment', error);
      throw error;
    }
  },

  // 🔍 Mengambil data transaksi tunggal berdasarkan order_id dari Midtrans
  async getTransactionByOrderId(orderId) {
    if (import.meta.env.VITE_USE_MOCK_API === 'true') {
      const transactions = storage.get(STORAGE_KEYS.TRANSACTIONS) || [];
      return transactions.find(t => t.order_id === orderId);
    }

    try {
      const response = await api.get('/transactions');
      const data = response.data.data || response.data || [];
      return data.find(t => t.order_id === orderId);
    } catch (error) {
      console.error('Failed to get transaction by order id', error);
      return null;
    }
  },


  // 🔄 Update status transaksi (Pay, Ship, Complete, Retur)
  async updateTransactionStatus(id, status, additionalData = {}) {
    try {
      const response = await api.post(`/transactions/${id}/status`, {
        status,
        ...additionalData
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update transaction status', error);
      throw error;
    }
  },

  // ✅ Helper: Tandai sudah bayar
  async markAsPaid(id) {
    return this.updateTransactionStatus(id, 'paid');
  },

  // 🚚 Helper: Tandai sudah dikirim
  async markAsShipped(id, videoPacking = '') {
    return this.updateTransactionStatus(id, 'shipped', { video_packing: videoPacking });
  },

  // 🏁 Helper: Tandai selesai
  async markAsCompleted(id) {
    return this.updateTransactionStatus(id, 'completed');
  },

  // ↩️ Helper: Pengajuan Retur
  async markAsRetur(id, videoUnboxing = '') {
    return this.updateTransactionStatus(id, 'retur', { video_unboxing: videoUnboxing });
  },

  // ❌ Helper: Batalkan pesanan (hanya bisa jika belum dibayar / pending)
  async markAsCancelled(id) {
    return this.updateTransactionStatus(id, 'cancelled');
  }
};
