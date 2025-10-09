import React from 'react';
import Hero from '../components/Hero';
import DietFilters from '../components/DietFilters';
import FeaturedRestaurants from '../components/FeaturedRestaurants';
import MoodRecommendations from '../components/MoodRecommendations';
import RecipeBoxPromo from '../components/RecipeBoxPromo';

const HomePage = () => {
  return (
    <>
      <Hero />
      <RecipeBoxPromo />
      {/* <DietFilters /> */}
      <FeaturedRestaurants />
      <MoodRecommendations />
    </>
  );
};

export default HomePage;