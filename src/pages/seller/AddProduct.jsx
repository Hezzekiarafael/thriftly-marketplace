import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Upload, X } from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'
import { productService } from '../../services/productService'
import { useApp } from '../../context/AppContext'
import { productSchema } from '../../utils/validation'
import { useImageUpload } from '../../hooks/useImageUpload'
import { CATEGORIES } from '../../constants/categories'
import { CONDITIONS } from '../../constants/conditions'
import { ALL_LOCATIONS } from '../../constants/locations'
import { BUTTONS, PLACEHOLDERS, INSTRUCTIONS, SUCCESS } from '../../constants/copywriting'
import { getPriceRecommendation, formatPriceRecommendation } from '../../utils/priceRecommendation'
import { aiService } from '../../services/aiService'
import toast from 'react-hot-toast'

const AddProduct = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { products } = useApp()
  const [loading, setLoading] = useState(false)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [priceRec, setPriceRec] = useState(null)
  const { images, loading: uploadLoading, handleImageUpload, removeImage } = useImageUpload({
    maxFiles: 5,
    minFiles: 3
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      tipeJual: 'titip',
      opsiHarga: 'sendiri',
      isBU: false,
      lokasi: user?.profile?.lokasi || ''
    }
  })

  const watchKategori = watch('kategori')
  const watchKondisi = watch('kondisi')
  const watchOpsiHarga = watch('opsiHarga')

  const handleImageChange = async (e) => {
    const result = await handleImageUpload(e.target.files)
    if (result.success) {
      setValue('fotos', result.images)
    }
  }

  const handleRemoveImage = (index) => {
    removeImage(index)
    const newImages = images.filter((_, i) => i !== index)
    setValue('fotos', newImages)
  }

  const handleGetRecommendation = async () => {
    const watchNama = watch('nama')
    if (!watchNama || watchNama.length < 3) {
      toast.error('Ketik nama produk minimal 3 huruf dulu ya!')
      return
    }
    if (!watchKategori || !watchKondisi) {
      toast.error('Pilih kategori dan kondisi dulu ya!')
      return
    }

    setIsAiLoading(true)
    try {
      const rec = await aiService.getPriceRecommendation(watchNama, watchKategori, watchKondisi)
      
      if (rec.isMock) {
        toast.error('Fitur AI Harga mati, hubungi admin untuk aktivasi API Key.')
      }

      setPriceRec({
        message: rec.reason || 'Berdasarkan analisis pasar AI saat ini:',
        range: `Rp ${rec.min.toLocaleString('id-ID')} - Rp ${rec.max.toLocaleString('id-ID')}`,
        recommended: `Rp ${rec.recommended.toLocaleString('id-ID')}`,
        raw: rec
      })
      
      if (watchOpsiHarga === 'sistem' && rec.recommended > 0) {
        setValue('harga', rec.recommended)
      }
    } catch (error) {
      toast.error('Gagal mendapatkan rekomendasi AI')
    } finally {
      setIsAiLoading(false)
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const product = await productService.createProduct({
        ...data,
        sellerId: user.id
      })
      toast.success(SUCCESS.productCreated)
      navigate('/seller/products')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-16 md:pb-0">
      <Header />
      
      <Container>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Jual Barang Nganggur
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4">Tipe Penjualan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-red-500">
                  <input
                    type="radio"
                    {...register('tipeJual')}
                    value="titip"
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium">Titip Jual</p>
                    <p className="text-sm text-gray-600">Dijual ke pembeli lain</p>
                  </div>
                </label>
                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-red-500">
                  <input
                    type="radio"
                    {...register('tipeJual')}
                    value="putus"
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium">Jual Putus</p>
                    <p className="text-sm text-gray-600">Dijual langsung ke platform</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4">Upload Foto Produk</h2>
              <p className="text-sm text-gray-600 mb-4">{INSTRUCTIONS.uploadPhoto}</p>
              
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-500"
              >
                <Upload className="text-gray-400 mb-2" size={32} />
                <p className="text-sm text-gray-600">{BUTTONS.upload}</p>
              </label>

              {errors.fotos && (
                <p className="text-red-500 text-sm mt-2">{errors.fotos.message}</p>
              )}

              {images.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mt-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={img}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4">Detail Produk</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Produk *
                  </label>
                  <input
                    type="text"
                    {...register('nama')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder={PLACEHOLDERS.productName}
                  />
                  {errors.nama && (
                    <p className="text-red-500 text-sm mt-1">{errors.nama.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori *
                    </label>
                    <select
                      {...register('kategori')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Pilih Kategori</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nama}</option>
                      ))}
                    </select>
                    {errors.kategori && (
                      <p className="text-red-500 text-sm mt-1">{errors.kategori.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kondisi *
                    </label>
                    <select
                      {...register('kondisi')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Pilih Kondisi</option>
                      {CONDITIONS.map(cond => (
                        <option key={cond.id} value={cond.id}>{cond.label}</option>
                      ))}
                    </select>
                    {errors.kondisi && (
                      <p className="text-red-500 text-sm mt-1">{errors.kondisi.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lokasi *
                  </label>
                  <select
                    {...register('lokasi')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Pilih Lokasi</option>
                    {ALL_LOCATIONS.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.nama}</option>
                    ))}
                  </select>
                  {errors.lokasi && (
                    <p className="text-red-500 text-sm mt-1">{errors.lokasi.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi *
                  </label>
                  <textarea
                    {...register('deskripsi')}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder={PLACEHOLDERS.description}
                  />
                  {errors.deskripsi && (
                    <p className="text-red-500 text-sm mt-1">{errors.deskripsi.message}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register('isBU')}
                      className="w-4 h-4 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Barang BU (Butuh Uang)
                    </span>
                  </label>
                  <p className="text-sm text-gray-500 mt-1">{INSTRUCTIONS.buOption}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4">Harga</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opsi Harga
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-red-500">
                      <input
                        type="radio"
                        {...register('opsiHarga')}
                        value="sendiri"
                        className="mr-3"
                      />
                      <div>
                        <p className="font-medium">Tentukan Sendiri</p>
                        <p className="text-sm text-gray-600">Kamu yang tentukan harga</p>
                      </div>
                    </label>
                    <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-red-500">
                      <input
                        type="radio"
                        {...register('opsiHarga')}
                        value="sistem"
                        className="mr-3"
                      />
                      <div>
                        <p className="font-medium">Ikuti Rekomendasi</p>
                        <p className="text-sm text-gray-600">Sistem yang tentukan</p>
                      </div>
                    </label>
                  </div>
                </div>

                {watchKategori && watchKondisi && (
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGetRecommendation}
                      loading={isAiLoading}
                      disabled={isAiLoading}
                    >
                      {isAiLoading ? 'Menganalisis harga...' : 'Lihat Rekomendasi Harga'}
                    </Button>
                    
                    {priceRec && !isAiLoading && (
                      <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase mb-2">
                          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
                          AI ANALYSIS COMPLETED
                        </div>
                        <p className="text-sm text-gray-700 mb-3 leading-relaxed">"{priceRec.message}"</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/50 p-2 rounded-lg">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Pasaran Terendah</p>
                            <p className="text-sm font-semibold text-gray-700">{priceRec.range.split(' - ')[0]}</p>
                          </div>
                          <div className="bg-white/50 p-2 rounded-lg">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Pasaran Tertinggi</p>
                            <p className="text-sm font-semibold text-gray-700">{priceRec.range.split(' - ')[1]}</p>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-indigo-100 flex justify-between items-end">
                          <div>
                            <p className="text-xs text-indigo-600 font-bold">REKOMENDASI KAMI</p>
                            <p className="text-xl font-black text-indigo-700">
                              {priceRec.recommended}
                            </p>
                          </div>
                          <Button 
                            type="button" 
                            size="sm" 
                            onClick={() => setValue('harga', priceRec.raw.recommended)}
                            className="bg-indigo-600 hover:bg-indigo-700"
                          >
                            Pakai Harga Ini
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga (Rp) *
                  </label>
                  <Controller
                    name="harga"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        placeholder={PLACEHOLDERS.price}
                      />
                    )}
                  />
                  {errors.harga && (
                    <p className="text-red-500 text-sm mt-1">{errors.harga.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/seller/dashboard')}
              >
                {BUTTONS.cancel}
              </Button>
              <Button
                type="submit"
                loading={loading}
                disabled={loading || uploadLoading}
                className="flex-1"
              >
                {BUTTONS.save}
              </Button>
            </div>
          </form>
        </div>
      </Container>

      <Footer />
    </div>
  )
}

export default AddProduct
