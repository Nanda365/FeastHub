
import { Link } from 'react-router-dom';
import { Sparkles, Leaf, Heart } from 'lucide-react';

const Hero = () => {
  return (
    <section className="bg-gradient-to-br from-background-cream via-white to-background-gray py-16 sm:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-2 mb-6">
              <Sparkles className="w-6 h-6 text-accent-yellow animate-pulse" />
              <span className="font-quicksand font-semibold text-primary-orange text-lg">Eat Smart. Live Better.</span>
            </div>
            
            <h1 className="font-poppins font-bold text-4xl sm:text-5xl lg:text-6xl text-accent-charcoal leading-tight mb-6">
              Healthy Food
              <span className="bg-gradient-teal-cyan bg-clip-text text-transparent block">
                Delivered Fresh
              </span>
            </h1>
            
            <p className="font-inter text-gray-600 text-lg sm:text-xl leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              Discover nutritious meals crafted by top chefs. Track calories, meet your health goals, 
              and enjoy sustainable eating with personalized recommendations.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to="/menu" className="w-full sm:w-auto bg-gradient-teal-cyan text-white px-8 py-4 rounded-full font-inter font-semibold text-lg hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-xl text-center">
                Order Now
              </Link>
              
              <Link to="/book-table" className="w-full sm:w-auto border-2 border-primary-orange text-primary-orange px-8 py-4 rounded-full font-inter font-semibold text-lg hover:bg-primary-orange hover:text-white transition-all duration-300 text-center">
                Book a Table
              </Link>
            </div>

            {/* Health Features */}
            <div className="flex items-center justify-center lg:justify-start space-x-6 mt-10 text-sm">
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-gray-600 font-inter">Calorie Tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <Leaf className="w-4 h-4 text-primary-green" />
                <span className="text-gray-600 font-inter">Sustainable Meals</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <img 
                src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600" 
                alt="Healthy Buddha Bowl" 
                className="w-full h-96 sm:h-[500px] object-cover rounded-3xl shadow-2xl"
              />
              
              {/* Floating Cards */}
              <div className="absolute -top-6 -left-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-green rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <div className="font-poppins font-semibold text-sm text-accent-charcoal">Nutrition Verified</div>
                    <div className="font-inter text-xs text-gray-600">420 cal • High Protein</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                <div className="text-center">
                  <div className="font-poppins font-bold text-lg text-primary-orange">15 min</div>
                  <div className="font-inter text-xs text-gray-600">Delivery Time</div>
                </div>
              </div>
            </div>
            
            {/* Background Decoration */}
            <div className="absolute inset-0 bg-gradient-teal-cyan opacity-10 rounded-3xl transform rotate-6 scale-105"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;