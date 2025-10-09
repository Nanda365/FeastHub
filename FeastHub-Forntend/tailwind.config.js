/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'quicksand': ['Quicksand', 'sans-serif'],
      },
      colors: {
        primary: {
          orange: '#00CCBC',
          green: '#43A047',
        },
        background: {
          cream: '#FFF8F1',
          gray: '#F5F5F5',
        },
        accent: {
          yellow: '#FFC107',
          teal: '#00897B',
          charcoal: '#1A1A1A',
        }
      },
      backgroundImage: {
        'gradient-teal-cyan': 'linear-gradient(135deg, #00CCBC 0%, #00897B 100%)',
        'gradient-orange-pink': 'linear-gradient(135deg, #FF7043 0%, #FF6B9D 100%)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
};