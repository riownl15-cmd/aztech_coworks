'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MapPin, User, LogOut, LayoutDashboard, Phone, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/contexts/auth-context';
import { useAdmin } from '@/lib/hooks/use-admin';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isTransparent = isHomePage && !scrolled;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
      isTransparent
        ? 'bg-transparent'
        : 'bg-white border-b border-gray-200 shadow-md'
    }`}>
      <div className="container mx-auto flex h-20 items-center justify-between px-4 max-w-full">
        <Link href="/" className="flex items-center">
          <Image
            src="/aztech logo.png"
            alt="Aztech Coworks"
            width={180}
            height={60}
            className={`h-12 w-auto object-contain transition-all duration-300 ${
              isTransparent ? 'brightness-0 invert' : ''
            }`}
            priority
          />
        </Link>

        <div className="hidden lg:flex items-center space-x-6">
          <DropdownMenu>
            <DropdownMenuTrigger className={`flex items-center gap-1 font-medium transition-colors ${
              isTransparent ? 'text-white hover:text-blue-200' : 'text-gray-700 hover:text-blue-600'
            }`}>
              Our Services <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href="/spaces?type=hotdesk">Coworking Spaces</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/spaces?type=private_office">Private Offices</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/spaces?type=meeting_room">Meeting Rooms</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/spaces" className={`font-medium transition-colors ${
            isTransparent ? 'text-white hover:text-blue-200' : 'text-gray-700 hover:text-blue-600'
          }`}>
            Browse Spaces
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          <a href="tel:+919599870871" className={`hidden lg:flex items-center gap-2 px-4 py-2 border-2 rounded-lg transition-colors ${
            isTransparent
              ? 'border-white text-white hover:bg-white/10'
              : 'border-blue-600 text-blue-600 hover:bg-blue-50'
          }`}>
            <Phone className="h-4 w-4" />
            <span className="font-medium">+91 9599870871</span>
          </a>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`flex items-center gap-2 font-medium transition-colors hover:opacity-80 ${
                  isTransparent ? 'text-white' : 'text-gray-700'
                }`}>
                  <User className="h-5 w-5" />
                  <span>{profile?.full_name || 'Account'}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/bookings" className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    My Bookings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer text-blue-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/signin">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8">
                LOGIN
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}