import api from './api'

export const newsletterService = {
  // Pendaftaran awal langganan (dikirim ke email)
  subscribe(email) {
    const frontendUrl = window.location.origin
    return api.post('/newsletter/subscribe', { email, frontend_url: frontendUrl })
  },

  // Membuka halaman checkout DOKU
  checkout(email, token) {
    const frontendUrl = window.location.origin
    return api.post('/newsletter/checkout', { email, token, frontend_url: frontendUrl })
  },

  // Mendapatkan semua subscriber (Khusus Admin Dashboard)
  getAll() {
    return api.get('/admin/newsletters')
  }
}
