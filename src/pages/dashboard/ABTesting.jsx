
import React from 'react';
import { useABTest } from '@/contexts/ABTestContext';
import { motion } from 'framer-motion';
import { BarChart3, FlaskConical, TrendingUp, Users } from 'lucide-react';

const ABTesting = () => {
  const { analyticsData } = useABTest();

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">A/B Testing Dashboard</h1>
          <p className="text-[#6E6E73] dark:text-gray-400 mt-1 text-lg">Monitor experiment performance in real-time</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {Object.entries(analyticsData).map(([expId, variants]) => (
          <motion.div 
            key={expId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#1a1a1a] p-6 rounded-[22px] border border-gray-100 dark:border-white/5 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#1C8FA0]/10 flex items-center justify-center text-[#1C8FA0]">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#1a1a1a] dark:text-white capitalize">{expId.replace(/_/g, ' ')}</h3>
                <p className="text-xs text-[#6E6E73] dark:text-gray-400">Active Experiment</p>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(variants).map(([variantName, stats]) => {
                const rate = stats.views > 0 ? ((stats.conversions / stats.views) * 100).toFixed(1) : 0;
                return (
                  <div key={variantName} className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-sm capitalize text-[#1a1a1a] dark:text-white">{variantName}</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${rate > 15 ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                        {rate}% Conv.
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs text-[#6E6E73] dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {stats.views} Views
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> {stats.conversions} Goals
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mt-3 overflow-hidden">
                      <div 
                        className="h-full bg-[#1C8FA0] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, rate * 2)}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
        
        {Object.keys(analyticsData).length === 0 && (
          <div className="col-span-2 py-12 text-center text-[#6E6E73] dark:text-gray-400 bg-white dark:bg-[#1a1a1a] rounded-[22px] border border-gray-100 dark:border-white/5">
            <FlaskConical className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No active experiment data collected yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ABTesting;
