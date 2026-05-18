import { Bell, Search, User as UserIcon, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { userService } from '../../services/userService'

const AdminHeader = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [pendingSellers, setPendingSellers] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    const loadPending = async () => {
      try {
        const users = await userService.getAllUsers()
        const pending = users.filter(u => u.role === 'seller' && u.ktp_status === 'pending')
        setPendingSellers(pending)
      } catch (error) {
        console.error('Failed to load notifications:', error)
      }
    }
    loadPending()
    // Poll every 10 seconds to keep it super fresh and responsive
    const interval = setInterval(loadPending, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    navigate('/', { replace: true })
    setTimeout(() => {
      logout()
    }, 0)
  }

  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex-1 flex items-center">
        <div className="relative w-96 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search anywhere..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
          >
            <Bell size={20} />
            {pendingSellers.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>

          {showNotifications && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowNotifications(false)}
              ></div>
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-2">
                  <h4 className="font-bold text-gray-900 text-sm">Notifikasi</h4>
                  {pendingSellers.length > 0 && (
                    <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {pendingSellers.length} Baru
                    </span>
                  )}
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {pendingSellers.length > 0 ? (
                    pendingSellers.map(seller => (
                      <div 
                        key={seller.id}
                        onClick={() => {
                          setShowNotifications(false)
                          navigate('/admin/users')
                        }}
                        className="flex gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer text-left"
                      >
                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 border border-amber-100">
                          <UserIcon size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">Permintaan Verifikasi KTP</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">{seller.profile?.nama || seller.name || 'Seller'} menunggu tinjauan.</p>
                          <span className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 mt-1 block">Klik untuk proses</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-gray-400 text-xs">
                      Tidak ada notifikasi baru
                    </div>
                  )}
                </div>

                {pendingSellers.length > 0 && (
                  <button 
                    onClick={() => {
                      setShowNotifications(false)
                      navigate('/admin/users')
                    }}
                    className="w-full text-center text-[11px] font-bold text-gray-400 hover:text-indigo-600 pt-3 border-t border-gray-50 transition-colors uppercase tracking-wider block"
                  >
                    LIHAT SEMUA USER
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <div className="h-8 w-px bg-gray-200"></div>

        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-3 focus:outline-none"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
              {user?.profile?.nama?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.profile?.nama || 'Admin'}</p>
              <p className="text-xs text-gray-500">Super Admin</p>
            </div>
          </button>

          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowDropdown(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-100 md:hidden">
                  <p className="text-sm font-semibold text-gray-900">{user?.profile?.nama || 'Admin'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
