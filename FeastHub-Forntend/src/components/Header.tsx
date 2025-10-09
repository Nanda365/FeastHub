import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, MapPin, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-teal-cyan rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <span className="font-poppins font-bold text-xl text-accent-charcoal">FeastHub</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for healthy dishes, restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-100 rounded-full focus:border-primary-orange focus:outline-none transition-colors font-inter"
              />
            </div>
          </div>

          {/* Right Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                {user.role === 'restaurant' && (
                  <>
                    <Link to="/restaurant/dashboard" className={`flex items-center space-x-1 ${isActive('/restaurant/dashboard') ? 'text-primary-orange' : 'text-gray-600'} hover:text-primary-orange transition-colors`}>
                      <span className="font-inter text-sm">Restaurant Dashboard</span>
                    </Link>
                    <Link to="/menu" className={`flex items-center space-x-1 ${isActive('/menu') ? 'text-primary-orange' : 'text-gray-600'} hover:text-primary-orange transition-colors`}>
                      <span className="font-inter text-sm">Menu</span>
                    </Link>
                    <Link to="/restaurants" className={`flex items-center space-x-1 ${isActive('/restaurants') ? 'text-primary-orange' : 'text-gray-600'} hover:text-primary-orange transition-colors`}>
                      <span className="font-inter text-sm">Restaurants</span>
                    </Link>
                  </>
                )}

                {user.role === 'delivery' && (
                  <Link to="/delivery/dashboard" className={`flex items-center space-x-1 ${isActive('/delivery/dashboard') ? 'text-primary-orange' : 'text-gray-600'} hover:text-primary-orange transition-colors`}>
                    <span className="font-inter text-sm">Delivery Dashboard</span>
                  </Link>
                )}

                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" className={`flex items-center space-x-1 ${isActive('/admin/dashboard') ? 'text-primary-orange' : 'text-gray-600'} hover:text-primary-orange transition-colors`}>
                    <span className="font-inter text-sm">Admin Dashboard</span>
                  </Link>
                )}

                {user.role === 'customer' && (
                  <>
                    {/* Order Dropdown */}
                    <div className="relative group">
                      <button className={`flex items-center space-x-1 ${isActive('/menu') || isActive('/restaurants') ? 'text-primary-orange' : 'text-gray-600'} hover:text-primary-orange transition-colors focus:outline-none`}>
                        <span className="font-inter text-sm">Order</span>
                        <svg className="w-4 h-4 ml-1 transform group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </button>
                      <div className="absolute left-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                                                  <Link to="/menu" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 font-inter text-sm">
                                                    Menu
                                                  </Link>
                                                  <Link to="/restaurants" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 font-inter text-sm">
                                                    Restaurants
                                                  </Link>                      </div>
                    </div>

                    {/* Bookings Dropdown */}
                    <div className="relative group">
                      <button className={`flex items-center space-x-1 ${isActive('/reservations') || isActive('/book-table') ? 'text-primary-orange' : 'text-gray-600'} hover:text-primary-orange transition-colors focus:outline-none`}>
                        <span className="font-inter text-sm">Bookings</span>
                        <svg className="w-4 h-4 ml-1 transform group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </button>
                      <div className="absolute left-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                                                  <Link to="/reservations" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 font-inter text-sm">
                                                    Your Reservations
                                                  </Link>
                                                  <Link to="/book-table" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 font-inter text-sm">
                                                    Book a Table
                                                  </Link>                      </div>
                    </div>

                    <Link to="/food-donate" className={`flex items-center space-x-1 ${isActive('/food-donate') ? 'text-primary-orange' : 'text-gray-600'} hover:text-primary-orange transition-colors`}>
                      <span className="font-inter text-sm">Food Donate</span>
                    </Link>
                    <Link to="/favorites" className={`flex items-center space-x-1 ${isActive('/favorites') ? 'text-primary-orange' : 'text-gray-600'} hover:text-primary-orange transition-colors`}>
                      <Heart className="w-5 h-5" />
                      <span className="font-inter text-sm">Favorites</span>
                    </Link>
                    <Link to="/cart" className={`flex items-center space-x-1 ${isActive('/cart') ? 'text-primary-orange' : 'text-gray-600'} hover:text-primary-orange transition-colors`}>
                      <ShoppingCart className="w-5 h-5" />
                      <span className="font-inter text-sm">Cart</span>
                      {getTotalItems() > 0 && (
                        <span className="bg-primary-orange text-white text-xs rounded-full px-2 py-1 ml-1">
                          {getTotalItems()}
                        </span>
                      )}
                    </Link>
                  </>
                )}

                <div className="relative group">
                  <Link to="/profile" className="flex items-center space-x-2 bg-gradient-teal-cyan text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity font-inter font-medium">
                    <User className="w-4 h-4" />
                    <span>{user.name}</span>
                  </Link>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-inter"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <Link to="/login" className="flex items-center space-x-2 bg-gradient-teal-cyan text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity font-inter font-medium">
                <User className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-600 hover:text-primary-orange"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            <div className="space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search dishes..."
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-100 rounded-full focus:border-primary-orange focus:outline-none"
                />
              </div>
              
              {user && (
                <div className="flex items-center justify-between">
                  {user.role === 'restaurant' && (
                    <>
                      <Link to="/restaurant/dashboard" className={`flex items-center space-x-1 ${isActive('/restaurant/dashboard') ? 'text-primary-orange' : 'text-gray-600'}`}>
                        <span>Restaurant Dashboard</span>
                      </Link>
                      <Link to="/menu" className={`flex items-center space-x-1 ${isActive('/menu') ? 'text-primary-orange' : 'text-gray-600'}`}>
                        <span>Menu</span>
                      </Link>
                      <Link to="/restaurants" className={`flex items-center space-x-1 ${isActive('/restaurants') ? 'text-primary-orange' : 'text-gray-600'}`}>
                        <span>Restaurants</span>
                      </Link>
                    </>
                  )}
                  {user.role === 'delivery' && (
                    <Link to="/delivery/dashboard" className={`flex items-center space-x-1 ${isActive('/delivery/dashboard') ? 'text-primary-orange' : 'text-gray-600'}`}>
                      <span>Delivery Dashboard</span>
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin/dashboard" className={`flex items-center space-x-1 ${isActive('/admin/dashboard') ? 'text-primary-orange' : 'text-gray-600'}`}>
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                  {user.role === 'customer' && (
                    <div className="space-y-2">
                      {/* Order Links (Mobile) */}
                      <div className="space-y-1">
                                              <Link to="/menu" className={`block px-4 py-2 text-gray-700 hover:bg-gray-100 font-inter text-sm ${isActive('/menu') ? 'text-primary-orange bg-gray-100' : ''}`}>
                                                Menu
                                              </Link>
                                              <Link to="/restaurants" className={`block px-4 py-2 text-gray-700 hover:bg-gray-100 font-inter text-sm ${isActive('/restaurants') ? 'text-primary-orange bg-gray-100' : ''}`}>
                                                Restaurants
                                              </Link>                      </div>

                      {/* Bookings Links (Mobile) */}
                      <div className="space-y-1">
                                              <Link to="/reservations" className={`block px-4 py-2 text-gray-700 hover:bg-gray-100 font-inter text-sm ${isActive('/reservations') ? 'text-primary-orange bg-gray-100' : ''}`}>
                                                Your Reservations
                                              </Link>
                                              <Link to="/book-table" className={`block px-4 py-2 text-gray-700 hover:bg-gray-100 font-inter text-sm ${isActive('/book-table') ? 'text-primary-orange bg-gray-100' : ''}`}>
                                                Book a Table
                                              </Link>                      </div>

                      <Link to="/food-donate" className={`flex items-center space-x-1 w-full px-4 py-2 rounded-md ${isActive('/food-donate') ? 'text-primary-orange bg-gray-100' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <span>Food Donate</span>
                      </Link>
                      <Link to="/favorites" className={`flex items-center space-x-1 w-full px-4 py-2 rounded-md ${isActive('/favorites') ? 'text-primary-orange bg-gray-100' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <Heart className="w-5 h-5" />
                        <span>Favorites</span>
                      </Link>
                      <Link to="/cart" className={`flex items-center space-x-1 w-full px-4 py-2 rounded-md ${isActive('/cart') ? 'text-primary-orange bg-gray-100' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <ShoppingCart className="w-5 h-5" />
                        <span>Cart ({getTotalItems()})</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {user ? (
                <button 
                  onClick={handleLogout}
                  className="w-full bg-gradient-teal-cyan text-white py-2 rounded-full font-inter font-medium"
                >
                  Logout ({user.name})
                </button>
              ) : (
                <Link to="/login" className="block w-full bg-gradient-teal-cyan text-white py-2 rounded-full font-inter font-medium text-center">
                  Login / Sign Up
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;