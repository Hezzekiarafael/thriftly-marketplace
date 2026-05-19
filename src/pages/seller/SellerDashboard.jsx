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
        <div className="bg-white rounded-2xl p-8 shadow-soft border border-gray-100 mb-8 mt-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard Penjual
              </h1>
              <p className="text-gray-600 mb-2">
                Halo, {user?.profile?.nama || 'Juragan'}! Kelola barang jualan kamu di sini.
              </p>
              <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5 bg-gray-50 w-fit px-3 py-1.5 rounded-lg border border-gray-200">
                <MapPin size={16} className="text-indigo-600" />
                {user?.profile?.alamat || 'Alamat Toko Belum Diatur'}
              </p>

            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Produk</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Package className="text-accent-500" size={40} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Review</p>
                <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <Clock className="text-amber-500" size={40} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Approved</p>
                <p className="text-3xl font-bold text-indigo-600">{stats.approved}</p>
              </div>
              <CheckCircle className="text-indigo-500" size={40} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="text-red-500" size={40} />
            </div>
          </Card>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Saldo</h2>
              <DollarSign className="text-green-600" size={32} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700 font-medium">Total Penjualan</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(stats.totalPenjualan || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                <span className="text-gray-700">Saldo Ketahanan</span>
                <span className="font-bold text-amber-600">
                  {formatCurrency(user?.saldo?.ketahan || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                <span className="text-gray-700">Bisa Ditarik</span>
                <span className="font-bold text-indigo-600">
                  {formatCurrency(stats.totalPenjualan || 0)}
                </span>
              </div>
            </div>
            <Button
              variant="primary"
              fullWidth
              className="mt-4 shadow-md hover:scale-[1.02] active:scale-[0.98]"
              onClick={handleWithdraw}
            >
              {BUTTONS.withdraw}
            </Button>

          </Card>

          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link to="/seller/orders">
                <Button fullWidth variant="primary" className="shadow-md hover:scale-[1.02] active:scale-[0.98]">
                  Pesanan Toko / Transaksi
                </Button>
              </Link>
              <Link to="/seller/products/add">
                <Button fullWidth variant="accent" className="mt-3 shadow-md hover:scale-[1.02] active:scale-[0.98]">
                  {BUTTONS.sell}
                </Button>
              </Link>
              <Link to="/seller/products">
                <Button fullWidth variant="outline" className="mt-3 shadow-sm hover:bg-indigo-50">
                  {SECTIONS.myProducts}
                </Button>
              </Link>



              {/* Tombol Logout — hanya tampil di mobile */}
              <div className="md:hidden mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 font-semibold transition-colors text-sm"
                >
                  <LogOut size={18} />
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
