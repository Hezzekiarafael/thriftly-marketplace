import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ShieldCheck, CheckCircle2, Zap, Search, Bell } from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import { newsletterService } from '../../services/newsletterService'
import { formatCurrency } from '../../utils/helpers'
import toast from 'react-hot-toast'

const Membership = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const emailParam = searchParams.get('email') || ''
  const tokenParam = searchParams.get('token') || ''
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCheckout = async () => {
    if (!emailParam || !tokenParam) {
      toast.error('Tautan tidak valid atau telah kedaluwarsa.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await newsletterService.checkout(emailParam, tokenParam)
      const paymentUrl = response.data?.payment_url

      if (paymentUrl) {
        // Redirect ke layar pembayaran DOKU asli
        window.location.href = paymentUrl
      } else {
        toast.error('Gagal mendapatkan tautan pembayaran.')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memproses checkout.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <Header />
      
      <main className="flex-grow py-12 md:py-20 flex items-center">
        <Container maxWidth="max-w-2xl">
          <div className="bg-white rounded-3xl p-6 md:p-12 shadow-soft-lg border border-gray-100 animate-in zoom-in-95 duration-300">
            
            {/* Header / Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Aktifkan Membership Anda
              </h1>
              <p className="text-gray-500 text-sm md:text-base mt-3 max-w-lg mx-auto">
                Selesaikan pembayaran sebesar <span className="font-bold text-gray-900">Rp 10.000</span> (sekali bayar) untuk mulai menerima notifikasi barang langka secara eksklusif.
              </p>
            </div>

            {/* Benefits box (Gambar 4 style) */}
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 md:p-8 mb-10">
              <h3 className="font-bold text-gray-900 text-base md:text-lg mb-5 flex items-center gap-2">
                Keuntungan Membership:
              </h3>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="text-teal-500 shrink-0 mt-0.5">
                    <CheckCircle2 size={20} className="fill-teal-50 text-teal-600" />
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                    Dapatkan notifikasi <strong className="text-gray-900 font-semibold">detik itu juga</strong> saat barang baru lolos kurasi dan dirilis.
                  </p>
                </li>

                <li className="flex items-start gap-3">
                  <div className="text-teal-500 shrink-0 mt-0.5">
                    <CheckCircle2 size={20} className="fill-teal-50 text-teal-600" />
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                    Tidak perlu repot scroll setiap hari, biarkan sistem kami yang mencarikan untuk Anda.
                  </p>
                </li>

                <li className="flex items-start gap-3">
                  <div className="text-teal-500 shrink-0 mt-0.5">
                    <Zap size={20} className="text-teal-600 fill-teal-50" />
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                    Selalu dapat akses barang incaran lebih dulu dibanding pembeli biasa.
                  </p>
                </li>
              </ul>
            </div>

            {/* CTA Action Button */}
            <div className="space-y-4 text-center">
              <button 
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3.5 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 text-sm md:text-base flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Memproses...' : 'Lanjut Berlangganan via DOKU'}
              </button>
              
              <p className="text-[10px] md:text-xs text-gray-400 font-light">
                Pembayaran aman diproses melalui DOKU Payment Gateway.
              </p>
            </div>

          </div>
        </Container>
      </main>

      <Footer />
    </div>
  )
}

export default Membership
