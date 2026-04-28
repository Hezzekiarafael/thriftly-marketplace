import InfoLayout from '../../components/layout/InfoLayout'

const LegalTerms = () => {
  return (
    <InfoLayout 
      title="Syarat & Ketentuan" 
      subtitle="Terakhir diperbarui: 20 April 2026"
    >
      <div className="prose prose-primary max-w-none">
        <p className="lead">Selamat datang di Thriftly. Dengan menggunakan layanan kami, Anda menyetujui persyaratan berikut.</p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">1. Pendahuluan</h2>
        <p>Layanan yang disediakan oleh Thriftly melalui website dan aplikasi seluler ("Platform") ditujukan untuk memfasilitasi transaksi jual beli barang bekas antar pengguna.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">2. Akun Pengguna</h2>
        <p>Anda bertanggung jawab untuk menjaga kerahasiaan informasi akun dan password Anda. Segala aktivitas yang terjadi di bawah akun Anda adalah tanggung jawab Anda sepenuhnya.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">3. Transaksi & Pembayaran</h2>
        <ul>
          <li>Semua transaksi wajib dilakukan melalui sistem pembayaran resmi Thriftly.</li>
          <li>Thriftly bertindak sebagai penengah (escrow) untuk memastikan keamanan transaksi.</li>
          <li>Dana akan diteruskan ke penjual setelah pembeli melakukan konfirmasi penerimaan barang.</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">4. Kebijakan Barang</h2>
        <p>Penjual dilarang menjual barang-barang ilegal, barang curian, senjata, atau barang lain yang melanggar hukum yang berlaku di Indonesia.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">5. Pembatasan Tanggung Jawab</h2>
        <p>Thriftly tidak bertanggung jawab atas kerugian tidak langsung atau konsekuensial yang timbul dari penggunaan Layanan kami.</p>

        <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-sm text-gray-500 italic">
            Catatan: Ini adalah dokumen template. Untuk kepastian hukum, disarankan untuk melakukan konsultasi dengan praktisi hukum profesional.
          </p>
        </div>
      </div>
    </InfoLayout>
  )
}

export default LegalTerms
