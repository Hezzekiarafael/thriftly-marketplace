import api from './api';

export const blogService = {
  // 📰 Ambil semua daftar artikel
  async getAllPosts() {
    try {
      const response = await api.get('/blogs');
      const data = response.data.data || response.data || [];
      
      // Map backend data to frontend format if needed
      return data.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        excerpt: post.content.substring(0, 150).replace(/<[^>]*>?/gm, '') + '...',
        author: post.author_name || 'Tim Thriftly',
        date: post.published_at ? new Date(post.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Baru saja',
        image: post.image_url || 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1000&auto=format&fit=crop',
        category: post.category || 'General'
      }));
    } catch (error) {
      console.error('Failed to fetch blog posts', error);
      return [];
    }
  },

  // 📖 Ambil detail artikel berdasarkan ID
  async getPostById(id) {
    try {
      const response = await api.get(`/blogs/${id}`);
      const post = response.data.data || response.data;
      
      if (!post) return null;

      return {
        id: post.id,
        title: post.title,
        content: post.content,
        author: post.author_name || 'Tim Thriftly',
        date: post.published_at ? new Date(post.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Baru saja',
        image: post.image_url || 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=2000&auto=format&fit=crop',
        category: post.category || 'General'
      };
    } catch (error) {
      console.error(`Failed to fetch blog post with id ${id}`, error);
      return null;
    }
  },

  // ✍️ Tambah artikel baru (Admin)
  async createPost(postData) {
    try {
      // Format tanggal ke YYYY-MM-DD HH:mm:ss untuk Laravel
      const now = new Date();
      const formattedDate = now.getFullYear() + '-' + 
        String(now.getMonth() + 1).padStart(2, '0') + '-' + 
        String(now.getDate()).padStart(2, '0') + ' ' + 
        String(now.getHours()).padStart(2, '0') + ':' + 
        String(now.getMinutes()).padStart(2, '0') + ':' + 
        String(now.getSeconds()).padStart(2, '0');

      const response = await api.post('/blogs', {
        title: postData.title,
        content: postData.content,
        image_url: postData.image_url,
        category: postData.category,
        author_name: postData.author_name,
        published_at: postData.published_at || formattedDate
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create blog post', error);
      throw error;
    }
  },

  // 🗑️ Hapus artikel (Admin)
  async deletePost(id) {
    try {
      const response = await api.delete(`/blogs/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete blog post with id ${id}`, error);
      throw error;
    }
  }
};
