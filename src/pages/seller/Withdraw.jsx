import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, DollarSign, Calendar, Clock, ChevronDown, Award } from 'lucide-react'
import toast from 'react-hot-toast'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'
import { productService } from '../../services/productService'
import { formatCurrency } from '../../utils/helpers'

const Withdraw = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [totalPenjualan, setTotalPenjualan] = useState(0)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [selectedBank, setSelectedBank] = useState('')
  const [history, setHistory] = useState(() => {
    // Load from localStorage if present to make it feel persistent
    const cached = localStorage.getItem(`withdraw_history_${user?.id}`)
    return cached ? JSON.parse(cached) : [
      {
        id: 1,
        amount: 10000000,
        status: 'DIPROSES',
        date: '18 Mei 2026, 16.22',
        bank: 'PT. BANK MANDIRI (PERSERO) TBK - 1390032032538 (a.n DERANDA BAGAS PAMUNGKAS)'
      }
    ]
  })

  useEffect(() => {
    if (user) {
      const fetchProducts = async () => {
        try {
          const products = await productService.getProductsBySeller(user.id)
          const soldProducts = products.filter(p => p.status === 'sold')
          const total = soldProducts.reduce((sum, p) => sum + (p.harga || 0), 0)
          setTotalPenjualan(total)
        } catch (error) {
          console.error("Gagal load produk seller", error)
        }
      }
      fetchProducts()
    }
  }, [user])

  // Get user bank info or fallback to default mock bank if empty
  const userNoRek = user?.profile?.noRekening || '-'
  const userNama = user?.profile?.nama || user?.name || 'DERANDA BAGAS PAMUNGKAS'
  const displayBank = userNoRek && userNoRek !== '-' 
    ? `PT. BANK MANDIRI (PERSERO) TBK - ${userNoRek} (a.n ${userNama})`
    : 'PT. BANK MANDIRI (PERSERO) TBK - 1390032032538 (a.n DERANDA BAGAS PAMUNGKAS)'

  useEffect(() => {
    if (displayBank) {
      setSelectedBank(displayBank)
    }
  }, [displayBank])

  const handleWithdrawSubmit = (e) => {
    e.preventDefault()
    const amount = Number(withdrawAmount)

    if (!amount) {
      toast.error('Masukkan nominal penarikan!')
      return
    }

    if (amount < 10000) {
      toast.error('Minimal penarikan adalah Rp 10.000')
      return
    }

    if (amount > totalPenjualan) {
      toast.error('Saldo tidak mencukupi!')
      return
    }

    if (userNoRek === '-') {
      toast.error('Silakan lengkapi nomor rekening Anda di profil terlebih dahulu!')
      return
    }

    // Add new withdraw transaction
    const now = new Date()
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    const formattedDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}`

    const newTx = {
      id: Date.now(),
      amount: amount,
      status: 'DIPROSES',
      date: formattedDate,
      bank: selectedBank
    }

    const updatedHistory = [newTx, ...history]
    setHistory(updatedHistory)
    localStorage.setItem(`withdraw_history_${user?.id}`, JSON.stringify(updatedHistory))

    // Deduct totalPenjualan locally
    setTotalPenjualan(prev => prev - amount)
    setWithdrawAmount('')

    toast.success('Mantap! Permintaan penarikan saldo berhasil diajukan.')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-16 md:pb-0">
      <Header />

      <Container>
        <div className="mt-8 mb-6">
          <button
            onClick={() => navigate('/seller/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Kembali ke Dasbor Penjualan</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Tarik Saldo Toko (Left Column) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
              <div className="flex gap-4 items-start mb-6">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <DollarSign size={28} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Tarik Saldo Toko</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Cairkan saldo penjualan langsung ke rekening Anda.
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-xs font-bold text-gray-400 tracking-wider block mb-1">
                  SALDO TERSEDIA (BISA DITARIK)
                </span>
                <span className="text-3xl font-extrabold text-emerald-600">
                  {formatCurrency(totalPenjualan)}
                </span>
              </div>

              <form onSubmit={handleWithdrawSubmit} className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 tracking-wider block mb-2">
                    PILIH REKENING TUJUAN
                  </label>
                  <div className="relative">
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all appearance-none"
                    >
                      <option value={displayBank}>{displayBank}</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 tracking-wider block mb-2">
                    NOMINAL PENARIKAN
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-gray-400 text-sm">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="Masukkan nominal penarikan"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                      min="10000"
                    />
                  </div>
                  <span className="text-xs text-gray-400 mt-1.5 block">
                    Minimal penarikan Rp 10.000
                  </span>
                </div>

                <Button
                  type="submit"
                  variant="accent"
                  fullWidth
                  className="mt-6 py-3.5 bg-emerald-400 text-white font-bold hover:bg-emerald-500 active:scale-[0.98] transition-all rounded-xl shadow-md"
                  disabled={totalPenjualan < 10000}
                >
                  Tarik Saldo Sekarang
                </Button>
              </form>
            </div>
          </div>

          {/* Riwayat Penarikan Saldo (Right Column) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 h-full">
              <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Riwayat Penarikan Saldo</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Catatan riwayat pencairan dana Anda.
                  </p>
                </div>
                <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
                  Total: {history.length} Transaksi
                </span>
              </div>

              <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                {history.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-sm font-medium">Belum ada riwayat penarikan dana.</p>
                  </div>
                ) : (
                  history.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-4 border border-gray-100 rounded-2xl hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex justify-between items-center mb-2.5">
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(tx.amount)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock size={12} className="animate-pulse" />
                          {tx.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                        <Calendar size={13} />
                        <span>{tx.date}</span>
                      </div>

                      <p className="text-xs text-gray-500 font-medium leading-relaxed">
                        <span className="text-gray-400">Tujuan:</span> {tx.bank}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>

      <Footer />
    </div>
  )
}

export default Withdraw
