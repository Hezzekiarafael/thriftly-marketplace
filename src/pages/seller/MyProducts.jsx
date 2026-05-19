import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Edit, Trash2, Package } from 'lucide-react'
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

const MyProducts = () => {
  const { user } = useAuth()
  const [products, setProducts] = useState([])

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

  const handleDelete = async (id) => {
    if (window.confirm('Yakin mau hapus produk ini?')) {
      try {
        await productService.deleteProduct(id)
        setProducts(products.filter(p => p.id !== id))
        toast.success('Produk berhasil dihapus')
      } catch (error) {
        toast.error('Gagal menghapus produk')
      }
    }
  }

  const handleMarkAsSold = async (id) => {
    if (window.confirm('Tandai produk ini sebagai terjual?')) {
      try {
        await productService.markAsSold(id)
        setProducts(products.map(p => p.id === id ? { ...p, status: 'sold' } : p))
        toast.success('Produk berhasil ditandai terjual')
      } catch (error) {
        toast.error('Gagal menandai produk terjual')
      }
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
                            {product.status === 'approved' && (
                              <Button
                                variant="success"
                                size="sm"
                                className="text-[9px] md:text-xs py-1 px-2 md:py-1.5 md:px-3 font-bold"
                                onClick={() => handleMarkAsSold(product.id)}
                              >
                                Tandai Terjual
                              </Button>
                            )}
                            {product.status !== 'sold' && (
                              <Link to={`/seller/products/edit/${product.id}`} className="block">
                                <Button variant="outline" size="sm" className="p-1 md:p-2">
                                  <Edit className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                </Button>
                              </Link>
                            )}
                            <Button
                              variant="danger"
                              size="sm"
                              className="p-1 md:p-2"
                              onClick={() => handleDelete(product.id)}
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
    </div>
  )
}

export default MyProducts
