import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Inbox, ArrowLeft, Trash2, ExternalLink, CheckCircle, Clock, Crown } from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import { subscriptionService } from '../../services/subscriptionService'
import toast from 'react-hot-toast'

const SimulatedMailbox = () => {
  const navigate = useNavigate()
  const [emails, setEmails] = useState([])
  const [selected, setSelected] = useState(null)

  // Load & listen
  useEffect(() => {
    setEmails(subscriptionService.getEmails())
    const refresh = () => setEmails([...subscriptionService.getEmails()])
    window.addEventListener('simulated_emails_changed', refresh)
    return () => window.removeEventListener('simulated_emails_changed', refresh)
  }, [])

  const handleSelect = (email) => {
    setSelected(email)
    if (!email.read) {
      subscriptionService.markAsRead(email.id)
    }
  }

  const handleDelete = (id) => {
    subscriptionService.deleteEmail(id)
    if (selected?.id === id) setSelected(null)
    toast.success('Email dihapus')
  }

  const handleAction = (url) => {
    if (url?.startsWith('/')) {
      navigate(url)
    } else if (url) {
      window.open(url, '_blank')
    }
  }

  const unreadCount = emails.filter(e => !e.read).length

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow py-8 md:py-12">
        <Container>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link
                to="/profile?tab=subscription"
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-primary-600" />
                  Inbox Simulasi
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  {unreadCount > 0
                    ? `${unreadCount} email belum dibaca`
                    : 'Semua email sudah dibaca'}
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
              Simulasi
            </span>
          </div>

          {/* Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[500px]">
            {/* Email list */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {emails.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Mail className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                  <p className="text-sm font-medium">Inbox kosong</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                  {emails.map((email) => (
                    <button
                      key={email.id}
                      onClick={() => handleSelect(email)}
                      className={`w-full text-left p-4 transition-all hover:bg-gray-50 ${
                        selected?.id === email.id
                          ? 'bg-primary-50 border-l-[3px] border-primary-500'
                          : 'border-l-[3px] border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          email.read ? 'bg-gray-100' : 'bg-violet-100'
                        }`}>
                          {email.subject.includes('Hore') || email.subject.includes('Aktif') ? (
                            <Crown className={`w-4 h-4 ${email.read ? 'text-gray-400' : 'text-violet-600'}`} />
                          ) : (
                            <Mail className={`w-4 h-4 ${email.read ? 'text-gray-400' : 'text-violet-600'}`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs mb-0.5 truncate ${email.read ? 'text-gray-400' : 'text-gray-600 font-semibold'}`}>
                            {email.sender.split('<')[0].trim()}
                          </p>
                          <p className={`text-sm truncate ${email.read ? 'text-gray-500 font-medium' : 'text-gray-900 font-bold'}`}>
                            {email.subject}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">
                            {email.body.slice(0, 60)}...
                          </p>
                        </div>
                        {!email.read && (
                          <div className="w-2 h-2 bg-violet-500 rounded-full shrink-0 mt-2" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Email detail */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {!selected ? (
                <div className="h-full flex items-center justify-center p-8 text-center">
                  <div>
                    <Mail className="w-14 h-14 mx-auto mb-3 text-gray-200" />
                    <p className="text-gray-400 font-medium">Pilih email untuk membaca</p>
                  </div>
                </div>
              ) : (
                <div className="p-6 md:p-8">
                  {/* Top toolbar */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs text-gray-400 flex items-center gap-1.5">
                      <Clock size={12} />
                      {selected.date}
                    </span>
                    <button
                      onClick={() => handleDelete(selected.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Hapus email"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Subject */}
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
                    {selected.subject}
                  </h2>

                  {/* Sender */}
                  <div className="flex items-center gap-3 pb-5 border-b border-gray-100 mb-5">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      T
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {selected.sender.split('<')[0].trim()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {selected.sender.match(/<(.+)>/)?.[1] || 'noreply@thriftly.my.id'}
                      </p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto" title="Verified sender" />
                  </div>

                  {/* Body */}
                  <div className="text-gray-700 leading-relaxed text-sm whitespace-pre-line mb-6">
                    {selected.body}
                  </div>

                  {/* Action button */}
                  {selected.actionUrl && (
                    <button
                      onClick={() => handleAction(selected.actionUrl)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-violet-200 hover:shadow-xl hover:from-violet-700 hover:to-indigo-700 transition-all"
                    >
                      <ExternalLink size={16} />
                      {selected.actionText || 'Buka Link'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  )
}

export default SimulatedMailbox
