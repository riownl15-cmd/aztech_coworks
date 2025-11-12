'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, IndianRupee } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Space {
  id: string;
  name: string;
  type: string;
  capacity: number;
  price_per_month: number;
  description: string;
  image_url: string;
  amenities: string[];
  location: {
    name: string;
    city: string;
    address: string;
  };
}

interface SpaceCardProps {
  space: Space;
}

export default function SpaceCard({ space }: SpaceCardProps) {
  return (
    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 shadow-lg bg-white rounded-2xl">
      <div className="relative h-64 sm:h-72 md:h-80 overflow-hidden">
        <Image
          src={space.image_url}
          alt={space.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {space.name}
          </h3>

          <div className="flex items-center text-sm sm:text-base text-gray-600">
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 flex-shrink-0 text-blue-600" />
            <span className="line-clamp-1">{space.location.city}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-gray-500">Starting from</p>
            <div className="flex items-baseline gap-1">
              <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 font-bold" />
              <span className="text-2xl sm:text-3xl font-bold text-red-600">
                {space.price_per_month.toLocaleString()}
              </span>
              <span className="text-sm sm:text-base text-gray-500 font-medium">/month</span>
            </div>
          </div>

          <Link href={`/spaces/${space.id}`} className="flex-shrink-0">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
            >
              Book Now
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
