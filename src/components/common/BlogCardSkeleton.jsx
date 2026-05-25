import React from 'react'

const BlogCardSkeleton = () => {
  return (
    <div className="flex-shrink-0 w-[280px] md:w-[320px] flex flex-col h-full bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 snap-start animate-pulse">
      {/* Gambar Skeleton */}
      <div className="relative h-44 bg-gray-200">
        <div className="absolute top-3 left-3 w-16 h-6 bg-gray-300 rounded-full"></div>
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        {/* Tanggal Skeleton */}
        <div className="h-3 bg-gray-200 rounded w-1/4 mb-3"></div>
        
        {/* Judul Skeleton */}
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        
        {/* Deskripsi Skeleton */}
        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-4/5 mb-6"></div>
        
        {/* Link Skeleton */}
        <div className="mt-auto h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  )
}

export default BlogCardSkeleton
