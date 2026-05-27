/**
 * Knowledge Base Chatbot Thriftly Marketplace
 * Semua data Q&A untuk pattern matching chatbot CS
 */

export const CHATBOT_CONFIG = {
  name: 'Thriftly CS',
  avatar: '🛍️',
  greeting: 'Halo, Kak! 👋 Selamat datang di Thriftly — Marketplace Barang Bekas Terpercaya. Ada yang bisa kami bantu hari ini?',
  fallback: 'Maaf, saya belum bisa menjawab pertanyaan tersebut. Silakan hubungi tim kami melalui WhatsApp di +62 812 3456 7890 atau email triftlydev@gmail.com agar tim kami dapat membantu dengan sepenuh hati! 💚',
  contact: {
    whatsapp: '+62 812 3456 7890',
    email: 'triftlydev@gmail.com',
    website: 'https://thriftly-marketplace.vercel.app',
  }
}

export const QUICK_REPLIES = [
  { label: '🛒 Cara Belanja', value: 'cara belanja' },
  { label: '📦 Lacak Pesanan', value: 'lacak pesanan' },
  { label: '💰 Cara Jual Barang', value: 'cara jual' },
  { label: '🔒 Keamanan Transaksi', value: 'keamanan' },
  { label: '📋 Syarat & Ketentuan', value: 'syarat ketentuan' },
  { label: '❓ FAQ Lainnya', value: 'faq' },
]

export const KNOWLEDGE_BASE = [
  // ────────────────────────────────────────────
  // TENTANG THRIFTLY
  // ────────────────────────────────────────────
  {
    keywords: ['apa itu thriftly', 'thriftly apa', 'tentang thriftly', 'apa thriftly', 'thriftly adalah'],
    answer: 'Thriftly adalah marketplace barang bekas terpercaya yang membangun jembatan antara barang berkualitas dan pemilik baru yang menghargainya. Didirikan di Yogyakarta pada tahun 2024, kami memiliki misi menciptakan ekosistem sirkular yang memudahkan semua orang untuk membeli dan menjual barang berkualitas dengan aman. 🌿',
    followUp: ['cara belanja', 'cara jual', 'keamanan']
  },
  {
    keywords: ['program', 'layanan', 'fitur', 'bisa apa', 'apa saja'],
    answer: 'Thriftly menyediakan dua layanan utama:\n\n🛒 **Pembelian Barang Bekas** — Temukan barang berkualitas dari penjual terpercaya di seluruh Indonesia.\n\n🏷️ **Penjualan Barang Bekas** — Jual barang yang sudah tidak terpakai dengan mudah dan aman.\n\nKeduanya dilengkapi dengan sistem keamanan Escrow, pembayaran via DOKU, dan pengiriman real-time via Biteship!',
    followUp: ['cara belanja', 'cara jual']
  },

  // ────────────────────────────────────────────
  // CARA BELANJA (PEMBELI)
  // ────────────────────────────────────────────
  {
    keywords: ['cara belanja', 'cara beli', 'gimana beli', 'bagaimana beli', 'cara membeli', 'cara order', 'mau beli', 'pengen beli', 'beli barang'],
    answer: 'Cara belanja di Thriftly sangat mudah! 🛒\n\n1️⃣ **Cari Barang** — Temukan barang impian dari ribuan penjual terpercaya.\n2️⃣ **Tawar & Beli** — Gunakan fitur negosiasi untuk harga terbaik atau langsung checkout.\n3️⃣ **Bayar Aman** — Pembayaran melalui DOKU Payment Gateway.\n4️⃣ **Barang Dikirim** — Penjual mengirimkan via JNE/J&T/SiCepat.\n5️⃣ **Selesai** — Barang sampai, dana diteruskan ke penjual. Aman!\n\n👉 Mulai belanja di: /products',
    followUp: ['keamanan', 'pembayaran', 'pengiriman']
  },

  // ────────────────────────────────────────────
  // CARA JUAL (PENJUAL)
  // ────────────────────────────────────────────
  {
    keywords: ['cara jual', 'gimana jual', 'bagaimana jual', 'cara menjual', 'mau jual', 'jual barang', 'daftar penjual', 'jadi seller', 'jadi penjual'],
    answer: 'Menjual barang di Thriftly cuma butuh 30 detik! 🏷️\n\n1️⃣ **Daftar sebagai Penjual** — Registrasi di halaman pendaftaran penjual.\n2️⃣ **Upload Produk** — Foto, deskripsi, harga, dan kondisi barang.\n3️⃣ **Tunggu Approval** — Admin akan mereview produk Anda.\n4️⃣ **Kelola Pesanan** — Terima pesanan, konfirmasi ongkir, dan kirim barang.\n5️⃣ **Terima Dana** — Cairkan saldo ke rekening bank Anda kapan saja!\n\n👉 Daftar di: /register/seller',
    followUp: ['kategori', 'kondisi barang', 'pencairan']
  },

  // ────────────────────────────────────────────
  // DAFTAR / REGISTRASI
  // ────────────────────────────────────────────
  {
    keywords: ['daftar', 'registrasi', 'register', 'buat akun', 'sign up', 'mendaftar'],
    answer: 'Anda bisa mendaftar di Thriftly dengan mudah! 🎉\n\n👤 **Sebagai Pembeli:** /register/buyer\n🏪 **Sebagai Penjual:** /register/seller\n\nProses pendaftaran cepat dan gratis. Setelah terdaftar, Anda bisa langsung mulai berbelanja atau menjual!',
    followUp: ['cara belanja', 'cara jual']
  },

  // ────────────────────────────────────────────
  // KEAMANAN & ESCROW
  // ────────────────────────────────────────────
  {
    keywords: ['keamanan', 'aman', 'escrow', 'rekening bersama', 'penipuan', 'tipu', 'terpercaya', 'aman gak', 'aman tidak'],
    answer: 'Transaksi di Thriftly dijamin AMAN! 🔒\n\n✅ **Sistem Escrow** — Dana pembeli aman di Thriftly sampai barang diterima dan sesuai.\n✅ **DOKU Payment Gateway** — Pembayaran diproses melalui gateway terpercaya.\n✅ **Penjual Terverifikasi** — Sistem verifikasi ketat untuk semua penjual.\n✅ **Fitur Komplain** — Jika barang tidak sesuai, ajukan komplain dalam 2x24 jam.\n\nJadi Anda tidak perlu khawatir kena tipu! 💪',
    followUp: ['cara belanja', 'komplain']
  },

  // ────────────────────────────────────────────
  // PEMBAYARAN
  // ────────────────────────────────────────────
  {
    keywords: ['pembayaran', 'bayar', 'metode bayar', 'payment', 'doku', 'transfer', 'cara bayar'],
    answer: 'Pembayaran di Thriftly diproses melalui **DOKU Payment Gateway** yang terpercaya. 💳\n\nSetelah checkout, Anda akan diarahkan ke halaman pembayaran DOKU untuk menyelesaikan transaksi. Dana Anda aman karena menggunakan sistem Escrow — baru diteruskan ke penjual setelah barang diterima.\n\nBiaya admin platform: Rp 2.500 per transaksi.',
    followUp: ['keamanan', 'cara belanja']
  },

  // ────────────────────────────────────────────
  // PENGIRIMAN
  // ────────────────────────────────────────────
  {
    keywords: ['pengiriman', 'kirim', 'ongkir', 'ongkos kirim', 'kurir', 'jne', 'jnt', 'j&t', 'sicepat', 'estimasi', 'berapa lama', 'sampai kapan'],
    answer: 'Thriftly mendukung pengiriman via: 🚚\n\n📦 **JNE** — Reguler (2-3 hari)\n📦 **J&T Express** — Reguler (2-4 hari)\n📦 **SiCepat** — Reguler (1-3 hari)\n\nEstimasi pengiriman 2-5 hari kerja untuk wilayah sesama pulau. Ongkos kirim dihitung otomatis berdasarkan lokasi penjual dan pembeli menggunakan API Biteship.\n\nAnda juga bisa melacak pesanan secara real-time! 📍',
    followUp: ['lacak pesanan', 'cara belanja']
  },

  // ────────────────────────────────────────────
  // LACAK PESANAN
  // ────────────────────────────────────────────
  {
    keywords: ['lacak', 'tracking', 'track', 'lacak pesanan', 'lacak pengiriman', 'dimana paket', 'dimana barang', 'cek resi', 'resi'],
    answer: 'Untuk melacak pesanan Anda: 📍\n\n1️⃣ Login ke akun Anda\n2️⃣ Buka menu **Pesanan Saya**\n3️⃣ Cari pesanan yang statusnya "Sedang Dikirim"\n4️⃣ Klik tombol **Lacak Pengiriman**\n\nSistem kami terintegrasi dengan Biteship untuk tracking real-time. Nomor resi akan otomatis muncul di halaman pesanan Anda.',
    followUp: ['pengiriman', 'komplain']
  },

  // ────────────────────────────────────────────
  // KATEGORI PRODUK
  // ────────────────────────────────────────────
  {
    keywords: ['kategori', 'jenis barang', 'apa saja dijual', 'barang apa', 'jual apa', 'produk apa'],
    answer: 'Thriftly memiliki 6 kategori produk: 🏷️\n\n💻 **Tech** — Phones, Laptops, Tablets, Smartwatches\n👕 **Style** — Clothing, Shoes, Bags, Watches\n🏍️ **Auto** — Motorcycles, Cars, Bicycles\n🛋️ **Home** — Furniture, Kitchenware, Decor\n⚽ **Active** — Sports gear, Gaming, Collectibles\n📚 **Books** — Books, Novels, Stationery\n\n👉 Lihat semua produk di: /products',
    followUp: ['kondisi barang', 'cara belanja']
  },

  // ────────────────────────────────────────────
  // KONDISI BARANG
  // ────────────────────────────────────────────
  {
    keywords: ['kondisi', 'kondisi barang', 'like new', 'bekas', 'second', 'preloved', 'kualitas'],
    answer: 'Semua barang di Thriftly adalah barang bekas berkualitas dengan 3 tingkat kondisi:\n\n🟢 **Bekas - Like New** — Kondisi sangat bagus, hampir seperti baru, minim bekas pemakaian.\n🔵 **Bekas - Bagus** — Kondisi bagus, ada sedikit bekas pemakaian tapi masih layak.\n🟡 **Bekas - Oke** — Ada bekas pemakaian yang cukup terlihat tapi masih berfungsi baik.\n\nSetiap penjual wajib mencantumkan kondisi barang secara jujur.',
    followUp: ['keamanan', 'komplain']
  },

  // ────────────────────────────────────────────
  // KOMPLAIN & RETUR
  // ────────────────────────────────────────────
  {
    keywords: ['komplain', 'keluhan', 'retur', 'kembalikan', 'barang rusak', 'tidak sesuai', 'beda', 'kecewa', 'return', 'refund', 'pengembalian'],
    answer: 'Kami mohon maaf atas ketidaknyamanan yang Anda alami. 🙏\n\nJika barang yang diterima tidak sesuai deskripsi atau rusak, Anda bisa menggunakan fitur **Komplain** dalam **2x24 jam** setelah barang diterima:\n\n1️⃣ Buka menu **Pesanan Saya**\n2️⃣ Pilih pesanan yang bermasalah\n3️⃣ Klik **Ajukan Komplain**\n4️⃣ Jelaskan masalahnya dan lampirkan foto bukti\n\nTim kami akan menindaklanjuti secepatnya!',
    followUp: ['keamanan', 'kontak']
  },

  // ────────────────────────────────────────────
  // PEMBATALAN PESANAN
  // ────────────────────────────────────────────
  {
    keywords: ['batal', 'batalkan', 'cancel', 'membatalkan', 'cancel order', 'batal pesanan'],
    answer: 'Anda bisa membatalkan pesanan selama penjual **belum memproses pengiriman**: ❌\n\n1️⃣ Buka menu **Pesanan Saya**\n2️⃣ Pilih pesanan yang ingin dibatalkan\n3️⃣ Klik tombol **Batal**\n\n⚠️ Jika penjual sudah mengirimkan barang, pesanan tidak bisa dibatalkan. Anda bisa menggunakan fitur Komplain setelah barang diterima.',
    followUp: ['komplain', 'kontak']
  },

  // ────────────────────────────────────────────
  // MEMBERSHIP
  // ────────────────────────────────────────────
  {
    keywords: ['membership', 'member', 'langganan', 'berlangganan', 'premium', 'subscribe', 'langganan'],
    answer: 'Thriftly memiliki program **Membership** eksklusif! ⭐\n\n👤 **Pembeli — Rp 10.000** (sekali bayar):\n• Notifikasi barang langka secara eksklusif\n• Akses barang incaran lebih dulu dibanding pembeli biasa\n• Sistem otomatis mencarikan barang untuk Anda\n\n🏪 **Penjual — Rp 50.000** (sekali bayar):\n• Produk diprioritaskan di urutan teratas pencarian\n\nPembayaran aman via DOKU Payment Gateway.',
    followUp: ['daftar', 'cara belanja']
  },

  // ────────────────────────────────────────────
  // PENCAIRAN DANA (PENJUAL)
  // ────────────────────────────────────────────
  {
    keywords: ['pencairan', 'withdraw', 'cairkan', 'tarik dana', 'saldo', 'rekening', 'kapan cair'],
    answer: 'Pencairan dana untuk penjual bisa dilakukan kapan saja! 💰\n\n1️⃣ Login sebagai Penjual\n2️⃣ Buka menu **Penarikan Dana** di dashboard\n3️⃣ Masukkan jumlah yang ingin dicairkan\n4️⃣ Pilih rekening bank tujuan\n5️⃣ Dana akan diproses secepat kilat!\n\nSaldo akan bertambah otomatis setiap kali transaksi pesanan selesai (barang sudah diterima pembeli).',
    followUp: ['cara jual', 'keamanan']
  },

  // ────────────────────────────────────────────
  // HARGA / BIAYA
  // ────────────────────────────────────────────
  {
    keywords: ['harga', 'biaya', 'tarif', 'berapa', 'mahal', 'murah', 'gratis', 'fee', 'biaya admin'],
    answer: 'Di Thriftly, harga barang ditentukan langsung oleh masing-masing penjual. 💰\n\n📌 **Biaya Admin Platform:** Rp 2.500 per transaksi\n📌 **Ongkos Kirim:** Dihitung otomatis sesuai lokasi dan kurir\n📌 **Pendaftaran:** GRATIS\n📌 **Membership Pembeli:** Rp 10.000 (opsional)\n📌 **Membership Penjual:** Rp 50.000 (opsional)\n\nKami juga memiliki promo gratis ongkir secara berkala! 🎉',
    followUp: ['membership', 'cara belanja']
  },

  // ────────────────────────────────────────────
  // DISKON & PROMO
  // ────────────────────────────────────────────
  {
    keywords: ['diskon', 'promo', 'voucher', 'kupon', 'potongan', 'cashback', 'gratis ongkir'],
    answer: 'Kami memiliki penawaran promo khusus secara berkala! 🎉\n\n🚚 **Gratis Ongkir** — Promo gratis ongkir setiap minggunya\n⭐ **Membership** — Dapatkan akses eksklusif dan prioritas\n\nUntuk informasi promo terbaru, silakan cek website kami atau hubungi WhatsApp: +62 812 3456 7890',
    followUp: ['membership', 'cara belanja']
  },

  // ────────────────────────────────────────────
  // KONTAK
  // ────────────────────────────────────────────
  {
    keywords: ['kontak', 'hubungi', 'contact', 'whatsapp', 'wa', 'email', 'telepon', 'telp', 'cs', 'customer service'],
    answer: 'Anda bisa menghubungi tim Thriftly melalui: 📞\n\n📱 **WhatsApp:** +62 812 3456 7890\n📧 **Email:** triftlydev@gmail.com\n🌐 **Website:** thriftly-marketplace.vercel.app\n📍 **Lokasi:** Jawa Tengah & DIY, Indonesia\n\nTim support kami tersedia untuk membantu Anda! 💚',
    followUp: ['cara belanja', 'cara jual']
  },

  // ────────────────────────────────────────────
  // CHAT PENJUAL/PEMBELI
  // ────────────────────────────────────────────
  {
    keywords: ['chat', 'pesan', 'hubungi penjual', 'hubungi pembeli', 'tanya penjual', 'komunikasi'],
    answer: 'Thriftly menyediakan fitur **Chat Real-Time** antara pembeli dan penjual! 💬\n\nAnda bisa langsung chat dengan penjual dari halaman pesanan atau detail produk untuk menanyakan kondisi barang, negosiasi harga, atau detail pengiriman.\n\nFitur chat tersedia setelah Anda login ke akun Anda.',
    followUp: ['cara belanja', 'kontak']
  },

  // ────────────────────────────────────────────
  // FAQ
  // ────────────────────────────────────────────
  {
    keywords: ['faq', 'pertanyaan', 'bantuan', 'help', 'pusat bantuan', 'tanya'],
    answer: 'Berikut pertanyaan yang sering diajukan: ❓\n\n**Q: Bagaimana cara membatalkan pesanan?**\nA: Buka Pesanan Saya → pilih produk → klik Batal (selama belum dikirim).\n\n**Q: Apakah barang bisa dikembalikan?**\nA: Bisa, jika tidak sesuai deskripsi. Gunakan fitur Komplain dalam 2x24 jam.\n\n**Q: Berapa lama estimasi pengiriman?**\nA: 2-5 hari kerja untuk sesama pulau.\n\n👉 Info lengkap di: /help',
    followUp: ['komplain', 'pengiriman', 'kontak']
  },

  // ────────────────────────────────────────────
  // SYARAT & KETENTUAN
  // ────────────────────────────────────────────
  {
    keywords: ['syarat', 'ketentuan', 'terms', 'aturan', 'peraturan', 'kebijakan'],
    answer: 'Untuk informasi lengkap mengenai syarat & ketentuan penggunaan Thriftly, silakan kunjungi:\n\n📋 **Syarat & Ketentuan:** /terms\n🔒 **Kebijakan Privasi:** /privacy\n\nKami berkomitmen menjaga keamanan dan privasi data Anda.',
    followUp: ['keamanan', 'kontak']
  },

  // ────────────────────────────────────────────
  // SAPAAN / GREETING
  // ────────────────────────────────────────────
  {
    keywords: ['halo', 'hai', 'hi', 'hello', 'hey', 'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam', 'assalamualaikum', 'permisi'],
    answer: 'Halo, Kak! 👋 Selamat datang di Thriftly. Kami siap membantu Anda! Ada yang bisa kami bantu hari ini?',
    followUp: ['cara belanja', 'cara jual', 'faq']
  },

  // ────────────────────────────────────────────
  // TERIMA KASIH
  // ────────────────────────────────────────────
  {
    keywords: ['terima kasih', 'makasih', 'thanks', 'thank you', 'thx', 'tq'],
    answer: 'Sama-sama, Kak! 😊 Senang bisa membantu. Jika ada pertanyaan lain, jangan ragu untuk bertanya ya. Selamat berbelanja di Thriftly! 🛍️',
    followUp: []
  },

  // ────────────────────────────────────────────
  // BLOG & NEWSLETTER
  // ────────────────────────────────────────────
  {
    keywords: ['blog', 'artikel', 'berita', 'newsletter', 'info terbaru'],
    answer: 'Thriftly memiliki blog yang berisi artikel menarik seputar tips thrifting, tren fashion, dan informasi marketplace! 📰\n\n👉 Kunjungi blog kami di: /blog\n\nAnda juga bisa berlangganan newsletter untuk mendapatkan update terbaru langsung ke email Anda.',
    followUp: ['membership', 'cara belanja']
  },
]

/**
 * Fungsi untuk mencocokkan pesan pengguna dengan knowledge base
 * Menggunakan keyword matching sederhana
 */
export const findAnswer = (userMessage) => {
  const msg = userMessage.toLowerCase().trim()

  // Cari yang paling banyak keyword-nya cocok
  let bestMatch = null
  let bestScore = 0

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0
    for (const keyword of entry.keywords) {
      if (msg.includes(keyword.toLowerCase())) {
        // Beri skor berdasarkan panjang keyword (keyword panjang = lebih spesifik = skor lebih tinggi)
        score += keyword.length
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestMatch = entry
    }
  }

  if (bestMatch && bestScore > 0) {
    return {
      answer: bestMatch.answer,
      followUp: bestMatch.followUp || []
    }
  }

  return null // fallback
}
