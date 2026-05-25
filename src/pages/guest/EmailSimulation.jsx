import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Inbox, Star, Send, File, ArrowLeft, Search, Menu, Settings, Grid, Bell, Trash2, ChevronLeft, ChevronRight, CornerUpLeft, MoreVertical, RefreshCw } from 'lucide-react'
import { subscriptionService } from '../../services/subscriptionService'
import { useAuth } from '../../context/AuthContext'
import Container from '../../components/layout/Container'
import { toast } from 'react-hot-toast'

const EmailSimulation = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [emails, setEmails] = useState([])
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const refreshEmails = () => {
    setEmails(subscriptionService.getEmails())
  }

  useEffect(() => {
    refreshEmails()
    
    // Listen for email changes
    window.addEventListener('simulated_emails_changed', refreshEmails)
    return () => window.removeEventListener('simulated_emails_changed', refreshEmails)
  }, [])

  const handleSelectEmail = (email) => {
    setSelectedEmail(email)
    subscriptionService.markAsRead(email.id)
  }

  const handleDeleteEmail = (id, e) => {
    e.stopPropagation()
    subscriptionService.deleteEmail(id)
    if (selectedEmail && selectedEmail.id === id) {
      setSelectedEmail(null)
    }
    toast.success('Email dihapus')
  }

  const handleResetInbox = () => {
    subscriptionService.clearEmails()
    setSelectedEmail(null)
    refreshEmails()
    toast.success('Inbox direset ke default')
  }

  const filteredEmails = emails.filter(email => 
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.body.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-gray-800">
      
      {/* ── Top Google Bar ────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 h-16 px-4 flex items-center justify-between shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500" title="Kembali ke Thriftly">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="bg-red-500 text-white p-1.5 rounded-lg flex items-center justify-center shadow-md">
              <Mail size={18} />
            </div>
            <span className="font-bold text-lg tracking-tight text-gray-800">Gmail <span className="text-xs text-red-500 font-bold uppercase tracking-wider px-1.5 py-0.5 bg-red-50 rounded border border-red-100 ml-1.5">Simulasi</span></span>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex-1 max-w-2xl mx-8 hidden md:block">
          <div className="relative flex items-center bg-gray-100 focus-within:bg-white focus-within:shadow-md border border-transparent focus-within:border-gray-200 rounded-full py-2 px-4 transition-all">
            <Search size={18} className="text-gray-400 mr-3" />
            <input 
              type="text" 
              placeholder="Telusuri email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent w-full focus:outline-none text-sm placeholder-gray-500 text-gray-800"
            />
          </div>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-2">
          <button onClick={handleResetInbox} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors flex items-center gap-1.5 text-xs font-bold border border-gray-200 shadow-sm" title="Reset Kotak Masuk">
            <RefreshCw size={14} className="animate-spin-slow" /> Reset Inbox
          </button>
          <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm shadow-inner" title={user?.profile?.nama || 'Guest'}>
            {(user?.profile?.nama || 'G')[0].toUpperCase()}
          </div>
        </div>
      </header>

      {/* ── Main Container ────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 p-3 hidden lg:flex flex-col gap-2 shrink-0">
          <button className="bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold py-3.5 px-6 rounded-2xl flex items-center gap-3 shadow-sm transition-all mb-4 text-sm w-full">
            <span className="text-lg">+</span> Tulis
          </button>

          <nav className="flex flex-col gap-0.5">
            <button className="flex items-center justify-between px-4 py-2.5 rounded-full bg-blue-50 text-blue-700 font-bold text-sm w-full">
              <div className="flex items-center gap-3">
                <Inbox size={18} className="text-blue-700" />
                <span>Kotak Masuk</span>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                {filteredEmails.filter(e => !e.read).length}
              </span>
            </button>

            <button className="flex items-center gap-3 px-4 py-2.5 rounded-full hover:bg-gray-100 text-gray-600 font-semibold text-sm w-full transition-colors">
              <Star size={18} className="text-gray-400" />
              <span>Berbintang</span>
            </button>

            <button className="flex items-center gap-3 px-4 py-2.5 rounded-full hover:bg-gray-100 text-gray-600 font-semibold text-sm w-full transition-colors">
              <Send size={18} className="text-gray-400" />
              <span>Terkirim</span>
            </button>

            <button className="flex items-center gap-3 px-4 py-2.5 rounded-full hover:bg-gray-100 text-gray-600 font-semibold text-sm w-full transition-colors">
              <File size={18} className="text-gray-400" />
              <span>Draf</span>
            </button>

            <button className="flex items-center gap-3 px-4 py-2.5 rounded-full hover:bg-gray-100 text-gray-600 font-semibold text-sm w-full transition-colors">
              <Inbox size={18} className="text-gray-400" />
              <span>Pembelian</span>
            </button>
          </nav>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 flex overflow-hidden bg-white">
          {selectedEmail ? (
            
            // ── Email Detail View ──────────────────────────────────────────
            <div className="flex-1 flex flex-col overflow-y-auto animate-in fade-in duration-200">
              
              {/* Toolbar */}
              <div className="h-12 border-b border-gray-100 px-4 flex items-center justify-between shrink-0 sticky top-0 bg-white z-10">
                <button 
                  onClick={() => setSelectedEmail(null)}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                  title="Kembali ke Kotak Masuk"
                >
                  <ArrowLeft size={18} />
                </button>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => handleDeleteEmail(selectedEmail.id, e)}
                    className="p-2 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-full transition-all" 
                    title="Hapus Email"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-full transition-all">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              {/* Email Content Box */}
              <div className="p-6 md:p-8 flex-1 max-w-4xl mx-auto w-full">
                
                {/* Subject */}
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  {selectedEmail.subject}
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-100">Kotak Masuk</span>
                </h1>

                {/* Sender Card */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm shadow-inner">
                      {selectedEmail.sender[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm md:text-base">{selectedEmail.sender.split(' <')[0]}</div>
                      <div className="text-xs text-gray-400 font-semibold">{selectedEmail.sender}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 font-bold">{selectedEmail.date}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">kepada saya ▾</div>
                  </div>
                </div>

                {/* Email Body & Template Box */}
                {selectedEmail.id.startsWith('email_') ? (
                  
                  // Membership Confirmation Template
                  <div className="border border-gray-200 rounded-3xl p-6 md:p-10 shadow-soft bg-white max-w-2xl mx-auto">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-teal-100 shadow-sm">
                        <Mail size={32} className="text-teal-600" />
                      </div>
                      <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">
                        {selectedEmail.subject}
                      </h2>
                    </div>

                    <div className="text-sm md:text-base text-gray-600 leading-relaxed space-y-4">
                      <p className="font-semibold text-gray-900">Halo,</p>
                      <p>{selectedEmail.body}</p>
                    </div>

                    {selectedEmail.actionUrl && (
                      <div className="mt-8 text-center">
                        <Link 
                          to={selectedEmail.actionUrl}
                          className="inline-flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm md:text-base py-3 px-8 md:py-3.5 md:px-10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                          {selectedEmail.actionText || 'Lanjut Berlangganan'}
                        </Link>
                      </div>
                    )}

                    <div className="mt-10 pt-6 border-t border-gray-100 text-center text-xs text-gray-400 leading-relaxed font-light">
                      Jika Anda tidak merasa melakukan permintaan ini, abaikan saja email ini.<br />
                      &copy; 2026 Thriftly Official. Semua hak dilindungi.
                    </div>
                  </div>
                ) : (
                  
                  // Plain text format for default/welcome email
                  <div className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 border border-gray-100 rounded-2xl p-6">
                    {selectedEmail.body}
                  </div>
                )}

                {/* Reply Section Simulation */}
                <div className="mt-12 flex gap-3 border-t border-gray-100 pt-6">
                  <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-600 rounded-full font-bold text-xs transition-all shadow-sm">
                    <CornerUpLeft size={14} /> Balas
                  </button>
                  <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-600 rounded-full font-bold text-xs transition-all shadow-sm">
                    Teruskan
                  </button>
                </div>

              </div>
            </div>
          ) : (
            
            // ── Email List View ────────────────────────────────────────────
            <div className="flex-grow flex flex-col overflow-hidden">
              
              {/* List Actions Toolbar */}
              <div className="h-12 border-b border-gray-200 px-4 flex items-center justify-between shrink-0 bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer" />
                  <button onClick={refreshEmails} className="p-2 hover:bg-gray-200 rounded-full text-gray-600 transition-colors" title="Perbarui Kotak Masuk">
                    <RefreshCw size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold">
                  <span>1-{filteredEmails.length} dari {filteredEmails.length}</span>
                  <div className="flex gap-1">
                    <button className="p-1 hover:bg-gray-200 rounded text-gray-500 disabled:opacity-30" disabled>
                      <ChevronLeft size={16} />
                    </button>
                    <button className="p-1 hover:bg-gray-200 rounded text-gray-500 disabled:opacity-30" disabled>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Email List container */}
              <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {filteredEmails.length === 0 ? (
                  <div className="text-center py-20 text-gray-400 flex flex-col items-center justify-center">
                    <Mail size={48} className="text-gray-300 mb-3" />
                    <p className="font-bold text-gray-700 mb-1">Kotak masuk Anda kosong</p>
                    <p className="text-xs text-gray-400">Email simulasi membership akan muncul di sini.</p>
                  </div>
                ) : (
                  filteredEmails.map((email) => (
                    <div 
                      key={email.id}
                      onClick={() => handleSelectEmail(email)}
                      className={`flex items-center justify-between p-3 md:py-3.5 md:px-4 cursor-pointer hover:shadow-md transition-all group ${
                        email.read ? 'bg-white' : 'bg-blue-50/40 border-l-4 border-blue-500 pl-2'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Star icon */}
                        <button className="text-gray-300 hover:text-amber-400 transition-colors shrink-0 hidden sm:block">
                          <Star size={18} />
                        </button>
                        
                        {/* Sender info */}
                        <div className={`w-28 md:w-44 truncate shrink-0 text-sm ${email.read ? 'text-gray-600 font-medium' : 'text-gray-900 font-extrabold'}`}>
                          {email.sender.split(' <')[0]}
                        </div>

                        {/* Subject + body snippet */}
                        <div className="flex-1 truncate min-w-0 pr-4">
                          <span className={`text-sm ${email.read ? 'text-gray-900 font-medium' : 'text-gray-900 font-extrabold'}`}>
                            {email.subject}
                          </span>
                          <span className="text-gray-400 text-xs font-light mx-2">&mdash;</span>
                          <span className="text-gray-400 text-xs font-light truncate">
                            {email.body}
                          </span>
                        </div>
                      </div>

                      {/* Date or Action hover buttons */}
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-xs text-gray-400 font-bold group-hover:hidden">
                          {email.date}
                        </div>
                        <div className="hidden group-hover:flex items-center gap-1 animate-in fade-in duration-200">
                          <button 
                            onClick={(e) => handleDeleteEmail(email.id, e)}
                            className="p-1.5 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>
          )}
        </main>
      </div>

    </div>
  )
}

export default EmailSimulation
