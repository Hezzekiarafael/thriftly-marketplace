import { useEffect, useState } from 'react'
import { Eye, Edit, CheckCircle, Trash2, X } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import DataTable from '../../components/common/DataTable'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import { productService } from '../../services/productService'
import { userService } from '../../services/userService'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { useApp } from '../../context/AppContext'
import toast from 'react-hot-toast'

const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-100 text-rose-700 border-rose-200',
    sold: 'bg-slate-100 text-slate-700 border-slate-200'
  }

  const labels = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    sold: 'Sold Out'
  }

  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  )
}

const ApprovalQueue = () => {
  const { refreshProducts } = useApp()
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [rejectNote, setRejectNote] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      // Get all products for admin view
      const allProducts = await productService.getAdminProducts()
      
      // Enrich with seller info
      const enrichedProducts = await Promise.all(allProducts.map(async (p) => {
        const seller = await userService.getUserById(p.sellerId)
        return {
          ...p,
          sellerName: seller?.profile?.nama || seller?.name || 'Unknown Seller',
          sellerEmail: seller?.email || ''
        }
      }))
      
      // Sort by newest first
      setProducts(enrichedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
    } catch (error) {
       toast.error('Failed to load queue')
    }
  }

  const handleApproveClick = (product) => {
    setSelectedProduct(product)
    setShowApproveModal(true)
    setShowDetailModal(false) // Close detail if approve is clicked from inside detail
  }

  const handleApproveSubmit = async () => {
    try {
      await productService.approveProduct(selectedProduct.id, 'Approved by admin')
      toast.success('Product approved successfully')
      setShowApproveModal(false)
      setSelectedProduct(null)
      loadProducts()
      refreshProducts()
    } catch (error) {
      toast.error('Admin approval failed')
    }
  }

  const handleRejectClick = (product) => {
    setSelectedProduct(product)
    setShowRejectModal(true)
    setShowDetailModal(false) // Close detail if reject is clicked from inside detail
  }

  const handleViewDetail = (product) => {
    setSelectedProduct(product)
    setShowDetailModal(true)
  }

  const handleRejectSubmit = async () => {
    if (!rejectNote.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }
    try {
      await productService.rejectProduct(selectedProduct.id, rejectNote)
      toast.success('Product rejected')
      setShowRejectModal(false)
      setRejectNote('')
      setSelectedProduct(null)
      loadProducts()
      refreshProducts()
    } catch (error) {
      toast.error('Admin rejection failed')
    }
  }

  const handleDeleteClick = (product) => {
    setSelectedProduct(product)
    setShowDeleteModal(true)
  }

  const handleDeleteSubmit = async () => {
    try {
      await productService.deleteProduct(selectedProduct.id)
      toast.success('Product deleted successfully')
      setShowDeleteModal(false)
      setSelectedProduct(null)
      loadProducts()
      refreshProducts()
    } catch (error) {
      toast.error('Delete failed')
    }
  }

  const columns = [
    {
      header: 'Product',
      accessor: 'nama',
      className: 'w-1/3',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
            <img 
               src={row.fotos && row.fotos.length > 0 ? row.fotos[0] : (row.image || row.image_url || 'https://via.placeholder.com/300?text=No+Image')} 
               alt={row.nama} 
               className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <p className="font-medium text-gray-900 line-clamp-1">{row.nama}</p>
            <p className="text-xs text-gray-500 mt-0.5">ID: {String(row.id).substring(0, 8)}...</p>
          </div>
        </div>
      )
    },
    {
      header: 'Seller Info',
      accessor: 'sellerName',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.sellerName}</p>
          <p className="text-xs text-gray-500">{row.sellerEmail}</p>
        </div>
      )
    },
    {
      header: 'Price',
      accessor: 'harga',
      render: (row) => (
        <span className="font-medium text-gray-900">{formatCurrency(row.harga)}</span>
      )
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (row) => (
        <span className="text-gray-600">{formatDate(row.createdAt)}</span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      accessor: 'actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={() => handleViewDetail(row)}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye size={18} />
          </button>
          
          {row.status === 'pending' && (
            <>
              <button 
                onClick={() => handleApproveClick(row)}
                className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                title="Approve"
              >
                <CheckCircle size={18} />
              </button>
              <button 
                onClick={() => handleRejectClick(row)}
                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Reject"
              >
                <X size={18} />
              </button>
            </>
          )}
          
          <button 
            onClick={() => handleDeleteClick(row)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ]

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products Management</h1>
        <p className="text-gray-500 mt-1">Review, approve, or manage all products in the marketplace.</p>
      </div>

      <DataTable 
        title="All Products"
        columns={columns}
        data={products}
        itemsPerPage={8}
      />

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false)
          setRejectNote('')
        }}
        title="Reject Product"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
            <h4 className="font-medium text-rose-800 mb-1">You are rejecting:</h4>
            <p className="text-sm text-rose-600">{selectedProduct?.nama}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for rejection
            </label>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm resize-none"
              placeholder="E.g., Images are too blurry, please re-upload clear photos of the product."
            />
            <p className="text-xs text-gray-500 mt-2">This note will be sent to the seller.</p>
          </div>
          
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button 
              variant="secondary" 
              className="flex-1"
              onClick={() => {
                setShowRejectModal(false)
                setRejectNote('')
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              className="flex-1"
              onClick={handleRejectSubmit}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false)
          setSelectedProduct(null)
        }}
        title="Approve Product"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
            <h4 className="font-medium text-emerald-800 mb-1">You are approving:</h4>
            <p className="text-sm text-emerald-600 font-semibold">{selectedProduct?.nama}</p>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>Approving this product will make it live and visible to all buyers in the marketplace immediately.</p>
          </div>
          
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button 
              variant="secondary" 
              className="flex-1"
              onClick={() => {
                setShowApproveModal(false)
                setSelectedProduct(null)
              }}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1"
              onClick={handleApproveSubmit}
            >
              Confirm Approval
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedProduct(null)
        }}
        title="Delete Product"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-xl border border-red-100">
            <h4 className="font-medium text-red-800 mb-1">You are deleting:</h4>
            <p className="text-sm text-red-600 font-semibold">{selectedProduct?.nama}</p>
          </div>
          
          <div className="text-sm text-gray-600">
            <p className="font-medium text-red-700">Warning: This action is permanent and cannot be undone.</p>
            <p className="mt-1">This product and all its details will be completely removed from the marketplace database.</p>
          </div>
          
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button 
              variant="secondary" 
              className="flex-1"
              onClick={() => {
                setShowDeleteModal(false)
                setSelectedProduct(null)
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              className="flex-1"
              onClick={handleDeleteSubmit}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Product Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Product Information"
        size="lg"
      >
        {selectedProduct && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Gallery */}
              <div className="space-y-3">
                <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                  <img 
                    src={selectedProduct.fotos?.[0] || 'https://via.placeholder.com/600'} 
                    className="w-full h-full object-cover"
                    alt="Main"
                  />
                </div>
                {selectedProduct.fotos?.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {selectedProduct.fotos.slice(1, 5).map((foto, idx) => (
                      <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                        <img src={foto} className="w-full h-full object-cover" alt={`Thumb ${idx}`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-4">
                <div>
                  <StatusBadge status={selectedProduct.status} />
                  <h3 className="text-xl font-bold text-gray-900 mt-2">{selectedProduct.nama}</h3>
                  <p className="text-2xl font-bold text-primary-600 mt-1">{formatCurrency(selectedProduct.harga)}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-bold">Category</p>
                    <p className="text-sm font-medium text-gray-900">{selectedProduct.kategori}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-bold">Condition</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">{selectedProduct.kondisi}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-bold">Location</p>
                    <p className="text-sm font-medium text-gray-900">{selectedProduct.lokasi}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-bold">Seller</p>
                    <p className="text-sm font-medium text-gray-900">{selectedProduct.sellerName}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-600 leading-relaxed max-h-[150px] overflow-y-auto pr-2">
                    {selectedProduct.deskripsi}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 pt-6 border-t border-gray-100">
              {selectedProduct.status === 'pending' ? (
                <>
                  <Button variant="danger" className="flex-1" onClick={() => handleRejectClick(selectedProduct)}>
                    <X size={18} className="mr-2" /> Reject Product
                  </Button>
                  <Button className="flex-1" onClick={() => handleApproveClick(selectedProduct)}>
                    <CheckCircle size={18} className="mr-2" /> Approve Product
                  </Button>
                </>
              ) : (
                <Button variant="secondary" className="w-full" onClick={() => setShowDetailModal(false)}>
                  Close Details
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  )
}

export default ApprovalQueue
