import React from 'react'
import AdminLayout from '../layout/AdminLayout'

const AdminPageSkeleton = () => {
  return (
    <AdminLayout>
      <div className="animate-pulse space-y-8 mt-2">
        {/* Header Section Skeleton */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="h-8 bg-gray-200 rounded-lg w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-96"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded-lg w-32 hidden md:block"></div>
        </div>

        {/* 4 Stat Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
              <div className="flex justify-between items-start">
                <div className="w-full">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-32 mt-6"></div>
            </div>
          ))}
        </div>

        {/* Two Column Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-soft border border-gray-100 h-[400px]">
             <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
             <div className="space-y-4">
               {[1,2,3,4,5].map(i => (
                 <div key={i} className="h-12 bg-gray-100 rounded-lg w-full"></div>
               ))}
             </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 h-[400px]">
             <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
             <div className="h-24 bg-gray-100 rounded-xl w-full mb-4"></div>
             <div className="h-24 bg-gray-100 rounded-xl w-full"></div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminPageSkeleton
