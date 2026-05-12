import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { 
  User, MapPin, ShieldCheck, Camera, 
  Calendar, ArrowLeft, Mail, Phone, 
  Lock, CheckCircle, Plus, Edit2, AlertCircle
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import Button from '../../components/common/Button'
import { toast } from 'react-hot-toast'
import api from '../../services/api'

const Profile = () => {
  const { user, updateProfile, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const fileInputRef = useRef(null)

  // Form States
  const [profileForm, setProfileForm] = useState({
    nama: user?.profile?.nama || '',
    noTelp: user?.profile?.noTelp || '',
    jenisKelamin: user?.profile?.jenisKelamin || 'Laki-laki',
    tanggalLahir: user?.profile?.tanggalLahir || '',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [ktpForm, setKtpForm] = useState({
    nik: '',
    namaKtp: '',
    image: null
  })

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

  const handleUploadKtp = async (file) => {
    const fd = new FormData();
    fd.append('ktp_image', file);
    try {
      // In real scenario: await axios.post('/api/user/verify-ktp', fd);
      toast.success('Foto KTP berhasil diunggah. Menunggu verifikasi admin.')
    } catch (error) {
      toast.error('Gagal mengunggah KTP')
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
      await api.post('/email/verification-notification')
      toast.success('Email verifikasi baru telah dikirim!')
    } catch (error) {
      toast.error('Gagal mengirim email. Coba lagi nanti.')
    } finally {
      setResending(false)
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
              {user?.email_verified_at && user.email_verified_at !== null ? (
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
            <div className="relative">
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
      <div className="bg-white rounded-3xl p-8 shadow-soft-lg border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl">
            <CheckCircle size={20} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Verifikasi Data Diri (KTP)</h2>
        </div>

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

        <div className="space-y-6">
          <p className="text-sm text-gray-500 leading-relaxed">
            Verifikasi KTP diperlukan jika Anda ingin menjadi <strong className="text-gray-900">**Penjual Terpercaya**</strong> dan meningkatkan batas penarikan dana.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">NIK KTP (16 Digit)</label>
              <input
                type="text"
                placeholder="Masukkan 16 digit NIK"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                value={ktpForm.nik}
                onChange={(e) => setKtpForm({...ktpForm, nik: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Sesuai KTP</label>
              <input
                type="text"
                placeholder="Masukkan nama lengkap"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                value={ktpForm.namaKtp}
                onChange={(e) => setKtpForm({...ktpForm, namaKtp: e.target.value})}
              />
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center hover:border-primary-300 transition-colors cursor-pointer group">
            <input 
              type="file" 
              className="hidden" 
              id="ktp-upload" 
              onChange={(e) => e.target.files?.[0] && handleUploadKtp(e.target.files[0])}
            />
            <label htmlFor="ktp-upload" className="cursor-pointer block">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-50 transition-colors">
                <Camera size={30} className="text-gray-400 group-hover:text-primary-500" />
              </div>
              <p className="text-sm font-bold text-gray-900">Upload Foto KTP</p>
              <p className="text-xs text-gray-500 mt-1">Pastikan foto jelas dan terbaca. Format JPG/PNG max 2MB.</p>
            </label>
          </div>
        </div>
      </div>
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
              {activeTab === 'security' && renderSecurityTab()}
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  )
}

export default Profile
