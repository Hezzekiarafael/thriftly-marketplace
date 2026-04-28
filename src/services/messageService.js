import api from './api';
import { storage, STORAGE_KEYS } from './localStorage';


export const messageService = {
  // 📨 Ambil daftar percakapan (Inbox)
  async getConversationsList(userId) {
    try {
      const response = await api.get('/messages');
      const rawData = response.data.data || response.data || [];
      const data = Array.isArray(rawData) ? rawData : [];

      // 🔄 GROUPING: Kelompokkan pesan berdasarkan Produk + Lawan Bicara
      const groups = {};
      
      data.forEach(m => {
        let otherId = m.other_user_id || m.otherUserId;
        if (!otherId) {
          otherId = (Number(m.sender_id) === Number(userId)) ? m.receiver_id : m.sender_id;
        }
        
        const pId = m.product_id || m.productId;
        const key = `${pId}_${otherId}`;
        
        // Cek status unread untuk pesan ini
        const isUnread = (
          (Number(m.unread_count) > 0) || 
          (m.is_read === 0 || m.is_read === false) ||
          (m.read === 0 || m.read === false)
        ) && (Number(m.receiver_id) === Number(userId));

        if (!groups[key] || new Date(m.created_at) > new Date(groups[key].timestamp)) {
          groups[key] = {
            ...m,
            productId: pId,
            otherUserId: otherId,
            lastMessage: m.message || m.last_message,
            timestamp: m.created_at || m.timestamp,
            unread: isUnread
          };
        } else if (isUnread) {
          // Jika ada satu saja pesan di grup ini yang unread, tandai grup sebagai unread
          groups[key].unread = true;
        }
      });

      return Object.values(groups).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error('Failed to fetch conversations', error);
      return [];
    }
  },

  // 💬 Ambil detail chat berdasarkan produk dan lawan bicara
  async getConversation(productId, userId1, userId2) {
    try {
      if (!productId || !userId2) return [];
      const response = await api.get(`/messages/${productId}/${userId2}`);
      const rawData = response.data.data || response.data || [];
      const data = Array.isArray(rawData) ? rawData : [];

      return data.map(m => ({
        ...m,
        id: m.id,
        productId: m.product_id || m.productId,
        senderId: m.sender_id || m.senderId,
        receiverId: m.receiver_id || m.receiverId,
        message: m.message,
        read: Boolean(m.is_read || m.read),
        timestamp: m.created_at || m.timestamp || m.createdAt,
      }));
    } catch (error) {
      console.error('Failed to fetch conversation', error);
      return [];
    }
  },

  // 📤 Kirim pesan baru
  async createMessage(messageData) {
    try {
      const response = await api.post('/messages', {
        product_id: messageData.productId,
        receiver_id: messageData.receiverId,
        message: messageData.message
      });
      return response.data;
    } catch (error) {
      console.error('Failed to send message', error);
      throw error;
    }
  },

  // 🔔 Hitung pesan belum terbaca
  async getUnreadCount(userId) {
    if (import.meta.env.VITE_USE_MOCK_API === 'true') {
      const messages = storage.get(STORAGE_KEYS.MESSAGES) || []
      return messages.filter(m => Number(m.receiverId) === Number(userId) && !m.read).length
    }

    try {
      const response = await api.get('/messages/unread/count');
      const resData = response.data;
      const target = resData.data || resData;
      
      let count = target.count ?? 
                  target.unread_count ?? 
                  target.unread_messages_count ?? 
                  target.total ?? 
                  0;
      
      count = Number(count);

      // 💡 FALLBACK: Jika backend lapor 0, coba hitung manual dari Inbox
      if (count === 0) {
        const conversations = await this.getConversationsList(userId);
        count = conversations.filter(c => c.unread).length;
      }
                    
      return count;
    } catch (error) {
      console.error('Gagal mengambil jumlah pesan baru', error);
      return 0;
    }
  },


  // ✅ Tandai sudah dibaca
  async markAllAsRead(userId, productId, otherUserId) {
    try {
      if (!productId || !otherUserId) return false;
      
      // Kirim berbagai variasi nama field agar pasti terbaca oleh Backend
      await api.post('/messages/read', {
        product_id: productId,
        other_user_id: otherUserId,
        user_id: userId, // Sertakan ID user saat ini
        productId: productId,
        otherUserId: otherUserId,
        sender_id: otherUserId // Tambahkan ini sesuai permintaan backend baru
      });
      return true;
    } catch (error) {
      console.error('Gagal menandai pesan dibaca:', error.response?.data || error.message);
      return false;
    }
  }
};
