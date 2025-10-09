import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Instagram, Twitter, Facebook, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const footerSections = [
    {
      title: 'FeastHub',
      links: [
        { name: 'About Us', path: '/about-us' },
        { name: 'How it Works', path: '/how-it-works' },
        { name: 'Health Goals', path: '/health-goals' },
        { name: 'Sustainability', path: '/sustainability' },
        { name: 'Blog', path: '/blog' }
      ]
    },
    {
      title: 'For Customers',
      links: [
        { name: 'Browse Restaurants', path: '/restaurants' },
        { name: 'Nutrition Guide', path: '/nutrition-guide' },
        { name: 'Meal Planning', path: '/meal-planning' },
        { name: 'Customer Support', path: '/customer-support' },
        { name: 'Mobile App', path: '/mobile-app' }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', path: '/help-center' },
        { name: 'Food Safety', path: '/food-safety' },
        { name: 'Privacy Policy', path: '/privacy-policy' },
        { name: 'Terms of Service', path: '/terms-of-service' },
        { name: 'Contact Us', path: '/contact-us' }
      ]
    }
  ];

  const socialLinks = [
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Facebook, href: '#', label: 'Facebook' }
  ];

  return (
    <footer className="bg-accent-charcoal text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Section */}
        <div className="grid lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-teal-cyan rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <span className="font-poppins font-bold text-2xl">FeastHub</span>
            </div>
            
            <p className="font-inter text-gray-300 mb-6 max-w-md">
              Revolutionizing food delivery with health-conscious choices, sustainable practices, 
              and personalized nutrition that fits your lifestyle.
            </p>

            <div className="flex items-center space-x-2 text-primary-green mb-2">
              <Leaf className="w-4 h-4" />
              <span className="font-inter text-sm">Certified Sustainable & Healthy</span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="w-4 h-4 text-primary-orange" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="w-4 h-4 text-primary-orange" />
                <span>hello@feasthub.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <MapPin className="w-4 h-4 text-primary-orange" />
                <span>Koramangala, Bangalore</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-poppins font-semibold text-lg mb-4 text-primary-orange">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      to={link.path} 
                      className="font-inter text-gray-300 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-700">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <p className="font-inter text-gray-300 text-sm">
              © 2024 FeastHub. All rights reserved.
            </p>
            <span className="text-gray-600">•</span>
            <p className="font-inter text-gray-300 text-sm">
              Made with <span className="text-red-500">❤️</span> for healthy living
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            <span className="font-inter text-gray-300 text-sm">Follow us:</span>
            {socialLinks.map((social, index) => {
              const IconComponent = social.icon;
              return (
                <a 
                  key={index}
                  href={social.href}
                  className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-primary-orange transition-colors"
                  aria-label={social.label}
                >
                  <IconComponent className="w-4 h-4" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;