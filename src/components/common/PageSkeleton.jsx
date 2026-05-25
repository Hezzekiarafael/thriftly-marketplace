import React from 'react'
import Header from '../layout/Header'

const PageSkeleton = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          {/* Title Area */}
          <div className="h-8 bg-gray-200 rounded-lg w-1/3 max-w-xs"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar (Hidden on mobile) */}
            <div className="hidden md:block col-span-1 space-y-4">
              <div className="h-48 bg-gray-200 rounded-2xl"></div>
              <div className="h-64 bg-gray-200 rounded-2xl"></div>
            </div>
            
            {/* Content Area */}
            <div className="col-span-1 md:col-span-3 space-y-6">
              {/* Top Banner/Card */}
              <div className="h-40 bg-gray-200 rounded-2xl"></div>
              
              {/* List items */}
              <div className="space-y-4">
                <div className="h-24 bg-gray-200 rounded-2xl"></div>
                <div className="h-24 bg-gray-200 rounded-2xl"></div>
                <div className="h-24 bg-gray-200 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PageSkeleton
