import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Smile, Battery, Coffee, Zap } from 'lucide-react';
import axios from 'axios';
import DishCard from './DishCard';

interface Dish {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  nutrition: { calories: number; protein: number };
  dietTypes: string[];
  healthGoals: string[];
  prepTime: number;
  restaurant: string;
}

interface MoodRecommendation {
  title: string;
  description: string;
  dishes: Dish[];
}

const MoodRecommendations = () => {
  const [selectedMood, setSelectedMood] = useState<string>('happy');
  const [moodRecommendation, setMoodRecommendation] = useState<MoodRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const moodOptions = [
    { id: 'happy', label: 'Happy & Energetic', icon: Smile, color: 'bg-yellow-100 text-yellow-800' },
    { id: 'tired', label: 'Tired & Sluggish', icon: Battery, color: 'bg-blue-100 text-blue-800' },
    { id: 'stressed', label: 'Stressed & Overwhelmed', icon: Coffee, color: 'bg-purple-100 text-purple-800' },
  ] as const;

  useEffect(() => {
    const fetchMoodRecommendations = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get<MoodRecommendation>(`${import.meta.env.VITE_API_URL}/dishes/mood-recommendations?mood=${selectedMood}`);
        setMoodRecommendation(response.data);
      } catch (err) {
        console.error('Error fetching mood recommendations:', err);
        setError('Failed to fetch mood recommendations.');
      } finally {
        setLoading(false);
      }
    };

    fetchMoodRecommendations();
  }, [selectedMood]);

  return (
    <section className="py-16 bg-gradient-to-br from-white via-background-cream to-background-gray">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Zap className="w-6 h-6 text-accent-yellow" />
            <span className="font-quicksand font-semibold text-primary-orange text-lg">AI-Powered Recommendations</span>
          </div>
          
          <h2 className="font-poppins font-bold text-3xl sm:text-4xl text-accent-charcoal mb-4">
            How Are You Feeling Today?
          </h2>
          <p className="font-inter text-gray-600 text-lg max-w-2xl mx-auto">
            Our AI analyzes your mood and suggests the perfect dishes to match your energy and emotional needs
          </p>
        </div>

        {/* Mood Selection */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {moodOptions.map((mood) => {
            const IconComponent = mood.icon;
            const isSelected = selectedMood === mood.id;
            
            return (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className={`flex items-center space-x-3 px-6 py-4 rounded-2xl font-inter font-medium transition-all duration-300 transform hover:scale-105 ${
                  isSelected
                    ? 'bg-gradient-teal-cyan text-white shadow-xl'
                    : `${mood.color} hover:shadow-lg`
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span>{mood.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mood-Based Recommendation */}
        {loading && <div className="text-center">Loading recommendations...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}
        {!loading && !error && moodRecommendation && (
          <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 mb-12 border border-white/50 shadow-xl">
            <div className="text-center mb-8">
              <h3 className="font-poppins font-bold text-2xl text-accent-charcoal mb-3">
                {moodRecommendation.title}
              </h3>
              <p className="font-inter text-gray-600 text-lg">
                {moodRecommendation.description}
              </p>
            </div>

            {/* Recommended Dishes */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {moodRecommendation.dishes.slice(0, 3).map((dish) => (
                <DishCard key={dish._id} dish={dish} />
              ))}
            </div>
          </div>
        )}

        {/* Personalization CTA */}
        <div className="bg-gradient-teal-cyan rounded-2xl p-8 text-center text-white">
          <h3 className="font-poppins font-bold text-2xl mb-3">
            Get Personalized Daily Recommendations
          </h3>
          <p className="font-inter text-lg mb-6 opacity-90">
            Track your mood, energy levels, and health goals for AI-powered meal suggestions that evolve with you
          </p>
          <Link to="/profile" className="bg-white text-primary-orange px-8 py-3 rounded-full font-inter font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center">
            Set Up My Profile
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MoodRecommendations;