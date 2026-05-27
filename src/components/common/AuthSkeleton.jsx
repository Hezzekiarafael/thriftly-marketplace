import React from 'react'
import Header from '../layout/Header'
import Footer from '../layout/Footer'
import Container from '../layout/Container'

const AuthSkeleton = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <Container className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-soft p-8 animate-pulse border border-gray-100">
            {/* Title */}
            <div className="h-8 bg-gray-200 rounded-lg w-2/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
            
            {/* Form Fields */}
            <div className="space-y-6">
              <div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded-xl w-full"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded-xl w-full"></div>
              </div>
              
              {/* Button */}
              <div className="h-12 bg-gray-300 rounded-xl w-full mt-8"></div>
            </div>
            
            {/* Divider and Google Login */}
            <div className="mt-8 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
              <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
            </div>
            
            {/* Register Link */}
            <div className="mt-8">
              <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
            </div>
          </div>
        </div>
      </Container>
      <Footer />
    </div>
  )
}

export default AuthSkeleton
