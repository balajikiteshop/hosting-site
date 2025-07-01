'use client';

import { useEffect, useState } from 'react';

import type { ProductVariant } from '@/types/product'

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onVariantChange: (variant: ProductVariant | null) => void;
}

export default function VariantSelector({ variants, selectedVariant: initialVariant, onVariantChange }: VariantSelectorProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // Get unique attribute types from all variants
  const attributeTypes = Array.from(
    new Set(
      variants.flatMap(variant => Object.keys(variant.attributes))
    )
  );

  // Get unique values for each attribute type
  const attributeValues = attributeTypes.reduce((acc, type) => {
    acc[type] = Array.from(
      new Set(
        variants
          .map(variant => variant.attributes[type])
          .filter((value): value is string => typeof value === 'string')
      )
    );
    return acc;
  }, {} as Record<string, string[]>);

  // Find matching variant based on selected options
  useEffect(() => {
    const matchingVariant = variants.find(variant => {
      return Object.entries(selectedOptions).every(
        ([key, value]) => variant.attributes[key] === value
      );
    });

    setSelectedVariant(matchingVariant || null);
    onVariantChange(matchingVariant || null);
  }, [selectedOptions, variants, onVariantChange]);

  const handleOptionChange = (attributeType: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [attributeType]: value,
    }));
  };

  return (
    <div className="space-y-4">
      {attributeTypes.map(attributeType => (
        <div key={attributeType} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {attributeType.charAt(0).toUpperCase() + attributeType.slice(1)}
          </label>
          <div className="flex flex-wrap gap-2">
            {attributeValues[attributeType].map(value => (
              <button
                key={value}
                onClick={() => handleOptionChange(attributeType, value)}
                className={`px-4 py-2 text-sm font-medium rounded-md border ${
                  selectedOptions[attributeType] === value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      ))}

      {selectedVariant && (
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Stock: {selectedVariant.stock} available
          </p>
        </div>
      )}
    </div>
  );
}
