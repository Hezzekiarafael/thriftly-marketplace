import AdminLayout from '../../components/layout/AdminLayout'
import DataTable from '../../components/common/DataTable'
import Modal from '../../components/common/Modal'
import { userService, mapLaravelUser } from '../../services/userService'
import { productService, mapLaravelProduct } from '../../services/productService'
import { transactionService } from '../../services/transactionService'
import { useEffect, useState } from 'react'
import { Eye, Package, User, MapPin, CreditCard, Calendar, Clock } from 'lucide-react'
import { formatCurrency, formatDate, formatDateTime } from '../../utils/helpers'
import toast from 'react-hot-toast'

const Transactions = () => {
  const [transactions, setTransactions] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTrx, setSelectedTrx] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    loadTransactions();
  }, [])

  const loadTransactions = async () => {
    try {
      const data = await transactionService.getAdminTransactions();
      setTransactions(data || []);
    } catch (error) {
      console.error("Gagal load transaksi", error);
    }
  };

  const handleViewDetails = async (row) => {
    setSelectedTrx(row)
    setIsModalOpen(true)
    setLoadingDetail(true)
    
    try {
      // Pastikan data diproses lewat mapping agar formatnya seragam (.profile.nama, dll)
      const [product, buyer, seller] = await Promise.all([
        row.product ? Promise.resolve(mapLaravelProduct(row.product)) : productService.getProductById(row.productId),
        row.buyer ? Promise.resolve(mapLaravelUser(row.buyer)) : userService.getUserById(row.buyerId),
        row.seller ? Promise.resolve(mapLaravelUser(row.seller)) : userService.getUserById(row.sellerId)
      ])
      
      setSelectedTrx({
        ...row,
        product,
        buyer,
        seller
      })
    } catch (error) {
      console.error("Gagal ambil detail", error)
    } finally {
      setLoadingDetail(false)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      paid: 'bg-blue-100 text-blue-700 border-blue-200',
      shipped: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      retur: 'bg-rose-100 text-rose-700 border-rose-200'
    }

    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border capitalize ${styles[status] || styles.pending}`}>
        {status}
      </span>
    )
  }

  const columns = [
    {
      header: 'TRX ID',
      accessor: 'id',
      className: 'font-mono text-xs text-gray-500',
      render: (row) => row.id.substring(0, 8).toUpperCase()
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (row) => <span className="text-gray-600">{formatDate(row.createdAt)}</span>
    },
    {
      header: 'Amount',
      accessor: 'hargaFinal',
      render: (row) => <span className="font-medium text-gray-900">{formatCurrency(row.hargaFinal)}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => getStatusBadge(row.status)
    },
    {
      header: 'Actions',
      accessor: 'actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={() => handleViewDetails(row)}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Details">
            <Eye size={18} />
          </button>
        </div>
      )
    }
  ]

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Transactions</h1>
        <p className="text-gray-500 mt-1">Monitor all marketplace transactions and middle-man payments.</p>
      </div>

      <DataTable 
        title="All Transactions"
        columns={columns}
        data={transactions}
        itemsPerPage={10}
      />

      {/* Transaction Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Transaction Details"
        size="lg"
      >
        {selectedTrx ? (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">Transaction ID</p>
                <p className="text-lg font-mono font-bold text-gray-900">#{selectedTrx.id}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-400 uppercase">Status</p>
                {getStatusBadge(selectedTrx.status)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                  <Package size={16} />
                  <span>PRODUCT INFO</span>
                </div>
                {loadingDetail ? (
                  <div className="animate-pulse bg-gray-100 h-24 rounded-xl" />
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                        <img 
                          src={selectedTrx.product?.fotos?.[0] || 'https://via.placeholder.com/150'} 
                          alt="Product" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{selectedTrx.product?.nama || 'Unknown Product'}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Price: {formatCurrency(selectedTrx.product?.harga || 0)}</p>
                        <p className="text-xs text-gray-500">Seller: {selectedTrx.seller?.profile?.nama || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Buyer Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                  <User size={16} />
                  <span>BUYER INFO</span>
                </div>
                {loadingDetail ? (
                  <div className="animate-pulse bg-gray-100 h-24 rounded-xl" />
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-sm font-bold text-gray-900">{selectedTrx.buyer?.profile?.nama || 'Unknown Buyer'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{selectedTrx.buyer?.email}</p>
                    <p className="text-xs text-gray-500">{selectedTrx.buyer?.profile?.noTelp || '-'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping & Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                  <MapPin size={16} />
                  <span>Shipping Address</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg">
                  {selectedTrx.alamatPengiriman}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                  <CreditCard size={16} />
                  <span>Payment Summary</span>
                </div>
                <div className="space-y-2 text-sm bg-gray-900 text-white p-4 rounded-xl shadow-lg">
                  <div className="flex justify-between text-gray-400 text-xs">
                    <span>Subtotal Products</span>
                    <span>{formatCurrency(selectedTrx.hargaFinal - selectedTrx.ongkir)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-xs">
                    <span>Shipping Cost</span>
                    <span>{formatCurrency(selectedTrx.ongkir)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/10 font-bold">
                    <span className="text-gray-300">Total Amount</span>
                    <span className="text-indigo-400">{formatCurrency(selectedTrx.hargaFinal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline info */}
            <div className="flex flex-wrap gap-4 text-xs text-gray-400 pt-4">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>Created: {formatDateTime(selectedTrx.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>Last Update: {formatDateTime(selectedTrx.updated_at || selectedTrx.createdAt)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400">Loading details...</div>
        )}
      </Modal>
    </AdminLayout>
  )
}

export default Transactions
