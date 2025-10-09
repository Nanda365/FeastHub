
import { UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecipeBoxPromo = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-orange-50 to-red-50">
      <div className="container mx-auto px-4 text-center">
        <div className="flex flex-col items-center justify-center">
          <UtensilsCrossed className="w-16 h-16 text-primary-orange mb-4" />
          <h2 className="font-poppins font-bold text-4xl text-accent-charcoal mb-4">
            Craving Something Unique? Design Your Own Dish!
          </h2>
          <p className="font-inter text-lg text-gray-700 max-w-3xl mb-8">
            With our Recipe Box, you're the chef! Customize ingredients, add special instructions,
            and create your perfect meal. Your culinary imagination is the only limit.
          </p>
          <Link
            to="/restaurants"
            className="bg-gradient-to-r from-primary-orange to-red-500 text-white px-8 py-4 rounded-full font-inter font-semibold text-lg
                       hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3"
          >
            <span>Start Customizing Your Dish</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RecipeBoxPromo;
