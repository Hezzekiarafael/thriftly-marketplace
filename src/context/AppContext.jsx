import { createContext, useContext, useState, useEffect } from 'react'
import { productService } from '../services/productService'
import { messageService } from '../services/messageService'
import { useAuth } from './AuthContext'

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const refreshProducts = async () => {
    try {
      const allProducts = await productService.getAllProducts()
      setProducts(allProducts || [])
      // Jangan panggil refreshPendingCount() di sini!
      // Ini akan menyebabkan 401 untuk user yang bukan admin
    } catch (error) {
      console.error('Failed to refresh products', error)
    }
  }


  const refreshPendingCount = async () => {
    try {
      const pending = await productService.getPendingProducts()
      setPendingCount(pending.length)
    } catch (error) {
      console.error('Failed to fetch pending count', error)
    }
  }

  const refreshUnreadCount = async () => {
    if (user) {
      try {
        const count = await messageService.getUnreadCount(user.id)

        setUnreadCount(count)
      } catch (error) {
        console.error('Failed to refresh unread count', error)
      }
    } else {
      setUnreadCount(0)
    }
  }

  useEffect(() => {
    refreshProducts()
    // Hanya fetch data admin jika user login dan role adalah admin
    if (user?.role === 'admin') {
      refreshPendingCount()
    }
  }, [user])


  useEffect(() => {
    refreshUnreadCount()

    const interval = setInterval(() => {
      refreshUnreadCount()
    }, 5000)

    return () => clearInterval(interval)
  }, [user])

  const value = {
    products,
    unreadCount,
    pendingCount,
    loading,
    setLoading,
    refreshProducts,
    refreshUnreadCount,
    refreshPendingCount
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
