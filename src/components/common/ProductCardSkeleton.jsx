import React from 'react'

const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 flex flex-col h-full relative animate-pulse">
      {/* Gambar Skeleton */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-200 rounded-t-2xl">
        {/* Badge Skeleton */}
        <div className="absolute top-3 left-3 w-12 h-6 bg-gray-300 rounded-md"></div>
        {/* Icon Kategori Skeleton */}
        <div className="absolute top-3 right-3 w-10 h-10 bg-gray-300 rounded-full"></div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        {/* Judul Produk Skeleton */}
        <div className="h-5 bg-gray-200 rounded-md w-3/4 mb-2"></div>
        <div className="h-5 bg-gray-200 rounded-md w-1/2 mb-4"></div>

        <div className="mt-auto pt-3 space-y-4">
          {/* Harga Skeleton */}
          <div className="h-7 bg-gray-200 rounded-md w-1/2"></div>

          {/* Lokasi & Rating Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
              <div className="h-4 bg-gray-200 rounded-md w-16"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
              <div className="h-4 bg-gray-200 rounded-md w-8"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductCardSkeleton
