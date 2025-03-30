
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Smartphone, Gamepad2, Briefcase, Camera, Music, FileText, 
  ShoppingCart, BookOpen, Heart, MessageSquare 
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
}

const categories: Category[] = [
  { id: 'games', name: 'Games', icon: <Gamepad2 className="h-5 w-5" />, count: 1245 },
  { id: 'business', name: 'Business', icon: <Briefcase className="h-5 w-5" />, count: 873 },
  { id: 'photography', name: 'Photography', icon: <Camera className="h-5 w-5" />, count: 492 },
  { id: 'music', name: 'Music & Audio', icon: <Music className="h-5 w-5" />, count: 635 },
  { id: 'utilities', name: 'Utilities', icon: <Smartphone className="h-5 w-5" />, count: 981 },
  { id: 'productivity', name: 'Productivity', icon: <FileText className="h-5 w-5" />, count: 724 },
  { id: 'shopping', name: 'Shopping', icon: <ShoppingCart className="h-5 w-5" />, count: 413 },
  { id: 'education', name: 'Education', icon: <BookOpen className="h-5 w-5" />, count: 596 },
  { id: 'health', name: 'Health & Fitness', icon: <Heart className="h-5 w-5" />, count: 348 },
  { id: 'social', name: 'Social', icon: <MessageSquare className="h-5 w-5" />, count: 782 },
];

const CategoryList: React.FC = () => {
  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Browse Categories</h2>
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
    </div>
  );
};

export default CategoryList;
