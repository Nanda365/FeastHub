import React from 'react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-background-gray flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
        <h1 className="font-poppins font-bold text-6xl text-primary-orange mb-4">404</h1>
        <h2 className="font-poppins font-semibold text-3xl text-accent-charcoal mb-4">Page Not Found</h2>
        <p className="font-inter text-gray-600 mb-6">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <a 
          href="/" 
          className="bg-gradient-teal-cyan text-white px-6 py-3 rounded-xl font-inter font-semibold hover:shadow-lg transition-all duration-300"
        >
          Go to Homepage
        </a>
      </div>
    </div>
  );
};

export default NotFoundPage;