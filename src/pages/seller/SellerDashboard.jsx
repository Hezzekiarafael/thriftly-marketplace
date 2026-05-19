import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, Clock, CheckCircle, XCircle, DollarSign, RefreshCw, LogOut, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'
import { productService } from '../../services/productService'
import { formatCurrency } from '../../utils/helpers'
import { BUTTONS, SECTIONS } from '../../constants/copywriting'

const SellerDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalPenjualan: 0
  })

  useEffect(() => {
    if (user) {
      const fetchProducts = async () => {
        try {
          const products = await productService.getProductsBySeller(user.id)
          const soldProducts = products.filter(p => p.status === 'sold')
          const totalPenjualanSum = soldProducts.reduce((sum, p) => sum + (p.harga || 0), 0)

          setStats({
            total: products.length,
            pending: products.filter(p => p.status === 'pending').length,
            approved: products.filter(p => p.status === 'approved').length,
            rejected: products.filter(p => p.status === 'rejected').length,
            totalPenjualan: totalPenjualanSum
          })
        } catch (error) {
          console.error("Gagal load produk seller", error)
        }
      }
      fetchProducts()
    }
  }, [user])



  const handleLogout = () => {
    navigate('/', { replace: true })
    setTimeout(() => logout(), 0)
  }

  const handleWithdraw = () => {
    navigate('/seller/withdraw')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-16 md:pb-0">
      <Header />

      <Container>
        <div className="bg-white rounded-2xl p-4 md:p-8 shadow-sm md:shadow-soft border border-gray-100 mb-6 md:mb-8 mt-4 md:mt-8 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
                Dashboard Penjual
              </h1>
              <p className="text-xs md:text-base text-gray-600 mb-2 md:mb-3">
                Halo, {user?.profile?.nama || 'Juragan'}! Kelola barang jualan kamu di sini.
              </p>
              <p className="text-xs md:text-sm text-gray-500 font-medium flex items-center gap-1 md:gap-1.5 bg-gray-50 w-fit px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg border border-gray-200">
                <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-600 shrink-0" />
                {user?.profile?.alamat || 'Alamat Toko Belum Diatur'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="!p-4 md:!p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 mb-0.5 md:mb-1">Total Produk</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Package className="text-accent-500 w-8 h-8 md:w-10 md:h-10 shrink-0" />
            </div>
          </Card>

          <Card className="!p-4 md:!p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 mb-0.5 md:mb-1">Pending Review</p>
                <p className="text-2xl md:text-3xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <Clock className="text-amber-500 w-8 h-8 md:w-10 md:h-10 shrink-0" />
            </div>
          </Card>

          <Card className="!p-4 md:!p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 mb-0.5 md:mb-1">Approved</p>
                <p className="text-2xl md:text-3xl font-bold text-indigo-600">{stats.approved}</p>
              </div>
              <CheckCircle className="text-indigo-500 w-8 h-8 md:w-10 md:h-10 shrink-0" />
            </div>
          </Card>

          <Card className="!p-4 md:!p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 mb-0.5 md:mb-1">Rejected</p>
                <p className="text-2xl md:text-3xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="text-red-500 w-8 h-8 md:w-10 md:h-10 shrink-0" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="!p-4 md:!p-6">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h2 className="text-base md:text-xl font-bold text-gray-900">Saldo</h2>
              <DollarSign className="text-green-600 w-6 h-6 md:w-8 md:h-8 shrink-0" />
            </div>
            <div className="space-y-2 md:space-y-3">
              <div className="flex justify-between items-center p-2.5 md:p-3 bg-green-50 rounded-lg text-xs md:text-sm">
                <span className="text-gray-700 font-medium">Total Penjualan</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(stats.totalPenjualan || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-2.5 md:p-3 bg-amber-50 rounded-lg text-xs md:text-sm">
                <span className="text-gray-700">Saldo Ketahanan</span>
                <span className="font-bold text-amber-600">
                  {formatCurrency(user?.saldo?.ketahan || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-2.5 md:p-3 bg-indigo-50 rounded-lg text-xs md:text-sm">
                <span className="text-gray-700">Bisa Ditarik</span>
                <span className="font-bold text-indigo-600">
                  {formatCurrency(stats.totalPenjualan || 0)}
                </span>
              </div>
            </div>
            <Button
              variant="primary"
              fullWidth
              className="mt-4 shadow-md hover:scale-[1.02] active:scale-[0.98] py-2 md:py-2.5 text-xs md:text-sm"
              onClick={handleWithdraw}
            >
              {BUTTONS.withdraw}
            </Button>
          </Card>

          <Card className="!p-4 md:!p-6">
            <h2 className="text-base md:text-xl font-bold text-gray-900 mb-3 md:mb-4">
              Quick Actions
            </h2>
            <div className="flex flex-col gap-3">
              <Link to="/seller/orders" className="block w-full">
                <Button fullWidth variant="primary" className="shadow-md hover:scale-[1.02] active:scale-[0.98] py-2 md:py-2.5 text-xs md:text-sm">
                  Pesanan Toko / Transaksi
                </Button>
              </Link>
              <Link to="/seller/products/add" className="block w-full">
                <Button fullWidth variant="accent" className="shadow-md hover:scale-[1.02] active:scale-[0.98] py-2 md:py-2.5 text-xs md:text-sm">
                  {BUTTONS.sell}
                </Button>
              </Link>
              <Link to="/seller/products" className="block w-full">
                <Button fullWidth variant="outline" className="shadow-sm hover:bg-indigo-50 py-2 md:py-2.5 text-xs md:text-sm">
                  {SECTIONS.myProducts}
                </Button>
              </Link>

              {/* Tombol Logout — hanya tampil di mobile */}
              <div className="md:hidden pt-3 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 font-semibold transition-colors text-xs"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                  Keluar dari Akun
                </button>
              </div>
            </div>
          </Card>
        </div>
      </Container>

      <Footer />
    </div>
  )
}

export default SellerDashboard
