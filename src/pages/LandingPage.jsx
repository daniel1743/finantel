
import React, { useEffect, useRef } from 'react';
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
import { useAnalytics } from '@/hooks/useAnalytics';

const LandingPage = () => {
  const { trackLandingSection } = useAnalytics();
  const sectionsRef = useRef(new Set());

  // Track secciones cuando son visibles
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const sectionName = entry.target.getAttribute('data-section');
            if (sectionName && !sectionsRef.current.has(sectionName)) {
              sectionsRef.current.add(sectionName);
              trackLandingSection(sectionName);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    const sections = document.querySelectorAll('[data-section]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, [trackLandingSection]);

  return (
    <>
      <Header />
      <main className="overflow-x-hidden w-full max-w-full">
        <div data-section="hero">
          <Hero />
        </div>
        <div data-section="benefits">
          <Benefits />
        </div>
        <div data-section="product-gallery">
          <ProductGallery />
        </div>
        <div data-section="why-different">
          <WhyDifferent />
        </div>
        <div data-section="founder">
          <FounderSection />
        </div>
        <div data-section="real-numbers">
          <RealNumbers />
        </div>
        <div data-section="testimonials">
          <Testimonials />
        </div>
        <div data-section="pricing">
          <Pricing />
        </div>
        <div data-section="faq">
          <FAQ />
        </div>
        <div data-section="privacy">
          <PrivacyFirst />
        </div>
      </main>
      <Footer />
      <FloatingCTA />
    </>
  );
};

export default LandingPage;
