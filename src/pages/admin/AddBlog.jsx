import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Save, Image as ImageIcon, Loader2, Info } from 'lucide-react'
import AdminSidebar from '../../components/layout/AdminSidebar'
import Container from '../../components/layout/Container'
import Button from '../../components/common/Button'
import { blogService } from '../../services/blogService'

const AddBlog = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    author_name: '',
    category: 'Guides',
    image_url: '',
    content: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.content || !formData.author_name) {
      alert('Mohon isi semua field wajib (Judul, Penulis, Konten)')
      return
    }

    setLoading(true)
    try {
      await blogService.createPost(formData)
      alert('Artikel berhasil diterbitkan!')
      navigate('/admin/blog')
    } catch (error) {
      console.error(error)
      alert('Gagal menerbitkan artikel. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      
      <main className="flex-1 pb-20">
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <Container maxWidth="max-w-4xl" className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin/blog" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Tulis Artikel Baru</h1>
                <p className="text-xs text-slate-500">Publikasikan konten menarik ke Thriftly Blog</p>
              </div>
            </div>
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              variant="primary" 
              className="rounded-xl flex items-center gap-2 px-6"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {loading ? 'Menerbitkan...' : 'Terbitkan'}
            </Button>
          </Container>
        </div>

        <Container maxWidth="max-w-4xl" className="py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Judul */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Judul Artikel *</label>
                <input 
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Contoh: 5 Tips Thrifting untuk Pemula"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-lg font-medium"
                />
              </div>

              {/* Penulis */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nama Penulis *</label>
                <input 
                  type="text"
                  name="author_name"
                  value={formData.author_name}
                  onChange={handleChange}
                  placeholder="Nama Lengkap"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Kategori</label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-white"
                >
                  <option value="Guides">Guides</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Care">Care</option>
                  <option value="News">News</option>
                </select>
              </div>

              {/* Image URL */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">URL Gambar Sampul</label>
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <ImageIcon size={18} />
                    </div>
                    <input 
                      type="url"
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleChange}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">Gunakan link gambar dari Unsplash atau host gambar lainnya.</p>
              </div>
            </div>

            {/* Content Editor (Simple Textarea for now) */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Konten Artikel (HTML Support) *</label>
              <div className="bg-indigo-50 p-4 rounded-xl mb-4 border border-indigo-100 flex gap-3 text-indigo-700">
                <Info size={20} className="shrink-0" />
                <p className="text-xs leading-relaxed">
                  Anda bisa menggunakan tag HTML dasar seperti <b>&lt;p&gt;</b>, <b>&lt;h3&gt;</b>, atau <b>&lt;b&gt;</b> untuk memformat tulisan.
                </p>
              </div>
              <textarea 
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Tuliskan isi artikel Anda di sini..."
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all min-h-[400px] leading-relaxed font-serif text-lg"
              />
            </div>

            {/* Preview Section */}
            {formData.image_url && (
              <div className="mt-8 pt-8 border-t border-slate-200">
                <p className="text-sm font-bold text-slate-700 mb-4">Preview Gambar Sampul:</p>
                <div className="relative w-full h-64 bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center">
                  <img 
                    src={formData.image_url} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden flex-col items-center text-slate-400 p-6 text-center">
                    <ImageIcon size={48} className="mb-2 opacity-20" />
                    <p className="text-sm font-medium">Gagal memuat gambar.</p>
                    <p className="text-xs mt-1">Pastikan URL yang dimasukkan adalah link langsung ke gambar (Image Address), bukan link halaman web.</p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </Container>
      </main>
    </div>
  )
}

export default AddBlog
