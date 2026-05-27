import { useState, useEffect, useMemo } from 'react'
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

import { getPrimaryValue, parseProfileList } from '../../utils/profileUtils'
import Modal from '../../components/common/Modal'

const Checkout = () => {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [product, setProduct] = useState(null)
  const [seller, setSeller] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State untuk ongkir real-time dari Biteship
  const [shippingOptions, setShippingOptions] = useState([])
  const [selectedShipping, setSelectedShipping] = useState(null)
  const [loadingShipping, setLoadingShipping] = useState(false)

  // State untuk fitur Nego Ongkir - dihapus, penjual yang menentukan

  // Mengambil daftar semua alamat user
  const userAddresses = useMemo(() => {
    const rawAlamat = user?.alamat || user?.profile?.alamat || ''
    return parseProfileList(rawAlamat, 'alamat', user?.id)
  }, [user])

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)

  // Helper: ambil alamat terpilih
  const getUserAddress = () => {
    return userAddresses[selectedAddressIndex]?.alamat || ''
  }

  // Helper: ekstrak kode pos 5 digit dari string alamat
  const extractPostal = (address) => {
    const match = address?.match(/\b\d{5}\b/g)
    return match ? match[match.length - 1] : '50131' // default Semarang
  }

  // Fetch ongkir real-time dari Biteship via backend
  const getBiteshipRates = async (productData, sellerData, overrideBuyerAddr = null) => {
    const buyerAddress = overrideBuyerAddr || getUserAddress()
    if (!buyerAddress || !productData || !sellerData) return

    setLoadingShipping(true)
    try {
      const sellerAddress = sellerData?.profile?.alamat || sellerData?.alamat || ''
      const originPostal = extractPostal(sellerAddress)
      const destPostal = extractPostal(buyerAddress)

      const parsedWeight = Math.max(1, Number(productData.berat) || 1000);

      const response = await api.post('/shipping/cost', {
        origin_postal_code: originPostal,
        destination_postal_code: destPostal,
        weight: parsedWeight,
        courier: 'jne,jnt,sicepat'
      })

      const rates = response.data?.pricing || response.data?.data?.pricing || response.data || []
      if (Array.isArray(rates) && rates.length > 0) {
        setShippingOptions(rates)
        setSelectedShipping(rates[0]) // default pilih yang pertama
      } else {
        // Fallback ke opsi default jika Biteship tidak mengembalikan data
        const fallback = [
          { courier_name: 'JNE', type: 'REG', description: 'Reguler', price: 15000, shipment_duration_range: '2-3', shipment_duration_unit: 'days' },
          { courier_name: 'JNT', type: 'REG', description: 'Reguler', price: 18000, shipment_duration_range: '2-4', shipment_duration_unit: 'days' },
        ]
        setShippingOptions(fallback)
        setSelectedShipping(fallback[0])
      }
    } catch (error) {
      console.error('Gagal ambil ongkir Biteship:', error)
      // Fallback agar checkout tetap bisa berjalan
      const fallback = [
        { courier_name: 'JNE', type: 'REG', description: 'Reguler', price: 15000, shipment_duration_range: '2-3', shipment_duration_unit: 'days' },
        { courier_name: 'JNT', type: 'REG', description: 'Reguler', price: 18000, shipment_duration_range: '2-4', shipment_duration_unit: 'days' },
      ]
      setShippingOptions(fallback)
      setSelectedShipping(fallback[0])
    } finally {
      setLoadingShipping(false)
    }
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

        // Setelah produk & seller ada, fetch ongkir real-time dari Biteship
        await getBiteshipRates(p, s)
      } catch (error) {
        toast.error('Gagal memuat data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [productId, navigate])

  // Checkout selalu melalui alur Nego: kirim request ke penjual, penjual konfirmasi ongkir
  const handleCheckout = async () => {
    if (!selectedShipping) {
      toast.error('Pilih opsi pengiriman terlebih dahulu')
      return
    }
    setIsSubmitting(true)
    try {
      const response = await api.post('/transactions/nego/request', {
        product_id: product.id,
        price: product.harga,
        seller_id: seller?.id || product.user_id,
        alamat_pengiriman: getUserAddress() || '-',
        ongkir: selectedShipping?.price || 0,
        courier: `${selectedShipping?.courier_name || ''} ${selectedShipping?.type || ''}`.trim()
      })

      if (response.data.success || response.status === 200 || response.status === 201) {
        toast.success('Pesanan berhasil dibuat! Menunggu konfirmasi ongkir dari penjual.')
        navigate('/buyer/orders')
      } else {
        throw new Error(response.data.message || 'Gagal membuat pesanan')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Gagal memproses pesanan')
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

  const ongkirNominal = selectedShipping?.price || 0
  const totalPembayaran = product.harga + ongkirNominal + 2500

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
                    {userAddresses.length > 1 && (
                      <Button variant="outline" size="sm" onClick={() => setIsAddressModalOpen(true)} className="!px-3 !py-1 text-xs">
                        Pilih Alamat Lain
                      </Button>
                    )}
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


              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="text-primary-600" size={20} />
                  <h2 className="text-lg font-semibold text-gray-900">Opsi Pengiriman</h2>
                </div>

                {loadingShipping ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="animate-pulse border border-gray-100 rounded-xl p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    ))}
                  </div>
                ) : shippingOptions.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Tidak ada opsi pengiriman tersedia.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {shippingOptions.map((option, index) => {
                      const isSelected = selectedShipping === option
                      return (
                        <label
                          key={index}
                          className={`border rounded-xl p-4 cursor-pointer transition-all ${isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}
                          onClick={() => setSelectedShipping(option)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900 text-sm">
                              {option.courier_name} - {option.type}
                            </span>
                            <input
                              type="radio"
                              name="shipping"
                              checked={isSelected}
                              onChange={() => setSelectedShipping(option)}
                              className="text-primary-600"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mb-2">
                            Estimasi {option.shipment_duration_range} {option.shipment_duration_unit === 'days' ? 'hari' : option.shipment_duration_unit}
                          </p>
                          <p className="font-semibold text-gray-900">{formatCurrency(option.price)}</p>
                        </label>
                      )
                    })}
                  </div>
                )}
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
                    <span className="text-gray-600">Ongkos Kirim (Sementara)</span>
                    <span className="font-medium text-gray-500 italic">Menunggu Konfirmasi Penjual</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Biaya Layanan Platform</span>
                    <span className="font-medium text-gray-900">{formatCurrency(2500)}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total Tagihan</span>
                    <span className="text-xl font-bold text-primary-700">{formatCurrency(product.harga + 2500)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 text-right">*Ongkir ditentukan oleh penjual</p>
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
                  disabled={isSubmitting || !getUserAddress() || !selectedShipping}
                >
                  Pesan Sekarang
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

      {/* Modal Pilih Alamat */}
      <Modal 
        isOpen={isAddressModalOpen} 
        onClose={() => setIsAddressModalOpen(false)}
        title="Pilih Alamat Pengiriman"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {userAddresses.map((addr, idx) => (
            <label 
              key={idx} 
              className={`block p-4 border rounded-xl cursor-pointer transition-all ${selectedAddressIndex === idx ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}
              onClick={() => {
                setSelectedAddressIndex(idx)
                setIsAddressModalOpen(false)
                getBiteshipRates(product, seller, addr.alamat)
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">{addr.lokasi || 'Alamat ' + (idx + 1)}</span>
                    {idx === 0 && <span className="bg-primary-100 text-primary-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Utama</span>}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{addr.alamat}</p>
                </div>
                <input 
                  type="radio" 
                  name="selectedAddress" 
                  checked={selectedAddressIndex === idx} 
                  onChange={() => {}} // dikendalikan oleh onClick wrapper
                  className="mt-1 text-primary-600"
                />
              </div>
            </label>
          ))}
        </div>
      </Modal>

    </div>
  )
}

export default Checkout