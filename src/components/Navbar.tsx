
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // Search functionality will be implemented here
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-primary font-bold text-xl">AppHaven</span>
              <span className="text-gray-800 font-bold text-xl ml-1">Hub</span>
            </Link>
          </div>

          {/* Desktop search bar */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search apps..."
                className="pl-10 pr-4 py-2 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </form>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/categories" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
              Categories
            </Link>
            <Link to="/featured" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
              Featured
            </Link>
            <Link to="/upload" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
              Upload App
            </Link>
            <Button variant="default" size="sm">
              Sign In
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-primary focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white py-2 px-4 shadow-inner">
          <form onSubmit={handleSearch} className="relative mb-4">
            <Input
              type="text"
              placeholder="Search apps..."
              className="pl-10 pr-4 py-2 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </form>
          <div className="flex flex-col space-y-2">
            <Link
              to="/categories"
              className="text-gray-600 hover:text-primary px-2 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Categories
            </Link>
            <Link
              to="/featured"
              className="text-gray-600 hover:text-primary px-2 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Featured
            </Link>
            <Link
              to="/upload"
              className="text-gray-600 hover:text-primary px-2 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Upload App
            </Link>
            <Button variant="default" className="w-full justify-center mt-2">
              Sign In
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
