import { storage } from './localStorage'
import api from './api'

const SUB_STATUS_KEY   = 'thriftly_subscription_status'
const SUB_DETAIL_KEY   = 'thriftly_subscription_detail'
const SIM_EMAILS_KEY   = 'thriftly_simulated_emails'

// ── Status values ──────────────────────────────────────────────────────────────
// 'none'        → belum pernah berlangganan
// 'pending'     → sudah request, menunggu pembayaran
// 'active'      → sudah bayar / aktif
// 'expired'     → sudah expired

export const subscriptionService = {

  // ── Status lokal ─────────────────────────────────────────────────────────────
  getStatus() {
    return localStorage.getItem(SUB_STATUS_KEY) || 'none'
  },

  getDetail() {
    return storage.get(SUB_DETAIL_KEY) || null
  },

  setStatus(status, detail = {}) {
    localStorage.setItem(SUB_STATUS_KEY, status)
    storage.set(SUB_DETAIL_KEY, {
      status,
      updatedAt: new Date().toISOString(),
      ...detail,
    })
    window.dispatchEvent(new Event('subscription_status_changed'))
  },

  // ── Step 1: Buyer klik "Gas Langganan" → kirim request ke backend ─────────
  async requestSubscription(email) {
    try {
      // Coba panggil backend dulu
      const res = await api.post('/subscriptions/request', { email })
      // Simpan status pending & data dari backend
      this.setStatus('pending', {
        email,
        invoiceId: res.data?.invoice_id || `INV-${Date.now()}`,
        amount: res.data?.amount || 50000,
        expiredAt: res.data?.expired_at || null,
        paymentUrl: res.data?.payment_url || null,
      })
      return res.data
    } catch (err) {
      // Fallback simulasi jika backend belum siap
      const invoiceId = `INV-${Date.now()}`
      this.setStatus('pending', {
        email,
        invoiceId,
        amount: 50000,
        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        paymentUrl: `/subscription/payment?invoice=${invoiceId}`,
      })
      return { invoice_id: invoiceId, simulated: true }
    }
  },

  // ── Step 2: Kirim email simulasi ke mailbox ───────────────────────────────
  addSubscriptionEmail(email) {
    const detail = this.getDetail()
    const invoiceId = detail?.invoiceId || `INV-${Date.now()}`
    const amount    = detail?.amount || 50000

    this.addEmail(
      'Thriftly Premium <premium@thriftly.my.id>',
      '💌 Yuk Aktifkan Langganan Premium Kamu!',
      `Halo!\n\nTerima kasih sudah mau berlangganan Thriftly Premium.\n\nDetail pembayaran kamu:\n• Invoice: ${invoiceId}\n• Total: Rp ${amount.toLocaleString('id-ID')}\n• Berlaku hingga: 24 jam dari sekarang\n\nKlik tombol di bawah untuk menyelesaikan pembayaran.`,
      `/subscription/payment?invoice=${invoiceId}`,
      'Bayar Sekarang via Doku'
    )
  },

  // ── Step 3: Setelah bayar → aktifkan langganan ────────────────────────────
  activateSubscription(invoiceId) {
    const now = new Date()
    const expiredAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // +30 hari

    this.setStatus('active', {
      invoiceId,
      activatedAt: now.toISOString(),
      expiredAt: expiredAt.toISOString(),
    })

    // Kirim email konfirmasi aktivasi
    this.addEmail(
      'Thriftly Premium <premium@thriftly.my.id>',
      '🎉 Hore! Langganan Premium Kamu Sudah Aktif!',
      `Selamat! Langganan Thriftly Premium kamu sudah aktif.\n\n✅ Status: AKTIF\n📅 Aktif hingga: ${expiredAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}\n\nNikmati semua keuntungan member premium:\n• Prioritas tampil di halaman utama\n• Akses fitur eksklusif lebih awal\n• Badge Premium di profil kamu\n\nTerima kasih telah bergabung bersama kami! 🚀`,
      null,
      null
    )
  },

  // ── Simulated Email Inbox ─────────────────────────────────────────────────
  getEmails() {
    const emails = storage.get(SIM_EMAILS_KEY)
    if (!emails) {
      const defaults = [
        {
          id: 'welcome',
          sender: 'Thriftly Welcome <welcome@thriftly.my.id>',
          subject: 'Selamat datang di Thriftly! 🌟',
          body: 'Halo! Terima kasih telah bergabung dengan Thriftly. Temukan ribuan barang bekas berkualitas dengan harga terjangkau di sini!',
          date: 'Baru saja',
          read: false,
          actionUrl: null,
          actionText: null,
        },
      ]
      storage.set(SIM_EMAILS_KEY, defaults)
      return defaults
    }
    return emails
  },

  addEmail(sender, subject, body, actionUrl = null, actionText = null) {
    const emails = this.getEmails()
    const newEmail = {
      id: `email_${Date.now()}`,
      sender,
      subject,
      body,
      date: 'Baru saja',
      read: false,
      actionUrl,
      actionText,
    }
    emails.unshift(newEmail)
    storage.set(SIM_EMAILS_KEY, emails)
    window.dispatchEvent(new Event('simulated_emails_changed'))
    return newEmail
  },

  markAsRead(id) {
    const emails = this.getEmails()
    const updated = emails.map(e => e.id === id ? { ...e, read: true } : e)
    storage.set(SIM_EMAILS_KEY, updated)
    window.dispatchEvent(new Event('simulated_emails_changed'))
  },

  deleteEmail(id) {
    const emails = this.getEmails().filter(e => e.id !== id)
    storage.set(SIM_EMAILS_KEY, emails)
    window.dispatchEvent(new Event('simulated_emails_changed'))
  },

  clearEmails() {
    storage.remove(SIM_EMAILS_KEY)
    window.dispatchEvent(new Event('simulated_emails_changed'))
  },
}
