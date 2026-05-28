import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, X, Send, Bot, User, ChevronDown, Sparkles } from 'lucide-react'
import { CHATBOT_CONFIG, QUICK_REPLIES } from '../../data/chatbotKnowledge'
import api from '../../services/api'

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('thriftly_chat_history')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        return []
      }
    }
    return []
  })
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const inputRef = useRef(null)

  // Simpan ke localStorage setiap kali messages berubah
  useEffect(() => {
    localStorage.setItem('thriftly_chat_history', JSON.stringify(messages))
  }, [messages])

  // Initial greeting saat pertama kali dibuka
  const initChat = useCallback(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: Date.now(),
          type: 'bot',
          text: CHATBOT_CONFIG.greeting,
          time: new Date(),
          showQuickReplies: true,
        },
      ])
    }
  }, [messages.length])

  useEffect(() => {
    if (isOpen) {
      initChat()
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen, initChat])

  // Auto scroll ke bawah
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  // Detect scroll position
  const handleScroll = () => {
    const container = messagesContainerRef.current
    if (!container) return
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
    setShowScrollBtn(!isNearBottom)
  }

  // Format pesan (bold, link, dll)
  const formatMessage = (text) => {
    let result = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    result = result.replace(/\n/g, '<br/>')
    // Parse format link markdown: [Teks](url)
    result = result.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-primary-600 font-medium underline hover:text-primary-800 transition-colors" target="_blank">$1</a>'
    )
    return result
  }

  // Kirim pesan
  const handleSend = async (text = null) => {
    const messageText = text || inputValue.trim()
    if (!messageText) return

    // Tambah pesan user
    const userMsg = {
      id: Date.now(),
      type: 'user',
      text: messageText,
      time: new Date(),
    }
    
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInputValue('')
    setIsTyping(true)

    try {
      // 1. Format array riwayat sesuai format spesifikasi API backend (role: user/model)
      const payloadMessages = updatedMessages.map(msg => ({
        role: msg.type === 'bot' ? 'model' : 'user',
        content: msg.text
      }))

      // 2. Tembak endpoint AI chatbot
      // api.js sudah otomatis memasukkan header Authorization Bearer token jika user login!
      const res = await api.post('/chat', { messages: payloadMessages })

      // 3. Masukkan respons AI ke dalam state
      if (res.data?.reply?.content) {
        const botMsg = {
          id: Date.now() + 1,
          type: 'bot',
          text: res.data.reply.content,
          time: new Date(),
          showQuickReplies: false, // AI dinamis, tidak perlu menu quick replies
        }
        setMessages(prev => [...prev, botMsg])
      } else {
        throw new Error('Format response dari server AI tidak dikenali.')
      }
    } catch (error) {
      console.error('Error menghubungkan ke AI Chatbot:', error)
      const errorMsg = {
        id: Date.now() + 1,
        type: 'bot',
        text: 'Maaf, server AI sedang sibuk atau ada gangguan jaringan. Silakan coba lagi nanti ya. 🙏',
        time: new Date(),
        showQuickReplies: true,
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsTyping(false)
    }
  }

  // Handle keyboard
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Follow-up button handler
  const handleFollowUp = (keyword) => {
    const entry = KNOWLEDGE_BASE.find((e) =>
      e.keywords.some((k) => k.toLowerCase() === keyword.toLowerCase())
    )
    if (entry) {
      handleSend(entry.keywords[0])
    }
  }

  // Quick reply labels
  const getFollowUpLabel = (keyword) => {
    const labels = {
      'cara belanja': '🛒 Cara Belanja',
      'cara jual': '🏷️ Cara Jual',
      keamanan: '🔒 Keamanan',
      pembayaran: '💳 Pembayaran',
      pengiriman: '🚚 Pengiriman',
      'lacak pesanan': '📍 Lacak Pesanan',
      komplain: '⚠️ Komplain',
      kontak: '📞 Kontak',
      kategori: '🏷️ Kategori',
      'kondisi barang': '📋 Kondisi Barang',
      pencairan: '💰 Pencairan Dana',
      membership: '⭐ Membership',
      daftar: '📝 Daftar',
      faq: '❓ FAQ',
    }
    return labels[keyword] || keyword
  }

  // Format waktu
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <>
      {/* ── Floating Button ─────────────────── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed z-[9999] bottom-20 md:bottom-6 right-4 md:right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-500 group ${
          isOpen
            ? 'bg-gray-700 hover:bg-gray-800 rotate-0'
            : 'bg-gradient-to-br from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 hover:scale-110'
        }`}
        aria-label="Toggle Chatbot"
      >
        {isOpen ? (
          <X size={22} className="text-white" />
        ) : (
          <MessageCircle size={24} className="text-white" />
        )}
      </button>

      {/* ── Chat Window ─────────────────────── */}
      <div
        className={`fixed z-[9998] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'}
          
          /* Mobile: Full screen */
          bottom-0 left-0 right-0 top-0
          md:bottom-20 md:left-auto md:top-auto
          md:right-6 md:w-[400px] md:h-[600px]
          md:rounded-3xl md:shadow-2xl
        `}
      >
        <div className="flex flex-col h-full bg-white md:rounded-3xl overflow-hidden border border-gray-200/50 md:shadow-[0_20px_60px_rgba(79,70,229,0.15)]">
          {/* ── Header ──────────────────── */}
          <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-indigo-500 px-5 py-4 flex items-center justify-between shrink-0 relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
            <div className="absolute -bottom-8 -left-4 w-20 h-20 bg-white/5 rounded-full" />

            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-xl shadow-inner">
                {CHATBOT_CONFIG.avatar}
              </div>
              <div>
                <h3 className="font-bold text-white text-sm tracking-wide">{CHATBOT_CONFIG.name}</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-[11px] text-white/80">Online</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="relative z-10 w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors md:hidden"
            >
              <X size={18} className="text-white" />
            </button>
          </div>

          {/* ── Messages ────────────────── */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gradient-to-b from-gray-50/80 to-white scroll-smooth"
            style={{ scrollBehavior: 'smooth' }}
          >
            {messages.map((msg) => (
              <div key={msg.id}>
                <div
                  className={`flex items-end gap-2 ${
                    msg.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {/* Bot avatar */}
                  {msg.type === 'bot' && (
                    <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center shrink-0 mb-1">
                      <Bot size={14} className="text-primary-600" />
                    </div>
                  )}

                  {/* Message bubble */}
                  <div
                    className={`max-w-[80%] px-4 py-2.5 text-[13px] leading-relaxed shadow-sm ${
                      msg.type === 'user'
                        ? 'bg-primary-600 text-white rounded-2xl rounded-br-md'
                        : 'bg-white text-gray-800 rounded-2xl rounded-bl-md border border-gray-100'
                    }`}
                    dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                  />

                  {/* User avatar */}
                  {msg.type === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-gray-200 flex items-center justify-center shrink-0 mb-1">
                      <User size={14} className="text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <p
                  className={`text-[10px] text-gray-400 mt-1 ${
                    msg.type === 'user' ? 'text-right mr-9' : 'ml-9'
                  }`}
                >
                  {formatTime(msg.time)}
                </p>

                {/* Quick replies on greeting */}
                {msg.showQuickReplies && (
                  <div className="ml-9 mt-3 flex flex-wrap gap-2">
                    {QUICK_REPLIES.map((qr) => (
                      <button
                        key={qr.value}
                        onClick={() => handleSend(qr.value)}
                        className="px-3 py-1.5 text-[11px] font-medium bg-primary-50 text-primary-700 rounded-full border border-primary-200 hover:bg-primary-100 hover:border-primary-300 transition-all active:scale-95"
                      >
                        {qr.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Follow-up suggestions */}
                {msg.type === 'bot' && msg.followUp && msg.followUp.length > 0 && (
                  <div className="ml-9 mt-2 flex flex-wrap gap-1.5">
                    {msg.followUp.map((fu) => (
                      <button
                        key={fu}
                        onClick={() => handleFollowUp(fu)}
                        className="px-2.5 py-1 text-[10px] font-medium bg-gray-50 text-gray-600 rounded-full border border-gray-200 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 transition-all active:scale-95"
                      >
                        {getFollowUpLabel(fu)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-primary-600" />
                </div>
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 border border-gray-100 shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Scroll to bottom button */}
          {showScrollBtn && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all animate-bounce z-10"
            >
              <ChevronDown size={16} className="text-gray-500" />
            </button>
          )}

          {/* ── Input ───────────────────── */}
          <div className="px-4 py-3 bg-white border-t border-gray-100 shrink-0">
            <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2 border border-gray-200 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
              <Sparkles size={16} className="text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ketik pertanyaan Anda..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 placeholder:text-gray-400"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputValue.trim()}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                  inputValue.trim()
                    ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-200 active:scale-90'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send size={14} />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-2">
              Powered by Thriftly CS • Chatbot otomatis
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default ChatBot
