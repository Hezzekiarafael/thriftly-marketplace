import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, ShoppingBag, User, LogOut, MessageCircle, Package, Search, AlertCircle } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import Badge from '../common/Badge'
import Button from '../common/Button'
import { BUTTONS, PLACEHOLDERS } from '../../constants/copywriting'

const Header = () => {
  const navigate = useNavigate()
  const { user, logout, isSeller, isBuyer, isAdmin } = useAuth()
  const { unreadCount } = useApp()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    navigate('/', { replace: true })
    setTimeout(() => {
      logout()
      setIsUserMenuOpen(false)
    }, 0)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className="bg-gradient-to-r from-vintage-charcoal via-gray-800 to-vintage-charcoal shadow-2xl sticky top-0 z-50 border-stitched transition-all duration-300">
      {/* Texture Layer */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-paper-texture z-0" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center group">
            <img
              src="/icon_utamaV2.png"
              alt="Thriftly Logo"
              className="h-9 md:h-14 object-contain opacity-95 hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
            />
          </Link>

          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <form onSubmit={handleSearch} className="w-full relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={PLACEHOLDERS.search}
                className="w-full pl-5 pr-12 py-2.5 bg-white/10 border border-white/20 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/20 transition-all placeholder-white/50"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors"
              >
                <Search size={20} />
              </button>
            </form>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-vintage-modern">
              Beranda
            </Link>
            <Link to="/products" className="text-vintage-modern">
              Semua Produk
            </Link>

            {!user && (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button size="sm" className="bg-primary-600 hover:bg-primary-700 text-white border-none shadow-md hover:scale-105 transition-transform font-bold">
                    {BUTTONS.login}
                  </Button>
                </Link>
              </div>
            )}

            {user && (
              <>
                {isSeller && (
                  <>
                    <Link to="/seller/dashboard" className="text-vintage-modern hover:scale-105 transition-all">
                      Dashboard
                    </Link>
                    <Link to="/seller/products/add">
                      <Button size="sm" className="bg-primary-600 hover:bg-primary-700 text-white border-none shadow-md hover:scale-105 transition-transform font-bold">
                        {BUTTONS.sell}
                      </Button>
                    </Link>
                  </>
                )}

                {isBuyer && (
                  <>
                    <Link to="/buyer/dashboard" className="text-vintage-modern hover:scale-105 transition-all">
                      Dashboard
                    </Link>
                    <Link to="/buyer/orders" className="text-primary-50 hover:text-white relative transition-colors">
                      <Package size={22} />
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <>
                    <Link to="/admin/dashboard" className="text-vintage-modern hover:scale-105 transition-all">
                      Admin Panel
                    </Link>
                  </>
                )}

                {(isSeller || isBuyer) && (
                  <Link to="/chat" className="relative cursor-pointer hover:text-white transition-colors text-primary-50">
                    <MessageCircle size={22} />
                    {unreadCount > 0 && (
                      <Badge variant="solid-red" size="sm" className="absolute -top-2 -right-2 px-1 min-w-[18px] h-[18px] border-2 border-white shadow-sm text-[10px]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </Link>
                )}
              </>
            )}
          </nav>

          {user && (
            <div className="relative md:pl-4 md:border-l border-gray-200" ref={userMenuRef}>
               <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 hover:bg-white/10 p-1 rounded-lg transition-colors"
                  >
                    <div className="hidden md:flex w-8 h-8 rounded-full overflow-hidden bg-white/20 items-center justify-center border border-white/10">
                      {user.profile?.avatar ? (
                        <img src={user.profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User size={18} className="text-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-white hidden lg:block">
                      {user.profile?.nama?.split(' ')[0] || 'User'}
                    </span>
                  </button>

                  {isUserMenuOpen && (
                    <>
                      {/* Mobile Blur Overlay */}
                      <div 
                        className="md:hidden fixed inset-0 top-[64px] z-[90] bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      
                      <div className="fixed right-0 top-[64px] bottom-0 w-[280px] bg-white shadow-2xl z-[101] animate-in slide-in-from-right duration-300 md:absolute md:inset-auto md:right-0 md:top-full md:mt-2 md:w-64 md:bottom-auto md:rounded-2xl md:shadow-soft-xl md:border md:border-gray-100 md:py-3 md:z-[100] md:animate-in md:fade-in md:slide-in-from-top-0 md:zoom-in-95">
                        
                        <div className="px-5 py-4 md:py-3 border-b border-gray-50 mb-2">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {user.profile?.nama || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {user.email}
                        </p>
                      </div>
                      
                      <div className="px-2 space-y-1">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors group"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <div className="p-1.5 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                            <User size={16} className="text-gray-500" />
                          </div>
                          Pengaturan Akun
                        </Link>
                        
                        <Link
                          to="/complaints"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors group"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <div className="p-1.5 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                            <AlertCircle size={16} className="text-gray-500" />
                          </div>
                          Pusat Bantuan
                        </Link>
                        
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 rounded-xl transition-colors group mt-2"
                        >
                          <div className="p-1.5 bg-rose-50 rounded-lg group-hover:bg-white transition-colors">
                            <LogOut size={16} className="text-rose-600" />
                          </div>
                          Keluar
                        </button>
                      </div>
                    </div>
                    </>
                  )}
                </div>
          )}

          {!user && (
            <button
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => navigate('/login')}
            >
              <User size={24} />
            </button>
          )}
          
          {user && (
            <button
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              {isUserMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
        </div>
      </div>
    </header>
  )
}

export default Header
