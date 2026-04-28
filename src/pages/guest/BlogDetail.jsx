import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Tag, User, Share2, Loader2 } from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import Button from '../../components/common/Button'
import { blogService } from '../../services/blogService'

const BlogDetail = () => {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await blogService.getPostById(id)
        setPost(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <Container className="flex-1 flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
          <p className="text-gray-500">Membuka artikel...</p>
        </Container>
        <Footer />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <Container className="flex-1 flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-bold mb-4">Artikel tidak ditemukan</h2>
          <Link to="/blog">
            <Button variant="primary">Kembali ke Blog</Button>
          </Link>
        </Container>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 pb-20">
        {/* Hero Image */}
        <div className="relative h-[40vh] md:h-[60vh] w-full overflow-hidden">
          <img 
            src={post.image} 
            alt={post.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <Container className="absolute inset-0 flex flex-col justify-end pb-12">
            <Link to="/" className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors group">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Kembali
            </Link>
            <div className="inline-flex px-4 py-1.5 bg-primary-600 rounded-full text-xs font-bold text-white uppercase tracking-wider mb-4 w-fit">
              {post.category}
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white max-w-4xl leading-tight">
              {post.title}
            </h1>
          </Container>
        </div>

        {/* Content */}
        <Container className="mt-12">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Main Content */}
            <article className="lg:w-2/3">
              {/* Meta Info */}
              <div className="flex flex-wrap gap-6 items-center border-b border-gray-100 pb-8 mb-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <User size={18} className="text-primary-600" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-primary-600" />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag size={18} className="text-primary-600" />
                  <span>{post.category}</span>
                </div>
              </div>

              {/* Body Text */}
              <div 
                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-h3:mt-10 prose-h3:mb-4"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Share */}
              <div className="mt-16 pt-8 border-t border-gray-100 flex items-center justify-between">
                <span className="text-gray-900 font-bold">Bagikan artikel ini:</span>
                <div className="flex gap-4">
                  <button className="p-3 rounded-full bg-gray-50 hover:bg-primary-50 text-gray-400 hover:text-primary-600 transition-all">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:w-1/3">
              <div className="sticky top-24 space-y-8">
                <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Ingin Barang Terbaru?</h4>
                  <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                    Dapatkan update stok barang premium langsung di email kamu sebelum orang lain tahu.
                  </p>
                  <Link to="/">
                    <Button variant="primary" className="w-full rounded-xl">Langganan Sekarang</Button>
                  </Link>
                </div>

                <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Mulai Thrifting Hari Ini</h4>
                  <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                    Ribuan barang unik menunggu untuk kamu temukan. Aman, mudah, dan terpercaya.
                  </p>
                  <Link to="/products">
                    <Button variant="primary" className="w-full rounded-xl">
                      Cek Semua Produk
                    </Button>
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  )
}

export default BlogDetail
