import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Copy, Clock, CheckCircle, ChevronLeft, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import Button from '../../components/common/Button'
import { transactionService } from '../../services/transactionService'
import { formatCurrency } from '../../utils/helpers'

const PaymentDetail = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  
  const [transaction, setTransaction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkingStatus, setCheckingStatus] = useState(false)

  useEffect(() => {
    fetchTransaction()
  }, [orderId])

  const fetchTransaction = async () => {
    try {
      const data = await transactionService.getTransactionByOrderId(orderId)
      if (data) {
        setTransaction(data)
      } else {
        toast.error('Transaksi tidak ditemukan')
      }
    } catch (error) {
      toast.error('Gagal memuat data pembayaran')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckStatus = async () => {
    setCheckingStatus(true)
    try {
      const data = await transactionService.getTransactionByOrderId(orderId)
      if (data) {
        setTransaction(data)
        if (data.status === 'paid' || data.status === 'settlement') {
          toast.success('Pembayaran berhasil dikonfirmasi!')
        } else {
          toast.success('Status pembayaran belum berubah. Silakan coba lagi nanti.')
        }
      }
    } catch (error) {
      toast.error('Gagal mengecek status')
    } finally {
      setCheckingStatus(false)
    }
  }

  const handleCopyVA = () => {
    if (transaction?.va_number) {
      navigator.clipboard.writeText(transaction.va_number)
      toast.success('Nomor VA berhasil disalin')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 pb-16 md:pb-0">
        <Header />
        <main className="flex-grow py-8">
          <Container maxWidth="max-w-2xl">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-40 mb-6"></div>
              <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
                <div className="bg-gray-300 p-6 text-center">
                  <div className="h-7 bg-gray-400/30 rounded w-56 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-400/30 rounded w-40 mx-auto"></div>
                </div>
                <div className="p-6 space-y-6">
                  <div className="h-20 bg-gray-200 rounded-xl"></div>
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-7 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="h-20 bg-gray-200 rounded-xl"></div>
                  <div className="h-12 bg-gray-300 rounded-xl w-full"></div>
                </div>
              </div>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <Container className="flex-grow flex flex-col items-center justify-center text-center">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Transaksi Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">Pastikan Order ID yang Anda masukkan benar.</p>
          <Button onClick={() => navigate('/buyer/orders')}>Kembali ke Pesanan</Button>
        </Container>
        <Footer />
      </div>
    )
  }

  const isPaid = transaction.status === 'paid' || transaction.status === 'settlement'

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-16 md:pb-0">
      <Header />
      
      <main className="flex-grow py-8">
        <Container maxWidth="max-w-2xl">
          <Link to="/buyer/orders" className="inline-flex items-center text-sm text-gray-500 hover:text-primary-600 mb-6">
            <ChevronLeft size={16} className="mr-1" /> Kembali ke Pesanan Saya
          </Link>

          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
            <div className="bg-primary-600 p-6 text-white text-center">
              <h1 className="text-2xl font-bold mb-2">Selesaikan Pembayaran</h1>
              <p className="text-primary-100 text-sm">Order ID: {transaction.order_id}</p>
            </div>

            <div className="p-6 space-y-6">
              {isPaid ? (
                <div className="bg-green-50 text-green-800 p-6 rounded-xl flex flex-col items-center text-center border border-green-200">
                  <CheckCircle size={48} className="text-green-500 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Pembayaran Berhasil!</h3>
                  <p className="text-sm">Terima kasih, pembayaran Anda telah kami terima dan pesanan akan segera diproses.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                    <Clock className="text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-orange-800 mb-1">Batas Waktu Pembayaran</p>
                      <p className="text-orange-700 font-mono">
                        {transaction.expiry_time ? new Date(transaction.expiry_time).toLocaleString('id-ID') : '1x24 Jam dari sekarang'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                      <span className="text-gray-600">Total Tagihan</span>
                      <span className="text-2xl font-bold text-primary-700">
                        {formatCurrency(transaction.harga_final || transaction.price || 0)}
                      </span>
                    </div>

                    <div className="pt-2">
                      <p className="text-sm text-gray-500 mb-2">Transfer ke Bank {transaction.bank ? transaction.bank.toUpperCase() : 'BCA'}</p>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Nomor Virtual Account</p>
                          <p className="text-xl font-mono font-bold text-gray-900 tracking-wider">
                            {transaction.va_number || 'Sedang memproses...'}
                          </p>
                        </div>
                        <button 
                          onClick={handleCopyVA}
                          className="text-primary-600 hover:text-primary-700 flex flex-col items-center gap-1 text-sm font-medium p-2"
                        >
                          <Copy size={20} />
                          <span className="text-xs">Salin</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-gray-100">
                    <Button 
                      fullWidth 
                      size="lg" 
                      onClick={handleCheckStatus}
                      isLoading={checkingStatus}
                    >
                      Cek Status Pembayaran
                    </Button>
                    <p className="text-center text-xs text-gray-500 mt-4">
                      Sudah membayar tapi status belum berubah? Tunggu beberapa menit lalu klik tombol di atas.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  )
}

export default PaymentDetail
