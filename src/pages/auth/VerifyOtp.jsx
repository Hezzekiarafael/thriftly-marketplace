import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Phone, ArrowLeft, ShieldCheck, CheckCircle, AlertCircle } from 'lucide-react'
import { userService } from '../../services/userService'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-hot-toast'
import Button from '../../components/common/Button'
import Container from '../../components/layout/Container'

const VerifyOtp = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const phone = searchParams.get('phone') || ''
  const email = searchParams.get('email') || ''
  
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [timer, setTimer] = useState(60)
  const [loading, setLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const inputRefs = useRef([])

  // Timer logic
  useEffect(() => {
    let interval = null
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timer])

  // Auto focus first input
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleChange = (index, value) => {
    if (isNaN(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value.substring(value.length - 1)
    setOtp(newOtp)

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) {
      return toast.error('Silakan masukkan 6 digit kode OTP')
    }

    setLoading(true)
    try {
      await userService.verifyOtp(email, phone, code)
      toast.success('Nomor HP berhasil diverifikasi! 🎉')
      await refreshUser()
      setTimeout(() => {
        navigate('/profile')
      }, 1500)
    } catch (error) {
      toast.error(error.message || 'Kode OTP salah')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (timer > 0) return
    
    setIsResending(true)
    try {
      await userService.sendOtp(email, phone)
      toast.success('Kode OTP baru telah dikirim ke WhatsApp')
      setTimer(60)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0].focus()
    } catch (error) {
      toast.error(error.message || 'Gagal mengirim ulang OTP')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <Container>
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <ShieldCheck size={40} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifikasi Nomor HP</h1>
            <p className="text-gray-600">
              Masukkan 6 digit kode yang kami kirim ke <span className="font-semibold text-gray-900">{phone}</span>
            </p>
          </div>

          {/* OTP Form */}
          <div className="bg-white rounded-3xl p-8 shadow-soft-xl border border-gray-100">
            <div className="flex items-center justify-center gap-3 mb-8">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-bold bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:bg-white focus:outline-none transition-all"
                />
              ))}
            </div>

            <Button
              onClick={handleVerify}
              loading={loading}
              className="w-full py-4 rounded-2xl text-lg font-semibold mb-6"
            >
              Verifikasi Sekarang
            </Button>

            <div className="text-center">
              <p className="text-gray-500 mb-4">
                Tidak menerima kode? {timer > 0 ? (
                  <span className="text-gray-400 font-medium">Tunggu {timer}s</span>
                ) : (
                  <button 
                    onClick={handleResend}
                    disabled={isResending}
                    className="text-primary-600 font-bold hover:underline disabled:text-gray-400"
                  >
                    Kirim Ulang
                  </button>
                )}
              </p>
              
              <Link 
                to="/profile" 
                className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft size={14} /> Kembali ke Pengaturan
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default VerifyOtp
