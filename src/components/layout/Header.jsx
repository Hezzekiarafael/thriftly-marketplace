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

                <div className="relative pl-4 border-l border-gray-200" ref={userMenuRef}>
                   <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 hover:bg-white/10 p-1 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20 flex items-center justify-center border border-white/10">
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
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-soft-xl border border-gray-100 py-3 z-[100] animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-5 py-3 border-b border-gray-50 mb-2">
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
                  )}
                </div>
              </>
            )}
          </nav>

          <button
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 animate-in slide-in-from-top-2 space-y-4 pb-6">
            <div className="px-2">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={PLACEHOLDERS.search}
                  className="w-full pl-4 pr-10 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/40 placeholder-white/50"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50">
                  <Search size={18} />
                </button>
              </form>
            </div>

            <nav className="flex flex-col space-y-1 px-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-xl font-medium transition-colors"
              >
                Beranda
              </Link>
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-xl font-medium transition-colors"
              >
                Semua Produk
              </Link>

              {user ? (
                <>
                  <div className="h-px bg-white/10 my-2 mx-4" />
                  
                  {isSeller && (
                    <>
                      <Link
                        to="/seller/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-xl font-medium transition-colors"
                      >
                        Dashboard Penjual
                      </Link>
                      <Link
                        to="/seller/products/add"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-4 py-3 text-primary-300 font-bold hover:bg-white/10 rounded-xl transition-colors"
                      >
                        + Tambah Produk
                      </Link>
                    </>
                  )}

                  {isBuyer && (
                    <>
                      <Link
                        to="/buyer/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-xl font-medium transition-colors"
                      >
                        Dashboard Pembeli
                      </Link>
                      <Link
                        to="/buyer/orders"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-xl font-medium transition-colors flex items-center gap-3"
                      >
                        <Package size={18} /> Pesanan Saya
                      </Link>
                    </>
                  )}

                  {(isSeller || isBuyer) && (
                    <Link
                      to="/chat"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-xl font-medium transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <MessageCircle size={18} /> Chat
                      </div>
                      {unreadCount > 0 && (
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  )}

                  <div className="h-px bg-white/10 my-2 mx-4" />

                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-xl font-medium transition-colors flex items-center gap-3"
                  >
                    <User size={18} /> Pengaturan Akun
                  </Link>

                  <Link
                    to="/complaints"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-xl font-medium transition-colors flex items-center gap-3"
                  >
                    <AlertCircle size={18} /> Pusat Bantuan
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full text-left px-4 py-3 text-rose-400 hover:text-rose-300 hover:bg-white/10 rounded-xl font-medium transition-colors flex items-center gap-3"
                  >
                    <LogOut size={18} /> Keluar
                  </button>
                </>
              ) : (
                <div className="px-4 pt-4">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button fullWidth className="bg-primary-600 hover:bg-primary-700 text-white font-bold border-none shadow-md">
                      {BUTTONS.login}
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
