import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronDown, CreditCard, Copy, Check, Clock, ShieldCheck, Mail } from 'lucide-react'
import { subscriptionService } from '../../services/subscriptionService'
import toast from 'react-hot-toast'

const DokuSimulation = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const emailParam    = searchParams.get('email')   || ''
  const invoiceParam  = searchParams.get('invoice') || `MEMB-${Date.now()}`
  const amountParam   = parseInt(searchParams.get('amount') || '50000', 10)
  const typeParam     = searchParams.get('type')    || 'order'   // 'order' | 'subscription'
  const callbackParam = searchParams.get('callback') || null
  
  const [isVerifying, setIsVerifying] = useState(false)
  const [copiedVa, setCopiedVa] = useState(false)
  const [copiedAmount, setCopiedAmount] = useState(false)
  
  // Timer countdown: start at 59:45
  const [timeLeft, setTimeLeft] = useState(3585) // 59 minutes 45 seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins} Minutes, ${secs < 10 ? '0' : ''}${secs} Seconds`
  }

  const handleCopyVa = () => {
    navigator.clipboard.writeText('1900800000277697')
    setCopiedVa(true)
    toast.success('Nomor Virtual Account disalin')
    setTimeout(() => setCopiedVa(false), 2000)
  }

  const handleCopyAmount = () => {
    navigator.clipboard.writeText('10000')
    setCopiedAmount(true)
    toast.success('Jumlah tagihan disalin')
    setTimeout(() => setCopiedAmount(false), 2000)
  }

  const handleCheckPaymentStatus = () => {
    setIsVerifying(true)
    toast.loading('Memverifikasi pembayaran...', { id: 'verify_payment' })

    setTimeout(() => {
      toast.dismiss('verify_payment')

      if (typeParam === 'subscription') {
        // Redirect ke halaman sukses langganan agar activateSubscription dipanggil
        toast.success('Pembayaran berhasil! Langganan aktif 🎉', { duration: 4000 })
        setIsVerifying(false)
        if (callbackParam) {
          window.location.href = decodeURIComponent(callbackParam)
        } else {
          navigate(`/subscription/success?invoice=${invoiceParam}`)
        }
      } else {
        // Flow pembayaran order biasa
        subscriptionService.setStatus('active')
        subscriptionService.addEmail(
          'Thriftly Official <thriftlydev@gmail.com>',
          'Hore! Langganan Thriftly Aktif 🎉',
          `Halo! Selamat, pembayaran Anda telah berhasil diverifikasi.\n\nAkun Anda telah aktif. Silakan klik tombol di bawah untuk melihat status.`,
          '/profile?tab=subscription',
          'Lihat Status Akun Saya'
        )
        toast.success('Pembayaran sukses! 🎉', { duration: 5000 })
        setIsVerifying(false)
        navigate('/profile?tab=subscription')
      }
    }, 2000)
  }

  // Get dynamic pay before time (1 hour from now)
  const [payBefore, setPayBefore] = useState('')
  useEffect(() => {
    const date = new Date()
    date.setHours(date.getHours() + 1)
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }
    setPayBefore(date.toLocaleDateString('id-ID', options) + ' (GMT+07:00)')
  }, [])

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      
      {/* ── Dark Blue Countdown Bar ──────────────────────────────────── */}
      <div className="bg-[#0b1d33] text-white py-3 px-4 text-center font-semibold text-xs md:text-sm flex items-center justify-center gap-2 shadow-md">
        <Clock size={16} className="text-red-400 animate-pulse" />
        <span>Complete Payment in</span>
        <span className="bg-red-600/90 text-white font-bold px-2 py-0.5 rounded text-xs">
          {formatTime(timeLeft)}
        </span>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── Left Column: Payment Instructons ───────────────────────── */}
          <main className="lg:col-span-8 space-y-6">
            
            {/* Pay Info Card */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-6">Please Pay to</h2>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-gray-100 gap-4">
                <div>
                  <div className="text-gray-400 text-xs font-semibold mb-1">Virtual Account</div>
                  <div className="font-extrabold text-gray-900 text-lg md:text-xl flex items-center gap-2">
                    BCA Virtual Account
                  </div>
                </div>
                {/* Logo BCA */}
                <div className="flex items-center gap-3">
                  <div className="font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg text-sm border border-blue-100 tracking-wider">
                    BCA
                  </div>
                </div>
              </div>

              {/* VA Number Section */}
              <div className="py-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="text-gray-400 text-xs font-semibold mb-1.5">Virtual Account Number</div>
                  <div className="font-mono font-extrabold text-gray-900 text-xl tracking-wider">
                    1900 8000 0027 7697
                  </div>
                </div>
                <button 
                  onClick={handleCopyVa}
                  className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs transition-colors"
                >
                  {copiedVa ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  {copiedVa ? 'Copied' : 'Copy VA Number'}
                </button>
              </div>

              {/* Pay Before Section */}
              <div className="py-6 border-b border-gray-100">
                <div className="text-gray-400 text-xs font-semibold mb-1.5">Pay Before</div>
                <div className="font-bold text-gray-900 text-sm md:text-base">
                  {payBefore}
                </div>
              </div>

              {/* Check Payment Status Button */}
              <div className="pt-6">
                <button 
                  onClick={handleCheckPaymentStatus}
                  disabled={isVerifying}
                  className="w-full sm:w-auto px-8 py-3 border border-red-500 hover:bg-red-50 text-red-600 font-extrabold rounded-xl transition-all shadow-sm text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isVerifying ? 'Verifying...' : 'Check Payment Status'}
                </button>
              </div>

            </div>

            {/* How to Pay Dropdowns */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h3 className="font-extrabold text-gray-900 text-sm md:text-base mb-6 uppercase tracking-wider">How to Pay</h3>
              
              <div className="divide-y divide-gray-100">
                <div className="py-4 flex justify-between items-center cursor-pointer hover:text-blue-600">
                  <span className="font-semibold text-xs md:text-sm">BCA ATM</span>
                  <ChevronDown size={18} />
                </div>

                <div className="py-4 flex justify-between items-center cursor-pointer hover:text-blue-600">
                  <span className="font-semibold text-xs md:text-sm">m-BCA (BCA mobile)</span>
                  <ChevronDown size={18} />
                </div>

                <div className="py-4 flex justify-between items-center cursor-pointer hover:text-blue-600">
                  <span className="font-semibold text-xs md:text-sm">BCA Internet Banking</span>
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

          </main>

          {/* ── Right Column: Order Summary ────────────────────────────── */}
          <aside className="lg:col-span-4 bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h3 className="font-extrabold text-gray-900 text-sm md:text-base uppercase tracking-wider">Order Summary</h3>
              <button className="text-red-500 font-bold text-xs hover:underline">Hide Detail</button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Invoice Number</div>
                <div className="text-gray-900 font-bold text-xs md:text-sm">{invoiceParam}</div>
              </div>

              <div>
                <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Payment</div>
                <div className="text-lg md:text-xl font-extrabold text-red-600 flex items-center justify-between">
                  <span>IDR {amountParam.toLocaleString('id-ID')}</span>
                  <button 
                    onClick={handleCopyAmount}
                    className="p-1 hover:bg-slate-50 border border-slate-100 rounded text-slate-500" 
                    title="Copy Amount"
                  >
                    {copiedAmount ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2.5">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">IDR {amountParam.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600 font-bold pt-2 border-t border-dashed border-gray-100">
                  <span>Total Payment</span>
                  <span className="text-red-600 font-extrabold">IDR {amountParam.toLocaleString('id-ID')}</span>
                </div>
              </div>

            </div>

            {/* Platform Security Badge */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex gap-2.5 items-start">
              <ShieldCheck size={16} className="text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-[10px] text-emerald-800 leading-relaxed font-semibold">
                Pembayaran aman diproses melalui DOKU Payment Gateway.
              </p>
            </div>

          </aside>

        </div>
      </div>

    </div>
  )
}

export default DokuSimulation
