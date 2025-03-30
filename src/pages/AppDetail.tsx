
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Download, Share, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AppData {
  id: string;
  name: string;
  developer: string;
  category: string;
  is_free: boolean;
  price: string | null;
  description: string;
  version: string;
  features: string[];
  created_at: string;
}

const AppDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppDetails();
  }, [id]);

  const fetchAppDetails = async () => {
    try {
      setLoading(true);
      
      if (!id) {
        navigate('/');
        return;
      }

      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (!data) {
        navigate('/not-found');
        return;
      }
      
      setApp(data);
    } catch (error: any) {
      toast({
        title: 'Error fetching app details',
        description: error.message,
        variant: 'destructive',
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">App not found</h1>
            <p className="mt-2">The app you're looking for doesn't exist or has been removed.</p>
            <Link to="/" className="mt-4 inline-block text-primary hover:underline">
              Return to homepage
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Sample data for the UI elements that aren't in the database yet
  const mockData = {
    rating: 4.5,
    downloads: '0+',
    size: '30MB',
    lastUpdated: new Date(app.created_at).toLocaleDateString(),
    screenshots: [
      'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=500',
      'https://images.unsplash.com/photo-1552083375-1447ce886485?auto=format&fit=crop&q=80&w=500',
      'https://images.unsplash.com/photo-1629757509637-7c99379d6d26?auto=format&fit=crop&q=80&w=500',
      'https://images.unsplash.com/photo-1579403124614-197f69d8187b?auto=format&fit=crop&q=80&w=500'
    ]
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/" className="inline-flex items-center text-primary hover:underline mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to home
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 mb-8">
            <div className="md:flex">
              <div className="md:w-1/3 p-6">
                <img 
                  src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=500" 
                  alt={app.name} 
                  className="w-full h-auto max-w-xs mx-auto rounded-lg shadow-md" 
                />
                
                <div className="mt-6 space-y-4">
                  <Button className="w-full" size="lg">
                    <Download className="mr-2 h-5 w-5" /> Download
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Share className="mr-2 h-5 w-5" /> Share
                  </Button>
                </div>
                
                <div className="mt-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Version</span>
                    <span className="font-medium">{app.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Updated</span>
                    <span className="font-medium">{mockData.lastUpdated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size</span>
                    <span className="font-medium">{mockData.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Installs</span>
                    <span className="font-medium">{mockData.downloads}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price</span>
                    <span className="font-medium">{app.is_free ? 'Free' : app.price}</span>
                  </div>
                </div>
              </div>
              
              <div className="md:w-2/3 p-6 md:border-l md:border-gray-200 md:dark:border-gray-700">
                <div className="flex flex-wrap justify-between items-start mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{app.name}</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{app.developer}</p>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {app.category}
                  </Badge>
                </div>
                
                <div className="flex items-center mb-6">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-5 w-5 ${i < Math.floor(mockData.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{mockData.rating}</span>
                </div>

                <Tabs defaultValue="description">
                  <TabsList className="mb-4">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="screenshots">Screenshots</TabsTrigger>
                    {app.features && app.features.length > 0 && (
                      <TabsTrigger value="features">Features</TabsTrigger>
                    )}
                  </TabsList>
                  
                  <TabsContent value="description">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {app.description}
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="screenshots">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mockData.screenshots.map((screenshot, index) => (
                        <div key={index} className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                          <img 
                            src={screenshot} 
                            alt={`${app.name} screenshot ${index + 1}`} 
                            className="w-full h-auto object-cover" 
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  {app.features && app.features.length > 0 && (
                    <TabsContent value="features">
                      <ul className="space-y-2">
                        {app.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2 text-primary">•</span>
                            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>
                  )}
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AppDetail;
