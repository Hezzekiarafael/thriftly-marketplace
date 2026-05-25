import React from 'react'
import Header from '../layout/Header'
import Footer from '../layout/Footer'
import Container from '../layout/Container'

const BuyerDashboardSkeleton = () => (
  <div className="min-h-screen flex flex-col bg-gray-50 pb-16 md:pb-0">
    <Header />

    <main className="flex-grow py-8">
      <Container maxWidth="max-w-4xl">
        {/* Card 1: Greeting + Shortcut */}
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 mb-6 animate-pulse">
          {/* Avatar + Welcome text */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary-100 rounded-full shrink-0" />
            <div>
              <div className="h-5 w-48 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-64 bg-gray-200 rounded" />
            </div>
          </div>

          {/* 2 Shortcut cards: Pesanan Saya & Mulai Belanja */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col items-center text-center gap-2">
              <div className="bg-gray-200 p-2.5 rounded-lg w-10 h-10" />
              <div className="h-3 w-20 bg-gray-200 rounded" />
            </div>
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col items-center text-center gap-2">
              <div className="bg-gray-200 p-2.5 rounded-lg w-10 h-10" />
              <div className="h-3 w-20 bg-gray-200 rounded" />
            </div>
          </div>
        </div>

        {/* Card 2: Pengaturan Profil */}
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 animate-pulse">
          {/* Section heading: icon + "Pengaturan Profil" */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-gray-200 rounded" />
            <div className="h-5 w-36 bg-gray-200 rounded" />
          </div>

          <div className="space-y-4">
            {/* Email row */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="h-3 w-10 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-48 bg-gray-200 rounded" />
            </div>

            {/* Alamat Pengiriman row */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <div className="h-3 w-28 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-72 bg-gray-200 rounded" />
                </div>
                <div className="h-8 w-24 bg-gray-200 rounded-lg shrink-0" />
              </div>
            </div>
          </div>

          {/* Logout button placeholder (mobile only) */}
          <div className="md:hidden mt-6 pt-6 border-t border-gray-100">
            <div className="w-full h-11 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </Container>
    </main>

    <Footer />
  </div>
)

export default BuyerDashboardSkeleton
