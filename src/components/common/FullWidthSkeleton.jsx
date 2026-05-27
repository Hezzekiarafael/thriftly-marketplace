import React from 'react'
import Header from '../layout/Header'
import Footer from '../layout/Footer'
import Container from '../layout/Container'

const FullWidthSkeleton = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-16 md:pb-0">
      <Header />
      <main className="flex-grow py-8">
        <Container maxWidth="max-w-5xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded-lg w-1/3 max-w-xs mb-8"></div>
            
            <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 space-y-4">
              <div className="h-24 bg-gray-200 rounded-xl w-full"></div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 space-y-4">
              <div className="h-24 bg-gray-200 rounded-xl w-full"></div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 space-y-4">
              <div className="h-24 bg-gray-200 rounded-xl w-full"></div>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  )
}

export default FullWidthSkeleton
