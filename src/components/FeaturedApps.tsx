
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppCard from './AppCard';
import { Button } from '@/components/ui/button';

// Sample data - in a real app, this would come from an API
const featuredApps = [
  {
    id: '1',
    name: 'PhotoEditorPro',
    developer: 'Creative Studios',
    category: 'Photography',
    rating: 4.8,
    downloads: '5M+',
    imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=500',
    free: false,
  },
  {
    id: '2',
    name: 'Fitness Tracker',
    developer: 'Health Apps Inc',
    category: 'Health',
    rating: 4.6,
    downloads: '2M+',
    imageUrl: 'https://images.unsplash.com/photo-1509628061459-1328d06c2ced?auto=format&fit=crop&q=80&w=500',
    free: true,
  },
  {
    id: '3',
    name: 'TaskMaster',
    developer: 'Productivity Tools',
    category: 'Productivity',
    rating: 4.7,
    downloads: '10M+',
    imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=500',
    free: false,
  },
  {
    id: '4',
    name: 'MusicStream',
    developer: 'Audio Apps Co',
    category: 'Music',
    rating: 4.9,
    downloads: '20M+',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=500',
    free: true,
  },
];

const FeaturedApps: React.FC = () => {
  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Featured Apps</h2>
        <Link to="/featured">
          <Button variant="ghost" className="flex items-center text-primary">
            See all <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {featuredApps.map((app) => (
          <AppCard key={app.id} {...app} />
        ))}
      </div>
    </div>
  );
};

export default FeaturedApps;
