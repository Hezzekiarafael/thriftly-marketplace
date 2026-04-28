import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, 
  Package, 
  CreditCard, 
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { productService } from '../../services/productService'
import { userService } from '../../services/userService'
import { transactionService } from '../../services/transactionService'
import { formatCurrency } from '../../utils/helpers'

const StatCard = ({ title, value, icon: Icon, trend, trendValue, colorClass }) => (
  <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon size={24} />
      </div>
    </div>
    
    {trend && (
      <div className="mt-4 flex items-center text-sm">
        <span className={`flex items-center font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend === 'up' ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
          {trendValue}
        </span>
        <span className="text-gray-400 ml-2">vs last month</span>
      </div>
    )}
  </div>
)

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    pendingProducts: 0,
    transactions: 0,
    revenue: 0,
    allTransactions: []
  })

  useEffect(() => {
    const fetchData = async () => {
      // In a real app, this would be a single API call
      const users = await userService.getAllUsers()
      const products = await productService.getAdminProducts()
      const transactions = await transactionService.getAdminTransactions()

      const pendingProducts = products.filter(p => p.status === 'pending').length
      const totalRevenue = (transactions || [])
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + (t.hargaFinal * 0.05), 0) // Assume 5% platform fee

      setStats({
        users: users.length,
        products: products.length,
        pendingProducts,
        transactions: transactions.length,
        revenue: totalRevenue,
        allTransactions: transactions
      })
    }
    fetchData()
  }, [])

  return (
    <AdminLayout>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            Download Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Users" 
          value={stats.users.toLocaleString()} 
          icon={Users} 
          trend="up"
          trendValue="12.5%"
          colorClass="bg-indigo-50 text-indigo-600"
        />
        <StatCard 
          title="Total Products" 
          value={stats.products.toLocaleString()} 
          icon={Package} 
          trend="up"
          trendValue="8.2%"
          colorClass="bg-blue-50 text-blue-600"
        />
        <StatCard 
          title="Pending Approval" 
          value={stats.pendingProducts.toLocaleString()} 
          icon={AlertCircle} 
          trend="down"
          trendValue="3.1%"
          colorClass="bg-amber-50 text-amber-600"
        />
        <StatCard 
          title="Platform Revenue" 
          value={formatCurrency(stats.revenue || 0)} 
          icon={TrendingUp} 
          trend="up"
          trendValue="24.8%"
          colorClass="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Two Column Layout for Charts/Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
            <Link to="/admin/transactions" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              View All
            </Link>
          </div>
          
          {stats.allTransactions && stats.allTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Order ID</th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.allTransactions.slice(0, 5).map((t) => (
                    <tr key={t.id} className="group">
                      <td className="py-4 text-sm font-medium text-gray-900">
                        #{t.id.toString().substring(0, 8).toUpperCase()}
                      </td>
                      <td className="py-4 text-sm text-gray-600">
                        {formatCurrency(t.hargaFinal)}
                      </td>
                      <td className="py-4 text-sm">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize 
                          ${t.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                            t.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                            'bg-blue-100 text-blue-700'}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-gray-500">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                <CreditCard className="text-gray-400" size={20} />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">No recent transactions</h3>
              <p className="text-xs text-gray-500 max-w-xs">Transactions will appear here once buyers start making purchases.</p>
            </div>
          )}
        </div>

        {/* Action Needed */}
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Action Needed</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/50 flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-600 shrink-0 mt-0.5">
                <AlertCircle size={16} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Products Pending Review</h4>
                <p className="text-xs text-gray-600 mt-1 mb-3">There are {stats.pendingProducts} products waiting for your approval before they can go live.</p>
                <Link to="/admin/approval" className="text-xs font-medium text-amber-700 hover:text-amber-800 flex items-center">
                  Review now <ArrowUpRight size={14} className="ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
