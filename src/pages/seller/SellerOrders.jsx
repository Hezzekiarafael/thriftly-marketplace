import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Truck, Clock } from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import Card from '../../components/common/Card'
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

const SellerOrders = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('Semua')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ perluDiproses: 0, telahDiproses: 0, batal: 0, pendapatan: 0 })

  // State untuk modal konfirmasi ongkir
  const [konfirmasiOrder, setKonfirmasiOrder] = useState(null) // order yang sedang dikonfirmasi
  const [pilihanOngkir, setPilihanOngkir] = useState('pembeli') // 'pembeli' atau 'penjual'
  const [isSubmittingKonfirmasi, setIsSubmittingKonfirmasi] = useState(false)

  const tabs = ['Semua', 'Perlu Diproses', 'Telah Diproses', 'Pembatalan']

  useEffect(() => {
    if (user) {
      loadOrders()
    }
  }, [user])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const sellerOrders = await transactionService.getTransactionsBySeller()
      
      // Enrich with product & buyer
      const enrichedOrders = await Promise.all(sellerOrders.map(async (order) => {
        const product = await productService.getProductById(order.productId)
        const buyer = await userService.getUserById(order.buyerId)
        return {
          ...order,
          product,
          buyer
        }
      }))
      
      const sortedOrders = enrichedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      
      setOrders(sortedOrders)
      
      setStats({
          perluDiproses: sortedOrders.filter(o => o.status === 'paid' || o.status === 'settlement').length,
          telahDiproses: sortedOrders.filter(o => o.status === 'shipped' || o.status === 'completed').length,
          batal: sortedOrders.filter(o => o.status === 'retur').length,
          pendapatan: sortedOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.hargaFinal, 0)
      })
    } catch (error) {
      console.error('Failed to load seller orders', error)
      toast.error('Gagal memuat data pesanan')
    } finally {
      setLoading(false)
    }
  }

  const handleKonfirmasiOngkir = async () => {
    if (!konfirmasiOrder) return
    setIsSubmittingKonfirmasi(true)
    try {
      await api.post(`/transactions/${konfirmasiOrder.id}/nego/seller`, {
        nego_ongkir_by: pilihanOngkir // 'pembeli' atau 'penjual'
      })
      toast.success(
        pilihanOngkir === 'pembeli'
          ? 'Ongkir ditanggung pembeli. Pembeli akan segera membayar!'
          : 'Ongkir gratis untuk pembeli! Pesanan menunggu konfirmasi pembayaran.'
      )
      setKonfirmasiOrder(null)
      loadOrders()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengkonfirmasi ongkir')
    } finally {
      setIsSubmittingKonfirmasi(false)
    }
  }

  const handleKirim = (id) => {
    if (window.confirm('Proses pengiriman pesanan ini?')) {
        try {
            transactionService.markAsShipped(id)
            toast.success('Pesanan berhasil diproses & dikirim!')
            loadOrders()
        } catch (error) {
            toast.error('Gagal memperbarui status pengiriman')
        }
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'menunggu_konfirmasi_penjual': return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">⏳ Perlu Konfirmasi Ongkir</span>
      case 'pending': return <Badge variant="warning">Menunggu Pembayaran</Badge>
      case 'paid':
      case 'settlement': return <Badge variant="info">Perlu Dikirim</Badge>
      case 'shipped': return <Badge variant="primary">Sedang Dikirim</Badge>
      case 'completed': return <Badge variant="success">Selesai</Badge>
      case 'retur': return <Badge variant="error">Dibatalkan/Retur</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  const filteredOrders = orders.filter(order => {
      if (activeTab === 'Semua') return true
      if (activeTab === 'Perlu Diproses') return order.status === 'paid' || order.status === 'settlement'
      if (activeTab === 'Telah Diproses') return order.status === 'shipped' || order.status === 'completed'
      if (activeTab === 'Pembatalan') return order.status === 'retur'
      return true
  })

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 pb-16 md:pb-0">
        <Header />
        <main className="flex-grow py-8">
          <Container>
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded-lg w-64 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 text-center">
                    <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
                  </div>
                ))}
              </div>
              <div className="flex space-x-8 border-b border-gray-200 mb-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                ))}
              </div>
              {[1, 2].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="h-4 bg-gray-200 rounded w-36"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded-full w-28"></div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-xl shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-16 bg-gray-200 rounded-lg w-full mt-2"></div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <div className="h-10 bg-gray-200 rounded-xl w-28"></div>
                    <div className="h-10 bg-gray-200 rounded-xl w-32"></div>
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
        <Container>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Menu Transaksi (Orderan)
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="text-center py-6">
              <p className="text-3xl font-bold text-primary-600 mb-2">{stats.perluDiproses}</p>
              <p className="text-sm font-medium text-gray-500">Pengiriman Perlu Diproses</p>
            </Card>
            <Card className="text-center py-6">
              <p className="text-3xl font-bold text-teal-600 mb-2">{stats.telahDiproses}</p>
              <p className="text-sm font-medium text-gray-500">Pengiriman Telah Diproses</p>
            </Card>
            <Card className="text-center py-6">
              <p className="text-3xl font-bold text-red-600 mb-2">{stats.batal}</p>
              <p className="text-sm font-medium text-gray-500">Pengembalian/Pembatalan</p>
            </Card>
            <Card className="text-center py-6">
              <p className="text-3xl font-bold text-green-600 mb-2">{formatCurrency(stats.pendapatan)}</p>
              <p className="text-sm font-medium text-gray-500">Total Pendapatan Sukses</p>
            </Card>
          </div>

          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {tabs.map(tab => (
                <button
                  key={tab}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 shadow-soft border border-gray-100 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                  <ShoppingBag size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Belum ada orderan di kategori ini
                </h3>
                <p className="text-gray-500">
                  Terus promosikan produkmu agar laris manis!
                </p>
              </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">Pembeli: {order.buyer?.profile?.nama || 'Pengguna'}</span>
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
                      <p className="text-sm text-gray-500 mb-2">Total Tagihan: <span className="font-bold text-primary-700">{formatCurrency(order.hargaFinal)}</span></p>
                      
                      <div className="bg-gray-50 rounded-lg p-3 mt-3 text-sm">
                        <p className="font-medium text-gray-700 mb-1 flex items-center gap-1"><Truck size={14}/> Info Pengiriman:</p>
                        <p className="text-gray-600 line-clamp-2">{order.alamatPengiriman}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button variant="outline" onClick={() => window.location.href = `/chat?product=${order.productId}&user=${order.buyerId}`}>
                      Chat Pembeli
                    </Button>
                    {order.status === 'menunggu_konfirmasi_penjual' && (
                      <Button
                        onClick={() => {
                          setKonfirmasiOrder(order)
                          setPilihanOngkir('pembeli')
                        }}
                        className="!bg-emerald-600 hover:!bg-emerald-700"
                      >
                        Konfirmasi Ongkir
                      </Button>
                    )}
                    {(order.status === 'paid' || order.status === 'settlement') && (
                      <Button onClick={() => handleKirim(order.id)}>
                        Kirim Pesanan
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

      {/* Modal Konfirmasi Ongkir */}
      <Modal
        isOpen={!!konfirmasiOrder}
        onClose={() => !isSubmittingKonfirmasi && setKonfirmasiOrder(null)}
        title="Siapa yang Tanggung Ongkir?"
        size="sm"
      >
        {konfirmasiOrder && (
          <div>
            {/* Rincian Pengiriman */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">Rincian Pengiriman Diajukan Pembeli</p>
              <p className="text-sm text-gray-700">Layanan: <span className="font-semibold">{konfirmasiOrder.courier || '-'}</span></p>
              <p className="text-sm text-gray-700 mt-1">Biaya ongkir: <span className="font-bold text-amber-700">{formatCurrency(konfirmasiOrder.ongkir || 0)}</span></p>
            </div>

            <p className="text-sm text-gray-600 mb-4">Pembeli telah membuat pesanan dan mengajukan ongkos kirim di atas. Silakan tentukan siapa yang akan menanggung ongkos kirim tersebut.</p>

            {/* Pilihan */}
            <div className="space-y-3 mb-6">
              <label
                className={`flex items-start gap-3 border rounded-xl p-4 cursor-pointer transition-all ${pilihanOngkir === 'pembeli' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}
                onClick={() => setPilihanOngkir('pembeli')}
              >
                <input type="radio" name="pilihanOngkir" checked={pilihanOngkir === 'pembeli'} readOnly className="mt-0.5 text-primary-600" />
                <div>
                  <p className="font-semibold text-gray-900">Tanggung Pembeli (Sistem DOKU)</p>
                  <p className="text-xs text-gray-500 mt-0.5">Pembeli akan memilih ekspedisi dan ongkir ditambahkan ke tagihan sistem mereka.</p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 border rounded-xl p-4 cursor-pointer transition-all ${pilihanOngkir === 'penjual' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}
                onClick={() => setPilihanOngkir('penjual')}
              >
                <input type="radio" name="pilihanOngkir" checked={pilihanOngkir === 'penjual'} readOnly className="mt-0.5 text-primary-600" />
                <div>
                  <p className="font-semibold text-gray-900">Tanggung Penjual (Gratis Ongkir)</p>
                  <p className="text-xs text-gray-500 mt-0.5">Anda akan membayarkan ongkir ke kurir menggunakan uang Anda sendiri saat mengirim barang.</p>
                </div>
              </label>
            </div>

            <Button fullWidth isLoading={isSubmittingKonfirmasi} onClick={handleKonfirmasiOngkir}>
              Konfirmasi
            </Button>
          </div>
        )}
      </Modal>

    </div>
  )
}

export default SellerOrders
