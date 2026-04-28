import InfoLayout from '../../components/layout/InfoLayout'
import { Shield, User, Zap } from 'lucide-react'

const AboutThriftly = () => {
  return (
    <InfoLayout 
      title="Tentang Thriftly" 
      subtitle="Kami membangun jembatan antara barang berkualitas dan pemilik baru yang menghargainya."
    >
      <div className="space-y-12">
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Misi Kami</h2>
          <p>
            Thriftly hadir untuk mendefinisikan ulang cara kita memandang barang bekas. Kami percaya bahwa setiap barang memiliki cerita dan nilai yang tidak hilang hanya karena berpindah tangan. Misi kami adalah menciptakan ekosistem sirkular yang memudahkan semua orang untuk membeli dan menjual barang berkualitas dengan aman.
          </p>
        </section>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-gray-50 rounded-2xl">
            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-4">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Terpercaya</h3>
            <p className="text-sm">Sistem verifikasi ketat untuk memastikan keamanan transaksi bagi pembeli dan penjual.</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-2xl">
            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-4">
              <User size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Komunitas</h3>
            <p className="text-sm">Membangun komunitas pecinta preloved yang peduli pada keberlanjutan lingkungan.</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-2xl">
            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-4">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Mudah & Cepat</h3>
            <p className="text-sm">Antarmuka yang modern dan intuitif membuat proses jual beli jadi secepat kilat.</p>
          </div>
        </div>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cerita Kami</h2>
          <p>
            Dimulai dari garasi kecil di Yogyakarta pada tahun 2024, Thriftly lahir dari keresahan akan banyaknya barang berkualitas yang terbengkalai. Kami memulai perjalanan ini dengan tim yang terdiri dari 5 orang yang memiliki visi yang sama: Menjadikan thrifting sebagai gaya hidup utama, bukan sekadar alternatif.
          </p>
        </section>
      </div>
    </InfoLayout>
  )
}

export default AboutThriftly
