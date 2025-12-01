
import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Benefits from '@/components/Benefits';
import WhyDifferent from '@/components/WhyDifferent';
import FounderSection from '@/components/FounderSection';
import RealNumbers from '@/components/RealNumbers';
import Testimonials from '@/components/Testimonials';
import Pricing from '@/components/Pricing';
import PrivacyFirst from '@/components/PrivacyFirst';
import Footer from '@/components/Footer';
import FloatingCTA from '@/components/FloatingCTA';

const LandingPage = () => {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Benefits />
        <WhyDifferent />
        <FounderSection />
        <RealNumbers />
        <Testimonials />
        <Pricing />
        <PrivacyFirst />
      </main>
      <Footer />
      <FloatingCTA />
    </>
  );
};

export default LandingPage;
