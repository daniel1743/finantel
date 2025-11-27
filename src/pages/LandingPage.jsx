
import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import UserStats from '@/components/UserStats';
import BrandsScroll from '@/components/BrandsScroll';
import WhyFinantel from '@/components/WhyFinantel';
import UniqueValue from '@/components/UniqueValue';
import Features from '@/components/Features';
import Testimonials from '@/components/Testimonials';
import LimitedOffer from '@/components/LimitedOffer';
import Pricing from '@/components/Pricing';
import Footer from '@/components/Footer';
import FloatingCTA from '@/components/FloatingCTA';
import RecentUsersCounter from '@/components/RecentUsersCounter';

const LandingPage = () => {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <UserStats />
        <BrandsScroll />
        <Features />
        <WhyFinantel />
        <UniqueValue />
        <Testimonials />
        <LimitedOffer />
        <Pricing />
      </main>
      <Footer />
      <FloatingCTA />
      <RecentUsersCounter />
    </>
  );
};

export default LandingPage;
