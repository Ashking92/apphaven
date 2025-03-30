
import React from 'react';
import HeroSection from '@/components/HeroSection';
import FeaturedApps from '@/components/FeaturedApps';
import PopularApps from '@/components/PopularApps';
import CategoryList from '@/components/CategoryList';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <HeroSection />
          <FeaturedApps />
          <CategoryList />
          <PopularApps />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
