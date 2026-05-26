import React from 'react'
import Header from '../layout/Header'
import Footer from '../layout/Footer'
import Container from '../layout/Container'

const SellerDashboardSkeleton = () => (
  <div className="min-h-screen flex flex-col bg-gray-50 pb-16 md:pb-0">
    <Header />

    <Container>
      {/* Header card: Dashboard Penjual + nama + alamat */}
      <div className="bg-white rounded-2xl p-4 md:p-8 shadow-sm md:shadow-soft border border-gray-100 mb-6 md:mb-8 mt-4 md:mt-8 animate-pulse">
        <div className="h-6 md:h-8 w-48 bg-gray-200 rounded mb-2 md:mb-3" />
        <div className="h-4 md:h-5 w-72 bg-gray-200 rounded mb-3 md:mb-4" />
        <div className="h-7 w-64 bg-gray-100 rounded-lg border border-gray-200 px-3 py-1.5" />
      </div>

      {/* 4 Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 md:p-6 shadow-soft border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-3 md:h-4 w-20 bg-gray-200 rounded mb-2" />
                <div className="h-7 md:h-9 w-12 bg-gray-200 rounded" />
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* 2 column: Saldo + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8 animate-pulse">
        {/* Saldo card */}
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-soft border border-gray-100">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="h-5 md:h-6 w-16 bg-gray-200 rounded" />
            <div className="w-6 h-6 md:w-8 md:h-8 bg-gray-200 rounded-full" />
          </div>
          <div className="space-y-2 md:space-y-3">
            <div className="flex justify-between items-center p-2.5 md:p-3 bg-green-50 rounded-lg">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
            </div>
            <div className="flex justify-between items-center p-2.5 md:p-3 bg-amber-50 rounded-lg">
              <div className="h-4 w-28 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
            </div>
            <div className="flex justify-between items-center p-2.5 md:p-3 bg-indigo-50 rounded-lg">
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="mt-4 h-9 md:h-10 w-full bg-gray-200 rounded-xl" />
        </div>

        {/* Quick Actions card */}
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-soft border border-gray-100">
          <div className="h-5 md:h-6 w-28 bg-gray-200 rounded mb-3 md:mb-4" />
          <div className="flex flex-col gap-3">
            <div className="h-9 md:h-10 w-full bg-gray-200 rounded-xl" />
            <div className="h-9 md:h-10 w-full bg-gray-200 rounded-xl" />
            <div className="h-9 md:h-10 w-full bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    </Container>

    <Footer />
  </div>
)

export default SellerDashboardSkeleton
