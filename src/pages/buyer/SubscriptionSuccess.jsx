import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, Crown, ArrowRight, Mail } from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import { subscriptionService } from '../../services/subscriptionService'

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [activated, setActivated] = useState(false)
  const invoiceId = searchParams.get('invoice')

  useEffect(() => {
    if (!invoiceId) {
      navigate('/', { replace: true })
      return
    }
    // Aktifkan langganan dan kirim email notifikasi "Hore!"
    subscriptionService.activateSubscription(invoiceId)
    setActivated(true)
  }, [invoiceId, navigate])

  if (!activated) return null

  const detail = subscriptionService.getDetail()
  const expiredDate = detail?.expiredAt
    ? new Date(detail.expiredAt).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '-'

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow flex items-center justify-center py-12">
        <Container maxWidth="max-w-lg">
          {/* Konfetti-like success card */}
          <div className="text-center">
            {/* Animated checkmark */}
            <div className="relative inline-flex mb-6">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-200 animate-bounce-slow">
                <CheckCircle className="w-14 h-14 text-white" strokeWidth={1.5} />
              </div>
              <div className="absolute -top-1 -right-1 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-spin-slow">
                <Crown className="w-5 h-5 text-white" />
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
              Hore! 🎉
            </h1>
            <p className="text-lg text-gray-600 font-medium mb-1">
              Langganan Premium kamu sudah aktif!
            </p>
            <p className="text-sm text-gray-400 mb-8">
              Berlaku hingga <span className="font-bold text-gray-700">{expiredDate}</span>
            </p>

            {/* Status card */}
            <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm mb-6 text-left">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-violet-100 rounded-2xl flex items-center justify-center">
                  <Crown className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Thriftly Premium</p>
                  <p className="text-xs text-gray-400">Invoice: {detail?.invoiceId}</p>
                </div>
                <div className="ml-auto">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                    AKTIF ✓
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="font-bold text-emerald-600">Aktif</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Paket</span>
                  <span className="font-semibold text-gray-800">30 Hari</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Berlaku hingga</span>
                  <span className="font-semibold text-gray-800">{expiredDate}</span>
                </div>
              </div>
            </div>

            {/* Email notification info */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex items-center gap-3 mb-8 text-left">
              <Mail className="w-5 h-5 text-blue-500 shrink-0" />
              <p className="text-sm text-blue-700">
                Email konfirmasi sudah dikirim ke kotak masuk simulasi kamu.
              </p>
              <Link
                to="/simulation/mailbox"
                className="ml-auto text-xs font-bold text-blue-600 hover:text-blue-800 whitespace-nowrap transition-colors"
              >
                Cek Inbox →
              </Link>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/profile?tab=subscription"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-violet-200 hover:shadow-xl hover:from-violet-700 hover:to-indigo-700 transition-all"
              >
                <Crown size={18} />
                Lihat Status Langganan
              </Link>
              <Link
                to="/"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all"
              >
                Kembali Berbelanja
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  )
}

export default SubscriptionSuccess
