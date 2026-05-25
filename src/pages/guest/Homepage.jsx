import { useEffect, useState, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ArrowRight, ChevronRight, Zap, Loader2 } from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import ProductCard from '../../components/common/ProductCard'
import ProductCardSkeleton from '../../components/common/ProductCardSkeleton'
import BlogCardSkeleton from '../../components/common/BlogCardSkeleton'
import Button from '../../components/common/Button'
import { productService } from '../../services/productService'
import { blogService } from '../../services/blogService'
import { getCategories } from '../../constants/categories'
import { SECTIONS, PLACEHOLDERS } from '../../constants/copywriting'
import { newsletterService } from '../../services/newsletterService'
import { subscriptionService } from '../../services/subscriptionService'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-hot-toast'
import api from '../../services/api'

// ── Daftar gambar slide hero ──────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    src: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=2070&auto=format&fit=crop',
    alt: 'Modern living room with sofa',
  },
  {
    src: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop',
    alt: 'Elegant grey sofa',
  },
  {
    src: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2070&auto=format&fit=crop',
    alt: 'Minimalist bedroom setup',
  },
  {
    src: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=2070&auto=format&fit=crop',
    alt: 'Modern kitchen interior',
  },
]

const SLIDE_INTERVAL = 5000 // ms

const Homepage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [buProducts, setBuProducts] = useState([])
  const [latestProducts, setLatestProducts] = useState([])
  const [blogPosts, setBlogPosts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingBlog, setLoadingBlog] = useState(true)
  const carouselRef = useRef(null)
  const categoriesRef = useRef(null)
  const blogRef = useRef(null)
  const categories = getCategories()

  // Cek status langganan saat komponen dimuat
  useEffect(() => {
    if (user) {
      const checkSubscription = async () => {
        try {
          const res = await api.get('/user/newsletter')
          if (res.data?.data?.status === 'active') {
            setIsSubscribed(true)
          }
        } catch (error) {
          console.error("Gagal mengecek status langganan", error)
        }
      }
      checkSubscription()
    }
  }, [user])

  const scrollCarousel = (direction) => {
    if (!carouselRef.current) return
    const scrollAmount = 320
    carouselRef.current.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' })
  }

  const scrollCategories = (direction) => {
    if (!categoriesRef.current) return
    const scrollAmount = 250
    categoriesRef.current.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' })
  }

  const scrollBlog = (direction) => {
    if (!blogRef.current) return
    const scrollAmount = 300
    blogRef.current.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' })
  }

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const [bu, latest] = await Promise.all([
          productService.getBUProducts(),
          productService.getLatestProducts(8)
        ]);
        setBuProducts(bu.slice(0, 4));
        setLatestProducts(latest);
      } catch (error) {
        console.error('Failed to load products');
      } finally {
        setLoadingProducts(false);
      }
    };

    const fetchBlogs = async () => {
      try {
        setLoadingBlog(true);
        const blogs = await blogService.getAllPosts();
        setBlogPosts(blogs.slice(0, 6)); 
      } catch (error) {
        console.error('Failed to load blogs');
      } finally {
        setLoadingBlog(false);
      }
    };

    fetchProducts();
    fetchBlogs();
  }, [])

  // Auto-play slideshow
  const goTo = useCallback((index) => {
    setActiveSlide(index)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }, SLIDE_INTERVAL)
    return () => clearInterval(timer)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleSubscribe = async (e) => {
    if (e?.preventDefault) e.preventDefault()
    if (!user) {
      toast.error('Silakan login terlebih dahulu untuk berlangganan.', { duration: 4000, icon: '🔒' })
      navigate('/login')
      return
    }
    
    setIsSubscribing(true)
    try {
      const response = await newsletterService.subscribe(user.email)
      toast.success(response.data?.message || 'Cek email Anda untuk konfirmasi langganan!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memproses langganan.')
    } finally {
      setIsSubscribing(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white pb-16 md:pb-0">
      <Header />

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center overflow-hidden bg-gray-900 md:mt-0 md:rounded-none mx-0 md:mx-0">

        {/* Slide images */}
        {HERO_SLIDES.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: i === activeSlide ? 1 : 0 }}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={i === 0 ? 'high' : 'low'}
              className="w-full h-full object-cover md:object-center opacity-70 blur-[1px]"
            />
          </div>
        ))}

        {/* Gradient overlay optimized for "SHOP" icon */}
        <div className="absolute inset-0 z-0 hero-vintage-overlay" />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-gray-900 via-transparent to-gray-900/40" />

        {/* Konten teks */}
        <div className="relative z-10 text-center px-4 w-full max-w-4xl mx-auto">
          <div className="flex justify-center mb-2 md:mb-4">
            <div className="shimmer-image">
              <img src="/icon_dashV2.png" alt="Shop Icon" loading="eager" decoding="async" className="h-[80px] md:h-[120px] lg:h-[160px] object-contain mix-blend-overlay opacity-90" />
            </div>
          </div>
          <p className="text-xs sm:text-lg md:text-2xl text-gray-200 mb-6 md:mb-12 font-light tracking-wide -mt-2 sm:-mt-4">
            Barang bekas berkualitas buat gaya hidup modern kamu.
          </p>

          <form onSubmit={handleSearch} className="relative max-w-xs sm:max-w-md mx-auto px-4 md:px-0">
            <div className="relative flex items-center bg-white rounded-full p-1 shadow-soft-lg border border-gray-100">
              <div className="pl-3 text-gray-400">
                <Search size={16} className="sm:hidden" />
                <Search size={18} className="hidden sm:block" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={PLACEHOLDERS.search}
                className="w-full px-2 py-1.5 bg-transparent border-none text-gray-900 text-xs sm:text-sm focus:outline-none placeholder-gray-400"
              />
              <Button type="submit" size="sm" className="rounded-full px-4 py-1.5 text-xs sm:text-sm bg-primary-600 hover:bg-primary-700 text-white border-none shadow-md font-bold">
                Cari
              </Button>
            </div>
          </form>
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${i === activeSlide
                ? 'w-6 h-2 bg-white'
                : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

      </section>
      {/* ─────────────────────────────────────────────────────────────────── */}

      <Container className="pt-12 pb-16">
        {/* Categories */}
        <section className="mb-8 md:mb-20">
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">{SECTIONS.categories}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => scrollCategories(-1)}
                className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                aria-label="Scroll kategori kiri"
              >
                <ChevronRight size={20} className="rotate-180" />
              </button>
              <button
                onClick={() => scrollCategories(1)}
                className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                aria-label="Scroll kategori kanan"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div ref={categoriesRef} className="flex overflow-x-auto gap-3 pb-6 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 snap-x scroll-smooth">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                draggable="false"
                className="group flex-shrink-0 w-[100px] sm:w-[130px] md:w-[200px] bg-gray-50 rounded-2xl p-3 md:p-8 text-center hover:bg-white hover:border-primary-500 transition-all duration-300 border border-gray-100 shadow-sm snap-start select-none"
              >
                <div className="w-10 h-10 md:w-20 md:h-20 mx-auto bg-white rounded-full flex items-center justify-center text-lg md:text-3xl mb-2 md:mb-5 shadow-sm group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                  {category.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-[10px] md:text-base group-hover:text-primary-600 transition-colors truncate">{category.nama}</h3>
              </Link>
            ))}
          </div>
        </section>

        {/* Hot Deals (BU) */}
        {(buProducts.length > 0 || loadingProducts) && (
          <section className="mb-8 md:mb-20">
            <div className="flex items-center justify-between mb-4 md:mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-accent-100 p-2 rounded-lg text-accent-600">
                  <Zap size={24} />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">{SECTIONS.buProducts}</h2>
              </div>
              <Link to="/products?bu=true" className="text-primary-600 font-bold hover:text-primary-700 flex items-center gap-1 group whitespace-nowrap text-xs md:text-sm shrink-0">
                Lihat semua <ArrowRight size={14} className="md:w-[18px] md:h-[18px] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {loadingProducts
                ? Array(4).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
                : buProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
            </div>
          </section>
        )}

        {/* Recommendations Carousel */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{SECTIONS.popularProducts}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => scrollCarousel(-1)}
                className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                aria-label="Scroll kiri"
              >
                <ChevronRight size={20} className="rotate-180" />
              </button>
              <button
                onClick={() => scrollCarousel(1)}
                className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                aria-label="Scroll kanan"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div ref={carouselRef} className="flex overflow-x-auto gap-6 pb-8 snap-x hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {loadingProducts
              ? Array(4).fill(0).map((_, i) => (
                  <div key={i} className="min-w-[280px] w-[280px] md:min-w-[300px] md:w-[300px] snap-start">
                    <ProductCardSkeleton />
                  </div>
                ))
              : latestProducts.map((product) => (
                  <div key={product.id} className="min-w-[280px] w-[280px] md:min-w-[300px] md:w-[300px] snap-start">
                    <ProductCard product={product} />
                  </div>
                ))}
          </div>
        </section>
      </Container>

      {/* CTA Panel */}
      <section className="relative py-12 md:py-20 px-4 mt-auto overflow-hidden bg-slate-950">
        {/* Abstract background blobs with slow random movement */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-600/25 rounded-full blur-[100px] animate-blob-1" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-600/15 rounded-full blur-[100px] animate-blob-2" />
        <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-indigo-500/15 rounded-full blur-[110px] animate-blob-1 [animation-delay:4s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-primary-900/15 via-transparent to-accent-900/10 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-2xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight leading-tight">
            Siap Berburu <span className="bg-gradient-to-r from-primary-400 via-indigo-400 to-primary-400 bg-clip-text text-transparent">Barang Baru?</span>
          </h2>
          <p className="text-gray-400 mb-6 md:mb-10 max-w-2xl mx-auto text-sm md:text-xl font-light">
            {user
              ? 'Berlangganan Premium sekarang dan nikmati keuntungan eksklusif sebagai member!'
              : 'Langganan newsletter kita biar nggak ketinggalan update barang-barang premium yang baru masuk.'}
          </p>

          {/* Tampilkan kotak penawaran langganan HANYA JIKA isSubscribed = false */}
          {!isSubscribed && (
            <>
              {/* Guest: tampilkan form email */}
              {!user && (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 md:gap-3 max-w-lg mx-auto p-1.5 md:p-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Masukin email kamu"
                    required
                    disabled={isSubscribing}
                    className="flex-1 px-4 md:px-5 py-2.5 md:py-3.5 rounded-xl bg-transparent text-white text-sm md:text-base placeholder-gray-500 focus:outline-none transition-all"
                  />
                  <Button
                    type="submit"
                    size="md"
                    loading={isSubscribing}
                    className="rounded-xl whitespace-nowrap bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 border-none shadow-lg shadow-primary-950/20 text-sm md:text-base py-2.5 md:py-3.5"
                  >
                    Gas Langganan
                  </Button>
                </form>
              )}

              {/* Buyer (logged in): hanya tampilkan tombol tanpa form email */}
              {user && (
                <div className="flex flex-col items-center gap-4">
                  <Button
                    onClick={handleSubscribe}
                    size="lg"
                    loading={isSubscribing}
                    className="rounded-2xl px-10 py-4 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 border-none shadow-xl shadow-violet-950/30 text-base font-bold"
                  >
                    🚀 Gas Langganan Premium
                  </Button>
                  <p className="text-gray-500 text-xs">
                    Sudah berlangganan?{' '}
                    <a href="/profile?tab=subscription" className="text-primary-400 hover:text-primary-300 underline underline-offset-2 transition-colors">
                      Cek status langganan kamu
                    </a>
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Blog Section ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <Container>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">Cerita Thriftly</h2>
              <p className="text-gray-500 text-sm">Inspirasi & tips fashion dari kami.</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/blog" className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors hidden sm:block">
                Lihat Semua
              </Link>
              <div className="flex gap-2">
                <button
                  onClick={() => scrollBlog(-1)}
                  className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                  aria-label="Scroll blog kiri"
                >
                  <ChevronRight size={20} className="rotate-180" />
                </button>
                <button
                  onClick={() => scrollBlog(1)}
                  className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                  aria-label="Scroll blog kanan"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>

          <div ref={blogRef} className="flex overflow-x-auto gap-6 pb-8 snap-x hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {loadingBlog ? (
              Array(4).fill(0).map((_, i) => <BlogCardSkeleton key={i} />)
            ) : blogPosts.length === 0 ? (
              <div className="w-full text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-500 text-sm">Belum ada cerita yang dibagikan.</p>
              </div>
            ) : (
              blogPosts.map((post) => (
                <Link 
                  key={post.id} 
                  to={`/blog/${post.id}`}
                  className="group flex-shrink-0 w-[280px] md:w-[320px] flex flex-col h-full bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-500 snap-start"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      loading="lazy"
                      decoding="async" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold text-gray-900 shadow-sm uppercase tracking-wider">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <span className="text-[10px] font-medium text-gray-400 mb-2 uppercase tracking-widest">{post.date}</span>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-gray-500 text-xs line-clamp-2 mb-4 font-light leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto flex items-center text-xs font-bold text-primary-600">
                      Baca Selengkapnya <ChevronRight size={14} className="ml-1" />
                    </div>
                  </div>
                </Link>
              )
            ))}
          </div>

          <div className="mt-6 sm:hidden text-center">
            <Link to="/blog" className="inline-flex items-center gap-2 text-primary-600 font-bold text-sm">
              Lihat Semua Blog <ChevronRight size={16} />
            </Link>
          </div>
        </Container>
      </section>
      {/* ─────────────────────────────────────────────────────────────────── */}

      <Footer />
    </div>
  )
}

export default Homepage
