import React from 'react'
import Header from '../layout/Header'
import Footer from '../layout/Footer'
import Container from '../layout/Container'
import { ArrowLeft } from 'lucide-react'

const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow py-6 md:py-12">
        <Container maxWidth="max-w-6xl">
          <div className="inline-flex items-center gap-1.5 text-gray-400 mb-4 md:mb-6">
            <ArrowLeft className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" />
            <span className="text-xs md:text-sm font-medium">Kembali ke Beranda</span>
          </div>

          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-10">Pengaturan Akun</h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8 items-start animate-pulse">
            {/* Sidebar Skeleton */}
            <aside className="lg:col-span-3">
              <div className="bg-white rounded-2xl md:rounded-3xl p-1.5 md:p-2 lg:p-4 shadow-sm md:shadow-soft-lg border border-gray-100 flex flex-row lg:flex-col gap-1 overflow-x-auto hide-scrollbar">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex-1 lg:w-full min-w-[120px] flex items-center p-2.5 md:p-3 lg:p-4 rounded-xl lg:rounded-2xl gap-2 lg:gap-3">
                    <div className="w-4 h-4 lg:w-5 lg:h-5 bg-gray-200 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            </aside>

            {/* Content Skeleton */}
            <div className="lg:col-span-9 space-y-5">
              <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-sm md:shadow-soft-lg border border-gray-100">
                <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8">
                  <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gray-200 shrink-0"></div>
                  <div className="space-y-2">
                    <div className="h-5 w-32 bg-gray-200 rounded"></div>
                    <div className="h-3 w-48 bg-gray-200 rounded"></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      <div className="h-12 w-full bg-gray-100 rounded-xl md:rounded-2xl"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  )
}

export default ProfileSkeleton
