'use client';

import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="inline-block">
              <Image
                src="/aztech logo.png"
                alt="Aztech Coworks"
                width={160}
                height={53}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="mt-3 text-sm text-gray-600">
              Beyond the Office: Connect, Create, Collaborate.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">Product</h3>
            <ul className="mt-2 space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/spaces" className="hover:text-blue-600">
                  Browse Spaces
                </Link>
              </li>
              <li>
                <Link href="/locations" className="hover:text-blue-600">
                  Locations
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">Company</h3>
            <ul className="mt-2 space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/about" className="hover:text-blue-600">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-600">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">Legal</h3>
            <ul className="mt-2 space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/privacy" className="hover:text-blue-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-600">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Aztech Coworks. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}