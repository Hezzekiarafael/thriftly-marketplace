import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Crown, CheckCircle, ArrowLeft, Clock, CreditCard, Shield, Zap, Star } from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import Button from '../../components/common/Button'
import { subscriptionService } from '../../services/subscriptionService'
import { useAuth } from '../../context/AuthContext'

const BENEFITS = [
  { icon: Star,  text: 'Badge Premium di profil kamu' },
  { icon: Zap,   text: 'Produk tampil lebih awal di halaman utama' },
  { icon: Shield,text: 'Prioritas dukungan pelanggan' },
]

const SubscriptionPayment = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [detail, setDetail] = useState(null)

  const invoiceId = searchParams.get('invoice')

  useEffect(() => {
    const d = subscriptionService.getDetail()
    if (!d || d.status !== 'pending') {
      navigate('/profile?tab=subscription', { replace: true })
      return
    }
    setDetail(d)
  }, [navigate])

  // Hitung sisa waktu
  const [timeLeft, setTimeLeft] = useState('')
  useEffect(() => {
    if (!detail?.expiredAt) return
    const interval = setInterval(() => {
      const diff = new Date(detail.expiredAt) - new Date()
      if (diff <= 0) {
        setTimeLeft('Kadaluarsa')
        clearInterval(interval)
        return
      }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`)
    }, 1000)
    return () => clearInterval(interval)
  }, [detail])

  const handlePayViaDoku = async () => {
    setIsProcessing(true)
    try {
      // Simulasi redirect ke Doku (di production akan ke payment_url dari backend)
      const currentInvoice = detail?.invoiceId || invoiceId
      // Redirect ke simulasi Doku dengan callback URL setelah bayar
      const callbackUrl = encodeURIComponent(
        `${window.location.origin}/subscription/success?invoice=${currentInvoice}`
      )
      navigate(`/simulation/doku?invoice=${currentInvoice}&amount=${detail?.amount || 50000}&callback=${callbackUrl}&type=subscription`)
    } catch {
      setIsProcessing(false)
    }
  }

  if (!detail) return null

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow py-8 md:py-14">
        <Container maxWidth="max-w-2xl">
          {/* Back */}
          <Link
            to="/profile?tab=subscription"
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Kembali</span>
          </Link>

          {/* Header Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-3xl p-8 mb-6 text-white shadow-2xl">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-yellow-400/20 backdrop-blur rounded-2xl flex items-center justify-center">
                  <Crown className="w-6 h-6 text-yellow-300" />
                </div>
                <div>
                  <p className="text-purple-200 text-xs font-semibold uppercase tracking-wider">Thriftly</p>
                  <h1 className="text-xl font-bold">Premium Membership</h1>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-2xl p-5 mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-purple-200 text-xs">Invoice</span>
                  <span className="font-mono text-sm font-bold">{detail.invoiceId}</span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-purple-200 text-xs">Periode</span>
                  <span className="text-sm font-semibold">30 Hari</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-200 text-xs">Total Pembayaran</span>
                  <span className="text-2xl font-black text-yellow-300">
                    Rp {(detail.amount || 50000).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Timer */}
              <div className="flex items-center gap-2 text-purple-200 text-sm">
                <Clock className="w-4 h-4 text-yellow-300 animate-pulse" />
                <span>Selesaikan pembayaran dalam: <span className="font-mono font-bold text-yellow-300">{timeLeft}</span></span>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-white rounded-3xl p-6 mb-6 border border-gray-100 shadow-sm">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Yang kamu dapatkan</h2>
            <div className="space-y-3">
              {BENEFITS.map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-violet-600" />
                  </div>
                  <span className="text-gray-700 text-sm font-medium">{text}</span>
                  <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-3xl p-6 mb-6 border border-gray-100 shadow-sm">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Detail Pembayaran</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-gray-900">{user?.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Paket</span>
                <span className="font-medium text-gray-900">Premium 30 Hari</span>
              </div>
              <div className="border-t border-dashed border-gray-100 pt-2 mt-2 flex justify-between font-bold">
                <span className="text-gray-700">Total</span>
                <span className="text-violet-600 text-lg">Rp {(detail.amount || 50000).toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Button
            onClick={handlePayViaDoku}
            loading={isProcessing}
            className="w-full py-4 text-base font-bold rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 border-none shadow-lg shadow-violet-200 flex items-center justify-center gap-2"
          >
            <CreditCard size={18} />
            Lanjut Bayar via Doku
          </Button>

          <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1.5">
            <Shield size={12} />
            Pembayaran aman dan terenkripsi
          </p>
        </Container>
      </main>

      <Footer />
    </div>
  )
}

export default SubscriptionPayment
