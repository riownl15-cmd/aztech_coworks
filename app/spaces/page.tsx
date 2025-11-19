'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/types/database';
import SpaceFiltersComponent, { SpaceFilters } from '@/components/spaces/space-filters';
import SpaceCard from '@/components/spaces/space-card';

type Location = Database['public']['Tables']['locations']['Row'];
type Space = Database['public']['Tables']['spaces']['Row'];

interface SpaceWithLocation extends Space {
  locations: Location;
}

interface SpaceCardData {
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

export default function SpacesPage() {
  const searchParams = useSearchParams();
  const [spaces, setSpaces] = useState<SpaceWithLocation[]>([]);
  const [filteredSpaces, setFilteredSpaces] = useState<SpaceCardData[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const urlCity = searchParams.get('city') || 'all';
  const urlType = searchParams.get('type') || 'all';

  const [filters, setFilters] = useState<SpaceFilters>({
    city: urlCity,
    type: urlType,
    minPrice: 0,
    maxPrice: 200000,
  });

  useEffect(() => {
    loadSpaces();
  }, []);

  useEffect(() => {
    filterSpaces();
  }, [spaces, filters]);

  const loadSpaces = async () => {
    setLoading(true);

    const { data } = await supabase
      .from('spaces')
      .select('*, locations(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (data) {
      setSpaces(data as SpaceWithLocation[]);

      const uniqueCities = Array.from(
        new Set(data.map((s: any) => s.locations.city))
      ).sort();
      setCities(uniqueCities);
    }

    setLoading(false);
  };

  const filterSpaces = () => {
    let filtered = spaces.filter((space) => {
      if (filters.city !== 'all' && space.locations.city !== filters.city) {
        return false;
      }
      if (filters.type !== 'all' && space.type !== filters.type) {
        return false;
      }
      const price = Number(space.price_per_month);
      if (price < filters.minPrice || price > filters.maxPrice) {
        return false;
      }
      return true;
    });

    const mappedSpaces: SpaceCardData[] = filtered.map((space) => {
      const amenities = space.amenities;
      const amenitiesArray: string[] = Array.isArray(amenities)
        ? amenities.filter((item): item is string => typeof item === 'string')
        : [];

      return {
        id: space.id,
        name: space.name,
        type: space.type,
        capacity: space.capacity,
        price_per_month: Number(space.price_per_month),
        description: space.description || '',
        image_url: space.image_url || '',
        amenities: amenitiesArray,
        location: {
          name: space.locations.name,
          city: space.locations.city,
          address: space.locations.address,
        },
      };
    });

    setFilteredSpaces(mappedSpaces);
  };


  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      <Navbar />

      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white pt-20 w-full overflow-hidden">
        <div className="container mx-auto px-4 py-12 max-w-full">
          <h1 className="text-4xl font-bold mb-2">Browse Workspaces</h1>
          <p className="text-blue-100">Find the perfect space for your next project</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <SpaceFiltersComponent
              filters={filters}
              onFiltersChange={setFilters}
              cities={cities}
            />
          </div>

          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                <p className="mt-4 text-gray-600">Loading spaces...</p>
              </div>
            ) : filteredSpaces.length > 0 ? (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-900">{filteredSpaces.length}</span> {filteredSpaces.length === 1 ? 'space' : 'spaces'} available
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filteredSpaces.map((space) => (
                    <SpaceCard key={space.id} space={space} />
                  ))}
                </div>
              </>
            ) : (
              <div className="py-20 text-center bg-white rounded-lg shadow-sm">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-2">No spaces found matching your criteria</p>
                <p className="text-sm text-gray-500">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}