# API Pagination Documentation

## Overview

All admin endpoints for products, categories, and orders now support pagination to improve performance and reduce database load. This prevents overwhelming the database when dealing with large datasets.

## Supported Endpoints

### 1. Admin Products (`/api/admin/products`)

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10, max: 100) - Items per page
- `search` (optional) - Search in product name or description
- `categoryId` (optional) - Filter by category ID
- `isActive` (optional) - Filter by active status (true/false)

**Example Request:**
```
GET /api/admin/products?page=2&limit=20&search=kitchen&isActive=true
```

### 2. Admin Categories (`/api/admin/categories`)

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10, max: 100) - Items per page
- `search` (optional) - Search in category name or description

**Example Request:**
```
GET /api/admin/categories?page=1&limit=15&search=appliances
```

### 3. Admin Orders (`/api/admin/orders`)

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10, max: 100) - Items per page
- `status` (optional) - Filter by order status
- `search` (optional) - Search in order ID, payment ID, user name, or email
- `startDate` (optional) - Filter orders from this date (ISO format)
- `endDate` (optional) - Filter orders until this date (ISO format)

**Example Request:**
```
GET /api/admin/orders?page=1&limit=25&status=completed&startDate=2024-01-01&endDate=2024-12-31
```

## Response Format

All paginated endpoints return data in the following format:

```json
{
  "data": [...], // Array of items for current page
  "pagination": {
    "page": 1,           // Current page number
    "limit": 10,         // Items per page
    "totalCount": 150,   // Total number of items
    "totalPages": 15,    // Total number of pages
    "hasNextPage": true, // Whether there's a next page
    "hasPrevPage": false // Whether there's a previous page
  }
}
```

## Benefits

1. **Performance**: Reduces database load by limiting the number of records fetched per request
2. **Scalability**: Handles large datasets efficiently
3. **User Experience**: Faster page load times for admin dashboards
4. **Memory Usage**: Lower memory consumption on both client and server
5. **Network Efficiency**: Smaller response payloads

## Implementation Details

- Maximum limit is capped at 100 items per page to prevent abuse
- Default page size is 10 items
- All endpoints maintain backward compatibility
- Search functionality is case-insensitive
- Deleted products in orders are handled gracefully with fallback information
- All responses include proper cache-busting headers for admin endpoints

## Frontend Integration

When implementing pagination in the frontend:

1. Use the `pagination` metadata to build navigation controls
2. Update URL parameters to maintain pagination state on page refresh
3. Show loading states during pagination requests
4. Consider implementing infinite scroll or traditional pagination UI
5. Handle empty states when no data is available

## Database Optimization

The pagination implementation uses efficient database queries with:
- `OFFSET` and `LIMIT` for proper pagination
- `COUNT` queries for total record calculation
- Proper indexing on commonly filtered fields
- Optimized joins for related data
