import { useState, useRef, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { 
  User, MapPin, ShieldCheck, Camera, 
  Calendar, ArrowLeft, Mail, Phone, 
  Lock, CheckCircle, Plus, Edit2, AlertCircle,
  X, Upload, CreditCard, Locate, Crown, Star, Zap, Clock
} from 'lucide-react'
import dayjs from 'dayjs'
import 'dayjs/locale/id'
import { useAuth } from '../../context/AuthContext'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import Button from '../../components/common/Button'
import { toast } from 'react-hot-toast'
import api from '../../services/api'
import { userService } from '../../services/userService'
import { newsletterService } from '../../services/newsletterService'

import Modal from '../../components/common/Modal'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import axios from 'axios'
import { reverseGeocode } from '../../utils/geolocation'

// Perbaikan bug icon marker default di React Leaflet dengan Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
})

// Komponen Pembantu untuk menggeser pin dan memusatkan kamera
const LocationSelector = ({ position, setPosition, setAddress }) => {
  const map = useMap()

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom(), { animate: true })
    }
  }, [position, map])

  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng
      setPosition([lat, lng])

      // Reverse Geocoding via Nominatim API
      try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        if (response.data && response.data.display_name) {
          setAddress(response.data.display_name)
        }
      } catch (error) {
        console.error('Gagal mengambil alamat:', error)
      }
    }
  })
  return position ? <Marker position={position}></Marker> : null
}

const Profile = () => {
  const { user, updateProfile, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [verifyingPhone, setVerifyingPhone] = useState(false)
  const fileInputRef = useRef(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [subscription, setSubscription] = useState(null)
  const [subLoading, setSubLoading] = useState(true)
  const [isSubscribing, setIsSubscribing] = useState(false)

  // Jika backend redirect ke /profile?verified=1, refresh data user otomatis
  useEffect(() => {
    if (searchParams.get('verified') === '1') {
      toast.success('Email berhasil diverifikasi! 🎉', { duration: 5000 })
      refreshUser().then(() => {
        navigate('/profile', { replace: true })
      })
    }
    // Handle tab dari URL query
    const tab = searchParams.get('tab')
    const validTabs = ['profile', 'address', 'rekening', 'security', 'subscription']
    
    if (tab === 'newsletter') {
      setActiveTab('subscription')
      setSearchParams({ tab: 'subscription' }, { replace: true })
    } else if (tab && validTabs.includes(tab)) {
      setActiveTab(tab)
    } else if (tab) {
      setActiveTab('profile')
      setSearchParams({ tab: 'profile' }, { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSearchParams({ tab }, { replace: true })
  }

  // Ambil data langganan
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setSubLoading(false)
        return
      }
      try {
        const res = await api.get('/user/newsletter')
        setSubscription(res.data?.data)
      } catch (error) {
        console.error('Error fetching subscription:', error)
      } finally {
        setSubLoading(false)
      }
    }
    fetchSubscription()
  }, [user])

  // Form States
  const [profileForm, setProfileForm] = useState({
    nama: user?.profile?.nama || '',
    noTelp: user?.profile?.noTelp || '',
    jenisKelamin: user?.profile?.jenisKelamin || 'Laki-laki',
    tanggalLahir: user?.profile?.tanggalLahir || '',
  })

  // Address States
  const [addressForm, setAddressForm] = useState({
    alamat: user?.profile?.alamat || ''
  })
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [mapPosition, setMapPosition] = useState([-6.9932, 110.4229]) // Default: Semarang
  const [isLocating, setIsLocating] = useState(false)

  // Sinkronisasi form jika data user berubah (setelah refreshUser)
  useEffect(() => {
    if (user?.profile) {
      setProfileForm({
        nama: user.profile.nama || '',
        noTelp: user.profile.noTelp || '',
        jenisKelamin: user.profile.jenisKelamin || 'Laki-laki',
        tanggalLahir: user.profile.tanggalLahir || '',
      })
      setAddressForm({
        alamat: user.profile.alamat || ''
      })
    }
  }, [user])

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [isRekeningModalOpen, setIsRekeningModalOpen] = useState(false)
  const [deleteRekeningIndex, setDeleteRekeningIndex] = useState(null) // index to confirm delete
  const [deleteRekeningIndex, setDeleteRekeningIndex] = useState(null) // index to confirm delete
  const [bankForm, setBankForm] = useState({
    namaBank: 'BCA',
    nomorRekening: '',
    namaPemilik: user?.profile?.nama || ''
  })

  const [ktpForm, setKtpForm] = useState({
    nik: '',
    namaKtp: '',
    tempatLahir: '',
    tanggalLahir: '',
    image: null,
    imagePreview: null
  })

  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  // Helper: parse noRekening → array of {namaBank, nomorRekening, namaPemilik}
  const parseRekeningList = () => {
    if (!user?.profile?.noRekening) return []
    try {
      const parsed = JSON.parse(user.profile.noRekening)
      if (Array.isArray(parsed)) return parsed
    } catch {}
    // Legacy: single string format "BCA - 1234 - Nama"
    const parts = user.profile.noRekening.split(' - ')
    return [{ namaBank: parts[0] || 'Bank', nomorRekening: parts[1] || user.profile.noRekening, namaPemilik: parts[2] || '' }]
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // Map and include all required fields for backend validation
      const payload = {
        ...profileForm,
        name: profileForm.nama,
        email: user.email,
        no_telp: profileForm.noTelp,
        date_of_birth: profileForm.tanggalLahir,
        gender: profileForm.jenisKelamin === 'Laki-laki' ? 'L' : 'P',
        role: user.role,
        alamat: addressForm.alamat || user?.profile?.alamat || '',
      }
      await updateProfile(payload)
      toast.success('Profil berhasil diperbarui')
    } catch (error) {
      toast.error(error.message || 'Gagal memperbarui profil')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddressSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!addressForm.alamat.trim()) {
      return toast.error('Alamat tidak boleh kosong')
    }
    setIsSubmitting(true)
    try {
      let lokasiValue = user?.profile?.lokasi || 'Semarang'
      if (mapPosition && mapPosition.length === 2) {
        const resolved = reverseGeocode(mapPosition[0], mapPosition[1])
        if (resolved) {
          lokasiValue = resolved.name || resolved.id || lokasiValue
        }
      }

      await updateProfile({
        name: user.profile.nama,
        email: user.email,
        alamat: addressForm.alamat.trim(),
        address: addressForm.alamat.trim(),
        lokasi: lokasiValue
      })
      toast.success('Alamat berhasil disimpan')
      setIsEditingAddress(false)
    } catch (error) {
      toast.error(error.message || 'Gagal menyimpan alamat')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('Konfirmasi password tidak cocok')
    }
    setIsSubmitting(true)
    try {
      // Password update also needs email and name to pass validation
      await updateProfile({ 
        name: user.profile.nama,
        email: user.email,
        password: passwordForm.newPassword 
      })
      toast.success('Password berhasil diperbarui')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error(error.message || 'Gagal memperbarui password')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRekeningSubmit = async (e) => {
    e.preventDefault()
    if (!bankForm.nomorRekening.trim()) {
      return toast.error('Nomor rekening tidak boleh kosong')
    }
    if (!bankForm.namaPemilik.trim()) {
      return toast.error('Nama pemilik rekening tidak boleh kosong')
    }
    setIsSubmitting(true)
    try {
      const existingList = parseRekeningList()
      const newEntry = {
        namaBank: bankForm.namaBank,
        nomorRekening: bankForm.nomorRekening.trim(),
        namaPemilik: bankForm.namaPemilik.trim()
      }
      const updatedList = [...existingList, newEntry]
      
      await updateProfile({
        name: user.profile.nama,
        email: user.email,
        no_rekening: JSON.stringify(updatedList)
      })
      toast.success('Rekening bank berhasil disimpan')
      setIsRekeningModalOpen(false)
      setBankForm({ namaBank: 'BCA', nomorRekening: '', namaPemilik: user?.profile?.nama || '' })
    } catch (error) {
      toast.error(error.message || 'Gagal menyimpan rekening bank. Jika muncul error limit 50 karakter, minta backend matikan validasi tersebut.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveRekening = async (index) => {
    setIsSubmitting(true)
    try {
      const existingList = parseRekeningList()
      const updatedList = existingList.filter((_, i) => i !== index)
      
      await updateProfile({
        name: user.profile.nama,
        email: user.email,
        no_rekening: updatedList.length > 0 ? JSON.stringify(updatedList) : null
      })
      toast.success('Rekening bank berhasil dihapus')
      setDeleteRekeningIndex(null)
    } catch (error) {
      toast.error(error.message || 'Gagal menghapus rekening bank')
    } finally {
      setIsSubmitting(false)
    }
  }

  const startCamera = async () => {
    setIsCameraOpen(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error("Gagal membuka kamera:", err)
      toast.error("Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.")
      setIsCameraOpen(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCameraOpen(false)
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg')
        setKtpForm(prev => ({
          ...prev,
          image: dataUrl,
          imagePreview: dataUrl
        }))
        toast.success('Foto KTP berhasil diambil!')
      }
      stopCamera()
    }
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const handleKtpSubmit = async (e) => {
    e.preventDefault()
    if (!ktpForm.nik || ktpForm.nik.length !== 16) {
      return toast.error('NIK KTP harus 16 digit')
    }
    if (!ktpForm.namaKtp) {
      return toast.error('Nama sesuai KTP tidak boleh kosong')
    }
    if (!ktpForm.tempatLahir) {
      return toast.error('Tempat lahir tidak boleh kosong')
    }
    if (!ktpForm.tanggalLahir) {
      return toast.error('Tanggal lahir tidak boleh kosong')
    }
    if (!ktpForm.image) {
      return toast.error('Foto KTP wajib diunggah atau diambil via kamera')
    }

    setIsSubmitting(true)
    try {
      await userService.verifyKtp(ktpForm)
      
      toast.success('Data verifikasi KTP berhasil dikirim! Menunggu persetujuan admin.', { duration: 5000 })
      
      // Refresh user context data to update status in UI immediately
      refreshUser()
      
      // Reset form
      setKtpForm({
        nik: '',
        namaKtp: '',
        tempatLahir: '',
        tanggalLahir: '',
        image: null,
        imagePreview: null
      })
    } catch (error) {
      toast.error('Gagal mengirim data verifikasi KTP')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview
    const reader = new FileReader()
    reader.onloadend = () => {
      // Local preview only
    }
    reader.readAsDataURL(file)

    // Upload using FormData
    const formData = new FormData()
    formData.append('avatar', file)
    formData.append('name', profileForm.nama)
    formData.append('email', user.email)
    formData.append('no_telp', profileForm.noTelp)
    formData.append('role', user.role)
    formData.append('_method', 'PUT') // Workaround for Laravel PUT file upload

    try {
      // Use configured api instance for FormData with _method PUT
      await api.post('/user/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })
      
      // Refresh user data in context
      await refreshUser()
      
      toast.success('Foto profil berhasil diperbarui')
    } catch (error) {
      const msg = error.response?.data?.message || 'Gagal memperbarui foto profil'
      toast.error(msg)
    }
  }

  const handleResendEmail = async () => {
    setResending(true)
    try {
      // Kirim origin saat ini agar backend tahu ke mana harus meredirect link verifikasi
      await api.post('/email/verification-notification', {
        frontend_url: window.location.origin
      })
      toast.success('Email verifikasi baru telah dikirim!')
    } catch (error) {
      toast.error('Gagal mengirim email. Coba lagi nanti.')
    } finally {
      setResending(false)
    }
  }

  const handleVerifyPhone = async () => {
    if (!profileForm.noTelp) {
      return toast.error('Silakan masukkan nomor HP terlebih dahulu')
    }
    
    setVerifyingPhone(true)
    try {
      await userService.sendOtp(user.email, profileForm.noTelp)
      toast.success('Kode OTP telah dikirim ke WhatsApp Anda')
      navigate(`/verify-otp?phone=${profileForm.noTelp}&email=${user.email}`)
    } catch (error) {
      toast.error(error.message || 'Gagal mengirim OTP')
    } finally {
      setVerifyingPhone(false)
    }
  }

  // ── Render: Tab Langganan ───────────────────────────────────────────────────
  const handleSubscribe = async () => {
    if (!user) return
    setIsSubscribing(true)
    try {
      const response = await newsletterService.subscribe(user.email)
      toast.success(response.data?.message || 'Cek email kamu ya! Link pembayaran sudah kami kirim 📬')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengirim email langganan')
    } finally {
      setIsSubscribing(false)
    }
  }

  const renderSubscriptionTab = () => {
    if (subLoading) {
      return (
        <div className="space-y-5 animate-pulse">
          {/* Header Card Skeleton */}
          <div className="rounded-3xl p-6 md:p-8 bg-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gray-300"></div>
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-gray-300 rounded"></div>
                  <div className="h-5 w-40 bg-gray-300 rounded"></div>
                </div>
              </div>
              <div className="w-20 h-6 bg-gray-300 rounded-full"></div>
            </div>
            <div className="h-16 w-full bg-gray-300 rounded-2xl mt-4"></div>
          </div>

          {/* Benefits Skeleton */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="h-4 w-40 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gray-200 shrink-0"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Button Skeleton */}
          <div className="w-full h-14 bg-gray-200 rounded-2xl"></div>
        </div>
      )
    }

    const isActive = subscription && subscription.status === 'active'
    const isPending = subscription && subscription.status === 'pending'

    let bgClass = 'bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900'
    let badgeClass = 'bg-white/10 text-white/60 border-white/10'
    let badgeText = 'TIDAK AKTIF'
    let iconBgClass = 'bg-white/10'
    let iconTextClass = 'text-white'

    if (isActive) {
      bgClass = 'bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700'
      badgeClass = 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30'
      badgeText = '✓ AKTIF'
      iconBgClass = 'bg-yellow-400/20'
      iconTextClass = 'text-yellow-300'
    } else if (isPending) {
      bgClass = 'bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700'
      badgeClass = 'bg-white/20 text-white font-bold border-white/30'
      badgeText = '⏳ PENDING'
      iconBgClass = 'bg-white/20'
      iconTextClass = 'text-white'
    }

    const expiredDate = subscription?.valid_until 
      ? dayjs(subscription.valid_until).locale('id').format('dddd, D MMMM YYYY') 
      : '-'

    return (
      <div className="space-y-5">
        {/* Header Card */}
        <div className={`relative overflow-hidden rounded-3xl p-6 md:p-8 text-white shadow-xl ${bgClass}`}>
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${iconBgClass}`}>
                  <Crown className={`w-5 h-5 ${iconTextClass}`} />
                </div>
                <div>
                  <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">Thriftly</p>
                  <h2 className="text-lg font-bold">Premium Membership</h2>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeClass}`}>
                {badgeText}
              </span>
            </div>

            {isActive ? (
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Berakhir Pada</span>
                  <span className="font-bold text-yellow-300">{expiredDate}</span>
                </div>
              </div>
            ) : isPending ? (
              <p className="text-white/90 text-sm">
                Menunggu pembayaran. Silakan cek email Anda untuk melanjutkan pembayaran via DOKU.
              </p>
            ) : (
              <p className="text-white/60 text-sm">
                Anda belum terdaftar dalam membership Thriftly.
              </p>
            )}
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Keuntungan Premium</h3>
          <div className="space-y-3">
            {(user?.role === 'seller' ? [
              { icon: Star,  label: 'Badge Premium Seller di profil' },
              { icon: Crown, label: 'Prioritas tampil paling atas di beranda' },
              { icon: Mail,  label: 'Mendapatkan laporan performa toko ke email' },
            ] : [
              { icon: Star,  label: 'Badge Premium di profil' },
              { icon: Mail,  label: 'Mendapatkan update ke email setiap ada produk baru' },
              { icon: Crown, label: 'Prioritas layanan pelanggan' },
            ]).map(({ icon: Icon, label }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-violet-100' : 'bg-gray-100'
                }`}>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-violet-600' : 'text-gray-400'}`} />
                </div>
                <span className={`text-sm font-medium ${isActive ? 'text-gray-800' : 'text-gray-500'}`}>{label}</span>
                {isActive && <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        {!isActive && !isPending && (
          <button
            onClick={handleSubscribe}
            disabled={isSubscribing}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-violet-200 transition-all disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <Crown size={18} />
            {isSubscribing ? 'Mengirim Email...' : 'Gas Langganan Sekarang'}
          </button>
        )}
        {isPending && (
          <button
            onClick={handleSubscribe}
            disabled={isSubscribing}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold rounded-2xl transition-all disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <Mail size={18} />
            {isSubscribing ? 'Mengirim Ulang...' : 'Kirim Ulang Email Pembayaran'}
          </button>
        )}
      </div>
    )
  }

  const renderProfileTab = () => (
    <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-sm md:shadow-soft-lg border border-gray-100">
      <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="relative group shrink-0">
          <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border-2 md:border-4 border-white shadow-md overflow-hidden bg-gray-100">
            {user?.profile?.avatar ? (
              <img src={user.profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <User className="w-8 h-8 md:w-10 md:h-10" />
              </div>
            )}
          </div>
          {/* Premium Badge Indicator */}
          {subscription?.status === 'active' && (
            <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 p-1 md:p-1.5 rounded-full border-2 border-white shadow-md z-10" title="Premium Member">
              <Crown className="w-3 h-3 md:w-4 md:h-4" />
            </div>
          )}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-1.5 md:p-2 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors"
          >
            <Camera className="w-3 h-3 md:w-3.5 md:h-3.5" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleAvatarChange}
          />
        </div>
        <div>
          <h3 className="text-base md:text-xl font-bold text-gray-900">{user?.profile?.nama || 'User'}</h3>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">Update foto profil dan informasi pribadi Anda.</p>
        </div>
      </div>

      <form onSubmit={handleProfileSubmit} className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-1.5 md:space-y-2">
            <label className="text-xs md:text-sm font-semibold text-gray-700">Nama Lengkap</label>
            <div className="relative">
              <div className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <User className="w-4 h-4 md:w-4.5 md:h-4.5" />
              </div>
              <input
                type="text"
                value={profileForm.nama}
                onChange={(e) => setProfileForm({ ...profileForm, nama: e.target.value })}
                className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl md:rounded-2xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                placeholder="Masukkan nama lengkap"
              />
            </div>
          </div>

          <div className="space-y-1.5 md:space-y-2">
            <label className="text-xs md:text-sm font-semibold text-gray-700">Alamat Email</label>
            <div className="relative flex items-center gap-2 md:gap-3">
              <div className="relative flex-1">
                <div className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="w-4 h-4 md:w-4.5 md:h-4.5" />
                </div>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 bg-gray-100 border border-gray-200 rounded-xl md:rounded-2xl text-xs md:text-sm text-gray-500 cursor-not-allowed"
                />
              </div>
              {user?.emailVerifiedAt ? (
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[8px] md:text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shrink-0">
                  <CheckCircle size={10} /> Verified
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={resending}
                  className="whitespace-nowrap px-3 py-1.5 md:px-4 md:py-2 bg-amber-50 text-amber-700 text-[10px] md:text-xs font-bold rounded-lg md:rounded-xl border border-amber-200 hover:bg-amber-100 transition-colors disabled:opacity-50 shrink-0"
                >
                  {resending ? 'Mengirim...' : 'Kirim Link Verifikasi'}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1.5 md:space-y-2">
            <label className="text-xs md:text-sm font-semibold text-gray-700">Nomor HP</label>
            <div className="relative flex items-center gap-2 md:gap-3">
              <div className="relative flex-1">
                <div className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Phone className="w-4 h-4 md:w-4.5 md:h-4.5" />
                </div>
                <input
                  type="text"
                  value={profileForm.noTelp}
                  onChange={(e) => setProfileForm({ ...profileForm, noTelp: e.target.value })}
                  className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl md:rounded-2xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                  placeholder="0812xxxx"
                />
              </div>
              {user?.phoneVerifiedAt ? (
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[8px] md:text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shrink-0">
                  <CheckCircle size={10} /> Verified
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleVerifyPhone}
                  disabled={verifyingPhone}
                  className="whitespace-nowrap px-3 py-1.5 md:px-4 md:py-2 bg-amber-50 text-amber-700 text-[10px] md:text-xs font-bold rounded-lg md:rounded-xl border border-amber-200 hover:bg-amber-100 transition-colors disabled:opacity-50 shrink-0"
                >
                  {verifyingPhone ? 'Mengirim...' : 'Verifikasi'}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1.5 md:space-y-2">
            <label className="text-xs md:text-sm font-semibold text-gray-700">Jenis Kelamin</label>
            <div className="flex gap-2 md:gap-3">
              {['Laki-laki', 'Perempuan'].map((gender) => (
                <button
                  key={gender}
                  type="button"
                  onClick={() => setProfileForm({ ...profileForm, jenisKelamin: gender })}
                  className={`flex-1 py-2.5 md:py-3 rounded-xl md:rounded-2xl border transition-all text-xs md:text-sm font-medium ${
                    profileForm.jenisKelamin === gender 
                    ? 'bg-primary-50 border-primary-500 text-primary-700' 
                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-primary-300'
                  }`}
                >
                  {gender}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 md:space-y-2">
            <label className="text-xs md:text-sm font-semibold text-gray-700">Tanggal Lahir</label>
            <div className="relative">
              <div className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Calendar className="w-4 h-4 md:w-4.5 md:h-4.5" />
              </div>
              <input
                type="date"
                value={profileForm.tanggalLahir}
                onChange={(e) => setProfileForm({ ...profileForm, tanggalLahir: e.target.value })}
                className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl md:rounded-2xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 md:pt-4">
          <Button 
            type="submit" 
            isLoading={isSubmitting}
            className="w-full md:w-auto px-6 md:px-8 bg-primary-600 hover:bg-primary-700 text-white rounded-xl md:rounded-2xl py-2.5 md:py-3 text-xs md:text-sm font-bold"
          >
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  )

  const renderAddressTab = () => (
    <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-sm md:shadow-soft-lg border border-gray-100 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h2 className="text-base md:text-xl font-bold text-gray-900">Alamat Saya</h2>
        {!isEditingAddress && (
          <button 
            onClick={() => {
              setIsEditingAddress(true)
            }}
            className="flex items-center gap-1 text-primary-600 font-semibold text-xs md:text-sm hover:text-primary-700"
          >
            {user?.profile?.alamat ? <Edit2 size={16} /> : <Plus size={16} />}
            {user?.profile?.alamat ? 'Ubah Alamat' : 'Tambah Alamat Baru'}
          </button>
        )}
      </div>

      <div className="space-y-3 md:space-y-4">
        {user?.profile?.alamat ? (
          <div className="p-4 md:p-6 border-2 border-primary-100 bg-primary-50/30 rounded-2xl md:rounded-3xl relative">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <span className="text-xs md:text-sm font-bold text-gray-900">Utama</span>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] md:text-[9px] font-bold rounded-full">
                <MapPin size={8} /> ALAMAT TERSIMPAN
              </div>
            </div>
            <div className="space-y-1 text-gray-700">
              <p className="text-sm md:text-base font-bold text-gray-900">{user?.profile?.nama}</p>
              <p className="text-xs md:text-sm leading-relaxed max-w-lg">
                {user.profile.alamat}
              </p>
            </div>
            <button 
              onClick={() => setIsEditingAddress(true)}
              className="mt-3 md:mt-4 text-primary-600 font-bold text-xs md:text-sm hover:underline"
            >
              Ubah Alamat
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-200 rounded-2xl md:rounded-3xl p-6 md:p-12 text-center flex flex-col items-center justify-center bg-gray-50/50">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-xl md:rounded-2xl flex items-center justify-center text-gray-400 mb-3 md:mb-4">
              <MapPin size={24} className="md:w-7 md:h-7" />
            </div>
            <h3 className="font-bold text-gray-900 text-xs md:text-sm mb-1">Belum ada alamat</h3>
            <p className="text-[10px] md:text-xs text-gray-500 max-w-xs leading-relaxed mb-4 md:mb-6">
              Tambahkan alamat pengiriman agar bisa melakukan checkout.
            </p>
            <button 
              onClick={() => setIsEditingAddress(true)}
              className="px-4 py-2.5 md:px-6 md:py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl md:rounded-2xl text-[10px] md:text-xs flex items-center gap-1.5 transition-all shadow-md animate-bounce"
            >
              <Plus size={14} /> Tambah Alamat Sekarang
            </button>
          </div>
        )}
      </div>

      {/* Address Edit Modal with Leaflet Map */}
      <Modal
        isOpen={isEditingAddress}
        onClose={() => {
          setIsEditingAddress(false)
          setAddressForm({ alamat: user?.profile?.alamat || '' })
        }}
        title="Ubah Alamat Pengiriman"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <textarea
              className="w-full text-xs md:text-sm p-3 md:p-4 border border-gray-200 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all min-h-[80px] md:min-h-[100px] bg-gray-50 resize-y"
              value={addressForm.alamat}
              onChange={(e) => setAddressForm({ ...addressForm, alamat: e.target.value })}
              placeholder="Masukkan alamat lengkap (Jalan, RT/RW, Kelurahan, Kecamatan, Kota, Provinsi, Kode Pos)"
            />
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs md:text-sm font-bold text-gray-700">Tentukan Titik Pengiriman</span>
            <button
              type="button"
              disabled={isLocating}
              onClick={() => {
                if (!navigator.geolocation) {
                  toast.error('Browser tidak mendukung lokasi');
                  return;
                }
                setIsLocating(true);
                navigator.geolocation.getCurrentPosition(
                  async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setMapPosition([lat, lng]);

                    try {
                      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                      if (response.data && response.data.display_name) {
                        setAddressForm({ alamat: response.data.display_name });
                        toast.success('Lokasi berhasil ditemukan');
                      }
                    } catch (error) {
                      toast.error('Gagal memuat detail alamat otomatis');
                    }
                    setIsLocating(false);
                  },
                  () => {
                    toast.error('Gagal mengambil lokasi, pastikan izin akses lokasi diberikan');
                    setIsLocating(false);
                  }
                );
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 border border-emerald-500 hover:bg-emerald-50 text-emerald-600 font-bold rounded-full text-[10px] md:text-xs transition-colors"
            >
              <Locate size={12} className="md:w-3.5 md:h-3.5" />
              {isLocating ? 'Mencari...' : 'Gunakan Lokasi Saat Ini'}
            </button>
          </div>

          {/* Map Container */}
          <div className="relative w-full h-[250px] md:h-[300px] bg-gray-100 rounded-xl md:rounded-2xl overflow-hidden border border-gray-200 z-0">
            <MapContainer
              center={mapPosition}
              zoom={13}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationSelector 
                position={mapPosition} 
                setPosition={setMapPosition} 
                setAddress={(addr) => setAddressForm({ alamat: addr })} 
              />
            </MapContainer>

            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[400] pointer-events-none">
              <span className="text-[9px] md:text-[10px] font-bold text-gray-900 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-gray-200">
                Klik pada peta untuk menaruh pin
              </span>
            </div>

            {/* Turquoise Confirm Button inside Bottom Right of the Map */}
            <div className="absolute bottom-4 right-4 z-[400]">
              <button
                type="button"
                onClick={handleAddressSubmit}
                disabled={isSubmitting}
                className="bg-[#2bd9c8] hover:bg-[#24c4b4] active:scale-95 text-white font-bold text-[10px] md:text-xs py-2 px-3 md:py-2.5 md:px-4 rounded-xl shadow-md transition-all duration-200 uppercase tracking-wider"
              >
                {isSubmitting ? 'Menyimpan...' : 'Konfirmasi Lokasi Ini'}
              </button>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-xl md:rounded-2xl p-3 flex gap-2.5 items-start">
            <MapPin size={16} className="text-indigo-500 mt-0.5 shrink-0" />
            <p className="text-[10px] md:text-xs text-indigo-800 leading-relaxed">
              Pastikan titik lokasi dan alamat sudah sesuai agar kurir lebih mudah menemukan tempatmu.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  )

  const renderRekeningTab = () => {
    const rekeningList = parseRekeningList()
    const hasRekening = rekeningList.length > 0

    return (
      <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-sm md:shadow-soft-lg border border-gray-100 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
          <div>
            <h2 className="text-base md:text-xl font-bold text-gray-900">Simpan rekening untuk penarikan saldo</h2>
            <p className="text-gray-400 text-[10px] md:text-xs mt-0.5 md:mt-1">Saldo Thriftly kamu bisa ditarik ke rekening ini.</p>
          </div>
          <button 
            onClick={() => {
              setBankForm({ namaBank: 'BCA', nomorRekening: '', namaPemilik: user?.profile?.nama || '' })
              setIsRekeningModalOpen(true)
            }}
            className="flex items-center gap-1 px-3 py-1.5 border border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-bold rounded-xl text-[10px] md:text-xs transition-colors shrink-0"
          >
            + {hasRekening ? 'Tambah Rekening Lain' : 'Tambah Rekening Sekarang'}
          </button>
        </div>

        {!hasRekening ? (
          <div className="border-2 border-dashed border-gray-100 rounded-2xl md:rounded-3xl p-6 md:p-12 text-center flex flex-col items-center justify-center bg-gray-50/50">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-xl md:rounded-2xl flex items-center justify-center text-gray-400 mb-3 md:mb-4">
              <CreditCard size={24} className="md:w-7 md:h-7" />
            </div>
            <h3 className="font-bold text-gray-900 text-xs md:text-sm mb-1">Belum ada rekening bank</h3>
            <p className="text-[10px] md:text-xs text-gray-500 max-w-xs leading-relaxed mb-4 md:mb-6">
              Hubungkan rekening bank Anda untuk memudahkan penarikan saldo penjualan.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rekeningList.map((rek, index) => (
              <div key={index} className={`p-4 md:p-5 border rounded-2xl relative flex items-start justify-between gap-4 transition-all ${
                index === 0 ? 'border-emerald-100 bg-emerald-50/30' : 'border-gray-100 bg-gray-50/50'
              }`}>
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm shrink-0">
                    <span className="font-bold text-[10px] md:text-xs text-emerald-600 uppercase tracking-wider">
                      {rek.namaBank.substring(0, 3)}
                    </span>
                  </div>
                  <div className="space-y-0.5 md:space-y-1">
                    <h4 className="font-bold text-gray-900 text-sm md:text-base">{rek.namaBank}</h4>
                    <p className="font-mono text-xs md:text-sm text-gray-600 tracking-wider">
                      {rek.nomorRekening.replace(/(\d{4})/g, '$1 ').trim()}
                    </p>
                    <p className="text-[10px] md:text-xs text-gray-400 font-semibold uppercase tracking-wider">
                      a.n. {rek.namaPemilik}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {index === 0 && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] md:text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Utama
                    </span>
                  )}
                  <button 
                    onClick={() => setDeleteRekeningIndex(index)}
                    className="p-1.5 md:p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    title="Hapus Rekening"
                  >
                    <X size={14} className="md:w-4 md:h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Custom Delete Confirmation Modal */}
        {deleteRekeningIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteRekeningIndex(null)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-red-50 text-red-500">
                <CreditCard className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Hapus Rekening?</h3>
              <p className="text-sm text-gray-500 text-center leading-relaxed mb-6">
                Rekening <strong>{rekeningList[deleteRekeningIndex]?.namaBank}</strong> {rekeningList[deleteRekeningIndex]?.nomorRekening} akan dihapus dari daftar Anda.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteRekeningIndex(null)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleRemoveRekening(deleteRekeningIndex)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menghapus...</>
                  ) : 'Ya, Hapus'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const renderSecurityTab = () => (
    <div className="space-y-6 md:space-y-8">
      {/* Change Password */}
      <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-sm md:shadow-soft-lg border border-gray-100">
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <div className="p-1.5 md:p-2 bg-rose-50 text-rose-500 rounded-lg md:rounded-xl">
            <Lock className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <h2 className="text-base md:text-xl font-bold text-gray-900">Ubah Kata Sandi</h2>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 md:space-y-6 max-w-lg">
          <div className="space-y-1.5 md:space-y-2">
            <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">Password Sekarang</label>
            <input
              type="password"
              className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl md:rounded-2xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            />
          </div>
          <div className="space-y-1.5 md:space-y-2">
            <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">Password Baru</label>
            <input
              type="password"
              className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl md:rounded-2xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            />
          </div>
          <div className="space-y-1.5 md:space-y-2">
            <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">Konfirmasi Password Baru</label>
            <input
              type="password"
              className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl md:rounded-2xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            />
          </div>
          <Button 
            type="submit" 
            isLoading={isSubmitting}
            className="w-full md:w-auto px-6 md:px-8 bg-gray-900 text-white rounded-xl md:rounded-2xl py-2.5 md:py-3 text-xs md:text-sm font-bold mt-2"
          >
            Update Password
          </Button>
        </form>
      </div>


      {/* KTP Verification */}
      {user?.role === 'seller' && (
        <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-sm md:shadow-soft-lg border border-gray-100">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <div className="p-1.5 md:p-2 bg-emerald-50 text-emerald-500 rounded-lg md:rounded-xl">
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h2 className="text-base md:text-xl font-bold text-gray-900">Verifikasi Data Diri (KTP)</h2>
          </div>

          {/* KTP pending status */}
          {user?.ktp_status === 'pending' && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl md:rounded-3xl p-4 md:p-6 flex items-start gap-3 md:gap-4 animate-in fade-in duration-300">
              <div className="p-2.5 md:p-3 bg-amber-100 text-amber-600 rounded-xl md:rounded-2xl shrink-0">
                <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 text-sm md:text-base">Sedang Diverifikasi</h3>
                <p className="text-amber-700 text-xs md:text-sm mt-0.5 md:mt-1 leading-relaxed">Data KTP Anda sedang dalam proses peninjauan oleh Admin.</p>
              </div>
            </div>
          )}

          {/* KTP verified status */}
          {user?.ktp_status === 'verified' && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl md:rounded-3xl p-4 md:p-6 flex items-start gap-3 md:gap-4 animate-in fade-in duration-300">
              <div className="p-2.5 md:p-3 bg-emerald-100 text-emerald-600 rounded-xl md:rounded-2xl shrink-0">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-950 text-sm md:text-base">Terverifikasi</h3>
                <p className="text-emerald-700 text-xs md:text-sm mt-0.5 md:mt-1 leading-relaxed">Akun Anda telah sukses diverifikasi sebagai Penjual Terpercaya.</p>
              </div>
            </div>
          )}

          {/* KTP rejected / not uploaded status */}
          {user?.ktp_status !== 'pending' && user?.ktp_status !== 'verified' && (
            <div className="space-y-4 md:space-y-6 animate-in fade-in duration-300">
              {user?.ktp_status === 'rejected' && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl md:rounded-2xl p-4 mb-4 md:mb-6">
                  <div className="flex gap-2.5 md:gap-3">
                    <AlertCircle className="text-rose-600 shrink-0 w-4 h-4 md:w-5 md:h-5" />
                    <div className="text-xs md:text-sm">
                      <p className="font-bold text-rose-900">Penolakan Admin:</p>
                      <p className="text-rose-700 mt-0.5">{user.ktp_rejection_reason || 'Foto KTP kurang jelas.'}</p>
                      <p className="text-rose-600 mt-2 font-medium">Silakan upload ulang foto KTP Anda melalui form di bawah.</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleKtpSubmit} className="space-y-4 md:space-y-6">
                <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
                  Verifikasi KTP diperlukan jika Anda ingin menjadi <strong className="text-gray-900">Penjual Terpercaya</strong> dan meningkatkan batas penarikan dana.
                </p>

                {/* NIK and Nama */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">NIK KTP (16 Digit)</label>
                    <input
                      type="text"
                      placeholder="Masukkan 16 digit NIK"
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-xs md:text-sm placeholder-gray-400"
                      value={ktpForm.nik}
                      onChange={(e) => setKtpForm({...ktpForm, nik: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Sesuai KTP</label>
                    <input
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-xs md:text-sm placeholder-gray-400"
                      value={ktpForm.namaKtp}
                      onChange={(e) => setKtpForm({...ktpForm, namaKtp: e.target.value})}
                    />
                  </div>
                </div>

                {/* Tempat Lahir and Tanggal Lahir */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">Tempat Lahir</label>
                    <input
                      type="text"
                      placeholder="Contoh: Jakarta"
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-xs md:text-sm placeholder-gray-400"
                      value={ktpForm.tempatLahir}
                      onChange={(e) => setKtpForm({...ktpForm, tempatLahir: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal Lahir</label>
                    <input
                      type="date"
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-xs md:text-sm text-gray-700 placeholder-gray-400"
                      value={ktpForm.tanggalLahir}
                      onChange={(e) => setKtpForm({...ktpForm, tanggalLahir: e.target.value})}
                    />
                  </div>
                </div>

                {/* Foto KTP Upload and Camera Container */}
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider block">Foto KTP</label>
                  
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl md:rounded-3xl p-4 md:p-8 text-center hover:border-emerald-300 transition-colors bg-gray-50/50">
                    <input 
                      type="file" 
                      className="hidden" 
                      id="ktp-upload" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setKtpForm(prev => ({ ...prev, image: file, imagePreview: reader.result }))
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                    
                    {ktpForm.imagePreview ? (
                      <div className="relative max-w-sm mx-auto animate-in fade-in duration-300">
                        <img src={ktpForm.imagePreview} alt="Preview KTP" className="w-full h-auto rounded-xl md:rounded-2xl border border-gray-200 shadow-md" />
                        <button 
                          type="button"
                          onClick={() => setKtpForm(prev => ({ ...prev, image: null, imagePreview: null }))}
                          className="absolute -top-2.5 -right-2.5 md:-top-3 md:-right-3 bg-rose-500 text-white rounded-full p-1.5 md:p-2 hover:bg-rose-600 shadow-lg transition-all"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 md:space-y-4">
                        <label htmlFor="ktp-upload" className="cursor-pointer block group">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-50 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:bg-emerald-100 transition-colors">
                            <Upload className="text-emerald-500 w-6 h-6 md:w-7 md:h-7" />
                          </div>
                          <p className="text-xs md:text-sm font-bold text-gray-900">Klik untuk upload foto KTP</p>
                          <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">Format JPG, PNG (Maks 2MB)</p>
                        </label>
                        
                        <div className="flex justify-center pt-1 md:pt-2">
                          <button 
                            type="button" 
                            onClick={startCamera}
                            className="px-4 py-1.5 md:px-6 md:py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-full font-bold text-[10px] md:text-xs flex items-center gap-1 md:gap-1.5 transition-all shadow-sm"
                          >
                            <Camera size={12} className="text-emerald-600" /> Ambil Foto Realtime
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  isLoading={isSubmitting}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl md:rounded-2xl py-2.5 md:py-3.5 text-xs md:text-sm font-bold transition-all shadow-md mt-4 md:mt-6"
                >
                  Kirim untuk Verifikasi
                </Button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Real-time Camera Capture Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-900">Ambil Foto KTP</h3>
              <button 
                type="button" 
                onClick={stopCamera}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Live Camera Feed */}
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] border border-gray-800 shadow-inner flex items-center justify-center">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              
              {/* Guidance Box Overlay / KTP Scanner Frame */}
              <div className="absolute inset-6 border-2 border-dashed border-white/80 rounded-2xl pointer-events-none flex flex-col justify-between p-4 bg-black/10">
                {/* Top header of dummy KTP */}
                <div className="flex justify-between items-center w-full">
                  <span className="text-[7px] font-bold text-white/70 tracking-widest uppercase">REPUBLIK INDONESIA</span>
                  <div className="w-10 h-1.5 bg-white/20 rounded"></div>
                </div>

                {/* Middle content: fields & photos */}
                <div className="flex-1 flex items-center justify-between gap-4 my-2 w-full">
                  {/* Left fields list */}
                  <div className="flex-1 space-y-2">
                    <div className="w-1/2 h-2 bg-white/40 rounded"></div>
                    <div className="w-4/5 h-1 bg-white/25 rounded"></div>
                    <div className="w-3/4 h-1 bg-white/25 rounded"></div>
                    <div className="w-2/3 h-1 bg-white/25 rounded"></div>
                    <div className="w-1/2 h-1 bg-white/25 rounded"></div>
                  </div>

                  {/* Right photo box */}
                  <div className="w-20 flex flex-col items-center gap-1.5">
                    {/* Face avatar card */}
                    <div className="w-16 h-20 border border-dashed border-white/70 rounded-lg flex flex-col items-center justify-center bg-white/5 backdrop-blur-[0.5px]">
                      <User size={14} className="text-white/40 mb-1" />
                      <span className="text-[6px] font-bold text-white/55 tracking-wider uppercase">Foto Wajah</span>
                    </div>
                    {/* Signature card */}
                    <div className="w-16 h-6 border border-dashed border-white/40 rounded bg-white/5 backdrop-blur-[0.5px] flex items-center justify-center">
                      <span className="text-[4px] font-bold text-white/30 tracking-wider uppercase">Tanda Tangan</span>
                    </div>
                  </div>
                </div>

                {/* Bottom guidance pill */}
                <div className="w-full flex justify-center">
                  <span className="bg-emerald-600/90 text-white font-bold text-[8px] tracking-widest px-3 py-1 rounded-full uppercase shadow-md border border-emerald-500/30 backdrop-blur-sm">
                    Posisikan KTP di Dalam Kotak
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="flex gap-4 mt-6 justify-end">
              <button
                type="button"
                onClick={stopCamera}
                className="px-6 py-2.5 border border-emerald-600 text-emerald-700 font-bold rounded-2xl hover:bg-emerald-50 transition-all text-sm"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={capturePhoto}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center gap-2 transition-all shadow-md text-sm"
              >
                <Camera size={16} /> Ambil Foto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow py-6 md:py-12">
        <Container maxWidth="max-w-6xl">
          <Link to="/" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors mb-4 md:mb-6 group">
            <ArrowLeft className="w-3.5 h-3.5 md:w-[18px] md:h-[18px] group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs md:text-sm font-medium">Kembali ke Beranda</span>
          </Link>

          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-10">Pengaturan Akun</h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8 items-start">
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-3">
              <nav className="bg-white rounded-2xl md:rounded-3xl p-1.5 md:p-2 lg:p-4 shadow-sm md:shadow-soft-lg border border-gray-100 flex flex-row lg:flex-col gap-1 overflow-x-auto hide-scrollbar">
                <button
                  onClick={() => handleTabChange('profile')}
                  className={`flex-1 lg:w-full min-w-max flex items-center justify-between p-2.5 md:p-3 lg:p-4 rounded-xl lg:rounded-2xl transition-all group ${
                    activeTab === 'profile' ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-2 lg:gap-3">
                    <User className={`w-4 h-4 lg:w-5 lg:h-5 ${activeTab === 'profile' ? 'text-primary-600' : 'text-gray-400'}`} />
                    <span className="font-semibold text-xs md:text-sm lg:text-base">Profil Saya</span>
                  </div>
                  {activeTab === 'profile' ? (
                    <div className="hidden lg:block w-1.5 h-6 bg-primary-600 rounded-full" />
                  ) : (
                    <Edit2 size={16} className="hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>

                <button
                  onClick={() => handleTabChange('address')}
                  className={`flex-1 lg:w-full min-w-max flex items-center justify-between p-2.5 md:p-3 lg:p-4 rounded-xl lg:rounded-2xl transition-all group ${
                    activeTab === 'address' ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-2 lg:gap-3">
                    <MapPin className={`w-4 h-4 lg:w-5 lg:h-5 ${activeTab === 'address' ? 'text-primary-600' : 'text-gray-400'}`} />
                    <span className="font-semibold text-xs md:text-sm lg:text-base">Daftar Alamat</span>
                  </div>
                  {activeTab === 'address' ? (
                    <div className="hidden lg:block w-1.5 h-6 bg-primary-600 rounded-full" />
                  ) : (
                    <Edit2 size={16} className="hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>

                {user?.role === 'seller' && (
                  <button
                    onClick={() => handleTabChange('rekening')}
                    className={`flex-1 lg:w-full min-w-max flex items-center justify-between p-2.5 md:p-3 lg:p-4 rounded-xl lg:rounded-2xl transition-all group ${
                      activeTab === 'rekening' ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 lg:gap-3">
                      <CreditCard className={`w-4 h-4 lg:w-5 lg:h-5 ${activeTab === 'rekening' ? 'text-primary-600' : 'text-gray-400'}`} />
                      <span className="font-semibold text-xs md:text-sm lg:text-base">Rekening Bank</span>
                    </div>
                    {activeTab === 'rekening' ? (
                      <div className="hidden lg:block w-1.5 h-6 bg-primary-600 rounded-full" />
                    ) : (
                      <Edit2 size={16} className="hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                )}

                <button
                  onClick={() => handleTabChange('security')}
                  className={`flex-1 lg:w-full min-w-max flex items-center justify-between p-2.5 md:p-3 lg:p-4 rounded-xl lg:rounded-2xl transition-all group ${
                    activeTab === 'security' ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-2 lg:gap-3">
                    <ShieldCheck className={`w-4 h-4 lg:w-5 lg:h-5 ${activeTab === 'security' ? 'text-primary-600' : 'text-gray-400'}`} />
                    <span className="font-semibold text-xs md:text-sm lg:text-base">Keamanan</span>
                  </div>
                  {activeTab === 'security' ? (
                    <div className="hidden lg:block w-1.5 h-6 bg-primary-600 rounded-full" />
                  ) : (
                    <Edit2 size={16} className="hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>

                {/* Langganan - Buyer & Seller */}
                <button
                  onClick={() => handleTabChange('subscription')}
                  className={`flex-1 lg:w-full min-w-max flex items-center justify-between p-2.5 md:p-3 lg:p-4 rounded-xl lg:rounded-2xl transition-all group ${
                    activeTab === 'subscription'
                      ? 'bg-violet-50 text-violet-700'
                      : 'hover:bg-gray-50 text-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-2 lg:gap-3">
                    <Crown className={`w-4 h-4 lg:w-5 lg:h-5 ${
                      activeTab === 'subscription' ? 'text-violet-600' : 'text-gray-400'
                    }`} />
                    <span className="font-semibold text-xs md:text-sm lg:text-base">
                      {user?.role === 'seller' ? 'Premium Seller' : 'Langganan'}
                    </span>
                    {subscription && subscription.status !== 'pending' && (
                      <span className="ml-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold rounded-full uppercase">Aktif</span>
                    )}
                  </div>
                  {activeTab === 'subscription' ? (
                    <div className="hidden lg:block w-1.5 h-6 bg-violet-600 rounded-full" />
                  ) : (
                    <Edit2 size={16} className="hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              </nav>
            </aside>

            {/* Tab Content */}
            <div className="lg:col-span-9 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeTab === 'profile' && renderProfileTab()}
              {activeTab === 'address' && renderAddressTab()}
              {activeTab === 'rekening' && user?.role === 'seller' && renderRekeningTab()}
              {activeTab === 'security' && renderSecurityTab()}
              {activeTab === 'subscription' && renderSubscriptionTab()}
            </div>
          </div>
        </Container>
      </main>

      <Footer />

      {/* Rekening Bank Modal */}
      {isRekeningModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-300 border border-gray-100">
            <button 
              onClick={() => setIsRekeningModalOpen(false)}
              className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                <CreditCard size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Hubungkan Rekening Bank</h3>
                <p className="text-xs text-gray-400">Pastikan data yang Anda masukkan sudah benar.</p>
              </div>
            </div>

            <form onSubmit={handleRekeningSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Bank</label>
                <select
                  value={bankForm.namaBank}
                  onChange={(e) => setBankForm({ ...bankForm, namaBank: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm font-semibold cursor-pointer"
                >
                  {['BCA', 'Mandiri', 'BNI', 'BRI', 'CIMB Niaga', 'Bank Permata', 'Danamon', 'BSI'].map(bank => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nomor Rekening</label>
                <input
                  type="text"
                  placeholder="Contoh: 1234567890"
                  value={bankForm.nomorRekening}
                  onChange={(e) => setBankForm({ ...bankForm, nomorRekening: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-mono text-sm tracking-wider"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Pemilik Rekening</label>
                <input
                  type="text"
                  placeholder="Nama lengkap pemilik rekening"
                  value={bankForm.namaPemilik}
                  onChange={(e) => setBankForm({ ...bankForm, namaPemilik: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm font-semibold"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsRekeningModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 transition-all text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-md text-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Rekening'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
