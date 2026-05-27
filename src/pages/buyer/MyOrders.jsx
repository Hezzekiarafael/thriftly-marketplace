import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Clock, CheckCircle2, AlertCircle, Truck, XCircle } from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import { useAuth } from '../../context/AuthContext'
import { transactionService } from '../../services/transactionService'
import { productService } from '../../services/productService'
import { userService } from '../../services/userService'
import { formatCurrency, formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'
import api from '../../services/api'

const MyOrders = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [orderToComplete, setOrderToComplete] = useState(null)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState(null)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    if (user) {
      loadOrders()
    }
  }, [user])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const userOrders = await transactionService.getTransactionsByBuyer(user.id)
      
      // Enrich orders with product and seller data
      const enrichedOrders = await Promise.all(userOrders.map(async (order) => {
        const product = await productService.getProductById(order.productId)
        const seller = await userService.getUserById(order.sellerId)
        return {
          ...order,
          product,
          seller
        }
      }))
      
      const sortedOrders = enrichedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setOrders(sortedOrders)
    } catch (error) {
      console.error('Failed to load orders', error)
      toast.error('Gagal memuat pesanan')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentRedirect = async (order) => {
    if (order.payment_url) {
      window.location.href = order.payment_url;
      return;
    }

    // Semua pesanan sekarang melalui alur nego
    try {
      toast.loading('Mengambil link pembayaran...', { id: 'payment' });
      const res = await api.post(`/transactions/nego-pay/${order.id}`, {
        frontend_url: window.location.origin
      });
      toast.dismiss('payment');
      if (res.data?.payment_url) {
        window.location.href = res.data.payment_url;
      } else {
        toast.error('Gagal mendapatkan link pembayaran dari Doku');
      }
    } catch (e) {
      toast.dismiss('payment');
      // Fallback ke payment/token
      try {
        const hargaDasar = (order.hargaFinal || 0) - (order.ongkir || 0) - 2500;
        const response = await api.post('/payment/token', {
          product_id: order.productId,
          price: hargaDasar,
          seller_id: order.sellerId,
          alamat_pengiriman: order.alamatPengiriman || '-',
          ongkir: order.ongkir || 0,
          return_url: `${window.location.origin}/buyer/orders`,
          callback_url: `${window.location.origin}/buyer/orders`
        });
        if (response.data?.payment_url) {
          window.location.href = response.data.payment_url;
        } else {
          toast.error('Gagal mendapatkan link pembayaran dari Doku');
        }
      } catch (fallbackErr) {
        toast.error('Gagal memproses pembayaran: ' + (fallbackErr.response?.data?.message || fallbackErr.message));
      }
    }
  }

  const handleOpenDetail = (order) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  const handleOpenConfirmModal = (id) => {
    setOrderToComplete(id)
    setConfirmModalOpen(true)
  }

  const confirmSelesaikanPesanan = async () => {
    if (orderToComplete) {
      try {
        await transactionService.markAsCompleted(orderToComplete)
        toast.success('Pesanan selesai! Terima kasih.')
        loadOrders()
        setConfirmModalOpen(false)
        setOrderToComplete(null)
      } catch (error) {
        toast.error('Gagal menyelesaikan pesanan')
      }
    }
  }

  const handleOpenCancelModal = (order) => {
    setOrderToCancel(order)
    setCancelModalOpen(true)
  }

  const confirmBatalPesanan = async () => {
    if (!orderToCancel) return
    setIsCancelling(true)
    try {
      await transactionService.markAsCancelled(orderToCancel.id)
      toast.success('Pesanan berhasil dibatalkan.')
      loadOrders()
      setCancelModalOpen(false)
      setOrderToCancel(null)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal membatalkan pesanan')
    } finally {
      setIsCancelling(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'menunggu_konfirmasi_penjual':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">⏳ Menunggu Ongkir</span>
      case 'menunggu_konfirmasi_pembeli':
      case 'menunggu_pembayaran':
      case 'pending':
        return <Badge variant="warning">Menunggu Pembayaran</Badge>
      case 'paid':
      case 'settlement':
        return <Badge variant="info">Dikemas Penjual</Badge>
      case 'shipped':
        return <Badge variant="primary">Sedang Dikirim</Badge>
      case 'completed':
        return <Badge variant="success">Selesai</Badge>
      case 'retur':
        return <Badge variant="error">Diretur</Badge>
      case 'cancelled':
        return <Badge variant="error">Dibatalkan</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 pb-16 md:pb-0">
        <Header />
        <main className="flex-grow py-8">
          <Container maxWidth="max-w-4xl">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="h-4 bg-gray-200 rounded w-40"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded-full w-28"></div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-xl shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-5 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <div className="h-10 bg-gray-200 rounded-xl w-24"></div>
                    <div className="h-10 bg-gray-200 rounded-xl w-28"></div>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-16 md:pb-0">
      <Header />
      
      <main className="flex-grow py-8">
        <Container maxWidth="max-w-4xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Pesanan Saya</h1>

          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-soft border border-gray-100">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package size={32} className="text-gray-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Belum ada pesanan nih</h2>
              <p className="text-gray-500 mb-6">Yuk mulai cari barang-barang menarik di Stuffus!</p>
              <Button onClick={() => window.location.href = '/products'}>Mulai Belanja</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">Belanja dari {order.seller?.profile?.nama || 'Penjual'}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                    </div>
                    <div>{getStatusBadge(order.status)}</div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                      <img 
                        src={order.product?.fotos?.[0] || 'https://via.placeholder.com/150'} 
                        alt={order.product?.nama} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{order.product?.nama || 'Produk tidak tersedia'}</h3>
                      <p className="text-sm text-gray-500 mb-2">Total Belanja</p>
                      <p className="font-bold text-primary-700">{formatCurrency(order.hargaFinal || 0)}</p>
                    </div>
                  </div>

                  {order.status === 'menunggu_konfirmasi_penjual' && (
                    <div className="bg-amber-50 rounded-xl p-4 mb-4 flex items-start gap-3 border border-amber-100">
                      <Clock className="text-amber-600 shrink-0 mt-0.5" size={18} />
                      <div>
                        <p className="text-sm font-medium text-amber-900">Menunggu Konfirmasi Ongkir</p>
                        <p className="text-xs text-amber-700 mt-1">Penjual sedang meninjau pesananmu dan akan menentukan siapa yang menanggung ongkir. Mohon tunggu sebentar.</p>
                      </div>
                    </div>
                  )}

                  {order.status === 'shipped' && (
                    <div className="bg-blue-50 rounded-xl p-4 mb-4 flex items-start gap-3 border border-blue-100">
                      <Truck className="text-blue-600 shrink-0 mt-0.5" size={18} />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Barang sedang dalam perjalanan</p>
                        <p className="text-xs text-blue-700 mt-1">Silakan klik "Selesaikan Pesanan" jika barang sudah diterima dengan baik.</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-nowrap overflow-x-auto hide-scrollbar sm:flex-wrap justify-start sm:justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-100">
                    <Button variant="outline" className="!px-2.5 !py-1.5 !text-[11px] sm:!px-4 sm:!py-2 sm:!text-sm whitespace-nowrap shrink-0" onClick={() => handleOpenDetail(order)}>
                      Detail
                    </Button>
                    <Button variant="outline" className="!px-2.5 !py-1.5 !text-[11px] sm:!px-4 sm:!py-2 sm:!text-sm whitespace-nowrap shrink-0" onClick={() => navigate(`/chat?product=${order.productId}&user=${order.sellerId}`)}>
                      Chat Penjual
                    </Button>
                    
                    {order.status === 'menunggu_konfirmasi_penjual' && (
                      <button
                        onClick={() => handleOpenCancelModal(order)}
                        className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl border border-red-200 text-red-600 font-medium text-[11px] sm:text-sm bg-white hover:bg-red-50 hover:border-red-400 active:scale-95 transition-all duration-150 whitespace-nowrap shrink-0"
                      >
                        <XCircle size={12} className="sm:w-4 sm:h-4" />
                        Batal
                      </button>
                    )}

                    {(order.status === 'pending' || order.status === 'menunggu_pembayaran' || order.status === 'menunggu_konfirmasi_pembeli') && (
                      <>
                        <button
                          onClick={() => handleOpenCancelModal(order)}
                          className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl border border-red-200 text-red-600 font-medium text-[11px] sm:text-sm bg-white hover:bg-red-50 hover:border-red-400 active:scale-95 transition-all duration-150 whitespace-nowrap shrink-0"
                        >
                          <XCircle size={12} className="sm:w-4 sm:h-4" />
                          Batal
                        </button>
                        <Button 
                          className="!px-2.5 !py-1.5 !text-[11px] sm:!px-4 sm:!py-2 sm:!text-sm whitespace-nowrap shrink-0" 
                          onClick={() => handlePaymentRedirect(order)}
                        >
                          Bayar
                        </Button>
                      </>
                    )}

                    {order.status === 'shipped' && (
                      <Button className="!px-2.5 !py-1.5 !text-[11px] sm:!px-4 sm:!py-2 sm:!text-sm whitespace-nowrap shrink-0" onClick={() => handleOpenConfirmModal(order.id)}>
                        Selesaikan
                      </Button>
                    )}
                    {order.status === 'completed' && (
                      <Button variant="secondary" className="!px-2.5 !py-1.5 !text-[11px] sm:!px-4 sm:!py-2 sm:!text-sm whitespace-nowrap shrink-0" onClick={() => navigate(`/products/${order.productId}`)}>
                        Beli Lagi
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </main>

      <Footer />

      {/* Modal Rincian Pesanan */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Rincian Pesanan"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="flex justify-between items-start pb-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Nomor Order</p>
                <p className="font-bold text-gray-900">{selectedOrder.order_id || selectedOrder.id}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tanggal Transaksi</p>
                <p className="font-medium text-gray-900">{formatDate(selectedOrder.createdAt)}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Package className="text-primary-600" size={18} />
                <h3 className="font-semibold text-gray-900">Detail Produk</h3>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 flex gap-4 border border-gray-100">
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-white">
                  <img 
                    src={selectedOrder.product?.fotos?.[0] || 'https://via.placeholder.com/150'} 
                    alt={selectedOrder.product?.nama} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedOrder.product?.nama}</p>
                  <p className="text-xs text-gray-500 mt-1">Penjual: {selectedOrder.seller?.profile?.nama || 'Penjual'}</p>
                  <p className="font-bold text-primary-700 mt-1">{formatCurrency(selectedOrder.hargaFinal || selectedOrder.price || 0)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <h3 className="font-semibold text-gray-900 mb-2">Info Pengiriman</h3>
                <div className="flex-1 text-sm text-gray-600 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <p className="font-medium text-gray-900 mb-1">Alamat:</p>
                  <p className="mb-3">{selectedOrder.alamatPengiriman || 'Alamat tidak tersedia'}</p>
                  <p className="font-medium text-gray-900 mb-1">Estimasi Sampai:</p>
                  <p>2 - 4 Hari Kerja</p>
                </div>
              </div>
              <div className="flex flex-col">
                <h3 className="font-semibold text-gray-900 mb-2">Rincian Pembayaran</h3>
                <div className="flex-1 space-y-2 text-sm bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Harga Barang</span>
                    <span>{formatCurrency((selectedOrder.hargaFinal || 0) - (selectedOrder.ongkir || 0) - 2500)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Ongkos Kirim</span>
                    <span>{formatCurrency(selectedOrder.ongkir || 0)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Biaya Layanan</span>
                    <span>{formatCurrency(2500)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 pt-3 border-t border-gray-100 mt-3">
                    <span>Total Bayar</span>
                    <span className="text-primary-700">{formatCurrency(selectedOrder.hargaFinal || 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button fullWidth onClick={() => setIsModalOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Konfirmasi Selesaikan Pesanan */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Selesaikan Pesanan"
      >
        <div className="space-y-6">
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex gap-3 text-orange-800">
            <AlertCircle className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Perhatian!</p>
              <p className="text-sm">
                Pastikan barang sudah Anda terima dengan baik dan sesuai pesanan. 
                Jika Anda menekan <span className="font-semibold">"Ya, Selesaikan"</span>, dana akan diteruskan ke penjual dan pesanan tidak dapat diretur/dikembalikan.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button variant="outline" fullWidth onClick={() => setConfirmModalOpen(false)}>
              Batal
            </Button>
            <Button fullWidth onClick={confirmSelesaikanPesanan}>
              Ya, Selesaikan
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Konfirmasi Batal Pesanan */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Batalkan Pesanan"
      >
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3 text-red-800">
            <XCircle className="shrink-0 mt-0.5 text-red-500" size={22} />
            <div>
              <p className="font-semibold mb-1">Batalkan pesanan ini?</p>
              <p className="text-sm">
                Pesanan untuk <span className="font-semibold">{orderToCancel?.product?.nama || 'produk ini'}</span> akan dibatalkan.
                Tindakan ini <span className="font-semibold">tidak dapat dibatalkan</span> setelah dikonfirmasi.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" fullWidth onClick={() => setCancelModalOpen(false)} disabled={isCancelling}>
              Kembali
            </Button>
            <button
              onClick={confirmBatalPesanan}
              disabled={isCancelling}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold text-sm active:scale-95 transition-all duration-150"
            >
              {isCancelling ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <XCircle size={16} />
              )}
              {isCancelling ? 'Membatalkan...' : 'Ya, Batalkan Pesanan'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default MyOrders