import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import InfoLayout from '../../components/layout/InfoLayout'
import { Calendar, User, Search, Loader2 } from 'lucide-react'
import { blogService } from '../../services/blogService'

const Blog = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await blogService.getAllPosts()
        setPosts(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  return (
    <InfoLayout 
      title="Thriftly Blog" 
      subtitle="Inspirasi, tips, dan cerita seru dari dunia thrifting."
    >
      <div className="space-y-12">
        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto -mt-20 md:-mt-24 z-10">
          <div className="flex items-center bg-white rounded-2xl p-2 shadow-xl border border-gray-100">
            <div className="pl-4 text-gray-400">
              <Search size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Cari artikel menarik..." 
              className="w-full px-4 py-3 bg-transparent border-none text-gray-900 focus:outline-none"
            />
            <button className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all">
              Cari
            </button>
          </div>
        </div>

        {/* Featured Post */}
        <section className="pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Artikel Unggulan</h2>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
              <p className="text-gray-500">Memuat artikel menarik untukmu...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <p className="text-gray-500">Belum ada artikel yang dipublikasikan.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {posts.map((post, i) => (
                <Link key={i} to={`/blog/${post.id}`} className="group cursor-pointer block">
                  <div className="relative h-60 overflow-hidden rounded-2xl mb-4 bg-gray-100">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-primary-600">
                      {post.category}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                    <span className="flex items-center"><Calendar size={14} className="mr-1" /> {post.date}</span>
                    <span className="flex items-center"><User size={14} className="mr-1" /> {post.author}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="text-primary-600 font-bold text-sm">Baca Selengkapnya &rarr;</div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Newsletter Box */}
        <section className="bg-primary-600 rounded-3xl p-8 md:p-12 text-white text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">Jangan Ketinggalan Update!</h3>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto">Kami mengirimkan kurasi artikel terbaik setiap minggu langsung ke email kamu.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Email kamu" 
              className="flex-1 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:bg-white/20"
            />
            <button className="px-8 py-3 bg-white text-primary-600 font-bold rounded-xl hover:bg-gray-100 transition-all">
              Berlangganan
            </button>
          </div>
        </section>
      </div>
    </InfoLayout>
  )
}

export default Blog
