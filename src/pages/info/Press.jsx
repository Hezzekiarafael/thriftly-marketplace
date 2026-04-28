import InfoLayout from '../../components/layout/InfoLayout'
import { Download, FileText, Image } from 'lucide-react'

const Press = () => {
  const news = [
    { date: '15 April 2024', title: 'Thriftly Meraih Pendanaan Seri A Sebesar $10 Juta', outlet: 'TechNews Indonesia' },
    { date: '02 Maret 2024', title: 'Cara Thriftly Mengubah Tren Konsumsi Barang Bekas di Indonesia', outlet: 'Media Nasional' },
    { date: '20 Januari 2024', title: 'Thriftly Meluncurkan Fitur Verifikasi Penjual Berbasis AI', outlet: 'Digital Daily' },
  ]

  return (
    <InfoLayout 
      title="Press Kit & Berita" 
      subtitle="Semua yang kamu butuhkan untuk menulis tentang Thriftly."
    >
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Tentang Thriftly</h2>
          <p>
            Thriftly adalah marketplace barang bekas terkemuka di Indonesia yang fokus pada kualitas, kepercayaan, dan kemudahan. Kami menghubungkan jutaan orang untuk memberikan barang-barang mereka kehidupan kedua yang bermakna.
          </p>
        </section>

        <section>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <Image size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Logo & Aset Visual</h3>
              <p className="text-sm text-gray-500 mb-6">Unduh logo Thriftly dalam berbagai format (PNG, SVG, AI).</p>
              <button className="flex items-center px-6 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all font-medium">
                <Download size={18} className="mr-2" /> Download Bundle (12MB)
              </button>
            </div>
            <div className="p-8 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4">
                <FileText size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Company Profile</h3>
              <p className="text-sm text-gray-500 mb-6">Informasi detail mengenai sejarah, visi, dan misi perusahaan kami.</p>
              <button className="flex items-center px-6 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all font-medium">
                <Download size={18} className="mr-2" /> Download PDF (4MB)
              </button>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Berita Terbaru</h2>
          <div className="space-y-6">
            {news.map((item, i) => (
              <div key={i} className="flex flex-col md:flex-row md:items-center justify-between py-4 border-b border-gray-100 last:border-0">
                <div className="mb-4 md:mb-0">
                  <span className="text-sm text-primary-600 font-bold uppercase tracking-wider">{item.date}</span>
                  <h3 className="text-lg font-bold text-gray-900 mt-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">Dikutip dari: <span className="font-semibold text-gray-700">{item.outlet}</span></p>
                </div>
                <button className="text-primary-600 font-bold hover:underline text-sm md:text-base">
                  Baca Selengkapnya
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gray-50 p-8 rounded-3xl">
          <h3 className="text-xl font-bold mb-4">Butuh Informasi Lebih Lanjut?</h3>
          <p className="text-gray-600 mb-2">Hubungi tim hubungan masyarakat kami di:</p>
          <span className="text-primary-600 font-bold text-lg">press@thriftly.com</span>
        </section>
      </div>
    </InfoLayout>
  )
}

export default Press
