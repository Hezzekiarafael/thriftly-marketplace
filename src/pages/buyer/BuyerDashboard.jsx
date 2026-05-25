import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Package, ShoppingBag, Settings, MapPin, RefreshCw, LogOut, X, Check } from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useEffect } from 'react'
import { reverseGeocode } from '../../utils/geolocation'
import BuyerDashboardSkeleton from '../../components/common/BuyerDashboardSkeleton'

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

const BuyerDashboard = () => {
  const { user, loading, logout, updateProfile } = useAuth()
  const navigate = useNavigate()

  const [isEditingAlamat, setIsEditingAlamat] = useState(false)
  const [newAlamat, setNewAlamat] = useState(user?.profile?.alamat || '')
  const [isSaving, setIsSaving] = useState(false)
  const [mapPosition, setMapPosition] = useState([-6.9932, 110.4229]) // Default: Semarang
  const [isLocating, setIsLocating] = useState(false)



  const handleLogout = () => {
    navigate('/', { replace: true })
    setTimeout(() => logout(), 0)
  }

  if (loading) {
    return <BuyerDashboardSkeleton />
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-16 md:pb-0">
      <Header />

      <main className="flex-grow py-8">
        <Container maxWidth="max-w-4xl">
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-xl border-2 border-white shadow-sm shrink-0">
                {(user?.profile?.nama?.charAt(0) || 'B').toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Halo, {user?.profile?.nama || 'Bosku'}!
                </h1>
                <p className="text-gray-500 text-xs">Selamat datang di dashboard pembeli Anda.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link to="/buyer/orders" className="group p-4 rounded-xl border border-gray-100 hover:border-indigo-500 hover:shadow-md transition-all bg-gray-50 flex flex-col items-center text-center gap-2">
                <div className="bg-indigo-100 p-2.5 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xs">Pesanan Saya</h3>
                </div>
              </Link>

              <Link to="/products" className="group p-4 rounded-xl border border-gray-100 hover:border-accent-500 hover:shadow-md transition-all bg-gray-50 flex flex-col items-center text-center gap-2">
                <div className="bg-accent-100 p-2.5 rounded-lg text-accent-600 group-hover:bg-accent-600 group-hover:text-white transition-colors">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xs">Mulai Belanja</h3>
                </div>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings size={20} className="text-gray-400" /> Pengaturan Profil
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                    <p className="font-medium text-gray-900">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                      <MapPin size={14} /> Alamat Pengiriman
                    </p>
                    <p className="font-medium text-gray-900 mt-1 line-clamp-2 pr-4">{user?.profile?.alamat || 'Belum diatur'}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsEditingAlamat(true)}>
                    Edit Alamat
                  </Button>
                </div>
              </div>
            </div>

            {/* Tombol Logout — hanya tampil di mobile */}
            <div className="md:hidden mt-6 pt-6 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 font-semibold transition-colors text-sm"
              >
                <LogOut size={18} />
                Keluar dari Akun
              </button>
            </div>
          </div>
        </Container>
      </main>

      {/* Address Edit Modal */}
      <Modal
        isOpen={isEditingAlamat}
        onClose={() => {
          setIsEditingAlamat(false)
          setNewAlamat(user?.profile?.alamat || '')
        }}
        title="Ubah Alamat Pengiriman"
      >
        <div className="space-y-4">

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Tentukan Titik Pengiriman</span>
            <Button
              variant="outline"
              size="sm"
              isLoading={isLocating}
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
                        setNewAlamat(response.data.display_name);
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
              className="py-1 text-xs text-primary-600 border-primary-200 hover:bg-primary-50 rounded-full flex items-center gap-1"
            >
              <MapPin size={12} /> Gunakan Lokasi Saat Ini
            </Button>
          </div>

          {/* Map Placeholder */}
          <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 z-0">
            <MapContainer
              center={mapPosition}
              zoom={13}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&amp;copy <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationSelector position={mapPosition} setPosition={setMapPosition} setAddress={setNewAlamat} />
            </MapContainer>

            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[400] pointer-events-none">
              <span className="text-[10px] font-semibold text-gray-900 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-gray-200">
                Klik pada peta untuk menaruh pin
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat Lengkap
              </label>
              <textarea
                className="w-full text-sm p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow min-h-[100px] resize-none"
                value={newAlamat}
                onChange={(e) => setNewAlamat(e.target.value)}
                placeholder="Nama jalan, Gedung, No. Rumah / Patokan..."
              />
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex gap-3 items-start">
              <MapPin size={16} className="text-indigo-500 mt-0.5 shrink-0" />
              <p className="text-xs text-indigo-800 leading-relaxed">
                Pastikan titik lokasi dan alamat sudah sesuai agar kurir lebih mudah menemukan tempatmu.
              </p>
            </div>

          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setIsEditingAlamat(false)
                setNewAlamat(user?.profile?.alamat || '')
              }}
            >
              Batal
            </Button>
            <Button
              className="flex-1"
              isLoading={isSaving}
              onClick={async () => {
                if (!newAlamat.trim()) {
                  toast.error('Alamat tidak boleh kosong!');
                  return;
                }
                setIsSaving(true)
                let lokasiValue = user?.profile?.lokasi || 'semarang'
                if (mapPosition && mapPosition.length === 2) {
                  const resolved = reverseGeocode(mapPosition[0], mapPosition[1])
                  if (resolved) {
                    lokasiValue = resolved.id
                  }
                }
                const res = await updateProfile({ 
                  alamat: newAlamat,
                  lokasi: lokasiValue
                })
                if (res.success) {
                  toast.success('Alamat berhasil diperbarui!')
                  setIsEditingAlamat(false)
                }
                setIsSaving(false)
              }}
            >
              Simpan Alamat
            </Button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  )
}

export default BuyerDashboard
