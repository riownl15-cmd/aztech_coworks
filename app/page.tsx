'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/types/database';
import { MapPin, Users, Clock, Search, Briefcase, Coffee, Building, Calendar, ChevronDown, Star, Quote } from 'lucide-react';
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

export default function HomePage() {
  const [featuredSpaces, setFeaturedSpaces] = useState<SpaceWithLocation[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFeaturedSpaces();
    loadAvailableCities();
  }, []);

  const loadFeaturedSpaces = async () => {
    const { data } = await supabase
      .from('spaces')
      .select('*, locations(*)')
      .eq('is_active', true)
      .limit(8);

    if (data) {
      setFeaturedSpaces(data as SpaceWithLocation[]);
    }
  };

  const loadAvailableCities = async () => {
    const { data } = await supabase
      .from('locations')
      .select('city')
      .eq('is_active', true);

    if (data) {
      const cities = Array.from(new Set(data.map((loc) => loc.city))).sort();
      setAvailableCities(cities);
    }
  };

  const getSpaceIcon = (type: string) => {
    switch (type) {
      case 'hotdesk':
        return <Coffee className="h-5 w-5" />;
      case 'meeting_room':
        return <Users className="h-5 w-5" />;
      case 'private_office':
        return <Building className="h-5 w-5" />;
      default:
        return <Briefcase className="h-5 w-5" />;
    }
  };

  const formatSpaceType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const [selectedCity, setSelectedCity] = useState('');
  const [capacity, setCapacity] = useState('');
  const [spaceType, setSpaceType] = useState('');

  const spaceTypes = [
    { value: 'hotdesk', label: 'Hot Desk' },
    { value: 'meeting_room', label: 'Meeting Room' },
    { value: 'private_office', label: 'Private Office' },
  ];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedCity) params.append('city', selectedCity);
    if (spaceType) params.append('type', spaceType);
    if (capacity) params.append('capacity', capacity);

    const queryString = params.toString();
    window.location.href = queryString ? `/spaces?${queryString}` : '/spaces';
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="relative text-white overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700"></div>
        <div className="container relative mx-auto px-4 py-32 md:py-40">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white drop-shadow-lg mb-4">
                Find Your Perfect Workspace
              </h1>
              <p className="text-xl text-white/95 drop-shadow">
                Book flexible workspaces across metros and non-metros
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10">
                <div className="p-4 sm:p-6 md:p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-4">
                    <div className="space-y-2.5">
                      <label className="text-sm sm:text-base font-medium text-gray-700 block">Location</label>
                      <div className="relative z-30">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                        <select
                          value={selectedCity}
                          onChange={(e) => setSelectedCity(e.target.value)}
                          className="w-full pl-11 pr-10 py-3.5 sm:py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white cursor-pointer transition-all hover:border-gray-400"
                        >
                          <option value="">Select City</option>
                          {availableCities.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <label className="text-sm sm:text-base font-medium text-gray-700 block">Workspace Type</label>
                      <div className="relative z-20">
                        <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                        <select
                          value={spaceType}
                          onChange={(e) => setSpaceType(e.target.value)}
                          className="w-full pl-11 pr-10 py-3.5 sm:py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white cursor-pointer transition-all hover:border-gray-400"
                        >
                          <option value="">All Workspace Types</option>
                          {spaceTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2.5 sm:col-span-2 lg:col-span-1">
                      <label className="text-sm sm:text-base font-medium text-gray-700 block">Capacity</label>
                      <div className="relative z-10">
                        <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                        <input
                          type="number"
                          value={capacity}
                          onChange={(e) => setCapacity(e.target.value)}
                          placeholder="Enter number of people"
                          min="1"
                          className="w-full pl-11 pr-4 py-3.5 sm:py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all hover:border-gray-400"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSearch}
                    type="button"
                    className="w-full py-3.5 sm:py-4 text-base sm:text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98] hover:shadow-xl"
                  >
                    Search Workspaces
                  </button>
                </div>
              </div>

              <div className="mt-12 text-center space-y-6">
                <p className="text-white/95 font-semibold text-xl">Available Cities</p>
                <div className="flex justify-center gap-4 max-w-2xl mx-auto">
                  <Link
                    href="/spaces?city=Coimbatore"
                    className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="w-24 h-24 relative">
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url("https://images.pexels.com/photos/1105766/pexels-photo-1105766.jpeg?auto=compress&cs=tinysrgb&w=200")`
                        }}
                      ></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute bottom-1.5 left-0 right-0 text-center">
                        <p className="text-white text-xs font-semibold drop-shadow">Coimbatore</p>
                      </div>
                    </div>
                  </Link>
                  <Link
                    href="/spaces?city=Erode"
                    className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="w-24 h-24 relative">
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url("https://images.pexels.com/photos/2104152/pexels-photo-2104152.jpeg?auto=compress&cs=tinysrgb&w=200")`
                        }}
                      ></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute bottom-1.5 left-0 right-0 text-center">
                        <p className="text-white text-xs font-semibold drop-shadow">Erode</p>
                      </div>
                    </div>
                  </Link>
                  <Link
                    href="/spaces?city=Salem"
                    className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="w-24 h-24 relative">
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url("https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=200")`
                        }}
                      ></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute bottom-1.5 left-0 right-0 text-center">
                        <p className="text-white text-xs font-semibold drop-shadow">Salem</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              Upgrade your office space in <span className="text-blue-600">4</span> simple steps
            </h2>
          </div>

          <div className="flex justify-center items-center gap-8 mb-20">
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold">
                01
              </div>
              <p className="font-semibold text-gray-900">Search For a Space</p>
            </div>

            <div className="hidden md:block w-32 border-t-2 border-dashed border-gray-300"></div>

            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold">
                02
              </div>
              <p className="font-semibold text-gray-900">Arrange a Viewing</p>
            </div>

            <div className="hidden md:block w-32 border-t-2 border-dashed border-gray-300"></div>

            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold">
                03
              </div>
              <p className="font-semibold text-gray-900">Finalize Your Space</p>
            </div>

            <div className="hidden md:block w-32 border-t-2 border-dashed border-gray-300"></div>

            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold">
                04
              </div>
              <p className="font-semibold text-gray-900">Move In</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="mb-8 text-3xl font-bold text-gray-900">
              Featured Workspaces
            </h2>

            <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
              <button className="whitespace-nowrap px-6 py-2.5 rounded-full bg-blue-600 text-white font-medium shadow-md flex items-center gap-2">
                Coworking Space
                <span className="bg-white text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  ℹ
                </span>
              </button>
              <button className="whitespace-nowrap px-6 py-2.5 rounded-full border-2 border-gray-300 text-gray-700 font-medium hover:border-blue-600 hover:text-blue-600 transition-all flex items-center gap-2">
                Private Office
                <span className="bg-gray-200 text-gray-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  ℹ
                </span>
              </button>
              <button className="whitespace-nowrap px-6 py-2.5 rounded-full border-2 border-gray-300 text-gray-700 font-medium hover:border-blue-600 hover:text-blue-600 transition-all flex items-center gap-2">
                Virtual Office
                <span className="bg-gray-200 text-gray-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  ℹ
                </span>
              </button>
              <button className="whitespace-nowrap px-6 py-2.5 rounded-full border-2 border-gray-300 text-gray-700 font-medium hover:border-blue-600 hover:text-blue-600 transition-all flex items-center gap-2">
                Meeting Room
                <span className="bg-gray-200 text-gray-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  ℹ
                </span>
              </button>
              <button className="whitespace-nowrap px-6 py-2.5 rounded-full border-2 border-gray-300 text-gray-700 font-medium hover:border-blue-600 hover:text-blue-600 transition-all flex items-center gap-2">
                Training Room
                <span className="bg-gray-200 text-gray-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  ℹ
                </span>
              </button>
            </div>
          </div>

          {featuredSpaces.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {featuredSpaces.map((space) => {
                const amenities = space.amenities;
                const amenitiesArray: string[] = Array.isArray(amenities)
                  ? amenities.filter((item): item is string => typeof item === 'string')
                  : [];

                const spaceData: SpaceCardData = {
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
                return <SpaceCard key={space.id} space={spaceData} />;
              })}
            </div>
          ) : (
            <div className="text-center text-gray-600 py-12">
              <p>No spaces available at the moment.</p>
            </div>
          )}

          <div className="mt-12 text-center">
            <Link href="/spaces">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                View All Workspaces
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Trusted by Leading Indian Companies
            </h2>
            <p className="text-gray-600 text-lg">
              Join thousands of businesses that trust us for their workspace needs
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent z-10"></div>

            <div className="flex overflow-hidden">
              <div className="flex animate-scroll">
                <div className="flex items-center gap-16 px-8">
                  <div className="flex items-center justify-center w-48 h-24 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/9/95/TCS_Logo.svg"
                      alt="TCS"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center w-48 h-24 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg"
                      alt="Infosys"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center w-48 h-24 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg"
                      alt="Wipro"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center w-48 h-24 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg"
                      alt="HDFC Bank"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center w-48 h-24 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/3/38/Mahindra_and_Mahindra_Logo.svg"
                      alt="Mahindra"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center w-48 h-24 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/f/ff/Reliance_Industries_Logo.svg"
                      alt="Reliance"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center w-48 h-24 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/8/8e/Tata_logo.svg"
                      alt="Tata Group"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center w-48 h-24 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/4/42/Flipkart.svg"
                      alt="Flipkart"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center w-48 h-24 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/e/e9/Tech_Mahindra_New_Logo.svg"
                      alt="Tech Mahindra"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center w-48 h-24 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/7/74/Zomato_logo.svg"
                      alt="Zomato"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-16 px-8">
                  <div className="flex items-center justify-center w-48 h-24 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/9/95/TCS_Logo.svg"
                      alt="TCS"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center w-48 h-24 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg"
                      alt="Infosys"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center w-48 h-24 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg"
                      alt="Wipro"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center w-48 h-24 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg"
                      alt="HDFC Bank"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center w-48 h-24 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/3/38/Mahindra_and_Mahindra_Logo.svg"
                      alt="Mahindra"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center w-48 h-24 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/f/ff/Reliance_Industries_Logo.svg"
                      alt="Reliance"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center w-48 h-24 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/8/8e/Tata_logo.svg"
                      alt="Tata Group"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center w-48 h-24 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/4/42/Flipkart.svg"
                      alt="Flipkart"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center w-48 h-24 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/e/e9/Tech_Mahindra_New_Logo.svg"
                      alt="Tech Mahindra"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center w-48 h-24 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/7/74/Zomato_logo.svg"
                      alt="Zomato"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              What Our Clients Say
            </h2>
            <p className="text-gray-600 text-lg">
              Hear from businesses that transformed their workspace experience
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <Quote className="w-10 h-10 text-blue-600 mb-4 opacity-20" />
              <p className="text-gray-700 mb-6 leading-relaxed">
                The workspace solutions provided have been exceptional. Our team productivity has increased significantly since we moved to their coworking space in Coimbatore.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  RK
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Rajesh Kumar</p>
                  <p className="text-sm text-gray-600">CEO, TechStart Solutions</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <Quote className="w-10 h-10 text-blue-600 mb-4 opacity-20" />
              <p className="text-gray-700 mb-6 leading-relaxed">
                Excellent facilities and professional environment. The flexible booking system makes it easy to scale our workspace needs as our business grows.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-lg">
                  PS
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Priya Sharma</p>
                  <p className="text-sm text-gray-600">Founder, Digital Marketing Hub</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <Quote className="w-10 h-10 text-blue-600 mb-4 opacity-20" />
              <p className="text-gray-700 mb-6 leading-relaxed">
                Perfect for our remote team! The meeting rooms are well-equipped and the location is convenient. Highly recommend for startups and SMEs.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-lg">
                  AM
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Arun Murugan</p>
                  <p className="text-sm text-gray-600">Director, Innovation Labs</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <Quote className="w-10 h-10 text-blue-600 mb-4 opacity-20" />
              <p className="text-gray-700 mb-6 leading-relaxed">
                Amazing workspace with all modern amenities. The community here is supportive and the networking opportunities are invaluable for our business growth.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  SK
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Sneha Krishnan</p>
                  <p className="text-sm text-gray-600">Co-Founder, FinTech Ventures</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <Quote className="w-10 h-10 text-blue-600 mb-4 opacity-20" />
              <p className="text-gray-700 mb-6 leading-relaxed">
                Cost-effective and professional. We've been using their private offices for 6 months and couldn't be happier with the service and support provided.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-lg">
                  VR
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Vikram Reddy</p>
                  <p className="text-sm text-gray-600">Managing Partner, Consulting Group</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <Quote className="w-10 h-10 text-blue-600 mb-4 opacity-20" />
              <p className="text-gray-700 mb-6 leading-relaxed">
                The best coworking space in the region! Clean, modern, and the staff is always helpful. It's become our second home for business operations.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-lg">
                  MP
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Meera Patel</p>
                  <p className="text-sm text-gray-600">CEO, Creative Studios</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,0,255,0.2),transparent_50%)]"></div>
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
              Ready to Find Your Perfect Workspace?
            </h2>
            <p className="text-xl text-white/95 drop-shadow">
              Join thousands of professionals and businesses finding flexible workspace solutions
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
              <Link href="/spaces">
                <Button size="lg" className="bg-white hover:bg-gray-100 text-blue-600 px-12 py-6 text-lg font-medium shadow-xl w-full sm:w-auto">
                  Explore Workspaces
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button size="lg" variant="outline" className="bg-transparent hover:bg-white/10 text-white px-12 py-6 text-lg font-medium border-2 border-white w-full sm:w-auto">
                  Get Started Free
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">100+</div>
                <div className="text-white/80">Locations</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">500+</div>
                <div className="text-white/80">Workspaces</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">10K+</div>
                <div className="text-white/80">Happy Users</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
