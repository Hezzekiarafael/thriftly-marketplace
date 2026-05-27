import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Edit, Trash2, Package, CheckCircle, RotateCcw, AlertTriangle, ShoppingBag } from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'
import { productService } from '../../services/productService'
import { formatCurrency } from '../../utils/helpers'
import { STATUS } from '../../constants/copywriting'
import toast from 'react-hot-toast'

// --- Custom Confirmation Modal ---
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, description, confirmLabel, confirmVariant = 'danger', icon: Icon, isLoading }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!isLoading ? onClose : undefined}
      />
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Icon */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
          confirmVariant === 'danger' ? 'bg-red-50 text-red-500' :
          confirmVariant === 'success' ? 'bg-green-50 text-green-600' :
          'bg-amber-50 text-amber-500'
        }`}>
          {Icon && <Icon className="w-7 h-7" />}
        </div>

        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">{title}</h3>
        <p className="text-sm text-gray-500 text-center leading-relaxed mb-6">{description}</p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-70 flex items-center justify-center gap-2 ${
              confirmVariant === 'danger' ? 'bg-red-500 hover:bg-red-600' :
              confirmVariant === 'success' ? 'bg-green-500 hover:bg-green-600' :
              'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            {isLoading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Memproses...</>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Main Page ---
const MyProducts = () => {
  const { user } = useAuth()
  const [products, setProducts] = useState([])

  // Modal state
  const [modal, setModal] = useState({ open: false, type: null, productId: null, productName: '' })
  const [isActionLoading, setIsActionLoading] = useState(false)

  useEffect(() => {
    if (user) {
      const fetchProducts = async () => {
        try {
          const data = await productService.getProductsBySeller(user.id)
          setProducts(data || [])
        } catch (error) {
          toast.error('Gagal mengambil data produk')
        }
      }
      fetchProducts()
    }
  }, [user])

  const openModal = (type, product) => {
    setModal({ open: true, type, productId: product.id, productName: product.nama })
  }

  const closeModal = () => {
    if (!isActionLoading) setModal({ open: false, type: null, productId: null, productName: '' })
  }

  const handleConfirm = async () => {
    setIsActionLoading(true)
    try {
      if (modal.type === 'delete') {
        await productService.deleteProduct(modal.productId)
        setProducts(products.filter(p => p.id !== modal.productId))
        toast.success('Produk berhasil dihapus')
      } else if (modal.type === 'sold') {
        await productService.markAsSold(modal.productId)
        setProducts(products.map(p => p.id === modal.productId ? { ...p, status: 'sold' } : p))
        toast.success('Produk berhasil ditandai terjual')
      } else if (modal.type === 'relist') {
        await productService.markAsAvailable(modal.productId)
        setProducts(products.map(p => p.id === modal.productId ? { ...p, status: 'approved' } : p))
        toast.success('Produk berhasil diaktifkan kembali!')
      }
      closeModal()
    } catch (error) {
      toast.error(error.message || 'Terjadi kesalahan')
    } finally {
      setIsActionLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      sold: 'sold'
    }
    return <Badge variant={variants[status] || 'default'}>{STATUS[status] || status}</Badge>
  }

  // Modal config per type
  const modalConfig = {
    sold: {
      title: 'Tandai Sebagai Terjual?',
      description: `Produk "${modal.productName}" akan disembunyikan dari katalog. Kamu bisa mengaktifkannya kembali kapan saja.`,
      confirmLabel: 'Ya, Tandai Terjual',
      confirmVariant: 'warning',
      icon: CheckCircle
    },
    relist: {
      title: 'Aktifkan Kembali Produk?',
      description: `Produk "${modal.productName}" akan ditampilkan kembali ke katalog sehingga pembeli dapat melihat dan membelinya.`,
      confirmLabel: 'Ya, Aktifkan Kembali',
      confirmVariant: 'success',
      icon: RotateCcw
    },
    delete: {
      title: 'Hapus Produk?',
      description: `Produk "${modal.productName}" akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.`,
      confirmLabel: 'Ya, Hapus Permanen',
      confirmVariant: 'danger',
      icon: AlertTriangle
    }
  }

  const currentModalConfig = modal.type ? modalConfig[modal.type] : {}

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-16 md:pb-0">
      <Header />

      <main className="flex-grow py-6 md:py-10">
        <Container>
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900">Produk Saya</h1>
            <Link to="/seller/products/add">
              <Button size="sm" className="md:px-6 md:py-2.5 md:text-base text-xs py-2 px-4 shadow-md font-bold">Tambah Produk</Button>
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 md:p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center max-w-md mx-auto mt-8 animate-in fade-in duration-500">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1.5 md:mb-2">Belum Ada Produk</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-6 max-w-xs">
                Kamu belum mengunggah produk apa pun untuk dijual. Yuk, mulai pajang produk pertamamu sekarang!
              </p>
              <Link to="/seller/products/add">
                <Button variant="primary" size="sm" className="px-5 py-2 font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] text-xs">
                  Mulai Jual Barang Nganggur
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl p-3 md:p-6 shadow-sm border border-gray-100 animate-in fade-in duration-300">
                  <div className="flex flex-row gap-3 md:gap-4 items-start">
                    <img
                      src={product.fotos && product.fotos.length > 0 ? product.fotos[0] : (product.image || product.image_url || 'https://via.placeholder.com/300?text=No+Image')}
                      alt={product.nama}
                      className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 object-cover rounded-xl shrink-0"
                    />

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-1.5 mb-1 md:mb-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-xs sm:text-base md:text-lg font-bold text-gray-900 leading-tight truncate">{product.nama}</h3>
                            <p className="text-sm sm:text-lg md:text-xl font-extrabold text-red-600 mt-0.5 md:mt-1">
                              {formatCurrency(product.harga)}
                            </p>
                          </div>

                          <div className="flex gap-1.5 md:gap-2 mt-1 sm:mt-0 shrink-0">
                            {/* Tandai Terjual - hanya untuk produk approved */}
                            {product.status === 'approved' && (
                              <button
                                onClick={() => openModal('sold', product)}
                                className="inline-flex items-center gap-1 text-[9px] md:text-xs py-1 px-2 md:py-1.5 md:px-3 font-bold bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Tandai Terjual
                              </button>
                            )}

                            {/* Aktifkan Kembali - hanya untuk produk sold */}
                            {product.status === 'sold' && (
                              <button
                                onClick={() => openModal('relist', product)}
                                className="inline-flex items-center gap-1 text-[9px] md:text-xs py-1 px-2 md:py-1.5 md:px-3 font-bold bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Aktifkan Lagi
                              </button>
                            )}

                            {/* Edit - semua kecuali sold */}
                            {product.status !== 'sold' && (
                              <Link to={`/seller/products/edit/${product.id}`} className="block">
                                <Button variant="outline" size="sm" className="p-1 md:p-2">
                                  <Edit className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                </Button>
                              </Link>
                            )}

                            {/* Hapus - selalu tampil */}
                            <Button
                              variant="danger"
                              size="sm"
                              className="p-1 md:p-2"
                              onClick={() => openModal('delete', product)}
                            >
                              <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 md:gap-1.5 mb-1">
                          {getStatusBadge(product.status)}
                          {product.isBU && <Badge variant="bu">BU</Badge>}
                        </div>
                      </div>

                      {product.adminNote && (
                        <div className="mt-2 p-2.5 md:p-3 bg-yellow-50 border border-yellow-100 rounded-xl">
                          <p className="text-[10px] md:text-xs font-bold text-yellow-800">Catatan Admin:</p>
                          <p className="text-[10px] md:text-xs text-yellow-700 leading-relaxed mt-0.5">{product.adminNote}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </main>

      <Footer />

      {/* Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={modal.open}
        onClose={closeModal}
        onConfirm={handleConfirm}
        isLoading={isActionLoading}
        title={currentModalConfig.title}
        description={currentModalConfig.description}
        confirmLabel={currentModalConfig.confirmLabel}
        confirmVariant={currentModalConfig.confirmVariant}
        icon={currentModalConfig.icon}
      />
    </div>
  )
}

export default MyProducts
