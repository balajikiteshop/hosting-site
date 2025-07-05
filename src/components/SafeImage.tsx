'use client'

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'
import { Package } from 'lucide-react'

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  fallbackClassName?: string
}

export default function SafeImage({ 
  fallbackClassName = "w-full h-full bg-gray-100 flex items-center justify-center", 
  ...props 
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div className={fallbackClassName}>
        <div className="text-center">
          <Package className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-xs text-gray-500">No image</p>
        </div>
      </div>
    )
  }

  return (
    <Image
      {...props}
      onError={() => setHasError(true)}
    />
  )
}
