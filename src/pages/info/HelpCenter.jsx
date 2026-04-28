import InfoLayout from '../../components/layout/InfoLayout'
import { Search, ShoppingCart, Shield, Truck, CreditCard, HelpCircle } from 'lucide-react'

const HelpCenter = () => {
  const categories = [
    { icon: <ShoppingCart />, name: 'Pembelian', desc: 'Cara mencari, menawar, dan membeli barang.' },
    { icon: <Shield />, name: 'Keamanan', desc: 'Lindungi akun dan transaksi kamu.' },
    { icon: <Truck />, name: 'Pengiriman', desc: 'Lacak paket dan jasa pengiriman yang tersedia.' },
    { icon: <CreditCard />, name: 'Pembayaran', desc: 'Metode pembayaran dan pengembalian dana.' },
    { icon: <HelpCircle />, name: 'Akun Saya', desc: 'Kelola profil, password, dan notifikasi.' },
  ]

  const faqs = [
    { q: 'Bagaimana cara membatalkan pesanan?', a: 'Kamu bisa membatalkan pesanan selama penjual belum memproses pengiriman. Buka menu Pesanan Saya, pilih produk, dan klik Batal.' },
    { q: 'Apakah barang yang sudah dibeli bisa dikembalikan?', a: 'Bisa, jika barang yang diterima tidak sesuai deskripsi atau rusak. Gunakan fitur Komplain dalam 2x24 jam setelah barang diterima.' },
    { q: 'Berapa lama estimasi pengiriman di Thriftly?', a: 'Tergantung jasa kirim yang dipilih dan lokasi penjual. Biasanya 2-5 hari kerja untuk wilayah sesama pulau.' },
  ]

  return (
    <InfoLayout 
      title="Pusat Bantuan" 
      subtitle="Ada pertanyaan? Kami siap membantu kamu kapan saja."
    >
      <div className="space-y-16">
        {/* Search */}
        <div className="relative max-w-2xl mx-auto -mt-20 md:-mt-24 z-10">
          <div className="flex items-center bg-white rounded-2xl p-2 shadow-xl border border-gray-100">
            <div className="pl-4 text-gray-400">
              <Search size={22} />
            </div>
            <input 
              type="text" 
              placeholder="Apa yang bisa kami bantu hari ini?" 
              className="w-full px-4 py-4 bg-transparent border-none text-gray-900 text-lg focus:outline-none"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Telusuri Berdasarkan Kategori</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat, i) => (
              <div key={i} className="p-8 bg-gray-50 rounded-3xl border border-gray-100 hover:border-primary-300 hover:bg-white hover:shadow-lg transition-all cursor-pointer group text-center md:text-left">
                <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                  {cat.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{cat.name}</h3>
                <p className="text-sm text-gray-500">{cat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Pertanyaan Sering Diajukan (FAQ)</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group border border-gray-100 rounded-2xl p-6 bg-white hover:bg-gray-50 transition-all cursor-pointer">
                <summary className="list-none flex items-center justify-between font-bold text-gray-900 text-lg">
                  {faq.q}
                  <span className="text-primary-600 transition-transform group-open:rotate-180">&darr;</span>
                </summary>
                <div className="mt-4 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Contact Support */}
        <section className="bg-gray-900 rounded-3xl p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-2">Masih butuh bantuan?</h3>
            <p className="text-gray-400">Tim support kami tersedia 24/7 untuk menjawab kebingungan kamu.</p>
          </div>
          <div className="flex gap-4">
            <button className="px-8 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-all">
              Chat Live
            </button>
            <button className="px-8 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all">
              Email Kami
            </button>
          </div>
        </section>
      </div>
    </InfoLayout>
  )
}

export default HelpCenter
