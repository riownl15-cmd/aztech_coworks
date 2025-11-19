'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/auth-context';
import { Database } from '@/lib/types/database';
import { MapPin, Clock, Calendar, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

type Booking = Database['public']['Tables']['bookings']['Row'];
type Space = Database['public']['Tables']['spaces']['Row'];
type Location = Database['public']['Tables']['locations']['Row'];

interface BookingWithDetails extends Booking {
  spaces: Space & { locations: Location };
}

export default function BookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    } else if (user) {
      loadBookings();
    }
  }, [user, authLoading]);

  const loadBookings = async () => {
    setLoading(true);

    const { data } = await supabase
      .from('bookings')
      .select('*, spaces(*, locations(*))')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (data) {
      setBookings(data as BookingWithDetails[]);
    }

    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      confirmed: 'default',
      cancelled: 'destructive',
      completed: 'outline',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      paid: 'default',
      failed: 'destructive',
      refunded: 'outline',
    };

    const colors: Record<string, string> = {
      pending: 'bg-yellow-500',
      paid: 'bg-green-500',
      failed: 'bg-red-500',
      refunded: 'bg-gray-500',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-full">
          <p>Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      <Navbar />

      <div className="container mx-auto px-4 py-8 pt-24 max-w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="mt-2 text-gray-600">View and manage your workspace bookings</p>
        </div>

        {bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{booking.spaces.name}</CardTitle>
                      <CardDescription className="mt-1 flex items-center">
                        <MapPin className="mr-1 h-3 w-3" />
                        {booking.spaces.locations.name}, {booking.spaces.locations.city}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(booking.status)}
                      {getPaymentBadge(booking.payment_status)}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">Date</div>
                        <div className="text-gray-600">
                          {format(new Date(booking.start_time), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center text-sm">
                      <Clock className="mr-2 h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">Time</div>
                        <div className="text-gray-600">
                          {format(new Date(booking.start_time), 'HH:mm')} -{' '}
                          {format(new Date(booking.end_time), 'HH:mm')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center text-sm">
                      <Clock className="mr-2 h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">Duration</div>
                        <div className="text-gray-600">{booking.total_hours} hours</div>
                      </div>
                    </div>

                    <div className="flex items-center text-sm">
                      <CreditCard className="mr-2 h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">Total</div>
                        <div className="text-lg font-bold text-blue-600">₹{booking.total_amount}</div>
                      </div>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="mt-4 rounded-lg bg-gray-50 p-3">
                      <div className="text-xs font-medium text-gray-700">Notes</div>
                      <div className="text-sm text-gray-600">{booking.notes}</div>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    {booking.status === 'confirmed' && booking.payment_status === 'paid' && (
                      <Button variant="outline" size="sm">
                        Download Receipt
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="mb-4 text-gray-600">You don't have any bookings yet.</p>
              <Button onClick={() => router.push('/spaces')}>Browse Spaces</Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
}