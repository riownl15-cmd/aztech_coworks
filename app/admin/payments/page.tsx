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
import { CreditCard, Search, Eye, RefreshCw, AlertCircle } from 'lucide-react';

type Payment = Database['public']['Tables']['payments']['Row'];
type Booking = Database['public']['Tables']['bookings']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Space = Database['public']['Tables']['spaces']['Row'];
type Location = Database['public']['Tables']['locations']['Row'];

interface PaymentWithDetails extends Payment {
  bookings: Booking & {
    profiles: Profile;
    spaces: Space & {
      locations: Location;
    };
  };
}

export default function PaymentsManagement() {
  const { isAdmin, loading: authLoading } = useAdmin();
  
  const router = useRouter();
  const { toast } = useToast();

  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithDetails | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        router.push('/admin/login');
      } else {
        loadPayments();
      }
    }
  }, [isAdmin, authLoading]);

  useEffect(() => {
    filterPayments();
  }, [payments, searchQuery, statusFilter]);

  const loadPayments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        bookings(
          *,
          profiles(id, email, full_name, phone),
          spaces(
            *,
            locations(*)
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load payments',
        variant: 'destructive',
      });
    } else if (data) {
      setPayments(data as PaymentWithDetails[]);
    }
    setLoading(false);
  };

  const filterPayments = () => {
    let filtered = [...payments];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (payment) =>
          payment.razorpay_payment_id?.toLowerCase().includes(query) ||
          payment.razorpay_order_id?.toLowerCase().includes(query) ||
          payment.bookings.profiles.email.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((payment) => payment.status === statusFilter);
    }

    setFilteredPayments(filtered);
  };

  const handleRefund = async (paymentId: string) => {
    if (!confirm('Are you sure you want to mark this payment as refunded?')) return;

    try {
      const { error } = await supabase
        .from('payments')
        .update({ status: 'refunded' })
        .eq('id', paymentId);

      if (error) throw error;

      const payment = payments.find((p) => p.id === paymentId);
      if (payment) {
        await supabase
          .from('bookings')
          .update({ payment_status: 'refunded' })
          .eq('id', payment.booking_id);
      }

      toast({
        title: 'Payment Refunded',
        description: 'Payment has been marked as refunded successfully',
      });

      loadPayments();
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
      case 'captured':
        return 'bg-green-100 text-green-800';
      case 'authorized':
        return 'bg-blue-100 text-blue-800';
      case 'created':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateStats = () => {
    const totalRevenue = payments
      .filter((p) => p.status === 'captured')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const pendingAmount = payments
      .filter((p) => p.status === 'created' || p.status === 'authorized')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const refundedAmount = payments
      .filter((p) => p.status === 'refunded')
      .reduce((sum, p) => sum + Number(p.refund_amount || p.amount), 0);

    return { totalRevenue, pendingAmount, refundedAmount };
  };

  const stats = calculateStats();

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-8 pt-24">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
              <p className="mt-2 text-gray-600">View and manage all payment transactions</p>
            </div>
            <Button onClick={loadPayments} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{payments.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ₹{stats.totalRevenue.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  ₹{stats.pendingAmount.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Refunded</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  ₹{stats.refundedAmount.toLocaleString()}
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
                      placeholder="Search by payment ID, order ID, or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="w-full md:w-48">
                  <Label htmlFor="status">Payment Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="created">Created</SelectItem>
                      <SelectItem value="authorized">Authorized</SelectItem>
                      <SelectItem value="captured">Captured</SelectItem>
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
                      <TableHead>Payment ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Space</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          No payments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-mono text-xs">
                            {payment.razorpay_payment_id?.slice(0, 16) || 'N/A'}...
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {payment.bookings.profiles.full_name || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {payment.bookings.profiles.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div>{payment.bookings.spaces.name}</div>
                              <div className="text-sm text-gray-500">
                                {payment.bookings.spaces.locations.city}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {payment.razorpay_order_id?.slice(0, 16) || 'N/A'}...
                          </TableCell>
                          <TableCell className="font-semibold">
                            ₹{Number(payment.amount).toLocaleString()}
                            <div className="text-xs text-gray-500">{payment.currency}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(payment.status)}>
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(payment.created_at), 'MMM dd, yyyy HH:mm')}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPayment(payment);
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
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>View and manage payment information</DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Payment ID</Label>
                  <p className="font-mono text-sm">{selectedPayment.id}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Created</Label>
                  <p>{format(new Date(selectedPayment.created_at), 'MMM dd, yyyy HH:mm')}</p>
                </div>
              </div>

              <div>
                <Label className="text-gray-600">Customer Information</Label>
                <div className="mt-2 space-y-1">
                  <p className="font-medium">
                    {selectedPayment.bookings.profiles.full_name || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedPayment.bookings.profiles.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedPayment.bookings.profiles.phone || 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-gray-600">Booking Information</Label>
                <div className="mt-2 space-y-1">
                  <p className="font-medium">{selectedPayment.bookings.spaces.name}</p>
                  <p className="text-sm text-gray-600">
                    {selectedPayment.bookings.spaces.locations.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(selectedPayment.bookings.start_time), 'MMM dd, yyyy HH:mm')}{' '}
                    - {format(new Date(selectedPayment.bookings.end_time), 'HH:mm')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Amount</Label>
                  <p className="text-2xl font-bold">
                    ₹{Number(selectedPayment.amount).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">{selectedPayment.currency}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Status</Label>
                  <div className="mt-2">
                    <Badge className={getStatusColor(selectedPayment.status)}>
                      {selectedPayment.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-gray-600">Razorpay Details</Label>
                <div className="mt-2 space-y-2 text-sm">
                  {selectedPayment.razorpay_order_id && (
                    <div>
                      <span className="text-gray-600">Order ID: </span>
                      <span className="font-mono">{selectedPayment.razorpay_order_id}</span>
                    </div>
                  )}
                  {selectedPayment.razorpay_payment_id && (
                    <div>
                      <span className="text-gray-600">Payment ID: </span>
                      <span className="font-mono">{selectedPayment.razorpay_payment_id}</span>
                    </div>
                  )}
                  {selectedPayment.razorpay_signature && (
                    <div>
                      <span className="text-gray-600">Signature: </span>
                      <span className="font-mono text-xs break-all">
                        {selectedPayment.razorpay_signature}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {selectedPayment.status === 'refunded' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-purple-900">Refunded</p>
                      {selectedPayment.refund_amount && (
                        <p className="text-sm text-purple-700">
                          Refund Amount: ₹{Number(selectedPayment.refund_amount).toLocaleString()}
                        </p>
                      )}
                      {selectedPayment.refund_id && (
                        <p className="text-sm text-purple-700 font-mono">
                          Refund ID: {selectedPayment.refund_id}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedPayment.status === 'captured' && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => handleRefund(selectedPayment.id)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Mark as Refunded
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
