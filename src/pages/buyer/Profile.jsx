import { useState, useRef, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { 
  User, MapPin, ShieldCheck, Camera, 
  Calendar, ArrowLeft, Mail, Phone, 
  Lock, CheckCircle, Plus, Edit2, AlertCircle,
  X, Upload, CreditCard
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import Button from '../../components/common/Button'
import { toast } from 'react-hot-toast'
import api from '../../services/api'
import { userService } from '../../services/userService'

const Profile = () => {
  const { user, updateProfile, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [verifyingPhone, setVerifyingPhone] = useState(false)
  const fileInputRef = useRef(null)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // Jika backend redirect ke /profile?verified=1, refresh data user otomatis
  useEffect(() => {
    if (searchParams.get('verified') === '1') {
      toast.success('Email berhasil diverifikasi! 🎉', { duration: 5000 })
      refreshUser().then(() => {
        // Bersihkan query param dari URL tanpa reload halaman
        navigate('/profile', { replace: true })
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Form States
  const [profileForm, setProfileForm] = useState({
    nama: user?.profile?.nama || '',
    noTelp: user?.profile?.noTelp || '',
    jenisKelamin: user?.profile?.jenisKelamin || 'Laki-laki',
    tanggalLahir: user?.profile?.tanggalLahir || '',
  })

  // Sinkronisasi form jika data user berubah (setelah refreshUser)
  useEffect(() => {
    if (user?.profile) {
      setProfileForm({
        nama: user.profile.nama || '',
        noTelp: user.profile.noTelp || '',
        jenisKelamin: user.profile.jenisKelamin || 'Laki-laki',
        tanggalLahir: user.profile.tanggalLahir || '',
      })
    }
  }, [user])

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [isRekeningModalOpen, setIsRekeningModalOpen] = useState(false)
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

  // Sinkronisasi rekening bank
  useEffect(() => {
    if (user?.profile?.noRekening) {
      const parts = user.profile.noRekening.split(' - ')
      setBankForm({
        namaBank: parts[0] || 'BCA',
        nomorRekening: parts[1] || user.profile.noRekening,
        namaPemilik: parts[2] || user.profile.nama || ''
      })
    } else {
      setBankForm({
        namaBank: 'BCA',
        nomorRekening: '',
        namaPemilik: user?.profile?.nama || ''
      })
    }
  }, [user])

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
        role: user.role
      }
      await updateProfile(payload)
      toast.success('Profil berhasil diperbarui')
    } catch (error) {
      toast.error(error.message || 'Gagal memperbarui profil')
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
      const combinedValue = `${bankForm.namaBank} - ${bankForm.nomorRekening.trim()} - ${bankForm.namaPemilik.trim()}`
      await updateProfile({
        name: user.profile.nama,
        email: user.email,
        no_rekening: combinedValue
      })
      toast.success('Rekening bank berhasil disimpan')
      setIsRekeningModalOpen(false)
    } catch (error) {
      toast.error(error.message || 'Gagal menyimpan rekening bank')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveRekening = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus rekening bank ini?')) {
      setIsSubmitting(true)
      try {
        await updateProfile({
          name: user.profile.nama,
          email: user.email,
          no_rekening: null
        })
        toast.success('Rekening bank berhasil dihapus')
      } catch (error) {
        toast.error(error.message || 'Gagal menghapus rekening bank')
      } finally {
        setIsSubmitting(false)
      }
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

  const renderProfileTab = () => (
    <div className="bg-white rounded-3xl p-8 shadow-soft-lg border border-gray-100">
      <div className="flex items-center gap-6 mb-8">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100">
            {user?.profile?.avatar ? (
              <img src={user.profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <User size={40} />
              </div>
            )}
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors"
          >
            <Camera size={14} />
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
          <h3 className="text-xl font-bold text-gray-900">{user?.profile?.nama || 'User'}</h3>
          <p className="text-sm text-gray-500 mt-1">Update foto profil dan informasi pribadi Anda.</p>
        </div>
      </div>

      <form onSubmit={handleProfileSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Nama Lengkap</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <User size={18} />
              </div>
              <input
                type="text"
                value={profileForm.nama}
                onChange={(e) => setProfileForm({ ...profileForm, nama: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                placeholder="Masukkan nama lengkap"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Alamat Email</label>
            <div className="relative flex items-center gap-3">
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-2xl text-gray-500 cursor-not-allowed"
                />
              </div>
              {user?.emailVerifiedAt ? (
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                  <CheckCircle size={10} /> Verified
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={resending}
                  className="whitespace-nowrap px-4 py-2 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl border border-amber-200 hover:bg-amber-100 transition-colors disabled:opacity-50"
                >
                  {resending ? 'Mengirim...' : 'Kirim Link Verifikasi'}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Nomor HP</label>
            <div className="relative flex items-center gap-3">
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Phone size={18} />
                </div>
                <input
                  type="text"
                  value={profileForm.noTelp}
                  onChange={(e) => setProfileForm({ ...profileForm, noTelp: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                  placeholder="0812xxxx"
                />
              </div>
              {user?.phoneVerifiedAt ? (
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                  <CheckCircle size={10} /> Verified
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleVerifyPhone}
                  disabled={verifyingPhone}
                  className="whitespace-nowrap px-4 py-2 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl border border-amber-200 hover:bg-amber-100 transition-colors disabled:opacity-50"
                >
                  {verifyingPhone ? 'Mengirim...' : 'Verifikasi'}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Jenis Kelamin</label>
            <div className="flex gap-3">
              {['Laki-laki', 'Perempuan'].map((gender) => (
                <button
                  key={gender}
                  type="button"
                  onClick={() => setProfileForm({ ...profileForm, jenisKelamin: gender })}
                  className={`flex-1 py-3 rounded-2xl border transition-all font-medium ${
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

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Tanggal Lahir</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Calendar size={18} />
              </div>
              <input
                type="date"
                value={profileForm.tanggalLahir}
                onChange={(e) => setProfileForm({ ...profileForm, tanggalLahir: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button 
            type="submit" 
            isLoading={isSubmitting}
            className="px-8 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl py-3"
          >
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  )

  const renderAddressTab = () => (
    <div className="bg-white rounded-3xl p-8 shadow-soft-lg border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Alamat Saya</h2>
        <button className="flex items-center gap-1.5 text-primary-600 font-semibold text-sm hover:text-primary-700">
          <Plus size={18} /> Tambah Alamat Baru
        </button>
      </div>

      <div className="space-y-4">
        {/* Address Card */}
        <div className="p-6 border-2 border-primary-100 bg-primary-50/30 rounded-3xl relative">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-bold text-gray-900">Utama</span>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold rounded-full">
              <MapPin size={10} /> TITIK MAP TERPASANG
            </div>
          </div>
          <div className="space-y-1 text-gray-700">
            <p className="font-bold text-gray-900">{user?.profile?.nama}</p>
            <p className="text-sm leading-relaxed max-w-lg">
              {user?.profile?.alamat || 'Jalan Ungaran, Mulyoharjo, Pemalang, Central Java, Java, 52312, Indonesia'}
            </p>
          </div>
          <button className="mt-4 text-primary-600 font-bold text-sm hover:underline">
            Ubah Alamat
          </button>
        </div>
      </div>
    </div>
  )

  const renderRekeningTab = () => {
    const hasRekening = !!user?.profile?.noRekening;
    
    // Parse combined rekening
    const parts = (user?.profile?.noRekening || '').split(' - ');
    const bankName = parts[0] || 'Bank';
    const accNo = parts[1] || user?.profile?.noRekening || '';
    const accHolder = parts[2] || user?.profile?.nama || '';

    return (
      <div className="bg-white rounded-3xl p-8 shadow-soft-lg border border-gray-100 animate-in fade-in duration-300">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Simpan rekening untuk penarikan saldo</h2>
            <p className="text-gray-400 text-xs mt-1">Saldo Thriftly kamu bisa ditarik ke rekening ini.</p>
          </div>
          {hasRekening && (
            <button 
              onClick={() => setIsRekeningModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 border border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-bold rounded-2xl text-xs transition-colors"
            >
              + Tambah Rekening Lain
            </button>
          )}
        </div>

        {!hasRekening ? (
          <div className="border-2 border-dashed border-gray-100 rounded-3xl p-12 text-center flex flex-col items-center justify-center bg-gray-50/50">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 mb-4">
              <CreditCard size={28} />
            </div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">Belum ada rekening bank</h3>
            <p className="text-xs text-gray-500 max-w-sm leading-relaxed mb-6">
              Hubungkan rekening bank Anda untuk memudahkan penarikan saldo penjualan.
            </p>
            <button 
              onClick={() => setIsRekeningModalOpen(true)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-all shadow-md animate-bounce"
            >
              + Tambah Rekening Sekarang
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Premium Bank Card */}
            <div className="p-6 border border-emerald-100 bg-emerald-50/30 rounded-3xl relative flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm shrink-0">
                  <div className="font-bold text-xs text-emerald-600 uppercase tracking-wider">
                    {bankName.substring(0, 3)}
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-900 text-base">{bankName}</h4>
                  <p className="font-mono text-sm text-gray-600 tracking-wider">
                    {accNo.replace(/(\d{4})/g, '$1 ').trim()}
                  </p>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    a.n. {accHolder}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Aktif
                </span>
                <button 
                  onClick={handleRemoveRekening}
                  className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  title="Hapus Rekening"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const renderSecurityTab = () => (
    <div className="space-y-8">
      {/* Change Password */}
      <div className="bg-white rounded-3xl p-8 shadow-soft-lg border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-rose-50 text-rose-500 rounded-xl">
            <Lock size={20} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Ubah Kata Sandi</h2>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-lg">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password Sekarang</label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password Baru</label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Konfirmasi Password Baru</label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            />
          </div>
          <Button 
            type="submit" 
            isLoading={isSubmitting}
            className="w-full md:w-auto px-8 bg-gray-900 text-white rounded-2xl py-3 mt-4"
          >
            Update Password
          </Button>
        </form>
      </div>


      {/* KTP Verification */}
      {user?.role === 'seller' && (
        <div className="bg-white rounded-3xl p-8 shadow-soft-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl">
              <CheckCircle size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Verifikasi Data Diri (KTP)</h2>
          </div>

          {/* KTP pending status */}
          {user?.ktp_status === 'pending' && (
            <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex items-start gap-4 animate-in fade-in duration-300">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 text-base">Sedang Diverifikasi</h3>
                <p className="text-amber-700 text-sm mt-1 leading-relaxed">Data KTP Anda sedang dalam proses peninjauan oleh Admin.</p>
              </div>
            </div>
          )}

          {/* KTP verified status */}
          {user?.ktp_status === 'verified' && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 flex items-start gap-4 animate-in fade-in duration-300">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl shrink-0">
                <CheckCircle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-emerald-950 text-base">Terverifikasi</h3>
                <p className="text-emerald-700 text-sm mt-1 leading-relaxed">Akun Anda telah sukses diverifikasi sebagai Penjual Terpercaya.</p>
              </div>
            </div>
          )}

          {/* KTP rejected / not uploaded status */}
          {user?.ktp_status !== 'pending' && user?.ktp_status !== 'verified' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {user?.ktp_status === 'rejected' && (
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 mb-6">
                  <div className="flex gap-3">
                    <AlertCircle className="text-rose-600 shrink-0" size={20} />
                    <div className="text-sm">
                      <p className="font-bold text-rose-900">Penolakan Admin:</p>
                      <p className="text-rose-700 mt-0.5">{user.ktp_rejection_reason || 'Foto KTP kurang jelas.'}</p>
                      <p className="text-rose-600 mt-2 font-medium">Silakan upload ulang foto KTP Anda melalui form di bawah.</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleKtpSubmit} className="space-y-6">
                <p className="text-sm text-gray-500 leading-relaxed">
                  Verifikasi KTP diperlukan jika Anda ingin menjadi <strong className="text-gray-900">**Penjual Terpercaya**</strong> dan meningkatkan batas penarikan dana.
                </p>

                {/* NIK and Nama */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">NIK KTP (16 Digit)</label>
                    <input
                      type="text"
                      placeholder="Masukkan 16 digit NIK"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm placeholder-gray-400"
                      value={ktpForm.nik}
                      onChange={(e) => setKtpForm({...ktpForm, nik: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Sesuai KTP</label>
                    <input
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm placeholder-gray-400"
                      value={ktpForm.namaKtp}
                      onChange={(e) => setKtpForm({...ktpForm, namaKtp: e.target.value})}
                    />
                  </div>
                </div>

                {/* Tempat Lahir and Tanggal Lahir */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tempat Lahir</label>
                    <input
                      type="text"
                      placeholder="Contoh: Jakarta"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm placeholder-gray-400"
                      value={ktpForm.tempatLahir}
                      onChange={(e) => setKtpForm({...ktpForm, tempatLahir: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal Lahir</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm text-gray-700 placeholder-gray-400"
                      value={ktpForm.tanggalLahir}
                      onChange={(e) => setKtpForm({...ktpForm, tanggalLahir: e.target.value})}
                    />
                  </div>
                </div>

                {/* Foto KTP Upload and Camera Container */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Foto KTP</label>
                  
                  <div className="border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center hover:border-emerald-300 transition-colors bg-gray-50/50">
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
                        <img src={ktpForm.imagePreview} alt="Preview KTP" className="w-full h-auto rounded-2xl border border-gray-200 shadow-md" />
                        <button 
                          type="button"
                          onClick={() => setKtpForm(prev => ({ ...prev, image: null, imagePreview: null }))}
                          className="absolute -top-3 -right-3 bg-rose-500 text-white rounded-full p-2 hover:bg-rose-600 shadow-lg transition-all"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <label htmlFor="ktp-upload" className="cursor-pointer block group">
                          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-100 transition-colors">
                            <Upload className="text-emerald-500" size={30} />
                          </div>
                          <p className="text-sm font-bold text-gray-900">Klik untuk upload foto KTP</p>
                          <p className="text-xs text-gray-500 mt-1">Format JPG, PNG (Maks 2MB)</p>
                        </label>
                        
                        <div className="flex justify-center pt-2">
                          <button 
                            type="button" 
                            onClick={startCamera}
                            className="px-6 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                          >
                            <Camera size={14} className="text-emerald-600" /> Ambil Foto Realtime
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  isLoading={isSubmitting}
                  className="w-full bg-emerald-500 text-white rounded-2xl py-3.5 font-bold hover:bg-emerald-600 transition-all shadow-md mt-6"
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
      
      <main className="flex-grow py-8 md:py-12">
        <Container maxWidth="max-w-6xl">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-6 group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Kembali ke Beranda</span>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-10">Pengaturan Akun</h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-3">
              <nav className="bg-white rounded-3xl p-4 shadow-soft-lg border border-gray-100 space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                    activeTab === 'profile' ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <User size={20} className={activeTab === 'profile' ? 'text-primary-600' : 'text-gray-400'} />
                    <span className="font-semibold">Profil Saya</span>
                  </div>
                  {activeTab === 'profile' ? (
                    <div className="w-1.5 h-6 bg-primary-600 rounded-full" />
                  ) : (
                    <Edit2 size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('address')}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                    activeTab === 'address' ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MapPin size={20} className={activeTab === 'address' ? 'text-primary-600' : 'text-gray-400'} />
                    <span className="font-semibold">Daftar Alamat</span>
                  </div>
                  {activeTab === 'address' ? (
                    <div className="w-1.5 h-6 bg-primary-600 rounded-full" />
                  ) : (
                    <Edit2 size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>

                {user?.role === 'seller' && (
                  <button
                    onClick={() => setActiveTab('rekening')}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                      activeTab === 'rekening' ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard size={20} className={activeTab === 'rekening' ? 'text-primary-600' : 'text-gray-400'} />
                      <span className="font-semibold">Rekening Bank</span>
                    </div>
                    {activeTab === 'rekening' ? (
                      <div className="w-1.5 h-6 bg-primary-600 rounded-full" />
                    ) : (
                      <Edit2 size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                    activeTab === 'security' ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={20} className={activeTab === 'security' ? 'text-primary-600' : 'text-gray-400'} />
                    <span className="font-semibold">Keamanan</span>
                  </div>
                  {activeTab === 'security' ? (
                    <div className="w-1.5 h-6 bg-primary-600 rounded-full" />
                  ) : (
                    <Edit2 size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
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
