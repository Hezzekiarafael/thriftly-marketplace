import React from 'react'
import { Laptop, Shirt, Car, Home, Dumbbell, BookOpen, Box, LayoutGrid } from 'lucide-react'

const CategoryIcon = ({ id, size = 18, className = "" }) => {
  const commonProps = {
    size,
    strokeWidth: 2,
    stroke: "#1e293b", // slate-800
    fill: "#fcd34d",   // amber-300
    className
  }

  if (id === 'all') return <LayoutGrid {...commonProps} />
  
  const icons = {
    'elektronik-gadget': <Laptop {...commonProps} />,
    'fashion-aksesoris': <Shirt {...commonProps} />,
    'kendaraan': <Car {...commonProps} />,
    'rumah-tangga': <Home {...commonProps} />,
    'hobi-olahraga': <Dumbbell {...commonProps} />,
    'buku-alat-tulis': <BookOpen {...commonProps} />
  }
  return icons[id] || <Box {...commonProps} />
}

export default CategoryIcon
