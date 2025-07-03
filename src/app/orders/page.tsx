import { getUserFromCookies } from '@/lib/user-auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export default async function OrdersPage() {
  const userPayload = await getUserFromCookies();
  
  if (!userPayload) {
    redirect('/login?callbackUrl=/orders');
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { email: userPayload.email }
  });

  if (!user) {
    redirect('/login?callbackUrl=/orders');
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      id: true,
      amount: true,
      status: true,
      paymentStatus: true,
      createdAt: true,
      shippingInfo: true,
      items: {
        select: {
          id: true,
          quantity: true,
          price: true,
          product: {
            select: {
              id: true,
              name: true,
              imageUrl: true
            }
          },
          variant: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Orders</h1>

      <div className="space-y-8">
        {orders.map((order: any) => (
          <div
            key={order.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Order #{order.id}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-medium text-gray-900">
                    ₹{order.amount.toFixed(2)}
                  </p>
                  <div className="flex flex-col gap-1">
                    <span className={`text-sm px-2 py-1 rounded ${
                      order.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      order.paymentStatus === 'paid' 
                        ? 'bg-green-100 text-green-800'
                        : order.paymentStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      Payment: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900">Shipping Information</h3>
                <div className="mt-2 text-sm text-gray-600">
                  {typeof order.shippingInfo === 'object' && order.shippingInfo !== null && (
                    <>
                      <p>{(order.shippingInfo as any).customerName}</p>
                      <p>{(order.shippingInfo as any).customerEmail}</p>
                      <p>{(order.shippingInfo as any).customerPhone}</p>
                      <p>{(order.shippingInfo as any).shippingAddress}</p>
                    </>
                  )}
                </div>
              </div>

              <h3 className="text-sm font-medium text-gray-900 mb-3">Order Items</h3>
              {order.items.map((item: any) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Link
                      href={`/products/${item.product.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {item.product.name}
                    </Link>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">
                      {item.quantity} × ₹{item.price.toFixed(2)}
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      ₹{(item.quantity * item.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t">
              <div className="flex justify-between">
                <div className="text-sm text-gray-500">
                  Total Items: {order.items.reduce((acc: number, item: any) => acc + item.quantity, 0)}
                </div>
                <div className="text-sm font-medium text-gray-900">
                  Order Total: ₹{order.amount.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No orders found</p>
            <Link
              href="/products"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
