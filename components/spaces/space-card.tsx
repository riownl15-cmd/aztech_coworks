'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Wifi, Calendar, IndianRupee } from 'lucide-react';
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

const spaceTypeLabels: Record<string, string> = {
  hotdesk: 'Hot Desk',
  meeting_room: 'Meeting Room',
  private_office: 'Private Office',
};

const spaceTypeColors: Record<string, string> = {
  hotdesk: 'bg-green-100 text-green-700 border-green-200',
  meeting_room: 'bg-blue-100 text-blue-700 border-blue-200',
  private_office: 'bg-purple-100 text-purple-700 border-purple-200',
};

export default function SpaceCard({ space }: SpaceCardProps) {
  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md">
      <div className="relative h-56 overflow-hidden bg-gray-100">
        <Image
          src={space.image_url}
          alt={space.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-4 left-4">
          <Badge className={`${spaceTypeColors[space.type]} border font-medium`}>
            {spaceTypeLabels[space.type]}
          </Badge>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {space.name}
            </h3>
            <div className="flex items-start text-sm text-gray-600 mb-3">
              <MapPin className="h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-1">{space.location.city}</span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {space.description}
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 pt-3 border-t">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1.5" />
              <span>{space.capacity} {space.capacity === 1 ? 'Person' : 'People'}</span>
            </div>
            {space.amenities.includes('WiFi') && (
              <div className="flex items-center">
                <Wifi className="h-4 w-4 mr-1.5" />
                <span>WiFi</span>
              </div>
            )}
          </div>

          <div className="flex items-end justify-between pt-4 border-t">
            <div>
              <div className="flex items-baseline gap-1">
                <IndianRupee className="h-5 w-5 text-blue-600" />
                <span className="text-3xl font-bold text-gray-900">{space.price_per_month.toLocaleString()}</span>
                <span className="text-sm text-gray-500">/month</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Starting from</p>
            </div>
            <Link href={`/spaces/${space.id}`}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Calendar className="h-4 w-4 mr-2" />
                Book Now
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
