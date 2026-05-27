import { useEffect } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import AppRoutes from './routes'
import BottomNav from './components/layout/BottomNav'
import { seedDatabase } from './services/seedData'
import ChatBot from './components/common/ChatBot'

function App() {
  useEffect(() => {
    if (import.meta.env.VITE_USE_MOCK_API === 'true') {
      seedDatabase()
    }
  }, [])


  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <div className="relative min-h-screen bg-gray-50">
            <div className="md:pb-0">
              <AppRoutes />
            </div>
            <BottomNav />
            <ChatBot />
            <Toaster position="top-center" />
          </div>
        </AppProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
