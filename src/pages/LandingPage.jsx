
import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import WhyFinantel from '@/components/WhyFinantel';
import UniqueValue from '@/components/UniqueValue';
import Features from '@/components/Features';
import Pricing from '@/components/Pricing';
import Footer from '@/components/Footer';

const LandingPage = () => {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <WhyFinantel />
        <UniqueValue />
        <Features />
        <Pricing />
      </main>
      <Footer />
    </>
  );
};

export default LandingPage;
