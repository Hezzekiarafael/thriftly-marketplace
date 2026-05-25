import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { complaintService } from '../../services/complaintService'
import { useApp } from '../../context/AppContext'
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  CreditCard, 
  Database,
  ShoppingBag,
  MessageSquareWarning,
  FileText,
  MoreHorizontal,
  X
} from 'lucide-react'

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/admin/dashboard'
  },
  {
    title: 'Users',
    icon: Users,
    path: '/admin/users'
  },
  {
    title: 'Approval',
    icon: CheckSquare,
    path: '/admin/approval'
  },
  {
    title: 'Transaksi',
    icon: CreditCard,
    path: '/admin/transactions'
  },
  {
    title: 'Komplain',
    icon: MessageSquareWarning,
    path: '/admin/complaints'
  },
  {
    title: 'Blog',
    icon: FileText,
    path: '/admin/blog'
  },
  {
    title: 'Master Data',
    icon: Database,
    path: '/admin/categories'
  }
]

// 4 menu pertama tampil di bottom bar, sisanya masuk "More"
const BOTTOM_NAV_LIMIT = 4

const AdminSidebar = () => {
  const location = useLocation()
  const [showMore, setShowMore] = useState(false)
  const [openComplaintsCount, setOpenComplaintsCount] = useState(0)
  const { pendingCount } = useApp()

  useEffect(() => {
    const fetchComplaints = () => {
      const allComplaints = complaintService.getAllComplaints()
      const open = allComplaints.filter(c => c.status === 'open')
      setOpenComplaintsCount(open.length)
    }
    fetchComplaints()
    const interval = setInterval(fetchComplaints, 10000)
    return () => clearInterval(interval)
  }, [])

  const isActive = (path) =>
    location.pathname === path ||
    (path !== '/admin/dashboard' && location.pathname.startsWith(path))

  const bottomItems = menuItems.slice(0, BOTTOM_NAV_LIMIT)
  const moreItems = menuItems.slice(BOTTOM_NAV_LIMIT)

  return (
    <>
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-slate-300 flex-col h-screen sticky top-0 left-0 overflow-y-auto">
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-indigo-500/20 p-2 rounded-xl group-hover:bg-indigo-500/30 transition-colors">
              <ShoppingBag className="text-indigo-400" size={24} />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Thriftly Admin</span>
          </Link>
        </div>

        <div className="p-4 flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">
            Menu Utama
          </p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-indigo-500/10 text-indigo-400 font-medium'
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className={`${active ? 'text-indigo-400' : 'text-slate-400'}`}>
                    <Icon size={20} />
                  </div>
                  <span className="flex-1">{item.title}</span>
                  {item.title === 'Approval' && pendingCount > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-lg animate-pulse">
                      {pendingCount}
                    </span>
                  )}
                  {item.title === 'Komplain' && openComplaintsCount > 0 && (
                    <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-lg animate-pulse">
                      {openComplaintsCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800 rounded-xl p-4 text-sm">
            <p className="text-white font-medium mb-1">Thriftly v1.0.0</p>
            <p className="text-slate-400">Marketplace Admin Panel</p>
          </div>
        </div>
      </aside>

      {/* ===== MOBILE BOTTOM NAVIGATION ===== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-700 flex items-center justify-around h-16 px-1">
        {bottomItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all duration-200 ${
                active ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-200 relative ${active ? 'bg-indigo-500/20' : ''}`}>
                <Icon size={20} />
                {item.title === 'Approval' && pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] flex items-center justify-center rounded-full border-2 border-slate-900 font-bold">
                    {pendingCount}
                  </span>
                )}
                {item.title === 'Komplain' && openComplaintsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[9px] flex items-center justify-center rounded-full border-2 border-slate-900 font-bold">
                    {openComplaintsCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] leading-none ${active ? 'font-semibold' : 'font-medium'}`}>
                {item.title}
              </span>
            </Link>
          )
        })}

        {/* Tombol "More" untuk menu sisanya */}
        {moreItems.length > 0 && (
          <button
            onClick={() => setShowMore(true)}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all duration-200 ${
              moreItems.some(i => isActive(i.path))
                ? 'text-indigo-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all duration-200 relative ${
              moreItems.some(i => isActive(i.path)) ? 'bg-indigo-500/20' : ''
            }`}>
              <MoreHorizontal size={20} />
              {(
                (moreItems.some(i => i.title === 'Approval') && pendingCount > 0) ||
                (moreItems.some(i => i.title === 'Komplain') && openComplaintsCount > 0)
              ) && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] flex items-center justify-center rounded-full border-2 border-slate-900 font-bold">
                  !
                </span>
              )}
            </div>
            <span className="text-[10px] leading-none font-medium">Lainnya</span>
          </button>
        )}
      </nav>

      {/* ===== MOBILE "MORE" OVERLAY POPUP ===== */}
      {showMore && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMore(false)}
          />

          {/* Popup Panel dari bawah */}
          <div className="md:hidden fixed bottom-16 left-2 right-2 z-[70] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
              <p className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Menu Lainnya</p>
              <button
                onClick={() => setShowMore(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-3 space-y-1">
              {moreItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setShowMore(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      active
                        ? 'bg-indigo-500/10 text-indigo-400 font-medium'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className={`${active ? 'text-indigo-400' : 'text-slate-400'}`}>
                      <Icon size={20} />
                    </div>
                    <span className="text-sm flex-1">{item.title}</span>
                    {item.title === 'Approval' && pendingCount > 0 && (
                      <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-lg">
                        {pendingCount}
                      </span>
                    )}
                    {item.title === 'Komplain' && openComplaintsCount > 0 && (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-lg">
                        {openComplaintsCount}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default AdminSidebar
