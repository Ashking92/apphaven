
import React, { useEffect, useState } from 'react';
import HeroSection from '@/components/HeroSection';
import CategoryList from '@/components/CategoryList';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AppCard from '@/components/AppCard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Smartphone, Tablet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define an interface for the app data
interface AppData {
  id: string;
  name: string;
  developer: string;
  category: string;
  icon_url: string;
  is_free: boolean;
  price?: string;
  platform?: 'android' | 'ios' | 'both';
  created_at: string;
  description: string;
  app_url: string;
  downloads: number;
  features: string[];
  version: string;
}

const Index = () => {
  const [apps, setApps] = useState<AppData[]>([]);
  const [androidApps, setAndroidApps] = useState<AppData[]>([]);
  const [iosApps, setIosApps] = useState<AppData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast: hookToast } = useToast();
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchApps();

    // Set up real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'apps'
        },
        (payload) => {
          fetchApps();
          toast.info("New app available!", {
            description: `${payload.new.name} has been added to the store.`
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'apps'
        },
        () => {
          fetchApps();
          toast.info("App store updated", {
            description: "An app has been removed from the store."
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'apps'
        },
        (payload) => {
          fetchApps();
          toast.info("App updated", {
            description: `${payload.new.name} has been updated.`
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Assuming platform might not exist in all records, provide a default
      const appsWithPlatform = data?.map(app => ({
        ...app,
        platform: app.platform || 'both'
      })) || [];
      
      setApps(appsWithPlatform);
      
      // Filter for Android and iOS apps
      setAndroidApps(appsWithPlatform.filter(app => app.platform === 'android' || app.platform === 'both'));
      setIosApps(appsWithPlatform.filter(app => app.platform === 'ios' || app.platform === 'both'));
    } catch (error: any) {
      hookToast({
        title: 'Error fetching apps',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <HeroSection />
          
          {/* Apps Section with Tabs */}
          <div className="py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">All Apps</h2>
              <div className="flex flex-wrap gap-2">
                <Link to="/categories">
                  <Button variant="ghost" className="flex items-center text-primary">
                    Browse by category <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" className="flex items-center">
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="all">All Apps</TabsTrigger>
                <TabsTrigger value="android" className="flex items-center gap-1">
                  <Smartphone size={16} /> Android
                </TabsTrigger>
                <TabsTrigger value="ios" className="flex items-center gap-1">
                  <Tablet size={16} /> iOS
                </TabsTrigger>
              </TabsList>
              
              {loading ? (
                <div className="flex justify-center p-12">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <>
                  <TabsContent value="all">
                    {apps.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">No apps available yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {apps.map((app) => (
                          <AppCard 
                            key={app.id}
                            id={app.id}
                            name={app.name}
                            developer={app.developer}
                            category={app.category}
                            rating={4.5} // Default rating
                            downloads={`${app.downloads || 0}+`} // Use actual downloads count if available
                            imageUrl={app.icon_url || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=500"} // Use uploaded icon or default
                            free={app.is_free}
                            price={app.price}
                            platform={app.platform}
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="android">
                    {androidApps.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">No Android apps available yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {androidApps.map((app) => (
                          <AppCard 
                            key={app.id}
                            id={app.id}
                            name={app.name}
                            developer={app.developer}
                            category={app.category}
                            rating={4.5} // Default rating
                            downloads={`${app.downloads || 0}+`} // Use actual downloads count if available
                            imageUrl={app.icon_url || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=500"} // Use uploaded icon or default
                            free={app.is_free}
                            price={app.price}
                            platform={app.platform}
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="ios">
                    {iosApps.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">No iOS apps available yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {iosApps.map((app) => (
                          <AppCard 
                            key={app.id}
                            id={app.id}
                            name={app.name}
                            developer={app.developer}
                            category={app.category}
                            rating={4.5} // Default rating
                            downloads={`${app.downloads || 0}+`} // Use actual downloads count if available
                            imageUrl={app.icon_url || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=500"} // Use uploaded icon or default
                            free={app.is_free}
                            price={app.price}
                            platform={app.platform}
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </>
              )}
            </Tabs>
          </div>
          
          <CategoryList />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
