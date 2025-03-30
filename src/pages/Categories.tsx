
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Smartphone, Gamepad2, Briefcase, Camera, Music, FileText, 
  ShoppingCart, BookOpen, Heart, MessageSquare, Coffee, Map, 
  Tv, Book, Headphones, Film, Cloud, Home, Car
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  description: string;
}

const categories: Category[] = [
  { id: 'games', name: 'Games', icon: <Gamepad2 className="h-6 w-6" />, count: 1245, description: 'Action, adventure, casual, and more game categories to explore' },
  { id: 'business', name: 'Business', icon: <Briefcase className="h-6 w-6" />, count: 873, description: 'Tools for productivity, team management, and business operations' },
  { id: 'photography', name: 'Photography', icon: <Camera className="h-6 w-6" />, count: 492, description: 'Photo editing, camera tools, and image organization apps' },
  { id: 'music', name: 'Music & Audio', icon: <Music className="h-6 w-6" />, count: 635, description: 'Music players, audio editors, and music creation tools' },
  { id: 'utilities', name: 'Utilities', icon: <Smartphone className="h-6 w-6" />, count: 981, description: 'Essential tools and utilities for everyday use' },
  { id: 'productivity', name: 'Productivity', icon: <FileText className="h-6 w-6" />, count: 724, description: 'Task managers, note-taking, and organization apps' },
  { id: 'shopping', name: 'Shopping', icon: <ShoppingCart className="h-6 w-6" />, count: 413, description: 'Online shopping, price comparison, and deals apps' },
  { id: 'education', name: 'Education', icon: <BookOpen className="h-6 w-6" />, count: 596, description: 'Learning tools, educational content, and study aids' },
  { id: 'health', name: 'Health & Fitness', icon: <Heart className="h-6 w-6" />, count: 348, description: 'Fitness trackers, workout plans, and health monitors' },
  { id: 'social', name: 'Social', icon: <MessageSquare className="h-6 w-6" />, count: 782, description: 'Social networks, messaging, and community platforms' },
  { id: 'food', name: 'Food & Drink', icon: <Coffee className="h-6 w-6" />, count: 249, description: 'Recipe apps, restaurant finders, and cooking guides' },
  { id: 'travel', name: 'Travel & Local', icon: <Map className="h-6 w-6" />, count: 315, description: 'Travel planning, booking, and local guides' },
  { id: 'entertainment', name: 'Entertainment', icon: <Tv className="h-6 w-6" />, count: 588, description: 'Streaming services, video players, and entertainment apps' },
  { id: 'books', name: 'Books & Reference', icon: <Book className="h-6 w-6" />, count: 422, description: 'E-books, audiobooks, and reference materials' },
  { id: 'audio', name: 'Audio & Podcasts', icon: <Headphones className="h-6 w-6" />, count: 267, description: 'Podcast players, audio streaming, and audiobook apps' },
  { id: 'video', name: 'Video Players', icon: <Film className="h-6 w-6" />, count: 183, description: 'Video players, editors, and streaming applications' },
  { id: 'weather', name: 'Weather', icon: <Cloud className="h-6 w-6" />, count: 98, description: 'Weather forecasts, alerts, and climate information' },
  { id: 'lifestyle', name: 'Lifestyle', icon: <Home className="h-6 w-6" />, count: 356, description: 'Home improvement, fashion, and lifestyle apps' },
  { id: 'transportation', name: 'Transportation', icon: <Car className="h-6 w-6" />, count: 145, description: 'Ride sharing, navigation, and public transportation apps' },
];

const Categories = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">App Categories</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Explore our extensive collection of applications organized by category. Find the perfect app for your needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.id}`}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                    <span className="text-primary">{category.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg text-gray-800 dark:text-white">{category.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{category.count} apps</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-auto">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Categories;
