
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  return (
    <div className="hero-gradient text-white rounded-2xl overflow-hidden shadow-lg mb-8">
      <div className="container mx-auto px-6 py-12 md:py-20 md:px-12 relative">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 pr-0 md:pr-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              App Haven
            </h1>
            <p className="text-lg md:text-xl mb-6 text-blue-50">
              Welcome to my personal app project website, where innovation meets functionality, creating solutions for tomorrow's challenges.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Button size="lg" className="bg-white text-primary hover:bg-blue-50">
                <Link to="/categories">Explore Apps</Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-64 h-96 md:w-80 md:h-[30rem]">
              <div className="absolute right-0 top-0 w-48 h-80 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg transform rotate-6 overflow-hidden border border-white/20">
                <img src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=500" alt="App screenshot" className="w-full h-full object-cover" />
              </div>
              <div className="absolute left-0 bottom-0 w-48 h-80 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg transform -rotate-6 overflow-hidden border border-white/20">
                <img src="https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&q=80&w=500" alt="App screenshot" className="w-full h-full object-cover" />
              </div>
              <div className="absolute left-8 top-8 w-48 h-80 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg overflow-hidden border border-white/20 z-10">
                <img src="https://images.unsplash.com/photo-1622979135222-b70d5013391a?auto=format&fit=crop&q=80&w=500" alt="App screenshot" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
