import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MapPin } from 'lucide-react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { registerSellerSchema } from '../../utils/validation'
import { getLocationFromCoordinates, reverseGeocode } from '../../utils/geolocation'
import Button from '../../components/common/Button'
import Container from '../../components/layout/Container'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import { ALL_LOCATIONS } from '../../constants/locations'
import { BUTTONS, PLACEHOLDERS, INSTRUCTIONS } from '../../constants/copywriting'
import toast from 'react-hot-toast'

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

const SellerRegister = () => {
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  const [mapPosition, setMapPosition] = useState([-6.9932, 110.4229]) // Default: Semarang
  const [isLocating, setIsLocating] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registerSellerSchema)
  })

  const currentAlamat = watch('alamat') || ''
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data) => {
    setLoading(true)
    let lokasiValue = 'semarang'
    if (mapPosition && mapPosition.length === 2) {
      const resolved = reverseGeocode(mapPosition[0], mapPosition[1])
      if (resolved) {
        lokasiValue = resolved.id
      }
    }
    const result = await registerUser({
      email: data.email,
      password: data.password,
      role: 'seller',
      profile: {
        nama: data.nama,
        ttl: data.ttl,
        noTelp: data.noTelp,
        alamat: data.alamat,
        lokasi: lokasiValue
      }
    })
    setLoading(false)

    if (result.success) {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <Container className="flex-1 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Daftar sebagai Penjual
            </h1>
            <p className="text-gray-600 mb-6">
              Lengkapi data KYC untuk mulai jualan
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold mb-4">Informasi Akun</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password *
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Konfirmasi Password *
                      </label>
                      <input
                        type="password"
                        {...register('confirmPassword')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder={PLACEHOLDERS.password}
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold mb-4">Data Diri</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      {...register('nama')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder={PLACEHOLDERS.name}
                    />
                    {errors.nama && (
                      <p className="text-red-500 text-sm mt-1">{errors.nama.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tanggal Lahir *
                      </label>
                      <input
                        type="date"
                        {...register('ttl')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                      {errors.ttl && (
                        <p className="text-red-500 text-sm mt-1">{errors.ttl.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nomor Telepon *
                      </label>
                      <input
                        type="tel"
                        {...register('noTelp')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder={PLACEHOLDERS.phone}
                      />
                      {errors.noTelp && (
                        <p className="text-red-500 text-sm mt-1">{errors.noTelp.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Map Selector */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Tentukan Titik Pengiriman</span>
                      <Button
                        type="button"
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
                                  setValue('alamat', response.data.display_name);
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

                    <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 z-0">
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
                        <LocationSelector position={mapPosition} setPosition={setMapPosition} setAddress={(addr) => setValue('alamat', addr)} />
                      </MapContainer>

                      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[400] pointer-events-none">
                        <span className="text-[10px] font-semibold text-gray-900 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-gray-200">
                          Klik pada peta untuk menaruh pin
                        </span>
                      </div>
                    </div>

                    {currentAlamat && (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Alamat Terpilih:</p>
                        <p className="text-xs text-gray-700 mt-1 leading-relaxed">{currentAlamat}</p>
                      </div>
                    )}

                    <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                      LANGKAH: GESER PETA &rarr; KLIK TITIK LOKASI TEPAT
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Alamat Lengkap &amp; Titik Lokasi *
                    </label>
                    <textarea
                      {...register('alamat')}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-shadow min-h-[100px] resize-none"
                      placeholder="Detail alamat (RT/RW, No. Rumah)"
                    />
                    {errors.alamat && (
                      <p className="text-red-500 text-sm mt-1">{errors.alamat.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={loading}
                disabled={loading}
              >
                {BUTTONS.register}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Sudah punya akun?{' '}
                <Link to="/login" className="text-red-600 hover:text-red-700 font-medium">
                  Masuk di sini
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

export default SellerRegister
