import React, { useState } from 'react';
import { dietFilters, healthGoalFilters } from '../utils/data';

const DietFilters = () => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<'diet' | 'health'>('diet');

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const currentFilters = filterType === 'diet' ? dietFilters : healthGoalFilters;

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-accent-charcoal mb-4">
            Find Your Perfect Meal
          </h2>
          <p className="font-inter text-gray-600 text-lg max-w-2xl mx-auto">
            Filter by your dietary preferences and health goals to discover meals that match your lifestyle
          </p>
        </div>

        {/* Filter Type Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-background-gray rounded-full p-1 inline-flex">
            <button
              onClick={() => setFilterType('diet')}
              className={`px-6 py-2 rounded-full font-inter font-medium transition-all duration-300 ${
                filterType === 'diet' 
                  ? 'bg-white text-primary-orange shadow-md' 
                  : 'text-gray-600 hover:text-accent-charcoal'
              }`}
            >
              Diet Preferences
            </button>
            <button
              onClick={() => setFilterType('health')}
              className={`px-6 py-2 rounded-full font-inter font-medium transition-all duration-300 ${
                filterType === 'health' 
                  ? 'bg-white text-primary-orange shadow-md' 
                  : 'text-gray-600 hover:text-accent-charcoal'
              }`}
            >
              Health Goals
            </button>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          {currentFilters.map((filter) => {
            const isActive = activeFilters.includes(filter.id);
            
            return (
              <button
                key={filter.id}
                onClick={() => toggleFilter(filter.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-full font-inter font-medium transition-all duration-300 transform hover:scale-105 ${
                  isActive
                    ? 'bg-gradient-teal-cyan text-white shadow-lg'
                    : `${filter.color} hover:shadow-md`
                }`}
              >
                <span className="text-lg">{filter.icon}</span>
                <span>{filter.label}</span>
                {isActive && (
                  <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center">
                    <span className="text-xs">✓</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Filters Display */}
        {activeFilters.length > 0 && (
          <div className="mt-6 text-center">
            <p className="font-inter text-gray-600 mb-2">Active filters:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {activeFilters.map(filterId => {
                const filter = currentFilters.find(f => f.id === filterId);
                return filter ? (
                  <span 
                    key={filterId}
                    className="bg-primary-orange text-white px-3 py-1 rounded-full text-sm font-inter"
                  >
                    {filter.icon} {filter.label}
                  </span>
                ) : null;
              })}
            </div>
            <button 
              onClick={() => setActiveFilters([])}
              className="mt-2 text-primary-orange hover:text-accent-charcoal font-inter text-sm underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default DietFilters;