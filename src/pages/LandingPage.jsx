
import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Benefits from '@/components/Benefits';
import ProductGallery from '@/components/ProductGallery';
import WhyDifferent from '@/components/WhyDifferent';
import FounderSection from '@/components/FounderSection';
import RealNumbers from '@/components/RealNumbers';
import Testimonials from '@/components/Testimonials';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import PrivacyFirst from '@/components/PrivacyFirst';
import Footer from '@/components/Footer';
import FloatingCTA from '@/components/FloatingCTA';

const LandingPage = () => {
  return (
    <>
      <Header />
      <main className="overflow-x-hidden w-full max-w-full">
        <Hero />
        <Benefits />
        <ProductGallery />
        <WhyDifferent />
        <FounderSection />
        <RealNumbers />
        <Testimonials />
        <Pricing />
        <FAQ />
        <PrivacyFirst />
      </main>
      <Footer />
      <FloatingCTA />
    </>
  );
};

export default LandingPage;
