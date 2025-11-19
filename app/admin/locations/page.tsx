'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminNavbar } from '@/components/layout/admin-navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAdmin } from '@/lib/hooks/use-admin';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/lib/types/database';
import { MapPin, Plus, Edit, Trash2 } from 'lucide-react';

type Location = Database['public']['Tables']['locations']['Row'];

export default function LocationsManagement() {
  const { isAdmin, loading: authLoading } = useAdmin();
  const router = useRouter();
  const { toast } = useToast();

  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    address: '',
    description: '',
    image_url: '',
  });

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        router.push('/admin/login');
      } else {
        loadLocations();
      }
    }
  }, [isAdmin, authLoading]);

  const loadLocations = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('locations')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setLocations(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingLocation) {
        const { error } = await supabase
          .from('locations')
          .update(formData)
          .eq('id', editingLocation.id);

        if (error) throw error;

        toast({
          title: 'Location Updated',
          description: 'Location has been updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('locations')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: 'Location Created',
          description: 'New location has been created successfully',
        });
      }

      setDialogOpen(false);
      resetForm();
      loadLocations();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      city: location.city,
      address: location.address,
      description: location.description || '',
      image_url: location.image_url || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return;

    try {
      const { error } = await supabase
        .from('locations')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Location Deleted',
        description: 'Location has been deactivated',
      });

      loadLocations();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      city: '',
      address: '',
      description: '',
      image_url: '',
    });
    setEditingLocation(null);
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Locations</h1>
            <p className="mt-2 text-gray-600">Add and manage workspace locations</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Location
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingLocation ? 'Edit Location' : 'Add New Location'}</DialogTitle>
                <DialogDescription>
                  {editingLocation ? 'Update location details' : 'Create a new workspace location'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Location Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingLocation ? 'Update' : 'Create'} Location
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <Card key={location.id} className={!location.is_active ? 'opacity-50' : ''}>
              <div className="relative h-40 bg-gradient-to-br from-blue-100 to-blue-200">
                {location.image_url ? (
                  <img
                    src={location.image_url}
                    alt={location.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-blue-600">
                    <MapPin className="h-8 w-8" />
                  </div>
                )}
                {!location.is_active && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-semibold">
                    Inactive
                  </div>
                )}
              </div>

              <CardHeader>
                <CardTitle>{location.name}</CardTitle>
                <CardDescription>{location.city}</CardDescription>
              </CardHeader>

              <CardContent>
                <p className="mb-4 text-sm text-gray-600">{location.address}</p>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(location)}>
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  {location.is_active && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(location.id)}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Delete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}