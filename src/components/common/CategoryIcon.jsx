import React from 'react'
import { Laptop, Shirt, Car, Home, Dumbbell, BookOpen, Box, LayoutGrid } from 'lucide-react'

const CategoryIcon = ({ id, size = 18, className = "" }) => {
  if (id === 'all') return <LayoutGrid size={size} className={className} />
  
  const icons = {
    'elektronik-gadget': <Laptop size={size} className={className} />,
    'fashion-aksesoris': <Shirt size={size} className={className} />,
    'kendaraan': <Car size={size} className={className} />,
    'rumah-tangga': <Home size={size} className={className} />,
    'hobi-olahraga': <Dumbbell size={size} className={className} />,
    'buku-alat-tulis': <BookOpen size={size} className={className} />
  }
  return icons[id] || <Box size={size} className={className} />
}

export default CategoryIcon
