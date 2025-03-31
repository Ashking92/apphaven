
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AppCardProps {
  id: string;
  name: string;
  developer: string;
  category: string;
  rating: number;
  downloads: string;
  imageUrl: string;
  free: boolean;
  price?: string;
}

const AppCard = ({ id, name, developer, category, rating, downloads, imageUrl, free, price }: AppCardProps) => {
  return (
    <div className="app-card bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
      <Link to={`/app/${id}`}>
        <div className="h-40 overflow-hidden bg-gray-100 dark:bg-gray-700">
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
          />
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/app/${id}`}>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">{name}</h3>
        </Link>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 truncate">{developer}</p>
        
        <div className="flex items-center mb-3">
          <Badge variant="secondary" className="category-badge mr-2">
            {category}
          </Badge>
          <div className="flex items-center text-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="text-gray-700 dark:text-gray-300">{rating}</span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({downloads})</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className={`text-sm font-medium ${free ? 'text-green-500' : 'text-blue-500'}`}>
            {free ? 'Free' : price || 'Premium'}
          </span>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="p-0 w-8 h-8">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="default" size="sm" className="px-3">
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppCard;
