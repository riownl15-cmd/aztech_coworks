'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { AdminNavbar } from '@/components/layout/admin-navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { useAdmin } from '@/lib/hooks/use-admin';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/lib/types/database';
import { Calendar, Search, Filter, Eye, RefreshCw } from 'lucide-react';

type Booking = Database['public']['Tables']['bookings']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Space = Database['public']['Tables']['spaces']['Row'];
type Location = Database['public']['Tables']['locations']['Row'];

interface BookingWithDetails extends Booking {
  profiles: Profile;
  spaces: Space & {
    locations: Location;
  };
}

export default function BookingsManagement() {
  const { isAdmin, loading: authLoading } = useAdmin();
  
  const router = useRouter();
  const { toast } = useToast();

  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        router.push('/admin/login');
      } else {
        loadBookings();
      }
    }
  }, [isAdmin, authLoading]);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchQuery, statusFilter, paymentStatusFilter]);

  const loadBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        profiles(id, email, full_name, phone),
        spaces(
          *,
          locations(*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load bookings',
        variant: 'destructive',
      });
    } else if (data) {
      setBookings(data as BookingWithDetails[]);
    }
    setLoading(false);
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.profiles.email.toLowerCase().includes(query) ||
          booking.profiles.full_name?.toLowerCase().includes(query) ||
          booking.spaces.name.toLowerCase().includes(query) ||
          booking.spaces.locations.name.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    if (paymentStatusFilter !== 'all') {
      filtered = filtered.filter((booking) => booking.payment_status === paymentStatusFilter);
    }

    setFilteredBookings(filtered);
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: 'Booking status has been updated successfully',
      });

      loadBookings();
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-8 pt-24 max-w-full">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      <AdminNavbar />

      <div className="container mx-auto px-4 py-8 pt-24 max-w-full">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Bookings</h1>
              <p className="mt-2 text-gray-600">View and manage all workspace bookings</p>
            </div>
            <Button onClick={loadBookings} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bookings.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Confirmed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {bookings.filter((b) => b.status === 'confirmed').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {bookings.filter((b) => b.status === 'pending').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  ₹{bookings.filter((b) => b.payment_status === 'paid').reduce((sum, b) => sum + Number(b.total_amount), 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by user, space, or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="w-full md:w-48">
                  <Label htmlFor="status">Booking Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full md:w-48">
                  <Label htmlFor="payment">Payment Status</Label>
                  <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Space</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                          No bookings found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-mono text-xs">
                            {booking.id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{booking.profiles.full_name || 'N/A'}</div>
                              <div className="text-sm text-gray-500">{booking.profiles.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{booking.spaces.name}</TableCell>
                          <TableCell>{booking.spaces.locations.name}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{format(new Date(booking.start_time), 'MMM dd, yyyy')}</div>
                              <div className="text-gray-500">
                                {format(new Date(booking.start_time), 'HH:mm')} -{' '}
                                {format(new Date(booking.end_time), 'HH:mm')}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            ₹{Number(booking.total_amount).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPaymentStatusColor(booking.payment_status)}>
                              {booking.payment_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>View and manage booking information</DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Booking ID</Label>
                  <p className="font-mono text-sm">{selectedBooking.id}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Created</Label>
                  <p>{format(new Date(selectedBooking.created_at), 'MMM dd, yyyy HH:mm')}</p>
                </div>
              </div>

              <div>
                <Label className="text-gray-600">Customer Information</Label>
                <div className="mt-2 space-y-1">
                  <p className="font-medium">{selectedBooking.profiles.full_name || 'N/A'}</p>
                  <p className="text-sm text-gray-600">{selectedBooking.profiles.email}</p>
                  <p className="text-sm text-gray-600">{selectedBooking.profiles.phone || 'N/A'}</p>
                </div>
              </div>

              <div>
                <Label className="text-gray-600">Space Information</Label>
                <div className="mt-2 space-y-1">
                  <p className="font-medium">{selectedBooking.spaces.name}</p>
                  <p className="text-sm text-gray-600">{selectedBooking.spaces.locations.name}</p>
                  <p className="text-sm text-gray-600">{selectedBooking.spaces.locations.address}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Start Time</Label>
                  <p>{format(new Date(selectedBooking.start_time), 'MMM dd, yyyy HH:mm')}</p>
                </div>
                <div>
                  <Label className="text-gray-600">End Time</Label>
                  <p>{format(new Date(selectedBooking.end_time), 'MMM dd, yyyy HH:mm')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Total Hours</Label>
                  <p className="font-semibold">{Number(selectedBooking.total_hours)} hours</p>
                </div>
                <div>
                  <Label className="text-gray-600">Total Amount</Label>
                  <p className="font-semibold text-lg">₹{Number(selectedBooking.total_amount).toLocaleString()}</p>
                </div>
              </div>

              {selectedBooking.notes && (
                <div>
                  <Label className="text-gray-600">Notes</Label>
                  <p className="text-sm mt-1">{selectedBooking.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Booking Status</Label>
                  <Select
                    value={selectedBooking.status}
                    onValueChange={(value) =>
                      handleStatusUpdate(selectedBooking.id, value)
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-600">Payment Status</Label>
                  <div className="mt-2">
                    <Badge className={getPaymentStatusColor(selectedBooking.payment_status)}>
                      {selectedBooking.payment_status}
                    </Badge>
                  </div>
                </div>
              </div>

              {selectedBooking.razorpay_order_id && (
                <div>
                  <Label className="text-gray-600">Payment Details</Label>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>Order ID: <span className="font-mono">{selectedBooking.razorpay_order_id}</span></p>
                    {selectedBooking.razorpay_payment_id && (
                      <p>Payment ID: <span className="font-mono">{selectedBooking.razorpay_payment_id}</span></p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
