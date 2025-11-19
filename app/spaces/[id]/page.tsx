'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/lib/types/database';
import { MapPin, Users, Clock, Wifi, Coffee, Shield, CreditCard } from 'lucide-react';
import { format, addHours, setHours, setMinutes } from 'date-fns';

type Location = Database['public']['Tables']['locations']['Row'];
type Space = Database['public']['Tables']['spaces']['Row'];

interface SpaceWithLocation extends Space {
  locations: Location;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SpaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [space, setSpace] = useState<SpaceWithLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState<Date | undefined>(new Date());
  const [startHour, setStartHour] = useState('09');
  const [duration, setDuration] = useState('1');
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadSpace();
  }, [params.id]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const loadSpace = async () => {
    setLoading(true);

    const { data } = await supabase
      .from('spaces')
      .select('*, locations(*)')
      .eq('id', params.id)
      .eq('is_active', true)
      .maybeSingle();

    if (data) {
      setSpace(data as SpaceWithLocation);
    }

    setLoading(false);
  };

  const calculateTotal = () => {
    if (!space) return 0;
    return space.price_per_month;
  };

  const handleBooking = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to book a space',
        variant: 'destructive',
      });
      router.push('/auth/signin');
      return;
    }

    if (!bookingDate) {
      toast({
        title: 'Date Required',
        description: 'Please select a booking date',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);

    try {
      const startTime = setMinutes(setHours(bookingDate, parseInt(startHour)), 0);
      const endTime = addHours(startTime, parseFloat(duration));
      const totalAmount = calculateTotal();

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          space_id: space!.id,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          total_hours: parseFloat(duration),
          total_amount: totalAmount,
          notes,
          status: 'pending',
          payment_status: 'pending',
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          bookingId: booking.id,
        }),
      });

      const { orderId, error: orderError } = await response.json();

      if (orderError) throw new Error(orderError);

      await supabase
        .from('bookings')
        .update({ razorpay_order_id: orderId })
        .eq('id', booking.id);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: totalAmount * 100,
        currency: 'INR',
        name: 'WorkSpace',
        description: `Booking for ${space!.name}`,
        order_id: orderId,
        handler: async function (response: any) {
          await handlePaymentSuccess(booking.id, response);
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: '#2563eb',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      toast({
        title: 'Booking Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentSuccess = async (bookingId: string, paymentData: any) => {
    try {
      await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_signature: paymentData.razorpay_signature,
        }),
      });

      toast({
        title: 'Booking Confirmed',
        description: 'Your space has been booked successfully',
      });

      router.push('/bookings');
    } catch (error: any) {
      toast({
        title: 'Payment Verification Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const hours = Array.from({ length: 14 }, (_, i) => i + 8);
  const durations = ['1', '2', '3', '4', '5', '6', '8', '10'];

  if (loading) {
    return (
      <div className="min-h-screen bg-white w-full overflow-x-hidden">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-full">
          <p>Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!space) {
    return (
      <div className="min-h-screen bg-white w-full overflow-x-hidden">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-full">
          <p>Space not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white w-full overflow-x-hidden">
      <Navbar />

      <div className="container mx-auto px-4 py-8 pt-24 max-w-full">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <div className="relative h-64 bg-gradient-to-br from-blue-100 to-blue-200">
                {space.image_url ? (
                  <img
                    src={space.image_url}
                    alt={space.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-blue-600">
                    <Coffee className="h-12 w-12" />
                  </div>
                )}
              </div>

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{space.name}</CardTitle>
                    <CardDescription className="mt-2 flex items-center">
                      <MapPin className="mr-1 h-4 w-4" />
                      {space.locations.name}, {space.locations.city}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">
                      ₹{space.price_per_month.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">per month</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="mb-6 flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Up to {space.capacity} people</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>Monthly booking</span>
                  </div>
                </div>

                {space.description && (
                  <div className="mb-6">
                    <h3 className="mb-2 font-semibold">Description</h3>
                    <p className="text-gray-600">{space.description}</p>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="mb-3 font-semibold">Amenities</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Wifi className="mr-2 h-4 w-4" />
                      <span>High-Speed WiFi</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Coffee className="mr-2 h-4 w-4" />
                      <span>Coffee & Tea</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Secure Access</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Flexible Payment</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50 p-4">
                  <h3 className="mb-2 font-semibold text-blue-900">Location</h3>
                  <p className="text-sm text-blue-700">{space.locations.address}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Book This Space</CardTitle>
                <CardDescription>Select your booking details</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <Calendar
                    mode="single"
                    selected={bookingDate}
                    onSelect={setBookingDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Select value={startHour} onValueChange={setStartHour}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map((hour) => (
                        <SelectItem key={hour} value={hour.toString().padStart(2, '0')}>
                          {hour}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Duration (months)</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 month</SelectItem>
                      <SelectItem value="3">3 months</SelectItem>
                      <SelectItem value="6">6 months</SelectItem>
                      <SelectItem value="12">12 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    placeholder="Any special requirements?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex justify-between mb-2 text-sm">
                    <span>Price per month</span>
                    <span>₹{space.price_per_month.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mb-2 text-sm">
                    <span>Duration</span>
                    <span>{duration} {duration === '1' ? 'month' : 'months'}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">₹{(space.price_per_month * parseFloat(duration)).toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleBooking}
                  disabled={processing || !bookingDate}
                >
                  {processing ? 'Processing...' : 'Proceed to Payment'}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  By booking, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}