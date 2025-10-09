import { Link } from 'react-router-dom';
import { Target, TrendingUp, Heart, Zap, Scale, Dumbbell } from 'lucide-react';

const HealthGoalsSection = () => {
  const healthGoals = [
    {
      id: 'weight-loss',
      title: 'Weight Management',
      description: 'Balanced, portion-controlled meals to help you achieve your ideal weight',
      icon: Scale,
      color: 'bg-pink-500',
      dishes: '120+ dishes',
      avgCalories: '300-500'
    },
    {
      id: 'muscle-gain',
      title: 'Muscle Building',
      description: 'High-protein meals designed to support your fitness and strength goals',
      icon: Dumbbell,
      color: 'bg-blue-500',
      dishes: '85+ dishes',
      avgCalories: '500-750'
    },
    {
      id: 'diabetes-friendly',
      title: 'Diabetes Care',
      description: 'Low-GI, balanced meals to help maintain healthy blood sugar levels',
      icon: Heart,
      color: 'bg-red-500',
      dishes: '95+ dishes',
      avgCalories: '350-450'
    },
    {
      id: 'energy-boost',
      title: 'Energy & Stamina',
      description: 'Nutrient-dense meals to fuel your active lifestyle and boost vitality',
      icon: Zap,
      color: 'bg-yellow-500',
      dishes: '110+ dishes',
      avgCalories: '400-600'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Target className="w-6 h-6 text-primary-orange" />
            <span className="font-quicksand font-semibold text-primary-green text-lg">Personalized Nutrition</span>
          </div>
          
          <h2 className="font-poppins font-bold text-3xl sm:text-4xl text-accent-charcoal mb-4">
            Meals Tailored to Your Health Goals
          </h2>
          <p className="font-inter text-gray-600 text-lg max-w-3xl mx-auto">
            Whether you're building muscle, managing weight, or boosting energy, we have scientifically crafted meal plans to support your journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          {healthGoals.map((goal) => {
            const IconComponent = goal.icon;
            
            return (
              <div 
                key={goal.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Icon Header */}
                <div className="relative h-32 bg-gradient-to-br from-background-cream to-background-gray flex items-center justify-center">
                  <div className={`w-16 h-16 ${goal.color} rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="font-inter text-xs font-semibold text-accent-charcoal">{goal.dishes}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-poppins font-bold text-xl text-accent-charcoal mb-3 group-hover:text-primary-orange transition-colors">
                    {goal.title}
                  </h3>
                  
                  <p className="font-inter text-gray-600 text-sm mb-4 leading-relaxed">
                    {goal.description}
                  </p>

                  {/* Stats */}
                  <div className="bg-background-cream rounded-xl p-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-inter text-gray-600">Avg. Calories</span>
                      <span className="font-poppins font-semibold text-primary-orange">{goal.avgCalories}</span>
                    </div>
                  </div>

                  <Link to={`/menu?healthGoal=${goal.id}`} className="w-full bg-gradient-teal-cyan text-white py-3 rounded-xl font-inter font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-center">
                    Explore Menu
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-primary-green to-accent-teal rounded-2xl p-8 text-white">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h3 className="font-poppins font-bold text-2xl mb-3">
              Start Your Health Journey Today
            </h3>
            <p className="font-inter text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              Take our quick health assessment to get personalized meal recommendations that align with your goals, dietary preferences, and lifestyle
            </p>
            <Link to="/health-goals" className="bg-white text-primary-green px-8 py-4 rounded-full font-inter font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              Take Health Assessment
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HealthGoalsSection;