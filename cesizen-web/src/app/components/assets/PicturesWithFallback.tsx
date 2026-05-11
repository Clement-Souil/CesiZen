import React, { useState } from 'react'

const ERROR_IMG_SRC = 'data:image/svg+xml;base64,...' // Ton SVG de fallback

export function PicturesWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)

  const handleError = () => setDidError(true)

  const { src, alt, style, className, ...rest } = props

  return didError ? (
    <div className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`} style={style}>
      <div className="flex items-center justify-center w-full h-full">
        <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} />
      </div>
    </div>
  ) : (
    <img src={src} alt={alt} className={className} style={style} {...rest} onError={handleError} />
  )
}