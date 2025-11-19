'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminNavbar } from '@/components/layout/admin-navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAdmin } from '@/lib/hooks/use-admin';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/lib/types/database';
import { Plus, Edit, Trash2, Users, Coffee, Building } from 'lucide-react';

type Location = Database['public']['Tables']['locations']['Row'];
type Space = Database['public']['Tables']['spaces']['Row'];

interface SpaceWithLocation extends Space {
  locations: Location;
}

export default function SpacesManagement() {
  const { isAdmin, loading: authLoading } = useAdmin();
  const router = useRouter();
  const { toast } = useToast();

  const [spaces, setSpaces] = useState<SpaceWithLocation[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [formData, setFormData] = useState({
    location_id: '',
    name: '',
    type: 'hotdesk' as 'hotdesk' | 'meeting_room' | 'private_office',
    capacity: 1,
    price_per_month: 0,
    description: '',
    image_url: '',
  });

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        router.push('/admin/login');
      } else {
        loadData();
      }
    }
  }, [isAdmin, authLoading]);

  const loadData = async () => {
    setLoading(true);

    const [spacesRes, locationsRes] = await Promise.all([
      supabase.from('spaces').select('*, locations(*)').order('created_at', { ascending: false }),
      supabase.from('locations').select('*').eq('is_active', true),
    ]);

    if (spacesRes.data) setSpaces(spacesRes.data as SpaceWithLocation[]);
    if (locationsRes.data) setLocations(locationsRes.data);

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingSpace) {
        const { error } = await supabase
          .from('spaces')
          .update(formData)
          .eq('id', editingSpace.id);

        if (error) throw error;

        toast({
          title: 'Space Updated',
          description: 'Space has been updated successfully',
        });
      } else {
        const { error } = await supabase.from('spaces').insert([formData]);

        if (error) throw error;

        toast({
          title: 'Space Created',
          description: 'New space has been created successfully',
        });
      }

      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (space: Space) => {
    setEditingSpace(space);
    setFormData({
      location_id: space.location_id,
      name: space.name,
      type: space.type,
      capacity: space.capacity,
      price_per_month: space.price_per_month,
      description: space.description || '',
      image_url: space.image_url || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this space?')) return;

    try {
      const { error } = await supabase
        .from('spaces')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Space Deleted',
        description: 'Space has been deactivated',
      });

      loadData();
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
      location_id: '',
      name: '',
      type: 'hotdesk',
      capacity: 1,
      price_per_month: 0,
      description: '',
      image_url: '',
    });
    setEditingSpace(null);
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
        return <Coffee className="h-5 w-5" />;
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Spaces</h1>
            <p className="mt-2 text-gray-600">Add and manage workspace spaces</p>
          </div>

          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Space
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingSpace ? 'Edit Space' : 'Add New Space'}</DialogTitle>
                <DialogDescription>
                  {editingSpace ? 'Update space details' : 'Create a new workspace space'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location_id">Location</Label>
                  <Select
                    value={formData.location_id}
                    onValueChange={(value) => setFormData({ ...formData, location_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name} - {location.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Space Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Space Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hotdesk">Hot Desk</SelectItem>
                        <SelectItem value="meeting_room">Meeting Room</SelectItem>
                        <SelectItem value="private_office">Private Office</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({ ...formData, capacity: parseInt(e.target.value) })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price_per_month">Price per Month (₹)</Label>
                    <Input
                      id="price_per_month"
                      type="number"
                      min="0"
                      step="100"
                      value={formData.price_per_month}
                      onChange={(e) =>
                        setFormData({ ...formData, price_per_month: parseFloat(e.target.value) })
                      }
                      required
                    />
                  </div>
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
                  <Button type="submit">{editingSpace ? 'Update' : 'Create'} Space</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {spaces.map((space) => (
            <Card key={space.id} className={!space.is_active ? 'opacity-50' : ''}>
              <div className="relative h-40 bg-gradient-to-br from-blue-100 to-blue-200">
                {space.image_url ? (
                  <img
                    src={space.image_url}
                    alt={space.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-blue-600">
                    {getSpaceIcon(space.type)}
                  </div>
                )}
                {!space.is_active && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-semibold">
                    Inactive
                  </div>
                )}
                <div className="absolute right-2 top-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-blue-600">
                  ₹{space.price_per_month.toLocaleString()}/mo
                </div>
              </div>

              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{space.name}</span>
                  {getSpaceIcon(space.type)}
                </CardTitle>
                <CardDescription>
                  {space.locations.name} • Capacity: {space.capacity}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {space.description && (
                  <p className="mb-4 line-clamp-2 text-sm text-gray-600">{space.description}</p>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(space)}>
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  {space.is_active && (
                    <Button variant="outline" size="sm" onClick={() => handleDelete(space.id)}>
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