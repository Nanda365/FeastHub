import React from 'react';
import { Link } from 'react-router-dom';

const TableBookingPromo = () => {
  return (
    <div className="bg-gray-100 py-16">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Book a Table at Your Favorite Restaurant</h2>
        <p className="text-gray-600 mb-8">
          Enjoy a seamless dining experience by booking your table in advance.
        </p>
        <Link
          to="/table-booking"
          className="bg-primary-orange text-white px-8 py-3 rounded-full font-semibold hover:bg-opacity-90 transition-colors"
        >
          Book a Table
        </Link>
      </div>
    </div>
  );
};

export default TableBookingPromo;