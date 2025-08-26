import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Recycle, Globe, Droplets } from 'lucide-react';

const SustainabilitySection = () => {
  const sustainabilityFeatures = [
    {
      icon: Leaf,
      title: 'Farm-to-Table',
      description: 'Direct partnerships with local organic farms for the freshest ingredients',
      impact: '50% less carbon footprint'
    },
    {
      icon: Recycle,
      title: 'Zero Waste Initiative',
      description: 'Eco-friendly packaging and food waste reduction programs',
      impact: '90% biodegradable packaging'
    },
    {
      icon: Globe,
      title: 'Local Sourcing',
      description: 'Supporting local communities by sourcing ingredients within 150km',
      impact: '80% local ingredients'
    },
    {
      icon: Droplets,
      title: 'Water Conservation',
      description: 'Efficient cooking methods and water-conscious ingredient selection',
      impact: '30% less water usage'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-primary-green via-accent-teal to-primary-green text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 border-2 border-white rounded-full"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 border-2 border-white rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Globe className="w-6 h-6 text-accent-yellow" />
            <span className="font-quicksand font-semibold text-accent-yellow text-lg">Sustainable Dining</span>
          </div>
          
          <h2 className="font-poppins font-bold text-3xl sm:text-4xl mb-4">
            Good for You, Better for Earth
          </h2>
          <p className="font-inter text-lg max-w-3xl mx-auto opacity-90">
            Every meal ordered through FeastHub contributes to a healthier planet. We're committed to sustainable practices that make a real difference.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {sustainabilityFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            
            return (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="font-poppins font-semibold text-xl mb-3">
                  {feature.title}
                </h3>
                
                <p className="font-inter text-sm opacity-90 mb-4">
                  {feature.description}
                </p>

                <div className="bg-accent-yellow text-accent-charcoal rounded-full px-3 py-1 text-sm font-inter font-semibold inline-block">
                  {feature.impact}
                </div>
              </div>
            );
          })}
        </div>

        {/* Impact Stats */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
          <h3 className="font-poppins font-bold text-2xl mb-6">Our Environmental Impact</h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="font-poppins font-bold text-3xl text-accent-yellow mb-2">2.5M kg</div>
              <div className="font-inter">CO₂ Emissions Saved</div>
            </div>
            <div>
              <div className="font-poppins font-bold text-3xl text-accent-yellow mb-2">150K</div>
              <div className="font-inter">Meals Donated</div>
            </div>
            <div>
              <div className="font-poppins font-bold text-3xl text-accent-yellow mb-2">95%</div>
              <div className="font-inter">Packaging Recycled</div>
            </div>
          </div>

          <Link to="/sustainability" className="mt-8 bg-accent-yellow text-accent-charcoal px-8 py-4 rounded-full font-inter font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center">
            Learn More About Our Mission
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SustainabilitySection;