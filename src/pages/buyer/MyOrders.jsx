import { useEffect, useState } from 'react'
import { Package, Clock, CheckCircle2, AlertCircle, Truck } from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import { useAuth } from '../../context/AuthContext'
import { transactionService } from '../../services/transactionService'
import { productService } from '../../services/productService'
import { userService } from '../../services/userService'
import { formatCurrency, formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'

const MyOrders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

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

  const handleSelesaikanPesanan = (id) => {
    if (window.confirm('Pastikan barang sudah diterima dengan baik dan sesuai. Dana akan diteruskan ke penjual. Lanjutkan?')) {
      try {
        transactionService.markAsCompleted(id)
        toast.success('Pesanan selesai! Terima kasih.')
        loadOrders()
      } catch (error) {
        toast.error('Gagal menyelesaikan pesanan')
      }
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Menunggu Pembayaran</Badge>
      case 'paid':
        return <Badge variant="info">Dikemas Penjual</Badge>
      case 'shipped':
        return <Badge variant="primary">Sedang Dikirim</Badge>
      case 'completed':
        return <Badge variant="success">Selesai</Badge>
      case 'retur':
        return <Badge variant="error">Diretur</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <Container className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </Container>
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
                      <p className="font-bold text-primary-700">{formatCurrency((order.hargaFinal || 0) + (order.ongkir || 0) + 2500)}</p>
                    </div>
                  </div>

                  {order.status === 'shipped' && (
                    <div className="bg-blue-50 rounded-xl p-4 mb-4 flex items-start gap-3 border border-blue-100">
                      <Truck className="text-blue-600 shrink-0 mt-0.5" size={18} />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Barang sedang dalam perjalanan</p>
                        <p className="text-xs text-blue-700 mt-1">Silakan klik "Selesaikan Pesanan" jika barang sudah diterima dengan baik.</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button variant="outline" onClick={() => window.location.href = `/chat?product=${order.productId}&user=${order.sellerId}`}>
                      Chat Penjual
                    </Button>
                    {order.status === 'shipped' && (
                      <Button onClick={() => handleSelesaikanPesanan(order.id)}>
                        Selesaikan Pesanan
                      </Button>
                    )}
                    {order.status === 'completed' && (
                      <Button variant="secondary" onClick={() => window.location.href = `/products/${order.productId}`}>
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
    </div>
  )
}

export default MyOrders