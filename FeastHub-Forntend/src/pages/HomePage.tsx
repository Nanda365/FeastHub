import React from 'react';
import Hero from '../components/Hero';
import DietFilters from '../components/DietFilters';
import FeaturedRestaurants from '../components/FeaturedRestaurants';
import MoodRecommendations from '../components/MoodRecommendations';

const HomePage = () => {
  return (
    <>
      <Hero />
      <DietFilters />
      <FeaturedRestaurants />
      <MoodRecommendations />
    </>
  );
};

export default HomePage;