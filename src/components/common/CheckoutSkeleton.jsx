import React from 'react'
import Header from '../layout/Header'
import Footer from '../layout/Footer'
import Container from '../layout/Container'

const CheckoutSkeleton = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-16 md:pb-0">
      <Header />
      <main className="flex-grow py-8">
        <Container maxWidth="max-w-5xl">
          <div className="h-8 bg-gray-200 rounded-lg w-48 mb-6 animate-pulse"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-6">
              {/* Box 1 */}
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                <div className="border border-gray-100 rounded-xl p-4">
                   <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                   <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                   <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
              
              {/* Box 2 */}
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-xl shrink-0"></div>
                  <div className="flex-1 space-y-2 py-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/3 mt-4"></div>
                  </div>
                </div>
              </div>

              {/* Box 3 */}
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="h-24 bg-gray-200 rounded-xl"></div>
                  <div className="h-24 bg-gray-200 rounded-xl"></div>
                  <div className="h-24 bg-gray-200 rounded-xl"></div>
                </div>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 pt-4 mb-6">
                  <div className="flex justify-between">
                    <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
                
                <div className="h-16 bg-gray-200 rounded-xl mb-6"></div>
                <div className="h-12 bg-gray-300 rounded-xl w-full"></div>
              </div>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  )
}

export default CheckoutSkeleton
