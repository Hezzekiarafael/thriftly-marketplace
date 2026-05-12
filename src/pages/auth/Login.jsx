import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../../context/AuthContext'
import { loginSchema } from '../../utils/validation'
import Button from '../../components/common/Button'
import Container from '../../components/layout/Container'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import { BUTTONS, PLACEHOLDERS } from '../../constants/copywriting'
import { toast } from 'react-hot-toast'

const Login = () => {
  const navigate = useNavigate()
  const { login, refreshUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    // 1. Cek jika baru saja verifikasi email
    if (searchParams.get('verified') === '1') {
      toast.success('Email berhasil diverifikasi! Silakan masuk ke akun Anda.', {
        duration: 5000,
        icon: '✅'
      })
    }

    // 2. Fallback: Jika backend redirect ke halaman login dengan membawa token (Google OAuth)
    const token = searchParams.get('token')
    if (token) {
      localStorage.setItem('token', token)
      refreshUser().then((userData) => {
        const target = userData?.role === 'seller' ? '/seller/dashboard' : '/buyer/dashboard'
        navigate(target, { replace: true })
      })
    }
  }, [searchParams, navigate, refreshUser])

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data) => {
    setLoading(true)
    const result = await login(data.email, data.password)
    setLoading(false)

    if (result.success) {
      if (result.user.role === 'seller') {
        navigate('/seller/dashboard')
      } else if (result.user.role === 'buyer') {
        navigate('/buyer/dashboard')
      } else if (result.user.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/')
      }
    }
  }

  const handleGoogleLogin = () => {
    // Sesuai screenshot backend: kirim origin saja
    // Tambahkan prompt=select_account agar Google selalu menampilkan pilihan akun
    const backendUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/google`
    const myFrontend = window.location.origin
    
    window.location.href = `${backendUrl}?frontend_url=${myFrontend}&prompt=select_account`
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Container className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
              Halo Kak!
            </h1>
            <p className="text-gray-600 mb-8 text-center">
              Masuk ke akun kamu yuk
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder={PLACEHOLDERS.email}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  {...register('password')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder={PLACEHOLDERS.password}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                {BUTTONS.login}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500 font-medium">Atau masuk dengan</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Masuk dengan Google
                </button>
              </div>
            </div>

            <div className="mt-8 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Belum punya akun?{' '}
                <Link to="/register/buyer" className="text-primary-600 hover:text-primary-700 font-bold">
                  Daftar sebagai Pembeli
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Mau jual barang?{' '}
                <Link to="/register/seller" className="text-primary-600 hover:text-primary-700 font-bold">
                  Daftar sebagai Penjual
                </Link>
              </p>
            </div>
          </div>
        </div>
      </Container>
      <Footer />
    </div>
  )
}

export default Login
