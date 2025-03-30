
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppCard from './AppCard';
import { Button } from '@/components/ui/button';

// Sample data - in a real app, this would come from an API
const popularApps = [
  {
    id: '5',
    name: 'BattleRoyale',
    developer: 'Epic Games Studio',
    category: 'Games',
    rating: 4.7,
    downloads: '100M+',
    imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=500',
    free: true,
  },
  {
    id: '6',
    name: 'WeatherNow',
    developer: 'Weather Solutions',
    category: 'Utilities',
    rating: 4.5,
    downloads: '50M+',
    imageUrl: 'https://images.unsplash.com/photo-1532978379173-523e16f371f4?auto=format&fit=crop&q=80&w=500',
    free: true,
  },
  {
    id: '7',
    name: 'BudgetTracker',
    developer: 'Finance Apps',
    category: 'Finance',
    rating: 4.8,
    downloads: '5M+',
    imageUrl: 'https://images.unsplash.com/photo-1579170053380-58a0ed8d75e2?auto=format&fit=crop&q=80&w=500',
    free: false,
  },
  {
    id: '8',
    name: 'Recipe Master',
    developer: 'Cooking Enthusiasts',
    category: 'Food',
    rating: 4.6,
    downloads: '15M+',
    imageUrl: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?auto=format&fit=crop&q=80&w=500',
    free: true,
  },
];

const PopularApps: React.FC = () => {
  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Popular Apps</h2>
        <Link to="/popular">
          <Button variant="ghost" className="flex items-center text-primary">
            See all <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {popularApps.map((app) => (
          <AppCard key={app.id} {...app} />
        ))}
      </div>
    </div>
  );
};

export default PopularApps;
