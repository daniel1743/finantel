
import React, { createContext, useContext, useState, useEffect } from 'react';

const ABTestContext = createContext();

export const useABTest = () => useContext(ABTestContext);

export const ABTestProvider = ({ children }) => {
  const [experiments, setExperiments] = useState({});
  const [analyticsData, setAnalyticsData] = useState({});

  // Define active experiments
  const activeExperiments = {
    'hero_cta_text': ['control', 'variant_b'], // "Comenzar Gratis" vs "Prueba Ahora"
    'pricing_plans': ['control', 'variant_b'], // 3 plans vs 2 plans
  };

  useEffect(() => {
    // Assign variants on mount if not already assigned
    const assigned = JSON.parse(localStorage.getItem('finantel_ab_assignments') || '{}');
    const newAssignments = { ...assigned };
    let hasChanges = false;

    Object.keys(activeExperiments).forEach(expId => {
      if (!newAssignments[expId]) {
        const variants = activeExperiments[expId];
        const randomVariant = variants[Math.floor(Math.random() * variants.length)];
        newAssignments[expId] = randomVariant;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      localStorage.setItem('finantel_ab_assignments', JSON.stringify(newAssignments));
    }
    setExperiments(newAssignments);
    
    // Load mock analytics
    const savedAnalytics = JSON.parse(localStorage.getItem('finantel_ab_analytics') || '{}');
    setAnalyticsData(savedAnalytics);
  }, []);

  const trackConversion = (experimentId) => {
    const variant = experiments[experimentId];
    if (!variant) return;

    const currentAnalytics = { ...analyticsData };
    if (!currentAnalytics[experimentId]) currentAnalytics[experimentId] = {};
    if (!currentAnalytics[experimentId][variant]) currentAnalytics[experimentId][variant] = { views: 0, conversions: 0 };

    currentAnalytics[experimentId][variant].conversions += 1;
    setAnalyticsData(currentAnalytics);
    localStorage.setItem('finantel_ab_analytics', JSON.stringify(currentAnalytics));
    console.log(`[ABTest] Conversion tracked: ${experimentId} -> ${variant}`);
  };

  const trackView = (experimentId) => {
    const variant = experiments[experimentId];
    if (!variant) return;
    
    const currentAnalytics = { ...analyticsData };
    if (!currentAnalytics[experimentId]) currentAnalytics[experimentId] = {};
    if (!currentAnalytics[experimentId][variant]) currentAnalytics[experimentId][variant] = { views: 0, conversions: 0 };
    
    currentAnalytics[experimentId][variant].views += 1;
    setAnalyticsData(currentAnalytics);
    localStorage.setItem('finantel_ab_analytics', JSON.stringify(currentAnalytics));
  };

  return (
    <ABTestContext.Provider value={{ experiments, trackConversion, trackView, analyticsData }}>
      {children}
    </ABTestContext.Provider>
  );
};

export const ABVariant = ({ experimentId, variant, children }) => {
  const { experiments, trackView } = useABTest();
  const assignedVariant = experiments[experimentId];

  useEffect(() => {
    if (assignedVariant === variant) {
      trackView(experimentId);
    }
  }, [assignedVariant, experimentId, variant]);

  if (assignedVariant !== variant) return null;
  return <>{children}</>;
};
