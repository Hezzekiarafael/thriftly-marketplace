import InfoLayout from '../../components/layout/InfoLayout'
import { Search, Package, Check, DollarSign } from 'lucide-react'

const HowItWorks = () => {
  const steps = [
    {
      icon: <Search size={32} />,
      title: 'Cari Barang',
      desc: 'Temukan barang impian kamu dari ribuan penjual terpercaya di seluruh Indonesia.'
    },
    {
      icon: <DollarSign size={32} />,
      title: 'Tawar & Beli',
      desc: 'Gunakan fitur tawar untuk harga terbaik atau langsung checkout dengan payment gateway aman.'
    },
    {
      icon: <Package size={32} />,
      title: 'Barang Dikirim',
      desc: 'Penjual akan mengirimkan barang kamu lewat jasa pengiriman pilihan.'
    },
    {
      icon: <Check size={32} />,
      title: 'Selesai',
      desc: 'Setelah barang sampai dan sesuai, dana akan diteruskan ke penjual. Aman banget!'
    }
  ]

  return (
    <InfoLayout 
      title="Cara Kerja di Thriftly" 
      subtitle="Siklus jual beli yang transparan, mudah, dan menyenangkan."
    >
      <div className="space-y-16">
        <section className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Belanja Jadi Simpel</h2>
          <p className="text-gray-600">
            Kami menciptakan platform di mana kamu nggak perlu khawatir kena tipu. Semua transaksi di Thriftly menggunakan sistem rekening bersama (Escrow).
          </p>
        </section>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative text-center">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-dashed border-t-2 border-dashed border-primary-200 -z-10" />
              )}
              <div className="w-20 h-20 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-200">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Extra Info */}
        <div className="grid md:grid-cols-2 gap-12 pt-12">
          <div className="p-8 bg-gray-50 rounded-3xl">
            <h3 className="text-2xl font-bold mb-4 text-primary-700">Untuk Pembeli</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <span className="text-primary-600 font-bold">1.</span>
                <span>Dana kamu aman di Thriftly sampai barang diterima.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-primary-600 font-bold">2.</span>
                <span>Customer support siap bantu jika ada kendala.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-primary-600 font-bold">3.</span>
                <span>Banyak promo gratis ongkir setiap minggunya.</span>
              </li>
            </ul>
          </div>
          <div className="p-8 bg-gray-50 rounded-3xl">
            <h3 className="text-2xl font-bold mb-4 text-accent-700">Untuk Penjual</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <span className="text-accent-600 font-bold">1.</span>
                <span>Upload barang cuma butuh waktu 30 detik.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-accent-600 font-bold">2.</span>
                <span>Manajemen stok dan pesanan yang super rapi.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-accent-600 font-bold">3.</span>
                <span>Pencairan dana ke rekening bank secepat kilat.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </InfoLayout>
  )
}

export default HowItWorks
