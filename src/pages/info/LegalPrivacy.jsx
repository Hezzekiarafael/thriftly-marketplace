import InfoLayout from '../../components/layout/InfoLayout'

const LegalPrivacy = () => {
  return (
    <InfoLayout 
      title="Kebijakan Privasi" 
      subtitle="Privasi Anda adalah prioritas utama kami."
    >
      <div className="prose prose-primary max-w-none">
        <p className="lead">Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda.</p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">1. Informasi yang Kami Kumpulkan</h2>
        <p>Kami mengumpulkan informasi yang Anda berikan saat mendaftar, seperti nama, alamat email, alamat pengiriman, dan nomor telepon.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">2. Penggunaan Informasi</h2>
        <p>Data Anda digunakan untuk memproses transaksi, memverifikasi keamanan akun, dan memberikan rekomendasi produk yang sesuai dengan minat Anda.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">3. Keamanan Data</h2>
        <p>Kami menggunakan enkripsi SSL dan protokol keamanan industri terbaru untuk memastikan data pribadi Anda tetap aman dari akses yang tidak sah.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">4. Cookies</h2>
        <p>Kami menggunakan cookies untuk meningkatkan pengalaman pengguna di platform kami, seperti menyimpan preferensi bahasa dan login akun.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">5. Hak Anda</h2>
        <p>Anda berhak untuk mengakses, mengubah, atau meminta penghapusan data pribadi Anda kapan saja melalui pengaturan akun.</p>

        <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-sm text-gray-500 italic">
            Dokumen ini merupakan bagian dari komitmen Thriftly terhadap transparansi pengelolaan data pengguna.
          </p>
        </div>
      </div>
    </InfoLayout>
  )
}

export default LegalPrivacy
