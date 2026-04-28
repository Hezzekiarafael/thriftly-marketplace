import { createContext, useContext, useState, useEffect } from 'react'
import { userService } from '../services/userService'
import toast from 'react-hot-toast'
import { SUCCESS, ERRORS } from '../constants/copywriting'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await userService.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
        }
      } catch (error) {
        console.error('Gagal mengambil data user saat init:', error)
      } finally {
        setLoading(false)
      }
    }
    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const loggedInUser = await userService.login(email, password)
      setUser(loggedInUser)
      toast.success(SUCCESS.login)
      return { success: true, user: loggedInUser }
    } catch (error) {
      toast.error(error.message || ERRORS.general)
      return { success: false, error: error.message }
    }
  }

  const register = async (userData) => {
    try {
      const newUser = await userService.createUser(userData)
      const userWithoutPassword = { ...newUser }
      delete userWithoutPassword.password
      setUser(userWithoutPassword)
      toast.success(SUCCESS.registered)
      return { success: true, user: userWithoutPassword }
    } catch (error) {
      toast.error(error.message || ERRORS.general)
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    await userService.logout()
    setUser(null)
    toast.success(SUCCESS.logout)
  }

  const updateUser = async (updatedData) => {
    try {
      const updated = await userService.updateUser(user.id, updatedData)
      const userWithoutPassword = { ...updated }
      delete userWithoutPassword.password
      setUser(userWithoutPassword)
      return { success: true, user: userWithoutPassword }
    } catch (error) {
      toast.error(error.message || ERRORS.general)
      return { success: false, error: error.message }
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const updated = await userService.updateProfile(user.id, profileData)
      const userWithoutPassword = { ...updated }
      delete userWithoutPassword.password
      setUser(userWithoutPassword)
      return { success: true, user: userWithoutPassword }
    } catch (error) {
      toast.error(error.message || ERRORS.general)
      return { success: false, error: error.message }
    }
  }

  const refreshUser = async () => {
    try {
      const currentUser = await userService.getCurrentUser()
      if (currentUser) {
        const userWithoutPassword = { ...currentUser }
        delete userWithoutPassword.password
        setUser(userWithoutPassword)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
    }
  }

  const switchRole = async () => {
    if (!user) return { success: false, error: 'Not logged in' }
    const newRole = user.role === 'buyer' ? 'seller' : 'buyer'
    try {
      const updated = await userService.updateUser(user.id, { role: newRole })
      const userWithoutPassword = { ...updated }
      delete userWithoutPassword.password
      
      setUser(userWithoutPassword)
      toast.success(`Berhasil beralih ke mode ${newRole === 'seller' ? 'Penjual' : 'Pembeli'}`)
      return { success: true, user: userWithoutPassword }
    } catch (error) {
      toast.error(error.message || 'Gagal mengubah mode')
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    updateProfile,
    refreshUser,
    switchRole,
    isAuthenticated: !!user,
    isSeller: user?.role === 'seller',
    isBuyer: user?.role === 'buyer',
    isAdmin: user?.role === 'admin'
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
