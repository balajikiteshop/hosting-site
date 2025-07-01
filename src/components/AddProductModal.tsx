'use client'

import { useState, useRef, useEffect } from 'react'
import { imagekit } from '@/lib/imagekit'

interface AddProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (product: {
    name: string
    description: string
    price: number
    stock: number
    categoryId: string
    imageUrl?: string
  }) => void
  categories: Array<{ id: string; name: string }>
  initialData?: {
    id: string
    name: string
    description: string
    price: number
    stock: number
    categoryId: string
    imageUrl?: string
  }
  mode?: 'add' | 'edit'
}

export default function AddProductModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  categories,
  initialData,
  mode = 'add' 
}: AddProductModalProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price?.toString() || '',
    stock: initialData?.stock?.toString() || '',
    categoryId: initialData?.categoryId || '',
    imageUrl: initialData?.imageUrl || ''
  })
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [previewUrl, setPreviewUrl] = useState(initialData?.imageUrl || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        price: initialData.price.toString(),
        stock: initialData.stock.toString(),
        categoryId: initialData.categoryId,
        imageUrl: initialData.imageUrl || ''
      })
      setPreviewUrl(initialData.imageUrl || '')
    }
  }, [initialData])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create a preview URL
    const preview = URL.createObjectURL(file)
    setPreviewUrl(preview)

    setIsUploading(true)
    setUploadError('')

    try {
      // Get authentication parameters from your server
      const authResponse = await fetch('/api/imagekit/auth')
      const auth = await authResponse.json()

      // Upload the file to ImageKit
      const result = await imagekit.upload({
        file,
        fileName: `product-${Date.now()}-${file.name}`,
        ...auth
      })

      // Update form with the uploaded image URL
      setPreviewUrl(result.url)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError('Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isUploading) {
      setUploadError('Please wait for the image to finish uploading')
      return
    }

    onSubmit({
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      imageUrl: previewUrl || undefined
    })

    // Reset form
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      categoryId: '',
      imageUrl: ''
    })
    setPreviewUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">{mode === 'add' ? 'Add New Product' : 'Edit Product'}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Image
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            {uploadError && (
              <p className="mt-1 text-sm text-red-600">{uploadError}</p>
            )}
            {isUploading && (
              <p className="mt-1 text-sm text-blue-600">Uploading image...</p>
            )}
            {previewUrl && (
              <div className="mt-2">
                <img
                  src={previewUrl}
                  alt="Product preview"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg ${
                isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {isUploading ? 'Uploading...' : mode === 'add' ? 'Add Product' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
