'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Package, AlertCircle, Search } from 'lucide-react'
import SafeImage from '@/components/SafeImage'
import AddProductModal from '@/components/AddProductModal'
import AddCategoryModal from '@/components/AddCategoryModal'
import Pagination from '@/components/Pagination'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  isActive: boolean
  imageUrl?: string
  category: {
    id: string
    name: string
  }
  variants: Array<{
    id: string
    name: string
    price: number
    stock: number
    isActive: boolean
  }>
  createdAt: string
}

interface Category {
  id: string
  name: string
  description: string | null
  _count: {
    products: number
  }
}

interface Order {
  id: string
  createdAt: string
  status: string
  paymentStatus: string
  amount: number
  shippingInfo: {
    name: string
    email: string
    phone: string
    address: string
  }
  items: Array<{
    id: string
    quantity: number
    price: number
    product: {
      id: string
      name: string
    }
    variant?: {
      id: string
      name: string
    }
  }>
  user: {
    name: string | null
    email: string
  }
}

export default function AdminDashboard() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'orders'>('products')
  const [orderFilter, setOrderFilter] = useState<string>('all')
  
  // Pagination state
  const [productsPagination, setProductsPagination] = useState({ page: 1, totalPages: 1, totalCount: 0 })
  const [categoriesPagination, setCategoriesPagination] = useState({ page: 1, totalPages: 1, totalCount: 0 })
  const [ordersPagination, setOrdersPagination] = useState({ page: 1, totalPages: 1, totalCount: 0 })
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false)
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Handle unauthorized responses globally
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const res = await fetch(url, options)
    if (res.status === 401) {
      router.push('/admin/login')
      throw new Error('Unauthorized')
    }
    return res
  }

  const fetchProducts = async (page = 1, search = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search })
      })
      const res = await fetchWithAuth(`/api/admin/products?${params}`)
      if (res.ok) {
        const response = await res.json()
        // Handle paginated response format
        if (response.data && response.pagination) {
          setProducts(response.data)
          setProductsPagination({
            page: response.pagination.page,
            totalPages: response.pagination.totalPages,
            totalCount: response.pagination.totalCount
          })
        } else {
          // Fallback for non-paginated response
          setProducts(response)
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setError('Failed to fetch products')
    }
  }

  const fetchCategories = async (page = 1, search = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search })
      })
      const res = await fetchWithAuth(`/api/admin/categories?${params}`)
      if (res.ok) {
        const response = await res.json()
        // Handle paginated response format
        if (response.data && response.pagination) {
          setCategories(response.data)
          setCategoriesPagination({
            page: response.pagination.page,
            totalPages: response.pagination.totalPages,
            totalCount: response.pagination.totalCount
          })
        } else {
          // Fallback for non-paginated response
          setCategories(response)
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setError('Failed to fetch categories')
    }
  }

  const fetchOrders = async (page = 1, search = '', status = 'all') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(status !== 'all' && { status })
      })
      const res = await fetchWithAuth(`/api/admin/orders?${params}`)
      if (res.ok) {
        const response = await res.json()
        // Handle paginated response format
        if (response.data && response.pagination) {
          setOrders(response.data)
          setOrdersPagination({
            page: response.pagination.page,
            totalPages: response.pagination.totalPages,
            totalCount: response.pagination.totalCount
          })
        } else {
          // Fallback for non-paginated response
          setOrders(response)
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('Failed to fetch orders')
    }
  }

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      await Promise.all([
        fetchProducts(productsPagination.page, searchTerm),
        fetchCategories(categoriesPagination.page, searchTerm),
        fetchOrders(ordersPagination.page, searchTerm, orderFilter)
      ])
    } catch (err) {
      console.error('Failed to fetch data:', err)
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  // Pagination handlers
  const handleProductsPageChange = (newPage: number) => {
    setProductsPagination(prev => ({ ...prev, page: newPage }))
    fetchProducts(newPage, searchTerm)
  }

  const handleCategoriesPageChange = (newPage: number) => {
    setCategoriesPagination(prev => ({ ...prev, page: newPage }))
    fetchCategories(newPage, searchTerm)
  }

  const handleOrdersPageChange = (newPage: number) => {
    setOrdersPagination(prev => ({ ...prev, page: newPage }))
    fetchOrders(newPage, searchTerm, orderFilter)
  }

  // Search handler
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    // Reset to page 1 when searching
    setProductsPagination(prev => ({ ...prev, page: 1 }))
    setCategoriesPagination(prev => ({ ...prev, page: 1 }))
    setOrdersPagination(prev => ({ ...prev, page: 1 }))
    
    // Fetch data based on active tab
    if (activeTab === 'products') {
      fetchProducts(1, term)
    } else if (activeTab === 'categories') {
      fetchCategories(1, term)
    } else if (activeTab === 'orders') {
      fetchOrders(1, term, orderFilter)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddProduct = async (productData: any) => {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      if (!response.ok) {
        throw new Error('Failed to add product')
      }

      const newProduct = await response.json()
      setProducts([newProduct, ...products])
      setIsAddProductModalOpen(false)
      fetchData() // Refresh all data
    } catch (error) {
      console.error('Error adding product:', error)
      alert('Failed to add product')
    }
  }

  const handleEditProduct = async (productData: any) => {
    try {
      const response = await fetch(`/api/admin/products/${editingProduct?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      if (!response.ok) {
        throw new Error('Failed to update product')
      }

      const updatedProduct = await response.json()
      setProducts(products.map(p => 
        p.id === updatedProduct.id ? updatedProduct : p
      ))
      setEditingProduct(null)
      fetchData() // Refresh all data
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Failed to update product')
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete product')
      }

      setProducts(products.filter(p => p.id !== id))
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    }
  }

  const handleAddCategory = async (categoryData: any) => {
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      })

      if (!response.ok) {
        throw new Error('Failed to add category')
      }

      const newCategory = await response.json()
      setCategories([newCategory, ...categories])
      setIsAddCategoryModalOpen(false)
      fetchData() // Refresh all data
    } catch (error) {
      console.error('Error adding category:', error)
      alert('Failed to add category')
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category and all its products?')) return

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete category')
      }

      setCategories(categories.filter(c => c.id !== id))
      fetchData() // Refresh all data
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Failed to delete category')
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetchWithAuth('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId, status })
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      const updatedOrder = await response.json()
      setOrders(orders.map(order => 
        order.id === updatedOrder.id ? updatedOrder : order
      ))
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status')
    }
  }

  const renderProductsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Products ({productsPagination.totalCount})</h2>
        <button
          onClick={() => setIsAddProductModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
        {products.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm ? 'No products found matching your search.' : 'No products available.'}
          </div>
        ) : (
          products.map(product => (
          <div key={product.id} className={`p-6 ${!product.isActive ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex space-x-4">
                {product.imageUrl && (
                  <div className="flex-shrink-0 w-24 h-24 relative">
                    <SafeImage
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-medium">
                    {product.name}
                    {!product.isActive && (
                      <span className="ml-2 text-xs text-red-500">(Inactive)</span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                  <div className="mt-2 text-sm">
                    <p>Base Price: ₹{product.price.toFixed(2)}</p>
                    <p>Stock: {product.stock}</p>
                    <p className="text-gray-500">Category: {product.category?.name || 'None'}</p>
                  </div>
                  {product.variants.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Variants:</p>
                      <div className="mt-1 space-y-1">
                        {product.variants.map(variant => (
                          <p key={variant.id} className="text-sm">
                            {variant.name} - ₹{variant.price.toFixed(2)} 
                            (Stock: {variant.stock})
                            {!variant.isActive && (
                              <span className="ml-1 text-xs text-red-500">(Inactive)</span>
                            )}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingProduct(product)}
                  className="p-2 text-gray-400 hover:text-gray-500"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))
        )}
      </div>
      
      <Pagination
        currentPage={productsPagination.page}
        totalPages={productsPagination.totalPages}
        totalCount={productsPagination.totalCount}
        onPageChange={handleProductsPageChange}
      />
    </div>
  )

  const renderCategoriesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Categories ({categoriesPagination.totalCount})</h2>
        <button
          onClick={() => setIsAddCategoryModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
        {categories.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm ? 'No categories found matching your search.' : 'No categories available.'}
          </div>
        ) : (
          categories.map(category => (
          <div key={category.id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium">{category.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {category._count?.products || 0} products
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setIsAddCategoryModalOpen(true)
                    // TODO: Implement category editing
                  }}
                  className="p-2 text-gray-400 hover:text-gray-500"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))
        )}
      </div>
      
      <Pagination
        currentPage={categoriesPagination.page}
        totalPages={categoriesPagination.totalPages}
        totalCount={categoriesPagination.totalCount}
        onPageChange={handleCategoriesPageChange}
      />
    </div>
  )

  const renderOrdersTab = () => {
    const filteredOrders = orderFilter === 'all' 
      ? orders
      : orders.filter(order => order.status === orderFilter)

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Orders ({ordersPagination.totalCount})</h2>
          <div className="flex space-x-3">
            <select 
              value={orderFilter}
              onChange={(e) => {
                setOrderFilter(e.target.value)
                setOrdersPagination(prev => ({ ...prev, page: 1 }))
                fetchOrders(1, searchTerm, e.target.value)
              }}
              className="rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'No orders found matching your search.' : `No ${orderFilter === 'all' ? '' : orderFilter} orders found.`}
            </p>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
            {orders.map(order => (
              <div key={order.id} className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">
                      Order #{order.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="rounded-md border border-gray-300 px-3 py-1 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium">Customer Details</h4>
                    <p>{order.shippingInfo.name}</p>
                    <p>{order.shippingInfo.email}</p>
                    <p>{order.shippingInfo.phone}</p>
                    <p className="whitespace-pre-line">{order.shippingInfo.address}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Order Details</h4>
                    <p>Status: <span className="capitalize">{order.status}</span></p>
                    <p>Payment: <span className="capitalize">{order.paymentStatus}</span></p>
                    <p>Total: ₹{order.amount.toFixed(2)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Items</h4>
                  <div className="space-y-2">
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.product.name}
                          {item.variant && ` (${item.variant.name})`}
                          {` × ${item.quantity}`}
                        </span>
                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <Pagination
          currentPage={ordersPagination.page}
          totalPages={ordersPagination.totalPages}
          totalCount={ordersPagination.totalCount}
          onPageChange={handleOrdersPageChange}
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full">
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
                <div className="mt-4">
                  <button
                    onClick={fetchData}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'products'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Products ({productsPagination.totalCount})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'categories'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Categories ({categoriesPagination.totalCount})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'orders'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Orders ({ordersPagination.totalCount})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <>
          {activeTab === 'products' && renderProductsTab()}
          {activeTab === 'categories' && renderCategoriesTab()}
          {activeTab === 'orders' && renderOrdersTab()}
        </>
      )}

      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onSubmit={handleAddProduct}
        categories={categories}
      />

      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onSubmit={handleAddCategory}
      />

      <AddProductModal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onSubmit={handleEditProduct}
        categories={categories}
        initialData={editingProduct ? {
          id: editingProduct.id,
          name: editingProduct.name,
          description: editingProduct.description || '',
          price: editingProduct.price,
          stock: editingProduct.stock,
          categoryId: editingProduct.category.id,
          imageUrl: editingProduct.imageUrl
        } : undefined}
      />
    </div>
  )
}
