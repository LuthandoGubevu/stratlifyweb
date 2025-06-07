
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react'; // Example Icon

export function ApexdevNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#111111]/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-2xl font-headline font-semibold text-white">
            {/* <Package className="h-7 w-7 text-cyan-500" />  Optional: Replace with actual logo */}
            ApexDev Studios
          </Link>
          <div className="space-x-2 sm:space-x-4 flex items-center">
            <Button variant="link" asChild className="text-gray-300 hover:text-white p-1 sm:p-2">
              <Link href="#services-section">Services</Link>
            </Button>
            <Button variant="link" asChild className="text-gray-300 hover:text-white p-1 sm:p-2">
              <Link href="#contact-section">Contact Us</Link>
            </Button>
            <Button asChild className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold">
              <Link href="/stratlify-platform">Explore Stratlify</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
