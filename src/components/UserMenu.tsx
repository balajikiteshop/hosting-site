'use client';

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { User, LogOut, ShoppingBag } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import Link from 'next/link';
import Image from 'next/image';

export function UserMenu() {
  const { user, logout, loading } = useUser();

  if (loading) {
    return (
      <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Sign In
      </Link>
    );
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || 'User avatar'}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <User className="h-5 w-5 text-gray-600" />
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none">
          <div className="px-4 py-3">
            <p className="text-sm">Signed in as</p>
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.email}
            </p>
          </div>

          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/orders"
                  className={`${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  } flex items-center px-4 py-2 text-sm`}
                >
                  <ShoppingBag className="mr-3 h-5 w-5" />
                  My Orders
                </Link>
              )}
            </Menu.Item>
          </div>

          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => logout()}
                  className={`${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  } flex w-full items-center px-4 py-2 text-sm`}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Sign Out
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
