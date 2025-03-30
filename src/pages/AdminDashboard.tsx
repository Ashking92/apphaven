
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AppCard from '@/components/AppCard';

const AdminDashboard = () => {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    developer: '',
    category: 'Productivity',
    description: '',
    version: '1.0.0',
    is_free: true,
    price: '',
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    fetchApps();

    // Set up real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'apps'
        },
        () => {
          fetchApps();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, navigate]);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApps(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching apps',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const appData = {
        ...formData,
        is_free: formData.is_free,
        price: formData.is_free ? null : formData.price,
        features: [],
        uploaded_by: user?.id,
      };

      const { error } = await supabase
        .from('apps')
        .insert(appData);

      if (error) throw error;

      toast({
        title: 'App uploaded successfully',
        description: 'Your app has been added to the store.',
      });

      setFormData({
        name: '',
        developer: '',
        category: 'Productivity',
        description: '',
        version: '1.0.0',
        is_free: true,
        price: '',
      });

      setShowForm(false);
      fetchApps();
    } catch (error: any) {
      toast({
        title: 'Error uploading app',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteApp = async (id: string) => {
    try {
      const { error } = await supabase
        .from('apps')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'App deleted',
        description: 'The app has been removed from the store.',
      });

      fetchApps();
    } catch (error: any) {
      toast({
        title: 'Error deleting app',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                onClick={() => fetchApps()}
                className="flex items-center"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button 
                onClick={() => setShowForm(!showForm)}
                className="flex items-center"
              >
                <Plus className="mr-2 h-4 w-4" />
                {showForm ? 'Cancel' : 'Add New App'}
              </Button>
            </div>
          </div>

          {showForm && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Upload New App</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">App Name</label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="developer" className="block text-sm font-medium mb-1">Developer</label>
                    <Input 
                      id="developer" 
                      name="developer" 
                      value={formData.developer} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => handleSelectChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Productivity">Productivity</SelectItem>
                        <SelectItem value="Photography">Photography</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                        <SelectItem value="Music">Music</SelectItem>
                        <SelectItem value="Games">Games</SelectItem>
                        <SelectItem value="Utilities">Utilities</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Food">Food</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label htmlFor="version" className="block text-sm font-medium mb-1">Version</label>
                    <Input 
                      id="version" 
                      name="version" 
                      value={formData.version} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="is_free" className="block text-sm font-medium mb-1">Pricing</label>
                    <Select 
                      value={formData.is_free ? "free" : "paid"} 
                      onValueChange={(value) => handleSelectChange('is_free', value === "free" ? "true" : "false")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pricing" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {!formData.is_free && (
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium mb-1">Price</label>
                      <Input 
                        id="price" 
                        name="price" 
                        value={formData.price} 
                        onChange={handleInputChange} 
                        placeholder="$0.00" 
                        required={!formData.is_free} 
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    rows={4} 
                    required 
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit">Upload App</Button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-4">Manage Apps</h2>
              {apps.length === 0 ? (
                <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No apps available. Add your first app!
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {apps.map((app) => (
                    <div key={app.id} className="relative group">
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteApp(app.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                      <AppCard 
                        id={app.id}
                        name={app.name}
                        developer={app.developer}
                        category={app.category}
                        rating={4.5} // Default rating
                        downloads="0+" // Default downloads
                        imageUrl="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=500" // Default image
                        free={app.is_free}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
