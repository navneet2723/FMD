import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import WhyDetectSection from '@/components/SaveFoodData';
import MediaSection from '@/components/MediaSection';
import Footer from '@/components/Footer';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow mt-16">
        <HeroSection />
        <MediaSection />
        <WhyDetectSection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;