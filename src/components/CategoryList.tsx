
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Smartphone, Gamepad2, Briefcase, Camera, Music, FileText, 
  ShoppingCart, BookOpen, Heart, MessageCircle, Tv2, Headphones,
  DollarSign, Umbrella, Award, Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
}

const getCategoryIcon = (id: string) => {
  switch (id) {
    case 'games':
      return <Gamepad2 className="h-5 w-5" />;
    case 'business':
      return <Briefcase className="h-5 w-5" />;
    case 'photography':
      return <Camera className="h-5 w-5" />;
    case 'music':
      return <Music className="h-5 w-5" />;
    case 'utilities':
      return <Smartphone className="h-5 w-5" />;
    case 'productivity':
      return <FileText className="h-5 w-5" />;
    case 'shopping':
      return <ShoppingCart className="h-5 w-5" />;
    case 'education':
      return <BookOpen className="h-5 w-5" />;
    case 'health':
      return <Heart className="h-5 w-5" />;
    case 'social':
      return <MessageCircle className="h-5 w-5" />;
    case 'entertainment':
      return <Tv2 className="h-5 w-5" />;
    case 'audio':
      return <Headphones className="h-5 w-5" />;
    case 'finance':
      return <DollarSign className="h-5 w-5" />;
    case 'weather':
      return <Umbrella className="h-5 w-5" />;
    case 'lifestyle':
      return <Award className="h-5 w-5" />;
    default:
      return <Zap className="h-5 w-5" />;
  }
};

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategoryCounts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('apps')
        .select('category');

      if (error) throw error;

      // Count apps per category
      const categoryCounts: { [key: string]: number } = {};
      data?.forEach(app => {
        const category = app.category;
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });

      // Build categories array
      const categoryData: Category[] = [
        { id: 'games', name: 'Games', icon: getCategoryIcon('games'), count: categoryCounts['Games'] || 0 },
        { id: 'business', name: 'Business', icon: getCategoryIcon('business'), count: categoryCounts['Business'] || 0 },
        { id: 'photography', name: 'Photography', icon: getCategoryIcon('photography'), count: categoryCounts['Photography'] || 0 },
        { id: 'music', name: 'Music & Audio', icon: getCategoryIcon('music'), count: categoryCounts['Music & Audio'] || 0 },
        { id: 'utilities', name: 'Utilities', icon: getCategoryIcon('utilities'), count: categoryCounts['Utilities'] || 0 },
        { id: 'productivity', name: 'Productivity', icon: getCategoryIcon('productivity'), count: categoryCounts['Productivity'] || 0 },
        { id: 'shopping', name: 'Shopping', icon: getCategoryIcon('shopping'), count: categoryCounts['Shopping'] || 0 },
        { id: 'education', name: 'Education', icon: getCategoryIcon('education'), count: categoryCounts['Education'] || 0 },
        { id: 'health', name: 'Health & Fitness', icon: getCategoryIcon('health'), count: categoryCounts['Health & Fitness'] || 0 },
        { id: 'social', name: 'Social', icon: getCategoryIcon('social'), count: categoryCounts['Social'] || 0 },
        { id: 'entertainment', name: 'Entertainment', icon: getCategoryIcon('entertainment'), count: categoryCounts['Entertainment'] || 0 },
        { id: 'finance', name: 'Finance', icon: getCategoryIcon('finance'), count: categoryCounts['Finance'] || 0 },
        { id: 'weather', name: 'Weather', icon: getCategoryIcon('weather'), count: categoryCounts['Weather'] || 0 },
        { id: 'lifestyle', name: 'Lifestyle', icon: getCategoryIcon('lifestyle'), count: categoryCounts['Lifestyle'] || 0 },
      ];

      setCategories(categoryData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryCounts();

    // Set up realtime subscription for app changes
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
          fetchCategoryCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Browse Categories</h2>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.id}`}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center group"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <span className="text-primary">{category.icon}</span>
              </div>
              <h3 className="font-medium text-gray-800 dark:text-white mb-1">{category.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{category.count} apps</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryList;
