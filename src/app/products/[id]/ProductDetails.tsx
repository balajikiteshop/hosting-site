'use client';

import { useState } from 'react';
import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton';
import VariantSelector from '@/components/VariantSelector';
import SafeImage from '@/components/SafeImage';
import type { Product, ProductVariant } from '@/types/product';
import { formatPrice } from '@/lib/utils';

interface ProductDetailsProps {
  product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    // Default to the first active variant if available
    product.variants?.find(v => v.isActive) || null
  );

  const [quantity, setQuantity] = useState(1);

  // Get current price from selected variant or product base price
  const currentPrice = selectedVariant
    ? selectedVariant.price
    : product.price;

  // Get current stock from selected variant or product default
  const currentStock = selectedVariant?.stock ?? product.stock ?? 0;

  const handleVariantChange = (variant: ProductVariant | null) => {
    setSelectedVariant(variant);
    // Reset quantity if it exceeds new stock
    if (variant && quantity > variant.stock) {
      setQuantity(Math.min(quantity, variant.stock));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 animate-fadeIn">
        <Link href="/products" className="btn-secondary inline-flex items-center space-x-2 hover-lift">
          <span>←</span>
          <span>Back to Products</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="animate-slideIn">
          <div className="aspect-square rounded-lg overflow-hidden card-enhanced">
            {(selectedVariant?.imageUrl || product.imageUrl) ? (
              <div className="relative w-full h-full">
                <SafeImage
                  src={selectedVariant?.imageUrl || product.imageUrl || ''}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover hover-scale"
                  priority
                />
                {/* SafeImage handles the placeholder internally */}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-400">
                <div className="text-8xl mb-4 animate-float">🪁</div>
                <span className="text-lg font-medium">No Image Available</span>
                <span className="text-sm text-gray-500">Please check back later</span>
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6 animate-slideIn">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          
          <div className="space-y-2">
            <div className="text-2xl font-semibold text-primary">
              {product.variants.length > 0 ? (
                selectedVariant ? (
                  <>
                    <span>{formatPrice(currentPrice)}</span>
                    {selectedVariant.price !== product.price && (
                      <span className="text-base text-gray-500 line-through ml-2">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </>
                ) : (
                  <span>From {formatPrice(Math.min(product.price, ...product.variants.map(v => v.price)))}</span>
                )
              ) : (
                <span>{formatPrice(currentPrice)}</span>
              )}
            </div>
            {product.variants.length > 0 && !selectedVariant && (
              <p className="text-sm text-gray-500">Select a variant to see final price</p>
            )}
          </div>

          {/* Variant Selection */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-4">
              <VariantSelector
                variants={product.variants}
                selectedVariant={selectedVariant}
                onVariantChange={handleVariantChange}
              />
              {selectedVariant && (
                <div className="flex items-center justify-between border-t border-b py-4">
                  <span className="text-sm font-medium text-gray-900">Selected variant:</span>
                  <span className="text-sm text-gray-500">{selectedVariant.name}</span>
                </div>
              )}
            </div>
          )}

          <div className="prose max-w-none">
            <p>{product.description}</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-24">
              <label htmlFor="quantity" className="sr-only">
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min="1"
                max={currentStock}
                value={quantity}
                onChange={(e) => setQuantity(Math.min(parseInt(e.target.value) || 1, currentStock))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>

            <AddToCartButton
              product={product}
              variant={selectedVariant}
              quantity={quantity}
              disabled={currentStock === 0}
            />
          </div>

          {/* Stock Status */}
          <div className="text-sm">
            {currentStock > 0 ? (
              <span className="text-green-600">
                In stock ({currentStock} available)
              </span>
            ) : (
              <span className="text-red-600">Out of stock</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
