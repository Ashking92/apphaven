
import React, { useEffect, useState } from 'react';
import HeroSection from '@/components/HeroSection';
import CategoryList from '@/components/CategoryList';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AppCard from '@/components/AppCard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
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
  }, []);

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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <HeroSection />
          
          {/* Apps Section */}
          <div className="py-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">All Apps</h2>
              <Link to="/categories">
                <Button variant="ghost" className="flex items-center text-primary">
                  Browse by category <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            {loading ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <>
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
                        downloads="0+" // Default downloads
                        imageUrl="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=500" // Default image
                        free={app.is_free}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          
          <CategoryList />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
