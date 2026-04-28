import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Edit2, Trash2, ExternalLink, Loader2, Calendar, User } from 'lucide-react'
import AdminSidebar from '../../components/layout/AdminSidebar'
import Container from '../../components/layout/Container'
import Button from '../../components/common/Button'
import { blogService } from '../../services/blogService'

const AdminBlog = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const data = await blogService.getAllPosts()
      setPosts(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus artikel ini?')) {
      try {
        await blogService.deletePost(id)
        setPosts(posts.filter(p => p.id !== id))
        alert('Artikel berhasil dihapus')
      } catch (error) {
        alert('Gagal menghapus artikel')
      }
    }
  }

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      
      <main className="flex-1 pb-20">
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <Container maxWidth="max-w-7xl" className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Manajemen Blog</h1>
              <p className="text-sm text-slate-500">Kelola artikel, tips, dan inspirasi thrifting</p>
            </div>
            <Link to="/admin/blog/add">
              <Button variant="primary" className="rounded-xl flex items-center gap-2">
                <Plus size={18} />
                Tulis Artikel Baru
              </Button>
            </Link>
          </Container>
        </div>

        <Container maxWidth="max-w-7xl" className="py-8">
          {/* Stats & Filter */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-sm font-medium text-slate-500 mb-1">Total Artikel</p>
              <p className="text-3xl font-bold text-slate-900">{posts.length}</p>
            </div>
            
            <div className="md:col-span-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center px-6">
              <Search className="text-slate-400 mr-3" size={20} />
              <input 
                type="text" 
                placeholder="Cari judul artikel atau penulis..." 
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Artikel</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kategori</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Info</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-20 text-center">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-2" />
                        <p className="text-slate-500">Memuat data...</p>
                      </td>
                    </tr>
                  ) : filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-20 text-center text-slate-500">
                        {searchTerm ? 'Tidak ada artikel yang cocok dengan pencarian.' : 'Belum ada artikel yang dipublikasikan.'}
                      </td>
                    </tr>
                  ) : (
                    filteredPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img 
                              src={post.image} 
                              alt="" 
                              className="w-16 h-10 rounded-lg object-cover border border-slate-100 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate max-w-xs">{post.title}</p>
                              <p className="text-xs text-slate-500 line-clamp-1">{post.excerpt}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
                            {post.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center text-xs text-slate-600">
                              <User size={12} className="mr-1.5 text-slate-400" />
                              {post.author}
                            </div>
                            <div className="flex items-center text-xs text-slate-600">
                              <Calendar size={12} className="mr-1.5 text-slate-400" />
                              {post.date}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link 
                              to={`/blog/${post.id}`} 
                              target="_blank"
                              className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all"
                              title="Lihat Publik"
                            >
                              <ExternalLink size={18} />
                            </Link>
                            <button 
                              onClick={() => handleDelete(post.id)}
                              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                              title="Hapus"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Container>
      </main>
    </div>
  )
}

export default AdminBlog
