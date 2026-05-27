import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Truck, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'
import { productService } from '../../services/productService'
import { userService } from '../../services/userService'
import api from '../../services/api'
import { formatCurrency } from '../../utils/helpers'

import { getPrimaryValue } from '../../utils/profileUtils'

const Checkout = () => {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [product, setProduct] = useState(null)
  const [seller, setSeller] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [shippingOption, setShippingOption] = useState('reguler')

  const shippingRates = {
    reguler: 15000,
    next_day: 25000,
    cargo: 35000
  }

  // Helper: ambil alamat dari berbagai kemungkinan field backend
  const getUserAddress = () => {
    const rawAlamat = user?.alamat || user?.profile?.alamat || ''
    return getPrimaryValue(rawAlamat, 'alamat')
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const p = await productService.getProductById(productId)
        if (!p) {
          toast.error('Produk tidak ditemukan')
          navigate('/products')
          return
        }
        
        if (p.status !== 'approved') {
          toast.error('Produk tidak tersedia untuk dibeli')
          navigate('/products')
          return
        }

        setProduct(p)
        
        const s = await userService.getUserById(p.sellerId)
        setSeller(s)
      } catch (error) {
        toast.error('Gagal memuat data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [productId, navigate])

  const handleCheckout = async () => {
    setIsSubmitting(true)
    try {
      const response = await api.post('/payment/token', {
        product_id: product.id,
        price: product.harga,  // kirim harga bersih saja, backend yang tambah ongkir+fee
        seller_id: seller?.id || product.user_id,
        alamat_pengiriman: user.alamat || user.profile?.alamat || '-',
        ongkir: ongkir
      });

      // REDIRECT LANGSUNG KE PAYMENT PAGE DOKU
      if (response.data.payment_url) {
        window.location.href = response.data.payment_url;
        return;
      } else {
        toast.error('Gagal mendapatkan link pembayaran dari Doku');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memproses pembayaran');
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 pb-16 md:pb-0">
        <Header />
        <main className="flex-grow py-8">
          <Container maxWidth="max-w-5xl">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded-lg w-32 mb-6"></div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                    <div className="border border-gray-100 rounded-xl p-4 space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-32"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mt-2"></div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-200 rounded-xl shrink-0"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="h-24 bg-gray-200 rounded-xl"></div>
                      <div className="h-24 bg-gray-200 rounded-xl"></div>
                      <div className="h-24 bg-gray-200 rounded-xl"></div>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-4">
                  <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
                    <div className="space-y-3">
                      <div className="flex justify-between"><div className="h-4 bg-gray-200 rounded w-1/2"></div><div className="h-4 bg-gray-200 rounded w-1/4"></div></div>
                      <div className="flex justify-between"><div className="h-4 bg-gray-200 rounded w-1/2"></div><div className="h-4 bg-gray-200 rounded w-1/4"></div></div>
                      <div className="flex justify-between"><div className="h-4 bg-gray-200 rounded w-1/2"></div><div className="h-4 bg-gray-200 rounded w-1/4"></div></div>
                    </div>
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex justify-between"><div className="h-5 bg-gray-200 rounded w-1/3"></div><div className="h-6 bg-gray-200 rounded w-1/3"></div></div>
                    </div>
                    <div className="h-16 bg-gray-200 rounded-xl"></div>
                    <div className="h-12 bg-gray-300 rounded-xl w-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    )
  }

  const ongkir = shippingRates[shippingOption]
  const totalPembayaran = product.harga + ongkir + 2500 // 2500 is service fee

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-16 md:pb-0">
      <Header />
      
      <main className="flex-grow py-8">
        <Container maxWidth="max-w-5xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Details */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Alamat Pengiriman */}
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="text-primary-600" size={20} />
                  <h2 className="text-lg font-semibold text-gray-900">Alamat Pengiriman</h2>
                </div>
                
                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{user.profile?.nama}</p>
                      <p className="text-sm text-gray-500">{user.profile?.noTelp || '-'}</p>
                    </div>
                    <span className="bg-primary-50 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full">Utama</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">
                    {getUserAddress() || 'Alamat belum diatur. Silakan update profil Anda.'}
                  </p>
                </div>
              </div>

              {/* Detail Produk */}
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Barang yang Dibeli</h2>
                
                <div className="flex gap-4 items-start">
                  <div className="w-24 h-24 rounded-xl border border-gray-200 overflow-hidden shrink-0">
                    <img src={product.fotos?.[0]} alt={product.nama} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{product.nama}</h3>
                    <p className="text-sm text-gray-500 mt-1">Penjual: {seller?.profile?.nama || 'Unknown'}</p>
                    <p className="font-bold text-primary-700 mt-2">{formatCurrency(product.harga)}</p>
                  </div>
                </div>
              </div>

              {/* Opsi Pengiriman */}
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="text-primary-600" size={20} />
                  <h2 className="text-lg font-semibold text-gray-900">Opsi Pengiriman</h2>
                </div>

                <div className="space-y-4">

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label className={`border rounded-xl p-4 cursor-pointer transition-all ${shippingOption === 'reguler' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">Reguler</span>
                        <input type="radio" name="shipping" value="reguler" checked={shippingOption === 'reguler'} onChange={(e) => setShippingOption(e.target.value)} className="text-primary-600" />
                      </div>
                      <p className="text-xs text-gray-500 mb-2">2-3 hari kerja</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(shippingRates.reguler)}</p>
                    </label>
                    
                    <label className={`border rounded-xl p-4 cursor-pointer transition-all ${shippingOption === 'next_day' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">Next Day</span>
                        <input type="radio" name="shipping" value="next_day" checked={shippingOption === 'next_day'} onChange={(e) => setShippingOption(e.target.value)} className="text-primary-600" />
                      </div>
                      <p className="text-xs text-gray-500 mb-2">1 hari kerja</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(shippingRates.next_day)}</p>
                    </label>

                    <label className={`border rounded-xl p-4 cursor-pointer transition-all ${shippingOption === 'cargo' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">Cargo</span>
                        <input type="radio" name="shipping" value="cargo" checked={shippingOption === 'cargo'} onChange={(e) => setShippingOption(e.target.value)} className="text-primary-600" />
                      </div>
                      <p className="text-xs text-gray-500 mb-2">3-5 hari kerja</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(shippingRates.cargo)}</p>
                    </label>
                  </div>
                </div>
              </div>



            </div>

            {/* Right Column: Summary */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 sticky top-28">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Belanja</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Harga Barang</span>
                    <span className="font-medium text-gray-900">{formatCurrency(product.harga)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Ongkos Kirim</span>
                    <span className="font-medium text-gray-900">{formatCurrency(ongkir)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Biaya Layanan Platform</span>
                    <span className="font-medium text-gray-900">{formatCurrency(2500)}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total Tagihan</span>
                    <span className="text-xl font-bold text-primary-700">{formatCurrency(totalPembayaran)}</span>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-xl p-3 flex items-start gap-3 mb-6">
                  <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Transaksi aman. Dana akan diteruskan ke penjual setelah barang Anda terima dengan baik.
                  </p>
                </div>

                <Button 
                  fullWidth 
                  size="lg" 
                  onClick={handleCheckout}
                  isLoading={isSubmitting}
                  disabled={isSubmitting || !getUserAddress()}
                >
                  Bayar Sekarang
                </Button>
                
                {!getUserAddress() && (
                  <p className="text-xs text-red-500 text-center mt-3">
                    Silakan isi alamat pengiriman di profil terlebih dahulu.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Container>
      </main>

      <Footer />


    </div>
  )
}

export default Checkout