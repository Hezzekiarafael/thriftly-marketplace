import { Link, useLocation } from 'react-router-dom'
import { Home, Search, ShoppingBag, Package, MessageCircle, User, PlusCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { useVerification } from '../../hooks/useVerification'

const BottomNav = () => {
  const { user, isBuyer, isSeller } = useAuth()
  const { unreadCount } = useApp()
  const location = useLocation()
  const { checkVerification, VerificationModal } = useVerification()

  const hiddenRoutes = ['/admin', '/login', '/register']
  if (hiddenRoutes.some(route => location.pathname.startsWith(route))) {
    return null
  }

  const getNavItems = () => {
    if (!user) {
      return [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Search, label: 'Cari', path: '/products' },
        { icon: User, label: 'Masuk', path: '/login' }
      ]
    }
    if (isBuyer) {
      return [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Search, label: 'Eksplor', path: '/products' },
        { icon: Package, label: 'Pesanan', path: '/buyer/orders' },
        { icon: MessageCircle, label: 'Pesan', path: '/chat', badge: unreadCount },
        { icon: User, label: 'Profil', path: '/buyer/dashboard' }
      ]
    }
    if (isSeller) {
      return [
        { icon: Home, label: 'Home', path: '/' },
        { icon: ShoppingBag, label: 'Produkku', path: '/seller/products' },
        { icon: PlusCircle, label: 'Jual', path: '/seller/products/add', primary: true },
        { icon: MessageCircle, label: 'Pesan', path: '/chat', badge: unreadCount },
        { icon: User, label: 'Profil', path: '/seller/dashboard' }
      ]
    }
    return []
  }

  const items = getNavItems()

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-[999]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Glassmorphism container */}
      <div
        style={{
          background: '#4f46e5', // Solid Indigo
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 -10px 40px rgba(79, 70, 229, 0.2)',
        }}
      >
        <nav className="flex justify-around items-end h-16 px-2 pb-1">
          {items.map((item, index) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path))
            const Icon = item.icon

            /* ── Tombol Jual (primary/floating) ── */
            if (item.primary) {
              return (
                <button
                  key={index}
                  onClick={checkVerification}
                  className="flex flex-col items-center justify-end w-full h-full pb-1 -mt-4"
                >
                  <div
                    style={{
                      background: '#ffffff',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                    }}
                    className="p-3 rounded-2xl transition-all duration-200 active:scale-90"
                  >
                    <Icon size={22} color="#4f46e5" />
                  </div>
                  <span className="text-[9px] font-semibold mt-1 text-white">{item.label}</span>
                </button>
              )
            }

            /* ── Item biasa ── */
            return (
              <Link
                key={index}
                to={item.path}
                className="flex flex-col items-center justify-end w-full h-full pb-1 relative transition-all duration-200 active:scale-90"
              >
                {/* Active pill indicator di atas ikon */}
                {isActive && (
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full"
                    style={{ background: 'white' }}
                  />
                )}

                {/* Icon wrapper */}
                <div
                  className="relative p-1.5 rounded-xl transition-all duration-200"
                  style={
                    isActive
                      ? { background: 'rgba(255, 255, 255, 0.15)' }
                      : {}
                  }
                >
                  <Icon
                    size={21}
                    style={{
                      color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                      strokeWidth: isActive ? 2.5 : 1.8,
                    }}
                  />

                  {/* Badge notifikasi */}
                  {item.badge > 0 && (
                    <span
                      className="absolute -top-1 -right-1 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white"
                      style={{ background: '#e26a5a' }}
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>

                <span
                  className="text-[9px] mt-0.5 font-medium transition-all duration-200"
                  style={{ color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.6)', fontWeight: isActive ? 700 : 500 }}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
      <VerificationModal />
    </div>
  )
}

export default BottomNav