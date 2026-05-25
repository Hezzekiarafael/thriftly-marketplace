import React from 'react'
import Container from '../../components/layout/Container'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'

const ProductDetailSkeleton = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white md:bg-gray-50 pb-16 md:pb-0">
      <Header />
      
      {/* Breadcrumbs Skeleton */}
      <div className="bg-white border-b border-gray-200 py-4 hidden md:block">
        <Container className="py-0">
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </Container>
      </div>

      <div className="py-0 md:py-8 w-full animate-pulse">
        <div className="container mx-auto px-0 md:px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 md:gap-10">
            {/* Left Column: Images Skeleton */}
            <div className="lg:col-span-7 space-y-0 md:space-y-4">
              <div className="relative aspect-[4/3] bg-gray-200 md:rounded-2xl border-b border-gray-100 md:border-b-0"></div>
              
              <div className="flex gap-3 overflow-x-auto pb-2 px-4 md:px-0 mt-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl bg-gray-200"></div>
                ))}
              </div>
              
              {/* Description Skeleton (Desktop) */}
              <div className="hidden lg:block bg-white rounded-2xl p-8 border border-gray-100 mt-8">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>

            {/* Right Column: Info & Actions Skeleton */}
            <div className="lg:col-span-5 px-0 mt-4 md:mt-0">
              <div className="space-y-0 md:space-y-6">
                <div className="bg-white md:rounded-2xl p-6 lg:p-8 border-b border-gray-100 md:border-b-0">
                  <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded w-3/4 mb-6"></div>
                  
                  <div className="mb-5 sm:mb-8 p-4 bg-gray-100 rounded-xl">
                    <div className="h-12 bg-gray-200 rounded w-1/2"></div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg shrink-0"></div>
                      <div className="w-full">
                        <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg shrink-0"></div>
                      <div className="w-full">
                        <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-gray-100">
                    <div className="h-12 bg-gray-200 rounded w-full"></div>
                    <div className="flex gap-3">
                      <div className="h-12 bg-gray-200 rounded flex-1"></div>
                      <div className="h-12 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>

                {/* Seller Info Skeleton */}
                <div className="bg-white md:rounded-2xl p-6 border-b border-gray-100 md:border-b-0 mt-2">
                  <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-200 rounded-full shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default ProductDetailSkeleton
